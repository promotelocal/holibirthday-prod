var app = angular.module('holibirthday', ['ngRoute']);

window.onhashchange = function () {
	window.scrollTo(0, 0);
};

(function () {
	var grecaptchaP = $.Deferred();

	var awaitGrecaptcha = function () {
		if (typeof grecaptcha === 'undefined') {
			setTimeout(awaitGrecaptcha, 100);
		}
		else {
			grecaptchaP.resolve(grecaptcha);
		}
	};
	awaitGrecaptcha();

	app.constant('grecaptchaP', grecaptchaP);
})();


app.factory('stockPhotos', function () {
	var photos = [{
		name: 'Woman Carrying Balloons',
		url: './content/stockphotos/woman-street-walking-girl.jpg',
	}, {
		name: 'Bundt Cake',
		url: './content/stockphotos/food-sweet-cake-glace-icing.jpg',
	}, {
		name: 'Sparklers',
		url: './content/stockphotos/hands-night-festival-new-year-s-eve.jpg',
	}, {
		name: 'Holibirthday Soup',
		url: './content/stockphotos/holibirthday-soup.jpg',
	}, {
		name: 'Holibirthday Hotdog',
		url: './content/stockphotos/holibirthday-hotdog.jpg',
	}];
	photos.sort(function (a, b) {
		return a.name > b.name;
	});
	return photos;
});


app.factory('areYouSure', function () {
	var $areYouSure = $('.are-you-sure');
	var $backdrop = $areYouSure.find('.backdrop');
	var $box = $areYouSure.find('.box');
	var $title = $box.find('.title');
	var $yes = $box.find('.yes');
	var $no = $box.find('.no');

	var fadeTime = 200;

	var hideBox = function () {
		$yes.off('click');
		$no.off('click');

		
		$backdrop.css('opacity', 0);
		$box.css('opacity', 0);
		setTimeout(function () {
			$backdrop.css('z-index', '-1');
			$box.css('z-index', '-1');
		}, fadeTime);
	};

	var showBox = function (text, yes, no) {
		$title.html('Are you sure you would like to ' + text + '?');
		
		$backdrop.css('z-index', '1000');
		$backdrop.css('opacity', 0.3);
		$box.css('z-index', '1001');
		$box.css('opacity', 1);
		
		
		$yes.on('click', function () {
			if (yes) {
				yes();
			};
			hideBox();
		});

		$no.on('click', function () {
			if (no) {
				no();
			};
			hideBox();
		});
	};

	return showBox;
});

app.directive('aboutHolibirthday', [
	function () {
		return {
			templateUrl: './templates/aboutHolibirthday.html',
			link: function (scope, elem, attrs) {
				var $elem = $(elem);
				$('.about-image').remove().insertBefore($('.body-column'));
				scope.$on('$destroy', function () {
					$('.about-image').remove().appendTo($elem);
				});
			},
		};
	}]);

app.directive('sidebar', [
	function () {
		return {
			link: function (scope, elem, attrs) {
				var $elem = $(elem);
				var originalRight = parseInt($elem.css('right'));

				var $handle = $elem.find('.sidebar-handle');
				var originalHandleBGColor = $handle.css('background-color');
				var originalHandleColor = $handle.css('color');

				$handle.on('click', function () {
					var right = parseInt($elem.css('right'));

					if (right === 0) {
						$elem.css('right', originalRight);
						$handle.css('background-color', originalHandleBGColor);
						$handle.css('color', originalHandleColor);
					}
					else {
						$elem.css('right', 0);
					}
				});
			},
		};
	}]);

app.directive('mustSignIn', [
	'$location',
	'$timeout',
	'meP',
	function ($location, $timeout, meP) {
		return {
			link: function (scope, elem, attrs) {
				meP.then(null, function () {
					$timeout(function () {
						window.location.hash = '#/signIn';
					});
				});
			},
		};
	}]);

app.config([
	'$routeProvider',
	function ($routeProvider) {
		$routeProvider
			.when('/signIn', {
				template: '<div sign-in-view></div>',
			})
			.when('/register', {
				template: '<div register-view></div>',
			})
			.when('/confirmEmail', {
				template: '<div confirm-email-view></div>',
			})
			.when('/privacyPolicy', {
				template: '<div privacy-policy-view></div>',
			})
			.when('/about', {
				template: '<div about-view></div>',
			})
			.when('/profile', {
				template: '<div profile-view></div>',
			})
			.when('/editProfile', {
				template: '<div must-sign-in edit-profile-view></div>',
			})
			.when('/settings', {
				template: '<div settings-view></div>',
			})
			.when('/story', {
				template: '<div must-sign-in story-view></div>',
			})
			.when('/addStory', {
				template: '<div must-sign-in add-story-view></div>',
			})
			.when('/stories', {
				template: '<div stories-view></div>',
			})
			.when('/topTen', {
				template: '<div top-ten-view></div>',
			})
			.when('/editTopTen', {
				template: '<div must-sign-in edit-top-ten-view></div>',
			})
			.when('/claimBirthday', {
				template: '<div claim-birthday-view></div>',
			})
			.when('/holibirthdayCertificate', {
				template: '<div holibirthday-certificate-view></div>',
			})
			.when('/blog', {
				template: '<div blog-view></div>',
			})
			.when('/contactUs', {
				template: '<div must-sign-in contact-us-view></div>',
			})
			.when('/privacyPolicy', {
				template: '<div privacy-policy-view></div>',
			})
			.otherwise({
				template: '<div home-view></div>'
			});
	}]);


app.constant('set', (function () {
	return {
		create: function (index) {
			var set = {};

			index = index || 0;

			return {
				push: function (el) {
					index += 1;
					set[index] = el;
					return index;
				},
				pop: function (idx) {
					delete set[idx];
				},
				map: function (f) {
				},
				forEach: function (f) {
					for (var i in set) {
						if (set.hasOwnProperty(i)) {
							f(set[i]);
						}
					}
				},
			};
		},
	};
})());


