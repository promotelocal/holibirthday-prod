(function () {
	var genSchema = function (editorType, Err, type, ObjectId) {
		var onlyIfAdmin = function (user, doc, db, next) {
			if (!user) {
				return next(false);
			}
			return db.admin.findOne({
				user: user._id
			}, function (admin) {
				return next(admin);
			});
		};
		var schema = [{
			name: 'upload',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'creator',
				type: type.id,
			}],
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.creator));
			},
			mayUpdate: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.creator));
			},
			mayRemove: function (user, doc, db, next) {
				return next(false);
			},
		}, {
			name: 'profile',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'firstName',
				type: type.string,
				editorType: editorType.string,
				displayName: 'First Name',
			}, {
				name: 'lastName',
				type: type.string,
				editorType: editorType.string,
				displayName: 'Last Name',
			}, {
				name: 'email',
				type: type.string,
				editorType: editorType.string,
				displayName: 'Email',
			}, {
				name: 'birthday',
				type: type.date,
				editorType: editorType.date,
				displayName: 'Birthday',
			}, {
				name: 'bio',
				type: type.string,
				editorType: editorType.html,
				displayName: 'Bio',
			}, {
				name: 'imageUrl',
				type: type.string,
				editorType: editorType.image,
				displayName: 'Profile Picture',
			}, {
				name: 'holibirthdayer',
				type: type.bool,
				editorType: editorType.bool,
				displayName: 'I am a Holibirther',
			}, {
				name: 'knowAHolibirthdayer',
				type: type.bool,
				editorType: editorType.bool,
				displayName: 'I know a Holibirther',
			}],
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: function (user, doc, db, next) {
				return next(false);
			},
			mayUpdate: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
			mayRemove: function (user, doc, db, next) {
				return next(false);
			},
		}, {
			name: 'user',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'email',
				type: type.id,
			}, {
				name: 'emailConfirmationToken',
				type: type.string,
			}, {
				name: 'passwordEncrypted',
				type: type.string,
			}, {
				name: 'facebookId',
				type: type.string,
			}],
			mayFind: function (user, doc, db, next) {
				return next(false);
			},
			mayInsert: function (user, doc, db, next) {
				return next(false);
			},
			mayUpdate: function (user, doc, db, next) {
				return next(false);
			},
			mayRemove: function (user, doc, db, next) {
				return next(false);
			},
		}, {
			name: 'admin',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}],
			mayFind: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
			mayInsert: function (user, doc, db, next) {
				return next(false);
			},
			mayUpdate: function (user, doc, db, next) {
				return next(false);
			},
			mayRemove: function (user, doc, db, next) {
				return next(false);
			},
		}, {
			name: 'holibirthday',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'month',
				type: type.number,
			}, {
				name: 'day',
				type: type.number,
			}, {
				name: 'date',
				type: type.date,
			}, {
				name: 'createDate',
				type: type.date,
			}],
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
			mayUpdate: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
			mayRemove: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
		}, {
			name: 'pointsChange',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'amount',
				type: type.number,
			}, {
				name: 'reason',
				type: type.string,
			}, {
				name: 'createDate',
				type: type.date,
			}],
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: function (user, doc, db, next) {
				return next(false);
			},
			mayUpdate: function (user, doc, db, next) {
				return next(false);
			},
			mayRemove: function (user, doc, db, next) {
				return next(false);
			},
		}, {
			name: 'storyLike',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.user,
			}, {
				name: 'story',
				type: type.story,
			}],
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
			mayUpdate: function (user, doc, db, next) {
				return next(false);
			},
			mayRemove: function (user, doc, db, next) {
				return next(false);
			},
		}, {
			name: 'story',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'name',
				type: type.string,
			}, {
				name: 'text',
				type: type.string,
			}, {
				name: 'storyType',
				type: type.string,
			}, {
				name: 'imageUrl',
				type: type.string,
			}, {
				name: 'imageWidth',
				type: type.number,
			}, {
				name: 'isPublic',
				type: type.bool,
			}, {
				name: 'createDate',
				type: type.date,
			}, {
				name: 'updateDate',
				type: type.date,
			}],
			storyType: {
				best: 'best',
				worst: 'worst',
				forgotmenot: 'forgotmenot',
				blog: 'blog',
			},
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: function (user, doc, db, next) {
				if (doc.storyType === 'blog') {
					if (!user) {
						return next(false);
					}
					return db.admin.findOne({
						user: user._id
					}, function (admin) {
						return next(admin);
					});
				}
				return next(ObjectId.equal(user._id, doc.user));
			},
			mayUpdate: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
			mayRemove: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
		}, {
			name: 'comment',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'story',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'text',
				type: type.string,
			}, {
				name: 'createDate',
				type: type.string,
			}, {
				name: 'updateDate',
				type: type.string,
			}],
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
			mayUpdate: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
			mayRemove: function (user, doc, db, next) {
				return next(ObjectId.equal(user._id, doc.user));
			},
		}, {
			name: 'dailyTheme',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'type',
				type: type.string,
				options: {
					featuredStory: 'featuredStory',
					featuredGift: 'featuredGift',
					poll: 'poll',
					someText: 'someText',
				},
			}, {
				// used if type is featuredStory
				name: 'storyId',
				type: type.id,
			}, {
				name: 'storyText',
				type: type.string,
			}, {
				// used if type is featuredGift
				name: 'giftId',
				type: type.number, // change this to id later on
			}, {
				name: 'giftText',
				type: type.string,
			}, {
				// used if type is poll
				name: 'pollTitle',
				type: type.string,
			}, {
				name: 'pollDescription',
				type: type.string,
			}, {
				name: 'pollChoices',
				type: type.string,
			}, {
				// used if type is someText
				name: 'someTextTitle',
				type: type.string,
			}, {
				name: 'someTextText',
				type: type.string,
			}],
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: onlyIfAdmin,
			mayUpdate: onlyIfAdmin,
			mayRemove: onlyIfAdmin,
		}, {
			name: 'dailyThemePollResponse',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'dailyTheme',
				type: type.id,
			}, {
				name: 'option',
				type: type.number,
			}, {
				name: 'createDate',
				type: type.date,
			}],
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: function (user, doc, db, next) {
				return next(user);
			},
			mayUpdate: function (user, doc, db, next) {
				return next(false);
			},
			mayRemove: function (user, doc, db, next) {
				return next(false);
			},
		}, {
			name: 'gafyGarmentType',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'active',
				type: type.bool,
				editorType: editorType.bool,
			}, {
				name: 'styleNumber',
				type: type.string,
				editorType: editorType.string,
			}, {
				name: 'styleDescription',
				type: type.string,
				editorType: editorType.string,
			}, {
				// array of sizes
				name: 'sizes',
				type: type.json,
				editorType: editorType.listOf(editorType.string),
			}, {
				name: 'colors',
				type: type.json,
				editorType: editorType.listOf(editorType.string),
			}],
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: onlyIfAdmin,
			mayUpdate: onlyIfAdmin,
			mayRemove: onlyIfAdmin,
		}, {
			name: 'gafyDesign',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'designNumber',
				type: type.string,
				displayName: 'Design Number',
				editorType: editorType.string,
			}, {
				name: 'designDescription',
				type: type.string,
				displayName: 'Design Description',
				editorType: editorType.string,
			}, {
				name: 'printLocation',
				type: type.string,
				displayName: 'Print Location',
				editorType: editorType.string,
			}, {
				name: 'imageUrl',
				type: type.string,
				displayName: 'Design Image',
				editorType: editorType.image,


			}, {
				name: 'month',
				type: type.string,
				displayName: 'Month / Timeless',
				editorType: editorType.oneOf([
					'Timeless',
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
				]),
			}],
			mayFind: function (user, doc, db, next) {
				return next(true);
			},
			mayInsert: onlyIfAdmin,
			mayUpdate: onlyIfAdmin,
			mayRemove: onlyIfAdmin,
		}, {
			name: 'contactUsMessage',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'message',
				type: type.string,
			}],
			mayFind: function (user, doc, db, next) {
				return next(false);
			},
			mayInsert: function (user, doc, db, next) {
				if (user) {
					return next(true);
				}
				return next(false);
			},
			mayUpdate: function (user, doc, db, next) {
				return next(false);
			},
			mayRemove: function (user, doc, db, next) {
				return next(false);
			},
		}, {
			name: 'order',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.user,
			}, {
				name: 'shopItems',
				type: type.json,
			}, {
				name: 'shippingAddress',
				/*
				  name
				  line 1
				  line 2
				  city
				  state
				  zip
				 */
				type: type.json,
			}],
			mayFind: function (user, doc, db, next) {
				return next(false);
			},
			mayInsert: function (user, doc, db, next) {
				if (user) {
					return next(true);
				}
				return next(false);
			},
			mayUpdate: function (user, doc, db, next) {
				return next(false);
			},
			mayRemove: function (user, doc, db, next) {
				return next(false);
			},
		}];

		schema.map(function (table) {
			schema[table.name] = table;
			table.fields.map(function (field) {
				table.fields[field.name] = field;
			});
		});


		// if we are in node
		if (typeof exports !== 'undefined') {

			var async = require('async');
			
			// allow middleware during database queries
			
			var middleware = function () {
				var pipeline = [];
				return {
					use: function (func) {
						pipeline.push(func);
					},
					invoke: function () {
						var args = Array.prototype.slice.call(arguments);
						var index = args.length - 1;
						var next = args.splice(index, 1)[0];
						
						async.map(pipeline, function (func, next) {
							thisArgs = args.slice();
							thisArgs.push(next);
							func.apply(null, thisArgs);
						}, next);
					},
				};
			};


			schema.map(function (table) {
				table.findMiddleware = middleware();
				table.insertMiddleware = middleware();
				table.updateMiddleware = middleware();
				table.removeMiddleware = middleware();
				
				table.postFindMiddleware = middleware();
				table.postInsertMiddleware = middleware();
				table.postUpdateMiddleware = middleware();
				table.postRemoveMiddleware = middleware();
			});
		}
		
		return schema;
	};


	if (typeof exports === 'undefined') {
		ObjectId.equal = function (id1, id2) {
			return id1 && id2 && id1.toString() === id2.toString();
		};
		window.schema = genSchema(window.editorType, window.Err, window.type, ObjectId);
	}
	else {
		var ObjectID = require('mongodb').ObjectID;
		ObjectID.equal = function (id1, id2) {
			return id1 && id2 && id1.toString() === id2.toString();
		};

		var editorType = require('./editorType');
		var Err = require('./Err');
		var type = require('./type');
		module.exports = genSchema(editorType, Err, type, ObjectID);
	}
})();
