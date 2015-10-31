$(function () {
	waitForWebfonts([
		'BebasNeue',
		'CelebrationTime',
		'FontAwesome',
		'Open Sans',
		'Raleway Thin',
	], function () {
		$('body').append('<script src="app.js"></script>');
	});
});
