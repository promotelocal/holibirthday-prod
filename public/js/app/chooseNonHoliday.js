define([], function () {
	return function () {
		var equals = function (b1, b2) {
			return b1.month === b2.month &&
				b1.dayTens === b2.dayTens &&
				b1.dayOnes === b2.dayOnes;
		};
		var createDate = function () {
			var randomDate = new Date(new Date().getTime() * Math.random());
			
			var month = randomDate.getUTCMonth();
			var date = randomDate.getUTCDate();
			var dateTens = parseInt((date / 10) + '');
			var dateOnes = date % 10;
			return {
				month: month,
				dayTens: dateTens,
				dayOnes: dateOnes,
				date: randomDate,
			};
		};

		var matchesAnyHoliday = function (date) {
			if (date.month === 10) {
				if (date.dayTens >= 2) {
					return true;
				}
			}
			if (date.month === 11) {
				return true;
			}
			
			var holidays = [{
				month: 0,
				dayTens: 0,
				dayOnes: 1,
				reason: 'New Years',
			}, {
				month: 0,
				dayTens: 0,
				dayOnes: 2,
				reason: 'day after new years',
			}, {
				month: 3,
				dayTens: 0,
				dayOnes: 1,
				reason: 'April Fool\'s',
			}, {
				month: 6,
				dayTens: 0,
				dayOnes: 4,
				reason: 'Independence Day',
			}, {
				month: 8,
				dayTens: 0,
				dayOnes: 7,
				reason: 'labor day',
			}, {
				month: 9,
				dayTens: 3,
				dayOnes: 1,
				reason: 'halloween',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 1,
				reason: 'christmas eve eve eve eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 2,
				reason: 'christmas eve eve eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 3,
				reason: 'christmas eve eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 4,
				reason: 'christmas eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 5,
				reason: 'christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 6,
				reason: 'day after christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 7,
				reason: 'day after day after christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 8,
				reason: 'day after day after day after christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 9,
				reason: 'day after day after day after day after christmas',
			}, {
				month: 11,
				dayTens: 3,
				dayOnes: 0,
				reason: 'New Years eve eve',
			}, {
				month: 11,
				dayTens: 3,
				dayOnes: 1,
				reason: 'New Years eve',
			}];

			return holidays.filter(function (h) {
				return equals(h, date);
			}).length > 0;
		};

		var date = createDate();
		while (matchesAnyHoliday(date)) {
			date = createDate();
		}
		return date.date;
	};
});
