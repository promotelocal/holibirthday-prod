define([], function () {
	return {
		ralewayThin: $css('font-family', 'Raleway Thin'),
		bebasNeue: function (i) {
			i.$el.css('font-family', 'BebasNeue');
			i.$el.css('font-size', '20px');
			setTimeout(function () {
				i.updateDimensions();
			});
		},
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
			return text('<i\tclass="fa\tfa-' + fontAwesomeIcon + '"></i>');
		},
		faI: function (fontAwesomeIcon) {
			return '<i\tclass="fa\tfa-' + fontAwesomeIcon + '"></i>';
		},
	};
});	
