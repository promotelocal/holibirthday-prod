define([
	'fonts',
	'holibirthdayRow',
	'profilesP',
	'separatorSize',
], function (fonts, holibirthdayRow, profilesP, separatorSize) {
	return function (story) {
		return promiseComponent(profilesP.then(function (profiles) {
			var profile = profiles.filter(function (p) {
				return p.user === story.user;
			})[0];
			var paragraphs = [];
			var n = 0;
			var chars = 0;
			var maxChars = 100;
			var $text = $(story.text);
			while (chars < maxChars && n < $text.length) {
				var $paragraph = $($text[n]);
				var length = $paragraph.text().length;
				chars += length;
				n += 1;
				paragraphs.push(paragraph($paragraph.html() || ""));
			}
			return linkTo('#!story/' + story._id, holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				paragraph(story.name).all([
					fonts.h2,
				]),
				stack({
					gutterSize: 16,
					collapseGutters: true,
				}, paragraphs),
				linkTo('#!user/' + profile.user, text('by ' + profile.firstName + ' ' + profile.lastName).all([
					fonts.ralewayThinBold,
				])),
				
			]).all([
				withMinWidth(300, true),
			]), story.imageUrl || './content/man.png'));
		}));
	};
});
