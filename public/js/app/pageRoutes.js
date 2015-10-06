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
			router: routeToComponent(promiseComponent(loadAsync('adminView'))),
		}, {
			string: '#!register',
			router: routeToComponent(promiseComponent(loadAsync('registerView'))),
		}, {
			string: '#!design/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('gafyDesignView', [id]));
			}),
		}, {
			string: '#!gifts',
			router: routeToComponent(promiseComponent(loadAsync('storeView'))),
		}, {
			string: '#!cart',
			router: routeToComponent(promiseComponent(loadAsync('cartView'))),
		}, {
			string: '#!wishlist',
			router: routeToComponent(promiseComponent(loadAsync('wishlistView'))),
		}, {
			string: '#!checkout',
			router: routeToComponent(promiseComponent(loadAsync('checkoutView'))),
		}, {
			string: '#!orderSuccess/',
			router: routeMatchRest(function (orderBatch) {
				return promiseComponent(loadAsync('orderSuccess', [orderBatch]));
			}),
		}, {
			string: '#!myHolibirthday',
			router: routeToComponent(promiseComponent(loadAsync('myHolibirthdayView'))),
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
					return promiseComponent(loadAsync('storyEditViewP'[story]));
				});
			}),
		}, {
			string: '#!editStory',
			router: routeToComponent(meP.then(function (me) {
				return promiseComponent(loadAsync('storyEditViewP', [{
					user: (me && me._id) || '',
					name: '',
					text: '',
					imageUrl: './content/man.png',
					storyType: '',
					isPublic: true,
				}]));
			})),
		}]),
		routeToComponent(promiseComponent(loadAsync('homeViewP'))),
	]);
});
