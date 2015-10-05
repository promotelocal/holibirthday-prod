define([
	'gridSelect',
	'separatorSize',
], function (gridSelect, separatorSize) {
	return gridSelect({
		gutterSize: separatorSize,
	}, function (c) {
		return {
			selected: border(black, {
				all: 1,
			}, padding({
				all: 5,
			}, c).all([
				withBackgroundColor(white),
			])),
			deselected: padding({
				all: 6,
			}, c),
		};
	});
});
