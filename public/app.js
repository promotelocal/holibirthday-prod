define('myHolibirthdayView', [
	'bar',
	'bodyColumn',
	'chooseNonHoliday',
	'colors',
	'confettiBackground',
	'db',
	'famousBirthdaysDisplay',
	'fonts',
	'holibirthdayRow',
	'meP',
	'months',
	'prettyForms',
	'profileP',
	'separatorSize',
	'signInForm',
	'signInStream',
	'submitButton',
	'writeOnImage',
], function (bar, bodyColumn, chooseNonHoliday, colors, confettiBackground, db, famousBirthdaysDisplay, fonts, holibirthdayRow, meP, months, prettyForms, profileP, separatorSize, signInForm, signInStream, submitButton, writeOnImage) {
	var slotMachine = function (config) {
		// config.options: array of options
		// config.stream: stream of results to show
		return div.all([
			children(config.options.map(function (option) {
				return padding({
					top: 30,
					bottom: 30,
					left: 20,
					right: 20,
				}, alignLRM({
					middle: text(option + '').all([
						fonts.bebasNeue,
						$css('font-size', 40),
					]),
				})).all([
					withBackgroundColor(white),
					function (instance) {
						instance.$el.css('position', 'relative');
						instance.$el.css('visibility', '');
					},
				]);
			})),
			wireChildren(function (instance, context, is) {
				context.height.promise.then(function () {
					var machine = instance.$el.slotMachine();

					var maxVariability = 100;
					var shuffleTime = 2000;

					var startDelay = Math.random();

					var stopDelay = shuffleTime + Math.random() * maxVariability;

					config.stream.onValue(function (obj) {
						machine.setRandomize(function () {
							return obj.index;
						});
						setTimeout(function () {
							machine.shuffle();
						}, startDelay);
						setTimeout(function () {
							machine.stop();
						}, stopDelay);
					});
				});

				var chooseLargest = function (streams) {
					return Stream.combine(streams, function () {
						var args = Array.prototype.slice.call(arguments);
						return args.reduce(function (a, v) {
							return Math.max(a, v);
						}, 0);
					});
				};
				
				chooseLargest(is.map(function (i) {
					return i.minHeight;
				})).pushAll(instance.minHeight);
				chooseLargest(is.map(function (i) {
					return i.minWidth;
				})).pushAll(instance.minWidth);
				return [
					is.map(function () {
						return {
							width: context.width,
							height: context.height,
						};
					}),
				];
			}),
		]);
	};
	
	var birthdayMachine = function (dateStream) {
		var dateStreamDates = dateStream.filter(function (d, cb) {
			if (d) {
				cb(d);
			}
		});
		var grabbed = false;
		var grabMousePos;

		var grabberHeight = 150;
		var grabber = overlays([
			alignLRM({
				middle: nothing.all([
					withMinWidth(2, true),
					withMinHeight(grabberHeight, true),
					withBackgroundColor(black),
				]),
			}),
			alignTBM({
				top: border(black, {
					all: 2,
				}, padding(5, text('Pull').all([
					fonts.bebasNeue,
					$css('font-size', 20),
				]))).all([
					$css('cursor', 'move'),
					withBackgroundColor(colors.holibirthdayRed),
					withFontColor(white),
					mousedownThis(function (ev) {
						grabbed = true;
						grabMousePos = ev.clientY;
						return false;
					}),
					function (instance) {
						$('body').on('mouseup', function () {
							if (grabbed) {
								grabbed = false;
								instance.$el.animate({'margin-top': 0});
							}
						});
						$('body').on('mousemove', function (ev) {
							if (grabbed) {
								var pullDistance = Math.max(0, ev.clientY - grabMousePos);
								var maxPullDistance = grabberHeight - parseInt(instance.$el.css('height'));
								instance.$el.css('margin-top', pullDistance);
								if (pullDistance > maxPullDistance) {
									instance.$el.css('margin-top', maxPullDistance);
									instance.$el.animate({'margin-top': 0});
									grabbed = false;
									dateStream.push(chooseNonHoliday());
								}
							}
						});
					},
				]),
			}),
		]);

		return stack({
			gutterSize: separatorSize,
		}, [
			sideBySide({
				gutterSize: separatorSize,
			}, [
				alignTBM({
					middle: border(black, {
						all: 1,
					}, sideBySide({}, [
						slotMachine({
							options: [
								'Jan',
								'Feb',
								'Mar',
								'Apr',
								'May',
								'Jun',
								'Jul',
								'Aug',
								'Sep',
								'Oct',
								'Nov',
								'Dec'
							],
							stream: dateStreamDates.map(function (date) {
								return {
									index: date && date.getUTCMonth(),
								};
							}),
						}),
						slotMachine({
							options: [
								0, 1, 2, 3,
							],
							stream: dateStreamDates.map(function (date) {
								return {
									index: date && Math.floor(date.getUTCDate() / 10),
								};
							}),
						}),
						slotMachine({
							options: [
								0, 1, 2, 3, 4, 5, 6, 7, 8, 9
							],
							stream: dateStreamDates.map(function (date) {
								return {
									index: date && date.getUTCDate() % 10,
								};
							}),
						}),
					])),
				}),
				grabber,
			]).all([
				$css('user-select', 'none'),
			]),
		]);
	};

	return promiseComponent(db.famousBirthday.find({}).then(function (famousBirthdays) {
		var famousBirthdaysForDate = function (date) {
			if (!date) {
				return [];
			}
			return famousBirthdays.filter(function (fb) {
				return fb.birthday.getUTCMonth() === date.getUTCMonth() &&
					fb.birthday.getUTCDate() === date.getUTCDate();
			});
		};
		
		return meP.then(function (me) {
			if (me) {
				return profileP.then(function (profile) {
					var holibirthday = {
						user: Stream.once(me._id),
						date: Stream.once(null),
					};

					var lastHolibirthday;
					Stream.combineObject(holibirthday).onValue(function (v) {
						lastHolibirthday = v;
					});
					var playTheMachine = Stream.once(false);
					holibirthday.date.map(function () {
						return false;
					}).pushAll(playTheMachine);
					
					var machine = function (oldHolibirthday, update) {
						return stack({
							gutterSize: separatorSize,
						}, [
							alignLRM({
								middle: birthdayMachine(holibirthday.date),
							}),
							alignLRM({
								middle: toggleHeight(playTheMachine)(stack({}, [
									text('You must pull the lever first').all([
										fonts.ralewayThinBold,
										$css('font-size', 30),
									]),
								])),
							}),
							alignLRM({
								middle: submitButton(black, text(profile.holibirther && update ? 'Change Holibirthday' : 'Claim Birthday').all([
									fonts.bebasNeue,
								])).all([
									link,
									clickThis(function () {
										if (lastHolibirthday) {
											var canvas = document.createElement('canvas');
											var $canvas = $(canvas);
											$canvas.appendTo($('body'))
												.prop('width', 1080)
												.prop('height', 702);

											var ctx = canvas.getContext('2d');

											var drawCenteredText = function (p, text, font) {
												ctx.font = font;
												var width = ctx.measureText(text).width;
												ctx.fillText(text, p.x - width / 2, p.y);
											};
											
											var img = new Image();
											img.onload = function() {
												ctx.drawImage(img, 0, 0);
												drawCenteredText({
													x: 540,
													y: 310,
												}, profile.firstName + ' ' + profile.lastName, 'bold 50px Raleway Thin');
												drawCenteredText({
													x: 540,
													y: 540,
												}, moment(lastHolibirthday.date).utc().format('MMMM Do'), 'bold 50px Raleway Thin');
												if (profile.birthday) {
													drawCenteredText({
														x: 160,
														y: 595,
													}, 'Old Birthday', '20px BebasNeue');
													drawCenteredText({
														x: 160,
														y: 615,
													}, moment(profile.birthday).utc().format('MMMM Do'), '20px BebasNeue');
												}
												setTimeout(function () {
													var blob = window.dataURLtoBlob(canvas.toDataURL());
													db.uploadFile(blob, 'certificate.png').then(function (filename) {
														lastHolibirthday.imageUrl = '/api/uploadFile/find/' + filename;
														db.profile.update({
															user: me._id,
														}, {
															holibirther: true,
														}).then(function () {
															if (update) {
																db.holibirthday.update({
																	user: me._id,
																}, lastHolibirthday).then(function () {
																	window.location.hash = '#!user/' + me._id + '/certificate';
																	window.location.reload();
																});
															}
															else {
																db.holibirthday.insert(lastHolibirthday).then(function () {
																	window.location.hash = '#!user/' + me._id + '/certificate';
																	window.location.reload();
																});
															}
														});
													});
													$canvas.remove();
												});
											};
											img.src = './content/certificate-01.png';
										}
										else {
											playTheMachine.push(true);
										}
									}),
								]),
							}),
						]);
					};
					return db.holibirthday.findOne({
						user: me._id,
					}).then(function (oldHolibirthday) {
						if (profile.holibirther && oldHolibirthday) {
							var oldHolibirthdate = oldHolibirthday.date;
							holibirthday.date.push(oldHolibirthdate);
							return stack({
								gutterSize: separatorSize,
							}, [
								linkTo('#!user/' + me._id + '/certificate', confettiBackground(bodyColumn(holibirthdayRow(stack({
									gutterSize: separatorSize,
								}, [
									text('Your Holibirthday Is').all([
										fonts.ralewayThinBold,
										$css('font-size', 40),
									]),
									text(moment(oldHolibirthdate).utc().format('MMMM Do')).all([
										fonts.ralewayThinBold,
										$css('font-size', 20),
									]),
								]))))),
								bodyColumn(alignLRM({
									middle: machine(holibirthday, true),
								})),
								componentStream(holibirthday.date.delay(2500).map(function (date) {
									return famousBirthdaysDisplay(famousBirthdaysForDate(date));
								})),
							]);
						}
						else {
							return stack({
								gutterSize: separatorSize,
							}, [
								confettiBackground(bodyColumn(holibirthdayRow(text('Claim Your Holibirthday').all([
									fonts.ralewayThinBold,
									$css('font-size', 40),
								])))),
								bodyColumn(alignLRM({
									middle: machine(holibirthday),
								})),
								componentStream(holibirthday.date.delay(2500).map(function (date) {
									return famousBirthdaysDisplay(famousBirthdaysForDate(date));
								})),
							]);
						}
					});
				});
			}
			return stack({
				gutterSize: separatorSize,
			}, [
				confettiBackground(bodyColumn(holibirthdayRow(text('Claim Your Holibirthday').all([
					fonts.ralewayThinBold,
					$css('font-size', 40),
				])))),
				bodyColumn(paragraph('You must sign in to claim a holibirthday').all([
					fonts.h1,
					link,
					clickThis(function (ev) {
						signInStream.push(true);
						ev.stopPropagation();
					}),
				])),
			]);
		});
	}));
});
define('auth', [
	'domain',
], function (domain) {
	return {
		signIn: function (creds) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/login',
				data: JSON.stringify(creds),
				contentType: 'application/json',
			});
		},
		signOut: function () {
			return $.get('/auth/logout');
		},
		loginWithFacebook: function (authResponse) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/facebook',
				data: JSON.stringify({
					username: authResponse.accessToken,
					password: authResponse.accessToken,
				}),
				contentType: 'application/json',
			});
		},
		register: function (body) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/register',
				data: JSON.stringify(body),
				contentType: 'application/json',
			});
		},
		resendConfirmEmail: function (options) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/resendConfirmEmail',
				data: JSON.stringify({
					email: options.email,
				}),
				contentType: 'application/json',
				
			});
		},
		resetPasswordRequest: function (options) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/resetPasswordRequest',
				data: JSON.stringify({
					email: options.email,
				}),
				contentType: 'application/json',
			});
		},
		resetPassword: function (options) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/resetPassword',
				data: JSON.stringify({
					passwordResetToken: options.token,
					password: options.password,
				}),
				contentType: 'application/json',
			});
		},
		setPassword: function (options) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/setPassword',
				data: JSON.stringify({
					password: options.password,
				}),
				contentType: 'application/json',
			});
		},
		confirmEmail: function (token) {
			return $.ajax({
				type: 'post',
				url: domain + '/auth/confirmEmail',
				data: JSON.stringify({
					emailConfirmationToken: token,
				}),
				contentType: 'application/json',
			});
		},
		grecaptchaSitekeyP: $.get(domain + '/grecaptcha/sitekey'),
		grecaptchaP: (function () {
			var d = Q.defer();

			var awaitGrecaptcha = function () {
				if (typeof grecaptcha === 'undefined') {
					setTimeout(awaitGrecaptcha, 100);
				}
				else {
					d.resolve(grecaptcha);
				}
			};
			awaitGrecaptcha();
			return d.promise;
		})(),
		StripeP: $.get(domain + '/stripe/publishableKey').then(function (key) {
			if (window.Stripe) {
				window.Stripe.setPublishableKey(key);
				return window.Stripe;
			}
			else {
				console.log('Stripe not loaded');
			}
		}),
	};
});
define('forms', [
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
				$prop('type', type),
				withBackgroundColor(white),
				withFontColor(black),
				keyupThis(function (val) {
					if (type === 'text') {
						stream.push($(val.target).val());
					}
				}),
				changeThis(function (val) {
					if (type === 'date') {
						stream.push(moment($(val.target).val()).toDate());
					}
					else {
						stream.push($(val.target).val());
					}
				}),
				function (instance) {
					var $el = instance.$el;
					stream.onValue(function (v) {
						var newVal;
						if (type === 'date') {
							if (v) {
								newVal = moment(v).utc().format('YYYY-MM-DD');
							}
						}
						else if (type === 'checkbox') {
							setTimeout(function () {
								$el.prop('checked', v);
							});
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
			return promiseComponent(ckeditorP().then(function (ckeditor) {
				return div.all([
					child(textarea.all([
						$prop('id', name),
						$prop('name', name),
						$prop('rows', 21),
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
								ckeditor.config.resize_enabled = false;
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
											editor.resize(px(w), px(h), true, true);
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
						return [{
							width: context.width,
							height: context.height,
						}];
					}),
				]);
			}));
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
define('privacyPolicyView', [
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
], function (bodyColumn, confettiBackground, fonts, holibirthdayRow, separatorSize) {
	return stack({
		gutterSize: separatorSize,
	}, [
		confettiBackground(holibirthdayRow(text('Privacy Policy').all([
			fonts.h1,
		]))),
		bodyColumn(paragraph([
			'<style>',
			'#ppBody',
			'{',
			'font-size:11pt;',
			'width:100%;',
			'margin:0 auto;',
			'text-align:justify;',
			'}',
			'',
			'#ppHeader',
			'{',
			'font-family:verdana;',
			'font-size:21pt;',
			'width:100%;',
			'margin:0 auto;',
			'}',
			'',
			'.ppConsistencies',
			'{',
			'display:none;',
			'}',
			'</style><div id="ppBody"><div class="ppConsistencies"><div class="col-2">',
			'<div class="quick-links text-center">Information Collection</div>',
			'</div><div class="col-2">',
			'<div class="quick-links text-center">Information Usage</div>',
			'</div><div class="col-2">',
			'<div class="quick-links text-center">Information Protection</div>',
			'</div><div class="col-2"></div><div class="col-2">',
			'<div class="quick-links text-center">3rd Party Disclosure</div>',
			'</div><div class="col-2">',
			'<div class="quick-links text-center">3rd Party Links</div>',
			'</div><div class="col-2"></div></div><div style="clear:both;height:10px;"></div><div class="ppConsistencies"><div class="col-2">',
			'<div class="col-12 quick-links2 gen-text-center">Google AdSense</div>',
			'</div><div class="col-2">',
			'<div class="col-12 quick-links2 gen-text-center">',
			'Fair Information Practices',
			'<div class="col-8 gen-text-left gen-xs-text-center" style="font-size:12px;position:relative;left:20px;">Fair information<br> Practices</div>',
			'</div>',
			'</div><div class="col-2">',
			'<div class="col-12 quick-links2 gen-text-center coppa-pad">',
			'COPPA',
			'',
			'</div>',
			'</div><div class="col-2">',
			'<div class="col-12 quick-links2 quick4 gen-text-center caloppa-pad">',
			'CalOPPA',
			'',
			'</div>',
			'</div><div class="col-2">',
			'<div class="quick-links2 gen-text-center">Our Contact Information<br></div>',
			'</div></div><div style="clear:both;height:10px;"></div>',
			'<div class="innerText">This privacy policy has been compiled to better serve those who are concerned with how their "Personally identifiable information" (PII) is being used online. PII, as used in US privacy law and information security, is information that can be used on its own or with other information to identify, contact, or locate a single person, or to identify an individual in context. Please read our privacy policy carefully to get a clear understanding of how we collect, use, protect or otherwise handle your Personally Identifiable Information in accordance with our website.<br></div><span id="infoCo"></span><br><div class="grayText"><strong>What personal information do we collect from the people that visit our blog, website or app?</strong></div><br /><div class="innerText">When ordering or registering on our site, as appropriate, you may be asked to enter your name, email address, birth date or other details to help you with your experience.</div><br><div class="grayText"><strong>When do we collect information?</strong></div><br /><div class="innerText">We collect information from you when you register on our site  or enter information on our site.</div><br><span id="infoUs"></span><br><div class="grayText"><strong>How do we use your information? </strong></div><br /><div class="innerText"> We may use the information we collect from you when you register, make a purchase, sign up for our newsletter, respond to a survey or marketing communication, surf the website, or use certain other site features in the following ways:<br><br></div><div class="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> To personalize user"s experience and to allow us to deliver the type of content and product offerings in which you are most interested.</div><div class="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> To improve our website in order to better serve you.</div><div class="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> To allow us to better service you in responding to your customer service requests.</div><div class="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> To administer a contest, promotion, survey or other site feature.</div><span id="infoPro"></span><br><div class="grayText"><strong>How do we protect visitor information?</strong></div><br /><div class="innerText">We do not use vulnerability scanning and/or scanning to PCI standards.</div><div class="innerText">We do not use Malware Scanning.<br><br></div><div class="innerText">Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. In addition, all sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology. </div><br><div class="innerText">We implement a variety of security measures when a user enters, submits, or accesses their information to maintain the safety of your personal information.</div><br><div class="innerText">All transactions are processed through a gateway provider and are not stored or processed on our servers.</div><span id="trDi"></span><br><div class="grayText"><strong>Third Party Disclosure</strong></div><br /><div class="innerText">We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information unless we provide you with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others" rights, property, or safety. <br><br> However, non-personally identifiable visitor information may be provided to other parties for marketing, advertising, or other uses. </div><span id="trLi"></span><br><div class="grayText"><strong>Third party links</strong></div><br /><div class="innerText">Occasionally, at our discretion, we may include or offer third party products or services on our website. These third party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites. Nonetheless, we seek to protect the integrity of our site and welcome any feedback about these sites.</div><span id="gooAd"></span><br><div class="blueText"><strong>Google</strong></div><br /><div class="innerText">Google"s advertising requirements can be summed up by Google"s Advertising Principles. They are put in place to provide a positive experience for users. https://support.google.com/adwordspolicy/answer/1316548?hl=en <br><br></div><div class="innerText">We have not enabled Google AdSense on our site but we may do so in the future.</div><span id="calOppa"></span><br><div class="blueText"><strong>California Online Privacy Protection Act</strong></div><br /><div class="innerText">CalOPPA is the first state law in the nation to require commercial websites and online services to post a privacy policy.  The law"s reach stretches well beyond California to require a person or company in the United States (and conceivably the world) that operates websites collecting personally identifiable information from California consumers to post a conspicuous privacy policy on its website stating exactly the information being collected and those individuals with whom it is being shared, and to comply with this policy. -  See more at: http://consumercal.org/california-online-privacy-protection-act-caloppa/#sthash.0FdRbT51.dpuf<br></div><div class="innerText"><br><strong>According to CalOPPA we agree to the following:</strong></div><div class="innerText">Users can visit our site anonymously</div><div class="innerText">Once this privacy policy is created, we will add a link to it on our home page, or as a minimum on the first significant page after entering our website.</div><div class="innerText">Our Privacy Policy link includes the word "Privacy", and can be easily be found on the page specified above.</div><div class="innerText"><br>Users will be notified of any privacy policy changes:</div><div class="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> On our Privacy Policy Page</div><div class="innerText">Users are able to change their personal information:</div><div class="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> By logging in to their account</div><div class="innerText"><br><strong>How does our site handle do not track signals?</strong></div><div class="innerText">We honor do not track signals and do not track, plant cookies, or use advertising when a Do Not Track (DNT) browser mechanism is in place. </div><div class="innerText"><br><strong>Does our site allow third party behavioral tracking?</strong></div><div class="innerText">It"s also important to note that we do not allow third party behavioral tracking</div><span id="coppAct"></span><br><div class="blueText"><strong>COPPA (Children Online Privacy Protection Act)</strong></div><br /><div class="innerText">When it comes to the collection of personal information from children under 13, the Children"s Online Privacy Protection Act (COPPA) puts parents in control.  The Federal Trade Commission, the nation"s consumer protection agency, enforces the COPPA Rule, which spells out what operators of websites and online services must do to protect children"s privacy and safety online.<br><br></div><div class="innerText">We do not specifically market to children under 13.</div><span id="ftcFip"></span><br><div class="blueText"><strong>Fair Information Practices</strong></div><br /><div class="innerText">The Fair Information Practices Principles form the backbone of privacy law in the United States and the concepts they include have played a significant role in the development of data protection laws around the globe. Understanding the Fair Information Practice Principles and how they should be implemented is critical to comply with the various privacy laws that protect personal information.<br><br></div><div class="innerText"><strong>In order to be in line with Fair Information Practices we will take the following responsive action, should a data breach occur:</strong></div><div class="innerText">We will notify the users via email</div><div class="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> Within 7 business days</div><div class="innerText">We will notify the users via in site notification</div><div class="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>&bull;</strong> Within 7 business days</div><div class="innerText"><br>We also agree to the individual redress principle, which requires that individuals have a right to pursue legally enforceable rights against data collectors and processors who fail to adhere to the law. This principle requires not only that individuals have enforceable rights against data users, but also that individuals have recourse to courts or a government agency to investigate and/or prosecute non-compliance by data processors.</div><span id="canSpam"></span><br><div class="blueText"><strong>CAN SPAM Act</strong></div><br /><div class="innerText">The CAN-SPAM Act is a law that sets the rules for commercial email, establishes requirements for commercial messages, gives recipients the right to have emails stopped from being sent to them, and spells out tough penalties for violations.<br><br></div><div class="innerText"><strong>We collect your email address in order to:</strong></div><div class="innerText"><br><strong>To be in accordance with CANSPAM we agree to the following:</strong></div><div class="innerText"><strong><br>If at any time you would like to unsubscribe from receiving future emails, you can email us at</strong></div> and we will promptly remove you from <strong>ALL</strong> correspondence.</div><br><div class="innerText">If there are any questions regarding this privacy policy you may contact us using the information below.<br><br></div><div class="innerText"><br>Last Edited on 2015-06-09</div></div>',
		].join('\n'))),
	]);
});
define('loginWithFacebook', [
	'auth',
	'fonts',
	'separatorSize',
	'socialMedia',
	'submitButton',
], function (auth, fonts, separatorSize, socialMedia, submitButton) {
	var facebookAuthResponseD = Q.defer();
	FB.getLoginStatus(function (response) {
		if (response.status === 'unknown' || response.status === 'not_authorized' || response.status === 'connected') {
			facebookAuthResponseD.resolve(false);
		}
		facebookAuthResponseD.resolve(response.authResponse);
	}, true);
	
	return function () {
		return promiseComponent(facebookAuthResponseD.promise.then(function (authResponse) {
			return button.all([
				child(submitButton(socialMedia.facebook.color, sideBySide({
					gutterSize: separatorSize,
				}, [
					text(socialMedia.facebook.icon).all([
						$css('font-size', '20px'),
					]),
					text('sign in with Facebook').all([
						fonts.bebasNeue,
					]),
				])).all([
					withFontColor(socialMedia.facebook.color),
				])),
				wireChildren(passThroughToFirst),
			]).all([
				link,
				clickThis(function (e) {
					e.stopPropagation();
					e.preventDefault();
					if (authResponse) {
						auth.loginWithFacebook(authResponse).then(function () {
							window.location.reload();
						});
					}
					else {
						FB.login(function (r) {
							auth.loginWithFacebook(r.authResponse).then(function () {
								window.location.reload();
							});
						}, {
							scope: 'email, public_profile, user_friends, user_birthday',
						});
					}
				}),
			]);
		}));
	};
});
define('resetPasswordView', [
	'auth',
	'bar',
	'bodyColumn',
	'fonts',
	'prettyForms',
	'separatorSize',
], function (auth, bar, bodyColumn, fonts, prettyForms, separatorSize) {
	return function (token) {
		var passwordS = Stream.once('');
		var confirmPasswordS = Stream.once('');

		var passwordsDoNotMatch = Stream.once(false);
		passwordS.map(function () {
			passwordsDoNotMatch.push(false);
		});
		confirmPasswordS.map(function (cp) {
			passwordsDoNotMatch.push(passwordS.lastValue() !== cp);
		});
		
		var password = prettyForms.input({
			name: 'Password',
			fieldName: 'password',
			stream: passwordS,
			type: 'password',
		});
		var confirmPassword = prettyForms.input({
			name: 'Password Again',
			fieldName: 'confirmPassword',
			stream: confirmPasswordS,
			type: 'password',
		});
		
		var submit = prettyForms.submit(black, 'Submit', function () {
			if (!passwordsDoNotMatch.lastValue()) {
				auth.resetPassword({
					password: passwordS.lastValue(),
					token: token,
				}).then(function () {
					pageS.push(text('Reset!  You may now log in.').all([
						fonts.h1,
					]));
				}, function () {
					pageS.push(text('Invalid token.').all([
						fonts.h1,
					]));
				});
			}
		});
		
		var pageS = Stream.once(alignLRM({
			left: stack({
				gutterSize: separatorSize,
			}, [
				text('Reset Password').all([
					fonts.h1,
				]),
				password,
				confirmPassword,
				toggleHeight(passwordsDoNotMatch)(paragraph('Passwords must match')),
				submit,
			]),
		}));
		return bodyColumn(componentStream(pageS));
	};
});
define('profileEditViewP', [
	'auth',
	'bodyColumn',
	'confettiBackground',
	'daysByMonth',
	'db',
	'defaultFormFor',
	'fonts',
	'holibirthdayRow',
	'meP',
	'months',
	'prettyForms',
	'profilesP',
	'separatorSize',
	'submitButton',
], function (auth, bodyColumn, confettiBackground, daysByMonth, db, defaultFormFor, fonts, holibirthdayRow, meP, months, prettyForms, profilesP, separatorSize, submitButton) {
	return function (user) {
		var withPasswordEditor = function (f) {
			var passwordS = Stream.once('');
			var confirmPasswordS = Stream.once('');

			var passwordsDoNotMatch = Stream.once(false);
			passwordS.map(function () {
				passwordsDoNotMatch.push(false);
			});
			confirmPasswordS.map(function (cp) {
				passwordsDoNotMatch.push(passwordS.lastValue() !== cp);
			});
			
			var password = prettyForms.input({
				name: 'New Password',
				fieldName: 'password',
				stream: passwordS,
				type: 'password',
			});
			var confirmPassword = prettyForms.input({
				name: 'New Password Again',
				fieldName: 'confirmPassword',
				stream: confirmPasswordS,
				type: 'password',
			});
			
			return f(stack({
				gutterSize: separatorSize,
			}, [
				nothing,
				text('Change your Password:').all([
					fonts.bebasNeue,
				]),
				password,
				confirmPassword,
				toggleHeight(passwordsDoNotMatch)(paragraph('Passwords must match')),
			]), function () {
				var doneD = Q.defer();
				var password = passwordS.lastValue();
				if (passwordsDoNotMatch.lastValue()) {
					doneD.reject();
				}
				else if (password.length > 0) {
					auth.setPassword({
						password: passwordS.lastValue(),
					}).then(function () {
						doneD.resolve();
					});
				}
				else {
					doneD.resolve();
				}
				return doneD.promise;
			});
		};
		return withPasswordEditor(function (passwordEditor, savePassword) {
			return profilesP.then(function (profiles) {
				return db.holibirthday.findOne({
					user: user,
				}).then(function (holibirthday) {
					var profile = profiles.filter(function (profile) {
						return profile.user === user;
					})[0];
					profile.firstName = profile.firstName || '';
					profile.lastName = profile.lastName || '';
					profile.email = profile.email || '';
					profile.birthday = profile.birthday || null;
					profile.bio = profile.bio || null;
					profile.imageUrl = profile.imageUrl || './content/man.png';
					profile.holibirther = profile.holibirther || false;
					profile.knowAHolibirther = profile.knowAHolibirther || false;
					profile.receiveMarketingEmails = profile.receiveMarketingEmails || false;

					holibirthday = holibirthday || {
						user: user,
						month: 0,
						day: 1,
					};
					holibirthday.month = months[holibirthday.month];
					var holibirthdayStreams = Stream.splitObject(holibirthday);
					var holibirthdayS = Stream.combineObject(holibirthdayStreams);

					return defaultFormFor.profile(profile, function (profileS, fields) {
						return stack({
							gutterSize: separatorSize,
						}, [
							confettiBackground(bodyColumn(holibirthdayRow(text('Edit Profile').all([
								fonts.h1,
							]), profile.imageUrl))),
							bodyColumn(stack({
								gutterSize: separatorSize,
							}, [
								fields.firstName,
								fields.lastName,
								fields.email,
								fields.receiveMarketingEmails,
								fields.birthday,
								fields.bio,
								fields.imageUrl,
								stack({}, [
									fields.holibirther,
									componentStream(profileS.prop('holibirther').map(function (holibirther) {
										return holibirther ? stack({
											gutterSize: separatorSize,
										}, [
											nothing,
											prettyForms.select({
												name: 'Holibirth-month',
												options: months,
												stream: holibirthdayStreams.month,
											}),
											componentStream(holibirthdayStreams.month.map(function (month) {
												var countDates = daysByMonth[month];
												var dates = [];
												for (var i = 0; i < countDates; i++) {
													dates.push(i + 1);
												}
												return prettyForms.select({
													name: 'Holibirth-day',
													options: dates,
													stream: holibirthdayStreams.day,
												});
											})),
										]) : nothing;
									})),					  
								]),
								fields.knowAHolibirther,
								passwordEditor,
								alignLRM({
									middle: submitButton(black, text('Submit').all([
										fonts.bebasNeue,
									])).all([
										link,
										clickThis(function () {
											var p = profileS.lastValue();
											return savePassword().then(function () {
												return db.profile.update({
													_id: p._id,
												}, p).then(function () {
													if (p.holibirther) {
														var h = holibirthdayS.lastValue();
														h.date = new Date(h.month + ' ' + h.day + ' 2000');
														if (h._id) {
															return db.holibirthday.update({
																_id: h._id,
															}, {
																date: h.date,
															}).then(function () {
																window.location.hash = '#!user/' + p.user;
																window.location.reload();
															});
														}
														else {
															return db.holibirthday.insert(h).then(function () {
																window.location.hash = '#!user/' + p.user;
																window.location.reload();
															});
														}
													}
													else {
														window.location.hash = '#!user/' + p.user;
														window.location.reload();
													}
												});
											});
										}),
									]),
								}),
							])),
						]);
					});
				});
			});
		});
	};
});
define('footer', [
	'colors',
	'fonts',
	'separatorSize',
], function (colors, fonts, separatorSize) {
	var footerLinks = [{
		name: 'Contact Holibirthday',
		link: '#!contactUs',
	}, {
		name: 'Privacy Policy',
		link: '#!privacyPolicy',
	}].map(function (info) {
		return linkTo(info.link, text(info.name).all([
			fonts.ralewayThinBold,
		]));
	});
	
	return alignLRM({
		middle: sideBySide({
			gutterSize: separatorSize,
		}, footerLinks),
	}).all([
		withBackgroundColor(colors.pageBackgroundColor),
	]);
});
define('profilesP', [
	'db',
], function (db) {
	return db.profile.find();
});
	
define('signInForm', [
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
define('siteCopyItemsP', [
	'db',
], function (db) {
	return db.siteCopyItem.find({}).then(function (siteCopyItems) {
		siteCopyItems.find = function (name) {
			var item = siteCopyItems.filter(function (siteCopyItem) {
				return siteCopyItem.uniqueName === name;
			})[0];
			return item ? item.value : 'No Copy';
		};
		return siteCopyItems;
	});
});
define('db', [
	'domain',
], function (domain) {
	return (function () {
		var db = {};
		
		schema.map(function (table) {
			var uri = domain + '/api/' + table.name + '/';
			var convertFields = function (doc) {
				table.fields.map(function (field) {
					if (doc[field.name]) {
						// skip id type for client side
						if (field.type !== type.id) {
							doc[field.name] = field.type.fromString(doc[field.name]);
						}
					}
				});
			};
			
			var mapResponse = function (responseP) {
				return responseP.then(function (docs) {
					if (docs) {
						if (Array.isArray(docs)) {
							docs.map(convertFields);
						}
						else {
							convertFields(docs);
						}
					}
					return docs;
				});
			};
			
			db[table.name] = {
				findOne: function (query) {
					var result = Q.defer();
					
					$.ajax({
						type: 'post',
						url: uri + 'find',
						data: JSON.stringify(query),
						contentType: 'application/json',
					}).then(function (docs) {
						if (docs.length === 0) {
							result.resolve(null);
						}
						result.resolve(docs[0]);
					});
					
					return mapResponse(result.promise);
				},
				find: function (query) {
					return mapResponse($.ajax({
						type: 'post',
						url: uri + 'find',
						data: JSON.stringify(query),
						contentType: 'application/json',
					}));
				},
				insert: function (doc) {
					return mapResponse($.ajax({
						type: 'post',
						url: uri + 'insert', 
						data: JSON.stringify(doc),
						contentType: 'application/json',
					}));
				},
				update: function (query, update) {
					return mapResponse($.ajax({
						type: 'post',
						url: uri + 'update', 
						data: JSON.stringify({
							query: query,
							update: update
						}),
						contentType: 'application/json',
					}));
				},
				insertOrUpdate: function (doc) {
					if (doc._id) {
						return db[table.name].update({
							_id: doc._id,
						}, doc);
					}
					return db[table.name].insert(doc);
				},
				remove: function (query) {
					return mapResponse($.ajax({
						type: 'post',
						url: uri + 'remove', 
						data: JSON.stringify(query),
						contentType: 'application/json',
					}));
				},
			};
		});

		db.uploadFile = function (file, fileName) {
			var data = new FormData();
			if (fileName) {
				data.append('file', file, fileName);
			}
			else {
				data.append('file', file);
			}
			
			return $.ajax({
				url: '/api/uploadFile/insert',
				type: 'post',
				data: data,
				cache: false,
				processData: false,
				contentType: false,
			});
		};
		
		return db;
	})();
});
define('wishlistView', [
	'bodyColumn',
	'cart',
	'confettiBackground',
	'db',
	'fonts',
	'formatPrice',
	'gafyColors',
	'holibirthdayRow',
	'meP',
	'separatorSize',
	'submitButton',
], function (bodyColumn, cart, confettiBackground, db, fonts, formatPrice, gafyColors, holibirthdayRow, meP, separatorSize, submitButton) {
	return function (user) {
		var wishlistD = Q.defer();
		return promiseComponent(db.gafyDesign.find().then(function (designs) {
			return db.gafyStyle.find().then(function (styles) {
				return meP.then(function (me) {
					if (user) {
						db.gafyWishlist.findOne({
							user: user,
						}).then(function (wishlist) {
							wishlistD.resolve(wishlist.items);
						});
					}
					else if (me) {
						db.gafyWishlist.findOne({
							user: me._id,
						}).then(function (wishlist) {
							if (wishlist) {
								location.hash = '#!wishlist/' + me._id;
							}
							else {
								wishlistD.resolve(cart.wishlistItems);
							}
						});
					}
					else {
						wishlistD.resolve(cart.wishlistItems);
					}
					var mayRemove = (me && user === me._id) ||
						(!me && !user);
					return wishlistD.promise.then(function (wishlistItems) {
						var cartLineItem = function (cartItem, index) {
							var design = designs.filter(function (d) {
								return d._id === cartItem.designId;
							})[0];
							var style = styles.filter(function (s) {
								return s._id === cartItem.styleId;
							})[0];
							var addedToCart = Stream.once(false);
							return sideBySide({
								handleSurplusWidth: giveToFirst,
							}, [
								linkTo('#!design/' + cartItem.designId, grid({
									minColumnWidth: 10,
									gutterSize: separatorSize,
								}, [
									alignLRM({
										left: image({
											src: design.imageUrl,
											minHeight: 200,
											chooseWidth: 0,
										}),
									}),
									alignLRM({
										left: image({
											src: style.imageUrl,
											minHeight: 200,
											chooseWidth: 0,
										}),
									}),
									stack({
										gutterSize: separatorSize,
									}, [
										text(gafyColors[cartItem.color].name + ' ' + design.designDescription + ' ' + style.styleDescription).all([
											fonts.ralewayThinBold,
										]),
										alignLRM({
											left: div.all([
												withBackgroundColor(gafyColors[cartItem.color].color),
												withMinWidth(50),
												withMinHeight(50),
											]),
										}),
										text('Size: ' + cartItem.size).all([
											fonts.ralewayThinBold,
										]),
									]),
								])),
								stack({}, [
									alignLRM({
										right: text(formatPrice(style.price)).all([
											fonts.ralewayThinBold,
											$css('font-size', 30),
										]),
									}),
									alignLRM({
										right: componentStream(addedToCart.map(function (added) {
											return added ? text('(Added to Cart)').all([
												$css('font-size', 15),
												link,
												clickThis(function () {
													cart.addItem(wishlistItems[index]);
													window.location.reload();
												}),
											]) : nothing;
										})),
									}),
									alignLRM({
										right: mayRemove ? text('Add to Cart').all([
											$css('font-size', 15),
											link,
											clickThis(function () {
												cart.addItem(wishlistItems[index]);
												addedToCart.push(true);
											}),
										]) : nothing,
									}),
									alignLRM({
										right: mayRemove ? text('(Remove Item)').all([
											$css('font-size', 15),
											link,
											clickThis(function () {
												cart.removeWishlistItem(index);
												window.location.reload();
											}),
										]) : nothing,
									}),
								]),
							]);
						};

						return stack({
							gutterSize: separatorSize,
						}, [
							confettiBackground(bodyColumn(holibirthdayRow(text('Wish List').all([
								fonts.ralewayThinBold,
								$css('font-size', 40),
							])))),
							bodyColumn(stack({
								gutterSize: separatorSize,
							}, [
								stack({
									gutterSize: separatorSize,
								}, wishlistItems.map(cartLineItem)),
								alignLRM({
									right: text('Total: ' + formatPrice(wishlistItems.reduce(function (a, cartItem) {
										return a + styles.filter(function (s) {
											return s._id === cartItem.styleId;
										})[0].price;
									}, 0))).all([
										fonts.ralewayThinBold,
										$css('font-size', 30),
									]),
								}),
								alignLRM({
									right: sideBySide({
										gutterSize: separatorSize,
									}, [
										linkTo('#!gifts', submitButton(black, sideBySide({
											gutterSize: separatorSize,
										}, [
											fonts.fa('cart-plus'),
											text('Continue Shopping'),
										]))),
										linkTo('#!cart', submitButton(black, sideBySide({
											gutterSize: separatorSize,
										}, [
											fonts.fa('shopping-cart'),
											text('Cart'),
										]))),
									]),
								}),
							])),
						]);
					});
				});
			});
		})).all([
			function () {
				meP.then(function (me) {
					if (me) {
						wishlistD.promise.then(function (wishlist) {
							db.gafyWishlist.findOne({
								user: user,
							}).then(function (oldWishlist) {
								if (oldWishlist) {
									db.gafyWishlist.update({
										_id: oldWishlist._id,
									}, {
										user: me._id,
										items: wishlist,
									}).then(function () {
										location.hash = '#!wishlist/' + me._id;
									});
								}
								else {
									db.gafyWishlist.insert({
										user: me._id,
										items: wishlist,
									}).then(function () {
										location.hash = '#!wishlist/' + me._id;
									});
								}
							});
						});
					}
				});
			},
		]);
	};
});
define('confettiBackground', [
	'colors',
	'domain',
], function (colors, domain) {
	return function (c) {
		return withBackground(alignLRM({
			right: image({
				src: domain + '/content/confetti.png',
				chooseWidth: 1,
			}),
		}).all([
			withBackgroundColor(colors.holibirthdayRed),
		]), c.all([
			withFontColor(white),
		]));
	};
});
define('socialMediaButton', [
	'fonts',
	'separatorSize',
], function (fonts, separatorSize) {
	return function (textFunc) {
		return function (sm) {
			return border(sm.color, {
				all: 2,
				radius: 2,
			}, padding(10, sideBySide({
				gutterSize: separatorSize,
			},[
				text(sm.icon).all([
					$css('font-size', '20px'),
				]),
				text(textFunc(sm.shareVerb)).all([
					fonts.bebasNeue,
				]),
			]))).all([
				link,
				withFontColor(sm.color),
				clickThis(function () {
					sm.shareThisPage();
				}),
			]);
		};
	};
});
define('gift', [
	'bodyColumn',
	'confettiBackground',
	'domain',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
	'siteCopyItemsP',
], function (bodyColumn, confettiBackground, domain, fonts, holibirthdayRow, separatorSize, siteCopyItemsP) {
	return promiseComponent(siteCopyItemsP.then(function (copy) {
		return stack({
			gutterSize: separatorSize,
		}, [
			confettiBackground(bodyColumn(holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text('Holibirthday Gifts').all([
					fonts.ralewayThinBold,
					fonts.h1,
				]),
			]), domain + '/content/man.png'))),
		]);
	}));
});
define('bar', [], function () {
	return {
		horizontal: function (size, color) {
			size = size || 0;
			color = color || transparent;
			return div.all([
				componentName('vertical-separator'),
				withMinWidth(0, true),
				withMinHeight(size, true),
				withBackgroundColor(color),
			]);
		},
		vertical: function (size, color) {
			size = size || 0;
			color = color || transparent;
			return div.all([
				componentName('horizontal-separator'),
				withMinWidth(size, true),
				withMinHeight(0, true),
				withBackgroundColor(color),
			]);
		},
	};
});
define('separatorSize', [], function () {
	return 20;
});

define('fonts', [], function () {
	return {
		ralewayThin: $css('font-family', 'Raleway Thin'),
		bebasNeue: function (i) {
			i.$el.css('font-family', 'BebasNeue');
			i.$el.css('font-size', '20px');
			setTimeout(function () {
				i.updateDimensions();
			});
		},
		celebrationTime: $css('font-family', 'CelebrationTime'),
		
		ralewayThinBold: function (i) {
			i.$el.css('font-family', 'Raleway Thin');
			i.$el.css('font-weight', 'bold');
			setTimeout(function () {
				i.updateDimensions();
			});
		},

		h1: function (i) {
			i.$el.css('font-family', 'Raleway Thin');
			i.$el.css('font-weight', 'bold');
			i.$el.css('font-size', px(40));
			setTimeout(function () {
				i.updateDimensions();
			});
		},
		h2: function (i) {
			i.$el.css('font-family', 'Raleway Thin');
			i.$el.css('font-weight', 'bold');
			i.$el.css('font-size', px(30));
			setTimeout(function () {
				i.updateDimensions();
			});
		},
		h3: function (i) {
			i.$el.css('font-family', 'Raleway Thin');
			i.$el.css('font-weight', 'bold');
			i.$el.css('font-size', px(20));
			setTimeout(function () {
				i.updateDimensions();
			});
		},
		fa: function (fontAwesomeIcon) {
			return text('<i\tclass="fa\tfa-' + fontAwesomeIcon + '"></i>');
		},
		faI: function (fontAwesomeIcon) {
			return '<i\tclass="fa\tfa-' + fontAwesomeIcon + '"></i>';
		},
	};
});	
define('profileP', [
	'meP',
	'profilesP',
], function (meP, profilesP) {
	return meP.then(function (me) {
		return me && profilesP.then(function (profiles) {
			return profiles.filter(function (p) {
				return p.user === me._id;
			})[0];
		});
	});
});
define('formFor', [
	'db',
	'fonts',
	'forms',
	'gafyColors',
	'gafyStyleSmall',
	'opacityGridSelect',
	'prettyForms',
	'separatorSize',
], function (db, fonts, forms, gafyColors, gafyStyleSmall, opacityGridSelect, prettyForms, separatorSize) {
	// Prettify does the same thing as all the wet code in
	// prettyForms.  todo: move all the code here and make it use
	// prettify, and delete prettyForms
	var prettify = function (name, inputC, labelAll) {
		return stack({}, [
			text(name).all([
				fonts.ralewayThinBold,
				fonts.h3,
			]).all(labelAll || []),
			inputC,
		]);
	};
	
	var fromTable = function (table) {
		var fields = {};
		
		table.fields.map(function (field) {
			fields[field.name] = function (labelAll, stream) {
				switch (field.editorType && field.editorType.name) {
				case 'string':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
						type: 'text',
					});
				case 'paragraph':
					return prettyForms.plainTextarea({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
					});
				case 'password':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
						type: 'password',
					});
				case 'html':
					return prettyForms.textarea({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
					});
				case 'date':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
						type: 'date',
					});
				case 'number':
					return prettyForms.input({
						name: field.displayName,
						fieldName: field.name,
						labelAll: labelAll,
						stream: stream,
						type: 'number',
					});
				case 'file':
					if (field.editorType.accept.indexOf('image') !== -1) {
						return prettyForms.imageUpload({
							name: field.displayName,
							fieldName: field.name,
							labelAll: labelAll,
							stream: stream,
						});
					}
					return prettyForms.fileUpload({
							name: field.displayName,
							fieldName: field.name,
							labelAll: labelAll,
							stream: stream,
					});
				case 'bool':
					return prettyForms.checkbox({
						name: field.displayName,
						fieldName: field.name,
						stream: stream,
					});
				case 'foreignKey':
					return promiseComponent(db[field.editorType.table].find({}).then(function (rows) {
						return prettify(field.displayName, forms.selectBox({
							options: rows.map(function (row) {
								return {
									name: row[field.editorType.nameField],
									value: row._id,
								};
							}),
							name: field.name,
							stream: stream,
						}));
					}));
				case 'listOf':
					var textStream = Stream.create();
					stream.map(function (arr) {
						if (!arr.join) {
							arr = [];
						}
						return arr.join('\n');
					}).pushAll(textStream);
					textStream.map(function (str) {
						return str.split('\n');
					}).pushAll(stream);
					return prettify(field.displayName + ' (one per line)', forms.plainTextareaBox(textStream, field.name).all([
						$addClass('pre'),
 					]));
				case 'oneOf':
					return prettify(field.displayName, stack({}, field.editorType.options.map(function (option) {
						return sideBySide({
							gutterSize: separatorSize,
						}, [
							forms.inputBox(Stream.create(), 'radio', field.name).all([
								$prop('value', option),
								clickThis(function () {
									stream.push(option);
								}),
								function (instance) {
									setTimeout(function () {
										stream.onValue(function (value) {
											if (value === option) {
												instance.$el.find('input').click();
											}
										});
									});
								},
							]),
							padding({
								top: 1,
							}, text(option).all([
								fonts.ralewayThinBold,
							])),
						]);
					})));
				case 'enumeration':
					return prettify(field.displayName, forms.selectBox({
						options: field.editorType.options,
						name: field.name,
						stream: stream,
					}));
				case 'gafyColor':
					return prettify(field.displayName, opacityGridSelect(stream, gafyColors.sort(function (gc1, gc2) {
						return gc1.name.localeCompare(gc2.name);
					}).map(function (gafyColor) {
						return {
							component: stack({}, [
								alignLRM({
									middle: div.all([
										withBackgroundColor(gafyColor.color),
										withMinWidth(50),
										withMinHeight(50),
									]),
								}),
								text(gafyColor.name),
								text(rgbColorString(gafyColor.color)),
							]),
							value: gafyColor.name,
						};
					}), true));
				case 'gafyStyle':
					return promiseComponent(db.gafyStyle.find({}).then(function (gafyStyles) {
						return prettify(field.displayName, opacityGridSelect(stream, gafyStyles.map(function (gafyStyle) {
							return {
								component: gafyStyleSmall(gafyStyle),
								value: gafyStyle._id,
							};
						}), true));
					}));
				default:
					return text('no form element');
				}
			};
		});
		
		return function (labelAll) {
			return function (object, cb) {
				var objectStreams = {};
				var objectFields = {};
				for (var key in object) {
					var stream = (object[key] !== undefined) ?
						Stream.once(object[key]) :
						Stream.create();
					objectStreams[key] = stream;
					if (fields[key]) {
						objectFields[key] = fields[key](labelAll, stream);
					}
				}
				return form.all([
					child(cb(Stream.combineObject(objectStreams), objectFields)),
					wireChildren(passThroughToFirst),
				]);
			};
		};
	};

	var formFor = [];
	
	schema.map(function (table) {
		var formFieldsForTable = fromTable(table);
		formFor.push(formFieldsForTable);
		formFor[table.name] = formFieldsForTable;
	});


	return formFor;
});
define('header', [
	'adminP',
	'auth',
	'bar',
	'bodyColumn',
	'colors',
	'domain',
	'fonts',
	'meP',
	'separatorSize',
	'signInForm',
	'signInStream',
	'siteCopyItemsP',
], function (adminP, auth, bar, bodyColumn, colors, domain, fonts, meP, separatorSize, signInForm, signInStream, siteCopyItemsP) {
	return promiseComponent(siteCopyItemsP.then(function (siteCopyItems) {
		var holibirthdayButton = function (config) {
			config.all = config.all || [];
			return function (label) {
				return padding(config.padding, alignTBM({
					middle: text(label).all(config.all),
				}));
			};
		};

		var headerButton = function (text) {
			return holibirthdayButton({
				padding: 10,
				all: [
					fonts.celebrationTime,
					$css('font-weight', 'bold'),
					$css('font-size', '20px'),
				],
			})(text);
		};

		var headerRightButtons = function (me, admin, signInStream) {
			var buttons = [];
			if (admin) {
				buttons.push(linkTo('#!admin', headerButton(siteCopyItems.find('Header Admin'))));
			}
			
			buttons.push(linkTo('#!browseStories', headerButton(siteCopyItems.find('Header Browse'))));
			buttons.push(linkTo('http://holibirthdaygift.com/', headerButton(siteCopyItems.find('Header Gifts'))));
			buttons.push(linkTo('#!causes', headerButton(siteCopyItems.find('Header Causes'))));

			if (me) {
				buttons.push(linkTo('#!user/' + me._id, headerButton(siteCopyItems.find('Header My Profile'))));
				buttons.push(headerButton(siteCopyItems.find('Header Sign Out')).all([
					link,
					clickThis(function () {
						auth.signOut().then(function () {
							window.location.hash = '#!';
							window.location.reload();
						});
					}),
				]));
			}
			else {
				buttons.push(headerButton(siteCopyItems.find('Header Sign In')).all([
					link,
					clickThis(function (ev) {
						signInStream.push(!signInStream.lastValue());
						ev.stopPropagation();
					}),
				]));
				buttons.push(linkTo('#!register', headerButton(siteCopyItems.find('Header Register'))));
			}
			return buttons;
		};


		return meP.then(function (me) {
			return adminP.then(function (admin) {
				var menuOpenStream = Stream.once(false);
				$('body').on('click', function () {
					signInStream.push(false);
					menuOpenStream.push(false);
				});
				var rightButtons = headerRightButtons(me, admin, signInStream);
				var buttons = sideBySide({
					gutterSize: separatorSize,
				}, rightButtons);
				var bars = headerButton(fonts.faI('bars')).all([
					link,
					clickThis(function (ev) {
						menuOpenStream.push(!menuOpenStream.lastValue());
						ev.stopPropagation();
					}),
				]);
				return dropdownPanel(dropdownPanel(border(colors.middleGray, {
					bottom: 1,
				}, alignLRM({
					middle: bodyColumn(stack({}, [
						alignLRM({
							left: alignTBM({
								middle: toggleComponent([
									linkTo(domain + '/#!', image({
										src: 'https://www.holibirthday.com/content/man3.png',
										minHeight: 44,
										minWidth: 55.45,
									})),
									image({
										src: 'https://www.holibirthday.com/content/man3.png',
										minHeight: 44,
										minWidth: 55.45,
									}).all([
										function (i, context) {
											i.$el.css('cursor', 'pointer');
											Stream.combine([
												windowScroll,
												context.height,
												windowHash,
											], function (s, h, hash) {
												i.$el.css('opacity', ((hash === '' ||
																	   hash === '#' ||
																	   hash === '#!') &&
																	  s > 0) ? 1 : 0);
												setTimeout(function () {
													i.$el.css('transition', 'opacity 0.1s');
												});
											});
										},
										clickThis(function () {
											$('body').animate({scrollTop: 0}, 300);
										}),
									]),
								], windowHash.map(function (h) {
									if (-1 !== window.location.origin.indexOf('gift')) {
										return 0;
									}
									return (h === '' ||
											h === '#' ||
											h === '#!') ? 1 : 0;
								})),
							}),
							right: componentStream(windowWidth.map(function (width) {
								if (width > 560) {
									menuOpenStream.push(false);
									return buttons;
								}
								return bars;
							})),
						}),
					])),
				})).all([
					withBackgroundColor(colors.pageBackgroundColor),
				]), alignLRM({
					right: border(black, {
						left: 1,
						bottom: 1,
					}, stack({
						gutterSize: separatorSize,
					}, rightButtons).all([
						withBackgroundColor(colors.pageBackgroundColor),
					])),
				}), menuOpenStream), signInForm().all([
					clickThis(function (ev) {
						ev.stopPropagation();
					}),
				]), signInStream);
			});
		});
	}));
});
define('months', [], function () {
	return [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
});
define('holibirthdayView', [
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'meP',
	'separatorSize',
	'socialMedia',
	'socialMediaButton',
], function (bodyColumn, colors, confettiBackground, db, fonts, holibirthdayRow, meP, separatorSize, socialMedia, socialMediaButton) {
	return function (user) {
		return promiseComponent(Q.all([
			db.holibirthday.findOne({
				user: user,
			}),
			db.profile.findOne({
				user: user,
			}),
		]).then(function (results) {
			return meP.then(function (me) {
				var holibirthday = results[0];
				var profile = results[1];
				if (!holibirthday) {
					return nothing;
				}
				
				var srcS = Stream.create();
				var canvas = document.createElement('canvas');
				var $canvas = $(canvas);
				$canvas.appendTo($('body'))
					.prop('width', 1080)
					.prop('height', 702);

				var ctx = canvas.getContext('2d');

				var drawCenteredText = function (p, text, font) {
					ctx.font = font;
					var width = ctx.measureText(text).width;
					ctx.fillText(text, p.x - width / 2, p.y);
				};
				
				var img = new Image();
				img.onload = function() {
					ctx.drawImage(img, 0, 0);
					drawCenteredText({
						x: 540,
						y: 310,
					}, profile.firstName + ' ' + profile.lastName, 'bold 50px Raleway Thin');
					drawCenteredText({
						x: 540,
						y: 540,
					}, moment(holibirthday.date).utc().format('MMMM Do'), 'bold 50px Raleway Thin');
					if (profile.birthday) {
						drawCenteredText({
							x: 160,
							y: 595,
						}, 'Old Birthday', '20px BebasNeue');
						drawCenteredText({
							x: 160,
							y: 615,
						}, moment(profile.birthday).utc().format('MMMM Do'), '20px BebasNeue');
					}
					setTimeout(function () {
						srcS.push(canvas.toDataURL());
						$canvas.remove();
					});
				};
				img.src = './content/certificate-01.png';
				
				var holibirthdaySocialMediaButton = socialMediaButton(function (verb) {
					return verb + (me && me._id === profile.user ? ' your certificate' : ' this certificate');
				});

				var shareButtons = bodyColumn(alignLRM({
					middle: sideBySide({
						gutterSize: separatorSize,
					}, [
						holibirthdaySocialMediaButton(socialMedia.facebook),
						holibirthdaySocialMediaButton(socialMedia.twitter),
					].map(function (b) {
						return b.all([
							withBackgroundColor(colors.pageBackgroundColor),
							clickThis(function (ev) {
								ev.stopPropagation();
							}),
						]);
					})),
				}));


				return stack2({
					gutterSize: separatorSize,
					handleSurplusHeight: giveHeightToNth(0),
				}, [
					holibirthday ?
						componentStream(srcS.map(function (src) {
							return bodyColumn(keepAspectRatio(linkTo(src, image({
								src: src,
								useNativeSize: true,
							}))));
						})).all([
							withMinWidth(0, true),
							withMinHeight(0, true),
						]):
						bodyColumn(text(profile.firstName + ' ' + profile.lastName + ' does not have a holibirthday!').all([
							fonts.ralewayThinBold,
							fonts.h1,
						])),
					shareButtons,
				]);
			});
		}));
	};
});
define('prettyForms', [
	'db',
	'fonts',
	'forms',
	'separatorSize',
	'submitButton',
], function (db, fonts, forms, separatorSize, submitButton) {
	var prettyForms = {
		input: function (config) {
			return stack({}, [
				text(config.name).all([
					fonts.ralewayThinBold,
				]).all(config.labelAll || []),
				alignLRM({
					left: forms.inputBox(config.stream, config.type, config.fieldName),
				}),
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
			cb = cb || function () {};
			config.accept = config.accept || '*';
			return stack({}, [
				text(config.name).all([
					fonts.ralewayThinBold,
				]).all(config.labelAll || []),
				input.all([
					$prop('type', 'file'),
					$prop('accept', config.accept),
					
					changeThis(function (ev) {
						var file = ev.target.files[0];
						cb(file);
						if (config.stream) {
							config.stream.push(file);
						}
					}),
				]),
			]);
		},
		imageUpload: function (config) {
			var imageSrc = Stream.once('./content/man.png');
			config.stream.pushAll(imageSrc);
			config.accept = config.accept || "image/*";
			return grid({
				gutterSize: separatorSize,
			}, [
				prettyForms.input({
					name: config.name,
					accept: config.accept,
					labelAll: config.labelAll,
					stream: config.stream,
				}).all([
					withMinWidth(300, true),
				]),
				image({
					src: imageSrc,
					minWidth: 300,
				}),
			]);
		},
		checkbox: function (config) {
			var currentValue = false;
			config.stream.onValue(function (value) {
				currentValue = value;
			});
			return sideBySide({
				gutterSize: separatorSize,
			}, [
				forms.inputBox(config.stream, 'checkbox', config.fieldName),
				padding({
					top: 1,
				}, text(config.name).all([
					fonts.ralewayThinBold,
				])),
			]).all([
				clickThis(function (e) {
					config.stream.push(!currentValue);
					e.stopPropagation();
					return false;
				}),
			]);
		},
		radios: function (config) {
			return stack({}, config.options.map(function (option) {
				return sideBySide({
					gutterSize: separatorSize,
				}, [
					forms.inputBox(Stream.create(), 'radio', config.fieldName).all([
						$prop('value', option.value),
						function (instance) {
							setTimeout(function () {
								config.stream.onValue(function (value) {
									if (value === option.value) {
										instance.$el.find('input').prop('checked', true);
									}
									else {
										instance.$el.find('input').prop('checked', false);
									}
								});
								
							});
						},
						clickThis(function () {
							config.stream.push(option.value);
						}),
					]),
					padding({
						top: 1,
					}, text(option.name).all([
						fonts.ralewayThinBold,
					])),
				]);
			}));
		},
		submit: function (color, label, cb) {
			return stack({}, [
				input.all([
					$prop('type', 'submit'),
					submitThis(function () {
						cb();
						return false;
					}),
					withMinHeight(0, true),
					$css('display', 'none'),
				]),
				submitButton(color, text(label).all([
					fonts.bebasNeue,
				])).all([
					link,
					clickThis(function (ev, disable) {
						var enable = disable();
						cb(enable);
					}),
				]),
			]);
		},
	};
	return prettyForms;
});
define('registerView', [
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
		var submit = prettyForms.submit(black, 'Submit', function (enable) {
			auth.grecaptchaP.then(function (grecaptcha) {
				var grecaptchaResponse = grecaptcha.getResponse();
				if (latestModel === undefined || grecaptchaResponse === '') {
					fillOutAllFields.push(true);
					enable();
				}
				else if (latestModel.password !== latestModel.confirmPassword) {
					passwordsDoNotMatch.push(true);
					enable();
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
					loginWithFacebook(),
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
						stack({
							gutterSize: separatorSize,
						}, [
							paragraph('Success!').all([
								fonts.ralewayThinBold,
							]),
							paragraph('Please check your email to confirm your email address.').all([
								fonts.ralewayThinBold,
							]),
						]),
					], registeredViewIndex).all([
						withMinWidth(300, true),
					]),
				])),
				wireChildren(passThroughToFirst),
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
define('gafyDesignSmall', [
	'colors',
	'fonts',
], function (colors, fonts) {
	return function (gafyDesign) {
		return stack({}, [
			alignLRM({
				middle: image({
					src: gafyDesign.imageUrl,
					chooseWidth: 0,
					minHeight: 200,
				}),
			}),
			padding({
				all: 10,
			}, alignLRM({
				middle: text(gafyDesign.designDescription).all([
					fonts.h2,
				]),
			})),
		]).all([
			withMinWidth(300, true),
		]);
	};
});
define('chooseNonHoliday', [], function () {
	return function () {
		var equals = function (b1, b2) {
			return b1.month === b2.month &&
				b1.dayTens === b2.dayTens &&
				b1.dayOnes === b2.dayOnes;
		};
		var createDate = function () {
			var randomDate = new Date(new Date().getTime() * Math.random());
			
			var month = randomDate.getUTCMonth();
			var date = randomDate.getUTCDate();
			var dateTens = parseInt((date / 10) + '');
			var dateOnes = date % 10;
			return {
				month: month,
				dayTens: dateTens,
				dayOnes: dateOnes,
				date: randomDate,
			};
		};

		var matchesAnyHoliday = function (date) {
			if (date.month === 10) {
				if (date.dayTens >= 2) {
					return true;
				}
			}
			if (date.month === 11) {
				return true;
			}
			
			var holidays = [{
				month: 0,
				dayTens: 0,
				dayOnes: 1,
				reason: 'New Years',
			}, {
				month: 0,
				dayTens: 0,
				dayOnes: 2,
				reason: 'day after new years',
			}, {
				month: 3,
				dayTens: 0,
				dayOnes: 1,
				reason: 'April Fool\'s',
			}, {
				month: 6,
				dayTens: 0,
				dayOnes: 4,
				reason: 'Independence Day',
			}, {
				month: 8,
				dayTens: 0,
				dayOnes: 7,
				reason: 'labor day',
			}, {
				month: 9,
				dayTens: 3,
				dayOnes: 1,
				reason: 'halloween',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 1,
				reason: 'christmas eve eve eve eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 2,
				reason: 'christmas eve eve eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 3,
				reason: 'christmas eve eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 4,
				reason: 'christmas eve',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 5,
				reason: 'christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 6,
				reason: 'day after christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 7,
				reason: 'day after day after christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 8,
				reason: 'day after day after day after christmas',
			}, {
				month: 11,
				dayTens: 2,
				dayOnes: 9,
				reason: 'day after day after day after day after christmas',
			}, {
				month: 11,
				dayTens: 3,
				dayOnes: 0,
				reason: 'New Years eve eve',
			}, {
				month: 11,
				dayTens: 3,
				dayOnes: 1,
				reason: 'New Years eve',
			}];

			return holidays.filter(function (h) {
				return equals(h, date);
			}).length > 0;
		};

		var date = createDate();
		while (matchesAnyHoliday(date)) {
			date = createDate();
		}
		return date.date;
	};
});
define('storyPaginate', [
	'bar',
	'colors',
	'fonts',
	'separatorSize',
], function (bar, colors, fonts, separatorSize) {
	var paginate = function (f) {
		return function (config, cs) {
			var pages = [];
			for (var i = 0; i < cs.length; i += config.perPage) {
				pages.push(cs.slice(i, i + config.perPage));
			}
			if (pages.length === 0) {
				pages.push([]);
			}
			return f(pages, config.pageS);
		};
	};

	return paginate(function (pages, iS) {
		var once = false;
		return componentStream(iS.map(function (i) {
			var pageSelector = alignLRM({
				middle: sideBySide({
					gutterSize: separatorSize,
				}, pages.map(function (_, pageIndex) {
					var str = '' + (pageIndex + 1);
					return (i === pageIndex) ? text(str) : text(str).all([
						withFontColor(colors.linkBlue),
						$css('text-decoration', 'underline'),
						link,
						clickThis(function () {
							iS.push(pageIndex);
						}),
					]);
				})),
			});
			return stack({
				gutterSize: separatorSize,
			}, [
				pageSelector,
				stack({
					gutterSize: separatorSize,
				}, intersperse(pages[i], bar.horizontal(1, colors.middleGray))),
				pageSelector,
			]).all([
				function (index, context) {
					if (once) {
						var top = -50 + context.topAccum.lastValue() + context.top.lastValue();
						$('body').animate({scrollTop: top}, 300);
					}
					once = true;
				},
			]);
		}));
	});
});
define('areYouSure', [
	'fonts',
	'separatorSize',
	'submitButton',
], function (fonts, separatorSize, submitButton) {
	return function (config) {
		config = config || {};
		config.text = config.text || 'Are you sure?';
		config.yesText = config.yesText || 'Yes';
		config.noText = config.noText || 'No';
		config.onYes = config.onYes || function () {};
		config.onNo = config.onNo || function () {};

		var instanceD = Q.defer();

		var destroyInstance = function () {
			instanceD.promise.then(function (instance) {
				instance.$el.css('opacity', 0);
				setTimeout(function () {
					instance.destroy();
				}, 200);
			});
		};

		var c = extendToWindowBottom(alignLRM({
			middle: alignTBM({
				middle: stack({
					gutterSize: separatorSize,
				}, [
					paragraph(config.text, 300).all([
						fonts.h1,
						fonts.ralewayThinBold,
						$css('text-align', 'center'),
					]),
					alignLRM({
						left: submitButton(black, text(config.noText).all([
							fonts.bebasNeue,
						])).all([
							link,
							clickThis(function () {
								config.onNo();
								destroyInstance();
							}),
						]),
						right: submitButton(black, text(config.yesText).all([
							fonts.bebasNeue,
						])).all([
							link,
							clickThis(function () {
								config.onYes();
								destroyInstance();
							}),
						]),
					}),
				]),
			}),
		})).all([
			$css('position', 'fixed'),
			function (instance) {
				instance.$el.css('opacity', 0);
				setTimeout(function () {
					instance.$el.css('transition', 'opacity 0.2s')
						.css('opacity', 1);
				});
			},
		]);

		instanceD.resolve(rootComponent(c));
	};
});
define('domain', [], function () {
	// return 'http://71.89.76.184';
	return 'https://www.holibirthday.com';
});
define('app', [
	'bar',
	'colors',
	'footer',
	'header',
	'pageRoutes',
	'separatorSize',
], function (bar, colors, footer, header, pageRoutes, separatorSize) {
	var page = extendToWindowBottom(alignTBM({
		top: fixedHeaderBody({}, header, stack({}, [
			bar.horizontal(separatorSize),
			route(pageRoutes),
			bar.horizontal(separatorSize),
		])),
		bottom: footer,
	})).all([
		withBackgroundColor(colors.pageBackgroundColor),
	]);
	return page;
});
define('submitButton', [], function () {
	return function (color, c) {
		if (!c) {
			debugger;
		}
		return border(color, {
			all: 2,
			radius: 5,
		}, padding({
			all: 8,
			top: 10,
		}, alignLRM({
			middle: alignTBM({
				middle: c,
			}),
		})));
	};
});
window.app = function () {
	if (-1 === window.location.origin.indexOf('holibirthdaygift')) {
		require(['app'], function (app) {
			rootComponent(app);
		});
	}
	else {
		require([
			'gift',
			'header',
			'footer',
		], function (gift, header, footer) {
			rootComponent(header.all([
				$addClass('reset'),
				$css('z-index', 100),
				$css('position', 'fixed'),
			]));
			var $footerContainer = $(document.createElement('div'))
				.appendTo($('#footer'))
				.css('position', 'relative');
			rootComponent(footer.all([
				$addClass('reset'),
				$css('z-index', 100),
			]), {
				$el: $footerContainer,
			});
			var $giftContainer = $(document.createElement('div'))
				.prependTo('#content')
				.css('position', 'relative');
			rootComponent(gift, {
				$el: $giftContainer,
			});
		});
	}
};
define('cart', [], function () {
	var cartStorageName = 'shoppingCart';
	var wishlistStorageName = 'wishlist';
	var cartItems = JSON.parse(window.localStorage.getItem(cartStorageName)) || [];
	var wishlistItems = JSON.parse(window.localStorage.getItem(wishlistStorageName)) || [];
	
	return {
		items: cartItems,
		wishlistItems: wishlistItems,
		addItem: function (item) {
			cartItems.push(item);
			window.localStorage.setItem(cartStorageName, JSON.stringify(cartItems));
		},
		removeItem: function (index) {
			cartItems.splice(index, 1);
			window.localStorage.setItem(cartStorageName, JSON.stringify(cartItems));
		},
		editItem: function (index, item) {
			cartItems[index] = item;
			window.localStorage.setItem(cartStorageName, JSON.stringify(cartItems));
		},
		addWishlistItem: function (item) {
			wishlistItems.push(item);
			window.localStorage.setItem(wishlistStorageName, JSON.stringify(wishlistItems));
		},
		removeWishlistItem: function (index) {
			wishlistItems.splice(index, 1);
			window.localStorage.setItem(wishlistStorageName, JSON.stringify(wishlistItems));
		},
		editWishlistItem: function (index, item) {
			wishlistItems[index] = item;
			window.localStorage.setItem(wishlistStorageName, JSON.stringify(wishlistItems));
		},
	};
});
define('gafyDesignRow', [
	'fonts',
	'separatorSize',
], function (fonts, separatorSize) {
	return function (gafyDesign) {
		return grid({
			handleSurplusWidth: giveToSecond,
		}, [
			alignTBM({
				middle: image({
					src: gafyDesign.imageUrl,
					minWidth: 300,
					chooseHeight: 0,
				}),
			}),
			alignTBM({
				middle: padding({
					left: 30,
					right: 30,
				}, stack({
					gutterSize: separatorSize,
				}, [
					text(gafyDesign.designDescription).all([
						fonts.ralewayThinBold,
						$css('font-size', 40),
					]),
				])).all([
					withMinWidth(300, true),
				]),
			}),
		]);
	};
});
define('contactsView', [
	'areYouSure',
	'bar',
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'defaultFormFor',
	'domain',
	'fonts',
	'holibirthdayRow',
	'meP',
	'separatorSize',
	'signInForm',
	'signInStream',
	'socialMedia',
	'submitButton',
], function (areYouSure, bar, bodyColumn, colors, confettiBackground, db, defaultFormFor, domain, fonts, holibirthdayRow, meP, separatorSize, signInForm, signInStream, socialMedia, submitButton) {
	return promiseComponent(meP.then(function (me) {
		if (!me) {
			return stack({
				gutterSize: separatorSize,
			}, [
				confettiBackground(bodyColumn(holibirthdayRow(text('Contacts').all([
					fonts.ralewayThinBold,
					fonts.h1,
				])))),
				bodyColumn(paragraph('You must sign in to add contacts').all([
					fonts.bebasNeue,
					$css('font-size', '30px'),
					link,
					clickThis(function (ev) {
						signInStream.push(true);
						ev.stopPropagation();
					}),
				])),
			]);
		}
		var now = new Date();
		
		var max = 365 * 24 * 60 * 60 * 1000;
		var howLongUntilDate = function (date) {
			if (!date) {
				return max;
			}
			var nowThatMonth = new Date(now);
			nowThatMonth.setUTCMonth(date.getUTCMonth());
			nowThatMonth.setUTCDate(date.getUTCDate());
			
			var howLong = nowThatMonth.getTime() - now.getTime();
			if (howLong < 0) {
				howLong += max;
			}
			return howLong;
		};

		return socialMedia.facebook.api('/me/friends', 'get', {}).then(function (friends) {
			var ids = (friends.data && friends.data.map(function (friend) {
				return friend.id;
			})) || [];
			return $.ajax({
				type: 'post',
				url: '/userIdsByFacebookIds',
				data: JSON.stringify(ids),
				contentType: 'application/json',
			}).then(function (userIds) {
				return Q.all([
					db.contactOtherUser.find({
						user: me._id,
					}),
					db.contactCustom.find({
						user: me._id,
					}),
				]).then(function (results) {
					var cousS = Stream.once(results[0]);
					var ccsS = Stream.once(results[1]);
					var $orS = cousS.map(function (cous) {
						return userIds.map(function (userId) {
							return {
								user: userId,
							};
						}).concat(cous.map(function (cou) {
							return {
								user: cou.otherUser,
							};
						}));
					});
					return componentStream($orS.map(function ($or) {
						return promiseComponent(Q.all([
							db.profile.find({
								$or: $or,
							}),
							db.holibirthday.find({
								$or: $or,
							}),
						]).then(function (results) {
							var profiles = results[0];
							var holibirthdays = results[1];

							var couRowsS = cousS.map(function (cous) {
								return cous.map(function (cou) {
									var profile = profiles.filter(function (p) {
										return p.user === cou.otherUser;
									})[0];
									var holibirthday = holibirthdays.filter(function (h) {
										return h.user === profile.user;
									})[0];
									return {
										row: [
											linkTo('#!user/' + profile.user, text(profile.firstName + ' ' + profile.lastName).all([
												fonts.ralewayThinBold,
											])),
											text(profile.birthday ? 'Born on<br>' + moment(profile.birthday).utc().format('MMMM Do') : '&nbsp;').all([
												fonts.ralewayThinBold,
												$css('text-align', 'center'),
											]),
											text(holibirthday ? 'Holiborn on<br>' + moment(holibirthday.date).utc().format('MMMM Do') : '&nbsp;').all([
												fonts.ralewayThinBold,
												$css('text-align', 'center'),
											]),
											text(profile.email || '&nbsp;').all([
												fonts.ralewayThinBold,
												$css('text-align', 'center'),
											]),
											text('(remove this contact)').all([
												fonts.ralewayThinBold,
											]).all([
												link,
												clickThis(function () {
													areYouSure({
														onYes: function () {
															db.contactOtherUser.remove({
																user: me._id,
																otherUser: profile.user,
															}).then(function () {
																cousS.push(cousS.lastValue().filter(function (c) {
																	return c._id !== cou._id;
																}));
															});
														},
													});
												}),
											]),
										].map(function (c) {
											return alignTBM({
												middle: c,
											});
										}),
										howLong: Math.min(howLongUntilDate(profile.birthday), howLongUntilDate(holibirthday && holibirthday.date)),
									};
								});
							});
							var ccRowsS = ccsS.map(function (ccs) {
								return ccs.map(function (cc) {
									return {
										row: [
											text(cc.name).all([
												fonts.ralewayThinBold,
											]),
											text(cc.birthday ? 'Born on<br>' + moment(cc.birthday).utc().format('MMMM Do') : '&nbsp;').all([
												fonts.ralewayThinBold,
												$css('text-align', 'center'),
											]),
											nothing,
											text(cc.email || '&nbsp;').all([
												fonts.ralewayThinBold,
												$css('text-align', 'center'),
											]),
											text('(remove this contact)').all([
												fonts.ralewayThinBold,
											]).all([
												link,
												clickThis(function () {
													areYouSure({
														onYes: function () {
															db.contactCustom.remove({
																_id: cc._id,
															}).then(function () {
																ccsS.push(ccsS.lastValue().filter(function (c) {
																	return c._id !== cc._id;
																}));
															});
														},
													});
												}),
											]),
										].map(function (c) {
											return alignTBM({
												middle: c,
											});
										}),
										howLong: howLongUntilDate(cc.birthday),
									};
								});
							});
							var rowsS = Stream.combine([
								couRowsS,
								ccRowsS,
							], function (couRows, ccRows) {
								return couRows.concat(ccRows).sort(function (r1, r2) {
									return r2.howLong - r1.howLong;
								}).map(function (r) {
									return r.row;
								});
							});
							return stack({
								gutterSize: separatorSize,
							}, [
								confettiBackground(bodyColumn(holibirthdayRow(text('Contacts').all([
									fonts.ralewayThinBold,
									fonts.h1,
								])))),
								bodyColumn(alignLRM({
									middle: componentStream(rowsS.map(function (rows) {
										return defaultFormFor.contactCustom({
											user: me._id,
											name: '',
											birthday: null,
											email: '',
										}, function (newContactS, newContactFields) {
											return table({
												paddingSize: separatorSize,
											}, rows.concat([[
												newContactFields.name,
												newContactFields.birthday,
												nothing,
												newContactFields.email,
												alignTBM({
													middle: submitButton(black, text('Add Contact').all([
														fonts.bebasNeue,
													])).all([
														link,
														clickThis(function (ev, disable) {
															var enable = disable();
															db.contactCustom.insert(newContactS.lastValue()).then(function (newContact) {
																ccsS.push(ccsS.lastValue().concat([newContact]));
																enable();
															});
														}),
													]),
												}),
											]]));
										});
									})),
								})),
								bar.horizontal(1).all([
									withBackgroundColor(black),
								]),
								componentStream(cousS.map(function (cous) {
									var additionalFacebookFriends = userIds.filter(function (userId) {
										return cous.filter(function (cou) {
											return userId === cou.otherUser;
										}).length === 0;
									});
									if (additionalFacebookFriends.length === 0) {
										return nothing;
									}
									return bodyColumn(stack({
										gutterSize: separatorSize,
										collapseGutters: true,
									}, [
										me.facebookId ? alignLRM({
											middle: text('Facebook friends who use Holibirthday').all([
												fonts.h2,
											]),
										}) : nothing,
										alignLRM({
											middle: table({
												paddingSize: separatorSize,
											}, additionalFacebookFriends.map(function (userId) {
												var profile = profiles.filter(function (p) {
													return p.user === userId;
												})[0];
												var holibirthday = holibirthdays.filter(function (h) {
													return h.user === profile.user;
												})[0];
												return [
													linkTo('#!user/' + profile.user, text(profile.firstName + ' ' + profile.lastName).all([
														fonts.ralewayThinBold,
													])),
													text(profile.birthday ? 'Born on<br>' + moment(profile.birthday).utc().format('MMMM Do') : '&nbsp;').all([
														fonts.ralewayThinBold,
														$css('text-align', 'center'),
													]),
													text(holibirthday ? 'Holiborn on<br>' + moment(holibirthday.date).utc().format('MMMM Do') : '&nbsp;').all([
														fonts.ralewayThinBold,
														$css('text-align', 'center'),
													]),
													text(profile.email || '&nbsp;').all([
														fonts.ralewayThinBold,
														$css('text-align', 'center'),
													]),
													alignTBM({
														middle: submitButton(black, text('Add Contact').all([
															fonts.bebasNeue,
														])).all([
															link,
															clickThis(function () {
																areYouSure({
																	onYes: function () {
																		db.contactOtherUser.insert({
																			user: me._id,
																			otherUser: profile.user,
																		}).then(function (cou) {
																			cousS.push(cousS.lastValue().concat([cou]));
																		});
																	},
																});
															}),
														]),
													}),
												];
											})),
										}),
									]));
								})),
								alignLRM({
									middle: submitButton(socialMedia.facebook.color, sideBySide({
										gutterSize: separatorSize,
									}, [
										text(socialMedia.facebook.icon).all([
											$css('font-size', '20px'),
										]),
										text(me.facebookId ? 'Invite More Facebook Friends' : 'Invite Facebook Friends').all([
											fonts.bebasNeue,
										]),
									])).all([
										withFontColor(socialMedia.facebook.color),
										link,
										clickThis(function () {
											if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile|Opera Mini/i.test(navigator.userAgent)) {
												FB.ui({
													display: 'popup',
													method: 'share',
													href: location.origin,
												});
											}
											else {
												FB.ui({
													display: 'popup',
													method: 'send',
													link: location.origin,
												});
											}
										}),
									]),
								}),
							]);
						}));
					}));
				});
			});
		});
	}));
});
define('formatPrice', [], function () {
	return function (costInCents) {
		return '$' + Math.floor(costInCents / 100) + '.' + (costInCents % 100);
	};
});
define('gafyStyleSmall', [
	'colors',
	'fonts',
], function (colors, fonts) {
	return function (gafyStyle) {
		return border(colors.middleGray, {
			all: 1,
		}, stack({}, [
			alignLRM({
				middle: image({
					src: gafyStyle.imageUrl || './content/man.png',
					chooseWidth: 0,
					minHeight: 200,
				}),
			}),
			padding({
				all: 10,
			}, alignLRM({
				middle: text(gafyStyle.styleDescription).all([
					fonts.h2,
				]),
			})),
		])).all([
			withMinWidth(300, true),
		]);
	};
});
define('formFieldsFor', [], function () {
	var fromTable = function (table) {
		return function (object, cb) {
			return form.all([
				child(cb({})),
				wireChildren(passThroughToFirst),
			])
		};
	};

	var formFieldsFor = [];
	
	schema.map(function (table) {
		formFieldsForTable = fromTable(table);
		formFieldsFor.push(table);
		formFieldsFor[table.name] = table;
	});

	return formFieldsFor;
});
define('adminView', [
	'areYouSure',
	'bar',
	'bodyColumn',
	'colors',
	'db',
	'defaultFormFor',
	'fonts',
	'formLayouts',
	'forms',
	'gafyDesignSmall',
	'gafyStyleSmall',
	'months',
	'prettyForms',
	'separatorSize',
	'storiesP',
	'submitButton',
], function (areYouSure, bar, bodyColumn, colors, db, defaultFormFor, fonts, formLayouts, forms, gafyDesignSmall, gafyStyleSmall, months, prettyForms, separatorSize, storiesP, submitButton) {
	var tab = function (name) {
		var body = padding({
			top: 10,
			bottom: 10,
			left: 10,
			right: 10,
		}, paragraph(name, 0).all([
			fonts.h3,
		]));
		
		return {
			left: border(colors.middleGray, {
				top: 1,
				left: 1,
			}, padding({
				left: 1,
				right: 2,
			}, body)),
			right: border(colors.middleGray, {
				top: 1,
				right: 1,
			}, padding({
				left: 2,
				right: 1,
			}, body)),
			selected: border(colors.middleGray, {
				top: 1,
				left: 1,
				right: 1,
			}, padding({
				all: 1,
			}, body)),
		};
	};
	var content = function (stuff) {
		return border(colors.middleGray, {
			all: 1,
		}, padding({
			all: separatorSize,
		}, stuff));
	};

	var dailyThemesEditor = promiseComponent(db.dailyTheme.findOne({}).then(function (theme) {
		theme = theme || {};
		return defaultFormFor.dailyTheme({
			_id: theme._id || null,
			type: theme.type || schema.dailyTheme.fields.type.options.featuredStory,
			storyId: theme.storyId || null,
			storyText: theme.storyText || '',
			giftId: theme.giftId || null,
			giftText: theme.giftText || '',
			pollTitle: theme.pollTitle || '',
			pollDescription: theme.pollDescription || '',
			pollChoices: theme.pollChoices || '',
			pollImage: theme.pollImage || './content/man.png',
			someTextTitle: theme.someTextTitle || '',
			someTextText: theme.someTextText || '',
			someTextImage: theme.someTextImage || './content/man.png',
		}, function (dailyThemeS, fields) {
			var featuredStoryEditor = stack({
				gutterSize: separatorSize,
			}, [
				fields.storyId,
				fields.storyText,
			]);
			var featuredGiftEditor = stack({
				gutterSize: separatorSize,
			}, [
				fields.giftId,
				fields.giftText,
			]);
			var pollEditor = stack({
				gutterSize: separatorSize,
			}, [
				fields.pollTitle,
				fields.pollDescription,
				fields.pollChoices,
				fields.pollImage,
			]);
			var someTextEditor = stack({
				gutterSize: separatorSize,
			}, [
				fields.someTextTitle,
				fields.someTextText,
				fields.someTextImage,
			]);
			
			var saveButton = alignLRM({
				left: submitButton(black, text('Publish')).all([
					link,
					clickThis(function () {
						var theme = dailyThemeS.lastValue();
						delete theme._id;
						db.dailyTheme.insert(theme).then(function () {
							window.location.hash = '#!';
							window.location.reload();
						});
					}),
				]),
			});
			
			return stack({
				gutterSize: separatorSize,
			}, [
				text('Daily Theme').all([
					fonts.h1,
				]),
				fields.type,
				componentStream(dailyThemeS.map(function (dailyTheme) {
					switch (dailyTheme.type) {
					case schema.dailyTheme.fields.type.options.featuredStory:
						return featuredStoryEditor;
					case schema.dailyTheme.fields.type.options.featuredGift:
						return featuredGiftEditor;
					case schema.dailyTheme.fields.type.options.poll:
						return pollEditor;
					case schema.dailyTheme.fields.type.options.someText:
						return someTextEditor;
					}
				})),
				saveButton,
			]);
		});
	}));

	
	var copyEditor = promiseComponent(db.siteCopyItem.find({}).then(function (siteCopyItems) {
		var copyItemEditor = function (uniqueName, formElement) {
			var item = siteCopyItems.filter(function (item) {
				return item.uniqueName === uniqueName;
			})[0] || {
				uniqueName: uniqueName,
				value: formElement === 'imageUpload' ? '/content/man.png' : '',
			};

			var valueS = Stream.once(item.value);
			var modifiedS = valueS.map(function () {
				return true;
			});
			modifiedS.push(false);
			
			return stack({
				gutterSize: separatorSize,
			}, [
				prettyForms[formElement || 'input']({
					name: uniqueName,
					stream: valueS,
				}),
				alignLRM({
					left: sideBySide({
						gutterSize: separatorSize,
					}, [
						submitButton(black, text('Save').all([
							fonts.bebasNeue,
						])).all([
							link,
							clickThis(function () {
								item.value = valueS.lastValue();
								(item._id ?
								 db.siteCopyItem.update({
									 _id: item._id,
								 }, item) :
								 db.siteCopyItem.insert(item)).then(function (res) {
									 item._id = item._id || res._id;
									 modifiedS.push(false);
								 });
							}),
						]),
						componentStream(modifiedS.map(function (modified) {
							return modified ? alignTBM({
								middle: text('(unsaved)'),
							}) : nothing;
						})),
					]),
				}),
			]);
		};
		
		return tabs([{
			tab: tab('Home Page'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Home Tagline'),
				copyItemEditor('Home Share Your Story'),
				copyItemEditor('Home Claim Your Holibirthday'),
				copyItemEditor('Home Find Friends'),
			])),
		}, {
			tab: tab('Edit Story'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Edit Story Title'),
				copyItemEditor('Edit Story Smaller Title'),
				copyItemEditor('Edit Story Instructions', 'plainTextarea'),
				copyItemEditor('Edit Story Submit Instructions'),
			])),
		}, {
			tab: tab('Gifts'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Gifts Title'),
				copyItemEditor('Gifts Cart'),
				copyItemEditor('Gifts Wishlist'),
			])),
		}, {
			tab: tab('Causes'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Causes Title'),
				copyItemEditor('Causes Donate Now'),
				copyItemEditor('Causes', 'textarea'),
				copyItemEditor('Causes Image', 'imageUpload'),
			])),
		}, {
			tab: tab('Site Header'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Header Browse'),
				copyItemEditor('Header Gifts'),
				copyItemEditor('Header Causes'),
				copyItemEditor('Header My Profile'),
				copyItemEditor('Header Contacts'),
				copyItemEditor('Header Sign In'),
				copyItemEditor('Header Sign Out'),
				copyItemEditor('Header Register'),
				copyItemEditor('Header Admin'),
			])),
		}, {
			tab: tab('Order Email'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Order Confirmation Email: From'),
				copyItemEditor('Order Confirmation Email: From Name'),
				copyItemEditor('Order Confirmation Email: Subject'),
				copyItemEditor('Order Confirmation Email: Text ( {{orderNumber}} includes order number)', 'plainTextarea'),
			])),
		}, {
			tab: tab('Donation Email'),
			content: content(stack({
				gutterSize: separatorSize,
			}, [
				copyItemEditor('Donate Confirmation Email: From'),
				copyItemEditor('Donate Confirmation Email: From Name'),
				copyItemEditor('Donate Confirmation Email: Subject'),
				copyItemEditor('Donate Confirmation Email: Text ( {{donationNumber}} includes donation number)', 'plainTextarea'),
			])),
		}]);
	}));
	

	var famousBirthdaySmall = function (famousBirthday) {
		return stack({}, [
			text(famousBirthday.name).all([
				fonts.h3,
			]),
		]);
	};


	var famousBirthdays = promiseComponent(db.famousBirthday.find({}).then(function (famousBirthdays) {
		var famousBirthdaysS = Stream.once(famousBirthdays);

		var famousBirthdayFormLayout = formLayouts.stack({
			formBuilder: defaultFormFor.famousBirthday,
			stackConfig: {
				gutterSize: separatorSize,
			},
			fields: [
				'name',
				'birthday',
				'imageUrl',
			],
		});

		var tabS = Stream.once(0);

		var editingFamousBirthdayIdS = Stream.once(famousBirthdays.length > 0 ? famousBirthdays[0]._id : null);
		var editingFamousBirthdayS = Stream.combine([
			famousBirthdaysS,
			editingFamousBirthdayIdS,
		], function (famousBirthdays, _id) {
			return famousBirthdays.filter(function (famousBirthday) {
				return famousBirthday._id === _id;
			})[0] || {};
		});
		return stack({
			gutterSize: separatorSize,
		}, [
			tabs([{
				tab: tab('Famous Birthdays List'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					text('Famous Birthdays List').all([
						fonts.h2,
					]),
					componentStream(famousBirthdaysS.map(function (famousBirthdays) {
						var people = [];
						famousBirthdays.map(function (famousBirthday) {
							var birthday = moment(famousBirthday.birthday);
							var month = birthday.month();
							var day = birthday.date();
							people[month] = people[month] || [[]];
							people[month][day] = people[month][day] || [];
							people[month][day].push(famousBirthday);
						});
						var whichMonthS = Stream.once(months[0]);
						return stack({
							gutterSize: separatorSize,
						}, [
							prettyForms.select({
								name: 'Month',
								options: months,
								stream: whichMonthS,
							}),
							componentStream(whichMonthS.map(function (monthName) {
								var monthIndex = months.indexOf(monthName);
								var daysInMonth = people[monthIndex];
								return stack({
									gutterSize: separatorSize,
								}, daysInMonth.map(function (famousBirthdays, dayIndex) {
									return dayIndex === 0 ? nothing : stack({}, [
										text(months[monthIndex] + ' ' + dayIndex).all([
											fonts.h2,
										]),
										stack({}, famousBirthdays.map(function (famousBirthday) {
											return famousBirthdaySmall(famousBirthday).all([
												link,
												clickThis(function () {
													editingFamousBirthdayIdS.push(famousBirthday._id);
													tabS.push(2);
												}),
											]);
										})),
									]);
								}));
							})),
						]);
					})),
				])),
			}, {
				tab: tab('Add Famous Birthday'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					text('Add Famous Birthday').all([
						fonts.h2,
					]),
					famousBirthdayFormLayout({
						name: '',
						birthday: new Date(),
						description: '',
						imageUrl: './content/man.png',
					}, function (famousBirthdayS) {
						var mustFillFields = Stream.once(0);
						famousBirthdayS.onValue(function () {
							mustFillFields.push(0);	
						});
						
						return stack({
							gutterSize: separatorSize,
						}, [
							toggleComponent([nothing, text('You must fill out all fields')], mustFillFields),
							alignLRM({
								left: submitButton(black, text('Add Famous Birthday')).all([
									link,
									clickThis(function () {
										var famousBirthday = famousBirthdayS.lastValue();
										if (!famousBirthday) {
											mustFillFields.push(1);
											return;
										}
										famousBirthday.birthday = moment(moment(famousBirthday.birthday).utc().format('YYYY-MM-DD')).format();
										db.famousBirthday.insert(famousBirthday).then(function (famousBirthday) {
											famousBirthdaysS.push(famousBirthdaysS.lastValue().concat([famousBirthday]));
											tabS.push(0);
										});
									}),
								]),
							}),
						]);
					}),
				])),
			}, {
				tab: tab('Edit Famous Birthday'),
				content: content(stack({
					gutterSize: separatorSize,
				}, [
					componentStream(famousBirthdaysS.map(function (famousBirthdays) {
						return prettyForms.select({
							name: 'Editing Famous Birthday',
							options: famousBirthdays.map(function (famousBirthday) {
								return {
									name: famousBirthday.name,
									value: famousBirthday._id,
								};
							}),
							stream: editingFamousBirthdayIdS,
						}).all([
							changeThis(function (ev) {
								editingFamousBirthdayIdS.push($(ev.target).val());
							}),
						]);
					})),
					text('Edit Famous Birthday').all([
						fonts.h2,
					]),
					componentStream(editingFamousBirthdayS.map(function (famousBirthday) {
						return famousBirthdayFormLayout(famousBirthday, function (famousBirthdayS) {
							var mustFillFields = Stream.once(0);
							famousBirthdayS.onValue(function () {
								mustFillFields.push(0);	
							});
							
							return stack({
								gutterSize: separatorSize,
							}, [
								toggleComponent([nothing, text('You must fill out all fields')], mustFillFields),
								alignLRM({
									left: sideBySide({
										gutterSize: separatorSize,
									}, [
										submitButton(black, text('Save Famous Birthday').all([
											fonts.bebasNeue,
										])).all([
											link,
											clickThis(function () {
												var famousBirthday = famousBirthdayS.lastValue();
												if (!famousBirthday) {
													mustFillFields.push(1);
													return;
												}
												famousBirthday.birthday = moment(moment(famousBirthday.birthday).utc().format('YYYY-MM-DD')).format();
												db.famousBirthday.update({
													_id: famousBirthday._id
												}, famousBirthday).then(function () {
													var famousBirthdays = famousBirthdaysS.lastValue().slice(0);
													for (var i = 0; i < famousBirthdays.length; i++) {
														if (famousBirthdays[i]._id === famousBirthday._id) {
															famousBirthdays[i] = famousBirthday;
														}
													}
													famousBirthdaysS.push(famousBirthdays);
													tabS.push(0);
												});
											}),
										]),
										submitButton(black, text('Delete Famous Birthday')).all([
											link,
											clickThis(function () {
												areYouSure({
													onYes: function () {
														var famousBirthday = famousBirthdayS.lastValue();
														if (!famousBirthday) {
															mustFillFields.push(1);
															return;
														}
														db.famousBirthday.remove({
															_id: famousBirthday._id
														}, famousBirthday).then(function () {
															var famousBirthdays = famousBirthdaysS.lastValue().slice(0);
															for (var i = 0; i < famousBirthdays.length; i++) {
																if (famousBirthdays[i]._id === famousBirthday._id) {
																	famousBirthdays.splice(i, 1);
																}
															}
															famousBirthdaysS.push(famousBirthdays);
															tabS.push(0);
														});
													},
												});
											}),
										]),
									]),
								}),
							]);
						});
					})),
				])),
			}], tabS),
		]);
	}));


	var mailchimpTemplates = promiseComponent($.ajax({
		url: '/mailchimp/templates',
	}).then(function (templates) {
		var templateOptions = templates.map(function (template) {
			return {
				name: template.name,
				value: template.id,
			};
		});
		templateOptions.sort(function (o1, o2) {
			return o1.name.localeCompare(o2.name);
		});
		return db.mailchimpTemplate.find({}).then(function (mailchimpTemplates) {
			return alignLRM({
				left: stack({
					gutterSize: separatorSize,
				}, [{
					name: 'Holibirthday in Three Weeks',
					event: schema.mailchimpTemplate.fields.event.options.holibirthdayInThreeWeeks,
				}, {
					name: 'Holibirthday Tomorrow',
					event: schema.mailchimpTemplate.fields.event.options.holibirthdayTomorrow,
				}, {
					name: 'Friend\'s Holibirthday in Three Weeks',
					event: schema.mailchimpTemplate.fields.event.options.friendsHolibirthdayInThreeWeeks,
				}, {
					name: 'Friend\'s Holibirthday Tomorrow',
					event: schema.mailchimpTemplate.fields.event.options.friendsHolibirthdayTomorrow,
				}, {
					name: 'Your Story Deleted',
					event: schema.mailchimpTemplate.fields.event.options.storyDeleted,
				}, {
					name: 'Your Comment Deleted',
					event: schema.mailchimpTemplate.fields.event.options.commentDeleted,
				}].map(function (config) {
					var mailchimpTemplateStreams = Stream.splitObject(mailchimpTemplates.filter(function (t) {
						return t.event === config.event;
					})[0] || {
						event: config.event,
						mailchimpTemplateId: '',
						toName: '',
						fromName: '',
						subject: '',
					});

					var mailchimpTemplateS = Stream.combineObject(mailchimpTemplateStreams);

					var unsavedS = Stream.once(false);
					var firstValueMapped = false;
					mailchimpTemplateS.map(function () {
						if (firstValueMapped) {
							unsavedS.push(true);
						}
						firstValueMapped = true;
					});

					return stack({
						gutterSize: separatorSize,
					}, [
						text(config.name).all([
							fonts.h2,
						]),
						forms.selectBox({
							options: templateOptions,
							stream: mailchimpTemplateStreams.mailchimpTemplateId,
						}),
						prettyForms.input({
							name: 'toName',
							stream: mailchimpTemplateStreams.toName,
						}),
						prettyForms.input({
							name: 'fromName',
							stream: mailchimpTemplateStreams.fromName,
						}),
						prettyForms.input({
							name: 'subject',
							stream: mailchimpTemplateStreams.subject,
						}),
						sideBySide({
							gutterSize: separatorSize,
						}, [
							submitButton(black, text('Save').all([
								fonts.bebasNeue,
							])).all([
								link,
								clickThis(function (ev, disable) {
									var enable = disable();
									db.mailchimpTemplate.insertOrUpdate(mailchimpTemplateS.lastValue()).then(function () {
										enable();
										unsavedS.push(false);
									});
								}),
							]),
							alignTBM({
								middle: componentStream(unsavedS.map(function (u) {
									return u ? text('(unsaved)') : nothing;
								})),
							}),
						]),
					]);
				})),
			})
		});
	}));
										  
	var mailchimpLists = promiseComponent($.ajax({
		url: '/mailchimp/lists',
	}).then(function (lists) {
		var listOptions = lists.map(function (list) {
			return {
				name: list.name,
				value: list.id,
			};
		});
		listOptions.sort(function (o1, o2) {
			return o1.name.localeCompare(o2.name);
		});
		return db.mailchimpList.find({}).then(function (mailchimpLists) {
			return alignLRM({
				left: stack({
					gutterSize: separatorSize,
				}, [{
					name: 'Holibirthers',
					internalType: 'holibirthers',
				}, {
					name: 'Friends of Holibirthers',
					internalType: 'friendsOfHolibirthers',
				}].map(function (config) {
					var mailchimpListStreams = Stream.splitObject(mailchimpLists.filter(function (l) {
						return l.mailchimpListType === config.internalType;
					})[0] || {
						mailchimpListType: config.internalType,
						mailchimpListId: '',
					});

					var mailchimpListS = Stream.combineObject(mailchimpListStreams);

					var unsavedS = Stream.once(false);
					var firstValueMapped = false;
					mailchimpListS.map(function () {
						if (firstValueMapped) {
							unsavedS.push(true);
						}
						firstValueMapped = true;
					});

					return stack({
						gutterSize: separatorSize,
					}, [
						text(config.name).all([
							fonts.h2,
						]),
						forms.selectBox({
							options: listOptions,
							stream: mailchimpListStreams.mailchimpListId,
						}),
						sideBySide({
							gutterSize: separatorSize,
						}, [
							submitButton(black, text('Save').all([
								fonts.bebasNeue,
							])).all([
								link,
								clickThis(function (ev, disable) {
									var enable = disable();
									db.mailchimpList.insertOrUpdate(mailchimpListS.lastValue()).then(function () {
										enable();
										unsavedS.push(false);
									});
								}),
							]),
							alignTBM({
								middle: componentStream(unsavedS.map(function (u) {
									return u ? text('(unsaved)') : nothing;
								})),
							}),
						]),
					]);
				})),
			});
		});
	}));


	return bodyColumn(stack({}, [
		bar.horizontal(separatorSize),
		tabs([{
			tab: tab('Daily Theme'),
			content: content(dailyThemesEditor),
		}, {
			tab: tab('Site Copy'),
			content: content(copyEditor),
		}, {
			tab: tab('Famous Birthdays'),
			content: content(famousBirthdays),
		}, {
			tab: tab('Mailchimp Templates'),
			content: content(mailchimpTemplates),
		}, {
			tab: tab('Mailchimp Lists'),
			content: content(mailchimpLists),
		}], Stream.once(0)),
	]));
});
define('adminP', [
	'db',
	'meP',
], function (db, meP) {
	return meP.then(function (me) {
		if (me) {
			return db.admin.findOne({
				user: me._id,
			});
		}
	});
});
define('socialMedia', [], function () {
	return (function () {
		var shareWindow = function (url) {
			var width  = 575,
				height = 400,
				left   = ($(window).width()  - width)  / 2,
				top    = ($(window).height() - height) / 2,
				opts   = 'status=1' +
                ',width='  + width  +
                ',height=' + height +
                ',top='    + top    +
                ',left='   + left;
			
			window.open(url, 'twitter', opts);
		};
		return {
			facebook: {
				icon: '<i\tclass="fa\tfa-facebook"></i>',
				color: color({
					r: 59,
					g: 89,
					b: 152,
				}),
				name: 'Facebook',
				shareVerb: 'share',
				shareThisPage: function () {
					return FB.ui({
						display: 'popup',
						method: 'share',
						href: location.href,
					});
				},
				api: function () {
					var args = Array.prototype.slice.call(arguments);
					var d = Q.defer();
					args[3] = function (result) {
						d.resolve(result);
					};
					FB.api.apply(null, args);
					return d.promise;
				},
			},
			twitter: {
				icon: '<i\tclass="fa\tfa-twitter"></i>',
				color: color({
					r: 0,
					g: 172,
					b: 237,
				}),
				name: 'Twitter',
				shareVerb: 'tweet',
				shareThisPage: function () {
					return shareWindow('https://twitter.com/intent/tweet?url=' + encodeURIComponent(location.href));
				},
				countShares: function () {
				},
			},
		};
	})();
});
define('storyDetailViewP', [
	'adminP',
	'areYouSure',
	'bar',
	'bodyColumn',
	'confettiBackground',
	'db',
	'fonts',
	'forms',
	'meP',
	'prettyForms',
	'profilesP',
	'separatorSize',
	'signInStream',
	'socialMedia',
	'socialMediaButton',
	'submitButton',
], function (adminP, areYouSure, bar, bodyColumn, confettiBackground, db, fonts, forms, meP, prettyForms, profilesP, separatorSize, signInStream, socialMedia, socialMediaButton, submitButton) {
	var storyCommentViewP = function (story) {
		return promiseComponent(meP.then(function (me) {
			if (!me) {
				return text('Sign in to comment').all([
					fonts.bebasNeue,
					link,
					clickThis(function (ev) {
						signInStream.push(true);
						ev.stopPropagation();
					}),
				]);
			}
			
			var comment = {
				user: me._id,
				story: story._id,
				text: '',
			};
			var commentStreams = Stream.splitObject(comment);
			var commentStream = Stream.combineObject(commentStreams);

			var latestComment;
			commentStream.onValue(function (comment) {
				latestComment = comment;
			});
			
			return form.all([
				child(stack({}, [
					stack({}, [
						forms.plainTextareaBox(commentStreams.text, 'text').all([
							$prop('rows', 6),
						]),
						alignLRM({
							left: prettyForms.submit(black, 'Post Comment', function () {
								db.comment.insert(latestComment).then(function () {
									window.location.reload();
								});
							}),
						}),
					].map(function (c) {
						return padding({
							top: 10,
						}, c);
					})),
				])),
				wireChildren(function (instance, context, i) {
					i.minHeight.pushAll(instance.minHeight);
					i.minWidth.pushAll(instance.minWidth);
					return [context];
				}),
			]);
		}));
	};

	var storyCommentsViewP = function (story) {
		return promiseComponent(db.comment.find({
			story: story._id,
		}).then(function (comments) {
			comments.sort(function (c1, c2) {
				return new Date(c2.createDate).getTime() - new Date(c1.createDate).getTime();
			});
			return profilesP.then(function (profiles) {
				return adminP.then(function (admin) {
					return stack({
						gutterSize: separatorSize * 2,
					}, comments.map(function (comment) {
						var profile = profiles.filter(function (profile) {
							return profile.user === comment.user;
						})[0];
						return sideBySide({
							handleSurplusWidth: giveToNth(2),
							gutterSize: separatorSize,
						}, [
							stack({
								gutterSize: separatorSize,
								collapseGutters: true,
							}, [
								linkTo('#!user/' + profile.user, image({
									src: profile.profileImageURL || './content/man.png',
									minWidth: 100,
									chooseHeight: true,
								})),
								linkTo('#!user/' + profile.user, text(profile.firstName + ' ' + profile.lastName)),
								admin ? text('(delete comment)').all([
									link,
									clickThis(function (ev) {
										ev.stopPropagation();
										areYouSure({
											onYes: function () {
												db.comment.remove({
													_id: comment._id,
												}).then(function () {
													window.location.reload();
												});
											},
										});
									}),
								]) : nothing,
							]),
							border(black, {
								all: 1,
							}, padding(10, text(comment.text))).all([
								withBackgroundColor(white),
							]),
						]);
					}));
				});
			});
		}));
	};

	var storySocialMediaButton = socialMediaButton(function (verb) {
		return verb + ' this story';
	});

	return function (story) {
		return promiseComponent(profilesP.then(function (profiles) {
			var profile = profiles.filter(function (p) {
				return p.user === story.user;
			})[0];
			return meP.then(function (me) {
				return adminP.then(function (admin) {
					return stack({
						gutterSize: separatorSize,
					}, [
						confettiBackground(bodyColumn(grid({
							handleSurplusWidth: giveToSecond,
						}, [
							alignTBM({
								middle: image({
									src: story.imageUrl || './content/man.png',
									minWidth: 300,
									chooseHeight: 0,
								}),
							}),
							alignTBM({
								middle: padding({
									left: 30,
									right: 30,
								}, stack({
									gutterSize: separatorSize / 2,
								}, [
									text(story.name).all([
										fonts.h1,
									]),
									linkTo('#!user/' + profile.user, paragraph('by ' + profile.firstName + ' ' + profile.lastName).all([
										fonts.h2,
									])),
									story.storyType ? text('category: ' + story.storyType).all([
										fonts.h3,
									]) : nothing,
									promiseComponent(db.storyTag.find({
										story: story._id,
									}).then(function (storyTags) {
										return storyTags.length > 0 ? sideBySide({
											handleSurplusWidth: giveToSecond,
										}, [
											text('tags: ').all([
												fonts.h3,
											]),
											grid({
												gutterSize: separatorSize / 2,
												useFullWidth: true,
											}, storyTags.map(function (t) {
												return text(t.tag).all([
													fonts.h3,
												]);
											})),
										]) : nothing;
									})),
								]))
							}).all([
								withMinWidth(300, true),
							]),
						]))),
						bodyColumn(stack({}, [
							div.all([
								componentName('story-detail-text'),
								function (instance) {
									var $text = $(story.text);
									$text.find('div').css('position', 'initial');
									$text.appendTo(instance.$el);
									instance.updateDimensions();
								},
							]),
						])),
						bodyColumn(sideBySide({
							gutterSize: separatorSize,
						}, [
							storySocialMediaButton(socialMedia.facebook),
							storySocialMediaButton(socialMedia.twitter),
						])),
						bodyColumn(storyCommentViewP(story)),
						bodyColumn(storyCommentsViewP(story)),
						bodyColumn(admin || (me && me._id === story.user) ? alignLRM({
							left: sideBySide({
								gutterSize: separatorSize,
							}, [
								linkTo('#!editStory/' + story._id, submitButton(black, text('Edit Story').all([
									fonts.bebasNeue,
								]))),
								submitButton(black, text('Delete Story').all([
									fonts.bebasNeue,
								])).all([
									link,
									clickThis(function () {
										return areYouSure({
											onYes: function () {
												db.story.remove({
													_id: story._id,
												}).then(function () {
													window.location.hash = '#!';
													window.location.reload();
												});
											}
										});
									}),
								]),
							]),
						}) : nothing),
					]);
				});
			});
		}));
	};
});
define('confirmEmailView', [
	'auth',
	'bodyColumn',
	'fonts',
], function (auth, bodyColumn, fonts) {
	return function (token) {
		var pageS = Stream.once(text('Confirming Email...').all([
			fonts.h1,
		]));
		auth.confirmEmail(token).then(function () {
			pageS.push(text('Confirmed!  You may now log in.').all([
				fonts.h1,
			]));
		}, function () {
			pageS.push(text('Invalid token.').all([
				fonts.h1,
			]));
		});
		return bodyColumn(componentStream(pageS));
	};
});
define('homeViewP', [
	'bar',
	'bodyColumn',
	'colors',
	'confettiBackground',
	'dailyTheme',
	'db',
	'fonts',
	'separatorSize',
	'siteCopyItemsP',
	'storiesP',
	'storyPaginate',
	'storyRowP',
], function (bar, bodyColumn, colors, confettiBackground, dailyTheme, db, fonts, separatorSize, siteCopyItemsP, storiesP, storyPaginate, storyRowP) {
	var bannerButton = function (label, fa) {
		return border(colors.holibirthdayDarkRed, {
			top: 5,
			radius: 5,
		}, padding(10, alignTBM({
			middle: stack({}, [
				paragraph(label, 150).all([
					fonts.bebasNeue,
					$css('text-align', 'center'),
					withFontColor(white),
				]),
				fonts.fa(fa).all([
					$css('text-align', 'center'),
					$css('font-size', '60px'),
					withFontColor(white),
				]),
			]),
		})).all([
			withBackgroundColor(colors.holibirthdayRed),
		]));
	};

	return siteCopyItemsP.then(function (siteCopyItems) {
		return storiesP.then(function (stories) {
			stories.sort(function (s1, s2) {
				return new Date(s2.createDate).getTime() - new Date(s1.createDate).getTime();
			});
			
			var useStoryPicture = function (story, c) {
				return border(black, 1, withBackgroundImage({
					src: story.imageUrl || './content/man.png',
				}, c.all([
					withBackgroundColor(color({
						a: 0.5,
					})),
					withFontColor(white),
				])));
			};
			
			var banner = bodyColumn(image({
				src: '/content/banner.png',
				chooseHeight: 1,
			}));

			var bannerButtons = bodyColumn(grid({
				handleSurplusWidth: evenSplitSurplusWidth,
				gutterSize: separatorSize,
			}, [
				alignLRM({
					middle: linkTo('#!editStory', bannerButton(siteCopyItems.find('Home Share Your Story'), 'bullhorn')),
				}),
				alignLRM({
					middle: linkTo('#!myHolibirthday', bannerButton(siteCopyItems.find('Home Claim Your Holibirthday'), 'gift')),
				}),
				alignLRM({
					middle: linkTo('#!contacts', bannerButton(siteCopyItems.find('Home Find Friends'), 'users')),
				}),
			]));

			var tagline = paragraph(siteCopyItems.find('Home Tagline')).all([
				fonts.bebasNeue,
				$css('text-align', 'center'),
				$css('font-size', 30),
			]);
			
			var firstView = confettiBackground(bodyColumn(dailyTheme));

			var restViews = bodyColumn(storyPaginate({
				perPage: 5,
				pageS: Stream.once(0),
			}, stories.map(storyRowP)));

			return stack({
				gutterSize: separatorSize * 2,
			}, [
				stack({
					gutterSize: separatorSize * 2,
				}, [
					banner,
					tagline,
				]),
				stack({
					gutterSize: separatorSize,
				}, [
					bannerButtons,
				]),
				stack({
					gutterSize: separatorSize,
				}, [
					firstView,
					alignLRM({
						middle: linkTo('#!browseStories', text('Stories').all([
							fonts.h1,
						])),
					}),
					restViews,
					alignLRM({
						middle: linkTo('#!browseStories', text('(browse stories)').all([
							withFontColor(colors.linkBlue),
							$css('text-decoration', 'underline'),
						])),
					})
				]),
			]);
		});
	});
});
define('leaderboardsView', [
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
], function (bodyColumn, colors, confettiBackground, db, fonts, holibirthdayRow, separatorSize) {
	return promiseComponent(db.pointsTotal.find({}).then(function (pts) {
		return db.profile.find({
			$or: pts.map(function (pt) {
				return pt.user;
			}),
		}).then(function (profiles) {
			return stack({
				gutterSize: separatorSize,
			}, [
				confettiBackground(bodyColumn(holibirthdayRow(stack({
					gutterSize: separatorSize,
				}, [
					paragraph('Holibirthday Leaderboards').all([
						fonts.h1,
						fonts.ralewayThinBold,
					]),
				])))),
				bodyColumn(alignLRM({
					middle: stack({
						gutterSize: separatorSize,
						collapseGutters: true,
					}, pts.sort(function (pt1, pt2) {
						return pt2.amount - pt1.amount;
					}).map(function (pt) {
						var profile = profiles.filter(function (p) {
							return p.user === pt.user;
						})[0];
						return profile ? linkTo('#!user/' + profile.user, sideBySide({
							gutterSize: separatorSize,
						}, [
							alignTBM({
								middle: text('' + pt.amount).all([
									withFontColor(colors.darkGreen),
									fonts.ralewayThinBold,
									fonts.h2,
								]),
							}).all([
								withMinWidth(100, true),
							]),
							alignTBM({
								middle: text(profile.firstName + ' ' + profile.lastName).all([
									fonts.ralewayThinBold,
									fonts.h2,
								]),
							}),
						])) : nothing;
					})),
				})),
			]);
		});
	}));
});
define('gafyColors', [], function () {
	return [{
		name: 'Black',
		color: color({
			r: 0,
			g: 0,
			b: 0,
		}),
	}, {
		name: 'White',
		color: color({
			r: 255,
			g: 255,
			b: 255,
		}),
	}, {
		name: 'Toasted Oatmeal',
		color: color({
			r: 242,
			g: 238,
			b: 226,
		}),
	}, {
		name: 'Light Grey',
		color: color({
			r: 204,
			g: 204,
			b: 204,
		}),
	}, {
		name: 'Grey',
		color: color({
			r: 188,
			g: 188,
			b: 178,
		}),
	}, {
		name: 'Brown',
		color: color({
			r: 129,
			g: 86,
			b: 30,
		}),
	}, {
		name: 'Dark Brown',
		color: color({
			r: 100,
			g: 65,
			b: 17,
		}),
	}, {
		name: 'Yellow',
		color: color({
			r: 254,
			g: 255,
			b: 1,
		}),
	}, {
		name: 'Gold',
		color: color({
			r: 252,
			g: 206,
			b: 0,
		}),
	}, {
		name: 'Dark Gold',
		color: color({
			r: 251,
			g: 166,
			b: 24,
		}),
	}, {
		name: 'Old Gold',
		color: color({
			r: 176,
			g: 137,
			b: 8,
		}),
	}, {
		name: 'Orange',
		color: color({
			r: 237,
			g: 104,
			b: 35,
		}),
	}, {
		name: 'Texas Orange',
		color: color({
			r: 187,
			g: 94,
			b: 25,
		}),
	}, {
		name: 'Deep Orange',
		color: color({
			r: 234,
			g: 82,
			b: 35,
		}),
	}, {
		name: 'Red',
		color: color({
			r: 220,
			g: 27,
			b: 54,
		}),
	}, {
		name: 'Mid Red',
		color: color({
			r: 180,
			g: 3,
			b: 19,
		}),
	}, {
		name: 'Dark Red',
		color: color({
			r: 193,
			g: 4,
			b: 0,
		}),
	}, {
		name: 'Fuchsia',
		color: color({
			r: 172,
			g: 4,
			b: 125,
		}),
	}, {
		name: 'Maroon',
		color: color({
			r: 129,
			g: 2,
			b: 55,
		}),
	}, {
		name: 'Magenta',
		color: color({
			r: 188,
			g: 38,
			b: 163,
		}),
	}, {
		name: 'Flesh',
		color: color({
			r: 251,
			g: 201,
			b: 150,
		}),
	}, {
		name: 'Natural',
		color: color({
			r: 230,
			g: 205,
			b: 177,
		}),
	}, {
		name: 'Tan',
		color: color({
			r: 213,
			g: 149,
			b: 87,
		}),
	}, {
		name: 'Pink',
		color: color({
			r: 251,
			g: 138,
			b: 190,
		}),
	}, {
		name: 'Hot Pink',
		color: color({
			r: 197,
			g: 10,
			b: 117,
		}),
	}, {
		name: 'Burgundy',
		color: color({
			r: 135,
			g: 3,
			b: 26,
		}),
	}, {
		name: 'Lime',
		color: color({
			r: 163,
			g: 254,
			b: 161,
		}),
	}, {
		name: 'Spring Green',
		color: color({
			r: 8,
			g: 164,
			b: 91,
		}),
	}, {
		name: 'Kelly Green',
		color: color({
			r: 4,
			g: 108,
			b: 81,
		}),
	}, {
		name: 'Olive Green',
		color: color({
			r: 114,
			g: 116,
			b: 75,
		}),
	}, {
		name: 'Dark Green',
		color: color({
			r: 6,
			g: 58,
			b: 37,
		}),
	}, {
		name: 'Light Blue',
		color: color({
			r: 9,
			g: 158,
			b: 216,
		}),
	}, {
		name: 'Turquoise',
		color: color({
			r: 70,
			g: 181,
			b: 200,
		}),
	}, {
		name: 'Ocean Blue',
		color: color({
			r: 6,
			g: 169,
			b: 202,
		}),
	}, {
		name: 'Columbia Blue',
		color: color({
			r: 163,
			g: 209,
			b: 232,
		}),
	}, {
		name: 'Aqua',
		color: color({
			r: 7,
			g: 151,
			b: 138,
		}),
	}, {
		name: 'Royal Blue',
		color: color({
			r: 48,
			g: 74,
			b: 171,
		}),
	}, {
		name: 'Dark Royal',
		color: color({
			r: 1,
			g: 0,
			b: 204,
		}),
	}, {
		name: 'Navy',
		color: color({
			r: 14,
			g: 9,
			b: 91,
		}),
	}, {
		name: 'Light Purple',
		color: color({
			r: 177,
			g: 129,
			b: 229,
		}),
	}, {
		name: 'Purple',
		color: color({
			r: 68,
			g: 2,
			b: 108,
		}),
	}, {
		name: 'Violet',
		color: color({
			r: 120,
			g: 89,
			b: 169,
		}),
	}, {
		name: 'Purple Grape',
		color: color({
			r: 143,
			g: 55,
			b: 168,
		}),
	}, {
		name: 'Silver Shimmer',
		color: color({
			r: 204,
			g: 204,
			b: 204,
		}),
	}, {
		name: 'Gold Shimmer',
		color: color({
			r: 208,
			g: 159,
			b: 7,
		}),
	}, {
		name: 'Vegas Gold',
		color: color({
			r: 230,
			g: 204,
			b: 104,
		}),
	}, {
		name: 'Neon Yellow',
		color: color({
			r: 240,
			g: 236,
			b: 69,
		}),
	}, {
		name: 'Neon Orange',
		color: color({
			r: 247,
			g: 176,
			b: 0,
		}),
	}, {
		name: 'Neon Pink',
		color: color({
			r: 237,
			g: 108,
			b: 201,
		}),
	}, {
		name: 'Neon Magenta',
		color: color({
			r: 231,
			g: 6,
			b: 126,
		}),
	}, {
		name: 'Neon Red',
		color: color({
			r: 249,
			g: 90,
			b: 84,
		}),
	}, {
		name: 'Neon Blue',
		color: color({
			r: 14,
			g: 122,
			b: 233,
		}),
	}, {
		name: 'Neon Green',
		color: color({
			r: 104,
			g: 211,
			b: 53,
		}),
	}, {
		name: 'Neon Purple',
		color: color({
			r: 100,
			g: 67,
			b: 136,
		}),
	}, {
		name: 'Metallic Black',
		color: color({
			r: 98,
			g: 95,
			b: 92,
		}),
	}, {
		name: 'Metallic Red',
		color: color({
			r: 243,
			g: 104,
			b: 107,
		}),
	}, {
		name: 'Metallic Magenta',
		color: color({
			r: 201,
			g: 103,
			b: 189,
		}),
	}, {
		name: 'Metallic Orange',
		color: color({
			r: 236,
			g: 133,
			b: 121,
		}),
	}, {
		name: 'Metallic Yellow',
		color: color({
			r: 221,
			g: 206,
			b: 105,
		}),
	}, {
		name: 'Metallic Blue',
		color: color({
			r: 66,
			g: 149,
			b: 181,
		}),
	}, {
		name: 'Metallic Marine',
		color: color({
			r: 76,
			g: 76,
			b: 175,
		}),
	}, {
		name: 'Metallic Purple',
		color: color({
			r: 122,
			g: 106,
			b: 142,
		}),
	}, {
		name: 'Metallic Fuchsia',
		color: color({
			r: 169,
			g: 101,
			b: 136,
		}),
	}, {
		name: 'Metallic Green',
		color: color({
			r: 35,
			g: 175,
			b: 156,
		}),
	}];
});
define('browseStoriesView', [
	'bodyColumn',
	'categories',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
	'storiesP',
	'storyPaginate',
	'storyRowP',
], function (bodyColumn, categories, confettiBackground, db, fonts, holibirthdayRow, separatorSize, storiesP, storyPaginate, storyRowP) {
	var allStories = function () {
		return true;
	};
	var noStories = function () {
		return false;
	};
	var adjectiveS = Stream.once('');
	var filterS = Stream.once(allStories);
	return promiseComponent(storiesP.then(function (stories) {
		stories.sort(function (s1, s2) {
			return new Date(s2.createDate).getTime() - new Date(s1.createDate).getTime();
		});
		
		return stack({
			gutterSize: separatorSize,
		}, [
			confettiBackground(bodyColumn(holibirthdayRow(stack({
				gutterSize: separatorSize / 2,
			}, [
				text(adjectiveS.map(function (a) {
					return a + 'Stories';
				})).all([
					fonts.h1,
				]),
				padding({
					left: separatorSize,
				}, stack({
					gutterSize: separatorSize / 2,
				}, [
					text('All Stories').all([
						fonts.h3,
						link,
						clickThis(function () {
							adjectiveS.push('');
							filterS.push(allStories);
						}),
					]),
					text('Category').all([
						fonts.h3,
					]),
					grid({
						gutterSize: separatorSize,
					}, categories.filter(function (c) {
						return stories.filter(function (s) {
							return s.storyType === c.toLowerCase();
						}).length > 0;
					}).map(function (c) {
						return text(c).all([
							fonts.bebasNeue,
							link,
							clickThis(function () {
								adjectiveS.push(c + ' ');
								filterS.push(function (s) {
									return s.storyType === c.toLowerCase();
								});
							}),
						]);
					})),
					text('Tag').all([
						fonts.h3,
					]),
					promiseComponent(db.uniqueTag.find({}).then(function (uniqueTags) {
						return grid({
							gutterSize: separatorSize,
						}, uniqueTags.map(function (t) {
							return text(t.tag).all([
								fonts.bebasNeue,
								link,
								clickThis(function () {
									adjectiveS.push(t.tag + ' ');
									filterS.push(noStories);
									db.storyTag.find({
										tag: t.tag,
									}).then(function (storyTags) {
										filterS.push(function (story) {
											return storyTags.filter(function (t) {
												return t.story === story._id;
											}).length > 0;
										});
									});
								}),
							]);
						}));
					})),
				])),
			])))),
			componentStream(filterS.map(function (filter) {
				return bodyColumn(storyPaginate({
					perPage: 10,
					pageS: Stream.once(0),
				}, stories.filter(filter).map(storyRowP)));
			})),
		]);
	}));
});










