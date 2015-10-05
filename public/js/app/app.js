define([
	'bar',
	'colors',
	'header',
	'pageRoutes',
	'separatorSize',
], function (bar, colors, header, pageRoutes, separatorSize) {
	var page = stack({}, [
		fixedHeaderBody({}, header, stack({}, [
			bar.horizontal(separatorSize),
			route(pageRoutes),
			extendToWindowBottom(bar.horizontal(separatorSize)),
		])),
	]).all([
		withBackgroundColor(colors.pageBackgroundColor),
	]);
	return page;
});
