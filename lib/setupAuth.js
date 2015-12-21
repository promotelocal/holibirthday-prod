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
	
	var sendConfirmEmail = function (user, profile, next) {
		var confirmEmailUrl = config.domain + '/#!confirmEmail/' + user.emailConfirmationToken;
		var fullName = profile.firstName + ' ' + profile.lastName;
		email.sendEmail({
			to: user.email,
			toName: fullName,
			from: 'webmaster@holibirthday.com',
			fromName: 'Holibirthday',
			subject: 'Activate your Holibirthday Account',
			text: 'Hello ' + fullName + ', \n\n\Go here to activate your account:\n\n' + confirmEmailUrl,
			html: 'Hello ' + fullName + ', <br><br>Go here to activate your account:<br><a href="' + confirmEmailUrl + '">' + confirmEmailUrl + '</a>',
		}, next);
	};


	var sendPasswordResetEmail = function (user, profile, next) {
		var resetPasswordUrl = config.domain + '/#!resetPassword/' + user.passwordResetToken;
		var fullName = profile.firstName + ' ' + profile.lastName;
		email.sendEmail({
			to: user.email,
			toName: fullName,
			from: 'webmaster@holibirthday.com',
			fromName: 'Holibirthday',
			subject: 'Reset Your Holibirthday Password',
			text: 'Hello ' + fullName + ', \n\n\Go here to set a new password:\n\n' + resetPasswordUrl,
			html: 'Hello ' + fullName + ', <br><br>Go here to set a new password:<br><a href="' + resetPasswordUrl + '">' + resetPasswordUrl + '</a>',
		}, next);
	};


	var generateToken = function () {
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
				return FB.api('/me', {
					fields: [
						'first_name',
						'last_name',
						'email',
						'birthday',
					],
				}, function (response) {
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
								email: response.email || req.body.email,
								receiveMarketingEmails: true,
								optOutToken: generateToken(),
							};
							if (response.birthday) {
								profile.birthday = new Date(response.birthday);
							}
							return db.profile.insert(profile, function () {
								return done(null, user);
							});
						});
					});
				});
			}
			return bcrypt.compare(password, user.passwordEncrypted, function (_, res) {
				if (res) {
					return db.userEmailConfirmed.findOne({
						user: user._id,
					}, function (emailConfirmed) {
						if (emailConfirmed) {
							return done(null, user);
						}
						return done('Email not confirmed');
					});
				}
				return done('Incorrect password');
			});
		});
	}));

	app.post('/auth/confirmEmail', [
		function (req, res, next) {
			var db = dbWith(next);
		
			db.user.findOne({
				emailConfirmationToken: req.body.emailConfirmationToken,
			}, function (user) {
				if (user) {
					return db.userEmailConfirmed.findOne({
						user: user._id,
						email: user.email,
					}, function (alreadyConfirmed) {
						return alreadyConfirmed ? next() : db.userEmailConfirmed.insert({
							user: user._id,
							email: user.email,
						}, function () {
							next();
						});
					});
				}
				else {
					next('no user with this token');
				}
			});
		}, function (req, res, next) {
			res.end();
		}]);

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
									  return bcrypt.genSalt(function (_, salt) {
										  return bcrypt.hash(req.body.password, salt, function (_, passwordEncrypted) {
											  var user = {
												  email: req.body.email,
												  passwordEncrypted: passwordEncrypted,
												  emailConfirmationToken: crypto.randomBytes(20).toString('hex'),
											  };
											  return db.user.insert(user, {}, function () {
												  var profile = {
													  user: user._id,
													  firstName: req.body.firstName,
													  lastName: req.body.lastName,
													  birthday: new Date(req.body.birthday),
													  email: req.body.email,
													  holibirther: req.body.holibirther,
													  knowAHolibirther: req.body.knowAHolibirther,
													  receiveMarketingEmails: req.body.receiveMarketingEmails,
												  };
												  return db.profile.insert(profile, {}, function () {
													  return sendConfirmEmail(user, profile, next);
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

	app.post('/auth/resendConfirmEmail', [
		function (req, res, next) {
			var db = dbWith(next);

			db.user.findOne({
				email: req.body.email
			}, function (user) {
				if (!user) {
					return res.status(400).send("No such user");
				}
				db.profile.findOne({
					user: user._id,
				}, function (profile) {
					return sendConfirmEmail(user, profile, next);
				});
			});
		}, function (req, res, next) {
			return res.send();
		}]);
	
	app.post('/auth/resetPasswordRequest', [
		function (req, res, next) {
			var db = dbWith(next);

			db.user.findOne({
				email: req.body.email
			}, function (user) {
				if (!user) {
					return res.status(400).send("No such user");
				}
				user.passwordResetToken = generateToken();
				user.passwordResetDate = new Date();
				db.user.update({
					_id: user._id,
				}, {
					$set: {
						passwordResetToken: user.passwordResetToken,
						passwordResetDate: user.passwordResetDate,
					},
				}, function () {
					db.profile.findOne({
						user: user._id,
					}, function (profile) {
						return sendPasswordResetEmail(user, profile, next);
					});
				});
			});
		}, function (req, res, next) {
			return res.send();
		}]);

	var maxPasswordResetTokenAge = 1000 * 60 * 60 * 24; // 24 hours
	app.post('/auth/resetPassword', [
		function (req, res, next) {
			var db = dbWith(next);

			if (!req.body.passwordResetToken ||
			   req.body.passwordResetToken.length === 0) {
				return next('you must provide a token');
			}

			return db.user.findOne({
				passwordResetToken: req.body.passwordResetToken,
			}, function (user) {
				if (user) {
					if (maxPasswordResetTokenAge > (new Date().getTime() - user.passwordResetDate.getTime())) {
						return bcrypt.genSalt(function (_, salt) {
							return bcrypt.hash(req.body.password, salt, function (_, passwordEncrypted) {
								return db.user.update({
									_id: user._id,
								}, {
									$set: {
										passwordEncrypted: passwordEncrypted,
									},
								}, function () {
									return next();
								});
							});
						});
					}
					return next('token too old');
				}
				return next('no user with this token');
			});
		}, function (req, res, next) {
			res.end();
		}]);

	app.post('/auth/setPassword', [
		function (req, res, next) {
			var db = dbWith(next);

			if (!req.user) {
				return next('must be logged in');
			}

			return bcrypt.genSalt(function (_, salt) {
				return bcrypt.hash(req.body.password, salt, function (_, passwordEncrypted) {
					return db.user.update({
						_id: req.user._id,
					}, {
						$set: {
							passwordEncrypted: passwordEncrypted,
						},
					}, function () {
						return next();
					});
				});
			});
		},
		function (req, res, next) {
			res.end();
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

	app.post('/auth/optOutEmails', function (req, res, next) {
		var db = dbWith(next);
		var token = req.body.token.substring('?token='.length);
		return db.profile.findOneOrFail({
			optOutToken: token,
		}, function (p) {
			return db.profile.update({
				_id: p._id,
			}, {
				$set: {
					receiveMarketingEmails: false,
				},
			}, function () {
				return res.send();
			});
		});
	});
};





