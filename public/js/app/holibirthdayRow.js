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
			adjustMinHeight(function (mh) {
				return Math.max(240, mh);
			})(padding({
				all: separatorSize,
			}, alignTBM({
				middle: content,
			}))).all([
				withMinWidth(300, true),
			]),
		]);
	};
});
