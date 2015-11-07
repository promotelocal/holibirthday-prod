define([
	'bodyColumn',
	'colors',
	'db',
	'fonts',
	'meP',
	'prettyForms',
	'separatorSize',
	'signInForm',
	'signInStream',
	'siteCopyItemsP',
], function (bodyColumn, colors, db, fonts, meP, prettyForms, separatorSize, signInForm, signInStream, siteCopyItemsP) {
	return function (story) {
		return promiseComponent(siteCopyItemsP.then(function (siteCopyItems) {
			var storyStreams = Stream.splitObject(story);
			var storyStream = Stream.combineObject(storyStreams);

			var paragraphSeparator = text('&nbsp;');

			var instructions = bodyColumn(padding(20, stack({
				gutterSize: separatorSize,
			}, [
				text(siteCopyItems.find('Edit Story Title')).all([
					fonts.bebasNeue,
					$css('font-size', '60px'),
				]),
				text(siteCopyItems.find('Edit Story Smaller Title')).all([
					fonts.ralewayThinBold,
					$css('font-size', '30px'),
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
							wireChildren(passThroughToFirst),
						]),
					]);
				}
				return bodyColumn(stack({
					gutterSize: separatorSize,
				}, [
					text(siteCopyItems.find('Edit Story Title')).all([
						fonts.bebasNeue,
						$css('font-size', '60px'),
					]),
					paragraph('You must sign in to post a story').all([
						fonts.bebasNeue,
						$css('font-size', '30px'),
						link,
						clickThis(function (ev) {
							signInStream.push(true);
							ev.stopPropagation();
						}),
					]),
				]));
			});
		}));
	};
});
