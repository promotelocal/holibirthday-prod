define([
	'bar',
	'bodyColumn',
	'cart',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'formatPrice',
	'gafy',
	'gafyColors',
	'gafyDesignRow',
	'gafyDesignSmall',
	'gafyStyleSmall',
	'holibirthdayRow',
	'meP',
	'opacityGridSelect',
	'separatorSize',
	'siteCopyItemsP',
], function (bar, bodyColumn, cart, colors, confettiBackground, db, fonts, formatPrice, gafy, gafyColors, gafyDesignRow, gafyDesignSmall, gafyStyleSmall, holibirthdayRow, meP, opacityGridSelect, separatorSize, siteCopyItemsP) {
	return promiseComponent(db.gafyDesign.find().then(function (designs) {
		return siteCopyItemsP.then(function (copy) {
			return meP.then(function (me) {
				return stack({
					gutterSize: separatorSize,
				}, [
					confettiBackground(
						bodyColumn(
							holibirthdayRow(stack({
								gutterSize: separatorSize,
								collapseGutters: true,
							}, [
								text(copy.find('Gifts Title')).all([
									fonts.ralewayThinBold,
									fonts.h1,
								]),
								linkTo('#!cart', cart.items.length > 0 ? text(copy.find('Gifts Cart') + ' (' + cart.items.length + ')').all([
									fonts.ralewayThinBold,
									fonts.h1,
								]) : nothing),
								linkTo((me ? '#!wishlist' + '/' + me._id : '#!wishlist'), cart.wishlistItems.length > 0 ? text(copy.find('Gifts Wishlist') + ' (' + cart.wishlistItems.length + ')').all([
									fonts.ralewayThinBold,
									fonts.h1,
								]) : nothing),
							])))),
					bodyColumn(text('Choose a Design').all([
						fonts.h1,
						fonts.ralewayThinBold,
					])),
					bodyColumn(stack({
						gutterSize: separatorSize,
					}, intersperse(designs.map(function (design) {
						return linkTo('#!design/' + design._id, gafyDesignRow(design));
					}), bar.horizontal(1).all([
						withMinHeight(1, true),
						withBackgroundColor(colors.middleGray),
					])))),
				]);
			});
		});
	}));
});
