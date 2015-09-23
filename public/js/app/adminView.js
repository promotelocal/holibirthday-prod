define([
	'bar',
	'bodyColumn',
	'colors',
	'db',
	'defaultFormFor',
	'fonts',
	'prettyForms',
	'separatorSize',
	'storiesP',
	'submitButton',
], function (bar, bodyColumn, colors, db, defaultFormFor, fonts, prettyForms, separatorSize, storiesP, submitButton) {
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
					var theme = dailyThemeS.lastValue();
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

	var gafyDesignSmall = function (gafyDesign) {
		return border(colors.middleGray, {
			all: 1,
		}, stack({}, [
			alignLRM({
				middle: image({
					src: gafyDesign.imageUrl,
					chooseWidth: 0,
					minHeight: 200,
				}),
			}),
			padding({
				all: 10,
			}, alignLRM({
				middle: text(gafyDesign.designDescription).all([
					fonts.h2,
				]),
			})),
		]));
	};

	var designsEditor = db.gafyDesign.find({}).then(function (designs) {
		var addedGafyDesignsS = Stream.create();
		var removedGafyDesignsS = Stream.create();
		var designsS = Stream.combine([
			addedGafyDesignsS.reduce(function (arr, d) {
				return arr.concat([d]);
			}, []),
			removedGafyDesignsS.reduce(function (arr, d) {
				return arr.concat([d]);
			}, []),
		], function (addedGafyDesigns, removedGafyDesigns) {
			return designs.concat(addedGafyDesigns).filter(function (design) {
				return removedGafyDesigns.filter(function (removedDesign) {
					return design._id === removedDesign._id;
				}).length === 0;
			});
		});

		var designsTabS = Stream.once(0);
		var editingDesignIdS = Stream.once(designs[0]._id);
		var editingDesignS = Stream.combine([
			designsS,
			editingDesignIdS,
		], function (designs, _id) {
			return designs.filter(function (design) {
				return design._id === _id;
			})[0];
		});
		return stack({
			gutterSize: separatorSize,
		}, [
			text('GAFY Designs').all([
				fonts.h1,
			]),
			tabs([{
				tab: tab('Designs List'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					text('Designs List').all([
						fonts.h2,
					]),
					componentStream(designsS.map(function (designs) {
						return grid({
							gutterSize: separatorSize,
							handleSurplusWidth: superSurplusWidth,
						}, designs.map(gafyDesignSmall));
					})),
				])),
			}, {
				tab: tab('Add Design'),
				content: content(defaultFormFor.gafyDesign({
					designNumber: undefined,
					designDescription: undefined,
					printLocation: undefined,
					imageUrl: './content/man.png',
				}, function (gafyDesignS, fields) {
					var mustFillFields = Stream.once(0);
					gafyDesignS.onValue(function () {
						mustFillFields.push(0);	
					});
					
					return stack({
						gutterSize: separatorSize,
					}, [
						text('Add Design').all([
							fonts.h2,
						]),
						fields.designNumber,
						fields.designDescription,
						fields.printLocation,
						fields.imageUrl,
						toggleComponent([nothing, text('You must fill out all fields')], mustFillFields),
						alignLRM({
							left: submitButton(text('Add Design')).all([
								link,
								clickThis(function () {
									var gafyDesign = gafyDesignS.lastValue();
									if (!gafyDesign) {
										mustFillFields.push(1);
									}
									db.gafyDesign.insert(gafyDesign).then(function (design) {
										addedGafyDesignsS.push(design);
										designsTabS.push(0);
									});
								}),
							]),
						}),
					]);
				})),
			}, {
				tab: tab('Edit Design'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					componentStream(designsS.map(function (designs) {
						return prettyForms.select({
							name: 'Editing Design',
							options: designs.map(function (design) {
								return {
									name: design.designNumber + ' - ' + design.designDescription,
									value: design._id,
								};
							}),
							stream: editingDesignIdS,
						}).all([
							changeThis(function (ev) {
								editingDesignIdS.push($(ev.target).val());
							}),
						]);
					})),
					text('Edit Design').all([
						fonts.h2,
					]),
					componentStream(editingDesignS.map(function (design) {
						return defaultFormFor.gafyDesign(design, function (gafyDesignS, fields) {
							var mustFillFields = Stream.once(0);
							gafyDesignS.onValue(function () {
								mustFillFields.push(0);	
							});
							
							return stack({
								gutterSize: separatorSize,
							}, [
								fields.designNumber,
								fields.designDescription,
								fields.printLocation,
								fields.imageUrl,
								toggleComponent([nothing, text('You must fill out all fields')], mustFillFields),
								alignLRM({
									left: submitButton(text('Edit Design')).all([
										link,
										clickThis(function () {
											var gafyDesign = gafyDesignS.lastValue();
											if (!gafyDesign) {
												mustFillFields.push(1);
											}
											db.gafyDesign.remove({
												_id: gafyDesign._id
											}).then(function () {
												db.gafyDesign.insert(gafyDesign).then(function (insertedDesign) {
													addedGafyDesignsS.push(insertedDesign);
													removedGafyDesignsS.push(gafyDesign);
													designsTabS.push(0);
												});
											});
										}),
									]),
								}),
							]);
						});
					})),
				])),
			}], designsTabS),
		]);
	});
	
	return bodyColumn(stack({}, [
		bar.horizontal(separatorSize),
		tabs([{
			tab: tab('Daily Theme'),
			content: content(dailyThemesEditor),
		}, {
			tab: tab('Gafy Designs'),
			content: content(designsEditor),
		}]),
	]));
});



