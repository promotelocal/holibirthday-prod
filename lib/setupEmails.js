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
		var text = [
			'Dear Customer,',
			'',
			'',
			'Thank you for placing an order with Holibirthday.',
			'',
			'For your records, your order number is ' + stripePayment.orderBatch + '.',
			'',
			'',
			'The Holibirthday Team',
		];
		return email.sendEmail({
			to: stripePayment.email,
			from: 'webmaster@holibirthday.com',
			fromName: 'Holibirthday Orders',
			subject: 'Your Holibirthday Order',
			html: text.reduce(function (email, line) {
				return email + '<br>' + line;
			}, ''),
			text: text.reduce(function (email, line) {
				return email + '\n' + line;
			}, ''),
		}, next);
	});
};
