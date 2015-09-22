define([
	'separatorSize',
], function (separatorSize) {
	return function (content, src) {
		return grid({
			handleSurplusWidth: giveToNth(1),
		}, [
			alignTBM({
				middle: image({
					src: src || './content/man.png',
					minWidth: 300,
					chooseHeight: true,
				}),
			}),
			padding({
				all: separatorSize,
			}, alignTBM({
				middle: content,
			})).all([
				withMinWidth(300, true),
			]),
		]);
	};
});
