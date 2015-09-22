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
		]), Q.all([c]).then(function (cs) {
			return cs[0].all([
				withFontColor(white),
			]);
		}));
	};
});
