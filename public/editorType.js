(function () {
	var file = function (accept) {
		return {
			name: 'file',
			accept: accept || '*',
		};
	};
	
	var editorType = {
		id: {
			name: 'id',
		},
		string: {
			name: 'string',
		},
		html: {
			name: 'html',
		},
		password: {
			name: 'password',
		},
		number: {
			name: 'number',
		},
		date: {
			name: 'date',
		},
		bool: {
			name: 'bool',
		},
		oneOf: function (options) {
			return {
				name: 'oneOf',
			};
		},
		file: file,
		image: file('image/*'),
	};

	if (typeof exports === 'undefined') {
		window.editorType = editorType;
	}
	else {
		module.exports = editorType;
	}
})();
