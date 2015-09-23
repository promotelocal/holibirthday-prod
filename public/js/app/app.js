define([
	'bar',
	'colors',
	'headerP',
	'pageRoutes',
	'separatorSize',
], function (bar, colors, headerP, pageRoutes, separatorSize) {
	var page = stack({}, [
		fixedHeaderBody({}, headerP, stack({}, [
			bar.horizontal(separatorSize),
			route(pageRoutes),
		])),
		extendToWindowBottom(bar.horizontal(separatorSize)),
	]).all([
		withBackgroundColor(colors.pageBackgroundColor),
	]);
	return page;
});
