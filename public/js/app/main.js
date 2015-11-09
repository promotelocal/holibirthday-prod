window.app = function () {
	if (-1 === window.location.origin.indexOf('holibirthdaygift')) {
		require(['app'], function (app) {
			rootComponent(app);
		});
	}
	else {
		require([
			'gift',
			'header',
			'footer',
		], function (gift, header, footer) {
			rootComponent(header.all([
				$addClass('reset'),
				$css('z-index', 100),
				$css('position', 'fixed'),
			]));
			var $footerContainer = $(document.createElement('div'))
				.appendTo($('#footer'))
				.css('position', 'relative');
			rootComponent(footer.all([
				$addClass('reset'),
				$css('z-index', 100),
			]), {
				$el: $footerContainer,
			});
			var $giftContainer = $(document.createElement('div'))
				.prependTo('#content')
				.css('position', 'relative');
			rootComponent(gift, {
				$el: $giftContainer,
			});
		});
	}
};
