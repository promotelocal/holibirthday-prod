define([
	'bodyColumn',
	'confettiBackground',
	'domain',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
	'siteCopyItemsP',
], function (bodyColumn, confettiBackground, domain, fonts, holibirthdayRow, separatorSize, siteCopyItemsP) {
	return promiseComponent(siteCopyItemsP.then(function (copy) {
		return stack({
			gutterSize: separatorSize,
		}, [
			confettiBackground(bodyColumn(holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text('Holibirthday Gifts').all([
					fonts.ralewayThinBold,
					fonts.h1,
				]),
			]), domain + '/content/man.png'))),
		]);
	}));
});
