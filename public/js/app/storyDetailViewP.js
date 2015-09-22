define([
	'bar',
	'bodyColumn',
	'confettiBackground',
	'db',
	'fonts',
	'forms',
	'meP',
	'prettyForms',
	'profilesP',
	'separatorSize',
	'socialMedia',
	'submitButton',
], function (bar, bodyColumn, confettiBackground, db, fonts, forms, meP, prettyForms, profilesP, separatorSize, socialMedia, submitButton) {
	var storyCommentViewP = function (story) {
		return meP.then(function (me) {
			if (!me) {
				return text('Sign in to comment').all([
					fonts.bebasNeue,
				]);
			}
			
			var comment = {
				user: me._id,
				story: story._id,
				text: '',
			};
			var commentStreams = Stream.splitObject(comment);
			var commentStream = Stream.combineObject(commentStreams);

			var latestComment;
			commentStream.onValue(function (comment) {
				latestComment = comment;
			});
			
			return form.all([
				child(stack({}, [
					stack({}, [
						forms.plainTextareaBox(commentStreams.text, 'text').all([
							$prop('rows', 6),
						]),
						alignLRM({
							left: prettyForms.submit('Post Comment', function () {
								db.comment.insert(latestComment).then(function (story) {
									window.location.reload();
								});
							}),
						}),
					].map(function (c) {
						return padding({
							top: 10,
						}, c);
					})),
				])),
				wireChildren(function (instance, context, i) {
					i.minHeight.pushAll(instance.minHeight);
					i.minWidth.pushAll(instance.minWidth);
					return [context];
				}),
			]);
		});
	};

	var storyCommentsViewP = function (story) {
		return db.comment.find({
			story: story._id,
		}).then(function (comments) {
			comments.sort(function (c1, c2) {
				return new Date(c2.createDate).getTime() - new Date(c1.createDate).getTime();
			});
			return profilesP.then(function (profiles) {
				return stack({
					gutterSize: separatorSize * 2,
				}, comments.map(function (comment) {
					var profile = profiles.filter(function (profile) {
						return profile.user === comment.user;
					})[0];
					return sideBySide({
						handleSurplusWidth: giveToNth(2),
						gutterSize: separatorSize,
					}, [
						linkTo('#!user/' + profile.user, stack({
							gutterSize: separatorSize,
						}, [
							image({
								src: profile.profileImageURL || './content/man.png',
								minWidth: 100,
								chooseHeight: true,
							}),
							text(profile.firstName + ' ' + profile.lastName),
						])),
						border(black, {
							all: 1,
						}, padding(10, text(comment.text))).all([
							withBackgroundColor(white),
						]),
					]);
				}));
			});
		});
	};

	return function (story, editable) {
		return profilesP.then(function (profiles) {
			var profile = profiles.filter(function (p) {
				return p.user === story.user;
			})[0];
			var socialMediaButton = function (sm) {
				return border(sm.color, {
					all: 2,
					radius: 2,
				}, padding(10, sideBySide({
					gutterSize: separatorSize,
				},[
					text(sm.icon),
					text(sm.shareVerb + ' this story').all([
						fonts.bebasNeue,
					]),
				]))).all([
					link,
					withFontColor(sm.color),
					clickThis(function () {
						sm.shareThisPage();
					}),
				]);
			};

			return meP.then(function (me) {
				return stack({
					gutterSize: separatorSize,
				}, [
					confettiBackground(bodyColumn(grid({
						handleSurplusWidth: giveToSecond,
					}, [
						alignTBM({
							middle: image({
								src: story.imageUrl || './content/man.png',
								minWidth: 300,
								chooseHeight: 0,
							}),
						}),
						alignTBM({
							middle: padding({
								left: 30,
								right: 30,
							}, stack({}, [
								text(story.name).all([
									fonts.ralewayThinBold,
									$css('font-size', 40),
								]),
								linkTo('#!user/' + profile.user, padding({
									top: 10,
								}, text('by ' + profile.firstName + ' ' + profile.lastName).all([
									fonts.ralewayThinBold,
								]))),
							]))
						}).all([
							withMinWidth(300, true),
						]),
					]))),
					bodyColumn(stack({}, [
						div.all([
							componentName('story-detail-text'),
							function (instance) {
								var $text = $(story.text);
								$text.find('div').css('position', 'initial');
								$text.appendTo(instance.$el);
								instance.updateDimensions();
							},
						]),
					])),
					bodyColumn(sideBySide({
						gutterSize: separatorSize,
					}, [
						socialMediaButton(socialMedia.facebook),
						socialMediaButton(socialMedia.twitter),
					])),
					bodyColumn(storyCommentViewP(story)),
					bodyColumn(storyCommentsViewP(story)),
					(me && me._id === story.user) ? alignLRM({
						middle: linkTo('#!editStory/' + story._id, submitButton(text('Edit Story').all([
							fonts.bebasNeue,
						]))),
					}) : nothing,
				]);
			});
		});
	};
});
