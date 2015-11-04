define([
	'separatorSize',
], function (separatorSize) {
	var mwOver1000 = function (i) {
		return i.minWidth.map(function (mw) {
			console.log(mw);
		});
	};
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
			adjustMinSize({
				mw: function (mw) {
					console.log(mw);
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
