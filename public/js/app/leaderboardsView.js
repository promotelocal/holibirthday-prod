define([
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
], function (bodyColumn, colors, confettiBackground, db, fonts, holibirthdayRow, separatorSize) {
	return promiseComponent(db.pointsTotal.find({}).then(function (pts) {
		return db.profile.find({
			$or: pts.map(function (pt) {
				return pt.user;
			}),
		}).then(function (profiles) {
			return stack({
				gutterSize: separatorSize,
			}, [
				confettiBackground(bodyColumn(holibirthdayRow(stack({
					gutterSize: separatorSize,
				}, [
					paragraph('Holibirthday Leaderboards').all([
						fonts.h1,
						fonts.ralewayThinBold,
					]),
				])))),
				bodyColumn(alignLRM({
					middle: stack({
						gutterSize: separatorSize,
						collapseGutters: true,
					}, pts.sort(function (pt1, pt2) {
						return pt2.amount - pt1.amount;
					}).map(function (pt) {
						var profile = profiles.filter(function (p) {
							return p.user === pt.user;
						})[0];
						return profile ? linkTo('#!user/' + profile.user, sideBySide({
							gutterSize: separatorSize,
							handleSurplusWidth: giveToSecond,
						}, [
							alignTBM({
								middle: text('' + pt.amount).all([
									withFontColor(colors.darkGreen),
									fonts.ralewayThinBold,
									fonts.h2,
								]),
							}).all([
								withMinWidth(100, true),
							]),
							alignTBM({
								middle: paragraph(profile.firstName + ' ' + profile.lastName).all([
									fonts.ralewayThinBold,
									fonts.h2,
								]),
							}),
						])) : nothing;
					})),
				})),
			]);
		});
	}));
});
