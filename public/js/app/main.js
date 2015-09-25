requirejs.config({
	baseUrl: 'js/app',
});

$(function () {
	waitForWebfonts([
		'BebasNeue',
		'CelebrationTime',
		'FontAwesome',
		'Open Sans',
		'Raleway Thin',
	], function () {
		require(['app'], function (app) {
			rootComponent(app);
		});
	});
});
