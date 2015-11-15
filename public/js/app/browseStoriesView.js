define([
	'bodyColumn',
	'categories',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
	'storiesP',
	'storyPaginate',
	'storyRowP',
], function (bodyColumn, categories, confettiBackground, db, fonts, holibirthdayRow, separatorSize, storiesP, storyPaginate, storyRowP) {
	var allStories = function () {
		return true;
	};
	var noStories = function () {
		return false;
	};
	var adjectiveS = Stream.once('');
	var filterS = Stream.once(allStories);
	return promiseComponent(storiesP.then(function (stories) {
		stories.sort(function (s1, s2) {
			return new Date(s2.createDate).getTime() - new Date(s1.createDate).getTime();
		});
		
		return stack({
			gutterSize: separatorSize,
		}, [
			confettiBackground(bodyColumn(holibirthdayRow(stack({
				gutterSize: separatorSize / 2,
			}, [
				text(adjectiveS.map(function (a) {
					return a + 'Stories';
				})).all([
					fonts.h1,
				]),
				padding({
					left: separatorSize,
				}, stack({
					gutterSize: separatorSize / 2,
				}, [
					text('All Stories').all([
						fonts.h3,
						link,
						clickThis(function () {
							adjectiveS.push('');
							filterS.push(allStories);
						}),
					]),
					text('Category').all([
						fonts.h3,
					]),
					grid({
						gutterSize: separatorSize,
					}, categories.filter(function (c) {
						return stories.filter(function (s) {
							return s.storyType === c.toLowerCase();
						}).length > 0;
					}).map(function (c) {
						return text(c).all([
							fonts.bebasNeue,
							link,
							clickThis(function () {
								adjectiveS.push(c + ' ');
								filterS.push(function (s) {
									return s.storyType === c.toLowerCase();
								});
							}),
						]);
					})),
					text('Tag').all([
						fonts.h3,
					]),
					promiseComponent(db.uniqueTag.find({}).then(function (uniqueTags) {
						return grid({
							gutterSize: separatorSize,
						}, uniqueTags.map(function (t) {
							return text(t.tag).all([
								fonts.bebasNeue,
								link,
								clickThis(function () {
									adjectiveS.push(t.tag + ' ');
									filterS.push(noStories);
									db.storyTag.find({
										tag: t.tag,
									}).then(function (storyTags) {
										filterS.push(function (story) {
											return storyTags.filter(function (t) {
												return t.story === story._id;
											}).length > 0;
										});
									});
								}),
							]);
						}));
					})),
				])),
			])))),
			componentStream(filterS.map(function (filter) {
				return bodyColumn(storyPaginate({
					perPage: 10,
					pageS: Stream.once(0),
				}, stories.filter(filter).map(storyRowP)));
			})),
		]);
	}));
});










