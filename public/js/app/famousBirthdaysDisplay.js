define([
	'bodyColumn',
	'fonts',
	'separatorSize',
], function (bodyColumn, fonts, separatorSize) {
	return function (famousBirthdays) {
		return famousBirthdays.length > 0 ? bodyColumn(stack({
			gutterSize: separatorSize,
		}, [
			text('People with Nearby Birthdays').all([
				fonts.h1,
				fonts.ralewayThinBold,
			]),
			grid({
				gutterSize: separatorSize,
				handleSurplusWidth: evenSplitSurplusWidth,
			}, famousBirthdays.map(function (fb) {
				return stack({
					gutterSize: separatorSize,
				}, [
					text(fb.name).all([
						fonts.ralewayThinBold,
						$css('text-align', 'center'),
					]),
					text(moment(fb.birthday).format('MMMM Do')).all([
						fonts.ralewayThinBold,
						$css('text-align', 'center'),
					]),
					alignLRM({
						middle: image({
							src: fb.imageUrl,
							minWidth: 200,
						}),
					}),
				]);
			})),
		])) : nothing;
	};
});
