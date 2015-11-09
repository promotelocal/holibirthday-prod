define([
	'auth',
	'fonts',
	'separatorSize',
	'socialMedia',
	'submitButton',
], function (auth, fonts, separatorSize, socialMedia, submitButton) {
	var facebookAuthResponseD = Q.defer();
	FB.getLoginStatus(function (response) {
		if (response.status === 'unknown' || response.status === 'not_authorized' || response.status === 'connected') {
			facebookAuthResponseD.resolve(false);
		}
		facebookAuthResponseD.resolve(response.authResponse);
	}, true);
	
	return function () {
		return promiseComponent(facebookAuthResponseD.promise.then(function (authResponse) {
			return button.all([
				child(submitButton(socialMedia.facebook.color, sideBySide({
					gutterSize: separatorSize,
				}, [
					text(socialMedia.facebook.icon).all([
						$css('font-size', '20px'),
					]),
					text('sign in with Facebook').all([
						fonts.bebasNeue,
					]),
				])).all([
					withFontColor(socialMedia.facebook.color),
				])),
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
							scope: 'email, public_profile, user_friends, user_birthday',
						});
					}
				}),
			]);
		}));
	};
});
