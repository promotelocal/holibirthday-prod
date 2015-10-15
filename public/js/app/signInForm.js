define([
	'auth',
	'bodyColumn',
	'colors',
	'fonts',
	'loginWithFacebook',
	'prettyForms',
	'separatorSize',
], function (auth, bodyColumn, colors, fonts, loginWithFacebook, prettyForms, separatorSize) {
	return function () {
		var fillOutAllFields = Stream.once(false);
		var incorrectEmailOrPassword = Stream.once(false);
		
		var model = {
			username: Stream.once(''),
			password: Stream.once(''),
		};
		var latestModel;
		Stream.combineObject(model).onValue(function (m) {
			latestModel = m;
			fillOutAllFields.push(false);
		});

		var submit = prettyForms.submit(black, 'Submit', function () {
			if (latestModel === undefined) {
				fillOutAllFields.push(true);
			}
			else {
				auth.signIn(latestModel).then(function () {
					window.location.hash = '#!';
					window.location.reload();
				}, function () {
					incorrectEmailOrPassword.push(true);
				});
			}
		});
		var username = prettyForms.input({
			name: 'email',
			fieldName: 'username',
			stream: model.username,
		});
		var password = prettyForms.input({
			name: 'password',
			fieldName: 'password',
			stream: model.password,
			type: 'password',
		});
		var or = text('or').all([
			fonts.ralewayThinBold,
		]);

		var wideForm = sideBySide({
			handleSurplusWidth: giveToSecond,
		}, [
			alignTBM({
				middle: stack({}, [loginWithFacebook()]),
			}),
			alignLRM({
				middle: alignTBM({
					middle: or,
				}),
			}),
			stack({}, [
				sideBySide({
					gutterSize: separatorSize,
				}, [
					username,
					password,
					submit,
				]),
				toggleHeight(fillOutAllFields)(text('Please fill out all fields')),
				toggleHeight(incorrectEmailOrPassword)(text('Incorrect email or password')),
			]),
		]);
		
		var narrowForm = stack({}, [
			alignLRM({
				middle: stack({}, [loginWithFacebook()]),
			}),
			padding({
				top: 10,
				bottom: 10,
			}, alignLRM({
				middle: or,
			})),
			alignLRM({
				middle: sideBySide({
					gutterSize: separatorSize,
				}, [
					username,
					password,
				]),
			}),
			toggleHeight(fillOutAllFields)(text('Please fill out all fields')),
			toggleHeight(incorrectEmailOrPassword)(text('Incorrect email or password')),
			alignLRM({
				middle: submit,
			}),
		].map(function (c) {
			return padding({
				top: 10,
			}, c);
		}));

		var widthS = Stream.never();
		
		return border(colors.middleGray, {
			bottom: 1,
		}, bodyColumn(padding({
				top: separatorSize,
				bottom: separatorSize,
		}, form.all([
			child(componentStream(widthS.map(function (width) {
				return width > 700 ? wideForm : narrowForm;
			}))),
			function (instance, context) {
				context.width.pushAll(widthS);
			},
			wireChildren(passThroughToFirst),
		]))).all([
			withBackgroundColor(colors.pageBackgroundColor),
		]));
	};
});
