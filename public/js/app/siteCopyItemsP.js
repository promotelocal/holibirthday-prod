define([
	'db',
], function (db) {
	return db.siteCopyItem.find({}).then(function (siteCopyItems) {
		siteCopyItems.find = function (name) {
			var item = siteCopyItems.filter(function (siteCopyItem) {
				return siteCopyItem.uniqueName === name;
			})[0];
			return item ? item.value : 'No Copy';
		};
		return siteCopyItems;
	});
});
