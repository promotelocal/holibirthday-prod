define([
	'colors',
	'db',
	'fonts',
	'holibirthdayRow',
	'meP',
	'prettyForms',
	'separatorSize',
	'submitButton',
], function (colors, db, fonts, holibirthdayRow, meP, prettyForms, separatorSize, submitButton) {
	return promiseComponent(db.dailyTheme.find({}).then(function (themes) {
		var theme = themes.sort(function (t1, t2) {
			return t1.updateDate.getTicks() - t2.updateDate.getTicks();
		})[0];
		if (!theme) {
			return holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text('Holibirthday').all([
					fonts.ralewayThinBold,
					fonts.h1,
				]),
			]));
		}
		switch (theme.type) {
		case 'featuredStory':
			return db.story.findOne({
				_id: theme.storyId,
			}).then(function (story) {
				return db.profile.findOne({
					user: story.user,
				}).then(function (profile) {
					return linkTo('#!story/' + story._id, holibirthdayRow(stack({
						gutterSize: separatorSize,
					}, [
						text(story.name).all([
							fonts.ralewayThinBold,
							fonts.h1,
						]),
						linkTo('#!user/' + profile.user, text(profile.firstName + ' ' + profile.lastName).all([
							fonts.ralewayThinBold,
							fonts.h3,
						])),
						paragraph(theme.storyText).all([
							fonts.ralewayThinBold,
						]),
					]), story.imageUrl));
				});
			});
		case 'featuredGift':
			var gift = storeItems[theme.giftId];
			return linkTo("#!gift/" + theme.giftId, holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text(gift.name).all([
					fonts.h1,
				]),
				text(theme.giftText).all([
					fonts.h3,
				]),
			]), gift.imageSrc));
		case 'poll':
			var choiceStream = Stream.create();
			var pollResponseS = Stream.once(null);
			return promiseComponent(db.dailyThemePollResponse.find({
				dailyTheme: theme._id,
			}).then(function (pollResponses) {
				var pollResponsesS = Stream.once(pollResponses);
				return componentStream(pollResponsesS.map(function (pollResponses) {
					meP.then(function (me) {
						if (me) {
							var myPollResponse = pollResponses.filter(function (r) {
								return r.user === me._id;
							})[0];
							if (myPollResponse) {
								pollResponseS.push(myPollResponse);
							}
						}
					});
					var resultBarHeight = 50;
					var scores = theme.pollChoices.map(function (choice) {
						return pollResponses.filter(function (response) {
							return response.choice === choice;
						}).length;
					});
					var totalScore = Math.max(1, scores.reduce(function (a, b) {
						return a + b;
					}, 0));
					var percentages = scores.map(function (score) {
						return score / totalScore;
					});
					var displayResults = theme.pollChoices.map(function (choice, i) {
						return {
							name: choice,
							percentage: percentages[i],
							total: scores[i],
						};
					});
					displayResults.sort(function (a, b) {
						return b.percentage - a.percentage;
					});
					var pollResults = border(white, {
						all: 1,
					}, padding({
						all: separatorSize,
					}, sideBySide({
						gutterSize: separatorSize,
						handleSurplusWidth: giveToSecond,
					}, [
						stack({
							gutterSize: separatorSize,
						}, displayResults.map(function (displayResult) {
							return alignTBM({
								middle: text(displayResult.name).all([
									fonts.ralewayThinBold,
								]),
							}).all([
								withMinHeight(resultBarHeight, true),
							]);
						})),
						stack({
							gutterSize: separatorSize,
						}, displayResults.map(function (displayResult) {
							return withBackground(div.all([
								child(nothing.all([
									withBackgroundColor(colors.holibirthdayDarkRed),
								])),
								wireChildren(function (instance, context) {
									instance.minWidth.push(0);
									instance.minHeight.push(0);
									return [{
										top: Stream.once(0),
										left: Stream.once(0),
										width: context.width.map(function (w) {
											return w * displayResult.percentage;
										}),
										height: context.height,
									}];
								}),
							]), alignTBM({
								middle: padding({
									all: 10,
								}, text(Math.round(displayResult.percentage * 100) + '% (' + displayResult.total + ')').all([
									fonts.ralewayThinBold,
								])),
							}).all([
								withMinHeight(resultBarHeight, true),
							]));
						})),
					])));
					var pollVote = stack({
						gutterSize: separatorSize,
					}, [
						prettyForms.radios({
							options: theme.pollChoices.map(function (choice) {
								return {
									name: choice,
									value: choice,
								};
							}),
							stream: choiceStream,
						}),
						promiseComponent(meP.then(function (me) {
							if (me) {
								return alignLRM({
									left: submitButton(text('Vote (or Abstain)').all([
										fonts.bebasNeue,
									])).all([
										link,
										clickThis(function () {
											db.dailyThemePollResponse.insert({
												user: me._id,
												dailyTheme: theme._id,
												choice: choiceStream.lastValue(),
											}).then(function (response) {
												pollResponseS.push(response);
												pollResponsesS.push(pollResponses.concat([response]));
											});
										}),
									]),
								});
							}
							else {
								return alignLRM({
									left: submitButton(text('Sign in to vote').all([
										fonts.bebasNeue,
									])),
								});
							}
						})),
					]);
					return holibirthdayRow(stack({
						gutterSize: separatorSize,
					}, [
						text(theme.pollTitle).all([
							fonts.h1,
						]),
						text(theme.pollDescription).all([
							fonts.h2,
						]),
						componentStream(pollResponseS.map(function (pollResponse) {
							if (pollResponse) {
								return pollResults;
							}
							else {
								return pollVote;
							}
						})),
					]), theme.pollImage);
				}));
			}));
		case 'someText':
			return holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text(theme.someTextTitle).all([
					fonts.h1,
				]),
				paragraph(theme.someTextText).all([
					fonts.h3,
				]),
			]), theme.someTextImage);
		default:
			return holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text('Holibirthday').all([
					fonts.ralewayThinBold,
					fonts.h1,
				]),
			]));
		}
	}));
});