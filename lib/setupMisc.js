var async = require('async');

module.exports = function (app, config, dbWith) {
	
	var setHolibirthdayMonthAndDay = function (holibirthday, next) {
		if (holibirthday.date) {
			holibirthday.month = holibirthday.date.getMonth();
			holibirthday.day = holibirthday.date.getDate();
		}
		return next();
	};
	
	app.schema.holibirthday.insertMiddleware.use(function (holibirthday, options, next) {
		return setHolibirthdayMonthAndDay(holibirthday, next);
	});
	app.schema.holibirthday.updateMiddleware.use(function (selector, holibirthday, options, next) {
		return setHolibirthdayMonthAndDay(holibirthday, next);
	});

	var pointValues = {
		postComment: 10,
		writeStory: 500,
		receiveComment: 10,
		receiveLike: 10,
		likeStory: 1,
		chooseHolibirthday: 5,
	};

	app.schema.holibirthday.insertMiddleware.use(function (holibirthday, options, next) {
		var db = dbWith(next);
		db.pointsChange.insert({
			user: holibirthday.user,
			amount: pointValues.chooseHolibirthday,
			reason: 'Claimed a Holibirthday',
		}, function () {
			return next();
		});
	});
	
	app.schema.story.insertMiddleware.use(function (holibirthday, options, next) {
		var db = dbWith(next);
		db.pointsChange.insert({
			user: holibirthday.user,
			amount: pointValues.writeStory,
			reason: 'Wrote a Story',
		}, function () {
			return next();
		});
	});
	
	app.schema.comment.insertMiddleware.use(function (comment, options, next) {
		var db = dbWith(next);
		return db.story.findOne({
			_id: comment.story,
		}, function (story) {
			return db.pointsChange.insert({
				user: story.user,
				amount: pointValues.receiveComment,
				reason: 'Received a Comment on a Story ',
			}, function () {
				return db.pointsChange.insert({
					user: comment.user,
					amount: pointValues.postComment,
					reason: 'Commented on a Story ',
				}, function () {
					return next();
				});
			});
		});
	});

	app.schema.storyLike.insertMiddleware.use(function (storyLike, options, next) {
		var db = dbWith(next);
		return db.story.findOne({
			_id: storyLike.story,
		}, function (story) {
			return db.pointsChange.insert({
				user: story.user,
				amount: pointValues.receiveLike,
				reason: 'Someone Liked your story ' + story.name,
			}, function () {
				return db.pointsChange.insert({
					user: comment.user,
					amount: pointValues.likeStory,
					reason: 'You liked a story ' + story.name,
				}, function () {
					return next();
				});
			});
		});
	});
};
