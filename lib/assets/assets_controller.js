"use strict";

var ObjectID = require('mongodb-core').BSON.ObjectID;

function AssetsController(options) {
	var self = this;

	self.config = require('../../lib/assets/assets_config').config;

	self.galaxy_controller = require('../../lib/galaxy/galaxy_controller').create(options);

	self.assetsUserCollection = options.db.collection('assets_user');
	self.assetsUserCollection.ensureIndex({trans: 1}, {}, function() {});
	self.assetsUserCollection.ensureIndex({uid: 1}, {}, function() {});
}

AssetsController.prototype.addAsset = function(assetKey, uid, starId, options, cb){
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	var location = {
		ats:Math.floor((new Date()).getTime() / 1000.0),
		dts:0,
		starId:starId,
		planetId:options.planetId,
		dockId:options.dockId,
		slotId:options.slotId,
	};
	console.log("location=" + JSON.stringify(location));	

	var data = {
		trans:(new ObjectID()).toString(),
		uid: parseInt(uid),
		assetKey:assetKey,
		attribs:options.attribs || {},
		mods:options.mods || {},
		course:[location],
	};

	self.assetsUserCollection.insert(data, function( err, insertResult ) {
		if (err) {
			console.log("self.galaxyStaticCollection.findAndModify err=" + err);
			return cb(err);
		}

		self.galaxy_controller.handleAssetCourseSet(data.trans, uid, data.course, function( err ) {
			if (err) {
				return cb(err);
			}

			var asset = self.processAsset(data, options);
			return cb(err, asset);
		});
	});
};

AssetsController.prototype.removeAsset = function(transponder, uid, options, cb){
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	self.assetsUserCollection.findOne({trans:transponder}, function( err, asset ) {
		if (err) {
			console.log("self.assetsUserCollection.find err=" + err);
			return cb(err);
		}

		if (asset == null) {
			return cb("noAsset");
		}

		self.galaxy_controller.handleAssetCourseRemove(asset.trans, uid, asset.course, function( err ) {
			if (err) {
				return cb(err);
			}

			self.assetsUserCollection.remove({trans:transponder}, function( err, result ) {
				console.log("err=" + err + " result=" + JSON.stringify(result));
				if (err) {
					console.log("self.assetsUserCollection.remove err=" + err);
					return cb(err);
				}

				asset = self.processAsset(asset, options);
				return cb(null, asset);
			});
		});
	});
};

AssetsController.prototype.getRemainingSlotCount = function(asset, additionalMods, removedMods, modConfig) {
	var self = this;

	additionalMods = additionalMods || {};
	removedMods = removedMods || {};	

	var requiredSlotCount = 0;
	var availableSlotCount = asset.attribs.slots || 0;
	asset.mods = asset.mods || {}

	var handleMod = function(modKey, action) {
		var modData = modConfig[modKey];
		if (modData) {
			var reqDelta = (action === "add") ? (modData.slotSize || 0) : -1*(modData.slotSize || 0);
			var availDelta = (action === "add") ? (modData.attribs.slots || 0) : -1*(modData.attribs.slots || 0);
			requiredSlotCount += reqDelta;
			if (availDelta != 0) {
				availableSlotCount += availDelta;
			}
		}
	};

	for (var m in asset.mods) {
		handleMod(m, "add");
	}

	for (var am in additionalMods) {
		handleMod(am, "add");
	}

	for (var am in removedMods) {
		handleMod(am, "remove");
	}

	console.log("getRemainingSlotCount availableSlotCount=" + availableSlotCount + " requiredSlotCount=" + requiredSlotCount);
	return (availableSlotCount - requiredSlotCount);
};

AssetsController.prototype.addAssetMod = function(transponder, uid, modKey, options, cb){
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	if (!self.config.mods[modKey]) {
		return cb("noMod");
	}

	self.assetsUserCollection.findOne({trans:transponder}, function( err, asset ) {
		if (err) {
			console.log("self.assetsUserCollection.find err=" + err);
			return cb(err);
		}

		if (asset == null) {
			return cb("noAsset");
		}

		if (asset.mods && asset.mods[modKey]) {
			return cb("alreadyInstalled");
		}

		var additionalMods = {};
		additionalMods[modKey] = {};
		var remainingSlots = self.getRemainingSlotCount(asset, additionalMods, null, self.config.mods);

		if (remainingSlots < 0) {
			return cb("insufficientSlots");
		}

		var update = {$set:{}};
		update.$set["mods." + modKey] = {};

		self.assetsUserCollection.findAndModify({trans:transponder}, {}, update, {"new":true}, function( err, result ) {
			if (err) {
				console.log("self.assetsUserCollection.findAndModify err=" + err);
				return cb(err);
			}

			asset = self.processAsset(result.value, options);
			return cb(err, asset);
		});
	});
};

