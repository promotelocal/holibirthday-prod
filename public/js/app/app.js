define([
	'bar',
	'colors',
	'footer',
	'header',
	'pageRoutes',
	'separatorSize',
], function (bar, colors, footer, header, pageRoutes, separatorSize) {
	var page = extendToWindowBottom(alignTBM({
		top: fixedHeaderBody({}, header, stack({}, [
			bar.horizontal(separatorSize),
			route(pageRoutes),
			bar.horizontal(separatorSize),
		])),
		bottom: footer,
	})).all([
		withBackgroundColor(colors.pageBackgroundColor),
	]);
	return page;
});
