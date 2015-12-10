var mcapi = require('mailchimp-api');

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

	var addUserToHolibirthersList = function (db, user, cb) {
		return db.mailchimpList.findOneOrFail({
			mailchimpListType: app.schema.mailchimpList.fields.mailchimpListType.options.holibirthers,
		}, function (holibirthersList) {
			return db.profile.findOneOrFail({
				user: user,
			}, function (profile) {
				return mc.lists.batchSubscribe({
					id: holibirthersList.mailchimpListId,
					batch: [{
						email: {
							email: profile.email,
						},
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
					batch: profiles.map(function (p) {
						return {
							email: {
								email: p.email,
							},
						};
					}),
					double_optin: false,
					update_existing: true,
				}, function (r) {
					if (r.error_count > 0) {
						console.log(r);
					}
					console.log(r);
					cb();
				});
			});
		});
	};

	var addProfileToHolibirthersList = function (profile, next) {
		var db = dbWith(next);
		if (profile.holibirther || (profile.$set && profile.$set.holibirther)) {
			return addUserToHolibirthersList(db, profile.user || (profile.$set && profile.$set.user), next);
		}
		return next();
	};
	var addProfileToFriendsList = function (profile, next) {
		var db = dbWith(next);
		if (profile.knowAHolibirther || (profile.$set && profile.$set.knowAHolibirther)) {
			return addUsersToFriendsList(db, [profile.user || (profile.$set && profile.$set.user)], next);
		}
		return next();
	};
	// app.schema.profile.postInsertMiddleware.use(function (profile, options, next) {
	// 	return addProfileToHolibirthersList(profile, next);
	// });
	// app.schema.profile.postInsertMiddleware.use(function (profile, options, next) {
	// 	return addProfileToFriendsList(profile, next);
	// });
	// app.schema.profile.postUpdateMiddleware.use(function (selector, profile, options, next) {
	// 	return addProfileToHolibirthersList(profile, next);
	// });
	// app.schema.profile.postUpdateMiddleware.use(function (selector, profile, options, next) {
	// 	return addProfileToFriendsList(profile, next);
	// });
	
	// when someone claims a holibirthday, add them to the
	// Holibirthers list.  Also, add friends of them to the Friends of
	// Holibirthers list.
	app.schema.holibirthday.insertMiddleware.use(function (holibirthday, options, next) {
		var db = dbWith(next);
		addUserToHolibirthersList(db, holibirthday.user, function () {
			db.contactOtherUser.find({
				otherUser: holibirthday.user,
			}, function (cous1) {
				db.contactOtherUser.find({
					user: holibirthday.user,
				}, function (cous2) {
					addUsersToFriendsList(db, cous1.map(function (cou) {
						return cou.user;
					}).concat(cous2.map(function (cou) {
						return cou.otherUser;
					})), function () {
						return next();
					});
				});
			});
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
						}
						if (h2 && p2.holibirther) {
							users.push(cou.otherUser);
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