AssetsController.prototype.removeAssetMod = function(transponder, uid, modKey, options, cb){
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	if (!self.config.mods[modKey]) {
		return cb("noMod");
	}

	self.assetsUserCollection.findOne({trans:transponder}, function( err, asset ) {
		if (err) {
			console.log("self.assetsUserCollection.find err=" + err);
			return cb(err);
		}

		if (asset == null) {
			return cb("noAsset");
		}

		if (!asset.mods || !asset.mods[modKey]) {
			return cb("notInstalled");
		}

		var removedMods = {};
		removedMods[modKey] = {};
		var remainingSlots = self.getRemainingSlotCount(asset, null, removedMods, self.config.mods);

		if (remainingSlots < 0) {
			return cb("insufficientSlots");
		}

		var update = {$unset:{}};
		update.$unset["mods." + modKey] = {};

		self.assetsUserCollection.findAndModify({trans:transponder}, {}, update, {"new":true}, function( err, result ) {
			if (err) {
				console.log("self.assetsUserCollection.findAndModify err=" + err);
				return cb(err);
			}

			asset = self.processAsset(result.value, options);
			return cb(err, asset);
		});
	});
};

AssetsController.prototype.getAsset = function(transponder, uid, options, cb){
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	self.assetsUserCollection.findOne({trans:transponder}, function( err, asset ) {
		if (err) {
			console.log("self.galaxyStaticCollection.findAndModify err=" + err);
			return cb(err);
		}

		asset = self.processAsset(asset, options);
		return cb(err, asset);
	});
};

AssetsController.prototype.getAssetsForUser = function(uid, options, cb){
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	self.assetsUserCollection.find({uid:uid}, function( err, cursor ) {
		if (err) {
			console.log("self.galaxyStaticCollection.findOne err=" + err);
			return cb(err);
		}

		cursor.toArray(function(err, assets){
			if (err) {
				return cb(err);
			}

			assets = assets || [];
			for (var i=0; i<assets.length; i++) {
				assets[i] = self.processAsset(assets[i], options);
			}

			return cb(null, assets);
		});
	});
};

AssetsController.prototype.buildAssetCourse = function(transponder, uid, destStarId, options, cb){
	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};


	return cb(null, {});
};

AssetsController.prototype.setAssetCourse = function(transponder, uid, destStarId, options, cb){
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	self.assetsUserCollection.find(query, function( err, asset ) {
		if (err) {
			console.log("self.assetsUserCollection.find err=" + err);
			return cb(err);
		}

		self.buildAssetCourse(asset, uid, destStarId, options, function( err, course ) {
			if (err) {
				console.log("self.buildAssetCourse err=" + err);
				return cb(err);
			}

			course = course || [];
			if (course.length === 0) {
				return cb("badCourse");
			}

			var oldCourse = asset.course || [];

			var query = {trans:transponder, uid:uid};

			for (var i=0; i<course.length; i++) {

			}

			var update = { $set:{course:course} };

			self.assetsUserCollection.findAndModify(query, {}, update, {"new":true}, function( err, result ) {
				if (err) {
					console.log("self.assetsUserCollection.findAndModify err=" + err);
					return cb(err);
				}

				var asset = result.value;

				self.galaxy_controller.handleAssetCourseRemove(asset.trans, uid, oldCourse, function( err ) {
					if (err) {
						return cb(err);
					}

					self.galaxy_controller.handleAssetCourseSet(asset.trans, uid, asset.course, function( err ) {
						if (err) {
							return cb(err);
						}

						asset = self.processAsset(asset, options);
						return cb(null, asset);
					});
				});
			});
		});
	});
};


AssetsController.prototype.processAsset = function(asset, options) {
	var self = this;

	options = options || {};

	if (options.clone) {
		asset = JSON.parse( JSON.stringify(asset) );
	}

	var assetConfigData = self.config.assets[asset.assetKey];

	if (assetConfigData == null) {
		console.log("AssetsController.processAsset missing config data for key=" + asset.assetKey);
		return asset;
	}

	for (var k in assetConfigData.attribs) {
		if (asset.attribs[k] == null) {
			asset.attribs[k] = assetConfigData.attribs[k];
		}
	}

	for (var m in asset.mods) {
		var modConfigData = self.config.mods[m];
		if (modConfigData != null) {
			for (var mk in modConfigData.attribs) {
				asset.attribs[mk] = asset.attribs[mk] || 0;
				asset.attribs[mk] += modConfigData.attribs[mk];
			}
		}
	}

	return asset;
};

/*AssetsController.prototype.getConfig = function(){
	var self = this;
	return self.galaxyHelper.config;
};*/


var instance = null;
exports.create = function(options) {
	if( instance == null ) {
		instance = new AssetsController(options);
	}
	return instance;
};

