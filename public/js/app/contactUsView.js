define([
	'bodyColumn',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'meP',
	'prettyForms',
	'separatorSize',
	'submitButton',
], function (bodyColumn, confettiBackground, db, fonts, holibirthdayRow, meP, prettyForms, separatorSize, submitButton) {
	var messageS = Stream.once('');
	var state = Stream.once('');
	
	return promiseComponent(meP.then(function (me) {
		return me ? stack({
			gutterSize: separatorSize,
		}, [
			confettiBackground(bodyColumn(holibirthdayRow(text('Contact Us').all([
				fonts.h1,
			])))),
			bodyColumn(prettyForms.textarea({
				name: 'Message',
				stream: messageS,
			})),
			bodyColumn(componentStream(state.map(text))),
			bodyColumn(alignLRM({
				left: submitButton(black, text('Submit')).all([
					link,
					clickThis(function (ev, disable) {
						var enable = disable();
						state.push('sending');
						db.contactUsMessage.insert({
							message: messageS.lastValue(),
						}).then(function () {
							state.push('sent');
						}).always(enable);
					})
				]),
			})),
		]) : bodyColumn(text('You must sign in to use this feature').all([
			fonts.ralewayThinBold,
			fonts.h1,
		]));
	}));
});
