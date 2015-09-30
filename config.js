module.exports = {
	forceHttps: true,
	domain: 'https://www.holibirthday.com/',
	port: process.env.PORT,
	db: {
		// staging
		// host: "holibirthday:ka,.hpsarocehksrao.pcgdyfsi@ds047692.mongolab.com:47692/holibirthday",
		
		// prod
		host: "holibirthday:asokha,38g451234865f[,.@ds041613.mongolab.com:41613/holibirthday",
		
		name: "holibirthday",
	},
	maxSessionAgeSeconds: 3600, // 1 hour
	grecaptcha: {
		secret: '6Lf1ogkTAAAAAMfU6pXYGeOApwT2g7jHvS80DkM9',
		sitekey: '6Lf1ogkTAAAAABlzCh_MhCA8hlmkc5zmockoeQsc',
	},
	sendgrid: {
		username: 'jcapiuser',
		password: 'asoneuhras,.ckhasro.chuis1234aroecihrsaocegdi',
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
	adminEmail: 'holibirthday@gmail.com',
};
