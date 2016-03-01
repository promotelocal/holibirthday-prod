var async = require('async');
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var multiparty = require('multiparty');
var ObjectID = require('mongodb').ObjectID;

var Err = require('../public/Err');

module.exports = function (app, config, dbWith) {
	var propsFromStrings = function (model, source) {
		var target = {};

		var specialFields = [
			'$gte',
			'$gt',
			'$lte',
			'$lt',
		];

		if (source) {
			model.fields.map(function (field) {
				if (source.hasOwnProperty(field.name)) {
					// todo: do all the tests
					if (source[field.name] && source[field.name].hasOwnProperty && source[field.name].hasOwnProperty('$in')) {
						target[field.name] = source[field.name].map(field.type.fromString);
					}
					else {
						target[field.name] = field.type.fromString(source[field.name]);
					}
				}
				var specialFieldName = field.name + '_';
				if (source.hasOwnProperty(specialFieldName)) {
					target[field.name] = {};
					specialFields.map(function (specialField) {
						if (source[specialFieldName].hasOwnProperty(specialField)) {
							target[field.name][specialField] = field.type.fromString(source[specialFieldName][specialField]);
						}
					});
				}
			});
		}

		return target;
	};
	
	var queryFromStrings = function (model, query) {
		if (query.$or) {
			return {
				$or: query.$or.map(function (q) {
					return propsFromStrings(model, q);
				}),
			};
		}
		return propsFromStrings(model, query);
	};

	var updateFromStrings = function (model, update) {
		return {
			$set: propsFromStrings(model, update),
		};
	};
	
	var registerCRUDRoutes = function (model) {
		app.post('/api/' + model.name + '/find', [
			function (req, res, next) {
				res.header("Access-Control-Allow-Origin", "http://holibirthdaygift.com");
				var db = dbWith(next);
				
				var query = queryFromStrings(model, req.body);
				if (query.$or && query.$or.length === 0) {
					return res.send([]);
				}
				var models = [];
				
				return db[model.name].find(query, function (docs) {
					return async.reduce(docs, true, function (acc, doc, cb) {
						model.mayFind(req.user, doc, db, function (mayFind) {
							return cb(null, acc && mayFind);
						});
					}, function (err, mayFind) {
						if (!mayFind) {
							return res.status(401).end();
						}
						return res.send(docs);
					});
				});
			}]);
		app.post('/api/' + model.name + '/insert', [
			function (req, res, next) {
				var db = dbWith(next);
				
				var doc = propsFromStrings(model, req.body);

				return model.mayInsert(req.user, doc, db, function (mayInsert) {
					if (!mayInsert) {
						return res.status(401).end();
					}
					return db[model.name].insert(doc, {}, function () {
						return res.send(doc);
					});
				});
			}]);
		app.post('/api/' + model.name + '/update', [
			function (req, res, next) {
				var db = dbWith(function (err) {
					console.log(err);
					return next(err);
				});

				var query = queryFromStrings(model, req.body.query);
				if (query.$or && query.$or.length === 0) {
					return res.end();
				}
				var update = updateFromStrings(model, req.body.update);
				
				return db[model.name].find(query, function (docs) {
					return async.reduce(docs, true, function (acc, doc, cb) {
						model.mayUpdate(req.user, doc, db, function (mayUpdate) {
							return cb(null, acc && mayUpdate);
						});
					}, function (err, mayUpdate) {
						if (!mayUpdate) {
							return res.status(401).end();
						}
						return db[model.name].update(query, update, {}, function () {
							return res.end();
						});
					});
				});
			}]);
		app.post('/api/' + model.name + '/remove', [
			function (req, res, next) {
				var db = dbWith(next);
				
				var query = queryFromStrings(model, req.body);
				if (query.$or && query.$or.length === 0) {
					return res.end();
				}
				
				return db[model.name].find(query, function (docs) {
					return async.reduce(docs, true, function (acc, doc, cb) {
						model.mayRemove(req.user, doc, db, function (mayRemove) {
							return cb(null, acc && mayRemove);
						});
					}, function (err, mayRemove) {
						if (!mayRemove) {
							return res.status(401).end();
						}
						return db[model.name].remove(query, {}, function () {
							return res.end();
						});
					});
				});
			}]);
	};
	
	app.schema.map(function (model) {
		registerCRUDRoutes(model);
	});

	app.get('/api/uploadFile/find/:filename', [
		function (req, res, next) {
			var db = dbWith(next);

			// streaming from gridfs
			var readstream = db.grid.createReadStream({
				filename: req.params.filename,
			});

			//error handling, e.g. file does not exist
			readstream.on('error', function (err) {
				console.log('An error occurred!', err);
				return next(err);
			});

			readstream.pipe(res);
		}]);

	app.post('/api/uploadFile/insert', [
		function (req, res, next) {
			var cb = Err.handleWith(next);
			var db = dbWith(next);

			if (!req.user) {
				return res.status(401).end();
			}
			var form = new multiparty.Form();
			form.parse(req, function (err, fields, files) {
				if (!files.file || !files.file[0]) {
					return res.status(400).send();
				}
				var filename = files.file[0].originalFilename;
				var path = files.file[0].path;

				var index = filename.length - 1;
				while(filename[index] !== '.') {
					index -= 1;
				}
				
				var name = filename.substr(0, index);
				var extension = filename.substring(index);
				var random_numbers = Math.random().toString().substring(2);

				filename = name + '_' + random_numbers + extension;

				var writeStream = db.grid.createWriteStream({
					filename: filename,
				});
				if (files.file[0].headers['content-type'].indexOf('image/') === 0) {
					var gmImage = gm(path);
					gmImage.size(cb(function (value) {
						gmImage
							.resize(300, 300)
							.stream()
							.pipe(writeStream);
					}));
				}
				else {
					var readStream = fs.createReadStream(path);
					readStream.pipe(writeStream);
				}
				writeStream.on('close', function () {
					return res.send(filename);
				});
			});
		},
	]);
};
