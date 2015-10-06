define([
	'auth',
	'bar',
	'bodyColumn',
	'cart',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'formatPrice',
	'forms',
	'gafyColors',
	'meP',
	'prettyForms',
	'profileP',
	'separatorSize',
	'submitButton',
], function (auth, bar, bodyColumn, cart, colors, confettiBackground, db, fonts, formatPrice, forms, gafyColors, meP, prettyForms, profileP, separatorSize, submitButton) {
	return promiseComponent(db.gafyDesign.find().then(function (designs) {
		return db.gafyStyle.find().then(function (styles) {
			var orderBatchS = Stream.once('none');
			
			var cartThinLineItem = function (cartItem, index) {
				var design = designs.filter(function (d) {
					return d._id === cartItem.designId;
				})[0];
				var style = styles.filter(function (s) {
					return s._id === cartItem.styleId;
				})[0];
				return padding({
					top: separatorSize,
					bottom: separatorSize,
				}, alignLRM({
					left: sideBySide({
						gutterSize: separatorSize,
					}, [
						alignLRM({
							left: image({
								src: design.imageUrl,
								minHeight: 50,
								chooseWidth: 0,
							}),
						}),
						alignLRM({
							left: image({
								src: style.imageUrl,
								minHeight: 50,
								chooseWidth: 0,
							}),
						}),
						alignLRM({
							left: div.all([
								withBackgroundColor(gafyColors[cartItem.color].color),
								withMinWidth(50),
								withMinHeight(50),
							]),
						}),
						alignTBM({
							middle: text(cartItem.size + ' '  + gafyColors[cartItem.color].name + ' ' + design.designDescription + ' ' + style.styleDescription).all([
								fonts.ralewayThinBold,
							]),
						}),
					]),
					right: text(formatPrice(style.price)).all([
						fonts.ralewayThinBold,
						$css('font-size', 20),
					]),
				})).all([
					withBackgroundColor(multiplyColor(index % 2 ? 1 : 1.1)(colors.pageBackgroundColor)),
				]);
			};
			return meP.then(function (me) {
				return profileP.then(function (profile) {
					var order = {
					};
					
					var addressStreams = {
						firstName: Stream.once(''),
						lastName: Stream.once(''),
						line1: Stream.once(''),
						line2: Stream.once(''),
						city: Stream.once(''),
						state: Stream.once(''),
						zip: Stream.once(''),
						country: Stream.once(''),
					};
					var addressS = Stream.combineObject(addressStreams);
					addressS.onValue(function (address) {
						order.address = address;
					});

					var stripeStreams = {
						user: Stream.once((me && me._id) || '000000000000000000000000'),
						email: Stream.once((profile && profile.email) || ''),
						number: Stream.once(''),
						cvc: Stream.once(''),
						exp_month: Stream.once(''),
						exp_year: Stream.once(''),
					};
					var stripeS = Stream.combineObject(stripeStreams);

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

					var totalPrice = cart.items.reduce(function (a, cartItem) {
						return a + styles.filter(function (s) {
							return s._id === cartItem.styleId;
						})[0].price;
					}, 0);
						
					var thinCart = bodyColumn(stack({}, [
						stack({}, cart.items.map(cartThinLineItem)),
						bar.horizontal(1, black),
						bar.horizontal(separatorSize / 2),
						alignLRM({
							right: text('Total: ' + formatPrice(totalPrice)).all([
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
						sideBySide({
							handleSurplusWidth: evenSplitSurplusWidth,
							gutterSize: separatorSize,
						}, [
							prettyForms.input({
								name: 'First Name',
								fieldName: 'firstName',
								type: 'text',
								stream: addressStreams.firstName,
							}),
							prettyForms.input({
								name: 'Last Name',
								fieldName: 'lastName',
								type: 'text',
								stream: addressStreams.lastName,
							}),
						]),
						prettyForms.input({
							name: 'Line 1',
							fieldName: 'address1',
							type: 'text',
							stream: addressStreams.line1,
						}),
						prettyForms.input({
							name: 'Line 2',
							fieldName: 'address2',
							type: 'text',
							stream: addressStreams.line2,
						}),
						sideBySide({
							handleSurplusWidth: evenSplitSurplusWidth,
							gutterSize: separatorSize,
						}, [
							prettyForms.input({
								name: 'City',
								fieldName: 'city',
								type: 'text',
								stream: addressStreams.city,
							}),
							prettyForms.input({
								name: 'State',
								fieldName: 'state',
								type: 'text',
								stream: addressStreams.state,
							}),
							prettyForms.input({
								name: 'Zip',
								fieldName: 'zip',
								type: 'text',
								stream: addressStreams.zip,
							}),
							prettyForms.input({
								name: 'Country',
								fieldName: 'country',
								type: 'text',
								stream: addressStreams.country,
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
							name: 'Email',
							fieldName: 'email',
							type: 'text',
							stream: stripeStreams.email,
						}),
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
							prettyForms.input({
								name: 'Exp Month',
								type: 'text',
								stream: stripeStreams.exp_month,
							}),
							prettyForms.input({
								name: 'Exp Year',
								type: 'text',
								stream: stripeStreams.exp_year,
							}),
						]),
					]);


					var checkout = promiseComponent(auth.StripeP.then(function (Stripe) {
						var submittingS = Stream.once(false);
						var fillOutAllFieldsS = Stream.once(false);
						var couldNotChargeCardS = Stream.once(false);
					
						return bodyColumn(stack({
							gutterSize: separatorSize,
						}, [
							sideBySide({
								handleSurplusWidth: evenSplitSurplusWidth,
								gutterSize: separatorSize,
							}, [
								shippingAddress,
								billingAddress,
							]),
							componentStream(fillOutAllFieldsS.map(function (fillEm) {
								return fillEm ? alignLRM({
									right: text('Please fill out all fields')
								}) : nothing;
							})),
							componentStream(couldNotChargeCardS.map(function (fillEm) {
								return fillEm ? alignLRM({
									right: text('Could not charge card')
								}) : nothing;
							})),
							alignLRM({
								right: submitButton(black, text('Place Order')).all([
									link,
									clickThis(function () {
										fillOutAllFieldsS.push(false);
										couldNotChargeCardS.push(false);
										orderBatchS.push(Math.random().toString().substring(2));

										var address = addressS.lastValue();
										var stripeInfo = stripeS.lastValue();

										var gafyOrders = cart.items.map(function (cartItem) {
											return {
												user: stripeInfo.user,
												orderBatch: orderBatchS.lastValue(),
												customerEmailAddress: stripeInfo.email,
												firstName: address.firstName,
												lastName: address.lastName,
												addressLine1: address.line1,
												addressLine2: address.line2,
												addressCity: address.city,
												addressState: address.state,
												addressZip: address.zip,
												addressCountry: address.country,
												designNumber: cartItem.designNumber,
												designDescription: cartItem.designDescription,
												printLocation: cartItem.printLocation,
												styleNumber: cartItem.styleNumber,
												styleDescription: cartItem.styleDescription,
												color: gafyColors[cartItem.color].name,
												size: cartItem.size,
												quantity: 1,
												// todo: have them pick a shipping method
												shippingMethod: 'shipping method goes here',
											};
										});
										var requiredFields = [
											'customerEmailAddress',
											'firstName',
											'lastName',
											'addressLine1',
											'addressLine2',
											'addressCity',
											'addressState',
											'addressZip',
											'addressCountry',
											'designNumber',
											'designDescription',
											'printLocation',
											'styleNumber',
											'styleDescription',
											'color',
											'size',
											'quantity',
											'shippingMethod',
										];
										for (var i = 0; i < gafyOrders.length; i++) {
											var gafyOrder = gafyOrders[i];
											for (var j = 0; j < requiredFields.length; j++) {
												if (gafyOrder[requiredFields[j]].length === 0) {
													fillOutAllFieldsS.push(true);
													submittingS.push(false);
													return;
												}
											}
										}
										
										var payWithStripe = function () {
											Stripe.card.createToken({
												number: stripeInfo.number,
												cvc: stripeInfo.cvc,
												exp_month: stripeInfo.exp_month,
												exp_year: stripeInfo.exp_year,
											}, function (status, result) {
												if (status !== 200) {
													couldNotChargeCardS.push(true);
													submittingS.push(false);
													return;
												}
												db.stripePayment.insert({
													user: stripeInfo.user,
													email: stripeInfo.email,
													orderBatch: orderBatchS.lastValue(),
													amount: totalPrice,
													stripeToken: result.id,
												}).then(function () {
													while (cart.items.length > 0) {
														cart.removeItem(0);
													}
													window.location.hash = '#!orderSuccess/' + orderBatchS.lastValue();
													window.location.reload();
												}, function () {
													couldNotChargeCardS.push(true);
													submittingS.push(false);
												});
											});
										};

										var insertGafyOrder = function (i) {
											if (i === gafyOrders.length) {
												payWithStripe();
											}
											db.gafyOrder.insert(gafyOrders[i]).then(function () {
												insertGafyOrder(i + 1);
											});
										};
										
										if (!submittingS.lastValue()) {
											submittingS.push(true);
											insertGafyOrder(0);
										}
									}),
								]),
							}),
						]));
					}));

					
					return stack({
						gutterSize: separatorSize,
					}, [
						heading,
						thinCart,
						checkout,
					]);
				});
			});
		});
	}));
});
