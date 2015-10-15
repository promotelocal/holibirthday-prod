define([
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
], function (bodyColumn, confettiBackground, fonts, holibirthdayRow, separatorSize) {
	return promiseComponent(db.find)
	return confettiBackground(bodyColumn(holibirthdayRow(stack({
		gutterSize: separatorSize,
	}, [
		text('Holibirthday Leaderboards').all([
			fonts.h1,
			fonts.ralewayThinBold,
		]),
	]))));
});
