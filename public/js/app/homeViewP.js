define([
	'bar',
	'bodyColumn',
	'colors',
	'confettiBackground',
	'dailyTheme',
	'db',
	'fonts',
	'separatorSize',
	'siteCopyItemsP',
	'storiesP',
	'storyPaginate',
	'storyRowP',
], function (bar, bodyColumn, colors, confettiBackground, dailyTheme, db, fonts, separatorSize, siteCopyItemsP, storiesP, storyPaginate, storyRowP) {
	var bannerButton = function (label, fa) {
		return border(colors.holibirthdayDarkRed, {
			top: 5,
			radius: 5,
		}, padding(10, alignTBM({
			middle: stack({}, [
				paragraph(label, 150).all([
					fonts.bebasNeue,
					$css('text-align', 'center'),
					withFontColor(white),
				]),
				fonts.fa(fa).all([
					$css('text-align', 'center'),
					$css('font-size', '60px'),
					withFontColor(white),
				]),
			]),
		})).all([
			withBackgroundColor(colors.holibirthdayRed),
		]));
	};

	return siteCopyItemsP.then(function (siteCopyItems) {
		return storiesP.then(function (stories) {
			stories.sort(function (s1, s2) {
				return new Date(s2.createDate).getTime() - new Date(s1.createDate).getTime();
			});
			
			var useStoryPicture = function (story, c) {
				return border(black, 1, withBackgroundImage({
					src: story.imageUrl || './content/man.png',
				}, c.all([
					withBackgroundColor(color({
						a: 0.5,
					})),
					withFontColor(white),
				])));
			};
			
			var banner = bodyColumn(image({
				src: '/content/banner.png',
				chooseHeight: 1,
			}));

			var bannerButtons = bodyColumn(grid({
				handleSurplusWidth: evenSplitSurplusWidth,
				gutterSize: separatorSize,
			}, [
				alignLRM({
					middle: linkTo('#!editStory', bannerButton(siteCopyItems.find('Home Share Your Story'), 'bullhorn')),
				}),
				alignLRM({
					middle: linkTo('#!myHolibirthday', bannerButton(siteCopyItems.find('Home Claim Your Holibirthday'), 'gift')),
				}),
				alignLRM({
					middle: linkTo('#!contacts', bannerButton(siteCopyItems.find('Home Find Friends'), 'users')),
				}),
			]));

			var tagline = paragraph(siteCopyItems.find('Home Tagline')).all([
				fonts.bebasNeue,
				$css('text-align', 'center'),
				$css('font-size', 30),
			]);
			
			var firstView = confettiBackground(bodyColumn(dailyTheme));

			var restViews = bodyColumn(storyPaginate({
				perPage: 5,
				pageS: Stream.once(0),
			}, stories.map(storyRowP)));

			return stack({
				gutterSize: separatorSize * 2,
			}, [
				stack({
					gutterSize: separatorSize * 2,
				}, [
					banner,
					tagline,
				]),
				stack({
					gutterSize: separatorSize,
				}, [
					bannerButtons,
				]),
				stack({
					gutterSize: separatorSize,
				}, [
					firstView,
					alignLRM({
						middle: linkTo('#!browseStories', text(siteCopyItems.find('Home Stories')).all([
							fonts.h1,
						])),
					}),
					restViews,
					alignLRM({
						middle: linkTo('#!browseStories', text(siteCopyItems.find('Home Browse Stories')).all([
							withFontColor(colors.linkBlue),
							$css('text-decoration', 'underline'),
						])),
					})
				]),
			]);
		});
	});
});
