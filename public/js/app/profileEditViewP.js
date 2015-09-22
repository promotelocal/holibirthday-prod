define([
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'formFor',
	'holibirthdayRow',
	'meP',
	'prettyForms',
	'profilesP',
], function (bodyColumn, confettiBackground, fonts, formFor, holibirthdayRow, meP, prettyForms, profilesP) {
	return function (user) {
		return meP.then(function (me) {
			return profilesP.then(function (profiles) {
				var profile = profiles.filter(function (profile) {
					return profile.user === user;
				})[0];

				var profileStreams = {
					firstName: Stream.once(profile.firstName),
					lastName: Stream.once(profile.lastName),
					email: Stream.once(profile.email),
					birthday: Stream.once(profile.birthday),
					bio: Stream.once(profile.bio),
					imageUrl: Stream.once(profile.imageUrl),
					holibirthdayer: Stream.once(profile.holibirthdayer),
					knowAHolibirthdayer: Stream.once(profile.knowAHolibirthdayer),
				};

				var editForm = formFor.profile(profile, function (fields) {
					return bodyColumn(stack({}, [
						text('hello there'),
					]));
				});

				return stack({}, [
					confettiBackground(bodyColumn(holibirthdayRow(text('Edit Profile').all([
						fonts.h1,
					])))),
					editForm,
				]);
			});
		});
	};
});