app.factory('db', [
	'$http',
	'$q',
	'schema',
	'type',
	function ($http, $q, schema, type) {
		var db = {};
		
		schema.map(function (table) {
			var uri = '/api/' + table.name + '/';
			var convertFields = function (doc) {
				table.fields.map(function (field) {
					if (doc[field.name]) {
						// skip id type for client side
						if (field.type !== type.id) {
							doc[field.name] = field.type.fromString(doc[field.name]);
						}
					}
				});
			};
			
			var mapResponse = function (responseP) {
				return responseP.then(function (response) {
					var docs = response.data;
					if (docs) {
						if (Array.isArray(docs)) {
							docs.map(convertFields);
						}
						else {
							convertFields(docs);
						}
					}
					return docs;
				});
			};
			
			db[table.name] = {
				findOne: function (query) {
					return mapResponse($http.post(uri + 'find', query)).then(function (docs) {
						if (docs.length === 0) {
							throw 'none found';
						}
						return docs[0];
					});
				},
				find: function (query) {
					return mapResponse($http.post(uri + 'find', query));
				},
				insert: function (doc) {
					return mapResponse($http.post(uri + 'insert', doc));
				},
				update: function (query, update) {
					return mapResponse($http.post(uri + 'update', {
						query: query,
						update: update
					}));
				},
				remove: function (query) {
					return mapResponse($http.post(uri + 'remove', query));
				},
			};
		});

		return db;
	}]);

app.factory('meP', [
	'$http',
	function ($http) {
		return $http.get('/auth/me').then(function (res) {
			return res.data;
		});
	}]);

app.factory('adminP', [
	'db',
	'meP',
	function (db, meP) {
		return meP.then(function (me) {
			return db.admin.findOne({
				user: me._id
			});
		});
	}]);

app.factory('profileP', [
	'db',
	'meP',
	function (db, meP) {
		return meP.then(function (me) {
			return db.profile.findOne({
				user: me._id,
			});
		});
	}]);

app.factory('auth', [
	'$http',
	function ($http) {
		return {
			signIn: function (creds) {
				return $http.post('/auth/login', creds);
			},
			signOut: function () {
				return $http.get('/auth/logout');
			},
			loginWithFacebook: function (authResponse) {
				return $http.post('/auth/facebook', {
					username: authResponse.accessToken,
					password: authResponse.accessToken,
				});
			},
			resendConfirmEmail: function (email) {
				return $http.post('/auth/resendConfirmEmail', {
					locationOrigin: window.location.origin,
					email: email,
				});
			},
		};
	}]);

app.factory('fade', [
	'$timeout',
	function ($timeout) {
		return {
			fadeIn: function ($elem, duration) {
				var setTransition = function (duration) {
					$elem.css('transition', duration);
				}
				
				duration = (duration || 1) + 's';
				
				setTransition('initial');
				$elem.css('opacity', 0);
				$elem.css('display', '');
				$timeout(function () {
					setTransition('opacity ' + duration);
					$elem.css('opacity', 1);
				}, 100);
			},
			fadeOut: function ($elem, duration, cb) {
				var setTransition = function (duration) {
					$elem.css('transition', duration);
				}
				
				duration = duration || 1;
				
				setTransition('opacity ' + duration + 's');
				$timeout(function () {
					$elem.css('opacity', 0);
					$timeout(function () {
						$elem.css('display', 'none');
						cb();
					}, duration * 1000);
				}, 100);
			},
			snapIn: function ($elem) {
				var setTransition = function (duration) {
					$elem.css('transition', duration);
				}
				
				setTransition('opacity 0s');
				$timeout(function () {
					$elem.css('opacity', 1);
				});
			},
		};
	}]);

app.constant('search', {
	contains: function (outer, inner) {
		var normalize = function (str) {
			str = str || "";
			str = str.toLowerCase();
			return str;
		};

		outer = normalize(outer);
		inner = normalize(inner);
		
		return outer.indexOf(inner) !== -1;
	},
});

app.run([
	'$rootScope',
	'$timeout',
	'adminP',
	'meP',
	'profileP',
	'schema',
	'set',
	function ($rootScope, $timeout, adminP, meP, profileP, schema, set) {
		$rootScope.query = '';

		$rootScope.true = true;

		var searchHandlers = set.create();

		$rootScope.searchChange = function () {
			searchHandlers.forEach(function (f) {
				f($rootScope.search);
			});
		};
		$rootScope.onSearchChange = function (f) {
			f($rootScope.query);
			return searchHandlers.push(f);
		};
		$rootScope.offSearchChange = function (h) {
			searchHandlers.pop(h);
		};


		adminP.then(function (admin) {
			$rootScope.admin = admin;
		});
		
		meP.then(function (me) {
			$rootScope.me = me;
		});

		profileP.then(function (profile) {
			$rootScope.meProfile = profile;
		});
		
		
		$rootScope.schema = schema;

		$rootScope.oneTimeRecurringDisplayName = {
			oneTime: 'One-Time',
			recurring: 'Per Month',
		};

		
		$rootScope.months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
		var monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
		$rootScope.monthNames = monthNames;
		var daysByMonth = [
			31,
			29,
			31,
			30,
			31,
			30,
			31,
			31,
			30,
			31,
			30,
			31,
		];
		$rootScope.daysByMonth = daysByMonth.map(function (total) {
			var days = [];
			for (var i = 1; i <= total; i++) {
				days.push(i);
			}
			return days;
		});
	}]);

app.constant('toggleHeight', function ($elem, duration) {
	duration = duration || '0.2s';
	$elem.css('transition', 'initial');

	var currentHeight = parseInt($elem.css('height'));
	var targetHeight;
	
	if (currentHeight === 0) {
		$elem.css('height', 'initial');
		targetHeight = parseInt($elem.css('height'));
		$elem.css('height', '0px');
	}
	else {
		targetHeight = 0;
	}

	$elem.css('transition', 'height ' + duration);
	setTimeout(function () {
		$elem.css('height', targetHeight + 'px');
	});
});

