var async = require('async');
var mcapi = require('mailchimp-api');
var moment = require('moment');

module.exports = function (app, config, dbWith) {
	var mc = new mcapi.Mailchimp(config.mailchimp.key);

	var ensureAdmin = function (req, res, next) {
		var db = dbWith(next);
		var user = req.user;
		if (!user) {
			return next('not logged in');
		}
		return db.admin.findOne({
			user: user._id,
		}, function (admin) {
			if (!admin) {
				return next('not an admin');
			}
			return next();
		});
	};

	app.get('/mailchimp/lists', [
		ensureAdmin,
		function (req, res, next) {
			mc.lists.list({}, function (listsData) {
				return res.send(listsData.data);
			});
		},
	]);

	app.get('/mailchimp/templates', [
		ensureAdmin,
		function (req, res, next) {
			mc.templates.list({
				filters: {
					include_drag_and_drop: true,
				},
			}, function (templatesData) {
				return res.send(templatesData.user);
			});
		},
	]);

	app.get('/mailchimp/subscribeAll', [
		ensureAdmin,
		function (req, res, next) {
			var db = dbWith(next);
			db.profile.find({}, function (profiles) {
				var users = profiles.map(function (p) {
					return p.user;
				});
				return async.map(users, function (user, next) {
					addUserToAllList(dbWith(next), user, next);
				}, function () {
					setTimeout(next);
				});
			});
		},
		function (req, res) {
			return res.send();
		},
	]);
	app.get('/mailchimp/subscribeHolibirthers', [
		ensureAdmin,
		function (req, res, next) {
			var db = dbWith(next);
			db.profile.find({
				holibirther: true,
			}, function (profiles) {
				var users = profiles.map(function (p) {
					return p.user;
				});
				return async.map(users, function (user, next) {
					addUserToHolibirthersList(dbWith(next), user, next);
				}, function () {
					setTimeout(next);
				});
			});
		},
		function (req, res) {
			return res.send();
		},
	]);
	app.get('/mailchimp/subscribeFriends', [
		ensureAdmin,
		function (req, res, next) {
			var db = dbWith(next);
			db.contactOtherUser.find({}, function (cous) {
				var alterProfile = function (p1, p2, next) {
					if (!p1.holibirther || p2.knowAHolibirther) {
						return next();
					}
					return db.profile.update({
						user: p2.user,
					}, {
						$set: {
							knowAHolibirther: true,
						}
					}, {}, next);
				};
				return async.map(cous, function (cou, next) {
					return db.profile.findOne({
						user: cou.user,
					}, function (profile) {
						if (!profile) {
							return next();
						}
						return db.profile.findOne({
							user: cou.otherUser,
						}, function (otherProfile) {
							if (!otherProfile) {
								return next();
							}
							alterProfile(profile, otherProfile, function () {
								alterProfile(otherProfile, profile, function () {
									setTimeout(function () {
										next();
									});
								});
							});
						});
					});
				}, next);
			});
		},
		function (req, res, next) {
			var db = dbWith(next);
			db.profile.find({
				knowAHolibirther: true,
			}, function (profiles) {
				var users = profiles.map(function (p) {
					return p.user;
				});
				addUsersToFriendsList(db, users, next);
			});
		},
		function (req, res) {
			return res.send();
		},
	]);

	var addUserToHolibirthersList = function (db, user, cb) {
		return db.mailchimpList.findOneOrFail({
			mailchimpListType: app.schema.mailchimpList.fields.mailchimpListType.options.holibirthers,
		}, function (holibirthersList) {
			return db.profile.findOneOrFail({
				user: user,
			}, function (profile) {
				return db.holibirthday.findOneOrFail({
					user: user,
				}, function (holibirthday) {
					var merge_vars = {};
					merge_vars[holibirthersList.firstNameMergeVar] = profile.firstName;
					merge_vars[holibirthersList.lastNameMergeVar] = profile.lastName;
					merge_vars[holibirthersList.birthdayMergeVar] = moment(profile.birthday).format('MM/DD');
					merge_vars[holibirthersList.holibirthdayMergeVar] = moment(holibirthday.date).format('MM/DD');
					if (!profile.email) {
						return cb();
					}
					return mc.lists.batchSubscribe({
						id: holibirthersList.mailchimpListId,
						batch: [{
							email: {
								email: profile.email,
							},
							merge_vars: merge_vars,
						}],
						double_optin: false,
						update_existing: true,
					}, function (r) {
						if (r.error_count > 0) {
							console.log(r);
						}
						cb();
					});
				});
			});
		});
	};

	var addUserToAllList = function (db, user, cb) {
		return db.mailchimpList.findOneOrFail({
			mailchimpListType: app.schema.mailchimpList.fields.mailchimpListType.options.all,
		}, function (allList) {
			return db.profile.findOneOrFail({
				user: user,
			}, function (profile) {
				var merge_vars = {};
				merge_vars[allList.firstNameMergeVar] = profile.firstName;
				merge_vars[allList.lastNameMergeVar] = profile.lastName;
				merge_vars[allList.birthdayMergeVar] = moment(profile.birthday).format('MM/DD');
				if (!profile.email) {
					return cb();
				}
				return mc.lists.batchSubscribe({
					id: allList.mailchimpListId,
					batch: [{
						email: {
							email: profile.email,
						},
						merge_vars: merge_vars,
					}],
					double_optin: false,
					update_existing: true,
				}, function (r) {
					if (r.error_count > 0) {
						console.log(r);
					}
					cb();
				});
			});
		});
	};

	var addUsersToFriendsList = function (db, users, cb) {
		return db.mailchimpList.findOneOrFail({
			mailchimpListType: app.schema.mailchimpList.fields.mailchimpListType.options.friendsOfHolibirthers,
		}, function (friendsList) {
			return db.profile.find({
				user: {
					$in: users,
				},
			}, function (profiles) {
				return mc.lists.batchSubscribe({
					id: friendsList.mailchimpListId,
					batch: profiles.filter(function (p) {
						return p.email;
					}).map(function (p) {
						var merge_vars = {};
						merge_vars[friendsList.firstNameMergeVar] = p.firstName;
						merge_vars[friendsList.lastNameMergeVar] = p.lastName;
						merge_vars[friendsList.birthdayMergeVar] = moment(p.birthday).format('MM/DD');
						return {
							email: {
								email: p.email,
							},
							merge_vars: merge_vars,
						};
					}),
					double_optin: false,
					update_existing: true,
				}, function (r) {
					if (r.error_count > 0) {
						console.log(r);
					}
					cb();
				});
			});
		});
	};

	var addProfileToHolibirthersList = function (selector, update, next) {
		var db = dbWith(next);
		db.profile.findOneOrFail(selector, function (profile) {
			if (profile.holibirther || (update && profile.holibirther)) {
				return addUserToHolibirthersList(db, profile.user, next);
			}
			return next();
		});
	};
	var addProfileToFriendsList = function (selector, update, next) {
		var db = dbWith(next);
		db.profile.findOneOrFail(selector, function (profile) {
			if (profile.knowAHolibirther || (update && update.knowAHolibirther)) {
				return addUsersToFriendsList(db, [profile.user], next);
			}
			return next();
		});
	};
	app.schema.profile.postInsertMiddleware.use(function (profile, options, next) {
		next();
		return addProfileToHolibirthersList(profile, null, function () {});
	});
	app.schema.profile.postInsertMiddleware.use(function (profile, options, next) {
		next();
		return addProfileToFriendsList(profile, null, function () {});
	});
	app.schema.profile.postUpdateMiddleware.use(function (selector, profile, options, next) {
		next();
		return addProfileToHolibirthersList(selector, profile, function () {});
	});
	app.schema.profile.postUpdateMiddleware.use(function (selector, profile, options, next) {
		next();
		return addProfileToFriendsList(selector, profile, function () {});
	});
	app.schema.profile.postInsertMiddleware.use(function (profile, options, next) {
		next();
		return addUserToAllList(dbWith(function () {}), profile.user, function () {});
	});
	app.schema.profile.postUpdateMiddleware.use(function (selector, profile, options, next) {
		next();
		return addUserToAllList(dbWith(function () {}), profile.user, function () {});
	});

	var claimHolibirthday = function (holibirthday, options, next) {
		var db = dbWith(next);
		addUserToHolibirthersList(db, holibirthday.user, function () {
			db.contactOtherUser.find({
				otherUser: holibirthday.user,
			}, function (cous1) {
				db.contactOtherUser.find({
					user: holibirthday.user,
				}, function (cous2) {
					var users = cous1.map(function (cou) {
						return cou.user;
					}).concat(cous2.map(function (cou) {
						return cou.otherUser;
					}));
					users.map(function (u) {
						// fork an update for each contact, probably
						// won't be too many *crosses fingers*
						db.profile.update({
							user: u,
						}, {
							$set: {
								knowAHolibirther: true,
							},
						}, {}, function () {});
					});
					addUsersToFriendsList(db, users, function () {
						return next();
					});
				});
			});
		});
	};

	// when someone claims a holibirthday, add them to the
	// Holibirthers list.  Also, add friends of them to the Friends of
	// Holibirthers list.
	app.schema.holibirthday.postInsertMiddleware.use(claimHolibirthday);
	app.schema.holibirthday.postUpdateMiddleware.use(function (selector, update, options, next) {
		var db = dbWith(next);
		db.holibirthday.findOneOrFail(selector, function (holibirthday) {
			claimHolibirthday(holibirthday, options, next);
		});
	});

	app.schema.contactOtherUser.insertMiddleware.use(function (cou, options, next) {
		var db = dbWith(next);
		db.holibirthday.findOne({
			user: cou.otherUser,
		}, function (h1) {
			db.profile.findOneOrFail({
				user: cou.otherUser,
			}, function (p1) {
				db.holibirthday.findOne({
					user: cou.user,
				}, function (h2) {
					db.profile.findOneOrFail({
						user: cou.user,
					}, function (p2) {
						var users = [];
						if (h1 && p1.holibirther) {
							users.push(cou.user);
							db.profile.update({
								user: cou.user,
							}, {
								$set: {
									knowAHolibirther: true,
								},
							}, {}, function () {});
						}
						if (h2 && p2.holibirther) {
							users.push(cou.otherUser);
							db.profile.update({
								user: cou.otherUser,
							}, {
								$set: {
									knowAHolibirther: true,
								},
							}, {}, function () {});
						}
						return addUsersToFriendsList(db, users, function () {
							return next();
						});
					});
				});
			});
		});
	});
};
