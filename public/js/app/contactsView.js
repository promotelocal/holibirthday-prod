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
], function (areYouSure, bodyColumn, colors, confettiBackground, db, fonts, holibirthdayRow, meP, separatorSize) {
	return promiseComponent(meP.then(function (me) {
		if (!me) {
			window.location.hash = '#!';
			return nothing;
		}
		return Q.all([
			db.contactOtherUser.find({
				user: me._id,
			}),
			db.contactCustom.find({
				user: me._id,
			}),
		]).then(function (results) {
			var contactOtherUsers = results[0];
			
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
			
			var $or = contactOtherUsers.map(function (cou) {
				return {
					user: cou.otherUser,
				};
			});
			
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
				var fieldStack = function (fieldName, fieldFunc, all) {
					return stack({}, [padding({
						bottom: separatorSize / 2,
						left: separatorSize / 2,
						right: separatorSize,
					}, text(fieldName).all([
						fonts.ralewayThinBold,
					]))].concat(profiles.map(function (p, i) {
						return padding({
							all: separatorSize / 2,
						}, fieldFunc(p)).all([
							withBackgroundColor(multiplyColor(i % 2 ? 1 : 1.1)(colors.pageBackgroundColor)),
						]).all(all ? all(p, i) : []);
					})));
				};
				return stack({
					gutterSize: separatorSize,
				}, [
					confettiBackground(bodyColumn(holibirthdayRow(text('Contacts').all([
						fonts.ralewayThinBold,
						fonts.h1,
					])))),
					bodyColumn(sideBySide({}, [
						fieldStack('Name', function (p) {
							return linkTo('#!user/' + p.user, text(p.firstName + ' ' + p.lastName).all([
								fonts.ralewayThinBold,
							]));
						}),
						fieldStack('Email', function (p) {
							return text(p.email || '&nbsp;').all([
								fonts.ralewayThinBold,
							]);
						}),
						fieldStack('Birthday', function (p) {
							return text(p.birthday ? moment(p.birthday).format('MMMM Do') : '&nbsp;').all([
								fonts.ralewayThinBold,
							]);
						}),
						fieldStack('Holibirthday', function (p) {
							return text(p.holibirthday ? moment(p.holibirthday.date).format('MMMM Do') : '&nbsp;').all([
								fonts.ralewayThinBold,
							]);
						}),
						fieldStack('Remove', function () {
							return text('remove this contact').all([
								fonts.ralewayThinBold,
							]);
						}, function (p) {
							return [
								link,
								clickThis(function () {
									areYouSure({
										onYes: function () {
											db.contactOtherUser.remove({
												user: me._id,
												otherUser: p.user,
											}).then(function () {
												debugger;
												window.location.reload();
											});
										},
									});
								}),
							];
						}),
					])),
				]);
			});

			// FB.api('/me/friends', 'get', {}, function (friends) {
			// });
		});
	}));
});







