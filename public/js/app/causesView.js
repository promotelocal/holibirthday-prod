define([
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
	'siteCopyItemsP',
], function (bodyColumn, confettiBackground, fonts, holibirthdayRow, separatorSize, siteCopyItemsP) {
	return promiseComponent(siteCopyItemsP.then(function (copy) {
		return stack({
			gutterSize: separatorSize,
		}, [
			confettiBackground(bodyColumn(holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text(copy.find('Causes Title')).all([
					fonts.ralewayThinBold,
					fonts.h1,
				]),
				linkTo('#!donate', text(copy.find('Causes Donate Now')).all([
					fonts.ralewayThinBold,
					fonts.h2,
				])),
			]), copy.find('Causes Image')))),
			bodyColumn(paragraph(copy.find('Causes'))),
		]);
	}));
});
