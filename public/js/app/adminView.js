define([
	'bar',
	'bodyColumn',
	'colors',
	'db',
	'defaultFormFor',
	'fonts',
	'formLayouts',
	'gafyDesignSmall',
	'gafyStyleSmall',
	'prettyForms',
	'separatorSize',
	'storiesP',
	'submitButton',
], function (bar, bodyColumn, colors, db, defaultFormFor, fonts, formLayouts, gafyDesignSmall, gafyStyleSmall, prettyForms, separatorSize, storiesP, submitButton) {
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
	
	var dailyThemesEditor = promiseComponent(db.dailyTheme.findOne({}).then(function (theme) {
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
	}));

	var designsEditor = promiseComponent(db.gafyDesign.find({}).then(function (designs) {
		var designsS = Stream.once(designs);

		var designFormLayout = formLayouts.stack({
			formBuilder: defaultFormFor.gafyDesign,
			stackConfig: {
				gutterSize: separatorSize,
			},
			fields: [
				'designDescription',
				'designNumber',
				'printLocation',
				'imageUrl',
				'month',
				'styles',
				'colors',
			],
		});

		var designsTabS = Stream.once(0);
		var editingDesignIdS = Stream.once(designs.length > 0 ? designs[0]._id : null);
		var editingDesignS = Stream.combine([
			designsS,
			editingDesignIdS,
		], function (designs, _id) {
			return designs.filter(function (design) {
				return design._id === _id;
			})[0] || {};
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
						}, designs.map(function (design) {
							return gafyDesignSmall(design).all([
								link,
								clickThis(function () {
									editingDesignIdS.push(design._id);
									designsTabS.push(2);
								}),
							]);
						}));
					})),
				])),
			}, {
				tab: tab('Add Design'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					text('Add Design').all([
						fonts.h2,
					]),
					designFormLayout({
						designNumber: undefined,
						designDescription: undefined,
						printLocation: undefined,
						imageUrl: './content/man.png',
						styles: [],
						colors: [],
					}, function (gafyDesignS) {
						var mustFillFields = Stream.once(0);
						gafyDesignS.onValue(function () {
							mustFillFields.push(0);	
						});
						
						return stack({
							gutterSize: separatorSize,
						}, [
							toggleComponent([nothing, text('You must fill out all fields')], mustFillFields),
							alignLRM({
								left: submitButton(text('Add Design')).all([
									link,
									clickThis(function () {
										var gafyDesign = gafyDesignS.lastValue();
										if (!gafyDesign) {
											mustFillFields.push(1);
											return;
										}
										db.gafyDesign.insert(gafyDesign).then(function (design) {
											designsS.push(designsS.lastValue().concat([design]));
											designsTabS.push(0);
										});
									}),
								]),
							}),
						]);
					}),
				])),
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
									name: design.designDescription + ' - ' + design.designNumber,
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
						design.styles = design.styles || [];
						design.colors = design.colors || [];
						return designFormLayout(design, function (gafyDesignS) {
							var mustFillFields = Stream.once(0);
							gafyDesignS.onValue(function () {
								mustFillFields.push(0);	
							});
							
							return stack({
								gutterSize: separatorSize,
							}, [
								toggleComponent([nothing, text('You must fill out all fields')], mustFillFields),
								alignLRM({
									left: submitButton(text('Edit Design')).all([
										link,
										clickThis(function () {
											var gafyDesign = gafyDesignS.lastValue();
											if (!gafyDesign) {
												mustFillFields.push(1);
												return;
											}
											db.gafyDesign.update({
												_id: gafyDesign._id
											}, gafyDesign).then(function () {
												var designs = designsS.lastValue().slice(0);
												for (var i = 0; i < designs.length; i++) {
													if (designs[i]._id === gafyDesign._id) {
														designs[i] = gafyDesign;
													}
												}
												designsS.push(designs);
												designsTabS.push(0);
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
	}));

	var stylesEditor = promiseComponent(db.gafyStyle.find({}).then(function (gafyStyles) {
		var stylesS = Stream.once(gafyStyles);

		var styleFormLayout = formLayouts.stack({
			formBuilder: defaultFormFor.gafyStyle,
			stackConfig: {
				gutterSize: separatorSize,
			},
			fields: [
				'styleDescription',
				'styleNumber',
				'sizes',
				'colors',
				'imageUrl',
				'sizesImageUrl',
			],
		});

		var styleTabS = Stream.once(0);
		var editingStyleIdS = Stream.once(gafyStyles.length > 0 ? gafyStyles[0]._id : null);
		var editingStyleS = Stream.combine([
			stylesS,
			editingStyleIdS,
		], function (designs, _id) {
			return designs.filter(function (design) {
				return design._id === _id;
			})[0] || {};
		});
		return stack({
			gutterSize: separatorSize,
		}, [
			text('GAFY Styles').all([
				fonts.h1,
			]),
			tabs([{
				tab: tab('Styles List'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					text('Styles List').all([
						fonts.h2,
					]),
					componentStream(stylesS.map(function (styles) {
						return grid({
							gutterSize: separatorSize,
							handleSurplusWidth: superSurplusWidth,
						}, styles.map(function (style) {
							return gafyStyleSmall(style).all([
								link,
								clickThis(function () {
									editingStyleIdS.push(style._id);
									styleTabS.push(2);
								}),
							]);
						}));
					})),
				])),
			}, {
				tab: tab('Add Style'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					text('Add Style').all([
						fonts.h2,
					]),
					styleFormLayout({
						styleNumber: undefined,
						styleDescription: undefined,
						sizes: [],
						colors: [],
						imageUrl: './content/man.png',
					}, function (gafyStylesS) {
						var mustFillFields = Stream.once(0);
						gafyStylesS.onValue(function () {
							mustFillFields.push(0);	
						});
						return stack({
							gutterSize: separatorSize,
						}, [
							toggleComponent([nothing, text('You must fill out all fields')], mustFillFields),
							alignLRM({
								left: submitButton(text('Add Style')).all([
									link,
									clickThis(function () {
										var gafyStyle = gafyStylesS.lastValue();
										if (!gafyStyle) {
											mustFillFields.push(1);
											return;
										}
										db.gafyStyle.insert(gafyStyle).then(function (style) {
											stylesS.push(stylesS.lastValue().concat([style]));
											styleTabS.push(0);
										});
									}),
								]),
							}),
						]);
					}),
				])),
			}, {
				tab: tab('Edit Style'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					componentStream(stylesS.map(function (styles) {
						return prettyForms.select({
							name: 'Editing Style',
							options: styles.map(function (style) {
								return {
									name: style.styleDescription + ' - ' + style.styleNumber,
									value: style._id,
								};
							}),
							stream: editingStyleIdS,
						}).all([
							changeThis(function (ev) {
								editingStyleIdS.push($(ev.target).val());
							}),
						]);
					})),
					text('Edit Style').all([
						fonts.h2,
					]),
					componentStream(editingStyleS.map(function (style) {
						return styleFormLayout(style, function (gafyStyleS) {
							var mustFillFields = Stream.once(0);
							gafyStyleS.onValue(function () {
								mustFillFields.push(0);	
							});
							
							return stack({
								gutterSize: separatorSize,
							}, [
								toggleComponent([nothing, text('You must fill out all fields')], mustFillFields),
								alignLRM({
									left: submitButton(text('Edit Design')).all([
										link,
										clickThis(function () {
											var gafyStyle = gafyStyleS.lastValue();
											if (!gafyStyle) {
												mustFillFields.push(1);
												return;
											}
											db.gafyStyle.update({
												_id: gafyStyle._id
											}, gafyStyle).then(function () {
												var styles = stylesS.lastValue().slice(0);
												for (var i = 0; i < styles.length; i++) {
													if (styles[i]._id === gafyStyle._id) {
														styles[i] = gafyStyle;
													}
												}
												stylesS.push(styles);
												styleTabS.push(0);
											});
										}),
									]),
								}),
							]);
						});
					})),
				])),
			}], styleTabS),
		]);
	}));
	
	return bodyColumn(stack({}, [
		bar.horizontal(separatorSize),
		tabs([{
			tab: tab('Daily Theme'),
			content: content(dailyThemesEditor),
		}, {
			tab: tab('Gafy Styles'),
			content: content(stylesEditor),
		}, {
			tab: tab('Gafy Designs'),
			content: content(designsEditor),
		}]),
	]));
});



