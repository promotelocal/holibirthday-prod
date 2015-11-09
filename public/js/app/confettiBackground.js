define([
	'colors',
	'domain',
], function (colors, domain) {
	return function (c) {
		return withBackground(alignLRM({
			right: image({
				src: domain + '/content/confetti.png',
				chooseWidth: 1,
			}),
		}).all([
			withBackgroundColor(colors.holibirthdayRed),
		]), c.all([
			withFontColor(white),
		]));
	};
});
