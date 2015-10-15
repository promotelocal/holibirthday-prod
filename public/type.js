(function () {
	var genType = function (ObjectId) {
		return {
			string: {
				title: 'String',
				fromString: function (str) {
					return str;
				},
			},
			id: {
				title: 'Object ID',
				fromString: function (str) {
					return new ObjectId(str);
				},
			},
			json: {
				title: 'JSON object',
				fromString: function (str) {
					// this function should really be called 'JSON-deserialize'
					// don't do JSON.parse, just return the json
					return str;
				},
			},
			number: {
				title: 'Number',
				fromString: function (str) {
					return str;
				},
			},
			date: {
				title: 'Date',
				fromString: function (str) {
					// dates are nullable, deal with it
					return str && new Date(str);
				},
			},
			bool: {
				title: 'Boolean',
				fromString: function (str) {
					return str;
				},
			},
		};
	};

	if (typeof exports === 'undefined') {
		window.type = genType(ObjectId);
	}
	else {
		var ObjectID = require('mongodb').ObjectID;
		
		module.exports = genType(ObjectID);
	}
})();
