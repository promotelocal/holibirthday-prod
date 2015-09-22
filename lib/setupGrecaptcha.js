var Err = require('../public/Err');

module.exports = function (app, config, dbWith) {
	app.get('/grecaptcha/sitekey', [
		function (req, res, next) {
			return res.send(config.grecaptcha.sitekey);
		}]);
};
