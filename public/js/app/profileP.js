define([
	'meP',
	'profilesP',
], function (meP, profilesP) {
	return meP.then(function (me) {
		return me && profilesP.then(function (profiles) {
			return profiles.filter(function (p) {
				return p.user === me._id;
			})[0];
		});
	});
});
