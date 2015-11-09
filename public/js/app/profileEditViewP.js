define([
	'auth',
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
], function (auth, bodyColumn, confettiBackground, daysByMonth, db, defaultFormFor, fonts, holibirthdayRow, meP, months, prettyForms, profilesP, separatorSize, submitButton) {
	return function (user) {
		var withPasswordEditor = function (f) {
			var passwordS = Stream.once('');
			var confirmPasswordS = Stream.once('');

			var passwordsDoNotMatch = Stream.once(false);
			passwordS.map(function () {
				passwordsDoNotMatch.push(false);
			});
			confirmPasswordS.map(function (cp) {
				passwordsDoNotMatch.push(passwordS.lastValue() !== cp);
			});
			
			var password = prettyForms.input({
				name: 'Password',
				fieldName: 'password',
				stream: passwordS,
				type: 'password',
			});
			var confirmPassword = prettyForms.input({
				name: 'Password Again',
				fieldName: 'confirmPassword',
				stream: confirmPasswordS,
				type: 'password',
			});
			
			return f(stack({
				gutterSize: separatorSize,
			}, [
				password,
				confirmPassword,
				toggleHeight(passwordsDoNotMatch)(paragraph('Passwords must match')),
			]), function () {
				var doneD = Q.defer();
				var password = passwordS.lastValue();
				if (passwordsDoNotMatch.lastValue()) {
					doneD.reject();
				}
				else if (password.length > 0) {
					auth.setPassword({
						password: passwordS.lastValue(),
					}).then(function () {
						doneD.resolve();
					});
				}
				else {
					doneD.resolve();
				}
				return doneD.promise;
			});
		};
		return withPasswordEditor(function (passwordEditor, savePassword) {
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
							confettiBackground(bodyColumn(holibirthdayRow(text('Edit Profile').all([
								fonts.h1,
							]), profile.imageUrl))),
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
								passwordEditor,
								alignLRM({
									middle: submitButton(black, text('Submit').all([
										fonts.bebasNeue,
									])).all([
										link,
										clickThis(function () {
											var p = profileS.lastValue();
											return savePassword().then(function () {
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
											});
										}),
									]),
								}),
							])),
						]);
					});
				});
			});
		});
	};
});
