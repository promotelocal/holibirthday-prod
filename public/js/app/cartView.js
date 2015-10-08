define([
	'bodyColumn',
	'cart',
	'confettiBackground',
	'db',
	'fonts',
	'formatPrice',
	'gafyColors',
	'holibirthdayRow',
	'separatorSize',
	'submitButton',
], function (bodyColumn, cart, confettiBackground, db, fonts, formatPrice, gafyColors, holibirthdayRow, separatorSize, submitButton) {
	return promiseComponent(db.gafyDesign.find().then(function (designs) {
		return db.gafyStyle.find().then(function (styles) {
			var cartLineItem = function (cartItem, index) {
				var design = designs.filter(function (d) {
					return d._id === cartItem.designId;
				})[0];
				var style = styles.filter(function (s) {
					return s._id === cartItem.styleId;
				})[0];
				return sideBySide({
					handleSurplusWidth: giveToFirst,
				}, [
					linkTo('#!design/' + cartItem.designId, grid({
						minColumnWidth: 10,
						gutterSize: separatorSize,
					}, [
						alignLRM({
							left: image({
								src: design.imageUrl,
								minHeight: 200,
								chooseWidth: 0,
							}),
						}),
						alignLRM({
							left: image({
								src: style.imageUrl,
								minHeight: 200,
								chooseWidth: 0,
							}),
						}),
						stack({
							gutterSize: separatorSize,
						}, [
							text(gafyColors[cartItem.color].name + ' ' + design.designDescription + ' ' + style.styleDescription).all([
								fonts.ralewayThinBold,
							]),
							alignLRM({
								left: div.all([
									withBackgroundColor(gafyColors[cartItem.color].color),
									withMinWidth(50),
									withMinHeight(50),
								]),
							}),
							text('Size: ' + cartItem.size).all([
								fonts.ralewayThinBold,
							]),
						]),
					])),
					stack({}, [
						alignLRM({
							right: text(formatPrice(style.price)).all([
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
				confettiBackground(bodyColumn(holibirthdayRow(text('Shopping Cart').all([
					fonts.ralewayThinBold,
					$css('font-size', 40),
				])))),
				bodyColumn(stack({
					gutterSize: separatorSize,
				}, [
					stack({
						gutterSize: separatorSize,
					}, cart.items.map(cartLineItem)),
					alignLRM({
						right: text('Total: ' + formatPrice(cart.items.reduce(function (a, cartItem) {
							return a + styles.filter(function (s) {
								return s._id === cartItem.styleId;
							})[0].price;
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
	}));
});
