var https = require('https');
var FormData = require('form-data');

module.exports = function (config) {
	var sendgrid = require('sendgrid')(config.sendgrid.username, config.sendgrid.password);

	var makeSendgridRequest = function (options, cb) {
		var payload = {
			// copy options, changing some names
			to: options.to,
			from: options.from,
			toname: options.toName,
			subject: options.subject,
			text: options.text,
			html: options.html,
		};
		
		sendgrid.send(payload, cb);
	};
	
	return {
		sendEmail: function (options, cb) {
			return makeSendgridRequest(options, cb);
		},
	};
};
