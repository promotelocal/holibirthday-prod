define([
	'areYouSure',
	'bar',
	'bodyColumn',
	'colors',
	'db',
	'defaultFormFor',
	'fonts',
	'formLayouts',
	'forms',
	'gafyDesignSmall',
	'gafyStyleSmall',
	'months',
	'prettyForms',
	'separatorSize',
	'storiesP',
	'submitButton',
], function (areYouSure, bar, bodyColumn, colors, db, defaultFormFor, fonts, formLayouts, forms, gafyDesignSmall, gafyStyleSmall, months, prettyForms, separatorSize, storiesP, submitButton) {
	var tab = function (name) {
		var body = padding({
			top: 10,
			bottom: 10,
			left: 10,
			right: 10,
		}, paragraph(name, 0).all([
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
						submitButton(black, text('Save').all([
							fonts.bebasNeue,
						])).all([
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
				copyItemEditor('Header Browse'),
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
										submitButton(black, text('Save Famous Birthday').all([
											fonts.bebasNeue,
										])).all([
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


	var mailchimpTemplates = promiseComponent($.ajax({
		url: '/mailchimp/templates',
	}).then(function (templates) {
		var templateOptions = templates.map(function (template) {
			return {
				name: template.name,
				value: template.id,
			};
		});
		templateOptions.sort(function (o1, o2) {
			return o1.name.localeCompare(o2.name);
		});
		return db.mailchimpTemplate.find({}).then(function (mailchimpTemplates) {
			return alignLRM({
				left: stack({
					gutterSize: separatorSize,
				}, [{
					name: 'Holibirthday in Three Weeks',
					event: schema.mailchimpTemplate.fields.event.options.holibirthdayInThreeWeeks,
				}, {
					name: 'Holibirthday Tomorrow',
					event: schema.mailchimpTemplate.fields.event.options.holibirthdayTomorrow,
				}, {
					name: 'Friend\'s Holibirthday in Three Weeks',
					event: schema.mailchimpTemplate.fields.event.options.friendsHolibirthdayInThreeWeeks,
				}, {
					name: 'Friend\'s Holibirthday Tomorrow',
					event: schema.mailchimpTemplate.fields.event.options.friendsHolibirthdayTomorrow,
				}, {
					name: 'Your Story Deleted',
					event: schema.mailchimpTemplate.fields.event.options.storyDeleted,
				}, {
					name: 'Your Comment Deleted',
					event: schema.mailchimpTemplate.fields.event.options.commentDeleted,
				}].map(function (config) {
					var mailchimpTemplateStreams = Stream.splitObject(mailchimpTemplates.filter(function (t) {
						return t.event === config.event;
					})[0] || {
						event: config.event,
						mailchimpTemplateId: '',
						toName: '',
						fromName: '',
						subject: '',
					});

					var mailchimpTemplateS = Stream.combineObject(mailchimpTemplateStreams);

					var unsavedS = Stream.once(false);
					var firstValueMapped = false;
					mailchimpTemplateS.map(function () {
						if (firstValueMapped) {
							unsavedS.push(true);
						}
						firstValueMapped = true;
					});

					return stack({
						gutterSize: separatorSize,
					}, [
						text(config.name).all([
							fonts.h2,
						]),
						forms.selectBox({
							options: templateOptions,
							stream: mailchimpTemplateStreams.mailchimpTemplateId,
						}),
						prettyForms.input({
							name: 'toName',
							stream: mailchimpTemplateStreams.toName,
						}),
						prettyForms.input({
							name: 'fromName',
							stream: mailchimpTemplateStreams.fromName,
						}),
						prettyForms.input({
							name: 'subject',
							stream: mailchimpTemplateStreams.subject,
						}),
						sideBySide({
							gutterSize: separatorSize,
						}, [
							submitButton(black, text('Save').all([
								fonts.bebasNeue,
							])).all([
								link,
								clickThis(function (ev, disable) {
									var enable = disable();
									db.mailchimpTemplate.insertOrUpdate(mailchimpTemplateS.lastValue()).then(function () {
										enable();
										unsavedS.push(false);
									});
								}),
							]),
							alignTBM({
								middle: componentStream(unsavedS.map(function (u) {
									return u ? text('(unsaved)') : nothing;
								})),
							}),
						]),
					]);
				})),
			})
		});
	}));
										  
	var mailchimpLists = promiseComponent($.ajax({
		url: '/mailchimp/lists',
	}).then(function (lists) {
		var listOptions = lists.map(function (list) {
			return {
				name: list.name,
				value: list.id,
			};
		});
		listOptions.sort(function (o1, o2) {
			return o1.name.localeCompare(o2.name);
		});
		return db.mailchimpList.find({}).then(function (mailchimpLists) {
			return alignLRM({
				left: stack({
					gutterSize: separatorSize,
				}, [{
					name: 'Holibirthers',
					internalType: 'holibirthers',
				}, {
					name: 'Friends of Holibirthers',
					internalType: 'friendsOfHolibirthers',
				}].map(function (config) {
					var mailchimpListStreams = Stream.splitObject(mailchimpLists.filter(function (l) {
						return l.mailchimpListType === config.internalType;
					})[0] || {
						mailchimpListType: config.internalType,
						mailchimpListId: '',
					});

					var mailchimpListS = Stream.combineObject(mailchimpListStreams);

					var unsavedS = Stream.once(false);
					var firstValueMapped = false;
					mailchimpListS.map(function () {
						if (firstValueMapped) {
							unsavedS.push(true);
						}
						firstValueMapped = true;
					});

					return stack({
						gutterSize: separatorSize,
					}, [
						text(config.name).all([
							fonts.h2,
						]),
						forms.selectBox({
							options: listOptions,
							stream: mailchimpListStreams.mailchimpListId,
						}),
						sideBySide({
							gutterSize: separatorSize,
						}, [
							submitButton(black, text('Save').all([
								fonts.bebasNeue,
							])).all([
								link,
								clickThis(function (ev, disable) {
									var enable = disable();
									db.mailchimpList.insertOrUpdate(mailchimpListS.lastValue()).then(function () {
										enable();
										unsavedS.push(false);
									});
								}),
							]),
							alignTBM({
								middle: componentStream(unsavedS.map(function (u) {
									return u ? text('(unsaved)') : nothing;
								})),
							}),
						]),
					]);
				})),
			});
		});
	}));


	return bodyColumn(stack({}, [
		bar.horizontal(separatorSize),
		tabs([{
			tab: tab('Daily Theme'),
			content: content(dailyThemesEditor),
		}, {
			tab: tab('Site Copy'),
			content: content(copyEditor),
		}, {
			tab: tab('Famous Birthdays'),
			content: content(famousBirthdays),
		}, {
			tab: tab('Mailchimp Templates'),
			content: content(mailchimpTemplates),
		}, {
			tab: tab('Mailchimp Lists'),
			content: content(mailchimpLists),
		}], Stream.once(0)),
	]));
});
