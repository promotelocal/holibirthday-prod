define([
	'auth',
	'bodyColumn',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'meP',
	'prettyForms',
	'profileP',
	'separatorSize',
	'siteCopyItemsP',
	'submitButton',
], function (auth, bodyColumn, confettiBackground, db, fonts, holibirthdayRow, meP, prettyForms, profileP, separatorSize, siteCopyItemsP, submitButton) {
	return promiseComponent(siteCopyItemsP.then(function (copy) {
		return meP.then(function (me) {
			return profileP.then(function (profile) {
				return auth.StripeP.then(function (Stripe) {
					var couldNotChargeCardS = Stream.once(false);
					var fillOutAllFieldsS = Stream.once(false);
					
					var stripeStreams = {
						user: Stream.once((me && me._id) || '000000000000000000000000'),
						amount: Stream.once(20),
						email: Stream.once((profile && profile.email) || ''),
						number: Stream.once(''),
						cvc: Stream.once(''),
						exp_month: Stream.once(''),
						exp_year: Stream.once(''),
					};
					var stripeS = Stream.combineObject(stripeStreams);

					var payWithStripe = function () {
						var stripeInfo = stripeS.lastValue();
						var d = Q.defer();
						Stripe.card.createToken({
							number: stripeInfo.number,
							cvc: stripeInfo.cvc,
							exp_month: stripeInfo.exp_month,
							exp_year: stripeInfo.exp_year,
						}, function (status, result) {
							if (!stripeInfo.email) {
								fillOutAllFieldsS.push(true);
								return d.resolve();
							}
							if (status !== 200) {
								couldNotChargeCardS.push(true);
								return d.resolve();
							}
							db.stripeDonation.insert({
								user: stripeInfo.user,
								email: stripeInfo.email,
								amount: Math.round(stripeInfo.amount * 100),
								stripeToken: result.id,
							}).then(function (sd) {
								window.location.hash = '#!donateSuccess/' + sd._id;
								window.location.reload();
							}, function () {
								couldNotChargeCardS.push(true);
								return d.resolve();
							});
						});
						return d.promise;
					};

					return stack({
						gutterSize: separatorSize,
					}, [
						confettiBackground(bodyColumn(holibirthdayRow(stack({
							gutterSize: separatorSize,
						}, [
							text(copy.find('Causes Title')).all([
								fonts.ralewayThinBold,
								fonts.h1,
							]),
						]), copy.find('Causes Image')))),
						alignLRM({
							middle: paragraph('<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="MXHBEA3FTW5DN"><input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"><img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1"></form>'),
						}),
					]);
				});
			});
		});
	}));
});
