define([
	'separatorSize',
], function (separatorSize) {
	var columnWidth = 1070;
	
	return function (c) {
		return alignLRM({
			middle: padding({
				left: separatorSize,
				right: separatorSize,
			}, c).all([
				withMinWidth(columnWidth, true),
			]),
		}).all([
			componentName('body-column'),
		]);
	};
});
