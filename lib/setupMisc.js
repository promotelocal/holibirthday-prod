var async = require('async');

module.exports = function (app, config, dbWith) {

	app.post('/userIdsByFacebookIds', function (req, res, next) {
		var db = dbWith(next);

		if (!req.body) {
			return res.status(400).end();
		}
		if (req.body.length === 0) {
			return res.send([]);
		}
		var $or = req.body.map(function (facebookId) {
			return {
				facebookId: facebookId,
			};
		});
		db.user.find({
			$or: $or,
		}, function (users) {
			return res.send(users.map(function (user) {
				return user._id;
			}));
		});
	});
	
	var setHolibirthdayMonthAndDay = function (holibirthday, next) {
		var h = holibirthday.$set || holibirthday;
		h.month = h.date.getUTCMonth();
		h.day = h.date.getUTCDate();
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

	app.schema.pointsChange.insertMiddleware.use(function (pointsChange, options, next) {
		var db = dbWith(next);
		db.pointsTotal.findOne({
			user: pointsChange.user,
		}, function (pt) {
			if (pt) {
				return db.pointsTotal.update({
					_id: pt._id,
				}, {
					$set: {
						amount: pt.amount + pointsChange.amount,
					}
				}, function () {
					next();
				});
			}
			return db.pointsTotal.insert({
				user: pointsChange.user,
				amount: pointsChange.amount,
			}, function () {
				next();
			});
		});
	});

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

	app.schema.dailyThemePollResponse.insertMiddleware.use(function (r, _, next) {
		var db = dbWith(next);
		return db.dailyThemePollResponse.findOne({
			user: r.user,
			dailyTheme: r.dailyTheme,
		}, function (oldR) {
			if (oldR) {
				return next(oldR);
			}
			return next();
		});
	});

	app.schema.storyTag.insertMiddleware.use(function (st, _, next) {
		st.tag = st.tag.toLowerCase();
		
		var db = dbWith(next);
		return db.uniqueTag.findOne({
			tag: st.tag,
		}, function (uniqueTag) {
			return uniqueTag ? db.uniqueTag.update({
				_id: uniqueTag._id,
			}, {
				$set: {
					count: 1 + uniqueTag.count,
				},
			}, {}, function () {
				next();
			}) : db.uniqueTag.insert({
				tag: st.tag,
				count: 1,
			}, function () {
				next();
			});
		});
	});

	app.schema.storyTag.removeMiddleware.use(function (st, _, next) {
		// not using any locks or what have you; this will break under
		// large load
		var db = dbWith(next);
		return db.storyTag.findOne(st, function (storyTag) {
			return db.uniqueTag.findOne({
				tag: storyTag.tag,
			}, function (uniqueTag) {
				return uniqueTag.count === 1 ? db.uniqueTag.remove({
					_id: uniqueTag._id,
				}, function () {
					next();
				}) : db.uniqueTag.update({
					_id: uniqueTag._id,
				}, {
					$set: {
						count: -1 + uniqueTag.count,
					},
				}, {}, function () {
					next();
				});
			});
		});
	});
};
