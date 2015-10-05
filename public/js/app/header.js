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
], function (adminP, auth, bar, bodyColumn, cart, colors, fonts, meP, separatorSize, signInForm) {
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
			buttons.push(linkTo('#!admin', headerButton('Admin')));
		}
		
		buttons.push(linkTo('#!gifts', headerButton('Gifts')));

		if (cart.items.length > 0) {
			buttons.push(linkTo('#!cart', headerButton('Cart (' + cart.items.length + ')')));
		}
		
		var signIn = false;
		signInStream.push(signIn);
		if (me) {
			buttons.push(linkTo('#!user/' + me._id, headerButton('My Profile')));
			buttons.push(headerButton('Sign Out').all([
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
			buttons.push(headerButton('sign in').all([
				link,
				clickThis(function () {
					signIn = !signIn;
					signInStream.push(signIn);
				}),
			]));
			buttons.push(linkTo('#!register', headerButton('register')));
		}
		return buttons;
	};


	return promiseComponent(meP.then(function (me) {
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
	}));
});	
