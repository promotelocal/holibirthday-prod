define([
	'colors',
	'fonts',
	'separatorSize',
], function (colors, fonts, separatorSize) {
	var footerLinks = [{
		name: 'Contact Holibirthday',
		link: '#!contactUs',
	}, {
		name: 'Privacy Policy',
		link: '#!privacyPolicy',
	}].map(function (info) {
		return linkTo(info.link, text(info.name).all([
			fonts.ralewayThinBold,
		]));
	});
	
	return alignLRM({
		middle: sideBySide({
			gutterSize: separatorSize,
		}, footerLinks),
	}).all([
		withBackgroundColor(colors.pageBackgroundColor),
	]);
});
