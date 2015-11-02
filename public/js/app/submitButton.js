define([], function () {
	return function (color, c) {
		if (!c) {
			debugger;
		}
		return border(color, {
			all: 2,
			radius: 5,
		}, padding({
			all: 8,
			top: 10,
		}, alignLRM({
			middle: alignTBM({
				middle: c,
			}),
		})));
	};
});
