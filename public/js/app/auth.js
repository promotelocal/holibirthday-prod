define([
	'domain',
], function (domain) {
	return {
		signIn: function (creds) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/login',
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
				url: domain + '/auth/facebook',
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
				url: domain + '/auth/register',
				data: JSON.stringify(body),
				contentType: 'application/json',
			});
		},
		resendConfirmEmail: function (options) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/resendConfirmEmail',
				data: JSON.stringify({
					email: options.email,
				}),
				contentType: 'application/json',
				
			});
		},
		resetPasswordRequest: function (options) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/resetPasswordRequest',
				data: JSON.stringify({
					email: options.email,
				}),
				contentType: 'application/json',
			});
		},
		resetPassword: function (options) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/resetPassword',
				data: JSON.stringify({
					passwordResetToken: options.token,
					password: options.password,
				}),
				contentType: 'application/json',
			});
		},
		setPassword: function (options) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/setPassword',
				data: JSON.stringify({
					password: options.password,
				}),
				contentType: 'application/json',
			});
		},
		confirmEmail: function (token) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/confirmEmail',
				data: JSON.stringify({
					emailConfirmationToken: token,
				}),
				contentType: 'application/json',
			});
		},
		grecaptchaSitekeyP: $.get(domain + '/grecaptcha/sitekey'),
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
		StripeP: $.get(domain + '/stripe/publishableKey').then(function (key) {
			if (window.Stripe) {
				window.Stripe.setPublishableKey(key);
				return window.Stripe;
			}
			else {
				console.log('Stripe not loaded');
			}
		}),
	};
});
