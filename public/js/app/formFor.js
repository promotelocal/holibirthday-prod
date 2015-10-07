define([
	'db',
	'fonts',
	'forms',
	'gafyColors',
	'gafyStyleSmall',
	'opacityGridSelect',
	'prettyForms',
	'separatorSize',
], function (db, fonts, forms, gafyColors, gafyStyleSmall, opacityGridSelect, prettyForms, separatorSize) {
	// Prettify does the same thing as all the wet code in
	// prettyForms.  todo: move all the code here and make it use
	// prettify, and delete prettyForms
	var prettify = function (name, inputC, labelAll) {
		return stack({}, [
			text(name).all([
				fonts.ralewayThinBold,
				fonts.h3,
			]).all(labelAll || []),
			inputC,
		]);
	};
	
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
				case 'paragraph':
					return prettyForms.plainTextarea({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
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
				case 'number':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
						type: 'number',
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
					return prettyForms.checkbox({
						name: field.displayName,
						fieldName: field.name,
						stream: stream,
					});
				case 'foreignKey':
					return promiseComponent(db[field.editorType.table].find({}).then(function (rows) {
						return prettify(field.displayName, forms.selectBox({
							options: rows.map(function (row) {
								return {
									name: row[field.editorType.nameField],
									value: row._id,
								};
							}),
							name: field.name,
							stream: stream,
						}));
					}));
				case 'listOf':
					var textStream = Stream.create();
					stream.map(function (arr) {
						if (!arr.join) {
							arr = [];
						}
						return arr.join('\n');
					}).pushAll(textStream);
					textStream.map(function (str) {
						return str.split('\n');
					}).pushAll(stream);
					return prettify(field.displayName + ' (one per line)', forms.plainTextareaBox(textStream, field.name).all([
						$addClass('pre'),
 					]));
				case 'oneOf':
					return prettify(field.displayName, stack({}, field.editorType.options.map(function (option) {
						return sideBySide({
							gutterSize: separatorSize,
						}, [
							forms.inputBox(Stream.create(), 'radio', field.name).all([
								$prop('value', option),
								clickThis(function () {
									stream.push(option);
								}),
								function (instance) {
									setTimeout(function () {
										stream.onValue(function (value) {
											if (value === option) {
												instance.$el.find('input').click();
											}
										});
									});
								},
							]),
							padding({
								top: 1,
							}, text(option).all([
								fonts.ralewayThinBold,
							])),
						]);
					})));
				case 'enumeration':
					return prettify(field.displayName, forms.selectBox({
						options: field.editorType.options,
						name: field.name,
						stream: stream,
					}));
				case 'gafyColor':
					return prettify(field.displayName, opacityGridSelect(stream, gafyColors.map(function (gafyColor) {
						return {
							component: stack({}, [
								alignLRM({
									middle: div.all([
										withBackgroundColor(gafyColor.color),
										withMinWidth(50),
										withMinHeight(50),
									]),
								}),
								text(gafyColor.name),
								text(rgbColorString(gafyColor.color)),
							]),
							value: gafyColor.name,
						};
					}), true));
				case 'gafyStyle':
					return promiseComponent(db.gafyStyle.find({}).then(function (gafyStyles) {
						return prettify(field.displayName, opacityGridSelect(stream, gafyStyles.map(function (gafyStyle) {
							return {
								component: gafyStyleSmall(gafyStyle),
								value: gafyStyle._id,
							};
						}), true));
					}));
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