app.factory('storiesP', [
	'$q',
	function ($q) {
		var storiesD = $q.defer();
		
		storiesD.resolve([{
			_id: 0,
			name: "Hallowoops!",
			author: "Linda Offerdahl",
			text: "My birthday is on Halloween.  You'll never guess what happens when you receive five different halloween costumes and a blow torch for your birthday, and try to melt them together real fast to make a super costume.",
			storyType: 'worst',
		}, {
			_id: 1,
			name: "Fish a plenty",
			author: "Jed Longcast",
			text: "I live in a little fishing hut.  To my advantage, I have befriended the Lady of the lake.  Indeed, I no longer tie down my fishing boat at night, for I know she watches over it.\n\nAnyhoo, my birthday is on April 1st.  My 30th birthday I went out to the boat and broke wind until sunrise.  I went inside to eat breakfast and the Lady was there, out of the water!  She was eating out of my cereal box.  I helped her back to the lake, and she thanked me.\n\nWent back into the house and there were fish all over the table and chairs.  No idea how they got there, but they smelled good, so I washed them off and put them in the fridge to sell.  No complaints.",
			storyType: 'best',
		}, {
			_id: 2,
			name: "I'm Dreaming of a Red Christmas",
			author: "Hildebrandt Keaton",
			text: "Lots of hot sauce blah blah blah.",
			storyType: 'best',
		}, {
			_id: 3,
			name: "Strange Cake, But Good",
			author: "Tai Do",
			text: "Lorem ipsum dolores sit amid blah blah baaoek.",
			storyType: 'best',
		}, {
			_id: 4,
			name: "The Swimming Pool",
			author: "Brunhilda Irving",
			text: "Swimming pool swimming pool blah blah blah",
			storyType: 'worst',
		}]);

		return storiesD.promise;
	}]);

app.controller('header', [
	'$scope',
	'auth',
	'fade',
	'meP',
	function ($scope, auth, fade, meP) {
		meP.then(function (me) {
			$scope.me = me;
		}, function (err) {
			$scope.loggedOut = true;
		});
		
		$scope.signOut = function () {
			auth.signOut().then(function () {
				// TODO: add some redirect function
				window.location.hash = '#/';
				window.location.reload();
			});
		};

		var $dropdownButtons = $('.dropdown-button');
		var $dropdownMenu = $('.header-dropdown-menu');
		$dropdownButtons.on('click', function (ev) {
			if ($dropdownMenu.css('display') === 'none') {
				$dropdownMenu.css('display', 'initial');
				$dropdownButtons.addClass('menu-active');
			}
			else {
				$dropdownMenu.css('display', 'none');
				$dropdownButtons.removeClass('menu-active');
			}

			ev.stopPropagation()
		});
		$('body').on('click', function () {
			$dropdownMenu.css('display', 'none');
			$dropdownButtons.removeClass('menu-active');
		});

		$scope.toggleMenu = function (ev, leftRight, onOff) {
			ev.stopPropagation();
			
			var $menu = $('.header-menu.' + leftRight);
			var menuBottom = parseInt($menu.css('bottom'));
			var menuHeight = parseInt($menu.css('height'));
			var menuPadding = parseInt($menu.css('padding'));
			if (menuBottom === 0) {
				$menu.css('bottom', -menuHeight - 2 * menuPadding);
			}
			else {
				$menu.css('bottom', 0);
			}

			// can pass in 'on' or 'off' instead of toggling
			if (onOff === 'off') {
				$menu.css('bottom', 0);
			}
			else if (onOff === 'on') {
				$menu.css('bottom', -menuHeight - 2 * menuPadding);
			}
		};

		$('body').on('click', function (event) {
			$scope.toggleMenu(event, 'left', 'off');
			$scope.toggleMenu(event, 'right', 'off');
		});
	}]);

app.directive('signInView', [
	'$location',
	'$timeout',
	'auth',
	'db',
	'meP',
	function ($location, $timeout, auth, db, meP) {
		return {
			templateUrl: './templates/signIn.html',
			link: function (scope, elem, attrs) {
				
				scope.creds = {};

				scope.signIn = function () {
					auth.signIn(scope.creds).then(function () {
						// TODO: add some redirect function
						window.location.reload();
					}, function (res) {
						scope.mustRegister = true;
					});
				};

				scope.loginWithFacebook = function () {
					var facebookPipeline = function (response) {
						if (response.status === 'unknown' || response.status === 'not_authorized') {
							FB.login(facebookPipeline, {
								scope: 'email, public_profile'
							});
						}
						else {
							auth.loginWithFacebook(response.authResponse).then(function () {
								window.location.reload();
							});
						}
					};
					FB.getLoginStatus(facebookPipeline, true);
				};


				scope.know = $location.search().know;
				scope.am = $location.search().am;
				
				var holibirthdate = $location.search().holibirthdate;
				scope.holibirthdate = holibirthdate;

				meP.then(function (me) {
					$timeout(function () {
						if (holibirthdate) {
							db.holibirthday.findOne({
								user: me._id
							}).then(function () {
								window.location.hash = '#/holibirthdayCertificate?user=' + me._id;
							}, function () {
								var holibirthday = {
									user: me._id,
									date: new Date(parseInt(holibirthdate)),
								};
								db.holibirthday.insert(holibirthday).then(function () {
									$timeout(function () {
										window.location.hash = '#/holibirthdayCertificate?user=' + me._id;
									});
								});
							});
						}
						else {
							window.location.hash = '#/';
						}
					});
				});
			},
		};
	}]);

