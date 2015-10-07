define([
	'bodyColumn',
	'colors',
	'db',
	'fonts',
	'meP',
	'prettyForms',
	'separatorSize',
	'signInForm',
	'siteCopyItemsP',
], function (bodyColumn, colors, db, fonts, meP, prettyForms, separatorSize, signInForm, siteCopyItemsP) {
	return function (story) {
		return promiseComponent(siteCopyItemsP.then(function (siteCopyItems) {
			var storyStreams = Stream.splitObject(story);
			var storyStream = Stream.combineObject(storyStreams);

			var paragraphSeparator = text('&nbsp;');
			var postingGuidelines = stack({}, [
				text('When posting a story, make sure to pick a title that will engage the reader. Titles where you evoke emotion are always a strong choice (example: "This Story About _______ Will Make You Laugh").'),
				paragraphSeparator,
				text('To enlarge an image, click the image and drag one of the corners. Provide credit for all images, listing the original source beneath each image. For example, below the image, list in smaller font "Credit: (insert web address)."'),
				paragraphSeparator,
				text('If the inspiration for the story came from somewhere other than yourself, list the name of the source in the \'Credit\' eld and place its website address in the \'Link\' eld. If this is your own original story, list your name in the \'Credit\' eld and place the link to your Holibirthday prole in the \'Link\' eld.'),
				paragraphSeparator,
				text('PLEASE DO NOT POST SPAM, PORNOGRAPHIC MATERIALS, OR CONTENT FROM 3RD PARTIES THAT DOES NOT BELONG TO YOU. IF YOU WOULD LIKE TO SHARE AN ARTICLE FROM AN EXTERNAL SITE, PLEASE \'POST A STORY LINK.\''),
			]);

			var instructions = bodyColumn(padding(20, stack({
				gutterSize: separatorSize,
			}, [
				text(siteCopyItems.find('Edit Story Title')).all([
					$css('font-size', '60px'),
					fonts.bebasNeue,
				]),
				text(siteCopyItems.find('Edit Story Smaller Title')).all([
					$css('font-size', '30px'),
					fonts.ralewayThinBold,
				]),
				paragraph(siteCopyItems.find('Edit Story Instructions').split('\n').join('<br>')).all([
					fonts.ralewayThinBold,
				]),
			])));
			var labelsAll = [
				$css('font-size', 30),
				$css('font-weight', 'bold'),
			];
			var storyForm = bodyColumn(padding(20, stack({
				gutterSize: separatorSize,
			}, [
				prettyForms.input({
					name: 'Title',
					fieldName: 'name',
					stream: storyStreams.name,
					labelAll: labelsAll,
				}),
				prettyForms.textarea({
					name: 'Body',
					fieldName: 'text',
					stream: storyStreams.text,
					labelAll: labelsAll,
				}),
				stack({}, [
					text('Category').all([
						fonts.ralewayThinBold,
					]).all(labelsAll),
					prettyForms.radios({
						fieldName: 'storyType',
						stream: storyStreams.storyType,
						labelAll: labelsAll,
						options: [{
							name: 'Birthday',
							value: 'birthday',
						}, {
							name: 'Holiday',
							value: 'holiday',
						}, {
							name: 'Childhood',
							value: 'childhood',
						}, {
							name: 'Family',
							value: 'family',
						}, {
							name: 'College',
							value: 'college',
						}, {
							name: 'High School',
							value: 'highschool',
						}, {
							name: 'Workplace',
							value: 'workplace',
						}, {
							name: 'Catharsis',
							value: 'catharsis',
						}, {
							name: 'Humor',
							value: 'humor',
						}],
					}),
				]),
				prettyForms.imageUpload({
					name: 'Upload Image',
					labelAll: labelsAll,
					stream: storyStreams.imageUrl,
				}),
				text(siteCopyItems.find('Edit Story Submit Instructions')).all([
					fonts.ralewayThinBold,
				]),
				alignLRM({
					left: prettyForms.submit(white, 'Submit Story', function () {
						var latestStory = storyStream.lastValue();
						if (latestStory._id) {
							db.story.update({
								_id: latestStory._id,
							}, latestStory).then(function () {
								window.location.hash = '#!story/' + latestStory._id;
								window.location.reload();
							});
						}
						else {
							db.story.insert(latestStory).then(function (story) {
								window.location.hash = '#!story/' + story._id;
								window.location.reload();
							});
						}
					}),
				}),
			]))).all([
				withBackgroundColor(colors.holibirthdayRed),
				withFontColor(white),
			]);
			
			return meP.then(function (me) {
				if (me) {
					return stack({}, [
						form.all([
							child(stack({}, [
								stack({}, [
									instructions,
									storyForm,
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
						]),
					]);
				}
				return bodyColumn(stack({
					gutterSize: separatorSize,
				}, [
					paragraph('You must sign in to post a story').all([
						$css('font-size', '30px'),
						fonts.bebasNeue,
					]),
					signInForm(),
				]));
			});
		}));
	};
});
