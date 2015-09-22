(function () {
	var globalHandlers = [console.error, function () {
		debugger;
	}];
	
	var Err = {
		handleWith: function (errHandler) {
			return function (func) {
				return function (err, val) {
					if (err !== null && typeof err !== 'undefined') {
						return errHandler(err);
					}
					else {
						return func(val, function (result) {
							return errHandler(null, result);
						});
					}
				};
			};
		},
		reportError: function (err) {
			globalHandlers.map(function (globalHandler) {
				globalHandler(err);
			});
		},
		handle: function (func) {
			return Err.handleWith(Err.reportError)(func);
		},
		addLogger: function (f) {
			globalHandlers.push(f);
		},
	};

	if (typeof exports === 'undefined') {
		window.Err = Err;
	}
	else {
		module.exports = Err;
	}
})();
