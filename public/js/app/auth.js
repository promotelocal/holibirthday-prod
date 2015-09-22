define([], function () {
	return {
		signIn: function (creds) {
			return $.ajax({
				type: 'post',
				url: '/auth/login',
				data: JSON.stringify(creds),
				contentType: 'application/json',
			});
		},
		signOut: function () {
			return $.get('/auth/logout');
		},
		loginWithFacebook: function (authResponse) {
			return $.ajax({
				type: 'post',
				url: '/auth/facebook',
				data: JSON.stringify({
					username: authResponse.accessToken,
					password: authResponse.accessToken,
				}),
				contentType: 'application/json',
			});
		},
		register: function (body) {
			return $.ajax({
				type: 'post',
				url: '/auth/register',
				data: JSON.stringify(body),
				contentType: 'application/json',
			});
		},
		resendConfirmEmail: function (email) {
			return $.post('/auth/resendConfirmEmail', {
				locationOrigin: window.location.origin,
				email: email,
			});
		},
		grecaptchaSitekeyP: $.get('/grecaptcha/sitekey'),
		grecaptchaP: (function () {
			var d = Q.defer();

			var awaitGrecaptcha = function () {
				if (typeof grecaptcha === 'undefined') {
					setTimeout(awaitGrecaptcha, 100);
				}
				else {
					d.resolve(grecaptcha);
				}
			};
			awaitGrecaptcha();
			return d.promise;
		})(),
		StripeP: $.get('/stripe/publishableKey').then(function (key) {
			Stripe.setPublishableKey(key);
			return Stripe;
		}),
	};
});
