define([], function () {
	return {
		ralewayThin: $css('font-family', 'Raleway Thin'),
		bebasNeue: $css('font-family', 'BebasNeue'),
		celebrationTime: $css('font-family', 'CelebrationTime'),
		
		ralewayThinBold: function (i) {
			i.$el.css('font-family', 'Raleway Thin');
			i.$el.css('font-weight', 'bold');
			setTimeout(function () {
				i.updateDimensions();
			});
		},

		h1: function (i) {
			i.$el.css('font-family', 'Raleway Thin');
			i.$el.css('font-weight', 'bold');
			i.$el.css('font-size', px(40));
			setTimeout(function () {
				i.updateDimensions();
			});
		},
		h2: function (i) {
			i.$el.css('font-family', 'Raleway Thin');
			i.$el.css('font-weight', 'bold');
			i.$el.css('font-size', px(30));
			setTimeout(function () {
				i.updateDimensions();
			});
		},
		h3: function (i) {
			i.$el.css('font-family', 'Raleway Thin');
			i.$el.css('font-weight', 'bold');
			i.$el.css('font-size', px(20));
			setTimeout(function () {
				i.updateDimensions();
			});
		},

		fa: function (fontAwesomeIcon) {
			return text('<i class="fa fa-' + fontAwesomeIcon + '"></i>');
		},
	};
});	
