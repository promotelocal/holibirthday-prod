define([
	'bodyColumn',
	'confettiBackground',
	'daysByMonth',
	'db',
	'defaultFormFor',
	'fonts',
	'holibirthdayRow',
	'meP',
	'months',
	'prettyForms',
	'profilesP',
	'separatorSize',
	'submitButton',
], function (bodyColumn, confettiBackground, daysByMonth, db, defaultFormFor, fonts, holibirthdayRow, meP, months, prettyForms, profilesP, separatorSize, submitButton) {
	return function (user) {
		return profilesP.then(function (profiles) {
			return db.holibirthday.findOne({
				user: user,
			}).then(function (holibirthday) {
				var profile = profiles.filter(function (profile) {
					return profile.user === user;
				})[0];
				profile.firstName = profile.firstName || '';
				profile.lastName = profile.lastName || '';
				profile.email = profile.email || '';
				profile.birthday = profile.birthday || null;
				profile.bio = profile.bio || null;
				profile.imageUrl = profile.imageUrl || './content/man.png';
				profile.holibirther = profile.holibirther || false;
				profile.knowAHolibirther = profile.knowAHolibirther || false;
				profile.receiveMarketingEmails = profile.receiveMarketingEmails || false;

				holibirthday = holibirthday || {
					user: user,
					month: 0,
					day: 1,
				};
				holibirthday.month = months[holibirthday.month];
				var holibirthdayStreams = Stream.splitObject(holibirthday);
				var holibirthdayS = Stream.combineObject(holibirthdayStreams);

				return defaultFormFor.profile(profile, function (profileS, fields) {
					return stack({
						gutterSize: separatorSize,
					}, [
						confettiBackground(bodyColumn(holibirthdayRow(text('Edit Your Profile').all([
							fonts.h1,
						])))),
						bodyColumn(stack({
							gutterSize: separatorSize,
						}, [
							fields.firstName,
							fields.lastName,
							fields.email,
							fields.receiveMarketingEmails,
							fields.birthday,
							fields.bio,
							fields.imageUrl,
							stack({}, [
								fields.holibirther,
								componentStream(profileS.prop('holibirther').map(function (holibirther) {
									return holibirther ? stack({
										gutterSize: separatorSize,
									}, [
										nothing,
										prettyForms.select({
											name: 'Holibirth-month',
											options: months,
											stream: holibirthdayStreams.month,
										}),
										componentStream(holibirthdayStreams.month.map(function (month) {
											var countDates = daysByMonth[month];
											var dates = [];
											for (var i = 0; i < countDates; i++) {
												dates.push(i + 1);
											}
											return prettyForms.select({
												name: 'Holibirth-day',
												options: dates,
												stream: holibirthdayStreams.day,
											});
										})),
									]) : nothing;
								})),					  
							]),
							fields.knowAHolibirther,
							alignLRM({
								middle: submitButton(black, text('Submit')).all([
									link,
									clickThis(function () {
										var p = profileS.lastValue();
										return db.profile.update({
											_id: p._id,
										}, p).then(function () {
											if (p.holibirther) {
												var h = holibirthdayS.lastValue();
												h.date = new Date(h.month + ' ' + h.day + ' 2000');
												if (h._id) {
													return db.holibirthday.update({
														_id: h._id,
													}, {
														date: h.date,
													}).then(function () {
														window.location.hash = '#!user/' + p.user;
														window.location.reload();
													});
												}
												else {
													return db.holibirthday.insert(h).then(function () {
														window.location.hash = '#!user/' + p.user;
														window.location.reload();
													});
												}
											}
											else {
												window.location.hash = '#!user/' + p.user;
												window.location.reload();
											}
										});
									})
								]),
							}),
						])),
					]);
				});
			});
		});
	};
});
