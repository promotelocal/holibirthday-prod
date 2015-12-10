define([
	'adminP',
	'bar',
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'holibirthdayView',
	'meP',
	'months',
	'profilesP',
	'separatorSize',
	'siteCopyItemsP',
	'socialMedia',
	'socialMediaButton',
	'storiesP',
	'storyRowP',
	'submitButton',
	'writeOnImage',
], function (adminP, bar, bodyColumn, colors, confettiBackground, db, fonts, holibirthdayRow, holibirthdayView, meP, months, profilesP, separatorSize, siteCopyItemsP, socialMedia, socialMediaButton, storiesP, storyRowP, submitButton, writeOnImage) {
	return function (route) {
		var index = route.indexOf('/');
		var user = (index === -1) ? route : route.substring(0, index);
		var modalOnS = Stream.once(index !== -1);
		$('body').on('click', function () {
			modalOnS.push(false);
		});
		var first = false;
		modalOnS.map(function (on) {
			if (first) {
				ignoreHashChange = true;
				window.location.hash = '#!user/' + user + (on ? '/certificate' : '');
			}
			first = true;
		});
		var asRoot = function (config) {
			return function (c) {
				return div.all([
					child(c),
					wireChildren(function (instance, context) {
						instance.minWidth.push(0);
						instance.minHeight.push(0);
						return [{
							top: Stream.combine([
								context.top,
								context.scroll,
							], function (top, scroll) {
								return config.top(top - scroll);
							}),
							left: Stream.combine([
								context.left,
								context.leftAccum,
							], function (left, leftAccum) {
								return config.left(left + leftAccum);
							}),
							width: windowWidth,
							height: windowHeight,
						}];
					}),
				]);
			};
		};
		var holibirthdayModal = asRoot({
			top: function (top) {
				return -top;
			},
			left: function (left) {
				return -left;
			},
		})(overlays([
			nothing.all([
				withBackgroundColor(color({
					a: 0.5,
				})),
			]),
			padding({
				all: separatorSize,
			}, holibirthdayView(user)),
		]).all([
			$css('transition', 'opacity 0.5s'),
			function (instance) {
				modalOnS.map(function (on) {
					instance.$el.css('z-index', on ? 1000 : -1);
					instance.$el.css('display', on ? '' : 'none');
				});
			},
		]));
		return promiseComponent(db.holibirthday.findOne({
			user: user,
		}).then(function (holibirthday) {
			return meP.then(function (me) {
				return adminP.then(function (admin) {
					return profilesP.then(function (profiles) {
						return siteCopyItemsP.then(function (copy) {
							var profile = profiles.filter(function (profile) {
								return profile.user === user;
							})[0];
							var pointsP = db.pointsChange.find({
								user: user,
							});
							var pointsTotalP = pointsP.then(function (points) {
								return points.reduce(function (a, p) {
									return a + p.amount;
								}, 0);
							});
							var redBar = confettiBackground(bodyColumn(stack({}, [
								holibirthdayRow(grid({
									gutterSize: separatorSize,
									useFullWidth: true,
									handleSurplusWidth: giveToFirst,
								}, [
									alignTBM({
										middle: stack({
											gutterSize: separatorSize / 2,
											collapseGutters: true,
										}, [
											paragraph(profile.firstName + ' ' + profile.lastName).all([
												fonts.ralewayThinBold,
												$css('font-size', 40),
											]),
											profile.birthday ? text(copy.find('Profile Born On (include space)') + moment(profile.birthday).utc().format('MMMM Do')).all([
												fonts.ralewayThinBold,
												$css('font-size', 20),
											]) : nothing,
											promiseComponent(pointsTotalP.then(function (pointsTotal) {
												return text(copy.find('Profile Holibirthday Points (include space)') + pointsTotal).all([
													fonts.ralewayThinBold,
													$css('font-size', 20),
												]);
											})),
											me ? promiseComponent(db.contactOtherUser.findOne({
												user: me._id,
												otherUser: user,
											}).then(function (cou) {
												if (cou) {
													return nothing;
												}
												else if (me._id === user) {
													return linkTo('#!contacts', text(copy.find('Profile My Contacts')).all([
														fonts.ralewayThinBold,
														$css('font-size', 20),
													]));
												}
												return text(copy.find('Profile Add Contact')).all([
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
												]);
											})) : nothing,
										]),
									}),
									keepAspectRatio((profile.holibirther && holibirthday) ? image({
										src: writeOnImage({
											width: 308,
											height: 200,
										}, './content/certificate-new-thumbnail.png', [{
											center: {
												x: 133,
												y: 75,
											},
											text: profile.firstName + ' ' + profile.lastName,
											font: 'bold 9px Raleway Thin',
										}, {
											center: {
												x: 86,
												y: 89,
											},
											text: moment(new Date(holibirthday.date)).utc().format('MMMM Do'),
											font: 'bold 9px Raleway Thin',
										}, {
											center: {
												x: 141,
												y: 100,
											},
											text: moment(profile.birthday).utc().format('MMMM Do'),
											font: 'bold 9px Raleway Thin',
										}, {
											center: {
												x: 170,
												y: 158,
											},
											text: moment(holibirthday.updateDate.birthday).utc().format('MMMM Do'),
											font: 'bold 9px Raleway Thin',
										}]),
										useNativeSize: true,
									}).all([
										link,
										clickThis(function (ev) {
											modalOnS.push(true);
											ev.stopPropagation();
										}),
									]) : ((me && me._id === user) ? linkTo('#!myHolibirthday', alignTBM({
										middle: submitButton(white, text(copy.find('Profile Claim a Holibirthday')).all([
											fonts.bebasNeue,
										])),
									}).all([
										fonts.ralewayThinBold,
									])) : nothing)),
								]), profile.imageUrl || './content/man.png'),
							])));
							var bio = bodyColumn(paragraph(profile.bio));
							var storiesC = promiseComponent(storiesP.then(function (stories) {
								var profileStories = stories.filter(function (story) {
									return story.user === user;
								});
								
								return bodyColumn(stack({
									gutterSize: separatorSize,
								}, profileStories.map(storyRowP))).all([
									withMinWidth(0),
									withMinHeight(0),
								]);
							}));

							var caption = (profile.holibirther && holibirthday) ?
								copy.find('Profile Holiborn On (include space)') +
								moment(new Date(holibirthday.date)).utc().format('MMMM Do') :
								(profile.birthday ?
								 copy.find('Profile Born On (include space)') +
								 moment(profile.birthday).utc().format('MMMM Do') : 'Holibirthday');
							
							var profileSocialMediaButton = socialMediaButton(function (verb) {
								return verb + (me && me._id === profile.user ? ' your profile' : ' this profile');
							}, {
								imageUrl: profile.imageUrl,
								name: profile.firstName + ' ' + profile.lastName,
								text: caption,
								description: $(profile.bio).text(),
							});
							var shareButtons = bodyColumn(grid({
								gutterSize: separatorSize,
							}, [
								profileSocialMediaButton(socialMedia.facebook),
								profileSocialMediaButton(socialMedia.twitter),
							]));


							var pointsC = promiseComponent(pointsP.then(function (points) {
								return pointsTotalP.then(function (pointsTotal) {
									return pointsTotal === 0 ? nothing : bodyColumn(stack({
										gutterSize: separatorSize,
									}, [
										bar.horizontal(1, colors.middleGray),
										linkTo('#!leaderboards', paragraph(copy.find('Profile Holibirthday Points / View Leaderboards')).all([
											fonts.ralewayThinBold,
											$css('font-size', 40),
										])),
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
												middle: text(pointsTotal >= 0 ? '' + pointsTotal : pointsTotal).all([
													withFontColor(pointsTotal >= 0 ? colors.darkGreen : colors.darkRed),
													fonts.ralewayThinBold,
													$css('font-size', '30'),
												]),
											}),
											alignTBM({
												middle: text(copy.find('Profile Holibirthday Points Total')).all([
													fonts.ralewayThinBold,
													$css('font-size', '30'),
												]),
											}),
										]),
									]));
								});
							}));

							var editButton = admin || (me && me._id === profile.user) ? alignLRM({
								middle: linkTo('#!editProfile/' + user, submitButton(black, text(copy.find('Profile Edit')).all([
									fonts.bebasNeue,
								]))),
							}) : nothing;
							
							return stack({
								gutterSize: separatorSize,
							}, [
								redBar,
								bio,
								shareButtons,
								storiesC,
								pointsC,
								editButton,
								holibirthdayModal,
							]);
						});
					});
				});
			});
		}));
	};
});
