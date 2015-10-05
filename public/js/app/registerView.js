define([
	'auth',
	'bar',
	'bodyColumn',
	'fonts',
	'loginWithFacebook',
	'meP',
	'prettyForms',
	'separatorSize',
], function (auth, bar, bodyColumn, fonts, loginWithFacebook, meP, prettyForms, separatorSize) {
	return (function () {
		var registerFontSize = 30;
		var fillOutAllFields = Stream.once(false);
		var passwordsDoNotMatch = Stream.once(false);
		
		var model = {
			firstName: Stream.never(),
			lastName: Stream.never(),
			email: Stream.never(),
			holibirther: Stream.once(false),
			knowAHolibirther: Stream.once(false),
			password: Stream.never(),
			confirmPassword: Stream.never(),
		};
		var latestModel;
		Stream.combineObject(model).onValue(function (m) {
			latestModel = m;
			fillOutAllFields.push(false);
		});

		var registeredViewIndex = Stream.once(0);
		var submit = prettyForms.submit(black, 'Submit', function () {
			auth.grecaptchaP.then(function (grecaptcha) {
				var grecaptchaResponse = grecaptcha.getResponse();
				if (latestModel === undefined || grecaptchaResponse === '') {
					fillOutAllFields.push(true);
				}
				else if (latestModel.password !== latestModel.confirmPassword) {
					passwordsDoNotMatch.push(true);
				}
				else {
					latestModel.captchaResponse = grecaptchaResponse;
					auth.register(latestModel).then(function () {
						registeredViewIndex.push(1);
					});
				}
			});
		});
		var firstName = prettyForms.input({
			name: 'First Name',
			fieldName: 'firstName',
			stream: model.firstName,
		});
		var lastName = prettyForms.input({
			name: 'Last Name',
			fieldName: 'lastName',
			stream: model.lastName,
		});
		var email = prettyForms.input({
			name: 'Email',
			fieldName: 'email',
			stream: model.email,
		});
		var holibirther = prettyForms.checkbox({
			name: 'Am a Holibirther',
			fieldName: 'holibirther',
			stream: model.holibirther,
		});
		var knowAHolibirther = prettyForms.checkbox({
			name: 'Know a Holibirther',
			fieldName: 'knowAHolibirther',
			stream: model.knowAHolibirther,
		});
		var password = prettyForms.input({
			name: 'Password',
			fieldName: 'password',
			stream: model.password,
			type: 'password',
		});
		var confirmPassword = prettyForms.input({
			name: 'Password Again',
			fieldName: 'confirmPassword',
			stream: model.confirmPassword,
			type: 'password',
		});
		var captcha = div.all([
			$prop('id', 'grecaptcha-div'),
			function (i) {
				auth.grecaptchaP.then(function () {
					auth.grecaptchaSitekeyP.then(function (sitekey) {
						grecaptcha.render('grecaptcha-div', {
							sitekey: sitekey,
						});
						var interval = setInterval(function () {
							i.updateDimensions(true);
						}, 100);
						i.minHeight.onValue(function () {
							clearInterval(interval);
						});
					});
				});
			},
		]);

		var or = text('or').all([
			fonts.ralewayThinBold,
		]);

		return bodyColumn(padding({
			top: separatorSize * 4,
		}, sideBySide({
			handleSurplusWidth: giveToFirst,
			gutterSize: separatorSize * 4,
		}, [
			stack({
				gutterSize: separatorSize,
			}, [
				paragraph('Sign in to share a Holibirthday story').all([
					fonts.ralewayThinBold,
					$css('font-size', registerFontSize),
				]),
				paragraph('That Fourth of July birthday cookout where your friends caught the house on fire.').all([
					fonts.ralewayThinBold,
					$css('font-size', registerFontSize),
				]),
				paragraph('Your grandfather being born on April Fools day and nothing he said could be taken seriously.').all([
					fonts.ralewayThinBold,
					$css('font-size', registerFontSize),
				]),
			]),
			form.all([
				child(stack({
					gutterSize: separatorSize,
				}, [
					loginWithFacebook,
					alignLRM({
						middle: or,
					}),
					toggleComponent([
						stack({
							gutterSize: separatorSize,
						}, [
							firstName,
							lastName,
							email,
							holibirther,
							knowAHolibirther,
							password,
							confirmPassword,
							captcha,
							stack({}, [
								toggleHeight(fillOutAllFields)(stack({}, [
									paragraph('Please fill out all fields'),
									bar.horizontal(separatorSize),
								])),
								toggleHeight(passwordsDoNotMatch)(stack({}, [
									paragraph('Passwords must match'),
									bar.horizontal(separatorSize),
								])),
								submit,
							]),
						]),
						paragraph('Success!  You can now sign in.').all([
							fonts.ralewayThinBold,
						]),
					], registeredViewIndex).all([
						withMinWidth(300, true),
					]),
				])),
				wireChildren(function (instance, context, i) {
					i.minHeight.pushAll(instance.minHeight);
					i.minWidth.pushAll(instance.minWidth);
					return [{
						width: context.width,
						height: context.height,
					}];
				}),
			]),
		]))).all([
			function () {
				meP.then(function (me) {
					if (me) {
						location.hash = '#!';
						location.reload();
					}
				});
			},				
		]);
	})();
});
