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
	var nameS = Stream.once('');
	var emailS = Stream.once('');
	var messageS = Stream.once('');
	var state = Stream.once('');
	
	return stack({
		gutterSize: separatorSize,
	}, [
		confettiBackground(bodyColumn(holibirthdayRow(text('Contact Us').all([
			fonts.h1,
		])))),
		bodyColumn(prettyForms.input({
			name: 'Name',
			stream: nameS,
		})),
		bodyColumn(prettyForms.input({
			name: 'Email',
			stream: emailS,
		})),
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
						name: nameS.lastValue(),
						email: emailS.lastValue(),
						message: messageS.lastValue(),
					}).then(function () {
						state.push('sent');
					}).always(enable);
				})
			]),
		})),
	]);
});
