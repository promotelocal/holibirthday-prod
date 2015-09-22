define([
	'bar',
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'meP',
	'months',
	'profilesP',
	'separatorSize',
	'storiesP',
	'storyRowP',
	'submitButton',
], function (bar, bodyColumn, colors, confettiBackground, db, fonts, meP, months, profilesP, separatorSize, storiesP, storyRowP, submitButton) {
	return function (user) {
		return meP.then(function (me) {
			return profilesP.then(function (profiles) {
				var profile = profiles.filter(function (profile) {
					return profile.user === user;
				})[0];
				return storiesP.then(function (stories) {
					var profileStories = stories.filter(function (story) {
						return story.user === user;
					});
					return db.pointsChange.find({
						user: user,
					}).then(function (points) {
						var pointsTotal = points.reduce(function (a, p) {
							return a + p.amount;
						}, 0);

						var redBar = confettiBackground(bodyColumn(stack({}, [
							sideBySide({
								handleSurplusWidth: giveToSecond,
							}, [
								alignTBM({
									middle: image({
										src: profile.profileImageURL || './content/man.png',
										minWidth: 300,
										chooseHeight: 0,
									}),
								}),
								padding({
									left: 30,
									right: 30,
								}, alignTBM({
									middle: stack({
										gutterSize: separatorSize,
									}, [
										text(profile.firstName + ' ' + profile.lastName).all([
											fonts.ralewayThinBold,
											$css('font-size', 40),
										]),
										db.holibirthday.findOne({
											user: user,
										}).then(function (holibirthday) {
											var date = new Date(holibirthday.date);
											var humanReadableDate = months[date.getMonth()] + ' ' + date.getDate();
											return text('Holiborn on ' + humanReadableDate).all([
												fonts.ralewayThinBold,
												$css('font-size', 20),
											]);
										}, function () {
											return meP.then(function (me) {
												if (me && me._id === user) {
													return linkTo('#!myHolibirthday', text('(claim a holibirthday)').all([
														fonts.ralewayThinBold,
													]));
												}
												else {
													return nothing;
												}
											});
										}),
										text('Holibirthday Points: ' + pointsTotal).all([
											fonts.ralewayThinBold,
											$css('font-size', 20),
										]),
									])
								})).all([
									withMinWidth(300, true),
								]),
							]),
						])));

						var stories = bodyColumn(
							stack({
								gutterSize: separatorSize,
							}, Q.all(profileStories.map(storyRowP))));

						var points = pointsTotal === 0 ? nothing : bodyColumn(stack({
							gutterSize: separatorSize,
						}, [
							bar.horizontal(1, colors.middleGray),
							text('Holibirthday Points').all([
								fonts.ralewayThinBold,
								$css('font-size', 40),
							]),
							stack({
								gutterSize: separatorSize,
							}, points.map(function (point) {
								return sideBySide({
									handleSurplusWidth: giveToNth(1),
									gutterSize: separatorSize,
								}, [
									alignTBM({
										middle: text((point.amount >= 0) ? '+' + point.amount : point.amount).all([
											withFontColor(point.amount >= 0 ? colors.darkGreen : colors.darkRed),
											fonts.ralewayThinBold,
											$css('font-size', '30'),
										]),
									}),
									alignTBM({
										middle: paragraph(point.reason).all([
											fonts.ralewayThinBold,
											$css('font-size', '30'),
										]),
									}),
								]);
							})),
							bar.horizontal(1, colors.middleGray),
							sideBySide({
								gutterSize: separatorSize,
							}, [
								alignTBM({
									middle: text(pointsTotal >= 0 ? '+' + pointsTotal : pointsTotal).all([
										withFontColor(pointsTotal >= 0 ? colors.darkGreen : colors.darkRed),
										fonts.ralewayThinBold,
										$css('font-size', '30'),
									]),
								}),
								alignTBM({
									middle: text('Total').all([
										fonts.ralewayThinBold,
										$css('font-size', '30'),
									]),
								}),
							]),
						]));

						var editButton = (me && me._id === profile.user) ? alignLRM({
							middle: linkTo('#!editProfile/' + me._id, submitButton(text('Edit Profile').all([
								fonts.bebasNeue,
							]))),
						}) : nothing
						
						return stack({
							gutterSize: separatorSize,
						}, [
							redBar,
							stories,
							points,
							editButton,
						]);
					});
				});
			});
		});
	};
});
