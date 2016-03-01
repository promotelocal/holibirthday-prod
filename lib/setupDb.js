var async = require('async');
var Grid = require('gridfs-stream');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var Err = require('../public/Err');

module.exports = function (config, schema, cb) {
	var url = config.db;

	MongoClient.connect(url, function (err, db) {
		if (err) {
			throw err;
		}

		var grid = Grid(db, mongo);
		
		var colls = {};
		
		async.map(Object.keys(schema), function (key, cb) {
			var table = schema[key];

			db.collection(table.name, {}, Err.handle(function (coll) {
				colls[table.name] = coll;
				
				return cb();
			}));
		}, function () {
			return cb(function (errHandler) {
				var db = {};
				db.grid = grid;

				var cb = Err.handleWith(errHandler);
				
				schema.map(function (table) {
					db[table.name] = {
						findOne: function (query, next) {
							table.findMiddleware.invoke(query, cb(function () {
								return colls[table.name].findOne(query, cb(function (res) {
									table.postFindMiddleware.invoke(query, cb(function () {
										return next(res);
									}));
								}));
							}));
						},
						findOneOrFail: function (query, next) {
							table.findMiddleware.invoke(query, cb(function () {
								return colls[table.name].findOne(query, cb(function (res) {
									table.postFindMiddleware.invoke(query, cb(function () {
										if (!res) {
											return errHandler('none found in table ' + table.name + 'for query ' + JSON.stringify(query));
										}
										return next(res);
									}));
								}));
							}));
						},
						find: function (query, next) {
							table.findMiddleware.invoke(query, cb(function () {
								return colls[table.name].find(query).toArray(cb(function (res) {
									table.postFindMiddleware.invoke(query, cb(function () {
										return next(res);
									}));
								}));
							}));
						},
						insert: function (doc, options, next) {
							doc._id = new mongo.ObjectID();
							doc.createDate = new Date();
							doc.updateDate = doc.createDate;
							table.insertMiddleware.invoke(doc, options, cb(function () {
								return colls[table.name].insertOne(doc, options, cb(function () {
									table.postInsertMiddleware.invoke(doc, options, cb(next));
								}));
							}));
						},
						update: function (selector, doc, options, next) {
							doc.$set.updateDate = new Date();
							delete doc._id;
							table.updateMiddleware.invoke(selector, doc, options, cb(function () {
								return colls[table.name].update(selector, doc, options, cb(function () {
									table.postUpdateMiddleware.invoke(selector, doc, options, cb(next));
								}));
							}));
						},
						remove: function (selector, options, next) {
							table.removeMiddleware.invoke(selector, options, cb(function () {
								return colls[table.name].remove(selector, options, cb(function () {
									table.postRemoveMiddleware.invoke(selector, options, cb(next));
								}));
							}));
						},
					};
				});

				return db;
			});
		});
	});
};
