define([
	'auth',
	'bar',
	'bodyColumn',
	'cart',
	'colors',
	'confettiBackground',
	'fonts',
	'formatPrice',
	'forms',
	'meP',
	'prettyForms',
	'separatorSize',
	'submitButton',
], function (auth, bar, bodyColumn, cart, colors, confettiBackground, fonts, formatPrice, forms, meP, prettyForms, separatorSize, submitButton) {
	var cartThinLineItem = function (cartItem, index) {
		var storeItem = storeItems[cartItem.storeItem];
		return alignLRM({
			left: sideBySide({}, [
				image({
					src: storeItem.colors[cartItem.color].src,
					minWidth: 50,
				}),
				alignTBM({
					top: padding({
						top: 10,
					}, text('Size ' + storeItem.sizes[cartItem.size] + ' ' + storeItem.colors[cartItem.color].name + ' ' + storeItem.name).all([
						fonts.ralewayThinBold,
					])),
				}),
			]),
			right: text(formatPrice(storeItem.price)).all([
				fonts.ralewayThinBold,
				$css('font-size', 20),
			]),
		}).all([
			withBackgroundColor(multiplyColor(index % 2 ? 1.1 : 1)(colors.pageBackgroundColor)),
		]);
	};
	return meP.then(function (me) {
		var order = {
		};
		
		var addressStreams = {
			name: Stream.once(''),
			line1: Stream.once(''),
			line2: Stream.once(''),
			city: Stream.once(''),
			state: Stream.once(''),
			zip: Stream.once(''),
		};
		var addressStream = Stream.combineObject(addressStreams);
		addressStream.onValue(function (address) {
			order.address = address;
		});

		var stripeStreams = {
			number: Stream.once(''),
			cvc: Stream.once(''),
			exp_month: Stream.once(''),
			exp_year: Stream.once(''),
		};

		var heading = confettiBackground(alignLRM({
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
				}, text('Checkout').all([
					fonts.ralewayThinBold,
					$css('font-size', 40),
				])),
			])),
		}));

		var thinCart = bodyColumn(stack({}, [
			stack({}, cart.items.map(cartThinLineItem)),
			bar.horizontal(1, black),
			bar.horizontal(separatorSize / 2),
			alignLRM({
				right: text('Total: ' + formatPrice(cart.items.reduce(function (a, cartItem) {
					return a + storeItems[cartItem.storeItem].price;
				}, 0))).all([
					fonts.ralewayThinBold,
					$css('font-size', 20),
				]),
			}),
		]));


		var shippingAddress = stack({
			gutterSize: separatorSize,
		}, [
			text('Shipping Address').all([
				fonts.ralewayThinBold,
				$css('font-size', 30),
			]),
			prettyForms.input({
				name: 'Name',
				type: 'text',
				stream: addressStreams.name,
			}),
			prettyForms.input({
				name: 'Line 1',
				type: 'text',
				stream: addressStreams.line1,
			}),
			prettyForms.input({
				name: 'Line 2',
				type: 'text',
				stream: addressStreams.line2,
			}),
			sideBySide({
				handleSurplusWidth: evenSplitSurplusWidth,
				gutterSize: separatorSize,
			}, [
				prettyForms.input({
					name: 'City',
					type: 'text',
					stream: addressStreams.zip,
				}),
				prettyForms.input({
					name: 'State',
					type: 'text',
					stream: addressStreams.state,
				}),
				prettyForms.input({
					name: 'Zip',
					type: 'text',
					stream: addressStreams.zip,
				}),
			]),
		]);

		var billingAddress = stack({
			gutterSize: separatorSize,
		}, [
			text('Billing Information').all([
				fonts.ralewayThinBold,
				$css('font-size', 30),
			]),
			prettyForms.input({
				name: 'Card Number',
				type: 'text',
				stream: stripeStreams.number,
			}),
			sideBySide({
				handleSurplusWidth: evenSplitSurplusWidth,
				gutterSize: separatorSize,
			}, [
				prettyForms.input({
					name: 'CVC',
					type: 'text',
					stream: stripeStreams.cvc,
				}),
				stack({}, [
					text('Expiration (MM/YYYY)').all([
						fonts.ralewayThinBold,
					]),
					sideBySide({
						handleSurplusWidth: evenSplitSurplusWidth,
						gutterSize: separatorSize,
					}, [
						forms.inputBox(stripeStreams.exp_month, 'text', 'exp-month', [
							$prop('data-stripe', 'exp-month'),
							$prop('size', '2'),
						]),
						forms.inputBox(stripeStreams.exp_year, 'text', 'exp-year', [
							$prop('data-stripe', 'exp-year'),
							$prop('size', '4'),
						]),
					]),
				]),
			]),
		]);


		var checkout = promiseComponent(auth.StripeP.then(function () {
			return bodyColumn(stack({}, [
				sideBySide({
					handleSurplusWidth: evenSplitSurplusWidth,
					gutterSize: separatorSize,
				}, [
					shippingAddress,
					billingAddress,
				]),
				alignLRM({
					right: submitButton(black, text('Submit Payment')).all([
						link,
						clickThis(function () {
						}),
					]),
				}),
			]));
		}));

		
		return stack({}, [
			heading,
			thinCart,
			checkout,
		]);
	});
});
