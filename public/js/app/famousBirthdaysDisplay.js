define([
	'bodyColumn',
	'fonts',
	'separatorSize',
], function (bodyColumn, fonts, separatorSize) {
	return function (famousBirthdays) {
		return famousBirthdays.length > 0 ? bodyColumn(stack({
			gutterSize: separatorSize,
		}, [
			text('People with the Same Birthday').all([
				fonts.h1,
				fonts.ralewayThinBold,
			]),
			grid({
				gutterSize: separatorSize,
				handleSurplusWidth: evenSplitSurplusWidth,
			}, famousBirthdays.map(function (fb) {
				return linkTo('https://www.google.com/search?q=' + encodeURIComponent(fb.name), stack({
					gutterSize: separatorSize,
				}, [
					text(fb.name).all([
						fonts.ralewayThinBold,
						$css('text-align', 'center'),
					]),
					alignLRM({
						middle: image({
							src: fb.imageUrl,
							minWidth: 200,
						}),
					}),
				])).all([
					$prop('target', '_blank'),
				]);
			})),
		])) : nothing;
	};
});
