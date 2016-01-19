define([], function () {
	return function (cases, obj) {
		for (var key in cases) {
			if (cases.hasOwnProperty(key) && obj.hasOwnProperty(key)) {
				if (!$.isFunction(cases[key])) {
					return cases[key];
				}
				return cases[key](obj[key]);
			}
		}
	};
});
