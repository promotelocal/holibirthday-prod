var bcrypt = require('bcrypt');
var crypto = require('crypto');
var FB = require('fb');
var https = require('https');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ObjectID = require('mongodb').ObjectID;

var Err = require('../public/Err');

var messages = {
	noSuchUser: 'No such user',
};

module.exports = function (app, config, dbWith) {
	var email = require('./email')(config);


	var generateEmailConfirmationToken = function () {
		return crypto.randomBytes(20).toString('hex');
	};

	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		var db = dbWith(done);
		
		db.user.find({
			_id: new ObjectID(id)
		}, function (users) {
			done(null, users[0]);
		});
	});

	passport.use(new LocalStrategy({
		passReqToCallback: true,
	}, function (req, username, password, done) {
		var db = dbWith(done);
		db.user.findOne({ email: username }, function (user) {
			if (!user) {
				var FB = require('fb');
				FB.setAccessToken(password);
				return FB.api('/me', function (response) {
					console.log(response);
					if (response.error) {
						return done(null, null, { message: messages.noSuchUser });
					}
					return db.user.findOne({
						facebookId: response.id,
					}, function (user) {
						if (user) {
							return done(null, user);
						}
						user = {
							email: response.email,
							facebookId: response.id,
						};
						return db.user.insert(user, function () {
							var profile = {
								user: user._id,
								firstName: response.first_name,
								lastName: response.last_name,
								email: req.body.email,
							};
							return db.profile.insert(profile, function () {
								return done(null, user);
							});
						});
					});
				});
			}
			return bcrypt.compare(password, user.passwordEncrypted, function (_, res) {
				if (res) {
					return done(null, user);
				}
				return done('Incorrect password');
			});
		});
	}));

	app.use(passport.initialize());
	app.use(passport.session());

	app.post('/auth/login', [
		passport.authenticate('local'),
		function (req, res, next) {
			return res.send();
		},
	]);

	app.post('/auth/facebook', [
		passport.authenticate('local'),
		function (req, res, next) {
			return res.send();
		},
	]);

	app.get('/auth/logout', function (req, res) {
		req.logout();
		res.send();
	});
	
	app.post('/auth/register', [
		function (req, res, next) {

			var db = dbWith(next);
		
			var model = app.schema.user;

			https.get('https://www.google.com/recaptcha/api/siteverify' +
					  '?secret=' + config.grecaptcha.secret +
					  '&response=' + req.body.captchaResponse,
					  function (response) {
						  var body = '';
						  response.on('data', function (d) {
							  body += d;
						  });
						  response.on('end', function () {
							  try {
								  var data = JSON.parse(body);
								  if (data.success) {
									  bcrypt.genSalt(function (_, salt) {
										  bcrypt.hash(req.body.password, salt, function (_, passwordEncrypted) {
											  var user = {
												  email: req.body.email,
												  passwordEncrypted: passwordEncrypted,
												  emailConfirmationToken: crypto.randomBytes(20).toString('hex'),
											  };
											  return db.user.insert(user, function () {
												  var profile = {
													  user: user._id,
													  firstName: req.body.firstName,
													  lastName: req.body.lastName,
													  email: req.body.email,
													  holibirthdayer: req.body.am === 'true' ? true : false,
													  knowAHolibirthdayer: req.body.know === 'true' ? true : false,
												  };
												  return db.profile.insert(profile, function () {
													  req.profile = profile;
													  return next();
												  });
											  });
										  });
									  });
								  }
								  else {
									  return next('Captcha incorrect');
								  }
							  }
							  catch (ex) {
								  return next('Error verifying captcha');
							  }
						  });
					  }).on('error', function () {
						  return next('Error verifying captcha');
					  }).end();
		},
		function (req, res, next) {
			return res.send(req.profile);
		}
	]);

	app.get('/auth/me', function (req, res, next) {
		var user = req.user;

		if (user) {
			return res.send(user);
		}
		else {
			res.status(401).end();
		}
	});
};
