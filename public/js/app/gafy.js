define([], function () {
	return {
		colorsForDesignAndStyle: function (design, style) {
			var colorsObj = {};
			var appendToColorsObj = function (color) {
				colorsObj[color.name] = color;
			};
			if (design.colors) {
				design.colors.map(appendToColorsObj);
			}
			if (style.colors) {
				style.colors.map(appendToColorsObj);
			}
			
			var colors = [];
			for (var key in colorsObj) {
				colors.push(colorsObj[key]);
			}
			return colors;
		},
		stylesForDesign: function (styles, design) {
			if (!styles || !styles.filter || !design || !design.styles || !design.styles.filter) {
				return [];
			}
			return styles.filter(function (style) {
				return design.styles.filter(function (id) {
					return style._id === id;
				}).length > 0;
			});
		},
	};
});
