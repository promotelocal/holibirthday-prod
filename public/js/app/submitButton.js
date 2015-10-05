define([], function () {
	return function (color, c) {
		if (!c) {
			debugger;
		}
		return border(color, {
			all: 2,
			radius: 5,
		}, padding(10, alignLRM({
			middle: c,
		})));
	};
});
