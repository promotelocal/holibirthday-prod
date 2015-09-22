var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var expressSession = require('express-session');

var config = require('./config');
try {
	var configLocal = require('./configLocal');
	for (var k in configLocal) {
		config[k] = configLocal[k];
	}
}
catch (e) {
	// not a problem, just log it
	console.log("No configLocal loaded");
}

var schema = require('./public/schema');

var setupApi = require('./lib/setupApi');
var setupAuth = require('./lib/setupAuth');
var setupDb = require('./lib/setupDb');
var setupEmails = require('./lib/setupEmails');
var setupGrecaptcha = require('./lib/setupGrecaptcha');
var setupMisc = require('./lib/setupMisc');
var setupRoutes = require('./lib/setupRoutes');
var setupStripe = require('./lib/setupStripe');

// set up middleware
var app = express();
app.schema = schema;

app.use(cookieParser('aoesutnfaoseckr,.ryf\'yl982faoseckxhq;jzzvuiwh'));
app.use(expressSession({
	secret: 'aoesutnfaoseckr,.ryf\'yl982faoseckxhq;jzzvuiwh',
	cookie: { maxAge: config.maxSessionAgeSeconds * 1000 },
	saveUninitialized: false,
	resave: false,
}));

app.use(function (req, res, next) {
	// heroku originating header || local development req.protocol
	// https://devcenter.heroku.com/articles/http-routing
	var incomingProtocol = req.get('X-Forwarded-Proto') || req.protocol;
	if (incomingProtocol !== 'https' && config.forceHttps) {
		return res.redirect('https://' + req.headers.host + req.path);
	}
	return next();
});

app.use(bodyParser.json());
app.use(require('prerender-node').set('prerenderServiceUrl', 'https://young-temple-4312.herokuapp.com/'));

setupDb(config, schema, function (dbWith) {
	setupAuth(app, config, dbWith);

	setupApi(app, config, dbWith);
	setupEmails(app, config, dbWith);
	setupGrecaptcha(app, config, dbWith);
	setupMisc(app, config, dbWith);
	setupRoutes(app, config, dbWith);
	setupStripe(app, config, dbWith);
	app.use(express.static('public'));

	try {
		var server = app.listen(config.port, function () {
			console.log('up');
		});
	}
	catch (e) {
		debugger;
	}
});

