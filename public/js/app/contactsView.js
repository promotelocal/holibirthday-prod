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
	'formFor',
	'holibirthdayRow',
	'meP',
	'separatorSize',
	'signInForm',
	'signInStream',
	'siteCopyItemsP',
	'socialMedia',
	'submitButton',
], function (areYouSure, bar, bodyColumn, colors, confettiBackground, db, defaultFormFor, domain, fonts, formFor, holibirthdayRow, meP, separatorSize, signInForm, signInStream, siteCopyItemsP, socialMedia, submitButton) {
	var alignCenter = align();
	var contactsStack = function (rows) {
		return alignLRM({
			middle: stack({
				gutterSize: separatorSize,
			}, intersperse(rows.map(function (r) {
				return grid({
					gutterSize: separatorSize,
					useFullWidth: true,
					handleSurplusWidth: justifyAndCenterSurplusWidth,
				}, r.map(function (c) {
					return alignCenter(c.all([
						$css('text-align', 'center'),
						withMinWidth(170, true),
					]));
				}));
			}), bar.horizontal(1).all([
				withBackgroundColor(colors.middleGray),
			]))),
		});
	};
	return promiseComponent(meP.then(function (me) {
		return siteCopyItemsP.then(function (copy) {
			if (!me) {
				return stack({
					gutterSize: separatorSize,
				}, [
					confettiBackground(bodyColumn(holibirthdayRow(text(copy.find('Contacts Title')).all([
						fonts.ralewayThinBold,
						fonts.h1,
					])))),
					bodyColumn(paragraph(copy.find('Contacts Sign In')).all([
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
												text(profile.birthday ? moment(profile.birthday).utc().format('MMMM Do') : '&nbsp;').all([
													fonts.ralewayThinBold,
												]),
												text(holibirthday ? + moment(holibirthday.date).utc().format('MMMM Do') : '&nbsp;').all([
													fonts.ralewayThinBold,
												]),
												text(profile.email || '&nbsp;').all([
													fonts.ralewayThinBold,
												]),
												text(copy.find('Contacts Remove Contact')).all([
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
											],
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
												text(cc.birthday ? moment(cc.birthday).utc().format('MMMM Do') : '&nbsp;').all([
													fonts.ralewayThinBold,
												]),
												text(copy.find('Contacts No Holibirthday')),
												text(cc.email || '&nbsp;').all([
													fonts.ralewayThinBold,
												]),
												text(copy.find('Contacts Remove Contact')).all([
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
											],
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
											return formFor.contactCustom([
												$css('display', 'none'),
												withMinHeight(0, true),
											])({
												user: me._id,
												name: '',
												birthday: null,
												email: '',
											}, function (newContactS, newContactFields) {
												var headers = [
													text(copy.find('Contacts Contact Name')),
													text(copy.find('Contacts Contact Birthday')),
													text(copy.find('Contacts Contact Holibirthday')),
													text(copy.find('Contacts Contact Email')),
													text(copy.find('Contacts Contact Add / Remove Contact')),
												].map(function (c) {
													return c.all([
														fonts.bebasNeue,
													]);
												});
												var form = [
													newContactFields.name,
													newContactFields.birthday,
													text(copy.find('Contacts No Holibirthday')),
													newContactFields.email,
													submitButton(black, text(copy.find('Contacts Add Contact')).all([
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
												];
												var alignCenter = align();
												return contactsStack([headers].concat(rows).concat([form]));
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
												middle: text(copy.find('Contacts Other Facebook Friends')).all([
													fonts.h2,
												]),
											}) : nothing,
											contactsStack(additionalFacebookFriends.map(function (userId) {
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
													text(profile.birthday ? moment(profile.birthday).utc().format('MMMM Do') : '&nbsp;').all([
														fonts.ralewayThinBold,
													]),
													text(holibirthday ? moment(holibirthday.date).utc().format('MMMM Do') : '&nbsp;').all([
														fonts.ralewayThinBold,
													]),
													text(profile.email || '&nbsp;').all([
														fonts.ralewayThinBold,
													]),
													submitButton(black, text(copy.find('Contacs Add Contact')).all([
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
												];
											})),
										]));
									})),
									alignLRM({
										middle: submitButton(socialMedia.facebook.color, sideBySide({
											gutterSize: separatorSize,
										}, [
											text(socialMedia.facebook.icon).all([
												$css('font-size', '20px'),
											]),
											text(copy.find('Contacts Invite Facebook Friends')).all([
												fonts.bebasNeue,
											]),
										])).all([
											withFontColor(socialMedia.facebook.color),
											link,
											clickThis(function () {
												socialMedia.facebook.shareThisPage({
													imageUrl: copy.find('Contacts Facebook Invite Image'),
													text: copy.find('Contacts Facebook Invite Caption'),
													description: copy.find('Contacts Facebook Invite Description'),
												});
											}),
										]),
									}),
								]);
							}));
						}));
					});
				});
			});
		});
	}));
});
