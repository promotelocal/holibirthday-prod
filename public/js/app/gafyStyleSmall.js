define([
	'colors',
	'fonts',
], function (colors, fonts) {
	return function (gafyStyle) {
		return border(colors.middleGray, {
			all: 1,
		}, stack({}, [
			alignLRM({
				middle: image({
					src: gafyStyle.imageUrl || './content/man.png',
					chooseWidth: 0,
					minHeight: 200,
				}),
			}),
			padding({
				all: 10,
			}, alignLRM({
				middle: text(gafyStyle.styleDescription).all([
					fonts.h2,
				]),
			})),
		])).all([
			withMinWidth(300, true),
		]);
	};
});
