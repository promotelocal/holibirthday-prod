define([
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
	'siteCopyItemsP',
], function (bodyColumn, confettiBackground, fonts, holibirthdayRow, separatorSize, siteCopyItemsP) {
	return function (orderBatch) {
		return promiseComponent(siteCopyItemsP.then(function (copy) {
			return stack({
				gutterSize: separatorSize,
			}, [
				confettiBackground(bodyColumn(holibirthdayRow(text(copy.find('Causes Title')).all([
					fonts.ralewayThinBold,
					$css('font-size', 40),
				]), copy.find('Causes Image')))),
				bodyColumn(stack({
					gutterSize: separatorSize,
				}, [
					text('Thank you for donating!').all([
						fonts.h1,
					]),
					text('Your donation id is ' + orderBatch),
				].map(function (t) {
					return t.all([
						fonts.ralewayThinBold,
					]);
				}))),
			]);
		}));
	};
});
