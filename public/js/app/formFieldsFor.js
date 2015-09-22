define([], function () {
	var fromTable = function (table) {
		return function (object, cb) {
			return form.all([
				child(cb({})),
				wireChildren(passThroughToFirst),
			])
		};
	};

	var formFieldsFor = [];
	
	schema.map(function (table) {
		formFieldsForTable = fromTable(table);
		formFieldsFor.push(table);
		formFieldsFor[table.name] = table;
	});

	return formFieldsFor;
});
