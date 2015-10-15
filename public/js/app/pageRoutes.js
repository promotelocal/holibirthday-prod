define([
	'meP',
	'storiesP',
], function (meP, storiesP) {
	var loadAsync = function (thing, args) {
		var d = Q.defer();
		require([thing], function (thing) {
			if (!args) {
				d.resolve(thing);
			}
			else {
				d.resolve(thing.apply(null, args));
			}
		});
		return d.promise;
	};
	return routeToFirst([
		matchStrings([{
			string: '#!admin',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('adminView'));
			}),
		}, {
			string: '#!register',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('registerView'));
			}),
		}, {
			string: '#!design/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('gafyDesignView', [id]));
			}),
		}, {
			string: '#!gifts',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('storeView'));
			}),
		}, {
			string: '#!cart',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('cartView'));
			}),
		}, {
			string: '#!wishlist/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('wishlistView', [id]));
			}),
		}, {
			string: '#!wishlist',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('wishlistView', []));
			}),
		}, {
			string: '#!checkout',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('checkoutView'));
			}),
		}, {
			string: '#!orderSuccess/',
			router: routeMatchRest(function (orderBatch) {
				return promiseComponent(loadAsync('orderSuccess', [orderBatch]));
			}),
		}, {
			string: '#!myHolibirthday',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('myHolibirthdayView'));
			}),
		}, {
			string: '#!contacts',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('contactsView'));
			}),
		}, {
			string: '#!leaderboards',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('leaderboardsView'));
			}),
		}, {
			string: '#!story/',
			router: routeMatchRest(function (id) {
				return storiesP.then(function (stories) {
					var story = stories.filter(function (s) {
						return s._id === id;
					})[0];
					return promiseComponent(loadAsync('storyDetailViewP', [story, true]));
				});
			}),
		}, {
			
		}, {
			string: '#!user/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('profileViewP', [id]));
			}),
		}, {
			string: '#!editProfile/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('profileEditViewP', [id]));
			}),
		}, {
			string: '#!editStory/',
			router: routeMatchRest(function (id) {
				return storiesP.then(function (stories) {
					var story = stories.filter(function (s) {
						return s._id === id;
					})[0];
					return promiseComponent(loadAsync('storyEditViewP', [story]));
				});
			}),
		}, {
			string: '#!editStory',
			router: routeToComponentF(function () {
				return promiseComponent(meP.then(function (me) {
					return loadAsync('storyEditViewP', [{
						user: (me && me._id) || '',
						name: '',
						text: '',
						imageUrl: './content/man.png',
						storyType: '',
						isPublic: true,
					}]);
				}));
			}),
		}, {
			string: '#!holibirthday/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('holibirthdayView', [id]));
			}),
		}, {
			string: '#!contactUs',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('contactUsView'));
			}),
		}, {
			string: '#!privacyPolicy',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('privacyPolicyView'));
			}),
		}]),
		routeToComponentF(function () {
			return promiseComponent(loadAsync('homeViewP'));
		}),
	]);
});
