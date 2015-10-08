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
	'socialMedia',
	'socialMediaButton',
	'storiesP',
	'storyRowP',
	'submitButton',
], function (bar, bodyColumn, colors, confettiBackground, db, fonts, meP, months, profilesP, separatorSize, socialMedia, socialMediaButton, storiesP, storyRowP, submitButton) {
	return function (user) {
		return promiseComponent(meP.then(function (me) {
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
										src: profile.imageUrl || './content/man.png',
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
										collapseGutters: true,
									}, [
										text(profile.firstName + ' ' + profile.lastName).all([
											fonts.ralewayThinBold,
											$css('font-size', 40),
										]),
										profile.birthday ? text('Born on ' + moment(profile.birthday).format('MMMM Do')).all([
											fonts.ralewayThinBold,
											$css('font-size', 20),
										]) : nothing,
										promiseComponent(db.holibirthday.findOne({
											user: user,
										}).then(function (holibirthday) {
											if (holibirthday)
											{
												var date = new Date(holibirthday.date);
												return linkTo('#!holibirthday/' + holibirthday.user, text('Holiborn on ' + moment(date).format('MMMM Do') + ' (view certificate)').all([
													fonts.ralewayThinBold,
													$css('font-size', 20),
												]));
											}
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
										})),
										text('Holibirthday Points: ' + pointsTotal).all([
											fonts.ralewayThinBold,
											$css('font-size', 20),
										]),
										me ? text('Add Contact').all([
											fonts.ralewayThinBold,
											$css('font-size', 20),
											link,
											clickThis(function (ev, disable) {
												disable();
												db.contactOtherUser.insert({
													user: me._id,
													otherUser: user,
												}).then(function () {
													window.location.hash = '#!contacts';
													window.location.reload();
												});
											}),
										]) : nothing,
									])
								})).all([
									withMinWidth(300, true),
								]),
							]),
						])));

						var profileSocialMediaButton = socialMediaButton(function (verb) {
							return verb + (me && me._id === profile.user ? ' your profile' : ' this profile');
						});

						var shareButtons = bodyColumn(sideBySide({
							gutterSize: separatorSize,
						}, [
							profileSocialMediaButton(socialMedia.facebook),
							profileSocialMediaButton(socialMedia.twitter),
						]));


						var stories = bodyColumn(
							stack({
								gutterSize: separatorSize,
							}, profileStories.map(storyRowP)));

						var pointsC = pointsTotal === 0 ? nothing : bodyColumn(stack({
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
							middle: linkTo('#!editProfile/' + me._id, submitButton(black, text('Edit Profile').all([
								fonts.bebasNeue,
							]))),
						}) : nothing;
						
						return stack({
							gutterSize: separatorSize,
						}, [
							redBar,
							shareButtons,
							stories,
							pointsC,
							editButton,
						]);
					});
				});
			});
		}));
	};
});
