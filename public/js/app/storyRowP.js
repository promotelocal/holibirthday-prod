define([
	'fonts',
	'profilesP',
	'separatorSize',
], function (fonts, profilesP, separatorSize) {
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
			return a.all([
				$prop('href', '#!story/' + story._id),
				child(grid({
					handleSurplusWidth: giveToSecond,
				}, [
					alignTBM({
						middle: image({
							src: story.imageUrl || './content/man.png',
							minWidth: 300,
							chooseHeight: 0,
						}),
					}),
					padding({
						left: 30,
						right: 30,
					}, stack({
						gutterSize: separatorSize,
					}, [
						text(story.name).all([
							fonts.ralewayThinBold,
							$css('font-size', 40),
						]),
						stack({}, paragraphs),
						linkTo('#!user/' + profile.user, text('by ' + profile.firstName + ' ' + profile.lastName).all([
							fonts.ralewayThinBold,
						])),
					])).all([
						withMinWidth(300, true),
					]),
				])),
				wireChildren(passThroughToFirst),
			]);
		}));
	};
});
