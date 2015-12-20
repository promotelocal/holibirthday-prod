define([
	'bodyColumn',
	'categories',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'forms',
	'holibirthdayRow',
	'meP',
	'prettyForms',
	'separatorSize',
	'signInForm',
	'signInStream',
	'siteCopyItemsP',
], function (bodyColumn, categories, colors, confettiBackground, db, fonts, forms, holibirthdayRow, meP, prettyForms, separatorSize, signInForm, signInStream, siteCopyItemsP) {
	return function (story) {
		return promiseComponent(siteCopyItemsP.then(function (siteCopyItems) {
			return Q.all([
				story._id ? db.storyTag.find({
					story: story._id,
				}) : [],
			]).then(function (storyTagss) {
				var storyTags = storyTagss[0];
				var storyStreams = Stream.splitObject(story);
				var storyStream = Stream.combineObject(storyStreams);
				var tagsS = Stream.once(storyTags);
				var removedTags = [];

				var instructions = bodyColumn(padding(20, stack({
					gutterSize: separatorSize,
				}, [
					paragraph(siteCopyItems.find('Edit Story Title')).all([
						fonts.bebasNeue,
						$css('font-size', '60px'),
					]),
					paragraph(siteCopyItems.find('Edit Story Smaller Title')).all([
						fonts.ralewayThinBold,
						$css('font-size', '30px'),
					]),
					paragraph(siteCopyItems.find('Edit Story Instructions').split('\n').join('<br>')).all([
						fonts.ralewayThinBold,
					]),
				])));
				var labelsAll = [
					fonts.ralewayThinBold,
					$css('font-size', 30),
					$css('font-weight', 'bold'),
				];
				var storyForm = bodyColumn(padding(20, stack({
					gutterSize: separatorSize,
				}, [
					prettyForms.input({
						name: siteCopyItems.find('Edit Story Title Field'),
						fieldName: 'name',
						stream: storyStreams.name,
						labelAll: labelsAll,
					}),
					prettyForms.textarea({
						name: siteCopyItems.find('Edit Story Body Field'),
						fieldName: 'text',
						stream: storyStreams.text,
						labelAll: labelsAll,
					}),
					stack({}, [
						text(siteCopyItems.find('Edit Story Category Field')).all([
							fonts.ralewayThinBold,
						]).all(labelsAll),
						prettyForms.radios({
							fieldName: 'storyType',
							stream: storyStreams.storyType,
							labelAll: labelsAll,
							options: categories.map(function (c) {
								return {
									name: c,
									value: c.toLowerCase(),
								};
							}),
						}),
					]),
					promiseComponent(db.uniqueTag.find({}).then(function (uniqueTags) {
						var nextTagS = Stream.once('');
						var pushTag = function () {
							var tag = nextTagS.lastValue().replace(',','').toLowerCase();
							var tags = tagsS.lastValue().slice(0);
							if (tag.length > 0 && tags.filter(function (t) {
								return t.tag === tag;
							}).length === 0) {
								tags.push({
									tag: tag,
								});
								tagsS.push(tags);
							}
							nextTagS.push('');
						};
						return stack({}, [
							text(siteCopyItems.find('Edit Story Tags Field')).all(labelsAll),
							border(white, {
								all: 1,
							}, stack({}, [
								componentStream(tagsS.map(function (tags) {
									return grid({}, tags.map(function (tag, i) {
										return padding({
											all: separatorSize / 2,
										}, sideBySide({
											gutterSize: separatorSize / 4,
										}, [
											text(tag.tag).all([
												fonts.bebasNeue,
											]),
											alignTBM({
												middle: fonts.fa('close').all([
													$css('opacity', '0.8'),
													link,
													clickThis(function () {
														tags = tags.slice(0);
														removedTags.push(tags.splice(i, 1)[0]);
														tagsS.push(tags);
													}),
												]),
											}),
										]));
									}));
								})),
								padding({
									all: separatorSize / 2,
								}, sideBySide({
									gutterSize: separatorSize / 2,
									handleSurplusWidth: giveToSecond,
								}, [
									text(siteCopyItems.find('Edit Story Add Tag')).all([
										fonts.bebasNeue,
									]),
									dropdownPanel(forms.inputBox(nextTagS, 'text', 'tag', [
										fonts.bebasNeue,
									], true).all([
										keyupThis(function (ev) {
											if (ev.keyCode === 188 /* comma */) {
												pushTag();
											}
										}),
										keydownThis(function (ev) {
											if (ev.keyCode === 13 /* enter */) {
												pushTag();
												ev.stopPropagation();
												return false;
											}
											if (ev.keyCode === 9 /* tab */) {
												var tag = nextTagS.lastValue();
												var completeTag = uniqueTags.filter(function (t) {
													return t.tag.indexOf(tag) !== -1 && tagsS.lastValue().filter(function (tag) {
														return tag.tag === t.tag;
													}).length === 0;
												})[0];
												if (completeTag) {
													if (tag === completeTag.tag) {
														pushTag();
													}
													else {
														nextTagS.push(completeTag.tag);
													}
												}
												else {
													pushTag();
												}
												ev.stopPropagation();
												return false;
											}
										}),
									]), border(white, {
										all: 1,	
									}, componentStream(nextTagS.map(function (nextTag) {
										return stack({}, uniqueTags.filter(function (t) {
											return nextTag !== '' && t.tag.indexOf(nextTag) !== -1 && tagsS.lastValue().filter(function (tag) {
												return tag.tag === t.tag;
											}).length === 0;
										}).map(function (tag) {
											return padding({
												all: separatorSize / 2,
											}, text(tag.tag)).all([
												fonts.bebasNeue,
												link,
												clickThis(function () {
													nextTagS.push(tag.tag);
													pushTag();
												}),
												hoverThis(function (hovering, i) {
													var r = colorString(colors.holibirthdayRed);
													var w = colorString(white);
													i.$el.css('background-color', hovering ? w : r)
														.css('color', hovering ? r : w);
												}),
											]);
										}));
									}))).all([
										withBackgroundColor(colors.holibirthdayRed),
									]), nextTagS.map(function (v) {
										return v.length > 0;
									}), {
										transition: 'none',
									}),
								])),
							])),
						]);
					})),
					prettyForms.imageUpload({
						name: siteCopyItems.find('Edit Story Image URL Field'),
						labelAll: labelsAll,
						stream: storyStreams.imageUrl,
					}),
					paragraph(siteCopyItems.find('Edit Story Submit Instructions')).all([
						fonts.ralewayThinBold,
					]),
					alignLRM({
						left: prettyForms.submit(white, siteCopyItems.find('Edit Story Submit Story'), function () {
							var latestStory = storyStream.lastValue();
							var updateTags = function (story) {
								return Q.all(tagsS.lastValue().map(function (tag) {
									tag.story = story._id;
									if (!tag._id) {
										return db.storyTag.insert(tag);
									}
									return tag;
								}).concat(removedTags.filter(function (tag) {
									return tag._id;
								}).map(function (tag) {
									return db.storyTag.remove(tag);
								})));
							};
							if (latestStory._id) {
								return db.story.update({
									_id: latestStory._id,
								}, latestStory).then(function () {
									return updateTags(latestStory).then(function () {
										window.location.hash = '#!story/' + latestStory._id;
										window.location.reload();
									});
								});
							}
							else {
								return db.story.insert(latestStory).then(function (story) {
									return updateTags(story).then(function () {
										window.location.hash = '#!story/' + story._id;
										window.location.reload();
									});
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
					return stack({
						gutterSize: separatorSize,
					}, [
						confettiBackground(bodyColumn(holibirthdayRow(text(siteCopyItems.find('Edit Story Title')).all([
							fonts.h1,
						])))),
						bodyColumn(paragraph(siteCopyItems.find('Edit Story Must Sign In')).all([
							fonts.bebasNeue,
							$css('font-size', '30px'),
							link,
							clickThis(function (ev) {
								signInStream.push(true);
								ev.stopPropagation();
							}),
						])),
					]);
				});
			});
		}));
	};
});
