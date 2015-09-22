define([
	'db',
	'meP',
], function (db, meP) {
	return meP.then(function (me) {
		if (me) {
			return db.admin.findOne({
				user: me._id,
			});
		}
	});
});
