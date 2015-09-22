define([
	'bar',
	'bodyColumn',
	'colors',
	'confettiBackground',
	'fonts',
	'separatorSize',
	'storiesP',
	'storyRowP',
], function (bar, bodyColumn, colors, confettiBackground, fonts, separatorSize, storiesP, storyRowP) {
	var bannerButton = function (label, disabled) {
		var darken = desaturate(disabled ? 0.8 : 0);
		return border(darken(colors.holibirthdayDarkRed), {
			top: 5,
			radius: 5,
		}, padding(10, alignTBM({
			middle: paragraph(label, 150).all([
				fonts.bebasNeue,
				$css('text-align', 'center'),
				withFontColor(white),
			]),
		})).all([
			withBackgroundColor(darken(colors.holibirthdayRed)),
		]));
	};

	return storiesP.then(function (stories) {
		stories.sort(function (s1, s2) {
			return new Date(s2.createDate).getTime() - new Date(s1.createDate).getTime();
		});
		var firstStory = stories[0];
		var restStories = stories.slice(1);
		
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
				middle: linkTo('#!editStory', bannerButton('share your holibirthday story')),
			}),
			alignLRM({
				middle: linkTo('#!myHolibirthday', bannerButton('claim your holibirthday')),
			}),
			alignLRM({
				middle: bannerButton('find friends with birthdays on holidays (coming soon)', true),
			}),
		]));

		var tagline = paragraph('The only site dedicated to folks celebrating birthdays Upstaged by Holidays, Bad days and Forgotten').all([
			fonts.bebasNeue,
			$css('text-align', 'center'),
			$css('font-size', 30),
		]);
		
		var firstView = confettiBackground(bodyColumn(firstStory ? storyRowP(firstStory) : nothing));

		var restViews = bodyColumn(stack({
			gutterSize: separatorSize,
		}, intersperse(restStories.map(function (story) {
			return storyRowP(story);
		}), bar.horizontal(1, colors.middleGray))));

		return stack({
			gutterSize: separatorSize,
		}, [
			stack({
				gutterSize: separatorSize,
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
				restViews,
			]),
		]);
	});
});
