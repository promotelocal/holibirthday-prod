define([
	'colors',
], function (colors) {
	return function (c, color) {
		color = color || black;
		return border(color, {
			all: 2,
			radius: 5,
		}, padding(10, alignLRM({
			middle: c,
		})).all([
			withBackgroundColor(colors.pageBackgroundColor),
			withFontColor(color),
		]));
	};
});
