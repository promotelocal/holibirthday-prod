define([
	'separatorSize',
], function (separatorSize) {
	return function (content, src) {
		return grid({
			handleSurplusWidth: giveToNth(1),
			bottomToTop: true,
		}, [
			alignTBM({
				middle: alignLRM({
					middle: image({
						src: src || './content/man.png',
						minWidth: 300,
						chooseHeight: true,
					}),
				}),
			}),
			adjustMinSize({
				mw: function (mw) {
					return Math.max(300, mw);
				},
				mh: function (mh) {
					return Math.max(240, mh);
				},
			})(padding({
				all: separatorSize,
			}, alignTBM({
				middle: content,
			}))),
		]);
	};
});
