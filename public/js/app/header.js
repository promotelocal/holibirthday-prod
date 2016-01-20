define([
	'adminP',
	'auth',
	'bar',
	'bodyColumn',
	'colors',
	'domain',
	'fonts',
	'meP',
	'separatorSize',
	'signInForm',
	'signInStream',
	'siteCopyItemsP',
], function (adminP, auth, bar, bodyColumn, colors, domain, fonts, meP, separatorSize, signInForm, signInStream, siteCopyItemsP) {
	return promiseComponent(siteCopyItemsP.then(function (siteCopyItems) {
		var holibirthdayButton = function (config) {
			config.all = config.all || [];
			return function (label) {
				return padding(config.padding, alignTBM({
					middle: text(label).all(config.all),
				}));
			};
		};

		var headerButton = function (text) {
			return holibirthdayButton({
				padding: 10,
				all: [
					fonts.celebrationTime,
					$css('font-weight', 'bold'),
					$css('font-size', '20px'),
				],
			})(text);
		};

		var headerRightButtons = function (me, admin, signInStream) {
			var buttons = [];
			if (admin) {
				buttons.push(linkTo('#!admin', headerButton(siteCopyItems.find('Header Admin'))));
			}

			buttons.push(linkTo('http://holibirthdaygift.com/', headerButton(siteCopyItems.find('Header Gifts'))));
			buttons.push(nothing.all([
				withMinWidth(10, true),
				withMinHeight(10, true),
			]));
			buttons.push(linkTo('#!browseStories', headerButton(siteCopyItems.find('Header Browse'))));
			buttons.push(linkTo('#!causes', headerButton(siteCopyItems.find('Header Causes'))));

			if (me) {
				buttons.push(linkTo('#!user/' + me._id, headerButton(siteCopyItems.find('Header My Profile'))));
				buttons.push(headerButton(siteCopyItems.find('Header Sign Out')).all([
					link,
					clickThis(function () {
						auth.signOut().then(function () {
							window.location.hash = '#!';
							window.location.reload();
						});
					}),
				]));
			}
			else {
				buttons.push(headerButton(siteCopyItems.find('Header Sign In')).all([
					link,
					clickThis(function (ev) {
						signInStream.push(!signInStream.lastValue());
						ev.stopPropagation();
					}),
				]));
				buttons.push(linkTo('#!register', headerButton(siteCopyItems.find('Header Register'))));
			}
			return buttons;
		};


		return meP.then(function (me) {
			return adminP.then(function (admin) {
				var menuOpenStream = Stream.once(false);
				$('body').on('click', function () {
					signInStream.push(false);
					menuOpenStream.push(false);
				});
				var rightButtons = headerRightButtons(me, admin, signInStream);
				var buttons = sideBySide({
					gutterSize: separatorSize,
				}, rightButtons);
				var bars = headerButton(fonts.faI('bars')).all([
					link,
					clickThis(function (ev) {
						menuOpenStream.push(!menuOpenStream.lastValue());
						ev.stopPropagation();
					}),
				]);
				return dropdownPanel(dropdownPanel(border(colors.middleGray, {
					bottom: 1,
				}, alignLRM({
					middle: bodyColumn(stack({}, [
						alignLRM({
							left: alignTBM({
								middle: toggleComponent([
									linkTo(domain + '/#!', image({
										src: 'https://www.holibirthday.com/content/man3.png',
										minHeight: 44,
										minWidth: 55.45,
									})),
									image({
										src: 'https://www.holibirthday.com/content/man3.png',
										minHeight: 44,
										minWidth: 55.45,
									}).all([
										function (i, context) {
											i.$el.css('cursor', 'pointer');
											Stream.combine([
												windowScroll,
												context.height,
												windowHash,
											], function (s, h, hash) {
												i.$el.css('opacity', ((hash === '' ||
																	   hash === '#' ||
																	   hash === '#!') &&
																	  s > 0) ? 1 : 0);
												setTimeout(function () {
													i.$el.css('transition', 'opacity 0.1s');
												});
											});
										},
										clickThis(function () {
											$('body').animate({scrollTop: 0}, 300);
										}),
									]),
								], windowHash.map(function (h) {
									if (-1 !== window.location.href.indexOf('gift')) {
										return 0;
									}
									return (h === '' ||
											h === '#' ||
											h === '#!') ? 1 : 0;
								})),
							}),
							right: componentStream(windowWidth.map(function (width) {
								if (width > 690) {
									menuOpenStream.push(false);
									return buttons;
								}
								return bars;
							})),
						}),
					])),
				})).all([
					withBackgroundColor(colors.pageBackgroundColor),
				]), alignLRM({
					right: border(black, {
						left: 1,
						bottom: 1,
					}, stack({
						gutterSize: separatorSize,
					}, rightButtons).all([
						withBackgroundColor(colors.pageBackgroundColor),
					])),
				}), menuOpenStream), signInForm().all([
					clickThis(function (ev) {
						ev.stopPropagation();
					}),
				]), signInStream);
			});
		});
	}));
});