app.directive('registerView', [
	'$http',
	'$location',
	'db',
	'grecaptchaP',
	function ($http, $location, db, grecaptchaP) {
		return {
			templateUrl: './templates/register.html',
			link: function (scope, elem, attrs) {
				scope.newUser = {
					locationOrigin: window.location.origin,
					know: $location.search().know === 'true' ? true : false,
					am: $location.search().am === 'true' ? true : false,
				};

				grecaptchaP.then(function () {
					grecaptcha.render('grecaptcha-div', {
						sitekey: '6Lf1ogkTAAAAABlzCh_MhCA8hlmkc5zmockoeQsc'
					});
				});
				scope.register = function () {
					scope.newUser.captchaResponse = grecaptcha.getResponse();

					if (!scope.newUser.firstName || !scope.newUser.lastName || !scope.newUser.email || !scope.newUser.password || !scope.newUser.privacyPolicy || (scope.newUser.password !== scope.newUser.confirmPassword)) {
						return;
					}

					$http.post('/auth/register', scope.newUser).then(function (response) {
						var profile = response.data;
						var holibirthdate = $location.search().holibirthdate;
						holibirthdate = holibirthdate ? holibirthdate : '';

						window.location.hash = "#/signIn?holibirthdate=" + holibirthdate;
					}, function () {
						grecaptcha.reset();
					});
				};
			},
		};
	}]);

app.directive('profileView', [
	'$location',
	'db',
	'meP',
	function ($location, db, meP) {
		return {
			templateUrl: './templates/profile.html',
			link: function (scope, elem, attrs) {
				var user = $location.search().user;
				
				db.profile.findOne({
					user: user
				}).then(function (profile) {
					scope.profile = profile;
				});

				db.story.find({
					user: user
				}).then(function (stories) {
					stories.sort(function (s1, s2) {
						return new Date(s2.createDate).getTime() -
							new Date(s1.createDate).getTime();
					});
					scope.stories = stories;
				});
			},
		};
	}]);

app.directive('editProfileView', [
	'$http',
	'$location',
	'$timeout',
	'db',
	'meP',
	function ($http, $location, $timeout, db, meP) {
		return {
			templateUrl: './templates/editProfile.html',
			link: function (scope, elem, attrs) {
				var user = $location.search().user;
				
				db.profile.findOne({
					user: user
				}).then(function (profile) {
					scope.profile = profile;
				});

				db.story.find({
					user: user
				}).then(function (stories) {
					scope.bestStory = stories.filter(function (story) {
						return story.storyType === 'best';
					})[0];
					scope.worstStory = stories.filter(function (story) {
						return story.storyType === 'worst';
					})[0];
					scope.stories = stories.filter(function (story) {
						return story.storyType === 'forgotmenot';
					});
				});

				scope.changeImage = function () {
					$timeout(function () {
						var fd = new FormData();
						fd.append('file', scope.imageData);
						$http.post('/api/uploadFile/insert', fd, {
							transformRequest: angular.identity,
							headers: { 'Content-Type': undefined }
						}).then(function (res) {
							var filename = res.data;
							scope.profile.profileImageURL = '/api/uploadFile/find?filename=' + filename;
						});
					});
				};

				scope.saveProfile = function () {
					db.profile.update({
						_id: scope.profile._id
					}, scope.profile).then(function () {
						window.location.hash = '/profile?user=' + scope.profile.user;
						window.location.reload();
					});
				};
			},
		};
	}]);

app.directive('storyView', [
	'$location',
	'$sce',
	'$timeout',
	'db',
	function ($location, $sce, $timeout, db) {
		return {
			templateUrl: './templates/storyView.html',
			link: function (scope, elem, attrs) {
				var _id = $location.search()._id;
				
				db.story.findOne({
					_id: _id
				}).then(function (story) {
					var title = "Holibirthday - " + story.name;
					document.title = title;

					while (title.indexOf('"') !== -1) {
						title.replace('"', '\'');
					}
					
					story.textSafe = $sce.trustAsHtml(story.text);
					scope.stories = [story];
					scope.blog = story.storyType === 'blog';

					$timeout(function () {
						a2a.init('page');
						twttr.ready(function () {
							twttr.widgets.load();
						});
						FB.XFBML.parse($(elem)[0]);
						gapi.plus.go(($(elem)[0]));
					});
					
					db.profile.findOne({
						user: story.user
					}).then(function (profile) {
						scope.profile = profile;
					});
					
					db.story.find({
						storyType: story.storyType
					}).then(function (relatedStories) {
						scope.relatedStories = relatedStories.filter(function (s) {
							return s._id !== story._id;
						});
					});
				});
			},
		};
	}]);

app.directive('yourHolibirthday', [
	'db',
	'meP',
	function (db, meP) {
		return {
			templateUrl: './templates/yourHolibirthday.html',
			link: function (scope, elem, attrs) {
				meP.then(function (me) {
					db.holibirthday.findOne({
						user: me._id
					}).then(function (holibirthday) {
						scope.holibirthday = holibirthday;
					});
				});

				var months = [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December'
				];
				scope.months = months;
			},
		};
	},
]);

