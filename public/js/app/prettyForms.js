define([
	'fonts',
	'forms',
	'separatorSize',
	'submitButton',
], function (fonts, forms, separatorSize, submitButton) {
	return {
		input: function (config) {
			return stack({}, [
				text(config.name).all([
					fonts.ralewayThinBold,
				]).all(config.labelAll || []),
				forms.inputBox(config.stream, config.type, config.fieldName),
			]);
		},
		select: function (config) {
			return stack({}, [
				text(config.name).all([
					fonts.ralewayThinBold,
				]).all(config.labelAll || []),
				forms.selectBox(config),
			]);
		},
		textarea: function (config) {
			return stack({}, [
				text(config.name).all([
					fonts.ralewayThinBold,
				]).all(config.labelAll || []),
				forms.textareaBox(config.stream, config.fieldName).all([
					$addClass('pre'),
 				]),
			]);
		},
		plainTextarea: function (config) {
			return stack({}, [
				text(config.name).all([
					fonts.ralewayThinBold,
				]).all(config.labelAll || []),
				forms.plainTextareaBox(config.stream, config.fieldName).all([
					$addClass('pre'),
 				]),
			]);
		},
		fileUpload: function (config, cb) {
			config.accept = config.accept || '*';
			return stack({}, [
				text(config.name).all([
					fonts.ralewayThinBold,
				]).all(config.labelAll || []),
				input.all([
					$prop('type', 'file'),
					$prop('accept', config.accept),
					changeThis(function (ev) {
						cb(ev.target.files[0]);
					}),
				]),
			]);
		},
		imageUpload: function (config) {
			
		},
		checkbox: function (config) {
			var currentValue = false;
			config.stream.onValue(function (value) {
				currentValue = value;
			});
			return sideBySide({
				gutterSize: separatorSize,
			}, [
				forms.inputBox(config.stream, 'checkbox', config.fieldName).all([
					function (instance, context) {
						config.stream.onValue(function (value) {
							instance.$el.prop('checked', value);
						});
					},
				]),
				padding({
					top: 1,
				}, text(config.name).all([
					fonts.ralewayThinBold,
				])).all([
					clickThis(function () {
						config.stream.push(!currentValue);
					}),
				]),
			]);
		},
		radios: function (config) {
			return stack({}, config.options.map(function (option) {
				return sideBySide({
					gutterSize: separatorSize,
				}, [
					forms.inputBox(config.stream, 'radio', config.fieldName).all([
						$prop('value', option.value),
						function (instance, context) {
							config.stream.onValue(function (value) {
								if (value === option.value) {
									instance.$el.click();
								}
							});
						},
					]),
					padding({
						top: 1,
					}, text(option.name).all([
						fonts.ralewayThinBold,
					])),
				]);
			}));
		},
		submit: function (label, cb) {
			var inputD = Q.defer();
			var inputP = inputD.promise;
			return stack({}, [
				input.all([
					$prop('type', 'submit'),
					submitThis(function () {
						cb();
						return false;
					}),
					withMinHeight(0, true),
					$css('display', 'none'),
					function (i) {
						inputD.resolve(i);
					},
				]),
				submitButton(text(label).all([
					fonts.bebasNeue,
				])).all([
					link,
					clickThis(function () {
						inputP.then(function (input) {
							cb();
						});
					}),
				]),
			]);
		},
	};
});
