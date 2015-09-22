var async = require('async');

var Err = require('../public/Err');
var ObjectID = require('mongodb').ObjectID;

module.exports = function (db, schema, next) {
	var migrate_from = [];

	db.dbVersion.find({}, function (dbVersions) {
		var dbVersion = dbVersions[0];

		if (!dbVersion) {
			dbVersion = {
				version: 0
			}
		}

		var migrate_all = function (next) {
			schema.map(function (entity) {
			});
			if (dbVersion.version < migrate_from.length) {
				return migrate_from[dbVersion.version](function () {
					dbVersion.version += 1;
					migrate_all(next);
				});
			}

			next();
		};

		return migrate_all(function () {
			return db.dbVersion.remove({}, function () {
				return db.dbVersion.insert(dbVersion, next);
			});
		});
	});
};
