define([
	'colors',
], function (colors) {
	return function (c) {
		return withBackground(alignLRM({
			right: image({
				src: '/content/confetti.png',
				chooseWidth: 1,
			}),
		}).all([
			withBackgroundColor(colors.holibirthdayRed),
		]), c.all([
			withFontColor(white),
		]));
	};
});
