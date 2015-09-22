define([
	'bar',
	'colors',
	'headerP',
	'pageRoutes',
	'separatorSize',
], function (bar, colors, headerP, pageRoutes, separatorSize) {

	var page = stack({}, [
		fixedHeaderBody({}, headerP, route(pageRoutes)),
		extendToWindowBottom(bar.horizontal(separatorSize)),
	]).all([
		withBackgroundColor(colors.pageBackgroundColor),
	]);
	return page;
});
