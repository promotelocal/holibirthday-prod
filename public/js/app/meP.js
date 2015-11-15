define([
	'domain',
], function (domain) {
	return (function () {
		var meD = Q.defer();

		$.get(domain + '/auth/me').then(function (me) {
			meD.resolve(me);
		}, function () {
			meD.resolve();
		});

		return meD.promise;
	})();
});
