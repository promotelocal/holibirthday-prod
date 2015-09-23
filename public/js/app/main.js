requirejs.config({
	baseUrl: 'js/app',
});

require(['app'], function (app) {
	$(function () {
		waitForWebfonts([
			'BebasNeue',
			'CelebrationTime',
			'FontAwesome',
			'Open Sans',
			'Raleway Thin',
		], function () {
			rootComponent(app);
		});
	});
});
