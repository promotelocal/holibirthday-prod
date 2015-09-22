define([
	'auth',
	'fonts',
	'separatorSize',
	'socialMedia',
	'submitButton',
], function (auth, fonts, separatorSize, socialMedia, submitButton) {
	var facebookAuthResponseD = Q.defer();
	FB.getLoginStatus(function (response) {
		if (response.status === 'unknown' || response.status === 'not_authorized') {
			facebookAuthResponseD.resolve(false);
		}
		facebookAuthResponseD.resolve(response.authResponse);
	}, true);
	
	return facebookAuthResponseD.promise.then(function (authResponse) {
		return button.all([
			child(submitButton(sideBySide({
				gutterSize: separatorSize,
			}, [
				text(socialMedia.facebook.icon),
				text('sign in with Facebook').all([
					fonts.bebasNeue,
				]),
			]), socialMedia.facebook.color)),
			wireChildren(passThroughToFirst),
		]).all([
			link,
			clickThis(function (e) {
				e.stopPropagation();
				e.preventDefault();
				if (authResponse) {
					auth.loginWithFacebook(authResponse).then(function () {
						window.location.reload();
					});
				}
				else {
					FB.login(function (r) {
						auth.loginWithFacebook(r.authResponse).then(function () {
							window.location.reload();
						});
					}, {
						scope: 'email, public_profile',
					});
				}
			}),
		]);
	});
});
