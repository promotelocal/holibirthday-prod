define([
	'bar',
	'bodyColumn',
	'chooseNonHoliday',
	'colors',
	'confettiBackground',
	'db',
	'famousBirthdaysDisplay',
	'fonts',
	'holibirthdayRow',
	'meP',
	'months',
	'prettyForms',
	'profileP',
	'separatorSize',
	'signInForm',
	'signInStream',
	'siteCopyItemsP',
	'submitButton',
], function (bar, bodyColumn, chooseNonHoliday, colors, confettiBackground, db, famousBirthdaysDisplay, fonts, holibirthdayRow, meP, months, prettyForms, profileP, separatorSize, signInForm, signInStream, siteCopyItemsP, submitButton) {
	return promiseComponent(db.famousBirthday.find({}).then(function (famousBirthdays) {	
		return siteCopyItemsP.then(function (copy) {
			var slotMachine = function (config) {
				// config.options: array of options
				// config.stream: stream of results to show
				return div.all([
					children(config.options.map(function (option) {
						return padding({
							top: 30,
							bottom: 30,
							left: 20,
							right: 20,
						}, alignLRM({
							middle: text(option + '').all([
								fonts.bebasNeue,
								$css('font-size', 40),
							]),
						})).all([
							withBackgroundColor(white),
							function (instance) {
								instance.$el.css('position', 'relative');
								instance.$el.css('visibility', '');
							},
						]);
					})),
					wireChildren(function (instance, context, is) {
						context.height.promise.then(function () {
							var machine = instance.$el.slotMachine();

							var maxVariability = 100;
							var shuffleTime = 2000;

							var startDelay = Math.random();

							var stopDelay = shuffleTime + Math.random() * maxVariability;

							config.stream.onValue(function (obj) {
								machine.setRandomize(function () {
									return obj.index;
								});
								setTimeout(function () {
									machine.shuffle();
								}, startDelay);
								setTimeout(function () {
									machine.stop();
								}, stopDelay);
							});
						});

						var chooseLargest = function (streams) {
							return Stream.combine(streams, function () {
								var args = Array.prototype.slice.call(arguments);
								return args.reduce(function (a, v) {
									return Math.max(a, v);
								}, 0);
							});
						};
						
						chooseLargest(is.map(function (i) {
							return i.minHeight;
						})).pushAll(instance.minHeight);
						chooseLargest(is.map(function (i) {
							return i.minWidth;
						})).pushAll(instance.minWidth);
						return [
							is.map(function () {
								return {
									width: context.width,
									height: context.height,
								};
							}),
						];
					}),
				]);
			};
			
			var birthdayMachine = function (dateStream) {
				var dateStreamDates = dateStream.filter(function (d, cb) {
					if (d) {
						cb(d);
					}
				});
				var grabbed = false;
				var grabMousePos;

				var grabberHeight = 150;
				var grabber = overlays([
					alignLRM({
						middle: nothing.all([
							withMinWidth(2, true),
							withMinHeight(grabberHeight, true),
							withBackgroundColor(black),
						]),
					}),
					alignTBM({
						top: border(black, {
							all: 2,
						}, padding(5, text(copy.find('Slot Machine Pull')).all([
							fonts.bebasNeue,
							$css('font-size', 20),
						]))).all([
							$css('cursor', 'move'),
							withBackgroundColor(colors.holibirthdayRed),
							withFontColor(white),
							mousedownThis(function (ev) {
								grabbed = true;
								grabMousePos = ev.clientY;
								return false;
							}),
							function (instance) {
								$('body').on('mouseup', function () {
									if (grabbed) {
										grabbed = false;
										instance.$el.animate({'margin-top': 0});
									}
								});
								$('body').on('mousemove', function (ev) {
									if (grabbed) {
										var pullDistance = Math.max(0, ev.clientY - grabMousePos);
										var maxPullDistance = grabberHeight - parseInt(instance.$el.css('height'));
										instance.$el.css('margin-top', pullDistance);
										if (pullDistance > maxPullDistance) {
											instance.$el.css('margin-top', maxPullDistance);
											instance.$el.animate({'margin-top': 0});
											grabbed = false;
											dateStream.push(chooseNonHoliday());
										}
									}
								});
							},
						]),
					}),
				]);

				return stack({
					gutterSize: separatorSize,
				}, [
					sideBySide({
						gutterSize: separatorSize,
					}, [
						alignTBM({
							middle: border(black, {
								all: 1,
							}, sideBySide({}, [
								slotMachine({
									options: [
										'Jan',
										'Feb',
										'Mar',
										'Apr',
										'May',
										'Jun',
										'Jul',
										'Aug',
										'Sep',
										'Oct',
										'Nov',
										'Dec'
									],
									stream: dateStreamDates.map(function (date) {
										return {
											index: date && date.getUTCMonth(),
										};
									}),
								}),
								slotMachine({
									options: [
										0, 1, 2, 3,
									],
									stream: dateStreamDates.map(function (date) {
										return {
											index: date && Math.floor(date.getUTCDate() / 10),
										};
									}),
								}),
								slotMachine({
									options: [
										0, 1, 2, 3, 4, 5, 6, 7, 8, 9
									],
									stream: dateStreamDates.map(function (date) {
										return {
											index: date && date.getUTCDate() % 10,
										};
									}),
								}),
							])),
						}),
						grabber,
					]).all([
						$css('user-select', 'none'),
					]),
				]);
			};

			var famousBirthdaysForDate = function (date) {
				if (!date) {
					return [];
				}
				return famousBirthdays.filter(function (fb) {
					return fb.birthday.getUTCMonth() === date.getUTCMonth() &&
						fb.birthday.getUTCDate() === date.getUTCDate();
				});
			};
			
			return meP.then(function (me) {
				if (me) {
					return profileP.then(function (profile) {
						var holibirthday = {
							user: Stream.once(me._id),
							date: Stream.once(null),
						};

						var lastHolibirthday;
						var holibirthdayS = Stream.combineObject(holibirthday);
						holibirthdayS.onValue(function (v) {
							lastHolibirthday = v;
						});
						
						var buttonState = Stream.once(false);
						holibirthdayS.map(function () {
							buttonState.push(true);
						});
						
						var machine = function (oldHolibirthday, update) {
							return stack({
								gutterSize: separatorSize,
							}, [
								alignLRM({
									middle: birthdayMachine(holibirthday.date),
								}),
								alignLRM({
									middle: componentStream(buttonState.map(function (s) {
										return (!s) ? submitButton(colors.middleGray, text(profile.holibirther && update ? copy.find('Slot Machine Change Holibirthday') : copy.find('Slot Machine Claim Holibirthday')).all([
											fonts.bebasNeue,
										])) : submitButton(black, text(profile.holibirther && update ? copy.find('Slot Machine Change Holibirthday') : copy.find('Slot Machine Claim Holibirthday')).all([
											fonts.bebasNeue,
										])).all([
											link,
											clickThis(function () {
												var canvas = document.createElement('canvas');
												var $canvas = $(canvas);
												$canvas.appendTo($('body'))
													.prop('width', 1080)
													.prop('height', 702);

												var ctx = canvas.getContext('2d');

												var drawCenteredText = function (p, text, font) {
													ctx.font = font;
													var width = ctx.measureText(text).width;
													ctx.fillText(text, p.x - width / 2, p.y);
												};
												
												var img = new Image();
												img.onload = function() {
													ctx.drawImage(img, 0, 0);
													drawCenteredText({
														x: 540,
														y: 310,
													}, profile.firstName + ' ' + profile.lastName, 'bold 50px Raleway Thin');
													drawCenteredText({
														x: 540,
														y: 540,
													}, moment(lastHolibirthday.date).utc().format('MMMM Do'), 'bold 50px Raleway Thin');
													if (profile.birthday) {
														drawCenteredText({
															x: 160,
															y: 595,
														}, 'Old Birthday', '20px BebasNeue');
														drawCenteredText({
															x: 160,
															y: 615,
														}, moment(profile.birthday).utc().format('MMMM Do'), '20px BebasNeue');
													}
													setTimeout(function () {
														var blob = window.dataURLtoBlob(canvas.toDataURL());
														db.uploadFile(blob, 'certificate.png').then(function (filename) {
															lastHolibirthday.imageUrl = '/api/uploadFile/find/' + filename;
															db.profile.update({
																user: me._id,
															}, {
																holibirther: true,
															}).then(function () {
																if (update) {
																	db.holibirthday.update({
																		user: me._id,
																	}, lastHolibirthday).then(function () {
																		window.location.hash = '#!user/' + me._id + '/certificate';
																		window.location.reload();
																	});
																}
																else {
																	db.holibirthday.insert(lastHolibirthday).then(function () {
																		window.location.hash = '#!user/' + me._id + '/certificate';
																		window.location.reload();
																	});
																}
															});
														});
														$canvas.remove();
													});
												};
												img.src = './content/certificate-new.png';
											}),
										]);
									})),
								}),
							]);
						};
						return db.holibirthday.findOne({
							user: me._id,
						}).then(function (oldHolibirthday) {
							if (profile.holibirther && oldHolibirthday) {
								var oldHolibirthdate = oldHolibirthday.date;
								holibirthday.date.push(oldHolibirthdate);
								return stack({
									gutterSize: separatorSize,
								}, [
									linkTo('#!user/' + me._id + '/certificate', confettiBackground(bodyColumn(holibirthdayRow(stack({
										gutterSize: separatorSize,
									}, [
										text(copy.find('Slot Machine Your Holibirthday Is')).all([
											fonts.ralewayThinBold,
											$css('font-size', 40),
										]),
										text(moment(oldHolibirthdate).utc().format('MMMM Do')).all([
											fonts.ralewayThinBold,
											$css('font-size', 20),
										]),
									]))))),
									bodyColumn(paragraph(copy.find('Slot Machine Description'))),
									bodyColumn(alignLRM({
										middle: machine(holibirthday, true),
									})),
									componentStream(holibirthday.date.delay(2500).map(function (date) {
										return famousBirthdaysDisplay(famousBirthdaysForDate(date));
									})),
								]);
							}
							else {
								return stack({
									gutterSize: separatorSize,
								}, [
									confettiBackground(bodyColumn(holibirthdayRow(text(copy.find('Slot Machine Claim Title')).all([
										fonts.ralewayThinBold,
										$css('font-size', 40),
									])))),
									bodyColumn(paragraph(copy.find('Slot Machine Description'))),
									bodyColumn(alignLRM({
										middle: machine(holibirthday, oldHolibirthday),
									})),
									componentStream(holibirthday.date.delay(2500).map(function (date) {
										return famousBirthdaysDisplay(famousBirthdaysForDate(date));
									})),
								]);
							}
						});
					});
				}
				return stack({
					gutterSize: separatorSize,
				}, [
					confettiBackground(bodyColumn(holibirthdayRow(text(copy.find('Slot Machine Claim Title')).all([
						fonts.ralewayThinBold,
						$css('font-size', 40),
					])))),
					bodyColumn(paragraph(copy.find('Slot Machine Must Sign In')).all([
						fonts.h1,
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
});
