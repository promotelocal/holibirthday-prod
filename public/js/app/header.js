define([
	'adminP',
	'auth',
	'bar',
	'bodyColumn',
	'cart',
	'colors',
	'fonts',
	'meP',
	'separatorSize',
	'signInForm',
	'siteCopyItemsP',
], function (adminP, auth, bar, bodyColumn, cart, colors, fonts, meP, separatorSize, signInForm, siteCopyItemsP) {
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
					$css('font-size', '20px'),
				],
			})(text);
		};

		var headerRightButtons = function (me, admin, signInStream) {
			var buttons = [];
			if (admin) {
				buttons.push(linkTo('#!admin', headerButton(siteCopyItems.find('Header Admin'))));
			}
			
			buttons.push(linkTo('#!gifts', headerButton(siteCopyItems.find('Header Gifts'))));

			if (cart.items.length > 0) {
				buttons.push(linkTo('#!cart', headerButton(siteCopyItems.find('Header Cart') + ' (' + cart.items.length + ')')));
			}
			
			if (cart.wishlistItems.length > 0) {
				buttons.push(linkTo('#!wishlist', headerButton(siteCopyItems.find('Header Wishlist') + ' (' + cart.wishlistItems.length + ')')));
			}
			
			var signIn = false;
			signInStream.push(signIn);
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
					clickThis(function () {
						signIn = !signIn;
						signInStream.push(signIn);
					}),
				]));
				buttons.push(linkTo('#!register', headerButton(siteCopyItems.find('Header Register'))));
			}
			return buttons;
		};


		return meP.then(function (me) {
			return adminP.then(function (admin) {
				var signInStream = Stream.never();
				return dropdownPanel(border(colors.middleGray, {
					bottom: 1,
				}, alignLRM({
					middle: bodyColumn(stack({}, [
						alignLRM({
							left: toggleComponent([
								linkTo('#!', image({
									src: '/content/man3.png',
									minHeight: 0,
									chooseWidth: 0,
								})),
								image({
									src: '/content/man3.png',
									minHeight: 0,
									chooseWidth: 0,
								}).all([
									function (i, context) {
										i.$el.css('opacity', '0');
										i.$el.css('cursor', 'pointer');
										i.$el.css('transition', 'opacity 0.5s');
										Stream.combine([
											windowScroll,
											context.height,
										], function (s, h) {
											i.$el.css('opacity', (s > h) ? 1 : 0);
										});
									},
									clickThis(function () {
										$('body').animate({scrollTop: 0}, 300);
									}),
								]),
							], windowHash.map(function (h) {
								return (h === '' ||
										h === '#' ||
										h === '#!') ? 1 : 0;
							})),
							right: sideBySide({
								gutterSize: separatorSize,
							}, headerRightButtons(me, admin, signInStream)),
						}),
					])),
				})).all([
					withBackgroundColor(colors.pageBackgroundColor),
				]), signInForm(), signInStream);
			});
		});
	}));
});
