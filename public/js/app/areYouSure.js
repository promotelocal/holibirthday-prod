define([
	'fonts',
	'separatorSize',
	'submitButton',
], function (fonts, separatorSize, submitButton) {
	return function (config) {
		config = config || {};
		config.text = config.text || 'Are you sure?';
		config.yesText = config.yesText || 'Yes';
		config.noText = config.noText || 'No';
		config.onYes = config.onYes || function () {};
		config.onNo = config.onNo || function () {};

		var instanceD = Q.defer();

		var destroyInstance = function () {
			instanceD.promise.then(function (instance) {
				instance.$el.css('opacity', 0);
				setTimeout(function () {
					instance.destroy();
				}, 200);
			});
		};

		var c = extendToWindowBottom(alignLRM({
			middle: alignTBM({
				middle: stack({
					gutterSize: separatorSize,
				}, [
					paragraph(config.text, 300).all([
						fonts.h1,
						fonts.ralewayThinBold,
						$css('text-align', 'center'),
					]),
					alignLRM({
						left: submitButton(text(config.noText).all([
							fonts.bebasNeue,
						])).all([
							link,
							clickThis(function () {
								config.onNo();
								destroyInstance();
							}),
						]),
						right: submitButton(text(config.yesText).all([
							fonts.bebasNeue,
						])).all([
							link,
							clickThis(function () {
								config.onYes();
								destroyInstance();
							}),
						]),
					}),
				]),
			}),
		})).all([
			$css('position', 'fixed'),
			function (instance) {
				instance.$el.css('opacity', 0);
				setTimeout(function () {
					instance.$el.css('transition', 'opacity 0.2s')
						.css('opacity', 1);
				});
			},
		]);

		instanceD.resolve(rootComponent(c));
	};
});
