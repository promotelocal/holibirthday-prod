define([], function () {
	return (function () {
		var shareWindow = function (url) {
			var width  = 575,
				height = 400,
				left   = ($(window).width()  - width)  / 2,
				top    = ($(window).height() - height) / 2,
				opts   = 'status=1' +
                ',width='  + width  +
                ',height=' + height +
                ',top='    + top    +
                ',left='   + left;
			
			window.open(url, 'twitter', opts);
		};
		return {
			facebook: {
				icon: '<i class="fa fa-facebook"></i>',
				color: color({
					r: 59,
					g: 89,
					b: 152,
				}),
				name: 'Facebook',
				shareVerb: 'share',
				shareThisPage: function () {
					return FB.ui({
						method: 'share',
						href: location.href,
					});
				},
				countShares: function () {
				},
				posts: function () {
				},
			},
			twitter: {
				icon: '<i class="fa fa-twitter"></i>',
				color: color({
					r: 0,
					g: 172,
					b: 237,
				}),
				name: 'Twitter',
				shareVerb: 'tweet',
				shareThisPage: function () {
					return shareWindow('https://twitter.com/intent/tweet?url=' + encodeURIComponent(location.href));
				},
				countShares: function () {
				},
			},
		};
	})();

});
