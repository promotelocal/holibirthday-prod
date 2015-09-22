var async = require('async');

module.exports = function (app, config, dbWith) {
	var sendNotifications = function (recipients, notification, next) {
		var db = dbWith(next);
		
		async.map(recipients, function (recipient, next) {
			db.notification.insert({
				user: recipient,
				title: notification.title,
				path: notification.path
			}, next);
		}, next);
	};

	// tells whether an update makes a difference to an entity
	var makesADifference = function (entity, update) {
		var difference = false;

		update = update.$set;
		for (var i in update) {
			if (i !== '_id') {
				if (entity[i] !== update[i]) {
					difference = true;
				}
			}
		}

		return difference;
	};

	var mapOfferMembers = function (members) {
		return members.map(function (member) {
			return member.user;
		});
	};
	
	app.schema.offer.updateMiddleware.use(function (query, update, options, next) {
		var db = dbWith(next);
		
		db.offer.find(query, function (offers) {
			async.map(offers, function (p, next) {
				if (makesADifference(p, update)) {
					db.offerMember.find({
						offer: p._id
					}, function (members) {
						sendNotifications(mapOfferMembers(members), {
							title: 'Offer ' + p.title + ' Updated',
							path: '/offer?offer=' + p._id,
						}, next);
					});
				}
			}, next);
		});
	});

	app.schema.offer.removeMiddleware.use(function (query, options, next) {
		var db = dbWith(next);
		
		db.offer.find(query, function (offers) {
			async.map(offers, function (p, next) {
				db.offerMember.find({
					offer: p._id
				}, function (members) {
					sendNotifications(mapOfferMembers(members), {
						title: 'Offer ' + p.title + ' Deleted',
						path: '/',
					}, next);
				});
			}, next);
		});
	});

	app.schema.offerMember.insertMiddleware.use(function (member, options, next) {
		sendNotifications(mapOfferMembers([member]), {
			title: 'Your service has been requested as part of a offer.',
			path: '/offer?offer=' + member.offer,
		}, next);
	});

	app.schema.offerMember.removeMiddleware.use(function (member, options, next) {
		sendNotifications(mapOfferMembers([member]), {
			title: 'Your service has been removed from a offer.',
			path: '/offer?offer=' + member.offer,
		}, next);
	});

	
	app.schema.bid.insertMiddleware.use(function (bid, options, next) {
		var db = dbWith(next);
		
		db.offer.findOne(bid.offer, function (p) {
			db.offerMember.find({
				offer: p._id
			}, function (members) {
				sendNotifications(mapOfferMembers(members), {
					title: 'New Bid on offer ' + p.title,
					path: '/bid?bid=' + bid._id,
				}, next);
			});
		});
	});

	app.schema.bid.updateMiddleware.use(function (query, update, options, next) {
		var db = dbWith(next);
		
		db.bid.find(query, function (bids) {
			async.map(bids, function (bid, next) {
				db.offer.findOne({
					_id: bid.offer
				}, function (p) {
					db.offerMember.find({
						offer: p._id
					}, function (members) {
						sendNotifications(mapOfferMembers(members), {
							title: 'Bid on offer ' + p.title + ' updated',
							path: '/bid?bid=' + bid._id,
						}, next);
					});
				});
			}, next);
		});
	});
	
	app.schema.bid.removeMiddleware.use(function (query, options, next) {
		var db = dbWith(next);
		
		db.bid.find(query, function (bids) {
			async.map(bids, function (bid, next) {
				db.offer.findOne({
					_id: bid.offer
				}, function (p) {
					db.offerMember.find({
						offer: p._id
					}, function (members) {
						sendNotifications(mapOfferMembers(members), {
							title: 'Bid on offer ' + p.title + ' canceled',
							path: '/offer?offer=' + bid.offer,
						}, next);
					});
				});
			}, next);
		});
	});
	
	app.schema.bidMessage.insertMiddleware.use(function (message, options, next) {
		var db = dbWith(next);

		db.bid.findOne({
			_id: message.bid
		}, function (bid) {
			db.offer.findOne({
				_id: bid.offer
			}, function (p) {
				db.offerMember.find({
					offer: p._id
				}, function (members) {
					if (message.poster.toString() === bid.bidderUser.toString()) {
						return sendNotifications(mapOfferMembers(members), {
							title: 'Comment on a bid on ' + p.title,
							path: '/bid?bid=' + bid._id,
						}, next);
					}
					else {
						return sendNotifications([bid.bidderUser], {
							title: 'Comment on your bid on ' + p.title,
							path: '/bid?bid=' + bid._id,
						}, next);
					}
				});
			});
		});
	});
	
	app.schema.teamAcceptsBid.insertMiddleware.use(function (agreement, options, next) {
		var db = dbWith(next);

		db.bid.findOne({
			_id: agreement.bid
		}, function (bid) {
			db.offer.findOne({
				_id: bid.offer
			}, function (p) {
				sendNotifications([bid.bidderUser], {
					title: 'Your bid accepted for ' + p.title,
					path: '/bid?bid=' + bid._id,
				}, next);
			});
		});
	});

	app.schema.teamAcceptsBid.removeMiddleware.use(function (agreement, options, next) {
		var db = dbWith(next);

		db.bid.findOne({
			_id: agreement.bid
		}, function (bid) {
			db.offer.findOne({
				_id: bid.offer
			}, function (p) {
				sendNotifications([bid.bidderUser], {
					title: 'Your bid no longer accepted for ' + p.title,
					path: '/bid?bid=' + bid._id,
				}, next);
			});
		});
	});
	
	app.schema.bidderAcceptsBid.insertMiddleware.use(function (agreement, options, next) {
		var db = dbWith(next);

		db.bid.findOne({
			_id: agreement.bid
		}, function (bid) {
			db.offer.findOne({
				_id: bid.offer
			}, function (p) {
				db.offerMember.find({
					offer: p._id
				}, function (members) {
					sendNotifications(mapOfferMembers(members), {
						title: 'Brand entered payment info for ' + p.title,
						path: '/bid?bid=' + bid._id,
					}, next);
				});
			});
		});
	});

	app.schema.bidderAcceptsBid.removeMiddleware.use(function (agreement, options, next) {
		var db = dbWith(next);

		db.bid.findOne({
			_id: agreement.bid
		}, function (bid) {
			db.offer.findOne({
				_id: bid.offer
			}, function (p) {
				db.offerMember.find({
					offer: p._id
				}, function (members) {
					sendNotifications(mapOfferMembers(members), {
						title: 'Brand removed payment information for ' + p.title,
						path: '/bid?bid=' + bid._id,
					}, next);
				});
			});
		});
	});
	
	app.schema.agreement.insertMiddleware.use(function (agreement, options, next) {
		var db = dbWith(next);

		db.bid.findOne({
			_id: agreement.bid
		}, function (bid) {
			db.offer.findOne({
				_id: bid.offer
			}, function (p) {
				db.offerMember.find({
					offer: p._id
				}, function (members) {
					var users = mapOfferMembers(members);
					users.push(bid.bidderUser);
					sendNotifications(users, {
						title: 'Agreement formed for ' + p.title,
						path: '/agreement?agreement=' + agreement._id,
					}, next);
				});
			});
		});
	});

	app.schema.agreement.removeMiddleware.use(function (agreement, options, next) {
		var db = dbWith(next);

		db.bid.findOne({
			_id: agreement.bid
		}, function (bid) {
			db.offer.findOne({
				_id: bid.offer
			}, function (p) {
				db.offerMember.find({
					offer: p._id
				}, function (members) {
					var users = mapOfferMembers(members);
					users.push(bid.bidderUser);
					sendNotifications(users, {
						title: 'Agreement canceled for ' + p.title,
						path: '/agreements',
					}, next);
				});
			});
		});
	});
};
