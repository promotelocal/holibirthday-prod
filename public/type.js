(function () {
	var genType = function (ObjectId, xss) {
		return {
			string: {
				title: 'String',
				fromString: function (str) {
					if (xss) {
						xss.whiteList.div.push('align');
					}
					return xss ? xss(str, {
						whiteList: xss.whiteList,
					}) : str;
				},
			},
			id: {
				title: 'Object ID',
				fromString: function (str) {
					return ObjectId ? new ObjectId(str) : str;
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
		window.type = genType();
	}
	else {
		var ObjectID = require('mongodb').ObjectID;
		var xss = require('xss');
		
		module.exports = genType(ObjectID, xss);
	}
})();
