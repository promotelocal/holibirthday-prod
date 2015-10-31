requirejs.config({
	baseUrl: 'js/app',
});

require(['app'], function (app) {
	rootComponent(app);
});
