define([
	'bodyColumn',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'meP',
	'separatorSize',
	'socialMedia',
	'socialMediaButton',
	'writeOnImage',
], function (bodyColumn, confettiBackground, db, fonts, holibirthdayRow, meP, separatorSize, socialMedia, socialMediaButton, writeOnImage) {
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
				var holibirthdayTitle = profile.firstName + ' ' + profile.lastName + '\'s Holibirthday';

				var holibirthdaySocialMediaButton = socialMediaButton(function (verb) {
					return verb + (me && me._id === profile.user ? ' your certificate' : ' this certificate');
				});

				var shareButtons = bodyColumn(sideBySide({
					gutterSize: separatorSize,
				}, [
					holibirthdaySocialMediaButton(socialMedia.facebook),
					holibirthdaySocialMediaButton(socialMedia.twitter),
				]));

				var srcS = writeOnImage({
					width: 1080,
					height: 702,
				}, './content/certificate-01.png', [{
					center: {
						x: 540,
						y: 310,
					},
					text: profile.firstName + ' ' + profile.lastName,
					font: 'bold 42px Raleway Thin',
				}, {
					center: {
						x: 540,
						y: 540,
					},
					text: moment(holibirthday.date).format('MMMM Do'),
					font: 'bold 42px Raleway Thin',
				}].concat(profile.birthday ? [{
					center: {
						x: 160,
						y: 595,
					},
					text: 'Old Birthday',
					font: '20px BebasNeue',
				}, {
					center: {
						x: 160,
						y: 615,
					},
					text: moment(profile.birthday).format('MMMM Do'),
					font: '20px BebasNeue',
				}] : []));

				return stack({
					gutterSize: separatorSize,
				}, [
					holibirthday ?
						componentStream(srcS.map(function (src) {
							return bodyColumn(linkTo(src, image({
								src: src,
								minWidth: 0,
								chooseHeight: true,
							})));
						})):
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
