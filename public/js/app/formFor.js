define([
	'prettyForms',
], function (prettyForms) {
	// todo: move prettyForms code into this file, and eliminate that
	// file
	var fromTable = function (table) {
		var fields = {};
		table.fields.map(function (field) {
			fields[field.name] = function (labelAll, stream) {
				switch (field.editorType && field.editorType.name) {
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
				case 'file':
					if (field.editorType.accept.indexOf('image') !== -1) {
						return prettyForms.imageUpload({
							name: field.displayName,
							fieldName: field.name,
							labelAll: labelAll,
							stream: stream,
						});
					}
					return prettyForms.fileUpload({
							name: field.displayName,
							fieldName: field.name,
							labelAll: labelAll,
							stream: stream,
					});
				case 'bool':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
						type: 'date',
					});
				default:
					return text('no form element');
				}
			};
		});
		
		return function (labelAll) {
			return function (object, cb) {
				var objectStreams = {};
				var objectFields = {};
				for (var key in object) {
					var stream = (object[key] !== undefined) ?
						Stream.once(object[key]) :
						Stream.create();
					objectStreams[key] = stream;
					if (fields[key]) {
						objectFields[key] = fields[key](labelAll, stream);
					}
				}
				return form.all([
					child(cb(Stream.combineObject(objectStreams), objectFields)),
					wireChildren(passThroughToFirst),
				]);
			};
		};
	};

	var formFor = [];
	
	schema.map(function (table) {
		var formFieldsForTable = fromTable(table);
		formFor.push(formFieldsForTable);
		formFor[table.name] = formFieldsForTable;
	});


	return formFor;
});