app.directive('homeView', [
	'$q',
	'$sce',
	'db',
	'meP',
	'schema',
	function ($q, $sce, db, meP, schema) {
		return {
			templateUrl: './templates/homeView.html',
			link: function (scope, elem, attrs) {
				scope.featuredPosts = [];
				
				db.featuredPost.find({}).then(function (fps) {
					fps = fps.filter(function (fp) {
						return fp.startDate.getTime() < new Date().getTime();
					});
					
					fps.sort(function (c1, c2) {
						if (!c1.startDate) {
							return 1;
						}
						if (!c2.startDate) {
							return -1;
						}
						return c2.startDate.getTime() - c1.startDate.getTime();
					});

					scope.storiesById = {};
					
					$q.all(fps.map(function (fp) {
						db.story.findOne({
							_id: fp.story
						}).then(function (story) {
							story.textSafe = $sce.trustAsHtml(story.text);
							scope.storiesById[story._id] = [story];
						});
					})).then(function () {
						scope.featuredPosts = [fps[0]];
					});
				});

				db.story.find({}).then(function (stories) {
					stories.sort(function (s1, s2) {
						return new Date(s2.createDate).getTime() -
							new Date(s1.createDate).getTime();
					});
					stories.map(function (s) {
						s.textSafe = $sce.trustAsHtml(s.text);
					});
					scope.blogPosts = [stories.filter(function (story) {
						return story.storyType === 'blog';
					})[0]];
					scope.stories = [stories.filter(function (story) {
						return story.storyType !== 'blog';
					})[0]];
				});
				
				var today = new Date();

				scope.todayBirthdays = [];
				db.holibirthday.find({
					month: today.getMonth(),
					date: today.getDate(),
				}).then(function (holibirthdays) {
					scope.todayBirthdays = holibirthdays;
					scope.todayProfiles = {};
					holibirthdays.map(function (holibirthday) {
						db.profile.findOne({
							user: holibirthday.user
						}).then(function (profile) {
							scope.todayProfiles[profile.user] = profile;
						});
					});

					db.profile.find({
						birthMonth: today.getMonth() + 1,
						birthDate: today.getDate(),
					}).then(function (profiles) {
						profiles.map(function (profile) {
							scope.todayBirthdays.push({
								user: profile.user,
							});
							scope.todayProfiles[profile.user] = profile;
						});
					});
				});
				scope.currentIndex = 0;
				
				scope.todaysBirthdays = [{
					name: 'Norton Brown',
					imgSrc: 'content/noProfileImage.png',
				}, {
					name: 'Grady O\'Steele',
					imgSrc: 'content/grady.png',
				}];

				var $elem = $(elem);

				var slideshowWidth = function () {
					return parseInt($elem.find('.slideshow').css('width'));
				};

				var slideshowActionD = $q.defer();
				slideshowActionD.resolve();
				var queueSlideshowAction = function (action) {
					var oldAction = slideshowActionD;
					var newAction = $q.defer();
					slideshowActionD = newAction;
					oldAction.promise.then(function (aoeu) {
						action(newAction);
					});
				};

				var transitionLeft = function ($el, from, to) {
					var d = $q.defer();

					$el.css('left', from);
					setTimeout(function () {
						$el.css('transition', 'left 0.5s');
						$el.css('left', to);
						setTimeout(function () {
							$el.css('transition', 'initial');
							setTimeout(function () {
								d.resolve();
							}, 100);
						}, 500);
					}, 100);

					return d.promise;
				};

				var $current = $elem.find('.slideshow .current');
				var $next = $elem.find('.slideshow .next');
				
				scope.prevBirthday = function () {
					queueSlideshowAction(function (d) {
						var length = scope.todayBirthdays.length;
						
						scope.nextIndex = (scope.currentIndex + (length - 1)) % length;
						var width = slideshowWidth();
						transitionLeft($next, -width, 0);
						transitionLeft($current, 0, width).then(function () {
							d.resolve();
							scope.currentIndex = scope.nextIndex;
							$current.css('left', 0);
							$next.css('left', width);
						});
					});
				};

				scope.nextBirthday = function () {
					queueSlideshowAction(function (d) {
						var length = scope.todayBirthdays.length;
						
						scope.nextIndex = (scope.currentIndex + 1) % length;
						var width = slideshowWidth();
						transitionLeft($next, width, 0);
						transitionLeft($current, 0, -width).then(function () {
							d.resolve();
							scope.currentIndex = scope.nextIndex;
							$current.css('left', 0);
							$next.css('left', width);
						});
					});
				};

				$(window).resize(function () {
					var width = slideshowWidth();
					$next.css('left', width);
				});
			},
		};
	}]);

app.directive('addStoryView', [
	'$location',
	'$sce',
	'areYouSure',
	'db',
	'meP',
	'stockPhotos',
	function ($location, $sce, areYouSure, db, meP, stockPhotos) {
		return {
			templateUrl: './templates/addStory.html',
			link: function (scope, elem, attrs) {
				scope.stockPhotos = stockPhotos;
				
				var storyType = $location.search().storyType;
				
				nicEditors.allTextAreas();
				var editor = nicEditors.findEditor('storytext');
				editor.setContent('<div>&nbsp;</div>');

				scope.titleByStoryType = {
					best: 'Add a Good Holiday Birthday Story',
					worst: 'Add a Bad Holiday Birthday Story ',
					forgotmenot: 'Add a Friend\'s Holiday Birthday Story',
					blog: 'Add a Blog Post',
				};

				meP.then(function (me) {
					if ($location.search()._id) {
						db.story.findOne({
							_id: $location.search()._id,
						}).then(function (story) {
							scope.story = story;
							editor.setContent(story.text);
						});
					}
					
					scope.story = {
						user: me._id,
						storyType: storyType || 'forgotmenot',
						imageUrl: stockPhotos[0].url,
						imageWidth: 50,
					};
					setInterval(function () {
						scope.story.text = editor.getContent();
						scope.story.textSafe = $sce.trustAsHtml(scope.story.text);
					}, 1000);

					scope.postStory = function () {
						scope.story.text = editor.getContent();
						db.story.insert(scope.story).then(function (story) {
							if (story.storyType === 'blog') {
								window.location.hash = '#/blog';
							}
							else {
								window.location.hash = '#/story?_id=' + story._id;
							}
						});
					};

					scope.updateStory = function () {
						areYouSure('update this story', function () {
							scope.story.text = editor.getContent();
							db.story.update({
								_id: scope.story._id
							}, scope.story).then(function () {
								window.location.hash = '#/story?_id=' + scope.story._id;
							});
						});
					};

					scope.deleteStory = function () {
						areYouSure('delete this story', function () {
							db.story.remove({
								_id: scope.story._id
							}, scope.story).then(function () {
								if (scope.story.storyType === 'blog') {
									window.location.hash = '#/blog';
								}
								else {
									window.location.hash = '#/profile?user=' + me._id;
								}
							});
						});
					};
				});
			},
		};
	}]);

