define([
	'prettyForms',
], function (prettyForms) {
	var fromTable = function (table) {
		var fields = [table.fields.map(function (field) {
			return function (stream) {
				switch (field.name) {
				case 'string':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						stream: stream,
						type: 'text',
					});
				case 'password':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						stream: stream,
						type: 'password',
					});
				}
			};
		})];

		var componentForField = function (field) {
		};

		for (var i = 0; i < table.fields; i++) {
			var field = table.fields[i];
		}
		
		return function (object, cb) {
			var objectStreams = {};
			var objectFields = {};
			for (var key in object) {
				var stream = Stream.once(object[key]);
				objectStreams[key] = stream;
				objectFields = fields[key](stream);
			}
			return form.all([
				child(cb(Stream.combineObject(objectStreams))),
				wireChildren(passThroughToFirst),
			]);
		};
	};

	var formFor = [];
	
	schema.map(function (table) {
		formFieldsForTable = fromTable(table);
		formFor.push(formFieldsForTable);
		formFor[table.name] = formFieldsForTable;
	});


	return formFor;
});
