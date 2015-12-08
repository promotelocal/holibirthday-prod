module.exports = {
	forceHttps: true,
	domain: 'https://www.holibirthday.com',
	port: process.env.OPENSHIFT_NODEJS_PORT,
	ip: process.env.OPENSHIFT_NODEJS_IP,
	db: {
		// staging
		// host: "holibirthday:ka%2C.hpsarocehksrao.pcgdyfsi@ds047692.mongolab.com:47692/holibirthday",
		
		// prod
		host: "holibirthday:asokha%2C38g451234865f[%2C.@ds041613.mongolab.com:41613/holibirthday",
		
		name: "holibirthday",

		// rhos
		// host: "admin:6PlTxDxirvHk@" + process.env.OPENSHIFT_MONGODB_DB_HOST + ":" + OPENSHIFT_MONGODB_DB_PORT,
		// name: "nodejs",
	},
	grecaptcha: {
		secret: '6Lf1ogkTAAAAAMfU6pXYGeOApwT2g7jHvS80DkM9',
		sitekey: '6Lf1ogkTAAAAABlzCh_MhCA8hlmkc5zmockoeQsc',
	},
	sendgrid: {
		username: 'holibirthdayapiuser',
		password: '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',
	},
	stripe: {
		secretKey: 'sk_test_QyCMcBkLGoiw5a1TbwX0invx',
		publishableKey: 'pk_test_Zek4XNCEU1aHkQZZntOJjJ1H',
		// secretKey: 'sk_live_IPUyq8mHer6pyMTbM8FkxfC9',
		// publishableKey: 'pk_live_pWU6oklzX0hr96vfHm9bCeAB',
	},
	buffer: {
		clientId: '54f589d3d8c8289438b23a39',
		accessToken: '1/93c0f4cf53fab76bbc7e6b5ef5417817',
	},
	mailchimp: {
		key: '9cd741c3a6b8e0bb62a9397f16eb28b8-us12',
	},
	adminEmail: 'holibirthday@gmail.com',
};
