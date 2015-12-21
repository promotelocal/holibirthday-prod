var async = require('async');
var mcapi = require('mailchimp-api');
var schedule = require('node-schedule');

var Err = require('../public/Err');

module.exports = function (app, config, dbWith) {
	var email = require('./email')(config);
	var mc = new mcapi.Mailchimp(config.mailchimp.key);
	
	app.schema.contactUsMessage.insertMiddleware.use(function (doc, options, next) {
		return email.sendEmail({
			to: config.adminEmail,
			toName: 'Holibirthday Owner',
			from: doc.email,
			subject: 'Contact Us message from ' + doc.name,
			html: doc.message,
			text: doc.message,
		}, next);
	});
	
	app.schema.stripePayment.postInsertMiddleware.use(function (stripePayment, options, next) {
		var db = dbWith(next);

		return db.siteCopyItem.find({}, function (siteCopyItems) {
			var findSiteCopyItem = function (name) {
				return siteCopyItems.filter(function (siteCopyItem) {
					return siteCopyItem.uniqueName === name;
				})[0].value;
			};

			var text = findSiteCopyItem('Order Confirmation Email: Text ( {{orderNumber}} includes order number)');
			while (text.indexOf('{{orderNumber}}') !== -1) {
				text = text.replace('{{orderNumber}}', stripePayment.orderBatch);
			}
			
			return email.sendEmail({
				to: stripePayment.email,
				from: findSiteCopyItem('Order Confirmation Email: From'),
				fromName: findSiteCopyItem('Order Confirmation Email: From Name'),
				subject: findSiteCopyItem('Order Confirmation Email: Subject'),
				html: text.split('\n').join('<br>'),
				text: text,
			}, next);
		});
	});
	
	app.schema.stripeDonation.postInsertMiddleware.use(function (stripeDonation, options, next) {
		var db = dbWith(next);
		
		return db.siteCopyItem.find({}, function (siteCopyItems) {
			var findSiteCopyItem = function (name) {
				return siteCopyItems.filter(function (siteCopyItem) {
					return siteCopyItem.uniqueName === name;
				})[0].value;
			};
			
			var text = findSiteCopyItem('Donate Confirmation Email: Text ( {{donationNumber}} includes donation number)');
			while (text.indexOf('{{donationNumber}}') !== -1) {
				text = text.replace('{{donationNumber}}', stripeDonation._id.toString());
			}
			
			return email.sendEmail({
				to: stripeDonation.email,
				from: findSiteCopyItem('Donate Confirmation Email: From'),
				fromName: findSiteCopyItem('Donate Confirmation Email: From Name'),
				subject: findSiteCopyItem('Donate Confirmation Email: Subject'),
				html: text.split('\n').join('<br>'),
				text: text,
			}, next);
		});
	});
	
	app.schema.sendEmail.postInsertMiddleware.use(function (sendEmail, options, next) {
		var db = dbWith(next);
		
		return db.siteCopyItem.find({}, function (siteCopyItems) {
			return db.profile.find({
				receiveMarketingEmails: true,
			}, function (profiles) {
				return db.holibirthday.find({}, function (holibirthdays) {
					var tos = [];
					var birthdayBetween = function (date, sendEmail) {
						date = new Date(date);
						
						var gtDate = new Date(date);
						gtDate.setMonth(sendEmail.monthGT - 1);
						gtDate.setDate(sendEmail.dayGT);
						
						var ltDate = new Date(date);
						ltDate.setMonth(sendEmail.monthLT - 1);
						ltDate.setDate(sendEmail.dayLT);

						var dateTime = date.getTime();
						var gtTime = gtDate.getTime();
						var ltTime = ltDate.getTime();
						
						var range = ltTime - gtTime;
						
						return range === 0 ?
							(ltTime - dateTime) === 0 && (dateTime - gtTime) === 0 :
							range * (ltTime - dateTime) * (dateTime - gtTime) >= 0;
					};
					
					switch (sendEmail.constraintSource) {
					case 'all':
						profiles.map(function (profile) {
							tos.push(profile.email);
						});
						break;
					case 'hasHolibirthday':
						profile.map(function (profile) {
							if (profile.holibirther) {
								tos.push(profile.email);
							}
						});
						break;
					case 'birthdayBetween':
						profiles.map(function (profile) {
							if (profile.birthday && birthdayBetween(profile.birthday, sendEmail)) {
								tos.push(profile.email);
							}
						});
						break;
					case 'holibirthdayBetween':
						holibirthdays.map(function (holibirthday) {
							if (birthdayBetween(holibirthday.date, sendEmail)) {
								var profile = profiles.filter(function (profile) {
									return profile.user.toString() === holibirthday.user.toString();
								})[0];
								if (profile && profile.holibirther) {
									tos.push(profile.email);
								}
							}
						});
						break;
					}
					tos.push(config.adminEmail);
					return async.map(tos, function (to, next) {
						return email.sendEmail({
							to: to,
							from: sendEmail.from,
							fromName: sendEmail.fromName,
							subject: sendEmail.subject,
							html: sendEmail.text.split('\n').join('<br>'),
							text: sendEmail.text,
						}, next);
					}, next);
				});
			});
		});
	});

	var sendHolibirthdayEmail = function (holibirthday, next) {
		var db = dbWith(next);


		db.profile.findOne({
			user: holibirthday.user,
		}, function (profile) {
			var lines = [
				profile.firstName + ',',
				'',
				'Congratulations on claiming a holibirthday!  You can view your certificate here: ',
				'',
				config.domain + '/#!user/' + profile.user + '/certificate',
			];
			return email.sendEmail({
				to: profile.email,
				from: 'webmaster@holibirthday.com',
				fromName: 'Holibirthday',
				subject: 'Your Holibirthday',
				html: lines.join('<br>'),
				text: lines.join('\n'),
			}, next);
		});
	};
	
	app.schema.holibirthday.insertMiddleware.use(function (holibirthday, options, next) {
		return sendHolibirthdayEmail(holibirthday, next);
	});
	
	app.schema.story.removeMiddleware.use(function (story, options, next) {
		next();
		next = function () {};
		var db = dbWith(next);
		db.mailchimpTemplate.findOneOrFail({
			event: app.schema.mailchimpTemplate.fields.event.options.storyDeleted,
		}, function (mailchimpTemplate) {
			mc.templates.info({
				template_id: mailchimpTemplate.mailchimpTemplateId,
			}, function (template) {
				db.profile.findOneOrFail({
					user: story.user,
				}, function (profile) {
					if (profile.receiveEmails) {
						return email.sendEmail({
							to: profile.email,
							toName: profile.firstName + ' ' + profile.lastName,
							from: config.adminEmail,
							fromName: 'Holibirthday',
							subject: 'Your Holibirthday Story was Deleted',
							html: template.source,
							text: template.source,
						}, next);
					}
					return next();
				});
			});
		});
	});
	
	app.schema.comment.removeMiddleware.use(function (comment, options, next) {
		next();
		next = function () {};
		var db = dbWith(next);
		db.mailchimpTemplate.findOneOrFail({
			event: app.schema.mailchimpTemplate.fields.event.options.commentDeleted,
		}, function (mailchimpTemplate) {
			mc.templates.info({
				template_id: mailchimpTemplate.mailchimpTemplateId,
			}, function (template) {
				db.profile.findOneOrFail({
					user: comment.user,
				}, function (profile) {
					if (profile.receiveEmails) {
						return email.sendEmail({
							to: profile.email,
							toName: profile.firstName + ' ' + profile.lastName,
							from: config.adminEmail,
							fromName: 'Holibirthday',
							subject: 'Your Holibirthday Comment was Deleted',
							html: template.source,
							text: template.source,
						}, next);
					}
					return next();
				});
			});
		});
	});


	var ticksPerYear = 1000 * 60 * 60 * 24 * 365;
	var timeUntilDate = function (date) {
		var now = new Date();
		date.setYear(now.getFullYear());
		var difference = (date.getTime() - now.getTime() + ticksPerYear) % ticksPerYear;
	};

	var ticksPerDay = function (days) {
		return 1000 * 60 * 60 * 24 * days;
	};

	var doHolibirhtdaysForDate = function (date, holibirtherEvent, friendsEvent) {
		var month = date.getMonth();
		var day = date.getDate();

		var errHandler = function (err) {
			console.log('error from a cron job:');
			console.log(err);
		};
		var db = dbWith(errHandler);
		var cb = Err.handleWith(errHandler);

		return db.holibirthday.find({
			month: month,
			day: day,
		}, function (holibirthdays) {
			
			var holibirtherUsers = holibirthdays.map(function (h) {
				return h.user;
			});
			var holibirtherUsersPattern = {
				$in: holibirtherUsers,
			};

			return db.siteCopyItem.find({
				
			});
			return db.profile.find({
				user: holibirtherUsersPattern,
			}, function (holibirtherProfiles) {
				return db.contactOtherUser.find({
					user: holibirtherUsersPattern,
				}, function (cous1) {
					return db.contactOtherUser.find({
						otherUser: holibirtherUsersPattern,
					}, function (cous2) {
						var friendUsers = cous1.map(function (cou) {
							return cou.otherUser;
						}).concat(cous2.map(function (cou) {
							return cou.user;
						}));
						return db.profile.find({
							user: {
								$in: friendUsers,
							},
						}, function (friendProfiles) {
							return db.mailchimpTemplate.findOneOrFail({
								event: holibirtherEvent,
							}, function (holibirtherMailchimpTemplate) {
								return db.mailchimpTemplate.findOneOrFail({
									event: friendsEvent,
								}, function (friendsMailchimpTemplate) {
									mc.templates.info({
										template_id: holibirtherMailchimpTemplate.mailchimpTemplateId,
									}, function (holibirtherTemplate) {
										mc.templates.info({
											template_id: friendsMailchimpTemplate.mailchimpTemplateId,
										}, function (friendsTemplate) {
											var emails = holibirtherProfiles.filter(function (p) {
												return p.receiveMarketingEmails;
											}).map(function (p) {
												return {
													to: p.email,
													toName: holibirtherMailchimpTemplate.toName,
													from: config.adminEmail,
													fromName: holibirtherMailchimpTemplate.fromName,
													subject: holibirtherMailchimpTemplate.subject,
													html: holibirtherTemplate.source,
													text: holibirtherTemplate.source,
												};
											}).concat(friendProfiles.filter(function (p) {
												return p.receiveMarketingEmails;
											}).map(function (p) {
												return {
													to: p.email,
													toName: friendsMailchimpTemplate.toName,
													from: config.adminEmail,
													fromName: friendsMailchimpTemplate.fromName,
													subject: friendsMailchimpTemplate.subject,
													html: friendsTemplate.source,
													text: friendsTemplate.source,
												};
											}));
											console.log(emails.length);
											async.map(emails, email.sendEmail, cb(function () {
												console.log('completed cron job');
											}));
										});
									});
								});
							});
						});
					});
				});
			});
		});
	};

	schedule.scheduleJob('10 50 18 * * *', function () {
		var threeWeeks = new Date();
		threeWeeks.setDate(21 + threeWeeks.getDate());
		doHolibirhtdaysForDate(threeWeeks,
							   app.schema.mailchimpTemplate.fields.event.options.holibirthdayInThreeWeeks,
							   app.schema.mailchimpTemplate.fields.event.options.friendsHolibirthdayInThreeWeeks);
		
		var oneWeek = new Date();
		oneWeek.setDate(7 + oneWeek.getDate());
		doHolibirhtdaysForDate(oneWeek,
							   app.schema.mailchimpTemplate.fields.event.options.holibirthdayInOneWeek,
							   app.schema.mailchimpTemplate.fields.event.options.friendsHolibirthdayInOneWeek);
		
		var tomorrow = new Date();
		tomorrow.setDate(1 + tomorrow.getDate());
		doHolibirhtdaysForDate(tomorrow,
							   app.schema.mailchimpTemplate.fields.event.options.holibirthdayTomorrow,
							   app.schema.mailchimpTemplate.fields.event.options.friendsHolibirthdayTomorrow);
	});
};
