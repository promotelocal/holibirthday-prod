define([
	'bodyColumn',
	'cart',
	'confettiBackground',
	'db',
	'fonts',
	'formatPrice',
	'gafyColors',
	'meP',
	'separatorSize',
	'submitButton',
], function (bodyColumn, cart, confettiBackground, db, fonts, formatPrice, gafyColors, meP, separatorSize, submitButton) {
	return function (user) {
		var wishlistD = Q.defer();
		return promiseComponent(db.gafyDesign.find().then(function (designs) {
			return db.gafyStyle.find().then(function (styles) {
				return meP.then(function (me) {
					if (user) {
						db.gafyWishlist.findOne({
							user: user,
						}).then(function (wishlist) {
							wishlistD.resolve(wishlist.items);
						});
					}
					else if (me) {
						db.gafyWishlist.findOne({
							user: me._id,
						}).then(function (wishlist) {
							if (wishlist) {
								location.hash = '#!wishlist/' + me._id;
							}
							else {
								wishlistD.resolve(cart.wishlistItems);
							}
						});
					}
					else {
						wishlistD.resolve(cart.wishlistItems);
					}
					var mayRemove = (me && user === me._id) ||
						(!me && !user);
					return wishlistD.promise.then(function (wishlistItems) {
						var cartLineItem = function (cartItem, index) {
							var design = designs.filter(function (d) {
								return d._id === cartItem.designId;
							})[0];
							var style = styles.filter(function (s) {
								return s._id === cartItem.styleId;
							})[0];
							var addedToCart = Stream.once(false);
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
										right: componentStream(addedToCart.map(function (added) {
											return added ? text('(Added to Cart)').all([
												$css('font-size', 15),
												link,
												clickThis(function () {
													cart.addItem(wishlistItems[index]);
													window.location.reload();
												}),
											]) : nothing;
										})),
									}),
									alignLRM({
										right: mayRemove ? text('Add to Cart').all([
											$css('font-size', 15),
											link,
											clickThis(function () {
												cart.addItem(wishlistItems[index]);
												addedToCart.push(true);
											}),
										]) : nothing,
									}),
									alignLRM({
										right: mayRemove ? text('(Remove Item)').all([
											$css('font-size', 15),
											link,
											clickThis(function () {
												cart.removeWishlistItem(index);
												window.location.reload();
											}),
										]) : nothing,
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
								}, wishlistItems.map(cartLineItem)),
								alignLRM({
									right: text('Total: ' + formatPrice(wishlistItems.reduce(function (a, cartItem) {
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
											fonts.fa('cart-plus'),
											text('Continue Shopping'),
										]))),
										linkTo('#!cart', submitButton(black, sideBySide({
											gutterSize: separatorSize,
										}, [
											fonts.fa('shopping-cart'),
											text('Cart'),
										]))),
									]),
								}),
							])),
						]);
					});
				});
			});
		})).all([
			function () {
				meP.then(function (me) {
					if (me) {
						wishlistD.promise.then(function (wishlist) {
							db.gafyWishlist.findOne({
								user: user,
							}).then(function (oldWishlist) {
								if (oldWishlist) {
									db.gafyWishlist.update({
										_id: oldWishlist._id,
									}, {
										user: me._id,
										items: wishlist,
									}).then(function () {
										location.hash = '#!wishlist/' + me._id;
									});
								}
								else {
									db.gafyWishlist.insert({
										user: me._id,
										items: wishlist,
									}).then(function () {
										location.hash = '#!wishlist/' + me._id;
									});
								}
							});
						});
					}
				});
			},
		]);
	};
});
