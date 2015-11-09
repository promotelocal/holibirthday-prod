var mcapi = require('mailchimp-api');

module.exports = function (app, config, dbWith) {
	var mc = new mcapi.Mailchimp(config.mailchimp.key);

	app.get('/testMailchimp', [
		function (req, res, next) {
			mc.lists.list({}, function (data) {
				debugger;
			});
		},
	]);
};
