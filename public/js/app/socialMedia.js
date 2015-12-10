define([
	'domain',
], function (domain) {
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
				icon: '<i\tclass="fa\tfa-facebook"></i>',
				color: color({
					r: 59,
					g: 89,
					b: 152,
				}),
				name: 'Facebook',
				shareVerb: 'share',
				shareThisPage: function (config) {
					config = config || {};
					if (config.description && config.description.length > 200) {
						config.description = config.description.substring(0, 197) + '...';
					}
					config.imageUrl = config.imageUrl || './content/man2.png';
					if (config.imageUrl.indexOf('/api') === 0) {
						config.imageUrl = domain + config.imageUrl;
					}
					if (config.imageUrl.indexOf('.') === 0) {
						config.imageUrl = domain + '/' + config.imageUrl;
					}
					console.log(config.imageUrl);
					return FB.ui({
						display: 'popup',
						method: 'feed',
						picture: config.imageUrl,
						name: config.name,
						caption: config.text,
						description: config.description,
						href: location.href,
					});
				},
				api: function () {
					var args = Array.prototype.slice.call(arguments);
					var d = Q.defer();
					args[3] = function (result) {
						d.resolve(result);
					};
					FB.api.apply(null, args);
					return d.promise;
				},
			},
			twitter: {
				icon: '<i\tclass="fa\tfa-twitter"></i>',
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