define('storyRowP', [
	'fonts',
	'holibirthdayRow',
	'profilesP',
	'separatorSize',
], function (fonts, holibirthdayRow, profilesP, separatorSize) {
	return function (story) {
		return promiseComponent(profilesP.then(function (profiles) {
			var profile = profiles.filter(function (p) {
				return p.user === story.user;
			})[0];
			var paragraphs = [];
			var n = 0;
			var chars = 0;
			var maxChars = 100;
			var $text = $(story.text);
			while (chars < maxChars && n < $text.length) {
				var $paragraph = $($text[n]);
				var length = $paragraph.text().length;
				chars += length;
				n += 1;
				paragraphs.push(paragraph($paragraph.html() || ""));
			}
			return linkTo('#!story/' + story._id, holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				paragraph(story.name).all([
					fonts.h2,
				]),
				stack({
					gutterSize: 16,
					collapseGutters: true,
				}, paragraphs),
				linkTo('#!user/' + profile.user, text('by ' + profile.firstName + ' ' + profile.lastName).all([
					fonts.ralewayThinBold,
				])),
				
			]).all([
				withMinWidth(300, true),
			]), story.imageUrl || './content/man.png'));
		}));
	};
});
define('categories', [], function () {
	return [
		'Birthday',
		'Holiday',
		'Childhood',
		'Family',
		'College',
		'High School',
		'Workplace',
		'Catharsis',
		'Humor',
	];
});
define('daysByMonth', [], function () {
	return {
		'January': 31,
		'February': 29,
		'March': 31,
		'April': 30,
		'May': 31,
		'June': 30,
		'July': 31,
		'August': 31,
		'September': 30,
		'October': 31,
		'November': 30,
		'December': 31,
	};
})
define('famousBirthdaysDisplay', [
	'bodyColumn',
	'fonts',
	'separatorSize',
], function (bodyColumn, fonts, separatorSize) {
	return function (famousBirthdays) {
		return famousBirthdays.length > 0 ? bodyColumn(stack({
			gutterSize: separatorSize,
		}, [
			text('People with the Same Birthday').all([
				fonts.h1,
				fonts.ralewayThinBold,
			]),
			grid({
				gutterSize: separatorSize,
				handleSurplusWidth: evenSplitSurplusWidth,
			}, famousBirthdays.map(function (fb) {
				return stack({
					gutterSize: separatorSize,
				}, [
					text(fb.name).all([
						fonts.ralewayThinBold,
						$css('text-align', 'center'),
					]),
					alignLRM({
						middle: image({
							src: fb.imageUrl,
							minWidth: 200,
						}),
					}),
				]);
			})),
		])) : nothing;
	};
});
define('gafy', [], function () {
	return {
		colorsForDesignAndStyle: function (design, style) {
			var colorsObj = {};
			var appendToColorsObj = function (color) {
				colorsObj[color.name] = color;
			};
			if (design.colors) {
				design.colors.map(appendToColorsObj);
			}
			if (style.colors) {
				style.colors.map(appendToColorsObj);
			}
			
			var colors = [];
			for (var key in colorsObj) {
				colors.push(colorsObj[key]);
			}
			return colors;
		},
		stylesForDesign: function (styles, design) {
			if (!styles || !styles.filter || !design || !design.styles || !design.styles.filter) {
				return [];
			}
			return styles.filter(function (style) {
				return design.styles.filter(function (id) {
					return style._id === id;
				}).length > 0;
			});
		},
	};
});
define('cartView', [
	'bodyColumn',
	'cart',
	'confettiBackground',
	'db',
	'fonts',
	'formatPrice',
	'gafyColors',
	'holibirthdayRow',
	'separatorSize',
	'submitButton',
], function (bodyColumn, cart, confettiBackground, db, fonts, formatPrice, gafyColors, holibirthdayRow, separatorSize, submitButton) {
	return promiseComponent(db.gafyDesign.find().then(function (designs) {
		return db.gafyStyle.find().then(function (styles) {
			var cartLineItem = function (cartItem, index) {
				var design = designs.filter(function (d) {
					return d._id === cartItem.designId;
				})[0];
				var style = styles.filter(function (s) {
					return s._id === cartItem.styleId;
				})[0];
				return sideBySide({
					handleSurplusWidth: giveToFirst,
				}, [
					linkTo('#!design/' + cartItem.designId, grid({
						minColumnWidth: 10,
						gutterSize: separatorSize,
					}, [
						alignLRM({
							left: image({
								src: design.imageUrl,
								minHeight: 200,
								chooseWidth: 0,
							}),
						}),
						alignLRM({
							left: image({
								src: style.imageUrl,
								minHeight: 200,
								chooseWidth: 0,
							}),
						}),
						stack({
							gutterSize: separatorSize,
						}, [
							text(gafyColors[cartItem.color].name + ' ' + design.designDescription + ' ' + style.styleDescription).all([
								fonts.ralewayThinBold,
							]),
							alignLRM({
								left: div.all([
									withBackgroundColor(gafyColors[cartItem.color].color),
									withMinWidth(50),
									withMinHeight(50),
								]),
							}),
							text('Size: ' + cartItem.size).all([
								fonts.ralewayThinBold,
							]),
						]),
					])),
					stack({}, [
						alignLRM({
							right: text(formatPrice(style.price)).all([
								fonts.ralewayThinBold,
								$css('font-size', 30),
							]),
						}),
						alignLRM({
							right: text('(Remove Item)').all([
								$css('font-size', 15),
								link,
								clickThis(function () {
									cart.removeItem(index);
									window.location.reload();
								}),
							]),
						}),
					]),
				]);
			};

			return stack({
				gutterSize: separatorSize,
			}, [
				confettiBackground(bodyColumn(holibirthdayRow(text('Shopping Cart').all([
					fonts.ralewayThinBold,
					$css('font-size', 40),
				])))),
				bodyColumn(stack({
					gutterSize: separatorSize,
				}, [
					stack({
						gutterSize: separatorSize,
					}, cart.items.map(cartLineItem)),
					alignLRM({
						right: text('Total: ' + formatPrice(cart.items.reduce(function (a, cartItem) {
							return a + styles.filter(function (s) {
								return s._id === cartItem.styleId;
							})[0].price;
						}, 0))).all([
							fonts.ralewayThinBold,
							$css('font-size', 30),
						]),
					}),
					alignLRM({
						right: sideBySide({
							gutterSize: separatorSize,
						}, [
							linkTo('#!gifts', submitButton(black, sideBySide({
								gutterSize: separatorSize,
							}, [
								fonts.fa('shopping-cart'),
								text('Continue Shopping'),
							]))),
							linkTo('#!checkout', submitButton(black, sideBySide({
								gutterSize: separatorSize,
							}, [
								fonts.fa('tag'),
								text('Check Out'),
							]))),
						]),
					}),
				])),
			]);
		});
	}));
});
define('storiesP', [
	'db',
], function (db) {
	return db.story.find();
});
	