app.directive('storiesView', [
	'$location',
	'$sce',
	'db',
	'schema',
	function ($location, $sce, db, schema) {
		return {
			templateUrl: './templates/storiesView.html',
			link: function (scope, elem, attrs) {
				scope.storyType = $location.search().storyType || 'forgotmenot';
				
				db.story.find({}).then(function (stories) {
					stories.sort(function (s1, s2) {
						return new Date(s2.createDate).getTime() -
							new Date(s1.createDate).getTime();
					});
					stories.map(function (s) {
						s.textSafe = $sce.trustAsHtml(s.text);
					});
					scope.stories = {
						best: stories.filter(function (s) {
							return s.storyType === schema.story.storyType.best;
						}),
						worst: stories.filter(function (s) {
							return s.storyType === schema.story.storyType.worst;
						}),
						forgotmenot: stories.filter(function (s) {
							return s.storyType === schema.story.storyType.forgotmenot;
						}),
					};
				});

				scope.storyTypeTitle = {
					best: 'Good Birthday Stories',
					worst: 'Bad Birthday Stories',
					forgotmenot: 'Forgotmenot Stories',
				};
			},
		};
	}]);

app.directive('blogView', [
	'$location',
	'$sce',
	'db',
	'schema',
	function ($location, $sce, db, schema) {
		return {
			templateUrl: './templates/blogView.html',
			link: function (scope, elem, attrs) {
				db.story.find({
					storyType: 'blog',
				}).then(function (stories) {
					stories.sort(function (s1, s2) {
						return new Date(s2.createDate).getTime() -
							new Date(s1.createDate).getTime();
					});
					stories.map(function (s) {
						s.textSafe = $sce.trustAsHtml(s.text);
					});
					scope.stories = stories;
				});
			},
		};
	}]);

app.directive('topTenView', [
	'$sce',
	'db',
	'upcomingCountdownP',
	function ($sce, db, upcomingCountdownP) {
		return {
			templateUrl: './templates/topTenView.html',
			link: function (scope, elem, attrs) {
				upcomingCountdownP.then(function (countdown) {
					scope.countdown = countdown;
					scope.storiesById = {};
										
					countdown.stories.map(function (storyId) {
						scope.storiesById[storyId] = [];
						db.story.findOne({
							_id: storyId
						}).then(function (story) {
							story.textSafe = $sce.trustAsHtml(story.text);
							scope.storiesById[storyId].push(story);
						});
					});
				});
			},
		};
	}]);

app.directive('editTopTenView', [
	'$location',
	'$q',
	'$sce',
	'db',
	'schema',
	function ($location, $q, $sce, db, schema) {
		return {
			templateUrl: './templates/editTopTenView.html',
			link: function (scope, elem, attrs) {
				scope.storyType = $location.search().storyType || 'forgotmenot';


				scope.featuredPosts = [];
				db.story.find({}).then(function (stories) {
					stories.sort(function (s1, s2) {
						return new Date(s2.createDate).getTime() -
							new Date(s1.createDate).getTime();
					});
					stories.map(function (s) {
						s.textSafe = $sce.trustAsHtml(s.text);
					});
					scope.stories = stories;
					scope.storiesById = {};

					stories.map(function (story) {
						scope.storiesById[story._id] = story;
					});
					
					db.featuredPost.find({}).then(function (fps) {
						fps.sort(function (c1, c2) {
							if (!c1.startDate) {
								return 1;
							}
							if (!c2.startDate) {
								return -1;
							}
							return c2.startDate.getTime() - c1.startDate.getTime();
						});

						scope.featuredPosts = fps;
					});
				});


				var removeFeaturedPosts = [];

				
				scope.newFeaturedPost = {};
				scope.newStories = [];
				scope.addPost = function () {
					if (scope.newStories[0] && scope.newFeaturedPost.startDate) {
						scope.newFeaturedPost.story = scope.newStories[0];
						scope.featuredPosts.push(scope.newFeaturedPost);
						
						scope.newStories = [];
						scope.newFeaturedPost = {};

						scope.featuredPosts.sort(function (c1, c2) {
							if (!c1.startDate) {
								return 1;
							}
							if (!c2.startDate) {
								return -1;
							}
							return c2.startDate.getTime() - c1.startDate.getTime();
						});
					}
				};

				scope.removePost = function (index) {
					var post = scope.featuredPosts.splice(index, 1)[0];
					removeFeaturedPosts.push(post);
				};

				

				scope.storyTypeTitle = {
					best: 'Good Birthday Stories',
					worst: 'Bad Birthday Stories',
					forgotmenot: 'Forgotmenot Stories',
				};

				scope.saveAllChanges = function () {
					var tasks = [];
					
					scope.featuredPosts.map(function (fp) {
						if (!fp._id) {
							tasks.push(db.featuredPost.insert(fp));
						}
					});

					removeFeaturedPosts.map(function (fp) {
						if (fp._id) {
							tasks.push(db.featuredPost.remove(fp));
						}
					});

					$q.all(tasks).then(function () {
						window.location.hash = '#/';
						window.location.reload();
					});
				};
			},
		};
	}]);

