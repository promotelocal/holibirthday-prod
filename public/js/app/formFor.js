define([
	'prettyForms',
], function (prettyForms) {
	// todo: move prettyForms code into this file, and eliminate that
	// file
	var fromTable = function (table) {
		var fields = {};
		table.fields.map(function (field) {
			fields[field.name] = function (labelAll, stream) {
				switch (field.editorType) {
				case 'string':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
						type: 'text',
					});
				case 'password':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
						type: 'password',
					});
				case 'html':
					return prettyForms.textarea({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
					});
				case 'date':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
						type: 'date',
					});
				// case 'image':
				// 	return prettyForms.imageUpload({
				// 		name: field.displayName,
				// 		fieldName: field.name,
				// 		labelAll: labelAll,
				// 		stream: stream,
				// 		type: 'date',
				// 	});
				// case 'bool':
				// 	return prettyForms.input({
				// 		name: field.displayName,
				// 		fieldName: field.name,
				// 		labelAll: labelAll,
				// 		stream: stream,
				// 		type: 'date',
				// 	});
				}
			};
		});
		
		var componentForField = function (field) {
		};

		for (var i = 0; i < table.fields; i++) {
			var field = table.fields[i];
		}

		return function (labelAll) {
			return function (object, cb) {
				var objectStreams = {};
				var objectFields = {};
				for (var key in object) {
					var stream = Stream.once(object[key]);
					objectStreams[key] = stream;
					if (fields[key]) {
						objectFields = fields[key](labelAll, stream);
					}
					else {
						console.warn("field missing " + key);
					}
				}
				return form.all([
					child(cb(Stream.combineObject(objectStreams))),
					wireChildren(passThroughToFirst),
				]);
			};
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
