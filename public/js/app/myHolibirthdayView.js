define([
	'bar',
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'meP',
	'months',
	'separatorSize',
	'signInForm',
	'submitButton',
], function (bar, bodyColumn, colors, confettiBackground, db, fonts, meP, months, separatorSize, signInForm, submitButton) {
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
					middle: text(option).all([
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
				})).test().pushAll(instance.minHeight);
				chooseLargest(is.map(function (i) {
					return i.minWidth;
				})).test().pushAll(instance.minWidth);
				return [
					is.map(function (i) {
						return {
							width: context.width,
							height: context.height,
						};
					}),
				];
			}),
		]);
	};
	
	var chooseNonHoliday = function () {
		var equals = function (b1, b2) {
			return b1.month === b2.month &&
				b1.dayTens === b2.dayTens &&
				b1.dayOnes === b2.dayOnes;
		}
		var createDate = function () {
			var randomDate = new Date(new Date().getTime() * Math.random());
			
			var month = randomDate.getMonth();
			var date = randomDate.getDate();
			var dateTens = parseInt((date / 10) + '');
			var dateOnes = date % 10;
			return {
				month: month,
				dayTens: dateTens,
				dayOnes: dateOnes,
				date: randomDate,
			};
		}

		var matchesAnyHoliday = function (date) {

			if (date.month === 10) {
				if (date.dayTens >= 2) {
					return true;
				}
			}
			
			var holidays = [{
				month: 0,
				dayTens: 0,
				dayOnes: 1,
				reason: 'New Years',
			}, {
				month: 0,
				dayTens: 0,
				dayOnes: 2,
				reason: 'day after new years',
			}, {
				month: 3,
				dayTens: 0,
				dayOnes: 1,
				reason: 'April Fool\'s',
			}, {
				month: 6,
				dayTens: 0,
				dayOnes: 4,
				reason: 'Independence Day',
			}, {
				month: 8,
				dayTens: 0,
				dayOnes: 7,
				reason: 'labor day',
			}, {
				month: 9,
				dayTens: 3,
				dayOnes: 1,
				reason: 'halloween',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 1,
				reason: 'christmas eve eve eve eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 2,
				reason: 'christmas eve eve eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 3,
				reason: 'christmas eve eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 4,
				reason: 'christmas eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 5,
				reason: 'christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 6,
				reason: 'day after christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 7,
				reason: 'day after day after christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 8,
				reason: 'day after day after day after christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 9,
				reason: 'day after day after day after day after christmas',
			}, {
				month: 11,
				dayTens: 3,
				dayOnes: 0,
				reason: 'New Years eve eve',
			}, {
				month: 11,
				dayTens: 3,
				dayOnes: 1,
				reason: 'New Years eve',
			}];

			return holidays.filter(function (h) {
				return equals(h, date);
			}).length > 0;
		};

		var date = createDate();
		while (matchesAnyHoliday(date)) {
			var date = createDate();
		}
		return date.date;
	};
	
	
	var birthdayMachine = function (dateStream) {
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
				}, padding(5, text('Pull').all([
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
					function (instance, context) {
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
		
		return sideBySide({
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
						stream: dateStream.map(function (date) {
							return {
								index: date.getMonth(),
							};
						}),
					}),
					slotMachine({
						options: [
							0, 1, 2, 3,
						],
						stream: dateStream.map(function (date) {
							return {
								index: Math.floor(date.getDate() / 10),
							};
						}),
					}),
					slotMachine({
						options: [
							0, 1, 2, 3, 4, 5, 6, 7, 8, 9
						],
						stream: dateStream.map(function (date) {
							return {
								index: date.getDate() % 10,
							};
						}),
					}),
				])),
			}),
			grabber,
		]).all([
			$css('user-select', 'none'),
		]);
	};

	return meP.then(function (me) {
		if (me) {
			var holibirthday = {
				user: Stream.once(me._id),
				date: Stream.never(),
			};

			var lastHolibirthday;
			Stream.combineObject(holibirthday).onValue(function (v) {
				lastHolibirthday = v;
			});
			var playTheMachine = Stream.once(false);
			holibirthday.date.map(function () {
				return false;
			}).pushAll(playTheMachine);
			
			var machine = function (oldHolibirthday) {
				return stack({
					gutterSize: separatorSize,
				}, [
					alignLRM({
						middle: birthdayMachine(holibirthday.date),
					}),
					alignLRM({
						middle: toggleHeight(playTheMachine)(stack({}, [
							text('You must pull the lever first').all([
								fonts.ralewayThinBold,
								$css('font-size', 30),
							]),
						])),
					}),
					alignLRM({
						middle: submitButton(black, text(oldHolibirthday ? 'Change Holibirthday' : 'Claim Birthday')).all([
							link,
							clickThis(function () {
								if (lastHolibirthday) {
									if (oldHolibirthday) {
										db.holibirthday.update({
											user: me._id,
										}, lastHolibirthday).then(function () {
											window.location.hash = '#!user/' + me._id;
											window.location.reload();
										});
									}
									else {
										db.holibirthday.insert(lastHolibirthday).then(function () {
											window.location.hash = '#!user/' + me._id;
											window.location.reload();
										});
									}
								}
								else {
									playTheMachine.push(true);
								}
							}),
						]),
					}),
				]);
			};
			var header = function (c) {
				return confettiBackground(alignLRM({
					middle: bodyColumn(sideBySide({
						handleSurplusWidth: giveToSecond,
					}, [
						alignTBM({
							middle: image({
								src: './content/man.png',
								minWidth: 300,
								chooseHeight: 0,
							}),
						}),
						padding({
							left: 30,
							right: 30,
							top: 50,
							bottom: 50,
						}, c),
					])),
				}));
			};
			return db.holibirthday.findOne({
				user: me._id,
			}).then(function (oldHolibirthday) {
				if (oldHolibirthday) {
					var oldHolibirthdate = new Date(oldHolibirthday.date);
					var humanReadableDate = months[oldHolibirthdate.getMonth()] + ' ' + oldHolibirthdate.getDate();
					return stack({
						gutterSize: separatorSize * 2,
					}, [
						linkTo('#!user/' + me._id, header(stack({}, [
							text('Your Holibirthday Is').all([
								fonts.ralewayThinBold,
								$css('font-size', 40),
							]),
							text(humanReadableDate).all([
								fonts.ralewayThinBold,
								$css('font-size', 20),
							]),
						]))),
						bodyColumn(alignLRM({
							middle: machine(holibirthday),
						})),
					]);
				}
				else {
					return stack({
						gutterSize: separatorSize,
					}, [
						header(text('Claim Your Holibirthday').all([
							fonts.ralewayThinBold,
							$css('font-size', 40),
						])),
						bodyColumn(alignLRM({
							middle: machine(),
						})),
					]);
				}
			});
		}
		return bodyColumn(stack({
			gutterSize: separatorSize,
		}, [
			nothing,
			paragraph('You must sign in to claim a holibirthday').all([
				$css('font-size', '30px'),
				fonts.bebasNeue,
			]),
			signInForm(),
		]));
	});
});
