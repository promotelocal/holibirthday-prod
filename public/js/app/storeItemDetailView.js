define([
	'bar',
	'bodyColumn',
	'cart',
	'colors',
	'confettiBackground',
	'fonts',
	'formatPrice',
	'prettyForms',
	'separatorSize',
	'submitButton',
], function (bar, bodyColumn, cart, colors, confettiBackground, fonts, formatPrice, prettyForms, separatorSize, submitButton) {
	return function (id) {
		var storeItem = storeItems[id];

		var cartItemStreams = {
			storeItem: Stream.once(id),
			color: Stream.once(0),
			size: Stream.once(0),
		};
		var cartItemS = Stream.combineObject(cartItemStreams);
		
		var picture = alignTBM({
			middle: image({
				src: storeItem.imageSrc,
				minWidth: 250,
				chooseHeight: 0,
			}),
		});
		var description = sideBySide({
			handleSurplusWidth: giveToFirst,
		}, [
			stack({
				gutterSize: separatorSize,
			}, [
				text(storeItem.name).all([
					fonts.ralewayThinBold,
					$css('font-size', 40),
				]),
				text('Style: ' + storeItem.style).all([
					fonts.ralewayThinBold,
					$css('font-size', 20),
				]),
				text(storeItem.description).all([
					fonts.ralewayThinBold,
					$css('font-size', 20),
				]),
			]),
			text(formatPrice(storeItem.price)).all([
				fonts.ralewayThinBold,
				$css('font-size', 20),
			]),
		]);

		var heading = confettiBackground(bodyColumn(grid({
			handleSurplusWidth: giveToSecond,
		}, [
			picture,
			padding({
				left: 30,
				right: 30,
				top: 50,
				bottom: 50,
			}, description).all([
				withMinWidth(300, true),
			]),
		])));

		var colorsExpanded = Stream.once(false);

		var darkBackgroundColor = multiplyColor(0.5)(colors.pageBackgroundColor);
		
		var shirtPicker = bodyColumn(border(darkBackgroundColor, {
			all: 1,
			radius: 5,
		}, sideBySide({
			handleSurplusWidth: giveToFirst,
		}, [
			grid({
				minColumnWidth: 150,
				gutterSize: separatorSize,
				outerGutter: true,
			}, storeItem.colors.map(function (color, index) {
				return stack({}, [
					alignLRM({
						middle: image({
							src: color.src,
							minWidth: 100,
						}),
					}),
				]).all([
					link,
					clickThis(function () {
						cartItemStreams.color.push(index);
						colorsExpanded.push(false);
					}),
				]);
			})),
			padding({
				top: separatorSize,
				right: separatorSize,
			}, fonts.fa('close').all([
				$css('font-size', 40),
				withFontColor(darkBackgroundColor),
				link,
				clickThis(function () {
					colorsExpanded.push(false);
				}),
				
				// Crude hack.  The X icon's width ends up being 0 for
				// some reason.  Right here we give it the min width it
				// should have had automatically.
				withMinWidth(31, true),
			])),
		])).all([
			withBackgroundColor(colors.pageBackgroundColor),
		]));

		var alignAllMiddle = function (cs) {
			return cs.map(function (c) {
				return alignLRM({
					middle: c,
				});
			});
		};

		var addToCart = bodyColumn(stack({
			gutterSize: separatorSize,
		}, [
			grid({
				minColumnWidth: 350,
				handleSurplusWidth: evenSplitSurplusWidth,
			}, [
				stack({
					gutterSize: separatorSize,
				}, alignAllMiddle([
					text('Choose Color').all([
						fonts.bebasNeue,
						$css('font-size', 40),
					]),
					text(cartItemStreams.color.map(function (index) {
						return storeItem.colors[index].name;
					})).all([
						fonts.ralewayThinBold,
						$css('font-size', 30),
					]),
					alignLRM({
						left: image({
							src: cartItemStreams.color.map(function (index) {
								return storeItem.colors[index].src;
							}),
							minWidth: 100,
						}).all([
							link,
							clickThis(function () {
								colorsExpanded.push(true);
							}),
						]),
					}),
				])),
				stack({
					gutterSize: separatorSize,
				}, alignAllMiddle([
					text('Choose Size').all([
						fonts.bebasNeue,
						$css('font-size', 40),
					]),
					prettyForms.radios({
						name: 'Category',
						fieldName: 'storyType',
						stream: cartItemStreams.size,
						options: storeItem.sizes.map(function (size, index) {
							return {
								name: size,
								value: index,
							};
						}),
					}),
					image({
						src: storeItem.sizeImageSrc,
						useNativeSize: true,
					}),
				])),
				stack({
					gutterSize: separatorSize,
					align: 'middle',
				}, alignAllMiddle([
					text('Price').all([
						fonts.bebasNeue,
						$css('font-size', 40),
					]),
					text(formatPrice(storeItem.price)).all([
						fonts.ralewayThinBold,
						$css('font-size', 30),
					]),
				])),
			]),
			alignLRM({
				middle: submitButton(sideBySide({
					gutterSize: separatorSize,
				}, [
					fonts.fa('shopping-cart'),
					text('Add to Cart'),
				])).all([
					link,
					clickThis(function () {
						cart.addItem(cartItemS.lastValue());
						window.location.hash = '#!cart';
						window.location.reload();
					}),
				]),
			}),
			modalDialog(colorsExpanded, 0.5)(shirtPicker),
		]));
		
		return stack({
			gutterSize: separatorSize,
		}, [
			heading,
			addToCart,
		]);
	};
});
