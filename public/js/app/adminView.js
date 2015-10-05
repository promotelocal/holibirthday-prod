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
		return defaultFormFor.dailyTheme({
			_id: theme._id || null,
			type: theme.type || schema.dailyTheme.fields.type.options.featuredStory,
			storyId: theme.storyId || null,
			storyText: theme.storyText || '',
			giftId: theme.giftId || null,
			giftText: theme.giftText || '',
			pollTitle: theme.pollTitle || '',
			pollDescription: theme.pollDescription || '',
			pollChoices: theme.pollChoices || '',
			pollImage: theme.pollImage || './content/man.png',
			someTextTitle: theme.someTextTitle || '',
			someTextText: theme.someTextText || '',
			someTextImage: theme.someTextImage || './content/man.png',
		}, function (dailyThemeS, fields) {
			var featuredStoryEditor = stack({
				gutterSize: separatorSize,
			}, [
				fields.storyId,
				fields.storyText,
			]);
			var featuredGiftEditor = stack({
				gutterSize: separatorSize,
			}, [
				fields.giftId,
				fields.giftText,
			]);
			var pollEditor = stack({
				gutterSize: separatorSize,
			}, [
				fields.pollTitle,
				fields.pollDescription,
				fields.pollChoices,
				fields.pollImage,
			]);
			var someTextEditor = stack({
				gutterSize: separatorSize,
			}, [
				fields.someTextTitle,
				fields.someTextText,
				fields.someTextImage,
			]);
			
			var saveButton = alignLRM({
				left: submitButton(black, text('Publish')).all([
					link,
					clickThis(function () {
						var theme = dailyThemeS.lastValue();
						delete theme._id;
						db.dailyTheme.insert(theme).then(function () {
							window.location.hash = '#!';
							window.location.reload();
						});
					}),
				]),
			});
			
			return stack({
				gutterSize: separatorSize,
			}, [
				text('Daily Theme').all([
					fonts.h1,
				]),
				fields.type,
				componentStream(dailyThemeS.map(function (dailyTheme) {
					switch (dailyTheme.type) {
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
								left: submitButton(black, text('Add Design')).all([
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
									left: submitButton(black, text('Edit Design')).all([
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
								left: submitButton(black, text('Add Style')).all([
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
									left: submitButton(black, text('Edit Design')).all([
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



