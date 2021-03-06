var Err = require('../public/Err');

module.exports = function (app, config, dbWith) {

	var stripe = require('stripe')(config.stripe.secretKey);

	app.post('/stripe/myCustomer', [
		function (req, res, next) {
			if (!req.user) {
				return res.status(401).end();
			}
			
			var cb = Err.handleWith(next);
			var db = dbWith(next);
			
			db.stripeCustomer.findOne({
				user: req.user._id,
			}, function (stripeCustomer) {
				if (stripeCustomer) {
					return res.send(stripeCustomer);
				}
				stripe.customers.create({
					email: req.user.email,
				}, cb(function (customer) {
					var stripeCustomer = {
						user: req.user._id,
						stripeCustomerId: customer.id,
					};
					db.stripeCustomer.insert(stripeCustomer, {}, function () {
						res.send(stripeCustomer);
					});
				}));
			});
		},
	]);

	app.post('/stripe/getCards', [
		function (req, res, next) {
			if (!req.user) {
				return res.status(401).end();
			}

			var cb = Err.handleWith(next);
			var db = dbWith(next);

			db.stripeCustomer.findOne({
				user: req.user._id,
			}, function (stripeCustomer) {
				if (!stripeCustomer) {
					return res.send([]);
				}
				stripe.customers.listCards(stripeCustomer.stripeCustomerId, cb(function (cards) {
					return res.send(cards);
				}));
			});
		},
	]);

	app.post('/stripe/addCard', [
		function (req, res, next) {
			if (!req.user) {
				return res.status(401).end();
			}
			
			var cb = Err.handleWith(next);
			var db = dbWith(next);

			db.stripeCustomer.findOne({
				user: req.user._id,
			}, function (stripeCustomer) {
				stripe.customers.createSource(stripeCustomer.stripeCustomerId, {
					source: req.body.token
				}, cb(function (card) {
					return res.send(card);
				}));
			});
		}
	]);

	app.get('/stripe/publishableKey', [
		function (req, res, next) {
			return res.send(config.stripe.publishableKey);
		}]);


	app.schema.stripePayment.insertMiddleware.use(function (stripePayment, options, next) {
		var cb = Err.handleWith(next);
		var db = dbWith(next);
		stripe.charges.create({
			amount: stripePayment.amount,
			currency: 'USD',
			source: stripePayment.stripeToken,
		}, cb(function (response) {
			return next();
		}));
	});
	
	app.schema.stripeDonation.insertMiddleware.use(function (stripeDonation, options, next) {
		var cb = Err.handleWith(next);
		var db = dbWith(next);
		stripe.charges.create({
			amount: stripeDonation.amount,
			currency: 'USD',
			source: stripeDonation.stripeToken,
		}, cb(function (response) {
			return next();
		}));
	});
};
