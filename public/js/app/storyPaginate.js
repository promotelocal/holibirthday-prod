define([
	'bar',
	'colors',
	'fonts',
	'separatorSize',
], function (bar, colors, fonts, separatorSize) {
	var paginate = function (f) {
		return function (config, cs) {
			var pages = [];
			for (var i = 0; i < cs.length; i += config.perPage) {
				pages.push(cs.slice(i, i + config.perPage));
			}
			if (pages.length === 0) {
				pages.push([]);
			}
			return f(pages, config.pageS);
		};
	};

	return paginate(function (pages, iS) {
		var once = false;
		return componentStream(iS.map(function (i) {
			var pageSelector = alignLRM({
				middle: sideBySide({
					gutterSize: separatorSize,
				}, pages.map(function (_, pageIndex) {
					var str = '' + (pageIndex + 1);
					return (i === pageIndex) ? text(str) : text(str).all([
						withFontColor(colors.linkBlue),
						$css('text-decoration', 'underline'),
						link,
						clickThis(function () {
							iS.push(pageIndex);
						}),
					]);
				})),
			});
			return stack({
				gutterSize: separatorSize,
			}, [
				pageSelector,
				stack({
					gutterSize: separatorSize,
				}, intersperse(pages[i], bar.horizontal(1, colors.middleGray))),
				pageSelector,
			]).all([
				function (index, context) {
					if (once) {
						var top = -50 + context.topAccum.lastValue() + context.top.lastValue();
						$('body').animate({scrollTop: top}, 300);
					}
					once = true;
				},
			]);
		}));
	});
});
