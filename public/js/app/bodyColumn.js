define([
	'separatorSize',
], function (separatorSize) {
	var columnWidth = 1070;
	var smallerWidth = 870;
	
	return function (c, shrink) {
		return alignLRM({
			middle: padding({
				left: separatorSize,
				right: separatorSize,
			}, c).all([
				withMinWidth(shrink ? smallerWidth : columnWidth, true),
			]),
		}).all([
			componentName('body-column'),
		]);
	};
});
