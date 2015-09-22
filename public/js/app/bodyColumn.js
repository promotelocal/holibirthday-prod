define([], function () {
	var columnWidth = 1070;
	
	return function (c) {
		return alignLRM({
			middle: padding({
				left: 10,
				right: 10,
			}, c).all([
				withMinWidth(columnWidth, true),
			]),
		}).all([
			componentName('body-column'),
		]);
	};
});
