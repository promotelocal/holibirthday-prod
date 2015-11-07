define([
	'separatorSize',
], function (separatorSize) {
	return function (content, src) {
		return padding({
			all: separatorSize,
		}, grid({
			handleSurplusWidth: giveToNth(1),
			bottomToTop: true,
			gutterSize: separatorSize,
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
			})(alignTBM({
				middle: content,
			})),
		]));
	};
});
