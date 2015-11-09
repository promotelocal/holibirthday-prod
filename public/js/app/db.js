define([
	'domain',
], function (domain) {
	return (function () {
		var db = {};
		
		schema.map(function (table) {
			var uri = domain + '/api/' + table.name + '/';
			var convertFields = function (doc) {
				table.fields.map(function (field) {
					if (doc[field.name]) {
						// skip id type for client side
						if (field.type !== type.id) {
							doc[field.name] = field.type.fromString(doc[field.name]);
						}
					}
				});
			};
			
			var mapResponse = function (responseP) {
				return responseP.then(function (docs) {
					if (docs) {
						if (Array.isArray(docs)) {
							docs.map(convertFields);
						}
						else {
							convertFields(docs);
						}
					}
					return docs;
				});
			};
			
			db[table.name] = {
				findOne: function (query) {
					var result = Q.defer();
					
					mapResponse($.ajax({
						type: 'post',
						url: uri + 'find',
						data: JSON.stringify(query),
						contentType: 'application/json',
					}).then(function (docs) {
						if (docs.length === 0) {
							result.resolve(null);
						}
						result.resolve(docs[0]);
					}));
					
					return result.promise;
				},
				find: function (query) {
					return mapResponse($.ajax({
						type: 'post',
						url: uri + 'find',
						data: JSON.stringify(query),
						contentType: 'application/json',
					}));
				},
				insert: function (doc) {
					return mapResponse($.ajax({
						type: 'post',
						url: uri + 'insert', 
						data: JSON.stringify(doc),
						contentType: 'application/json',
					}));
				},
				update: function (query, update) {
					return mapResponse($.ajax({
						type: 'post',
						url: uri + 'update', 
						data: JSON.stringify({
							query: query,
							update: update
						}),
						contentType: 'application/json',
					}));
				},
				remove: function (query) {
					return mapResponse($.ajax({
						type: 'post',
						url: uri + 'remove', 
						data: JSON.stringify(query),
						contentType: 'application/json',
					}));
				},
			};
		});

		db.uploadFile = function (file, fileName) {
			var data = new FormData();
			if (fileName) {
				data.append('file', file, fileName);
			}
			else {
				data.append('file', file);
			}
			
			return $.ajax({
				url: '/api/uploadFile/insert',
				type: 'post',
				data: data,
				cache: false,
				processData: false,
				contentType: false,
			});
		};
		
		return db;
	})();
});
