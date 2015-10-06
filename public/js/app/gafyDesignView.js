define([
	'bar',
	'bodyColumn',
	'cart',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'forms',
	'gafy',
	'gafyColors',
	'gafyDesignRow',
	'gafyDesignSmall',
	'gafyStyleSmall',
	'holibirthdayRow',
	'opacityGridSelect',
	'separatorSize',
	'socialMedia',
	'socialMediaButton',
	'submitButton',
], function (bar, bodyColumn, cart, colors, confettiBackground, db, fonts, forms, gafy, gafyColors, gafyDesignRow, gafyDesignSmall, gafyStyleSmall, holibirthdayRow, opacityGridSelect, separatorSize, socialMedia, socialMediaButton, submitButton) {
	return function (designId) {
		return promiseComponent(db.gafyDesign.findOne({
			_id: designId,
		}).then(function (design) {
			return db.gafyStyle.find().then(function (styles) {
				var gafyOrderStreams = Stream.splitObject({
					style: null,
					color: null,
					size: null,
				});
				var gafyOrderS = Stream.combineObject(gafyOrderStreams);

				var mustChooseEverythingS = Stream.once(false);
				
				gafyOrderS.map(function () {
					mustChooseEverythingS.push(false);
				});
				
				var designSocialMediaButton = socialMediaButton(function (verb) {
					return verb + ' this Design';
				});

				var shareButtons = bodyColumn(sideBySide({
					gutterSize: separatorSize,
				}, [
					designSocialMediaButton(socialMedia.facebook),
					designSocialMediaButton(socialMedia.twitter),
				]));


				return stack({
					gutterSize: separatorSize,
				}, [
					linkTo('#!gifts', confettiBackground(
						bodyColumn(
							gafyDesignRow(design)))),
					bodyColumn(stack({
						gutterSize: separatorSize,
					}, [
						shareButtons,
						text('Style').all([
							fonts.h1,
							fonts.ralewayThinBold,
						]),
						opacityGridSelect(gafyOrderStreams.style, gafy.stylesForDesign(styles, design).map(function (style) {
							return {
								component: gafyStyleSmall(style),
								value: style,
							};
						})),
						text('Color').all([
							fonts.h1,
							fonts.ralewayThinBold,
						]),
						componentStream(gafyOrderStreams.style.map(function (style) {
							return style ? opacityGridSelect(gafyOrderStreams.color, gafy.colorsForDesignAndStyle(design, style).map(function (colorName) {
								var gafyColor = gafyColors.filter(function (gc) {
									return gc.name === colorName;
								})[0];
								return {
									component: stack({}, [
										alignLRM({
											middle: div.all([
												withBackgroundColor(gafyColor.color),
												withMinWidth(50),
												withMinHeight(50),
											]),
										}),
										text(gafyColor.name),
										text(rgbColorString(gafyColor.color)),
									]),
									value: gafyColors.indexOf(gafyColor),
								};
							})) : text('Choose a style');
						})),
						text('Size').all([
							fonts.h1,
							fonts.ralewayThinBold,
						]),
						componentStream(gafyOrderStreams.style.map(function (style) {
							return style ? forms.selectBox({
								name: 'size',
								options: style.sizes,
								stream: gafyOrderStreams.size,
							}) : text('Choose a style');
						})),
						componentStream(mustChooseEverythingS.map(function (mustChooseEverything) {
							return mustChooseEverything ? alignLRM({
								right: paragraph('You must choose a design, a style, a color, and a size', 280),
							}) : nothing;
						})),
						alignLRM({
							right: sideBySide({
								gutterSize: separatorSize,
							}, [
								submitButton(black, sideBySide({
									gutterSize: separatorSize,
								}, [
									fonts.fa('shopping-cart-plus'),
									text('Add to Wishlist'),
								])).all([
									link,
									clickThis(function () {
										var order = gafyOrderS.lastValue();
										if (!order.style ||
											!order.color ||
											!order.size) {
											mustChooseEverythingS.push(true);
										}
										else {
											var cartItem = {
												designId: design._id,
												styleId: order.style._id,
												designNumber: design.designNumber,
												designDescription: design.designDescription,
												printLocation: design.printLocation,
												styleNumber: order.style.styleNumber,
												styleDescription: order.style.styleDescription,
												color: order.color,
												size: order.size,
											};
											cart.addItem(cartItem);
											window.location.hash = '#!cart';
											window.location.reload();
										}
									}),
								]),
								submitButton(black, sideBySide({
									gutterSize: separatorSize,
								}, [
									fonts.fa('shopping-cart'),
									text('Add to Cart'),
								])).all([
									link,
									clickThis(function () {
										var order = gafyOrderS.lastValue();
										if (!order.style ||
											!order.color ||
											!order.size) {
											mustChooseEverythingS.push(true);
										}
										else {
											var cartItem = {
												designId: design._id,
												styleId: order.style._id,
												designNumber: design.designNumber,
												designDescription: design.designDescription,
												printLocation: design.printLocation,
												styleNumber: order.style.styleNumber,
												styleDescription: order.style.styleDescription,
												color: order.color,
												size: order.size,
											};
											cart.addItem(cartItem);
											window.location.hash = '#!cart';
											window.location.reload();
										}
									}),
								]),
							]),
						}),
					])),
				]);
			});	
		}));
	};
});
