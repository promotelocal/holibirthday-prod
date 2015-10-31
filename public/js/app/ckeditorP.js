define([], function () {
	return function () {
		$('body').append('<script src="./ckeditor/ckeditor.js"></script>');
		var ckeditorD = Q.defer();
		var interval2 = setInterval(function () {
			if (window.CKEDITOR) {
				ckeditorD.resolve(window.CKEDITOR);
				clearInterval(interval2);
			}
		}, 100);
		return ckeditorD.promise;
	};
});
