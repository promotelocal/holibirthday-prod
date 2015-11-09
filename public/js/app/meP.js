define([
	'domain',
], function (domain) {
	return (function () {
		var meD = Q.defer();

		console.log(domain);
		$.get(domain + '/auth/me').then(function (me) {
			meD.resolve(me);
		}, function () {
			meD.resolve();
		});

		return meD.promise;
	})();
});
