define([
	'bodyColumn',
	'colors',
	'db',
	'fonts',
	'prettyForms',
	'separatorSize',
	'storiesP',
	'submitButton',
], function (bodyColumn, colors, db, fonts, prettyForms, separatorSize, storiesP, submitButton) {
	var dailyThemesEditor = db.dailyTheme.findOne({}).then(function (theme) {
		theme = theme || {};
		var dailyThemeStreams = {
			_id: Stream.once(theme._id || null),
			type: Stream.once(theme.type || schema.dailyTheme.fields.type.options.featuredStory),
			storyId: Stream.once(theme.storyId || null),
			storyText: Stream.once(theme.storyText || ''),
			giftId: Stream.once(theme.giftId || null),
			giftText: Stream.once(theme.giftText || ''),
			pollTitle: Stream.once(theme.pollTitle || ''),
			pollDescription: Stream.once(theme.pollDescription || ''),
			pollChoices: Stream.once(theme.pollChoices || ''),
			someTextTitle: Stream.once(theme.someTextTitle || ''),
			someTextText: Stream.once(theme.someTextText || ''),
		};
		var dailyThemeS = Stream.combineObject(dailyThemeStreams);

		var featuredStoryEditor = storiesP.then(function (stories) {
			return stack({
				gutterSize: separatorSize,
			}, [
				prettyForms.select({
					name: 'Story',
					fieldName: 'storyId',
					stream: dailyThemeStreams.storyId,
					options: stories.map(function (story) {
						return {
							name: story.name,
							value: story._id,
						};
					}),
				}),
				prettyForms.textarea({
					name: 'Description',
					fieldName: 'storyText',
					stream: dailyThemeStreams.storyText,
				}),
			]);
		});
		var featuredGiftEditor = stack({
			gutterSize: separatorSize,
		}, [
			prettyForms.select({
				name: 'Gift',
				fieldName: 'giftId',
				stream: dailyThemeStreams.giftId,
				options: storeItems.map(function (storeItem, index) {
					return {
						name: storeItem.name,
						value: index,
					};
				}),
			}),
			prettyForms.textarea({
				name: 'Description',
				fieldName: 'giftText',
				stream: dailyThemeStreams.giftText,
			}),
		]);
		var pollEditor = stack({
			gutterSize: separatorSize,
		}, [
			prettyForms.input({
				name: 'Poll Title',
				fieldName: 'pollTitle',
				stream: dailyThemeStreams.pollTitle,
			}),
			prettyForms.textarea({
				name: 'Description',
				fieldName: 'pollDescription',
				stream: dailyThemeStreams.pollDescription,
			}),
			prettyForms.plainTextarea({
				name: 'Choices (enter one per line)',
				fieldName: 'pollChoices',
				stream: dailyThemeStreams.pollChoices,
			}),
		]);
		var someTextEditor = stack({
			gutterSize: separatorSize,
		}, [
			prettyForms.input({
				name: 'Title',
				fieldName: 'someTextTitle',
				stream: dailyThemeStreams.someTextTitle,
			}),
			prettyForms.textarea({
				name: 'Text',
				fieldName: 'someTextText',
				stream: dailyThemeStreams.someTextText,
			}),
		]);
		
		var saveButton = alignLRM({
			left: submitButton(text('Publish')).all([
				link,
				clickThis(function () {
					var theme = dailyThemeS.lastValue()
					if (theme._id) {
						db.dailyTheme.update({
							_id: theme._id,
						}, theme).then(function () {
							window.location.hash = '#!';
							window.location.reload();
						});
					}
					else {
						db.dailyTheme.insert(theme).then(function () {
							window.location.hash = '#!';
							window.location.reload();
						});
					}
				}),
			]),
		});
		
		return stack({
			gutterSize: separatorSize,
		}, [
			text('Daily Theme').all([
				fonts.h1,
			]),
			prettyForms.select({
				name: 'Type',
				fieldName: 'type',
				stream: dailyThemeStreams.type,
				options: [{
					name: 'Featured Story',
					value: schema.dailyTheme.fields.type.options.featuredStory,
				}, {
					name: 'Featured Gift',
					value: schema.dailyTheme.fields.type.options.featuredGift,
				}, {
					name: 'Poll',
					value: schema.dailyTheme.fields.type.options.poll,
				}, {
					name: 'Some Text',
					value: schema.dailyTheme.fields.type.options.someText,
				}],
			}),
			componentStream(dailyThemeStreams.type.map(function (type) {
				switch (type) {
				case schema.dailyTheme.fields.type.options.featuredStory:
					return featuredStoryEditor;
				case schema.dailyTheme.fields.type.options.featuredGift:
					return featuredGiftEditor;
				case schema.dailyTheme.fields.type.options.poll:
					return pollEditor;
				case schema.dailyTheme.fields.type.options.someText:
					return someTextEditor;
				}
			})),
			saveButton,
		]);
	});
	
	var siteCopyEditor = db.dailyTheme.find({}).then(function (themes) {
		return text('Site Copy').all([
			fonts.h1,
		]);
	});

	var tab = function (name) {
		var body = padding({
			top: 10,
			bottom: 10,
			left: 10,
			right: 10,
		}, text(name).all([
			fonts.h3,
		]));
			
		return {
			left: border(colors.middleGray, {
				top: 1,
				left: 1,
			}, padding({
				left: 1,
				right: 2,
			}, body)),
			right: border(colors.middleGray, {
				top: 1,
				right: 1,
			}, padding({
				left: 2,
				right: 1,
			}, body)),
			selected: border(colors.middleGray, {
				top: 1,
				left: 1,
				right: 1,
			}, padding({
				all: 1,
			}, body)),
		};
	};
	var content = function (stuff) {
		return border(colors.middleGray, {
			all: 1,
		}, padding({
			all: separatorSize,
		}, stuff));
	};
	
	return bodyColumn(tabs([{
		tab: tab('Daily Theme'),
		content: content(dailyThemesEditor),
	}, {
		tab: tab('Site Copy (not implemented)'),
		content: content(siteCopyEditor),
	}]));
});
