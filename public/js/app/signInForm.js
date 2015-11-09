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
		var fillOutAllFieldsS = Stream.once(false);
		var fillOutAllFields = toggleHeight(fillOutAllFieldsS)(text('Please fill out all fields'));

		var emailNotConfirmedS = Stream.once(false);
		var emailNotConfirmed = toggleHeight(emailNotConfirmedS)(text('Email not confirmed (click to resend)').all([
			link,
			clickThis(function (ev, disable) {
				disable();
				auth.resendConfirmEmail({
					email: model.username.lastValue(),
				}).then(function () {
					emailNotConfirmedS.push(false);
					emailResentS.push(true);
				});
			})
		]));
		
		var emailResentS = Stream.once(false);
		var emailResent = toggleHeight(emailResentS)(text('Resent!'));
		
		var incorrectEmailOrPasswordS = Stream.once(false);
		var incorrectEmailOrPassword = toggleHeight(incorrectEmailOrPasswordS)(text('Incorrect email or password (click to reset)').all([
			link,
			clickThis(function (ev, disable) {
				disable();
				auth.resetPasswordRequest({
					email: model.username.lastValue(),
				}).then(function () {
					incorrectEmailOrPasswordS.push(false);
					resetEmailSentS.push(true);
				});
			}),
		]));

		var resetEmailSentS = Stream.once(false);
		var resetEmailSent = toggleHeight(resetEmailSentS)(text('Check your email!'));
		
		var model = {
			username: Stream.once(''),
			password: Stream.once(''),
		};
		var latestModel;
		Stream.combineObject(model).onValue(function (m) {
			latestModel = m;
			fillOutAllFieldsS.push(false);
		});

		var submit = prettyForms.submit(black, 'Submit', function (enable) {
			enable();
			if (latestModel === undefined) {
				fillOutAllFieldsS.push(true);
			}
			else {
				auth.signIn(latestModel).then(function () {
					window.location.hash = '#!';
					window.location.reload();
				}, function (err) {
					if (err.responseText.indexOf('confirm') !== -1) {
						emailNotConfirmedS.push(true);
					}
					else {
						incorrectEmailOrPasswordS.push(true);
					}
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
				fillOutAllFields,
				emailNotConfirmed,
				emailResent,
				incorrectEmailOrPassword,
				resetEmailSent,
			]),
		]);
		
		var narrowForm = stack({
			gutterSize: separatorSize,
			collapseGutters: true,
		}, [
			alignLRM({
				middle: stack({}, [loginWithFacebook()]),
			}),
			alignLRM({
				middle: or,
			}),
			alignLRM({
				middle: sideBySide({
					gutterSize: separatorSize,
				}, [
					username,
					password,
				]),
			}),
			fillOutAllFields,
			emailNotConfirmed,
			emailResent,
			incorrectEmailOrPassword,
			resetEmailSent,
			alignLRM({
				middle: submit,
			}),
		]);

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
