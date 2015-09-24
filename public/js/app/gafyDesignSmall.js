define([
	'colors',
	'fonts',
], function (colors, fonts) {
	return function (gafyDesign) {
		return border(colors.middleGray, {
			all: 1,
		}, stack({}, [
			alignLRM({
				middle: image({
					src: gafyDesign.imageUrl,
					chooseWidth: 0,
					minHeight: 200,
				}),
			}),
			padding({
				all: 10,
			}, alignLRM({
				middle: text(gafyDesign.designDescription).all([
					fonts.h2,
				]),
			})),
		])).all([
			withMinWidth(300, true),
		]);
	};
});
