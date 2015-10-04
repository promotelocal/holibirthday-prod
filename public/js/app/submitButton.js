define([], function () {
	return function (c, color) {
		color = color || black;
		return border(color, {
			all: 2,
			radius: 5,
		}, padding(10, alignLRM({
			middle: c,
		})).all([
			withFontColor(color),
		]));
	};
});
