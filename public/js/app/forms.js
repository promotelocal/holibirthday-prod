define([], function () {
	return {
		inputBox: function (stream, type, name, all) {
			type = type || 'text';
			return border(color({
				r: 169,
				b: 169,
				g: 169,
			}), {
				all: type === 'text' ||
					type === 'password' ||
					type === 'number' ? 1 : 0,
			}, input.all((all || []).concat([
				$prop('name', name),
				$prop('type', type),
				withBackgroundColor(white),
				withFontColor(black),
				keyupThis(function (val) {
					if (type === 'text') {
						stream.push($(val.target).val());
					}
				}),
				changeThis(function (val) {
					stream.push($(val.target).val());
				}),
				function (instance) {
					var $el = instance.$el;
					stream.onValue(function (v) {
						$el.val(v);
					});
				},
			])));
		},
		plainTextareaBox: function (stream, name) {
			return textarea.all([
				$prop('id', name),
				$prop('name', name),
				$prop('rows', 10),
				keyupThis(function (val) {
					stream.push($(val.target).val());
				}),
				changeThis(function (val) {
					stream.push($(val.target).val());
				}),
				function (instance) {
					stream.onValue(function (v) {
						instance.$el.val(v);
					});
				},
				withBackgroundColor(white),
			]);
		},
		textareaBox: function (stream, name) {
			return div.all([
				child(textarea.all([
					$prop('id', name),
					$prop('name', name),
					$prop('rows', 20),
					keyupThis(function (val) {
						stream.push($(val.target).val());
					}),
					changeThis(function (val) {
						stream.push($(val.target).val());
					}),
					function (instance, context) {
						var gone = false;
						var editorP = stream.promise.then(function (text) {
							instance.$el.val(text);
							CKEDITOR.config.resize_enabled = false;
							var editor = CKEDITOR.replace(instance.$el[0]);
							editor.on('instanceReady', function () {
								editor.on('change', function () {
									stream.push(editor.getData());
								});
								Stream.combine([
									context.width,
									context.height,
								], function (w, h) {
									if (!gone) {
										editor.resize(px(w), px(h));
									}
								});
							});
							return editor;
						});
						return function () {
							gone = true;
							editorP.then(function (editor) {
								if (!gone) {
									try {
										editor.destroy();
									}
									catch (e) {
										console.log('ckeditor exception happened');
									}
								}
							});
						};
					},
				])),
				wireChildren(function (instance, context, i) {
					i.minHeight.pushAll(instance.minHeight);
					i.minWidth.pushAll(instance.minWidth);
					return [context];
				}),
			]);
		},
		selectBox: function (config) {
			return border(color({
				r: 169,
				b: 169,
				g: 169,
			}), {
				all: 1,
			}, select.all([
				children(config.options.map(function (o) {
					return option.all([
						$html(o.name),
						$prop('value', o.value),
						$css('visibility', ''),
					]);
				})),
				$prop('name', config.name),
				withBackgroundColor(white),
				withFontColor(black),
				changeThis(function (val) {
					config.stream.push($(val.target).val());
				}),
				function (instance) {
					var $el = instance.$el;
					config.stream.onValue(function (v) {
						setTimeout(function () {
							$el.val(v);
						});
					});
				},
			]));
		},
	};
});	
