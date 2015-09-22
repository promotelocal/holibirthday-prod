var Err = require('../public/Err');

module.exports = function (app, config, dbWith) {
	app.get('/facebook/apikey', [
		function (req, res, next) {
			return res.send(config.facebook.apiKey);
		}]);
};
