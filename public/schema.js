(function () {
	var genSchema = function (editorType, Err, type, ObjectId) {
		var always = function (user, doc, db, next) {
			return next(true);
		};
		var never = function (user, doc, db, next) {
			return next(false);
		};
		var ifAdmin = function (user, doc, db, next) {
			if (!user) {
				return next(false);
			}
			return db.admin.findOne({
				user: user._id
			}, function (admin) {
				return next(admin);
			});
		};
		var ifOwner = function (userProp) {
			return function (user, doc, db, next) {
				if (!user) {
					return next(false);
				}
				if (!doc) {
					return next(false);
				}
				return next(ObjectId.equal(user._id, doc[userProp]));
			};
		};
		var ifLoggedIn = function (user, doc, db, next) {
			return next(user);
		};
		var any = function (constraints) {
			// ahahahahahaaaaaaaaaahahaha
			var async = require('async');
			return function (user, doc, db, next) {
				
			};
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
			mayFind: always,
			mayInsert: ifOwner('creator'),
			mayUpdate: ifOwner('creator'),
			mayRemove: never,
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
				name: 'holibirther',
				type: type.bool,
				editorType: editorType.bool,
				displayName: 'I am a Holibirther',
			}, {
				name: 'knowAHolibirther',
				type: type.bool,
				editorType: editorType.bool,
				displayName: 'I know a Holibirther',
			}, {
				name: 'receiveMarketingEmails',
				type: type.bool,
				editorType: editorType.bool,
				displayName: 'I wish to receive emails from Holibirthday',
			}],
			mayFind: always,
			mayInsert: never,
			mayUpdate: ifOwner('user'),
			mayRemove: never,
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
			mayFind: never,
			mayInsert: never,
			mayUpdate: never,
			mayRemove: never,
		}, {
			name: 'admin',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}],
			mayFind: ifOwner('user'),
			mayInsert: never,
			mayUpdate: never,
			mayRemove: never,
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
				editorType: editorType.number,
				displayName: 'Holibirth-month',
			}, {
				name: 'day',
				type: type.number,
				editorType: editorType.number,
				displayName: 'Holibirth-day',
			}, {
				name: 'date',
				type: type.date,
				editorType: editorType.date,
				displayName: 'Holibirthdate',
			}, {
				name: 'createDate',
				type: type.date,
			}],
			mayFind: always,
			mayInsert: ifOwner('user'),
			mayUpdate: ifOwner('user'),
			mayRemove: ifOwner('user'),
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
			mayFind: always,
			mayInsert: never,
			mayUpdate: never,
			mayRemove: never,
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
			mayFind: always,
			mayInsert: ifOwner('user'),
			mayUpdate: never,
			mayRemove: never,
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
			mayFind: always,
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
			mayUpdate: ifOwner('user'),
			mayRemove: ifOwner('user'),
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
			mayFind: always,
			mayInsert: ifOwner('user'),
			mayUpdate: ifOwner('user'),
			mayRemove: ifOwner('user'),
		}, {
			name: 'dailyTheme',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'createDate',
				type: type.date,
			}, {
				name: 'updateDate',
				type: type.date,
			}, {
				name: 'type',
				type: type.string,
				options: {
					featuredStory: 'featuredStory',
					featuredGift: 'featuredGift',
					poll: 'poll',
					someText: 'someText',
				},
				displayName: 'Type',
				editorType: editorType.enumeration([{
					name: 'Featured Story',
					value: 'featuredStory',
				}, {
					name: 'Featured Gift',
					value: 'featuredGift',
				}, {
					name: 'Poll',
					value: 'poll',
				}, {
					name: 'Some Text',
					value: 'someText',
				}]),
			}, {
				// used if type is featuredStory
				name: 'storyId',
				type: type.id,
				displayName: 'Story',
				editorType: editorType.foreignKey('story', 'name'),
			}, {
				name: 'storyText',
				type: type.string,
				displayName: 'Description',
				editorType: editorType.html,
			}, {
				// used if type is featuredGift
				name: 'giftId',
				type: type.number, // change this to id later on
				displayName: 'Gift',
				editorType: {
					name: 'gift',
				},
			}, {
				name: 'giftText',
				type: type.string,
				displayName: 'Description',
				editorType: editorType.html,
			}, {
				// used if type is poll
				name: 'pollTitle',
				type: type.string,
				displayName: 'Title',
				editorType: editorType.string,
			}, {
				name: 'pollDescription',
				type: type.string,
				displayName: 'Description',
				editorType: editorType.html,
			}, {
				name: 'pollChoices',
				type: type.json,
				displayName: 'Choices',
				editorType: editorType.listOf(editorType.string),
			}, {
				name: 'pollImage',
				type: type.string,
				displayName: 'Picture',
				editorType: editorType.image,
			}, {
				// used if type is someText
				name: 'someTextTitle',
				type: type.string,
				displayName: 'Title',
				editorType: editorType.string,
			}, {
				name: 'someTextText',
				type: type.string,
				displayName: 'Text',
				editorType: editorType.html,
			}, {
				name: 'someTextImage',
				type: type.string,
				displayName: 'Picture',
				editorType: editorType.image,
			}],
			mayFind: always,
			mayInsert: ifAdmin,
			mayUpdate: ifAdmin,
			mayRemove: ifAdmin,
		}, {
			name: 'dailyThemePollResponse',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'dailyTheme',
				type: type.id,
			}, {
				name: 'choice',
				type: type.number,
			}, {
				name: 'createDate',
				type: type.date,
			}],
			mayFind: always,
			mayInsert: ifLoggedIn,
			mayUpdate: never,
			mayRemove: never,
		}, {
			name: 'gafyStyle',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'styleNumber',
				type: type.string,
				editorType: editorType.string,
				displayName: 'Style Number',
			}, {
				name: 'styleDescription',
				type: type.string,
				editorType: editorType.string,
				displayName: 'Style Description',
			}, {
				name: 'imageUrl',
				type: type.string,
				displayName: 'Style Picture',
				editorType: editorType.image,
			}, {
				name: 'sizesImageUrl',
				type: type.string,
				displayName: 'Sizes Chart Picture',
				editorType: editorType.image,
			}, {
				// array of sizes
				name: 'sizes',
				type: type.json,
				editorType: editorType.listOf(editorType.string),
				displayName: 'Sizes',
			}, {
				name: 'colors',
				type: type.json,
				editorType: {
					name: 'gafyColor',
				},
				displayName: 'Colors',
			}, {
				name: 'price',
				type: type.json,
				editorType: editorType.number,
				displayName: 'Price',
			}],
			mayFind: always,
			mayInsert: ifAdmin,
			mayUpdate: ifAdmin,
			mayRemove: ifAdmin,
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
				name: 'styles',
				type: type.json,
				displayName: 'Styles',
				editorType: {
					name: 'gafyStyle',
				},
			}, {
				name: 'colors',
				type: type.json,
				displayName: 'Colors',
				editorType: {
					name: 'gafyColor',
				},
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
			mayFind: always,
			mayInsert: ifAdmin,
			mayUpdate: ifAdmin,
			mayRemove: ifAdmin,
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
			mayFind: never,
			mayInsert: ifLoggedIn,
			mayUpdate: never,
			mayRemove: never,
		}, {
			name: 'siteCopyItem',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'uniqueName',
				type: type.string,
			}, {
				name: 'value',
				type: type.string,
			}],
			mayFind: always,
			mayInsert: ifAdmin,
			mayUpdate: ifAdmin,
			mayRemove: ifAdmin,
			options: [{
				name: 'Home Tagline',
				multiline: false,
			}, {
				name: 'Home Share Your Story',
				multiline: false,
			}, {
				name: 'Home Claim Your Holibirthday',
				multiline: false,
			}, {
				name: 'Home Find Friends',
				multiline: false,
			}, {
				name: 'Edit Story Title',
				multiline: false,
			}, {
				name: 'Edit Story Smaller Title',
				multiline: false,
			}, {
				name: 'Edit Story Instructions',
				multiline: true,
			}, {
				name: 'Edit Story Submit Instructions',
				multiline: true,
			}, {
				name: 'Order Confirmation Email: From',
				multiline: false,
			}, {
				name: 'Order Confirmation Email: From Name',
				multiline: false,
			}, {
				name: 'Order Confirmation Email: Subject',
				multiline: false,
			}, {
				name: 'Order Confirmation Email: Text ( {{orderNumber}} includes order number)',
				multiline: true,
			}, {
				name: 'Header Gifts',
				multiline: true,
			}, {
				name: 'Header Cart',
				multiline: true,
			}, {
				name: 'Header Wishlist',
				multiline: true,
			}, {
				name: 'Header My Profile',
				multiline: true,
			}, {
				name: 'Header Sign In',
				multiline: true,
			}, {
				name: 'Header Sign Out',
				multiline: true,
			}, {
				name: 'Header Register',
				multiline: true,
			}, {
				name: 'Header Admin',
				multiline: true,
			}],
		}, {
			name: 'gafyOrder',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'orderBatch',
				type: type.string,
			}, {
				name: 'customerEmailAddress',
				type: type.string,
			}, {
				name: 'firstName',
				type: type.string,
			}, {
				name: 'lastName',
				type: type.string,
			}, {
				name: 'addressLine1',
				type: type.string,
			}, {
				name: 'addressLine2',
				type: type.string,
			}, {
				name: 'addressCity',
				type: type.string,
			}, {
				name: 'addressState',
				type: type.string,
			}, {
				name: 'addressZip',
				type: type.string,
			}, {
				name: 'addressCountry',
				type: type.string,
			}, {
				name: 'designNumber',
				type: type.string,
			}, {
				name: 'designDescription',
				type: type.string,
			}, {
				name: 'printLocation',
				type: type.string,
			}, {
				name: 'styleNumber',
				type: type.string,
			}, {
				name: 'styleDescription',
				type: type.string,
			}, {
				name: 'color',
				type: type.string,
			}, {
				name: 'size',
				type: type.string,
			}, {
				name: 'quantity',
				type: type.number,
			}, {
				name: 'shippingMethod',
				type: type.string,
			}],
			mayFind: never,
			mayInsert: always,
			mayUpdate: never,
			mayRemove: never,
		}, {
			name: 'stripePayment',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'email',
				type: type.string,
			}, {
				name: 'orderBatch',
				type: type.string,
			}, {
				name: 'amount',
				type: type.number,
			}, {
				name: 'stripeToken',
				type: type.string,
			}],
			mayFind: never,
			mayInsert: always,
			mayUpdate: never,
			mayRemove: never,
		}, {
			name: 'gafyWishlist',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'items',
				type: type.json,
			}],
			mayFind: always,
			mayInsert: ifOwner('user'),
			mayUpdate: ifOwner('user'),
			mayRemove: ifOwner('user'),
		}, {
			name: 'sendEmail',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'constraintSource',
				type: type.string,
			}, {
				name: 'monthGT',
				type: type.number,
			}, {
				name: 'dayGT',
				type: type.number,
			}, {
				name: 'monthLT',
				type: type.number,
			}, {
				name: 'dayLT',
				type: type.number,
			}, {
				name: 'from',
				type: type.string,
			}, {
				name: 'fromName',
				type: type.string,
			}, {
				name: 'subject',
				type: type.string,
			}, {
				name: 'text',
				type: type.string,
			}],
			mayFind: never,
			mayInsert: ifAdmin,
			mayUpdate: never,
			mayRemove: never,
		}, {
			name: 'famousBirthday',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'name',
				type: type.string,
				displayName: 'Name',
				editorType: editorType.string,
			}, {
				name: 'birthday',
				type: type.date,
				displayName: 'Birthday (year is ignored)',
				editorType: editorType.date,
			}, {
				name: 'description',
				type: type.string,
				displayName: 'Description',
				editorType: editorType.paragraph,
			}, {
				name: 'imageUrl',
				type: type.string,
				displayName: 'Image',
				editorType: editorType.image,
			}],
			mayFind: always,
			mayInsert: ifAdmin,
			mayUpdate: ifAdmin,
			mayRemove: ifAdmin,
		}, {
			name: 'contactOtherUser',
			fields: [{
				name: '_id',
				type: type.id,
			}, {
				name: 'user',
				type: type.id,
			}, {
				name: 'otherUser',
				type: type.id,
			}],
			mayFind: ifOwner('user'),
			mayInsert: ifOwner('user'),
			mayUpdate: ifOwner('user'),
			mayRemove: ifOwner('user'),
		}, {
			name: 'contactCustom',
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
				name: 'birthday',
				type: type.date,
			}, {
				name: 'email',
				type: type.date,
			}],
			mayFind: ifOwner('user'),
			mayInsert: ifOwner('user'),
			mayUpdate: ifOwner('user'),
			mayRemove: ifOwner('user'),
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
