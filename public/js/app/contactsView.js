define([
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
											return alignLRM({
												middle: stack({
													gutterSize: separatorSize,
												}, intersperse(rows.map(function (r) {
													return grid({
														gutterSize: separatorSize,
														useFullWidth: true,
														handleSurplusWidth: justifyAndCenterSurplusWidth,
													}, r.map(function (c) {
														return c.all([
															withMinWidth(170, true),
														]);
													}));
												}).concat([
													grid({
														gutterSize: separatorSize,
														useFullWidth: true,
														handleSurplusWidth: justifyAndCenterSurplusWidth,
													}, [
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
													].map(function (c) {
														return c.all([
															withMinWidth(170, true),
														]);
													})),
												]), bar.horizontal(1).all([
													withBackgroundColor(colors.middleGray),
												]))),
											});
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
