var async = require('async');

module.exports = function (app, config, dbWith) {
	var email = require('./email')(config);

	
	app.schema.contactUsMessage.insertMiddleware.use(function (doc, options, next) {
		var db = dbWith(next);

		var sendEmail = function (fromName) {
			return email.sendEmail({
				to: config.adminEmail,
				toName: 'Holibirthday Owner',
				from: 'webmaster@holibirthday.com',
				subject: 'Contact Us message from ' + fromName,
				html: doc.message,
				text: doc.message,
			}, next);
		};

		if (doc.user) {
			return db.profile.findOne({
				user: doc.user
			}, function (profile) {
				var name = profile.firstName + ' ' + profile.lastName;
				sendEmail(name);
			});
		}
		else {
			sendEmail('a holibirthday user');
		}
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
};
