define([
	'adminP',
	'areYouSure',
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
	'signInStream',
	'siteCopyItemsP',
	'socialMedia',
	'socialMediaButton',
	'submitButton',
], function (adminP, areYouSure, bar, bodyColumn, confettiBackground, db, fonts, forms, meP, prettyForms, profilesP, separatorSize, signInStream, siteCopyItemsP, socialMedia, socialMediaButton, submitButton) {
	var storyCommentViewP = function (story) {
		return promiseComponent(meP.then(function (me) {
			return siteCopyItemsP.then(function (copy) {
				if (!me) {
					return text(copy.find('Story Comment Sign In')).all([
						fonts.bebasNeue,
						link,
						clickThis(function (ev) {
							signInStream.push(true);
							ev.stopPropagation();
						}),
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
								left: prettyForms.submit(black, copy.find('Story Comment Post'), function () {
									db.comment.insert(latestComment).then(function () {
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
		}));
	};

	var storyCommentsViewP = function (story) {
		return promiseComponent(db.comment.find({
			story: story._id,
		}).then(function (comments) {
			comments.sort(function (c1, c2) {
				return new Date(c2.createDate).getTime() - new Date(c1.createDate).getTime();
			});
			return profilesP.then(function (profiles) {
				return adminP.then(function (admin) {
					return siteCopyItemsP.then(function (copy) {
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
								stack({
									gutterSize: separatorSize,
									collapseGutters: true,
								}, [
									linkTo('#!user/' + profile.user, image({
										src: profile.profileImageURL || './content/man.png',
										minWidth: 100,
										chooseHeight: true,
									})),
									linkTo('#!user/' + profile.user, text(profile.firstName + ' ' + profile.lastName)),
									admin ? text(copy.find('Story Comment Delete')).all([
										link,
										clickThis(function (ev) {
											ev.stopPropagation();
											areYouSure({
												onYes: function () {
													db.comment.remove({
														_id: comment._id,
													}).then(function () {
														window.location.reload();
													});
												},
											});
										}),
									]) : nothing,
								]),
								border(black, {
									all: 1,
								}, padding(10, text(comment.text))).all([
									withBackgroundColor(white),
								]),
							]);
						}));
					});
				});
			});
		}));
	};

	return function (story) {
		return promiseComponent(profilesP.then(function (profiles) {
			var profile = profiles.filter(function (p) {
				return p.user === story.user;
			})[0];
			var storySocialMediaButton = socialMediaButton(function (verb) {
				return verb + ' this story';
			}, {
				imageUrl: story.imageUrl,
				name: story.name,
				text: 'by ' + profile.firstName + ' ' + profile.lastName,
				description: $(story.text).text(),
			});
			return meP.then(function (me) {
				return adminP.then(function (admin) {
					return siteCopyItemsP.then(function (copy) {
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
									}, stack({
										gutterSize: separatorSize / 2,
									}, [
										paragraph(story.name, 150).all([
											fonts.h1,
										]),
										linkTo('#!user/' + profile.user, paragraph(copy.find('Story By (include a space)') + profile.firstName + ' ' + profile.lastName).all([
											fonts.h2,
										])),
										story.storyType ? text(copy.find('Story Category (include a space)') + story.storyType).all([
											fonts.h3,
										]) : nothing,
										promiseComponent(db.storyTag.find({
											story: story._id,
										}).then(function (storyTags) {
											return storyTags.length > 0 ? sideBySide({
												handleSurplusWidth: giveToSecond,
											}, [
												text(copy.find('Story Tags (include a space)')).all([
													fonts.h3,
												]),
												grid({
													gutterSize: separatorSize / 2,
													useFullWidth: true,
												}, storyTags.map(function (t) {
													return text(t.tag).all([
														fonts.h3,
													]);
												})),
											]) : nothing;
										})),
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
							bodyColumn(grid({
								gutterSize: separatorSize,
							}, [
								storySocialMediaButton(socialMedia.facebook),
								storySocialMediaButton(socialMedia.twitter),
							])),
							bodyColumn(storyCommentViewP(story)),
							bodyColumn(storyCommentsViewP(story)),
							bodyColumn(admin || (me && me._id === story.user) ? alignLRM({
								left: sideBySide({
									gutterSize: separatorSize,
								}, [
									linkTo('#!editStory/' + story._id, submitButton(black, text(copy.find('Story Edit')).all([
										fonts.bebasNeue,
									]))),
									submitButton(black, text(copy.find('Story Delete')).all([
										fonts.bebasNeue,
									])).all([
										link,
										clickThis(function () {
											return areYouSure({
												onYes: function () {
													db.story.remove({
														_id: story._id,
													}).then(function () {
														window.location.hash = '#!';
														window.location.reload();
													});
												}
											});
										}),
									]),
								]),
							}) : nothing),
						]);
					});
				});
			});
		}));
	};
});
