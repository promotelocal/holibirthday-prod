define([
	'ckeditorP',
], function (ckeditorP) {
	return {
		inputBox: function (stream, type, name, all, noBorder) {
			type = type || 'text';
			return border(color({
				r: 169,
				b: 169,
				g: 169,
			}), {
				all: (!noBorder && (type === 'text' ||
									type === 'password' ||
									type === 'date' ||
									type === 'number')) ? 1 : 0,
			}, input.all((all || []).concat([
				$prop('name', name),
				$prop('type', (type === 'date') ? 'text' : type),
				withBackgroundColor(white),
				withFontColor(black),
				keyupThis(function (val) {
					if (type === 'text' ||
						type === 'password') {
						stream.push($(val.target).val());
					}
				}),
				changeThis(function (val) {
					var $target = $(val.target);
					var v = $target.val();
					if (type === 'date') {
						stream.push(moment(v).toDate());
					}
					else if (type === 'checkbox') {
						stream.push($target.prop('checked'));
					}
					else {
						stream.push(v);
					}
				}),
				function (instance) {
					var $el = instance.$el;
					if (type === 'date') {
						$el.datepicker({
							dateFormat: 'mm/dd/yy',
						});
					}
					stream.onValue(function (v) {
						var newVal;
						if (type === 'date') {
							if (v) {
								newVal = moment(v).utc().format('MM/DD/YYYY');
								$el.datepicker("setDate", newVal);
							}
						}
						else if (type === 'checkbox') {
							setTimeout(function () {
								$el.prop('checked', v);
							});
							newVal = v;
						}
						else {
							newVal = v;
						}
						
						if ($el.val() !== newVal) {
							$el.val(newVal);
						}
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
			var editorHeight = 400;
			return div.all([
				child(textarea.all([
					$prop('name', name),
					$prop('rows', 21),
					keyupThis(function (val) {
						stream.push($(val.target).val());
					}),
					changeThis(function (val) {
						stream.push($(val.target).val());
					}),
					function (instance, context) {
						var id = name + (Math.random() + '').substring(2);
						instance.$el.prop('id', id);
						setTimeout(function () {
							var setDimensions = function (editor) {
								instance.minHeight.push(parseInt($(editor.editorContainer).css('height')));
							};
							var editorP = stream.promise.then(function (text) {
								instance.$el.val(text);
								window.tinymce.init({
									selector: '#' + id,
									plugins: [
										'autoresize',
										'colorpicker',
										'image',
										'link',
										'textcolor',
									],
									menubar: false,
									toolbar: 'styleselect | undo redo | bold italic underline_that_works | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons',
									resize: false,
									autoresize_min_height: editorHeight,
									autoresize_max_height: editorHeight,
									init_instance_callback: function (editor) {
										setTimeout(function () {
											context.width.map(function () {
												setDimensions(editor);
											});
										});
										editor.on('change', function () {
											stream.push(editor.getContent());
										});
									},
									setup: function(editor) {
										editor.addButton('underline_that_works', {
											title : 'Underline',
											icon: 'underline',
											onclick: function (editor) {
												window.tinymce.execCommand('mceToggleFormat', false, 'underline_that_works');
											},
										});
									},
									style_formats: [
										{title: 'Header 1', format: 'h1'},
										{title: 'Header 2', format: 'h2'},
										{title: 'Header 3', format: 'h3'},
										{title: 'Header 4', format: 'h4'},
										{title: 'Header 5', format: 'h5'},
										{title: 'Header 6', format: 'h6'},
										{title: 'Underline', format: 'underline_that_works'},
									],
									formats: {
										underline_that_works: {
											inline: 'u',
											remove: 'all',
										},
									},
								});
							});
						}, 2000);
						return function () {
							console.log('removing');
							window.tinymce.execCommand('mceRemoveControl', true, id);
						};
					},
				])),
				wireChildren(function (instance, context, i) {
					i.minHeight.pushAll(instance.minHeight);
					i.minWidth.pushAll(instance.minWidth);
					return [{
						width: context.width,
						height: context.height,
					}];
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
					if (!o.name || !o.value) {
						o = {
							name: o,
							value: o,
						};
					}
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
