define([
	'fonts',
	'formFor',
], function (fonts, formFor) {
	var labelAll = [
		fonts.h3,
	];

	var defaultFormFor = {};
	
	schema.map(function (table) {
		defaultFormFor[table.name] = formFor[table.name](labelAll);
	});

	return defaultFormFor;
});
