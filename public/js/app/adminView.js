define([
	'areYouSure',
	'bar',
	'bodyColumn',
	'colors',
	'db',
	'defaultFormFor',
	'fonts',
	'formLayouts',
	'gafyDesignSmall',
	'gafyStyleSmall',
	'months',
	'prettyForms',
	'separatorSize',
	'storiesP',
	'submitButton',
], function (areYouSure, bar, bodyColumn, colors, db, defaultFormFor, fonts, formLayouts, gafyDesignSmall, gafyStyleSmall, months, prettyForms, separatorSize, storiesP, submitButton) {
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
		gafyStyles.map(function (gafyStyle) {
			gafyStyle.price /= 100;
		});
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
				'price',
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
						price: 0,
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
										gafyStyle.price = Math.round(gafyStyle.price * 100);
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
									left: submitButton(black, text('Edit Style')).all([
										link,
										clickThis(function () {
											var gafyStyle = gafyStyleS.lastValue();
											gafyStyle.price = Math.round(gafyStyle.price * 100);
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

	var copyEditor = promiseComponent(db.siteCopyItem.find({}).then(function (siteCopyItems) {
		var copyItemEditor = function (uniqueName, formElement) {
			var item = siteCopyItems.filter(function (item) {
				return item.uniqueName === uniqueName;
			})[0] || {
				uniqueName: uniqueName,
				value: formElement === 'imageUpload' ? '/content/man.png' : '',
			};

			var valueS = Stream.once(item.value);
			var modifiedS = valueS.map(function () {
				return true;
			});
			modifiedS.push(false);
			
			return stack({
				gutterSize: separatorSize,
			}, [
				prettyForms[formElement || 'input']({
					name: uniqueName,
					stream: valueS,
				}),
				alignLRM({
					left: sideBySide({
						gutterSize: separatorSize,
					}, [
						submitButton(black, text('Save')).all([
							link,
							clickThis(function () {
								item.value = valueS.lastValue();
								(item._id ?
								 db.siteCopyItem.update({
									 _id: item._id,
								 }, item) :
								 db.siteCopyItem.insert(item)).then(function (res) {
									 item._id = item._id || res._id;
									 modifiedS.push(false);
								 });
							}),
						]),
						componentStream(modifiedS.map(function (modified) {
							return modified ? alignTBM({
								middle: text('(unsaved)'),
							}) : nothing;
						})),
					]),
				}),
			]);
		};
		
		return tabs([{
			tab: tab('Home Page'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Home Tagline'),
				copyItemEditor('Home Share Your Story'),
				copyItemEditor('Home Claim Your Holibirthday'),
				copyItemEditor('Home Find Friends'),
			])),
		}, {
			tab: tab('Edit Story'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Edit Story Title'),
				copyItemEditor('Edit Story Smaller Title'),
				copyItemEditor('Edit Story Instructions', 'plainTextarea'),
				copyItemEditor('Edit Story Submit Instructions'),
			])),
		}, {
			tab: tab('Gifts'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Gifts Title'),
				copyItemEditor('Gifts Cart'),
				copyItemEditor('Gifts Wishlist'),
			])),
		}, {
			tab: tab('Causes'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Causes Title'),
				copyItemEditor('Causes Donate Now'),
				copyItemEditor('Causes', 'textarea'),
				copyItemEditor('Causes Image', 'imageUpload'),
			])),
		}, {
			tab: tab('Site Header'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Header Gifts'),
				copyItemEditor('Header Causes'),
				copyItemEditor('Header My Profile'),
				copyItemEditor('Header Contacts'),
				copyItemEditor('Header Sign In'),
				copyItemEditor('Header Sign Out'),
				copyItemEditor('Header Register'),
				copyItemEditor('Header Admin'),
			])),
		}, {
			tab: tab('Order Email'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Order Confirmation Email: From'),
				copyItemEditor('Order Confirmation Email: From Name'),
				copyItemEditor('Order Confirmation Email: Subject'),
				copyItemEditor('Order Confirmation Email: Text ( {{orderNumber}} includes order number)', 'plainTextarea'),
			])),
		}, {
			tab: tab('Donation Email'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Donate Confirmation Email: From'),
				copyItemEditor('Donate Confirmation Email: From Name'),
				copyItemEditor('Donate Confirmation Email: Subject'),
				copyItemEditor('Donate Confirmation Email: Text ( {{donationNumber}} includes donation number)', 'plainTextarea'),
			])),
		}]);
	}));


	var emailSentS = Stream.once(false);
	var sendingEmailsS = Stream.once(false);
	var recipientType = {
		all: 'all',
		hasHolibirthday: 'hasHolibirthday',
		birthdayBetween: 'birthdayBetween',
		holibirthdayBetween: 'holibirthdayBetween',
	};
	var recipientTypeS = Stream.once(recipientType.all);

	var sendEmailStreams = {
		constraintSource: recipientTypeS,
		monthGT: Stream.once(12),
		dayGT: Stream.once(24),
		monthLT: Stream.once(1),
		dayLT: Stream.once(2),
		from: Stream.once('webmaster@holibirthday.com'),
		fromName: Stream.once('Holibirthday'),
		subject: Stream.once(''),
		text: Stream.once(''),
	};
	var emailFillOutAllFieldsS = Stream.once(false);
	var sendEmailS = Stream.combineObject(sendEmailStreams);
	var sendEmail = stack({
		gutterSize: separatorSize,
	}, [
		prettyForms.input({
			name: 'From',
			stream: sendEmailStreams.from,
		}),
		prettyForms.input({
			name: 'From Name',
			stream: sendEmailStreams.fromName,
		}),
		prettyForms.input({
			name: 'Subject',
			stream: sendEmailStreams.subject,
		}),
		prettyForms.plainTextarea({
			name: 'Text',
			stream: sendEmailStreams.text,
		}),
		prettyForms.select({
			name: 'Recipients',
			options: [{
				name: 'All Users',
				value: recipientType.all,
			}, {
				name: 'Has Holibirthday',
				value: recipientType.hasHolibirthday,
			}, {
				name: 'Birthday Between',
				value: recipientType.birthdayBetween,
			}, {
				name: 'Holibirthday Between',
				value: recipientType.holibirthdayBetween,
			}],
			stream: recipientTypeS,
		}),
		componentStream(recipientTypeS.map(function (type) {
			switch (type) {
			case recipientType.birthdayBetween:
			case recipientType.holibirthdayBetween:
				return stack({
					gutterSize: separatorSize,
				}, [
					text('On Or After Month/Day').all([
						fonts.ralewayThinBold,
					]),
					prettyForms.input({
						name: 'Month',
						stream: sendEmailStreams.monthGT,
					}),
					prettyForms.input({
						name: 'Day',
						stream: sendEmailStreams.dayGT,
					}),
					text('On Or Before Month/Day').all([
						fonts.ralewayThinBold,
					]),
					prettyForms.input({
						name: 'Month',
						stream: sendEmailStreams.monthLT,
					}),
					prettyForms.input({
						name: 'Day',
						stream: sendEmailStreams.dayLT,
					}),
				]);
			default:
				return nothing;
			}
		})),
		componentStream(emailFillOutAllFieldsS.map(function (fillEm) {
			return fillEm ? text('Please fill out all fields') : nothing;
		})),
		componentStream(Stream.combine([
			sendingEmailsS,
			emailSentS,
		], function (sendingEmails, emailSent) {
			if (sendingEmails) {
				return text('Sending emails...');
			}
			if (emailSent) {
				return text('Emails Sent');
			}
			return nothing;
		})),
		alignLRM({
			left: submitButton(black, text('Send Email')).all([
				link,
				clickThis(function (ev, disable) {
					emailFillOutAllFieldsS.push(false);
					emailSentS.push(false);
					var enable = disable();
					var sendEmail = sendEmailS.lastValue();
					if (!sendEmail.from ||
						!sendEmail.fromName ||
						!sendEmail.subject ||
						!sendEmail.text) {
						emailFillOutAllFieldsS.push(true);
						enable();
						return;
					}
					sendingEmailsS.push(true);
					db.sendEmail.insert(sendEmail).then(function () {
						enable();
						sendingEmailsS.push(false);
						emailSentS.push(true);
					}, function () {
						sendingEmailsS.push(false);
					});
				}),
			]),
		}),
	]);

	var famousBirthdaySmall = function (famousBirthday) {
		return stack({}, [
			text(famousBirthday.name).all([
				fonts.h3,
			]),
		]);
	};


	var famousBirthdays = promiseComponent(db.famousBirthday.find({}).then(function (famousBirthdays) {
		var famousBirthdaysS = Stream.once(famousBirthdays);

		var famousBirthdayFormLayout = formLayouts.stack({
			formBuilder: defaultFormFor.famousBirthday,
			stackConfig: {
				gutterSize: separatorSize,
			},
			fields: [
				'name',
				'birthday',
				'imageUrl',
			],
		});

		var tabS = Stream.once(0);

		var editingFamousBirthdayIdS = Stream.once(famousBirthdays.length > 0 ? famousBirthdays[0]._id : null);
		var editingFamousBirthdayS = Stream.combine([
			famousBirthdaysS,
			editingFamousBirthdayIdS,
		], function (famousBirthdays, _id) {
			return famousBirthdays.filter(function (famousBirthday) {
				return famousBirthday._id === _id;
			})[0] || {};
		});
		return stack({
			gutterSize: separatorSize,
		}, [
			tabs([{
				tab: tab('Famous Birthdays List'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					text('Famous Birthdays List').all([
						fonts.h2,
					]),
					componentStream(famousBirthdaysS.map(function (famousBirthdays) {
						var people = [];
						famousBirthdays.map(function (famousBirthday) {
							var birthday = moment(famousBirthday.birthday);
							var month = birthday.month();
							var day = birthday.date();
							people[month] = people[month] || [[]];
							people[month][day] = people[month][day] || [];
							people[month][day].push(famousBirthday);
						});
						var whichMonthS = Stream.once(months[0]);
						return stack({
							gutterSize: separatorSize,
						}, [
							prettyForms.select({
								name: 'Month',
								options: months,
								stream: whichMonthS,
							}),
							componentStream(whichMonthS.map(function (monthName) {
								var monthIndex = months.indexOf(monthName);
								var daysInMonth = people[monthIndex];
								return stack({
									gutterSize: separatorSize,
								}, daysInMonth.map(function (famousBirthdays, dayIndex) {
									return dayIndex === 0 ? nothing : stack({}, [
										text(months[monthIndex] + ' ' + dayIndex).all([
											fonts.h2,
										]),
										stack({}, famousBirthdays.map(function (famousBirthday) {
											return famousBirthdaySmall(famousBirthday).all([
												link,
												clickThis(function () {
													editingFamousBirthdayIdS.push(famousBirthday._id);
													tabS.push(2);
												}),
											]);
										})),
									]);
								}));
							})),
						]);
					})),
				])),
			}, {
				tab: tab('Add Famous Birthday'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					text('Add Famous Birthday').all([
						fonts.h2,
					]),
					famousBirthdayFormLayout({
						name: '',
						birthday: new Date(),
						description: '',
						imageUrl: './content/man.png',
					}, function (famousBirthdayS) {
						var mustFillFields = Stream.once(0);
						famousBirthdayS.onValue(function () {
							mustFillFields.push(0);	
						});
						
						return stack({
							gutterSize: separatorSize,
						}, [
							toggleComponent([nothing, text('You must fill out all fields')], mustFillFields),
							alignLRM({
								left: submitButton(black, text('Add Famous Birthday')).all([
									link,
									clickThis(function () {
										var famousBirthday = famousBirthdayS.lastValue();
										if (!famousBirthday) {
											mustFillFields.push(1);
											return;
										}
										famousBirthday.birthday = moment(moment(famousBirthday.birthday).utc().format('YYYY-MM-DD')).format();
										db.famousBirthday.insert(famousBirthday).then(function (famousBirthday) {
											famousBirthdaysS.push(famousBirthdaysS.lastValue().concat([famousBirthday]));
											tabS.push(0);
										});
									}),
								]),
							}),
						]);
					}),
				])),
			}, {
				tab: tab('Edit Famous Birthday'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					componentStream(famousBirthdaysS.map(function (famousBirthdays) {
						return prettyForms.select({
							name: 'Editing Famous Birthday',
							options: famousBirthdays.map(function (famousBirthday) {
								return {
									name: famousBirthday.name,
									value: famousBirthday._id,
								};
							}),
							stream: editingFamousBirthdayIdS,
						}).all([
							changeThis(function (ev) {
								editingFamousBirthdayIdS.push($(ev.target).val());
							}),
						]);
					})),
					text('Edit Famous Birthday').all([
						fonts.h2,
					]),
					componentStream(editingFamousBirthdayS.map(function (famousBirthday) {
						return famousBirthdayFormLayout(famousBirthday, function (famousBirthdayS) {
							var mustFillFields = Stream.once(0);
							famousBirthdayS.onValue(function () {
								mustFillFields.push(0);	
							});
							
							return stack({
								gutterSize: separatorSize,
							}, [
								toggleComponent([nothing, text('You must fill out all fields')], mustFillFields),
								alignLRM({
									left: sideBySide({
										gutterSize: separatorSize,
									}, [
										submitButton(black, text('Save Famous Birthday')).all([
											link,
											clickThis(function () {
												var famousBirthday = famousBirthdayS.lastValue();
												if (!famousBirthday) {
													mustFillFields.push(1);
													return;
												}
												famousBirthday.birthday = moment(moment(famousBirthday.birthday).utc().format('YYYY-MM-DD')).format();
												db.famousBirthday.update({
													_id: famousBirthday._id
												}, famousBirthday).then(function () {
													var famousBirthdays = famousBirthdaysS.lastValue().slice(0);
													for (var i = 0; i < famousBirthdays.length; i++) {
														if (famousBirthdays[i]._id === famousBirthday._id) {
															famousBirthdays[i] = famousBirthday;
														}
													}
													famousBirthdaysS.push(famousBirthdays);
													tabS.push(0);
												});
											}),
										]),
										submitButton(black, text('Delete Famous Birthday')).all([
											link,
											clickThis(function () {
												areYouSure({
													onYes: function () {
														var famousBirthday = famousBirthdayS.lastValue();
														if (!famousBirthday) {
															mustFillFields.push(1);
															return;
														}
														db.famousBirthday.remove({
															_id: famousBirthday._id
														}, famousBirthday).then(function () {
															var famousBirthdays = famousBirthdaysS.lastValue().slice(0);
															for (var i = 0; i < famousBirthdays.length; i++) {
																if (famousBirthdays[i]._id === famousBirthday._id) {
																	famousBirthdays.splice(i, 1);
																}
															}
															famousBirthdaysS.push(famousBirthdays);
															tabS.push(0);
														});
													},
												});
											}),
										]),
									]),
								}),
							]);
						});
					})),
				])),
			}], tabS),
		]);
	}));

	
	return bodyColumn(stack({}, [
		bar.horizontal(separatorSize),
		tabs([{
			tab: tab('Daily Theme'),
			content: content(dailyThemesEditor),
		// }, {
		// 	tab: tab('Gafy Styles'),
		// 	content: content(stylesEditor),
		// }, {
		// 	tab: tab('Gafy Designs'),
		// 	content: content(designsEditor),
		}, {
			tab: tab('Site Copy'),
			content: content(copyEditor),
		}, {
			tab: tab('Famous Birthdays'),
			content: content(famousBirthdays),
		}, {
			tab: tab('Send Marketing Email'),
			content: content(sendEmail),
		}], Stream.once(0)),
	]));
});



