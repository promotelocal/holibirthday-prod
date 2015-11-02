$(function () {
	waitForWebfonts([
		'BebasNeue',
		'CelebrationTime',
		'FontAwesome',
		'Open Sans',
		'Raleway Thin',
	], function () {
		var interval = setInterval(function () {
			if (document.readyState === 'complete') {
				clearInterval(interval);
				window.app();			
			}
		}, 100);
	});
});
