define([
	'fonts',
	'separatorSize',
], function (fonts, separatorSize) {
	return function (textFunc) {
		return function (sm) {
			return border(sm.color, {
				all: 2,
				radius: 2,
			}, padding(10, sideBySide({
				gutterSize: separatorSize,
			},[
				text(sm.icon),
				text(textFunc(sm.shareVerb)).all([
					fonts.bebasNeue,
				]),
			]))).all([
				link,
				withFontColor(sm.color),
				clickThis(function () {
					sm.shareThisPage();
				}),
			]);
		};
	};
});
