define([
	'auth',
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'holibirthdayRow',
], function (auth, bodyColumn, confettiBackground, fonts, holibirthdayRow) {
	return function (token) {
		var pageS = Stream.once(text('Confirming Email...').all([
			fonts.h1,
		]));
		auth.confirmEmail(token).then(function () {
			pageS.push(text('Confirmed!  You may now log in.').all([
				fonts.h1,
			]));
		}, function () {
			pageS.push(text('Invalid token.').all([
				fonts.h1,
			]));
		});
		return confettiBackground(bodyColumn(holibirthdayRow(componentStream(pageS))));
	};
});
