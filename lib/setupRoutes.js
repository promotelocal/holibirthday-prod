var async = require('async');

module.exports = function (app, config, dbWith) {
	app.set('view engine', 'jade');

	var config = {
		header: {
			fontSize: 20,
		},
	};

	var constant = function (name, value) {
		return function (db, cb) {
			return cb(name, value);
		};
	};
	
	// var pages = [{
	// 	route: '/',
	// 	page: 'index',
	// 	models: [
	// 		constant('title', 'aoeu'),
	// 		constant('message', 'htns'),
	// 	],
	// }];
	var pages = [];

	pages.map(function (page) {
		app.get(page.route, function (req, res, next) {
			var db = dbWith(next);
			var model = {};
			async.map(page.models, function (pageModel, cb) {
				pageModel(db, function (key, value) {
					model[key] = value;
					cb();
				});
			}, function () {
				return res.render(page.page, model);
			});
		});
	});
};
