define([
	'domain',
	'separatorSize',
], function (domain, separatorSize) {
	return function (content, src) {
		return adjustMinSize({
			mw: function (mw) {
				return Math.max(300, mw);
			},
			mh: function (mh) {
				return Math.max(240, mh);
			},
		})(padding({
			all: separatorSize,
		}, grid({
			handleSurplusWidth: giveToNth(1),
			bottomToTop: true,
			gutterSize: separatorSize,
		}, [
			keepAspectRatioCorner({
				top: true,
			})(image({
				src: src || domain + '/content/man.png',
				minWidth: 300,
			})),
			alignTBM({
				middle: stack({}, [
					content,
					nothing.all([
						withMinWidth(300, true),
					]),
				]),
			}),
		])));
	};
});
