define([
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'meP',
	'separatorSize',
	'socialMedia',
	'socialMediaButton',
], function (bodyColumn, colors, confettiBackground, db, fonts, holibirthdayRow, meP, separatorSize, socialMedia, socialMediaButton) {
	return function (user) {
		return promiseComponent(Q.all([
			db.holibirthday.findOne({
				user: user,
			}),
			db.profile.findOne({
				user: user,
			}),
		]).then(function (results) {
			return meP.then(function (me) {
				var holibirthday = results[0];
				var profile = results[1];
				if (!holibirthday) {
					return nothing;
				}
				
				var srcS = Stream.create();
				var canvas = document.createElement('canvas');
				var $canvas = $(canvas);
				$canvas.appendTo($('body'))
					.prop('width', 1080)
					.prop('height', 702);

				var ctx = canvas.getContext('2d');

				var drawCenteredText = function (p, text, font) {
					ctx.font = font;
					var width = ctx.measureText(text).width;
					ctx.fillText(text, p.x - width / 2, p.y);
				};
				
				var img = new Image();
				img.onload = function() {
					ctx.drawImage(img, 0, 0);
					drawCenteredText({
						x: 540,
						y: 310,
					}, profile.firstName + ' ' + profile.lastName, 'bold 30px Raleway Thin');
					drawCenteredText({
						x: 540,
						y: 540,
					}, moment(holibirthday.date).utc().format('MMMM Do'), 'bold 30px Raleway Thin');
					if (profile.birthday) {
						drawCenteredText({
							x: 160,
							y: 595,
						}, 'Old Birthday', '20px BebasNeue');
						drawCenteredText({
							x: 160,
							y: 615,
						}, moment(profile.birthday).utc().format('MMMM Do'), '20px BebasNeue');
					}
					setTimeout(function () {
						srcS.push(canvas.toDataURL());
						$canvas.remove();
					});
				};
				img.src = './content/certificate-01.png';
				
				var holibirthdaySocialMediaButton = socialMediaButton(function (verb) {
					return verb + (me && me._id === profile.user ? ' your certificate' : ' this certificate');
				});

				var shareButtons = bodyColumn(alignLRM({
					middle: sideBySide({
						gutterSize: separatorSize,
					}, [
						holibirthdaySocialMediaButton(socialMedia.facebook),
						holibirthdaySocialMediaButton(socialMedia.twitter),
					].map(function (b) {
						return b.all([
							withBackgroundColor(colors.pageBackgroundColor),
							clickThis(function (ev) {
								ev.stopPropagation();
							}),
						]);
					})),
				}));


				return stack2({
					gutterSize: separatorSize,
					handleSurplusHeight: giveHeightToNth(0),
				}, [
					holibirthday ?
						componentStream(srcS.map(function (src) {
							return bodyColumn(keepAspectRatio(linkTo(src, image({
								src: src,
								useNativeSize: true,
							}))));
						})).all([
							withMinWidth(0, true),
							withMinHeight(0, true),
						]):
						bodyColumn(text(profile.firstName + ' ' + profile.lastName + ' does not have a holibirthday!').all([
							fonts.ralewayThinBold,
							fonts.h1,
						])),
					shareButtons,
				]);
			});
		}));
	};
});
