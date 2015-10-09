define([
	'areYouSure',
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'meP',
	'separatorSize',
	'socialMedia',
], function (areYouSure, bodyColumn, colors, confettiBackground, db, fonts, holibirthdayRow, meP, separatorSize, socialMedia) {
	return promiseComponent(meP.then(function (me) {
		if (!me) {
			window.location.hash = '#!';
			return nothing;
		}
		var now = new Date();
		
		var howLongUntilDate = function (date) {
			var nowThatMonth = new Date(now);
			nowThatMonth.setMonth(date.getMonth());
			nowThatMonth.setDate(date.getDate());
			
			var howLong = nowThatMonth.getTime() - now.getTime();
			if (howLong < 0) {
				howLong += 365 * 24 * 60 * 60 * 1000;
			}
			return howLong;
		};

		return socialMedia.facebook.api('/me/friends', 'get', {}).then(function (friends) {
			var ids = friends.data.map(function (friend) {
				return friend.id;
			});
			return $.ajax({
				type: 'post',
				url: '/userIdsByFacebookIds',
				data: JSON.stringify(ids),
				contentType: 'application/json',
			}).then(function (userIds) {
				return db.contactOtherUser.find({
					user: me._id,
				}).then(function (cous) {
					var $or = userIds.map(function (userId) {
						return {
							user: userId,
						};
					});
					// var $or = cous.map(function (cou) {
					// 	return {
					// 		user: cou.otherUser,
					// 	};
					// });
					return Q.all([
						db.profile.find({
							$or: $or,
						}),
						db.holibirthday.find({
							$or: $or,
						}),
					]).then(function (results) {
						var profiles = results[0];
						var holibirthdays = results[1];
						profiles.map(function (profile) {
							var holibirthday = holibirthdays.filter(function (h) {
								return h.user === profile.user;
							})[0];
							var max = 365 * 24 * 60 * 60 * 1000;
							profile.holibirthday = holibirthday;
							profile.howLong = Math.min(profile.birthday ?
													   howLongUntilDate(profile.birthday) :
													   max,
													   holibirthday ?
													   howLongUntilDate(holibirthday.date) :
													   max);
						});
						profiles.sort(function (p1, p2) {
							return p1.howLongUntilBirthday - p2.howLongUntilBirthday;
						});
						return stack({
							gutterSize: separatorSize,
						}, [
							confettiBackground(bodyColumn(holibirthdayRow(text('Contacts').all([
								fonts.ralewayThinBold,
								fonts.h1,
							])))),
							bodyColumn(alignLRM({
								middle: table({
									paddingSize: separatorSize,
								}, profiles.map(function (p) {
									return [
										linkTo('#!user/' + p.user, text(p.firstName + ' ' + p.lastName).all([
											fonts.ralewayThinBold,
										])),
										text(p.birthday ? 'Born on<br>' + moment(p.birthday).format('MMMM Do') : '&nbsp;').all([
											fonts.ralewayThinBold,
											$css('text-align', 'center'),
										]),
										text(p.holibirthday ? 'Holiborn on<br>' + moment(p.holibirthday.date).format('MMMM Do') : '&nbsp;').all([
											fonts.ralewayThinBold,
											$css('text-align', 'center'),
										]),
										// text('remove this contact').all([
										// 	fonts.ralewayThinBold,
										// ]).all([
										// 	link,
										// 	clickThis(function () {
										// 		areYouSure({
										// 			onYes: function () {
										// 				db.contactOtherUser.remove({
										// 					user: me._id,
										// 					otherUser: p.user,
										// 				}).then(function () {
										// 					window.location.reload();
										// 				});
										// 			},
										// 		});
										// 	}),
										// ]),
									];
								})),
							})),
						]);
					});
				});
			});
		});
	}));
});