define('checkoutView', [
	'auth',
	'bar',
	'bodyColumn',
	'cart',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'formatPrice',
	'forms',
	'gafyColors',
	'meP',
	'prettyForms',
	'profileP',
	'separatorSize',
	'submitButton',
], function (auth, bar, bodyColumn, cart, colors, confettiBackground, db, fonts, formatPrice, forms, gafyColors, meP, prettyForms, profileP, separatorSize, submitButton) {
	return promiseComponent(db.gafyDesign.find().then(function (designs) {
		return db.gafyStyle.find().then(function (styles) {
			var orderBatchS = Stream.once('none');
			
			var cartThinLineItem = function (cartItem, index) {
				var design = designs.filter(function (d) {
					return d._id === cartItem.designId;
				})[0];
				var style = styles.filter(function (s) {
					return s._id === cartItem.styleId;
				})[0];
				return padding({
					top: separatorSize,
					bottom: separatorSize,
				}, alignLRM({
					left: sideBySide({
						gutterSize: separatorSize,
					}, [
						alignLRM({
							left: image({
								src: design.imageUrl,
								minHeight: 50,
								chooseWidth: 0,
							}),
						}),
						alignLRM({
							left: image({
								src: style.imageUrl,
								minHeight: 50,
								chooseWidth: 0,
							}),
						}),
						alignLRM({
							left: div.all([
								withBackgroundColor(gafyColors[cartItem.color].color),
								withMinWidth(50),
								withMinHeight(50),
							]),
						}),
						alignTBM({
							middle: text(cartItem.size + ' '  + gafyColors[cartItem.color].name + ' ' + design.designDescription + ' ' + style.styleDescription).all([
								fonts.ralewayThinBold,
							]),
						}),
					]),
					right: text(formatPrice(style.price)).all([
						fonts.ralewayThinBold,
						$css('font-size', 20),
					]),
				})).all([
					withBackgroundColor(multiplyColor(index % 2 ? 1 : 1.1)(colors.pageBackgroundColor)),
				]);
			};
			return meP.then(function (me) {
				return profileP.then(function (profile) {
					var order = {
					};
					
					var addressStreams = {
						firstName: Stream.once(''),
						lastName: Stream.once(''),
						line1: Stream.once(''),
						line2: Stream.once(''),
						city: Stream.once(''),
						state: Stream.once(''),
						zip: Stream.once(''),
						country: Stream.once(''),
					};
					var addressS = Stream.combineObject(addressStreams);
					addressS.onValue(function (address) {
						order.address = address;
					});

					var stripeStreams = {
						user: Stream.once((me && me._id) || '000000000000000000000000'),
						email: Stream.once((profile && profile.email) || ''),
						number: Stream.once(''),
						cvc: Stream.once(''),
						exp_month: Stream.once(''),
						exp_year: Stream.once(''),
					};
					var stripeS = Stream.combineObject(stripeStreams);

					var heading = confettiBackground(alignLRM({
						middle: bodyColumn(sideBySide({
							handleSurplusWidth: giveToSecond,
						}, [
							alignTBM({
								middle: image({
									src: './content/man.png',
									minWidth: 300,
									chooseHeight: 0,
								}),
							}),
							padding({
								left: 30,
								right: 30,
								top: 50,
								bottom: 50,
							}, text('Checkout').all([
								fonts.ralewayThinBold,
								$css('font-size', 40),
							])),
						])),
					}));

					var totalPrice = cart.items.reduce(function (a, cartItem) {
						return a + styles.filter(function (s) {
							return s._id === cartItem.styleId;
						})[0].price;
					}, 0);
						
					var thinCart = bodyColumn(stack({}, [
						stack({}, cart.items.map(cartThinLineItem)),
						bar.horizontal(1, black),
						bar.horizontal(separatorSize / 2),
						alignLRM({
							right: text('Total: ' + formatPrice(totalPrice)).all([
								fonts.ralewayThinBold,
								$css('font-size', 20),
							]),
						}),
					]));


					var shippingAddress = stack({
						gutterSize: separatorSize,
					}, [
						text('Shipping Address').all([
							fonts.ralewayThinBold,
							$css('font-size', 30),
						]),
						sideBySide({
							handleSurplusWidth: evenSplitSurplusWidth,
							gutterSize: separatorSize,
						}, [
							prettyForms.input({
								name: 'First Name',
								fieldName: 'firstName',
								type: 'text',
								stream: addressStreams.firstName,
							}),
							prettyForms.input({
								name: 'Last Name',
								fieldName: 'lastName',
								type: 'text',
								stream: addressStreams.lastName,
							}),
						]),
						prettyForms.input({
							name: 'Line 1',
							fieldName: 'address1',
							type: 'text',
							stream: addressStreams.line1,
						}),
						prettyForms.input({
							name: 'Line 2',
							fieldName: 'address2',
							type: 'text',
							stream: addressStreams.line2,
						}),
						sideBySide({
							handleSurplusWidth: evenSplitSurplusWidth,
							gutterSize: separatorSize,
						}, [
							prettyForms.input({
								name: 'City',
								fieldName: 'city',
								type: 'text',
								stream: addressStreams.city,
							}),
							prettyForms.input({
								name: 'State',
								fieldName: 'state',
								type: 'text',
								stream: addressStreams.state,
							}),
							prettyForms.input({
								name: 'Zip',
								fieldName: 'zip',
								type: 'text',
								stream: addressStreams.zip,
							}),
							prettyForms.input({
								name: 'Country',
								fieldName: 'country',
								type: 'text',
								stream: addressStreams.country,
							}),
						]),
					]);

					var billingAddress = stack({
						gutterSize: separatorSize,
					}, [
						text('Billing Information').all([
							fonts.ralewayThinBold,
							$css('font-size', 30),
						]),
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
					]);


					var checkout = promiseComponent(auth.StripeP.then(function (Stripe) {
						var submittingS = Stream.once(false);
						var fillOutAllFieldsS = Stream.once(false);
						var couldNotChargeCardS = Stream.once(false);
					
						return bodyColumn(stack({
							gutterSize: separatorSize,
						}, [
							sideBySide({
								handleSurplusWidth: evenSplitSurplusWidth,
								gutterSize: separatorSize,
							}, [
								shippingAddress,
								billingAddress,
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
								right: submitButton(black, text('Place Order')).all([
									link,
									clickThis(function () {
										fillOutAllFieldsS.push(false);
										couldNotChargeCardS.push(false);
										orderBatchS.push(Math.random().toString().substring(2));

										var address = addressS.lastValue();
										var stripeInfo = stripeS.lastValue();

										var gafyOrders = cart.items.map(function (cartItem) {
											return {
												user: stripeInfo.user,
												orderBatch: orderBatchS.lastValue(),
												customerEmailAddress: stripeInfo.email,
												firstName: address.firstName,
												lastName: address.lastName,
												addressLine1: address.line1,
												addressLine2: address.line2,
												addressCity: address.city,
												addressState: address.state,
												addressZip: address.zip,
												addressCountry: address.country,
												designNumber: cartItem.designNumber,
												designDescription: cartItem.designDescription,
												printLocation: cartItem.printLocation,
												styleNumber: cartItem.styleNumber,
												styleDescription: cartItem.styleDescription,
												color: gafyColors[cartItem.color].name,
												size: cartItem.size,
												quantity: 1,
												// todo: have them pick a shipping method
												shippingMethod: 'shipping method goes here',
											};
										});
										var requiredFields = [
											'customerEmailAddress',
											'firstName',
											'lastName',
											'addressLine1',
											'addressLine2',
											'addressCity',
											'addressState',
											'addressZip',
											'addressCountry',
											'designNumber',
											'designDescription',
											'printLocation',
											'styleNumber',
											'styleDescription',
											'color',
											'size',
											'quantity',
											'shippingMethod',
										];
										for (var i = 0; i < gafyOrders.length; i++) {
											var gafyOrder = gafyOrders[i];
											for (var j = 0; j < requiredFields.length; j++) {
												if (gafyOrder[requiredFields[j]].length === 0) {
													fillOutAllFieldsS.push(true);
													submittingS.push(false);
													return;
												}
											}
										}
										
										var payWithStripe = function () {
											Stripe.card.createToken({
												number: stripeInfo.number,
												cvc: stripeInfo.cvc,
												exp_month: stripeInfo.exp_month,
												exp_year: stripeInfo.exp_year,
											}, function (status, result) {
												if (status !== 200) {
													couldNotChargeCardS.push(true);
													submittingS.push(false);
													return;
												}
												db.stripePayment.insert({
													user: stripeInfo.user,
													email: stripeInfo.email,
													orderBatch: orderBatchS.lastValue(),
													amount: totalPrice,
													stripeToken: result.id,
												}).then(function () {
													while (cart.items.length > 0) {
														cart.removeItem(0);
													}
													window.location.hash = '#!orderSuccess/' + orderBatchS.lastValue();
													window.location.reload();
												}, function () {
													couldNotChargeCardS.push(true);
													submittingS.push(false);
												});
											});
										};

										var insertGafyOrder = function (i) {
											if (i === gafyOrders.length) {
												payWithStripe();
											}
											db.gafyOrder.insert(gafyOrders[i]).then(function () {
												insertGafyOrder(i + 1);
											});
										};
										
										if (!submittingS.lastValue()) {
											submittingS.push(true);
											insertGafyOrder(0);
										}
									}),
								]),
							}),
						]));
					}));

					
					return stack({
						gutterSize: separatorSize,
					}, [
						heading,
						thinCart,
						checkout,
					]);
				});
			});
		});
	}));
});
define('meP', [
	'domain',
], function (domain) {
	return (function () {
		var meD = Q.defer();

		$.get(domain + '/auth/me').then(function (me) {
			meD.resolve(me);
		}, function () {
			meD.resolve();
		});

		return meD.promise;
	})();
});
define('formLayouts', [], function () {
	return {
		stack: function (config) {
			return function (object, submitF) {
				config.fields.map(function (field) {
					object[field] = object[field] || undefined;
				});
				return config.formBuilder(object, function (objectS, fields) {
					return stack(config.stackConfig, [
						stack(config.stackConfig || {}, config.fields.map(function (field) {
							return fields[field];
						})),
						submitF(objectS, fields),
					]);
				});
			};
		},
	};
});
define('contactUsView', [
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
			left: submitButton(black, text('Submit').all([
				fonts.bebasNeue,
			])).all([
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
define('paginate', [], function () {
	
});
define('causesView', [
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
	'siteCopyItemsP',
], function (bodyColumn, confettiBackground, fonts, holibirthdayRow, separatorSize, siteCopyItemsP) {
	return promiseComponent(siteCopyItemsP.then(function (copy) {
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
				linkTo('#!donate', text(copy.find('Causes Donate Now')).all([
					fonts.ralewayThinBold,
					fonts.h2,
				])),
			]), copy.find('Causes Image')))),
			bodyColumn(paragraph(copy.find('Causes'))),
		]);
	}));
});
define('storeView', [
	'bar',
	'bodyColumn',
	'cart',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'formatPrice',
	'gafy',
	'gafyColors',
	'gafyDesignRow',
	'gafyDesignSmall',
	'gafyStyleSmall',
	'holibirthdayRow',
	'meP',
	'opacityGridSelect',
	'separatorSize',
	'siteCopyItemsP',
], function (bar, bodyColumn, cart, colors, confettiBackground, db, fonts, formatPrice, gafy, gafyColors, gafyDesignRow, gafyDesignSmall, gafyStyleSmall, holibirthdayRow, meP, opacityGridSelect, separatorSize, siteCopyItemsP) {
	return promiseComponent(db.gafyDesign.find().then(function (designs) {
		return siteCopyItemsP.then(function (copy) {
			return meP.then(function (me) {
				return stack({
					gutterSize: separatorSize,
				}, [
					confettiBackground(
						bodyColumn(
							holibirthdayRow(stack({
								gutterSize: separatorSize,
								collapseGutters: true,
							}, [
								text(copy.find('Gifts Title')).all([
									fonts.ralewayThinBold,
									fonts.h1,
								]),
								linkTo('#!cart', cart.items.length > 0 ? text(copy.find('Gifts Cart') + ' (' + cart.items.length + ')').all([
									fonts.ralewayThinBold,
									fonts.h1,
								]) : nothing),
								linkTo((me ? '#!wishlist' + '/' + me._id : '#!wishlist'), cart.wishlistItems.length > 0 ? text(copy.find('Gifts Wishlist') + ' (' + cart.wishlistItems.length + ')').all([
									fonts.ralewayThinBold,
									fonts.h1,
								]) : nothing),
							])))),
					bodyColumn(text('Choose a Design').all([
						fonts.h1,
						fonts.ralewayThinBold,
					])),
					bodyColumn(stack({
						gutterSize: separatorSize,
					}, intersperse(designs.map(function (design) {
						return linkTo('#!design/' + design._id, gafyDesignRow(design));
					}), bar.horizontal(1).all([
						withMinHeight(1, true),
						withBackgroundColor(colors.middleGray),
					])))),
				]);
			});
		});
	}));
});
define('gafyDesignView', [
	'bar',
	'bodyColumn',
	'cart',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'forms',
	'gafy',
	'gafyColors',
	'gafyDesignRow',
	'gafyDesignSmall',
	'gafyStyleSmall',
	'holibirthdayRow',
	'opacityGridSelect',
	'separatorSize',
	'socialMedia',
	'socialMediaButton',
	'submitButton',
], function (bar, bodyColumn, cart, colors, confettiBackground, db, fonts, forms, gafy, gafyColors, gafyDesignRow, gafyDesignSmall, gafyStyleSmall, holibirthdayRow, opacityGridSelect, separatorSize, socialMedia, socialMediaButton, submitButton) {
	return function (designId) {
		return promiseComponent(db.gafyDesign.findOne({
			_id: designId,
		}).then(function (design) {
			return db.gafyStyle.find().then(function (styles) {
				var gafyOrderStreams = Stream.splitObject({
					style: null,
					color: null,
					size: null,
				});
				var gafyOrderS = Stream.combineObject(gafyOrderStreams);

				var mustChooseEverythingS = Stream.once(false);
				
				gafyOrderS.map(function () {
					mustChooseEverythingS.push(false);
				});
				
				var designSocialMediaButton = socialMediaButton(function (verb) {
					return verb + ' this Design';
				});

				var shareButtons = bodyColumn(sideBySide({
					gutterSize: separatorSize,
				}, [
					designSocialMediaButton(socialMedia.facebook),
					designSocialMediaButton(socialMedia.twitter),
				]));


				return stack({
					gutterSize: separatorSize,
				}, [
					linkTo('#!gifts', confettiBackground(
						bodyColumn(
							gafyDesignRow(design)))),
					bodyColumn(stack({
						gutterSize: separatorSize,
					}, [
						shareButtons,
						text('Style').all([
							fonts.h1,
							fonts.ralewayThinBold,
						]),
						opacityGridSelect(gafyOrderStreams.style, gafy.stylesForDesign(styles, design).map(function (style) {
							return {
								component: gafyStyleSmall(style),
								value: style,
							};
						})),
						text('Color').all([
							fonts.h1,
							fonts.ralewayThinBold,
						]),
						componentStream(gafyOrderStreams.style.map(function (style) {
							return style ? opacityGridSelect(gafyOrderStreams.color, gafy.colorsForDesignAndStyle(design, style).map(function (colorName) {
								var gafyColor = gafyColors.filter(function (gc) {
									return gc.name === colorName;
								})[0];
								return {
									component: stack({}, [
										alignLRM({
											middle: div.all([
												withBackgroundColor(gafyColor.color),
												withMinWidth(50),
												withMinHeight(50),
											]),
										}),
										text(gafyColor.name),
										text(rgbColorString(gafyColor.color)),
									]),
									value: gafyColors.indexOf(gafyColor),
								};
							})) : text('Choose a style');
						})),
						text('Size').all([
							fonts.h1,
							fonts.ralewayThinBold,
						]),
						componentStream(gafyOrderStreams.style.map(function (style) {
							return style ? forms.selectBox({
								name: 'size',
								options: style.sizes,
								stream: gafyOrderStreams.size,
							}) : text('Choose a style');
						})),
						componentStream(mustChooseEverythingS.map(function (mustChooseEverything) {
							return mustChooseEverything ? alignLRM({
								right: paragraph('You must choose a design, a style, a color, and a size', 280),
							}) : nothing;
						})),
						alignLRM({
							right: sideBySide({
								gutterSize: separatorSize,
							}, [
								submitButton(black, sideBySide({
									gutterSize: separatorSize,
								}, [
									fonts.fa('cart-plus'),
									text('Add to Wishlist'),
								])).all([
									link,
									clickThis(function () {
										var order = gafyOrderS.lastValue();
										if (!order.style ||
											!order.color ||
											!order.size) {
											mustChooseEverythingS.push(true);
										}
										else {
											var cartItem = {
												designId: design._id,
												styleId: order.style._id,
												designNumber: design.designNumber,
												designDescription: design.designDescription,
												printLocation: design.printLocation,
												styleNumber: order.style.styleNumber,
												styleDescription: order.style.styleDescription,
												color: order.color,
												size: order.size,
											};
											cart.addWishlistItem(cartItem);
											window.location.hash = '#!wishlist';
											window.location.reload();
										}
									}),
								]),
								submitButton(black, sideBySide({
									gutterSize: separatorSize,
								}, [
									fonts.fa('shopping-cart'),
									text('Add to Cart'),
								])).all([
									link,
									clickThis(function () {
										var order = gafyOrderS.lastValue();
										if (!order.style ||
											!order.color ||
											!order.size) {
											mustChooseEverythingS.push(true);
										}
										else {
											var cartItem = {
												designId: design._id,
												styleId: order.style._id,
												designNumber: design.designNumber,
												designDescription: design.designDescription,
												printLocation: design.printLocation,
												styleNumber: order.style.styleNumber,
												styleDescription: order.style.styleDescription,
												color: order.color,
												size: order.size,
											};
											cart.addItem(cartItem);
											window.location.hash = '#!cart';
											window.location.reload();
										}
									}),
								]),
							]),
						}),
					])),
				]);
			});	
		}));
	};
});
define('profileViewP', [
	'adminP',
	'bar',
	'bodyColumn',
	'colors',
	'confettiBackground',
	'db',
	'fonts',
	'holibirthdayRow',
	'holibirthdayView',
	'meP',
	'months',
	'profilesP',
	'separatorSize',
	'socialMedia',
	'socialMediaButton',
	'storiesP',
	'storyRowP',
	'submitButton',
	'writeOnImage',
], function (adminP, bar, bodyColumn, colors, confettiBackground, db, fonts, holibirthdayRow, holibirthdayView, meP, months, profilesP, separatorSize, socialMedia, socialMediaButton, storiesP, storyRowP, submitButton, writeOnImage) {
	return function (route) {
		var index = route.indexOf('/');
		var user = (index === -1) ? route : route.substring(0, index);
		var modalOnS = Stream.once(index !== -1);
		$('body').on('click', function () {
			modalOnS.push(false);
		});
		var first = false;
		modalOnS.map(function (on) {
			if (first) {
				ignoreHashChange = true;
				window.location.hash = '#!user/' + user + (on ? '/certificate' : '');
			}
			first = true;
		});
		var asRoot = function (config) {
			return function (c) {
				return div.all([
					child(c),
					wireChildren(function (instance, context) {
						instance.minWidth.push(0);
						instance.minHeight.push(0);
						return [{
							top: Stream.combine([
								context.top,
								context.scroll,
							], function (top, scroll) {
								return config.top(top - scroll);
							}),
							left: Stream.combine([
								context.left,
								context.leftAccum,
							], function (left, leftAccum) {
								return config.left(left + leftAccum);
							}),
							width: windowWidth,
							height: windowHeight,
						}];
					}),
				]);
			};
		};
		var holibirthdayModal = asRoot({
			top: function (top) {
				return -top;
			},
			left: function (left) {
				return -left;
			},
		})(overlays([
			nothing.all([
				withBackgroundColor(color({
					a: 0.5,
				})),
			]),
			padding({
				all: separatorSize,
			}, holibirthdayView(user)),
		]).all([
			$css('transition', 'opacity 0.5s'),
			function (instance) {
				modalOnS.map(function (on) {
					instance.$el.css('z-index', on ? 1000 : -1);
					instance.$el.css('display', on ? '' : 'none');
				});
			},
		]));
		return promiseComponent(meP.then(function (me) {
			return adminP.then(function (admin) {
				return profilesP.then(function (profiles) {
					var profile = profiles.filter(function (profile) {
						return profile.user === user;
					})[0];
					var pointsP = db.pointsChange.find({
						user: user,
					});
					var pointsTotalP = pointsP.then(function (points) {
						return points.reduce(function (a, p) {
							return a + p.amount;
						}, 0);
					});
					var redBar = confettiBackground(bodyColumn(stack({}, [
						holibirthdayRow(grid({
							gutterSize: separatorSize,
							useFullWidth: true,
							handleSurplusWidth: giveToFirst,
						}, [
							alignTBM({
								middle: stack({
									gutterSize: separatorSize / 2,
									collapseGutters: true,
								}, [
									paragraph(profile.firstName + ' ' + profile.lastName).all([
										fonts.ralewayThinBold,
										$css('font-size', 40),
									]),
									profile.birthday ? text('Born on ' + moment(profile.birthday).utc().format('MMMM Do')).all([
										fonts.ralewayThinBold,
										$css('font-size', 20),
									]) : nothing,
									promiseComponent(pointsTotalP.then(function (pointsTotal) {
										return text('Holibirthday Points: ' + pointsTotal).all([
											fonts.ralewayThinBold,
											$css('font-size', 20),
										]);
									})),
									me ? promiseComponent(db.contactOtherUser.findOne({
										user: me._id,
										otherUser: user,
									}).then(function (cou) {
										if (cou) {
											return nothing;
										}
										else if (me._id === user) {
											return linkTo('#!contacts', text('My Contacts').all([
												fonts.ralewayThinBold,
												$css('font-size', 20),
											]));
										}
										return text('Add Contact').all([
											fonts.ralewayThinBold,
											$css('font-size', 20),
											link,
											clickThis(function (ev, disable) {
												disable();
												db.contactOtherUser.insert({
													user: me._id,
													otherUser: user,
												}).then(function () {
													window.location.hash = '#!contacts';
													window.location.reload();
												});
											}),
										]);
									})) : nothing,
								]),
							}),
							keepAspectRatio(promiseComponent(db.holibirthday.findOne({
								user: user,
							}).then(function (holibirthday) {
								if (profile.holibirther && holibirthday)
								{
									var date = new Date(holibirthday.date);
									return image({
										src: writeOnImage({
											width: 308,
											height: 200,
										}, './content/certificate-01-thumbnail.png', [{
											center: {
												x: 154,
												y: 88,
											},
											text: profile.firstName + ' ' + profile.lastName,
											font: 'bold 14px Raleway Thin',
										}, {
											center: {
												x: 154,
												y: 152,
											},
											text: moment(date).utc().format('MMMM Do'),
											font: 'bold 14px Raleway Thin',
										}].concat(profile.birthday ? [{
											center: {
												x: 46,
												y: 171,
											},
											text: 'Old Birthday',
											font: '6px BebasNeue',
										}, {
											center: {
												x: 46,
												y: 176,
											},
											text: moment(profile.birthday).utc().format('MMMM Do'),
											font: '6px BebasNeue',
										}] : [])),
										useNativeSize: true,
									}).all([
										link,
										clickThis(function (ev) {
											modalOnS.push(true);
											ev.stopPropagation();
										}),
									]);
								}
								return meP.then(function (me) {
									if (me && me._id === user) {
										return linkTo('#!myHolibirthday', alignTBM({
											middle: submitButton(white, text('claim a holibirthday').all([
												fonts.bebasNeue,
											])),
										}).all([
											fonts.ralewayThinBold,
										]));
									}
									else {
										return nothing;
									}
								});
							}))),
						]), profile.imageUrl || './content/man.png'),
					])));
					var storiesC = promiseComponent(storiesP.then(function (stories) {
						var profileStories = stories.filter(function (story) {
							return story.user === user;
						});
						
						return bodyColumn(stack({
							gutterSize: separatorSize,
						}, profileStories.map(storyRowP))).all([
							withMinWidth(0),
							withMinHeight(0),
						]);
					}));

					var profileSocialMediaButton = socialMediaButton(function (verb) {
						return verb + (me && me._id === profile.user ? ' your profile' : ' this profile');
					});
					var shareButtons = bodyColumn(sideBySide({
						gutterSize: separatorSize,
					}, [
						profileSocialMediaButton(socialMedia.facebook),
						profileSocialMediaButton(socialMedia.twitter),
					]));


					var pointsC = promiseComponent(pointsP.then(function (points) {
						return pointsTotalP.then(function (pointsTotal) {
							return pointsTotal === 0 ? nothing : bodyColumn(stack({
								gutterSize: separatorSize,
							}, [
								bar.horizontal(1, colors.middleGray),
								linkTo('#!leaderboards', text('Holibirthday Points (view leaderboards)').all([
									fonts.ralewayThinBold,
									$css('font-size', 40),
								])),
								stack({
									gutterSize: separatorSize,
								}, points.map(function (point) {
									return sideBySide({
										handleSurplusWidth: giveToNth(1),
										gutterSize: separatorSize,
									}, [
										alignTBM({
											middle: text((point.amount >= 0) ? '+' + point.amount : point.amount).all([
												withFontColor(point.amount >= 0 ? colors.darkGreen : colors.darkRed),
												fonts.ralewayThinBold,
												$css('font-size', '30'),
											]),
										}),
										alignTBM({
											middle: paragraph(point.reason).all([
												fonts.ralewayThinBold,
												$css('font-size', '30'),
											]),
										}),
									]);
								})),
								bar.horizontal(1, colors.middleGray),
								sideBySide({
									gutterSize: separatorSize,
								}, [
									alignTBM({
										middle: text(pointsTotal >= 0 ? '' + pointsTotal : pointsTotal).all([
											withFontColor(pointsTotal >= 0 ? colors.darkGreen : colors.darkRed),
											fonts.ralewayThinBold,
											$css('font-size', '30'),
										]),
									}),
									alignTBM({
										middle: text('Total').all([
											fonts.ralewayThinBold,
											$css('font-size', '30'),
										]),
									}),
								]),
							]));
						});
					}));

					var editButton = admin || (me && me._id === profile.user) ? alignLRM({
						middle: linkTo('#!editProfile/' + user, submitButton(black, text('Edit Profile').all([
							fonts.bebasNeue,
						]))),
					}) : nothing;
					
					return stack({
						gutterSize: separatorSize,
					}, [
						redBar,
						shareButtons,
						storiesC,
						pointsC,
						editButton,
						holibirthdayModal,
					]);
				});
			});
		}));
	};
});
define('colors', [], function () {
	return {
		pageBackgroundColor: color({
			r: 242,
			g: 243,
			b: 244,
		}),
		linkBlue: color({
			r: 26,
			g: 13,
			b: 171,
		}),
		darkGray: color({
			r: 209,
			g: 210,
			b: 212,
		}),
		middleGray: color({
			r: 153,
			g: 153,
			b: 153,
		}),
		holibirthdayRed: color({
			r: 237,
			g: 28,
			b: 36,
		}),
		holibirthdayDarkRed: color({
			r: 190,
			g: 30,
			b: 45,
		}),

		darkGreen: color({
			g: 100,
		}),
		darkRed: color({
			r: 100,
		}),
	};
});
define('donateSuccess', [
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'holibirthdayRow',
	'separatorSize',
	'siteCopyItemsP',
], function (bodyColumn, confettiBackground, fonts, holibirthdayRow, separatorSize, siteCopyItemsP) {
	return function (orderBatch) {
		return promiseComponent(siteCopyItemsP.then(function (copy) {
			return stack({
				gutterSize: separatorSize,
			}, [
				confettiBackground(bodyColumn(holibirthdayRow(text(copy.find('Causes Title')).all([
					fonts.ralewayThinBold,
					$css('font-size', 40),
				]), copy.find('Causes Image')))),
				bodyColumn(stack({
					gutterSize: separatorSize,
				}, [
					text('Thank you for donating!').all([
						fonts.h1,
					]),
					text('Your donation id is ' + orderBatch),
				].map(function (t) {
					return t.all([
						fonts.ralewayThinBold,
					]);
				}))),
			]);
		}));
	};
});
define('storyEditViewP', [
	'bodyColumn',
	'categories',
	'colors',
	'db',
	'fonts',
	'forms',
	'meP',
	'prettyForms',
	'separatorSize',
	'signInForm',
	'signInStream',
	'siteCopyItemsP',
], function (bodyColumn, categories, colors, db, fonts, forms, meP, prettyForms, separatorSize, signInForm, signInStream, siteCopyItemsP) {
	return function (story) {
		return promiseComponent(siteCopyItemsP.then(function (siteCopyItems) {
			return Q.all([
				story._id ? db.storyTag.find({
					story: story._id,
				}) : [],
			]).then(function (storyTagss) {
				var storyTags = storyTagss[0];
				var storyStreams = Stream.splitObject(story);
				var storyStream = Stream.combineObject(storyStreams);
				var tagsS = Stream.once(storyTags);
				var removedTags = [];

				var instructions = bodyColumn(padding(20, stack({
					gutterSize: separatorSize,
				}, [
					text(siteCopyItems.find('Edit Story Title')).all([
						fonts.bebasNeue,
						$css('font-size', '60px'),
					]),
					text(siteCopyItems.find('Edit Story Smaller Title')).all([
						fonts.ralewayThinBold,
						$css('font-size', '30px'),
					]),
					paragraph(siteCopyItems.find('Edit Story Instructions').split('\n').join('<br>')).all([
						fonts.ralewayThinBold,
					]),
				])));
				var labelsAll = [
					fonts.ralewayThinBold,
					$css('font-size', 30),
					$css('font-weight', 'bold'),
				];
				var storyForm = bodyColumn(padding(20, stack({
					gutterSize: separatorSize,
				}, [
					prettyForms.input({
						name: 'Title',
						fieldName: 'name',
						stream: storyStreams.name,
						labelAll: labelsAll,
					}),
					prettyForms.textarea({
						name: 'Body',
						fieldName: 'text',
						stream: storyStreams.text,
						labelAll: labelsAll,
					}),
					stack({}, [
						text('Category').all([
							fonts.ralewayThinBold,
						]).all(labelsAll),
						prettyForms.radios({
							fieldName: 'storyType',
							stream: storyStreams.storyType,
							labelAll: labelsAll,
							options: categories.map(function (c) {
								return {
									name: c,
									value: c.toLowerCase(),
								};
							}),
						}),
					]),
					promiseComponent(db.uniqueTag.find({}).then(function (uniqueTags) {
						var nextTagS = Stream.once('');
						var pushTag = function () {
							var tag = nextTagS.lastValue().replace(',','').toLowerCase();
							var tags = tagsS.lastValue().slice(0);
							if (tag.length > 0 && tags.filter(function (t) {
								return t.tag === tag;
							}).length === 0) {
								tags.push({
									tag: tag,
								});
								tagsS.push(tags);
							}
							nextTagS.push('');
						};
						return stack({}, [
							text('Tags').all(labelsAll),
							border(white, {
								all: 1,
							}, stack({}, [
								componentStream(tagsS.map(function (tags) {
									return grid({}, tags.map(function (tag, i) {
										return padding({
											all: separatorSize / 2,
										}, sideBySide({
											gutterSize: separatorSize / 4,
										}, [
											text(tag.tag).all([
												fonts.bebasNeue,
											]),
											alignTBM({
												middle: fonts.fa('close').all([
													$css('opacity', '0.8'),
													link,
													clickThis(function () {
														tags = tags.slice(0);
														removedTags.push(tags.splice(i, 1)[0]);
														tagsS.push(tags);
													}),
												]),
											}),
										]));
									}));
								})),
								padding({
									all: separatorSize / 2,
								}, sideBySide({
									gutterSize: separatorSize / 2,
									handleSurplusWidth: giveToSecond,
								}, [
									text('Add Tag:').all([
										fonts.bebasNeue,
									]),
									dropdownPanel(forms.inputBox(nextTagS, 'text', 'tag', [
										fonts.bebasNeue,
									], true).all([
										keyupThis(function (ev) {
											if (ev.keyCode === 188 /* comma */) {
												pushTag();
											}
										}),
										keydownThis(function (ev) {
											if (ev.keyCode === 13 /* enter */) {
												pushTag();
												ev.stopPropagation();
												return false;
											}
											if (ev.keyCode === 9 /* tab */) {
												var tag = nextTagS.lastValue();
												var completeTag = uniqueTags.filter(function (t) {
													return t.tag.indexOf(tag) !== -1 && tagsS.lastValue().filter(function (tag) {
														return tag.tag === t.tag;
													}).length === 0;
												})[0];
												if (completeTag) {
													if (tag === completeTag.tag) {
														pushTag();
													}
													else {
														nextTagS.push(completeTag.tag);
													}
												}
												else {
													pushTag();
												}
												ev.stopPropagation();
												return false;
											}
										}),
									]), border(white, {
										all: 1,	
									}, componentStream(nextTagS.map(function (nextTag) {
										return stack({}, uniqueTags.filter(function (t) {
											return nextTag !== '' && t.tag.indexOf(nextTag) !== -1 && tagsS.lastValue().filter(function (tag) {
												return tag.tag === t.tag;
											}).length === 0;
										}).map(function (tag) {
											return padding({
												all: separatorSize / 2,
											}, text(tag.tag)).all([
												fonts.bebasNeue,
												link,
												clickThis(function () {
													nextTagS.push(tag.tag);
													pushTag();
												}),
												hoverThis(function (hovering, i) {
													var r = colorString(colors.holibirthdayRed);
													var w = colorString(white);
													i.$el.css('background-color', hovering ? w : r)
														.css('color', hovering ? r : w);
												}),
											]);
										}));
									}))).all([
										withBackgroundColor(colors.holibirthdayRed),
									]), nextTagS.map(function (v) {
										return v.length > 0;
									}), {
										transition: 'none',
									}),
								])),
							])),
						]);
					})),
					prettyForms.imageUpload({
						name: 'Image URL',
						labelAll: labelsAll,
						stream: storyStreams.imageUrl,
					}),
					paragraph(siteCopyItems.find('Edit Story Submit Instructions')).all([
						fonts.ralewayThinBold,
					]),
					alignLRM({
						left: prettyForms.submit(white, 'Submit Story', function () {
							var latestStory = storyStream.lastValue();
							var updateTags = function (story) {
								return Q.all(tagsS.lastValue().map(function (tag) {
									tag.story = story._id;
									if (!tag._id) {
										return db.storyTag.insert(tag);
									}
									return tag;
								}).concat(removedTags.filter(function (tag) {
									return tag._id;
								}).map(function (tag) {
									return db.storyTag.remove(tag);
								})));
							};
							if (latestStory._id) {
								return db.story.update({
									_id: latestStory._id,
								}, latestStory).then(function () {
									return updateTags(latestStory).then(function () {
										window.location.hash = '#!story/' + latestStory._id;
										window.location.reload();
									});
								});
							}
							else {
								return db.story.insert(latestStory).then(function (story) {
									return updateTags(story).then(function () {
										window.location.hash = '#!story/' + story._id;
										window.location.reload();
									});
								});
							}
						}),
					}),
				]))).all([
					withBackgroundColor(colors.holibirthdayRed),
					withFontColor(white),
				]);

				
				return meP.then(function (me) {
					if (me) {
						return stack({}, [
							form.all([
								child(stack({}, [
									stack({}, [
										instructions,
										storyForm,
									].map(function (c) {
										return padding({
											top: 10,
										}, c);
									})),
								])),
								wireChildren(passThroughToFirst),
							]),
						]);
					}
					return bodyColumn(stack({
						gutterSize: separatorSize,
					}, [
						text(siteCopyItems.find('Edit Story Title')).all([
							fonts.bebasNeue,
							$css('font-size', '60px'),
						]),
						paragraph('You must sign in to post a story').all([
							fonts.bebasNeue,
							$css('font-size', '30px'),
							link,
							clickThis(function (ev) {
								signInStream.push(true);
								ev.stopPropagation();
							}),
						]),
					]));
				});
			});
		}));
	};
});
define('defaultFormFor', [
	'fonts',
	'formFor',
], function (fonts, formFor) {
	var labelAll = [
		fonts.h3,
	];

	var defaultFormFor = {};
	
	schema.map(function (table) {
		defaultFormFor[table.name] = formFor[table.name](labelAll);
	});

	return defaultFormFor;
});
define('signInStream', [], function () {
	return Stream.once(false);
});
define('dailyTheme', [
	'colors',
	'db',
	'fonts',
	'holibirthdayRow',
	'meP',
	'prettyForms',
	'separatorSize',
	'signInStream',
	'submitButton',
], function (colors, db, fonts, holibirthdayRow, meP, prettyForms, separatorSize, signInStream, submitButton) {
	return promiseComponent(db.dailyTheme.find({}).then(function (themes) {
		var theme = themes.sort(function (t1, t2) {
			return t2.updateDate.getTime() - t1.updateDate.getTime();
		})[0];
		if (!theme) {
			return holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text('Holibirthday').all([
					fonts.ralewayThinBold,
					fonts.h1,
				]),
			]));
		}
		switch (theme.type) {
		case 'featuredStory':
			return db.story.findOne({
				_id: theme.storyId,
			}).then(function (story) {
				return db.profile.findOne({
					user: story.user,
				}).then(function (profile) {
					return linkTo('#!story/' + story._id, holibirthdayRow(stack({
						gutterSize: separatorSize,
					}, [
						text(story.name).all([
							fonts.ralewayThinBold,
							fonts.h1,
						]),
						linkTo('#!user/' + profile.user, text(profile.firstName + ' ' + profile.lastName).all([
							fonts.ralewayThinBold,
							fonts.h3,
						])),
						paragraph(theme.storyText).all([
							fonts.ralewayThinBold,
						]),
					]), story.imageUrl));
				});
			});
		case 'featuredGift':
			var gift = storeItems[theme.giftId];
			return linkTo("#!gift/" + theme.giftId, holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text(gift.name).all([
					fonts.h1,
				]),
				text(theme.giftText).all([
					fonts.h3,
				]),
			]), gift.imageSrc));
		case 'poll':
			var choiceStream = Stream.create();
			var pollResponseS = Stream.once(null);
			return promiseComponent(db.dailyThemePollResponse.find({
				dailyTheme: theme._id,
			}).then(function (pollResponses) {
				var pollResponsesS = Stream.once(pollResponses);
				return componentStream(pollResponsesS.map(function (pollResponses) {
					meP.then(function (me) {
						if (me) {
							var myPollResponse = pollResponses.filter(function (r) {
								return r.user === me._id;
							})[0];
							if (myPollResponse) {
								pollResponseS.push(myPollResponse);
							}
						}
					});
					var resultBarHeight = 50;
					var scores = theme.pollChoices.map(function (choice) {
						return pollResponses.filter(function (response) {
							return response.choice === choice;
						}).length;
					});
					var totalScore = Math.max(1, scores.reduce(function (a, b) {
						return a + b;
					}, 0));
					var percentages = scores.map(function (score) {
						return score / totalScore;
					});
					var displayResults = theme.pollChoices.map(function (choice, i) {
						return {
							name: choice,
							percentage: percentages[i],
							total: scores[i],
						};
					});
					displayResults.sort(function (a, b) {
						return b.percentage - a.percentage;
					});
					var pollResults = border(white, {
						all: 1,
					}, padding({
						all: separatorSize,
					}, sideBySide({
						gutterSize: separatorSize,
						handleSurplusWidth: giveToSecond,
					}, [
						stack({
							gutterSize: separatorSize,
						}, displayResults.map(function (displayResult) {
							return alignTBM({
								middle: text(displayResult.name).all([
									fonts.ralewayThinBold,
								]),
							}).all([
								withMinHeight(resultBarHeight, true),
							]);
						})),
						stack({
							gutterSize: separatorSize,
						}, displayResults.map(function (displayResult) {
							return withBackground(div.all([
								child(nothing.all([
									withBackgroundColor(colors.holibirthdayDarkRed),
								])),
								wireChildren(function (instance, context) {
									instance.minWidth.push(0);
									instance.minHeight.push(0);
									return [{
										top: Stream.once(0),
										left: Stream.once(0),
										width: context.width.map(function (w) {
											return w * displayResult.percentage;
										}),
										height: context.height,
									}];
								}),
							]), alignTBM({
								middle: padding({
									all: 10,
								}, text(Math.round(displayResult.percentage * 100) + '% (' + displayResult.total + ')').all([
									fonts.ralewayThinBold,
								])),
							}).all([
								withMinHeight(resultBarHeight, true),
							]));
						})),
					])));
					var pollVote = stack({
						gutterSize: separatorSize,
					}, [
						prettyForms.radios({
							options: theme.pollChoices.map(function (choice) {
								return {
									name: choice,
									value: choice,
								};
							}),
							stream: choiceStream,
						}),
						promiseComponent(meP.then(function (me) {
							if (me) {
								return alignLRM({
									left: submitButton(white, text('Vote (or Abstain)').all([
										fonts.bebasNeue,
									])).all([
										link,
										clickThis(function () {
											db.dailyThemePollResponse.insert({
												user: me._id,
												dailyTheme: theme._id,
												choice: choiceStream.lastValue(),
											}).then(function (response) {
												pollResponseS.push(response);
												pollResponsesS.push(pollResponses.concat([response]));
											});
										}),
									]),
								});
							}
							else {
								return alignLRM({
									left: submitButton(white, text('Sign in to vote').all([
										fonts.bebasNeue,
										link,
										clickThis(function (ev) {
											signInStream.push(true);
											ev.stopPropagation();
										}),
									])),
								});
							}
						})),
					]);
					return holibirthdayRow(stack({
						gutterSize: separatorSize,
					}, [
						text(theme.pollTitle).all([
							fonts.h1,
						]),
						text(theme.pollDescription).all([
							fonts.h2,
						]),
						componentStream(pollResponseS.map(function (pollResponse) {
							if (pollResponse) {
								return pollResults;
							}
							else {
								return pollVote;
							}
						})),
					]), theme.pollImage);
				}));
			}));
		case 'someText':
			return holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text(theme.someTextTitle).all([
					fonts.h1,
				]),
				paragraph(theme.someTextText).all([
					fonts.h3,
				]),
			]), theme.someTextImage);
		default:
			return holibirthdayRow(stack({
				gutterSize: separatorSize,
			}, [
				text('Holibirthday').all([
					fonts.ralewayThinBold,
					fonts.h1,
				]),
			]));
		}
	}));
});
define('gridSelect', [], function () {
	return  function (gridConfig, backdropStates) {
		return function (stream, options, multiple) {
			return grid(gridConfig, options.map(function (option, i) {
				var states = backdropStates(option.component);
				return toggleComponent([
					states.selected.all([
						link,
						clickThis(function () {
							if (multiple) {
								var oldArray = stream.lastValue() || [];
								var index = oldArray.indexOf(option.value);
								if (index !== -1) {
									var arr = oldArray.slice(0);
									arr.splice(index, 1);
									stream.push(arr);
								}
							}
						}),
					]),
					states.deselected.all([
						link,
						clickThis(function () {
							if (multiple) {
								var oldArray = stream.lastValue() || [];
								var index = oldArray.indexOf(option.value);
								if (index === -1) {
									stream.push(oldArray.concat([option.value]));
								}
							}
							else {
								stream.push(option.value);
							}
						}),
					]),
				], stream.map(function (v) {
					if (multiple) {
						return v.filter(function (v) {
							return v === options[i].value;
						}).length > 0 ? 0 : 1;
					}
					else {
						return v === options[i].value ? 0 : 1;
					}
				}));
			}));
		};
	};
});
define('giftDetailView', [
	'bar',
	'bodyColumn',
	'cart',
	'colors',
	'confettiBackground',
	'fonts',
	'formatPrice',
	'prettyForms',
	'separatorSize',
	'submitButton',
], function (bar, bodyColumn, cart, colors, confettiBackground, fonts, formatPrice, prettyForms, separatorSize, submitButton) {
	return function (id) {
		var storeItem = storeItems[id];

		var cartItemStreams = {
			storeItem: Stream.once(id),
			color: Stream.once(0),
			size: Stream.once(0),
		};
		var cartItemS = Stream.combineObject(cartItemStreams);
		
		var picture = alignTBM({
			middle: image({
				src: storeItem.imageSrc,
				minWidth: 250,
				chooseHeight: 0,
			}),
		});
		var description = sideBySide({
			handleSurplusWidth: giveToFirst,
		}, [
			stack({
				gutterSize: separatorSize,
			}, [
				text(storeItem.name).all([
					fonts.ralewayThinBold,
					$css('font-size', 40),
				]),
				text('Style: ' + storeItem.style).all([
					fonts.ralewayThinBold,
					$css('font-size', 20),
				]),
				text(storeItem.description).all([
					fonts.ralewayThinBold,
					$css('font-size', 20),
				]),
			]),
			text(formatPrice(storeItem.price)).all([
				fonts.ralewayThinBold,
				$css('font-size', 20),
			]),
		]);

		var heading = confettiBackground(bodyColumn(grid({
			handleSurplusWidth: giveToSecond,
		}, [
			picture,
			padding({
				left: 30,
				right: 30,
				top: 50,
				bottom: 50,
			}, description).all([
				withMinWidth(300, true),
			]),
		])));

		var colorsExpanded = Stream.once(false);

		var darkBackgroundColor = multiplyColor(0.5)(colors.pageBackgroundColor);
		
		var shirtPicker = bodyColumn(border(darkBackgroundColor, {
			all: 1,
			radius: 5,
		}, sideBySide({
			handleSurplusWidth: giveToFirst,
		}, [
			grid({
				minColumnWidth: 150,
				gutterSize: separatorSize,
				outerGutter: true,
			}, storeItem.colors.map(function (color, index) {
				return stack({}, [
					alignLRM({
						middle: image({
							src: color.src,
							minWidth: 100,
						}),
					}),
				]).all([
					link,
					clickThis(function () {
						cartItemStreams.color.push(index);
						colorsExpanded.push(false);
					}),
				]);
			})),
			padding({
				top: separatorSize,
				right: separatorSize,
			}, fonts.fa('close').all([
				$css('font-size', 40),
				withFontColor(darkBackgroundColor),
				link,
				clickThis(function () {
					colorsExpanded.push(false);
				}),
				
				// Crude hack.  The X icon's width ends up being 0 for
				// some reason.  Right here we give it the min width it
				// should have had automatically.
				withMinWidth(31, true),
			])),
		])).all([
			withBackgroundColor(colors.pageBackgroundColor),
		]));

		var alignAllMiddle = function (cs) {
			return cs.map(function (c) {
				return alignLRM({
					middle: c,
				});
			});
		};

		var addToCart = bodyColumn(stack({
			gutterSize: separatorSize,
		}, [
			grid({
				minColumnWidth: 350,
				handleSurplusWidth: evenSplitSurplusWidth,
			}, [
				stack({
					gutterSize: separatorSize,
				}, alignAllMiddle([
					text('Choose Color').all([
						fonts.bebasNeue,
						$css('font-size', 40),
					]),
					text(cartItemStreams.color.map(function (index) {
						return storeItem.colors[index].name;
					})).all([
						fonts.ralewayThinBold,
						$css('font-size', 30),
					]),
					alignLRM({
						left: image({
							src: cartItemStreams.color.map(function (index) {
								return storeItem.colors[index].src;
							}),
							minWidth: 100,
						}).all([
							link,
							clickThis(function () {
								colorsExpanded.push(true);
							}),
						]),
					}),
				])),
				stack({
					gutterSize: separatorSize,
				}, alignAllMiddle([
					text('Choose Size').all([
						fonts.bebasNeue,
						$css('font-size', 40),
					]),
					prettyForms.radios({
						name: 'Category',
						fieldName: 'storyType',
						stream: cartItemStreams.size,
						options: storeItem.sizes.map(function (size, index) {
							return {
								name: size,
								value: index,
							};
						}),
					}),
					image({
						src: storeItem.sizeImageSrc,
						useNativeSize: true,
					}),
				])),
				stack({
					gutterSize: separatorSize,
					align: 'middle',
				}, alignAllMiddle([
					text('Price').all([
						fonts.bebasNeue,
						$css('font-size', 40),
					]),
					text(formatPrice(storeItem.price)).all([
						fonts.ralewayThinBold,
						$css('font-size', 30),
					]),
				])),
			]),
			alignLRM({
				middle: submitButton(black, sideBySide({
					gutterSize: separatorSize,
				}, [
					fonts.fa('shopping-cart'),
					text('Add to Cart'),
				])).all([
					link,
					clickThis(function () {
						cart.addItem(cartItemS.lastValue());
						window.location.hash = '#!cart';
						window.location.reload();
					}),
				]),
			}),
			modalDialog(colorsExpanded, 0.5)(shirtPicker),
		]));
		
		return stack({
			gutterSize: separatorSize,
		}, [
			heading,
			addToCart,
		]);
	};
});
define('holibirthdayRow', [
	'domain',
	'separatorSize',
], function (domain, separatorSize) {
	return function (content, src) {
		return adjustMinSize({
			mw: function (mw) {
				return Math.max(300, mw);
			},
			mh: function (mh) {
				return Math.max(240, mh);
			},
		})(padding({
			all: separatorSize,
		}, grid({
			handleSurplusWidth: giveToNth(1),
			bottomToTop: true,
			gutterSize: separatorSize,
		}, [
			alignTBM({
				middle: alignLRM({
					middle: image({
						src: src || domain + '/content/man.png',
						minWidth: 300,
						chooseHeight: true,
					}),
				}),
			}),
			alignTBM({
				middle: content,
			}),
		])));
	};
});
define('writeOnImage', [], function () {
	return function (dimensions, src, lines) {
		var srcS = Stream.create();
		var canvas = document.createElement('canvas');
		var $canvas = $(canvas);
		$canvas.appendTo($('body'))
			.prop('width', dimensions.width)
			.prop('height', dimensions.height);

		var ctx = canvas.getContext('2d');

		var drawCenteredText = function (p, text, font) {
			ctx.font = font;
			var width = ctx.measureText(text).width;
			ctx.fillText(text, p.x - width / 2, p.y);
		};
		
		var img = new Image();
		img.onload = function() {
			ctx.drawImage(img, 0, 0);
			lines.map(function (line) {
				if (line.center) {
					drawCenteredText(line.center, line.text, line.font);
				}
			});
			setTimeout(function () {
				srcS.push(canvas.toDataURL());
				$canvas.remove();
			});
		};
		img.src = src;
		return srcS;
	};
});
define('orderSuccess', [
	'bodyColumn',
	'confettiBackground',
	'fonts',
	'separatorSize',
], function (bodyColumn, confettiBackground, fonts, separatorSize) {
	var heading = confettiBackground(alignLRM({
		middle: bodyColumn(sideBySide({
			handleSurplusWidth: giveToSecond,
		}, [
			alignTBM({
				middle: image({
					src: './content/man.png',
					minWidth: 300,
					chooseHeight: 0,
				}),
			}),
			padding({
				left: 30,
				right: 30,
				top: 50,
				bottom: 50,
			}, text('Checkout').all([
				fonts.ralewayThinBold,
				$css('font-size', 40),
			])),
		])),
	}));
	
	return function (orderBatch) {
		return stack({
			gutterSize: separatorSize,
		}, [
			heading,
			bodyColumn(stack({
				gutterSize: separatorSize,
			}, [
				text('Order Placed').all([
					fonts.h1,
				]),
				text('Thank you for placing an order with Holibirthday'),
				text('Your order number is ' + orderBatch),
			].map(function (t) {
				return t.all([
					fonts.ralewayThinBold,
				]);
			}))),
		]);
	};
});
define('donateView', [
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
define('ckeditorP', [], function () {
	$('body').append('<script src="./ckeditor/ckeditor.js"></script>');
	return function () {
		var ckeditorD = Q.defer();
		var interval2 = setInterval(function () {
			if (window.CKEDITOR) {
				ckeditorD.resolve(window.CKEDITOR);
				clearInterval(interval2);
			}
		}, 100);
		return ckeditorD.promise;
	};
});
define('gafyColorsForDesignAndStyle', [], function () {
	return function (design, style) {
		var colorsObj = {};
		var appendToColorsObj = function (color) {
			colorsObj[color.name] = color;
		};
		design.colors.map(appendToColorsObj);
		style.colors.map(appendToColorsObj);
		
		var colors = [];
		for (var key in colorsObj) {
			colors.push(colorsObj[key]);
		}
		return colors;
	};
});
define('siteCopyItem', [], function () {
	return function (name) {
		return siteCopyItems
	}
})
define('pageRoutes', [
	'meP',
	'profileViewP',
	'storiesP',
], function (meP, profileViewP, storiesP) {
	var loadAsync = function (thing, args) {
		var d = Q.defer();
		require([thing], function (thing) {
			if (!args) {
				d.resolve(thing);
			}
			else {
				d.resolve(thing.apply(null, args));
			}
		});
		return d.promise;
	};
	return routeToFirst([
		matchStrings([{
			string: '#!admin',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('adminView'));
			}),
		}, {
			string: '#!browseStories',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('browseStoriesView'));
			}),
		}, {
			string: '#!register',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('registerView'));
			}),
		}, {
			string: '#!confirmEmail/',
			router: routeMatchRest(function (token) {
				return promiseComponent(loadAsync('confirmEmailView', [token]));
			}),
		}, {
			string: '#!resetPassword/',
			router: routeMatchRest(function (token) {
				return promiseComponent(loadAsync('resetPasswordView', [token]));
			}),
		}, {
			string: '#!design/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('gafyDesignView', [id]));
			}),
		}, {
			string: '#!gifts',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('storeView'));
			}),
		}, {
			string: '#!cart',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('cartView'));
			}),
		}, {
			string: '#!wishlist/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('wishlistView', [id]));
			}),
		}, {
			string: '#!wishlist',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('wishlistView', []));
			}),
		}, {
			string: '#!checkout',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('checkoutView'));
			}),
		}, {
			string: '#!orderSuccess/',
			router: routeMatchRest(function (orderBatch) {
				return promiseComponent(loadAsync('orderSuccess', [orderBatch]));
			}),
		}, {
			string: '#!myHolibirthday',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('myHolibirthdayView'));
			}),
		}, {
			string: '#!contacts',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('contactsView'));
			}),
		}, {
			string: '#!leaderboards',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('leaderboardsView'));
			}),
		}, {
			string: '#!causes',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('causesView'));
			}),
		}, {
			string: '#!donateSuccess/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('donateSuccess', [id]));
			}),
		}, {
			string: '#!donate',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('donateView'));
			}),
		}, {
			string: '#!story/',
			router: routeMatchRest(function (id) {
				return storiesP.then(function (stories) {
					var story = stories.filter(function (s) {
						return s._id === id;
					})[0];
					return promiseComponent(loadAsync('storyDetailViewP', [story, true]));
				});
			}),
		}, {
			
		}, {
			string: '#!user/',
			router: routeMatchRest(function (id) {
				return profileViewP(id);
			}),
		}, {
			string: '#!editProfile/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('profileEditViewP', [id]));
			}),
		}, {
			string: '#!editStory/',
			router: routeMatchRest(function (id) {
				return storiesP.then(function (stories) {
					var story = stories.filter(function (s) {
						return s._id === id;
					})[0];
					return promiseComponent(loadAsync('storyEditViewP', [story]));
				});
			}),
		}, {
			string: '#!editStory',
			router: routeToComponentF(function () {
				return promiseComponent(meP.then(function (me) {
					return loadAsync('storyEditViewP', [{
						user: (me && me._id) || '',
						name: '',
						text: '',
						imageUrl: './content/man.png',
						storyType: '',
						isPublic: true,
					}]);
				}));
			}),
		}, {
			string: '#!holibirthday/',
			router: routeMatchRest(function (id) {
				return promiseComponent(loadAsync('holibirthdayView', [id]));
			}),
		}, {
			string: '#!contactUs',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('contactUsView'));
			}),
		}, {
			string: '#!privacyPolicy',
			router: routeToComponentF(function () {
				return promiseComponent(loadAsync('privacyPolicyView'));
			}),
		}]),
		routeToComponentF(function () {
			return promiseComponent(loadAsync('homeViewP'));
		}),
	]);
});
define('bodyColumn', [
	'separatorSize',
], function (separatorSize) {
	var columnWidth = 1070;
	var smallerWidth = 870;
	
	return function (c, shrink) {
		return alignLRM({
			middle: padding({
				left: separatorSize,
				right: separatorSize,
			}, c).all([
				withMinWidth(shrink ? smallerWidth : columnWidth, true),
			]),
		}).all([
			componentName('body-column'),
		]);
	};
});
define('opacityGridSelect', [
	'gridSelect',
	'separatorSize',
], function (gridSelect, separatorSize) {
	return gridSelect({
		gutterSize: separatorSize,
	}, function (c) {
		return {
			selected: border(black, {
				all: 1,
			}, padding({
				all: 5,
			}, c).all([
				withBackgroundColor(white),
			])),
			deselected: padding({
				all: 6,
			}, c),
		};
	});
});
