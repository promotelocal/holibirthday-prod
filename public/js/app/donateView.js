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
						bodyColumn(stack({
							gutterSize: separatorSize,
							collapseGutters: true,
						}, [
							prettyForms.input({
								name: 'Donation Amount $',
								fieldName: 'email',
								type: 'text',
								stream: stripeStreams.amount,
							}),
							prettyForms.input({
								name: 'Email',
								fieldName: 'email',
								type: 'text',
								stream: stripeStreams.email,
							}),
							prettyForms.input({
								name: 'Card Number',
								type: 'text',
								stream: stripeStreams.number,
							}),
							sideBySide({
								handleSurplusWidth: evenSplitSurplusWidth,
								gutterSize: separatorSize,
							}, [
								prettyForms.input({
									name: 'CVC',
									type: 'text',
									stream: stripeStreams.cvc,
								}),
								prettyForms.input({
									name: 'Exp Month',
									type: 'text',
									stream: stripeStreams.exp_month,
								}),
								prettyForms.input({
									name: 'Exp Year',
									type: 'text',
									stream: stripeStreams.exp_year,
								}),
							]),
							componentStream(fillOutAllFieldsS.map(function (fillEm) {
								return fillEm ? alignLRM({
									right: text('Please fill out all fields')
								}) : nothing;
							})),
							componentStream(couldNotChargeCardS.map(function (fillEm) {
								return fillEm ? alignLRM({
									right: text('Could not charge card')
								}) : nothing;
							})),
							alignLRM({
								right: submitButton(black, text('Donate Now')).all([
									link,
									clickThis(function (ev, disable) {
										fillOutAllFieldsS.push(false);
										couldNotChargeCardS.push(false);
										var enable = disable();
										payWithStripe().then(function () {
											enable();
										});
									}),
								]),
							}),
						])),
					]);
				});
			});
		});
	}));
});
