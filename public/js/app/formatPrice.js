define([], function () {
	return function (costInCents) {
		return '$' + Math.floor(costInCents / 100) + '.' + (costInCents % 100);
	};
});
