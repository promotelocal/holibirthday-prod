define([
	'db',
	'profileP',
], function (db, profileP) {
	return function () {
		profileP.then(function (profile) {
			if (!profile.hasHeardTune) {
				db.profile.update({
					_id: profile._id,
				}, {
					hasHeardTune: true,
				});
				var song = new Audio('./content/song.mp3');
				song.play();
			}
		});
	};
});
