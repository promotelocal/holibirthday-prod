define([], function () {
	return (function () {
		var meD = Q.defer();
		
		$.get('/auth/me').then(function (me) {
			meD.resolve(me);
		}, function () {
			meD.resolve();
		});

		return meD.promise;
	})();
});
