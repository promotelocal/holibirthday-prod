define([
	'bar',
	'colors',
	'doTune',
	'footer',
	'header',
	'pageRoutes',
	'separatorSize',
], function (bar, colors, doTune, footer, header, pageRoutes, separatorSize) {
	doTune();
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
