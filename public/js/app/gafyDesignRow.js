define([
	'fonts',
	'separatorSize',
], function (fonts, separatorSize) {
	return function (gafyDesign) {
		return grid({
			handleSurplusWidth: giveToSecond,
		}, [
			alignTBM({
				middle: image({
					src: gafyDesign.imageUrl,
					minWidth: 300,
					chooseHeight: 0,
				}),
			}),
			alignTBM({
				middle: padding({
					left: 30,
					right: 30,
				}, stack({
					gutterSize: separatorSize,
				}, [
					text(gafyDesign.designDescription).all([
						fonts.ralewayThinBold,
						$css('font-size', 40),
					]),
				])).all([
					withMinWidth(300, true),
				]),
			}),
		]);
	};
});
