define([
	'auth',
	'bodyColumn',
	'colors',
	'fonts',
	'loginWithFacebook',
	'prettyForms',
	'separatorSize',
	'signInStream',
	'siteCopyItemsP',
], function (auth, bodyColumn, colors, fonts, loginWithFacebook, prettyForms, separatorSize, signInStream, siteCopyItemsP) {
	return function () {
		return promiseComponent(siteCopyItemsP.then(function (copy) {
			var fillOutAllFieldsS = Stream.once(false);
			var fillOutAllFields = toggleHeight(fillOutAllFieldsS)(text(copy.find('Sign In Fill Out All Fields')));

			var emailNotConfirmedS = Stream.once(false);
			var emailNotConfirmed = toggleHeight(emailNotConfirmedS)(text(copy.find('Side Header Email Not Confirmed')).all([
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
			var emailResent = toggleHeight(emailResentS)(text(copy.find('Sign In Email Confirmation Resent')));

			var noSuchEmailS = Stream.once(false);
			var noSuchEmail = toggleHeight(noSuchEmailS)(linkTo('#!register', text(copy.find('Sign In Resend Email Confirmation - No Such Email'))).all([
				clickThis(function () {
					signInStream.push(false);
				}),
			]));
			
			var incorrectEmailOrPasswordS = Stream.once(false);
			var incorrectEmailOrPassword = toggleHeight(incorrectEmailOrPasswordS)(text(copy.find('Sign In Wrong Email / Password')).all([
				link,
				clickThis(function (ev, disable) {
					disable();
					auth.resetPasswordRequest({
						email: model.username.lastValue(),
					}).then(function () {
						incorrectEmailOrPasswordS.push(false);
						resetEmailSentS.push(true);
					}, function () {
						incorrectEmailOrPasswordS.push(false);
						noSuchEmailS.push(true);
					});
				}),
			]));

			var resetEmailSentS = Stream.once(false);
			var resetEmailSent = toggleHeight(resetEmailSentS)(text(copy.find('Sign In Reset Email Sent')));
			
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
			var or = text(copy.find('Sign In Or')).all([
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
				form.all([
					child(stack({}, [
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
						noSuchEmail,
						incorrectEmailOrPassword,
						resetEmailSent,
					])),
					wireChildren(passThroughToFirst),
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
				form.all([
					child(stack({
						gutterSize: separatorSize,
						collapseGutters: true,
					}, [
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
						noSuchEmail,
						incorrectEmailOrPassword,
						resetEmailSent,
						alignLRM({
							middle: submit,
						}),
					])),
					wireChildren(passThroughToFirst),
				]),
			]);

			var widthS = Stream.never();
			
			return border(colors.middleGray, {
				bottom: 1,
			}, bodyColumn(padding({
				top: separatorSize,
				bottom: separatorSize,
			}, componentStream(widthS.map(function (width) {
				return width > 700 ? wideForm : narrowForm;
			})).all([
				function (instance, context) {
					context.width.pushAll(widthS);
				},
			]))).all([
				withBackgroundColor(colors.pageBackgroundColor),
			]));
		}));
	};
});
