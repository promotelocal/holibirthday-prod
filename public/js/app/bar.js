define([], function () {
	return {
		horizontal: function (size, color) {
			size = size || 0;
			color = color || transparent;
			return div.all([
				componentName('vertical-separator'),
				withMinWidth(0, true),
				withMinHeight(size, true),
				withBackgroundColor(color),
			]);
		},
		vertical: function (size, color) {
			size = size || 0;
			color = color || transparent;
			return div.all([
				componentName('horizontal-separator'),
				withMinWidth(size, true),
				withMinHeight(0, true),
				withBackgroundColor(color),
			]);
		},
	};
});
