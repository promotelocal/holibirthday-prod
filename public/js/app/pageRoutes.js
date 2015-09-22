define([
	'adminView',
	'cartView',
	'checkoutView',
	'homeViewP',
	'meP',
	'myHolibirthdayView',
	'profileEditViewP',
	'profileViewP',
	'registerView',
	'storeView',
	'storeItemDetailView',
	'storiesP',
	'storyDetailViewP',
	'storyEditViewP',
], function (adminView, cartView, checkoutView, homeViewP, meP, myHolibirthdayView, profileEditViewP, profileViewP, registerView, storeView, storeItemDetailView, storiesP, storyDetailViewP, storyEditViewP) {
	return routeToFirst([
		matchStrings([{
			string: '#!admin',
			router: routeToComponent(adminView),
		}, {
			string: '#!register',
			router: routeToComponent(registerView),
		}, {
			string: '#!storeItem/',
			router: routeMatchRest(function (id) {
				return storeItemDetailView(id);
			}),
		}, {
			string: '#!store',
			router: routeToComponent(storeView),
		}, {
			string: '#!cart',
			router: routeToComponent(cartView),
		}, {
			string: '#!checkout',
			router: routeToComponent(checkoutView),
		}, {
			string: '#!myHolibirthday',
			router: routeToComponent(myHolibirthdayView),
		}, {
			string: '#!story/',
			router: routeMatchRest(function (id) {
				return storiesP.then(function (stories) {
					var story = stories.filter(function (s) {
						return s._id === id;
					})[0];
					return storyDetailViewP(story, true);
				});
			}),
		}, {
			
		}, {
			string: '#!user/',
			router: routeMatchRest(function (id) {
				return profileViewP(id);
			}),
		}, {
			string: '#!editProfile/',
			router: routeMatchRest(function (id) {
				return profileEditViewP(id);
			}),
		}, {
			string: '#!editStory/',
			router: routeMatchRest(function (id) {
				return storiesP.then(function (stories) {
					var story = stories.filter(function (s) {
						return s._id === id;
					})[0];
					return storyEditViewP(story);
				});
			}),
		}, {
			string: '#!editStory',
			router: routeToComponent(meP.then(function (me) {
				return storyEditViewP({
					user: (me && me._id) || '',
					name: '',
					text: '',
					imageUrl: '/content/man.png',
					storyType: '',
					isPublic: true,
				});
			})),
		}]),
		routeToComponent(homeViewP),
	]);
});
