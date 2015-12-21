define([
	'auth',
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
	'siteCopyItemsP',
], function (auth, bodyColumn, confettiBackground, fonts, holibirthdayRow, separatorSize, siteCopyItemsP) {
	return function (token) {
		return promiseComponent(siteCopyItemsP.then(function (copy) {
			return auth.optOutEmails({
				token: token
			}).then(function () {
				return stack({
					gutterSize: separatorSize,
				}, [
					confettiBackground(bodyColumn(holibirthdayRow(paragraph(copy.find('Unsubscribed Title')).all([
						fonts.h1,
					])))),
					bodyColumn(paragraph(copy.find('Unsubscribed Message')).all([
						fonts.h1,
					])),
				]);
			});
		}));
	};
});

