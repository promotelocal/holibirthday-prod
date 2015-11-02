define([
	'auth',
	'bar',
	'bodyColumn',
	'fonts',
	'prettyForms',
	'separatorSize',
], function (auth, bar, bodyColumn, fonts, prettyForms, separatorSize) {
	return function (token) {
		var passwordS = Stream.once('');
		var confirmPasswordS = Stream.once('');

		var passwordsDoNotMatch = Stream.once(false);
		passwordS.map(function () {
			passwordsDoNotMatch.push(false);
		});
		confirmPasswordS.map(function (cp) {
			passwordsDoNotMatch.push(passwordS.lastValue() !== cp);
		});
		
		var password = prettyForms.input({
			name: 'Password',
			fieldName: 'password',
			stream: passwordS,
			type: 'password',
		});
		var confirmPassword = prettyForms.input({
			name: 'Password Again',
			fieldName: 'confirmPassword',
			stream: confirmPasswordS,
			type: 'password',
		});
		
		var submit = prettyForms.submit(black, 'Submit', function () {
			if (!passwordsDoNotMatch.lastValue()) {
				auth.resetPassword({
					password: passwordS.lastValue(),
					token: token,
				}).then(function () {
					pageS.push(text('Reset!  You may now log in.').all([
						fonts.h1,
					]));
				}, function () {
					pageS.push(text('Invalid token.').all([
						fonts.h1,
					]));
				});
			}
		});
		
		var pageS = Stream.once(alignLRM({
			left: stack({
				gutterSize: separatorSize,
			}, [
				text('Reset Password').all([
					fonts.h1,
				]),
				password,
				confirmPassword,
				toggleHeight(passwordsDoNotMatch)(paragraph('Passwords must match')),
				submit,
			]),
		}));
		return bodyColumn(componentStream(pageS));
	};
});
