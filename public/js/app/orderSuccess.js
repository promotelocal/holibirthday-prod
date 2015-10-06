define([
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'separatorSize',
], function (bodyColumn, confettiBackground, fonts, separatorSize) {
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
	
	return function (orderBatch) {
		return stack({
			gutterSize: separatorSize,
		}, [
			heading,
			bodyColumn(stack({
				gutterSize: separatorSize,
			}, [
				text('Order Placed').all([
					fonts.h1,
				]),
				text('Thank you for placing an order with Holibirthday'),
				text('Your order number is ' + orderBatch),
			].map(function (t) {
				return t.all([
					fonts.ralewayThinBold,
				]);
			}))),
		]);
	};
});
