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
	'socialMedia',
	'socialMediaButton',
	'storiesP',
	'storyRowP',
	'submitButton',
	'writeOnImage',
], function (adminP, bar, bodyColumn, colors, confettiBackground, db, fonts, holibirthdayRow, holibirthdayView, meP, months, profilesP, separatorSize, socialMedia, socialMediaButton, storiesP, storyRowP, submitButton, writeOnImage) {
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
		return promiseComponent(meP.then(function (me) {
			return adminP.then(function (admin) {
				return profilesP.then(function (profiles) {
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
									profile.birthday ? text('Born on ' + moment(profile.birthday).utc().format('MMMM Do')).all([
										fonts.ralewayThinBold,
										$css('font-size', 20),
									]) : nothing,
									promiseComponent(pointsTotalP.then(function (pointsTotal) {
										return text('Holibirthday Points: ' + pointsTotal).all([
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
											return linkTo('#!contacts', text('My Contacts').all([
												fonts.ralewayThinBold,
												$css('font-size', 20),
											]));
										}
										return text('Add Contact').all([
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
							keepAspectRatio(promiseComponent(db.holibirthday.findOne({
								user: user,
							}).then(function (holibirthday) {
								if (profile.holibirther && holibirthday)
								{
									var date = new Date(holibirthday.date);
									return image({
										src: writeOnImage({
											width: 308,
											height: 200,
										}, './content/certificate-01-thumbnail.png', [{
											center: {
												x: 154,
												y: 88,
											},
											text: profile.firstName + ' ' + profile.lastName,
											font: 'bold 14px Raleway Thin',
										}, {
											center: {
												x: 154,
												y: 152,
											},
											text: moment(date).utc().format('MMMM Do'),
											font: 'bold 14px Raleway Thin',
										}].concat(profile.birthday ? [{
											center: {
												x: 46,
												y: 171,
											},
											text: 'Old Birthday',
											font: '6px BebasNeue',
										}, {
											center: {
												x: 46,
												y: 176,
											},
											text: moment(profile.birthday).utc().format('MMMM Do'),
											font: '6px BebasNeue',
										}] : [])),
										useNativeSize: true,
									}).all([
										link,
										clickThis(function (ev) {
											modalOnS.push(true);
											ev.stopPropagation();
										}),
									]);
								}
								return meP.then(function (me) {
									if (me && me._id === user) {
										return linkTo('#!myHolibirthday', alignTBM({
											middle: submitButton(white, text('claim a holibirthday').all([
												fonts.bebasNeue,
											])),
										}).all([
											fonts.ralewayThinBold,
										]));
									}
									else {
										return nothing;
									}
								});
							}))),
						]), profile.imageUrl || './content/man.png'),
					])));
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

					var profileSocialMediaButton = socialMediaButton(function (verb) {
						return verb + (me && me._id === profile.user ? ' your profile' : ' this profile');
					});
					var shareButtons = bodyColumn(sideBySide({
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
								linkTo('#!leaderboards', text('Holibirthday Points (view leaderboards)').all([
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
										middle: text('Total').all([
											fonts.ralewayThinBold,
											$css('font-size', '30'),
										]),
									}),
								]),
							]));
						});
					}));

					var editButton = admin || (me && me._id === profile.user) ? alignLRM({
						middle: linkTo('#!editProfile/' + user, submitButton(black, text('Edit Profile').all([
							fonts.bebasNeue,
						]))),
					}) : nothing;
					
					return stack({
						gutterSize: separatorSize,
					}, [
						redBar,
						shareButtons,
						storiesC,
						pointsC,
						editButton,
						holibirthdayModal,
					]);
				});
			});
		}));
	};
});
