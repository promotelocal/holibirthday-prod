define([
	'bar',
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'formatPrice',
	'gafy',
	'gafyColors',
	'gafyDesignRow',
	'gafyDesignSmall',
	'gafyStyleSmall',
	'holibirthdayRow',
	'opacityGridSelect',
	'separatorSize',
	'submitButton',
], function (bar, bodyColumn, colors, confettiBackground, db, fonts, formatPrice, gafy, gafyColors, gafyDesignRow, gafyDesignSmall, gafyStyleSmall, holibirthdayRow, opacityGridSelect, separatorSize, submitButton) {
	return promiseComponent(db.gafyDesign.find().then(function (designs) {
		return stack({
			gutterSize: separatorSize,
		}, [
			confettiBackground(
				bodyColumn(
					holibirthdayRow(text('Holibirthday Gifts').all([
						fonts.ralewayThinBold,
						$css('font-size', 40),
					])))),
			bodyColumn(stack({
				gutterSize: separatorSize,
			}, intersperse(designs.map(function (design) {
				return linkTo('#!design/' + design._id, gafyDesignRow(design));
			}), bar.horizontal(1).all([
				withMinHeight(1, true),
				withBackgroundColor(colors.middleGray),
			])))),
		]);
	}));
});
