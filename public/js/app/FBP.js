define([], function () {
	var FBD = Q.defer();
	setTimeout(function () {
		$.getScript('//connect.facebook.net/en_US/all.js').then(function () {
			FB.init({
				appId: (-1 === location.host.indexOf('www.holibirthday.com')) ?
					(((-1 === location.host.indexOf('glacial-earth-6398.herokuapp.com')) &&
						(-1 === location.host.indexOf('nodejs-holibirthday.rhcloud.com'))) ?
					 ((-1 === location.host.indexOf('localhost')) ?
						'343310219088626' : // 71.whatever, test
						'911384872281155') : // localhost
					 '869960279756948') : // glacial earth and rhos, test2
				'888285114590433', // production, Holibirthday
				xfbml: true,  // parse XFBML
			});
			FBD.resolve(FB);
		});
	}, 1000);
	return FBD.promise;
});
