define([], function () {
	return {
		stack: function (config) {
			return function (object, submitF) {
				config.fields.map(function (field) {
					object[field] = object[field] || undefined;
				});
				return config.formBuilder(object, function (objectS, fields) {
					return stack(config.stackConfig, [
						stack(config.stackConfig || {}, config.fields.map(function (field) {
							return fields[field];
						})),
						submitF(objectS, fields),
					]);
				});
			};
		},
	};
});
