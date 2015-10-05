define([
	'bodyColumn',
	'cart',
	'confettiBackground',
	'fonts',
	'formatPrice',
	'separatorSize',
	'submitButton',
], function (bodyColumn, cart, confettiBackground, fonts, formatPrice, separatorSize, submitButton) {
	var cartLineItem = function (cartItem, index) {
		var storeItem = storeItems[cartItem.storeItem];
		return sideBySide({
			handleSurplusWidth: giveToFirst,
		}, [
			linkTo('#!gift/' + cartItem.storeItem, grid({
				minColumnWidth: 10,
				gutterSize: separatorSize,
			}, [
				alignLRM({
					left: image({
						src: storeItem.imageSrc,
						minWidth: 200,
					}),
				}),
				stack({
					gutterSize: separatorSize,
				}, [
					text(storeItem.colors[cartItem.color].name).all([
						fonts.ralewayThinBold,
					]),
					alignLRM({
						left: image({
							src: storeItem.colors[cartItem.color].src,
							useNativeSize: true,
						}),
					}),
					text('Size: ' + storeItem.sizes[cartItem.size]).all([
						fonts.ralewayThinBold,
					]),
				]),
			])),
			stack({}, [
				alignLRM({
					right: text(formatPrice(storeItem.price)).all([
						fonts.ralewayThinBold,
						$css('font-size', 30),
					]),
				}),
				alignLRM({
					right: text('(Remove Item)').all([
						$css('font-size', 15),
						link,
						clickThis(function () {
							cart.removeItem(index);
							window.location.reload();
						}),
					]),
				}),
			]),
		]);
	};

	
	return stack({
		gutterSize: separatorSize,
	}, [
		confettiBackground(bodyColumn(sideBySide({}, [
			image({
				src: './content/man.png',
				minWidth: 300,
				chooseHeight: true,
			}),
			padding({
				left: 30,
				right: 30,
				top: 50,
				bottom: 50,
			}, text('Shopping Cart').all([
				fonts.ralewayThinBold,
				$css('font-size', 40),
			])),
		]))),
		bodyColumn(stack({
			gutterSize: separatorSize,
		}, [
			stack({
				gutterSize: separatorSize,
			}, cart.items.map(cartLineItem)),
			alignLRM({
				right: text('Total: ' + formatPrice(cart.items.reduce(function (a, cartItem) {
					return a + storeItems[cartItem.storeItem].price;
				}, 0))).all([
					fonts.ralewayThinBold,
					$css('font-size', 30),
				]),
			}),
			alignLRM({
				right: sideBySide({
					gutterSize: separatorSize,
				}, [
					linkTo('#!gifts', submitButton(black, sideBySide({
						gutterSize: separatorSize,
					}, [
						fonts.fa('shopping-cart'),
						text('Continue Shopping'),
					]))),
					linkTo('#!checkout', submitButton(black, sideBySide({
						gutterSize: separatorSize,
					}, [
						fonts.fa('tag'),
						text('Check Out'),
					]))),
				]),
			}),
		])),
	]);
});
