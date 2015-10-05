define([], function () {
	return function (design, style) {
		var colorsObj = {};
		var appendToColorsObj = function (color) {
			colorsObj[color.name] = color;
		};
		design.colors.map(appendToColorsObj);
		style.colors.map(appendToColorsObj);
		
		var colors = [];
		for (var key in colorsObj) {
			colors.push(colorsObj[key]);
		}
		return colors;
	};
});
