define([
	'bar',
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'formatPrice',
	'holibirthdayRow',
	'separatorSize',
], function (bar, bodyColumn, confettiBackground, fonts, formatPrice, holibirthdayRow, separatorSize) {
	var storeItemRow = function (storeItem, index) {
		var picture = alignTBM({
			middle: image({
				src: storeItem.imageSrc,
				minWidth: 300,
				chooseHeight: 0,
			}),
		});
		var description = sideBySide({
			handleSurplusWidth: giveToFirst,
		}, [
			stack({
				gutterSize: separatorSize,
			}, [
				text(storeItem.name).all([
					fonts.ralewayThinBold,
					$css('font-size', 40),
				]),
				text('Style: ' + storeItem.style).all([
					fonts.ralewayThinBold,
					$css('font-size', 20),
				]),
				text(storeItem.description).all([
					fonts.ralewayThinBold,
					$css('font-size', 20),
				]),
			]),
			text(formatPrice(storeItem.price)).all([
				fonts.ralewayThinBold,
				$css('font-size', 20),
			]),
		]);
		
		return linkTo('#!storeItem/' + index, holibirthdayRow(description, storeItem.imageSrc));
	};

	return stack({}, [
		confettiBackground(
			bodyColumn(
				holibirthdayRow(text('Holibirthday Store').all([
					fonts.ralewayThinBold,
					$css('font-size', 40),
				])))),
		bodyColumn(stack({
			gutterSize: separatorSize,
		}, storeItems.map(storeItemRow))),
	]);
});