app.directive('claimBirthdayView', [
	'$q',
	'db',
	'fade',
	'meP',
	function ($q, db, fade, meP) {
		return {
			templateUrl: './templates/claimBirthday.html',
			link: function (scope, elem, attrs) {
				scope.months = [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December'
				];
				
				var $elem = $(elem);
				
				var $month = $elem.find('.slots .month');
				var $dayTens = $elem.find('.slots .dayTens');
				var $dayOnes = $elem.find('.slots .dayOnes');

				var monthMachine = $month.slotMachine();
				var dayTensMachine = $dayTens.slotMachine();
				var dayOnesMachine = $dayOnes.slotMachine();

				
				var $body = $('body');
				var $grabber = $elem.find('.slot-machine-grabber');

				var startYCoord = 0;
				var pullingGrabber = false;


				var chooseNonHoliday = function () {
					var equals = function (b1, b2) {
						return b1.month === b2.month &&
							b1.dayTens === b2.dayTens &&
							b1.dayOnes === b2.dayOnes;
					}
					var createDate = function () {
						var randomDate = new Date(new Date().getTime() * Math.random());
						
						var month = randomDate.getMonth();
						var date = randomDate.getDate();
						var dateTens = parseInt((date / 10) + '');
						var dateOnes = date % 10;
						return {
							month: month,
							dayTens: dateTens,
							dayOnes: dateOnes,
							date: randomDate,
						};
					}

					var matchesAnyHoliday = function (date) {

						if (date.month === 10) {
							if (date.dayTens >= 2) {
								return true;
							}
						}
						
						var holidays = [{
							month: 0,
							dayTens: 0,
							dayOnes: 1,
							reason: 'New Years',
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
						var date = createDate();
					}
					return date;
				};
				
				
				$grabber.on('mouseup', function (ev) {
					pullingGrabber = false;
					$grabber.animate({top: 0});
				});
				$grabber.on('mousedown', function (ev) {
					startYCoord = ev.clientY;
					pullingGrabber = true;
					ev.preventDefault();
				});
				
				$body.on('mousemove', function (ev) {
					if (pullingGrabber) {
						var yDistance = ev.clientY - startYCoord;

						yDistance = Math.max(0, yDistance);
						// magic number :(*
						yDistance = Math.min(100, yDistance);
						
						$grabber.css('top', yDistance);

						
						var top = parseInt($grabber.css('top'));
						if (top > 90) {
							pullingGrabber = false;

							var maxVariability = 100;
							var shuffleTime = 2000;

							var monthStartDelay = Math.random();
							var dayOnesStartDelay = Math.random() * maxVariability;
							var dayTensStartDelay = Math.random() * maxVariability;

							var monthStopDelay = shuffleTime + Math.random() * maxVariability;
							var dayOnesStopDelay = shuffleTime + Math.random() * maxVariability;
							var dayTensStopDelay = shuffleTime + Math.random() * maxVariability;

							var date = chooseNonHoliday();
							monthMachine.setRandomize(function () {
								return date.month;
							});
							dayTensMachine.setRandomize(function () {
								return date.dayTens;
							});
							dayOnesMachine.setRandomize(function () {
								return date.dayOnes;
							});

							setTimeout(function () {
								monthMachine.shuffle();
							}, monthStartDelay);
							setTimeout(function () {
								dayOnesMachine.shuffle();
							}, dayOnesStartDelay);
							setTimeout(function () {
								dayTensMachine.shuffle();
							}, dayTensStartDelay);

							setTimeout(function () {
								monthMachine.stop();
							}, monthStopDelay);
							setTimeout(function () {
								dayOnesMachine.stop();
							}, dayOnesStopDelay);
							setTimeout(function () {
								dayTensMachine.stop();
							}, dayTensStopDelay);

							setTimeout(function () {
								scope.date = date;
								fade.fadeIn($elem.find('.events'));
								scope.$digest();
							}, shuffleTime + maxVariability + 500);

							$grabber.animate({top: 0});
						}
					}
				});

				meP.then(function (me) {
					db.holibirthday.findOne({
						user: me._id,
					}).then(function (holibirthday) {
						if (holibirthday) {
							scope.holibirthday = holibirthday;
							
							var month = holibirthday.date.getMonth() - 1;
							var date = holibirthday.date.getDate();
							var dateTens = parseInt((date / 10) + '');
							var dateOnes = date % 10;
							
							scope.date = {
								month: month,
								dayTens: dateTens,
								dayOnes: dateOnes,
								date: dateObj,
							};
							
							monthMachine.setRandomize(function () {
								return month;
							});
							dayTensMachine.setRandomize(function () {
								return dateTens;
							});
							dayOnesMachine.setRandomize(function () {
								return dateOnes;
							});
							monthMachine.shuffle();
							dayTensMachine.shuffle();
							dayOnesMachine.shuffle();
							monthMachine.stop();
							dayTensMachine.stop();
							dayOnesMachine.stop();
						}
					});
				});


				scope.todaysBirthdays = [{
					name: 'Norton Brown',
					imgSrc: 'content/noProfileImage.png',
				}, {
					name: 'Grady O\'Steele',
					imgSrc: 'content/grady.png',
				}];
				scope.currentIndex = 0;

				var slideshowWidth = function () {
					return parseInt($elem.find('.slideshow').css('width'));
				};

				var slideshowActionD = $q.defer();
				slideshowActionD.resolve();
				var queueSlideshowAction = function (action) {
					var oldAction = slideshowActionD;
					var newAction = $q.defer();
					slideshowActionD = newAction;
					oldAction.promise.then(function (aoeu) {
						action(newAction);
					});
				};

				var transitionLeft = function ($el, from, to) {
					var d = $q.defer();

					$el.css('left', from);
					setTimeout(function () {
						$el.css('transition', 'left 0.5s');
						$el.css('left', to);
						setTimeout(function () {
							$el.css('transition', 'initial');
							setTimeout(function () {
								d.resolve();
							}, 100);
						}, 500);
					}, 100);

					return d.promise;
				};

				var $current = $elem.find('.slideshow .current');
				var $next = $elem.find('.slideshow .next');
				
				scope.prevBirthday = function () {
					queueSlideshowAction(function (d) {
						var length = scope.todaysBirthdays.length;
						
						scope.nextIndex = (scope.currentIndex + (length - 1)) % length;
						var width = slideshowWidth();
						transitionLeft($next, -width, 0);
						transitionLeft($current, 0, width).then(function () {
							d.resolve();
							scope.currentIndex = scope.nextIndex;
							$current.css('left', 0);
							$next.css('left', width);
						});
					});
				};

				scope.nextBirthday = function () {
					queueSlideshowAction(function (d) {
						var length = scope.todaysBirthdays.length;
						
						scope.nextIndex = (scope.currentIndex + 1) % length;
						var width = slideshowWidth();
						transitionLeft($next, width, 0);
						transitionLeft($current, 0, -width).then(function () {
							d.resolve();
							scope.currentIndex = scope.nextIndex;
							$current.css('left', 0);
							$next.css('left', width);
						});
					});
				};

				$(window).resize(function () {
					var width = slideshowWidth();
					$next.css('left', width);
				});

				scope.claimDate = function () {
					meP.then(function (me) {
						var holibirthday = {
							user: me._id,
							date: scope.date.date,
						};

						db.holibirthday.insert(holibirthday).then(function () {
							window.location.hash = '#/holibirthdayCertificate?user=' + me._id;
						});
					}, function () {
						window.location = '#/signIn?holibirthdate=' + scope.date.date.getTime();
					});
				};
			},
		};
	}]);


app.directive('holibirthdayCertificateView', [
	'$location',
	'db',
	'fade',
	function ($location, db, fade) {
		return {
			templateUrl: './templates/holibirthdayCertificate.html',
			link: function (scope, elem, attrs) {
				var months = [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December'
				];
				var user = $location.search().user;

				if (!user) {
					scope.noHolibirthdayFound = true;
				}
				else {
					db.holibirthday.findOne({
						user: user,
					}).then(function (holibirthday) {
						db.profile.findOne({
							user: user,
						}).then(function (profile) {
							scope.holibirthday = holibirthday;
							scope.profile = profile;
							
							var canvas = $(elem).find('canvas')[0];
							var ctx = canvas.getContext('2d');
							var img = $(elem).find('img.certificate-template')[0];
							ctx.drawImage(img, 0, 0);
							ctx.font = "50px Arial";
							
							var name = profile.firstName + ' ' + profile.lastName;
							var nameDimensions = ctx.measureText(name);

							var date = months[holibirthday.date.getMonth() - 1] + ' ' + holibirthday.date.getDate();
							var dateDimensions = ctx.measureText(date);

							ctx.fillText(name, 640 - nameDimensions.width / 2, 390);
							ctx.fillText(date, 640 - dateDimensions.width / 2, 680);

							scope.certificateImgDataUrl = canvas.toDataURL();
						}, function () {
							scope.noHolibirthdayFound = true;
						});
					}, function () {
						scope.noHolibirthdayFound = true;
					});
				}

				scope.openImage = function () {
					window.location = scope.certificateImgDataUrl;
				};
			},
		};
	}]);

app.directive('contactUsView', [
	'db',
	'meP',
	function (db, meP) {
		return {
			templateUrl: './templates/contactUs.html',
			link: function (scope, elem, attrs) {
				meP.then(function (me) {
					scope.user = me._id;
				});

				nicEditors.allTextAreas();
				var editor = nicEditors.findEditor('contactustext');
				editor.setContent('<div>&nbsp;</div>');
				
				scope.submit = function () {
					db.contactUsMessage.insert({
						user: scope.user,
						message: editor.getContent()
					}).then(function () {
						scope.submitted = true;
					});
				};
			},
		};
	}]);

app.directive('privacyPolicyView', [
	'db',
	'meP',
	function (db, meP) {
		return {
			templateUrl: './templates/privacyPolicy.html',
			link: function (scope, elem, attrs) {
			},
		};
	}]);

app.directive('aboutView', [
	function () {
		return {
			templateUrl: './templates/aboutView.html',
		};
	},
]);

app.directive('storySmall', [
	'$sce',
	'db',
	function ($sce, db) {
		return {
			scope: {
				story: '=',
				similarStories: '=',
				noReadMore: '=',
			},
			templateUrl: './templates/storySmall.html',
			link: function (scope, elem, attrs) {
				scope.story.textSafe = $sce.trustAsHtml(scope.story.text);

				setInterval(function () {
					scope.$digest();
				}, 1000);
				
				db.profile.findOne({
					user: scope.story.user,
				}).then(function (profile) {
					scope.profile = profile;
				});

				scope.storyTypeName = {
					best: 'Good Birthday',
					worst: 'Bad Birthday',
					forgotmenot: 'Forgotmenot',
				};
			},
		};
	}]);

app.directive('storyFull', [
	'$sce',
	'db',
	function ($sce, db) {
		return {
			scope: {
				story: '=',
			},
			templateUrl: './templates/storyFull.html',
			link: function (scope, elem, attrs) {
				scope.story.textSafe = $sce.trustAsHtml(scope.story.text);

				setInterval(function () {
					scope.$digest();
				}, 1000);
				
				db.profile.findOne({
					user: scope.story.user,
				}).then(function (profile) {
					scope.profile = profile;
				});
			},
		};
	}]);

app.directive('topTenSmall', [
	'$sce',
	'db',
	'upcomingCountdownP',
	function ($sce, db, upcomingCountdownP) {
		return {
			templateUrl: './templates/dailyTen.html',
			link: function (scope, elem, attrs) {
				upcomingCountdownP.then(function (countdown) {
					scope.countdown = countdown;
					scope.storiesById = {};
					
					countdown.stories.map(function (storyId) {
						scope.storiesById[storyId] = [];
						db.story.findOne({
							_id: storyId
						}).then(function (story) {
							story.textSafe = $sce.trustAsHtml(story.text);
							scope.storiesById[storyId].push(story);
						});
					});
				});
			},
		};
	}]);


app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                });
            });
        }
    }
}]);
