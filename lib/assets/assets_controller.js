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
	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	var location = {
		starId:starId,
		planetId:options.planetId,
		dockId:options.dockId,
		slotId:options.slotId,
	};

	var data = {
		trans:(new ObjectID()).toString(),
		uid: uid,
		assetKey:assetKey,
		attribs:options.attribs || {},
		mods:options.mods || {},
		course:[location],
	};

	self.assetsUserCollection.insert({uid:uid}, function( err, galaxy ) {
		if (err) {
			console.log("self.galaxyStaticCollection.findAndModify err=" + err);
			return cb(err);
		}

		console.log("GalaxyController.generate galaxy dataSize=" + JSON.stringify(self.data).length);

		if (self.data != null) {
			var path = self.galaxyHelper.generateNavPath(self.data.stars, self.data.sectors, self.data.aabb, 11433, 11360, 0);
			console.log("GalaxyController.generate generateNavPath=" + JSON.stringify(path));
		}

		return cb(null, self.data);
	});
};

AssetsController.prototype.setAssetCourse = function(transponder, uid, course, options, cb){
	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	course = course || [];
	if (course.length === 0) {
		return cb("badCourse");
	}

	var query = {trans:transponder, uid:uid};

	self.assetsUserCollection.find(query, function( err, asset ) {
		if (err) {
			console.log("self.assetsUserCollection.find err=" + err);
			return cb(err);
		}

		for (var i=0; i<course.length; i++) {

		}

		var update = { $set:{course:course} };

		self.assetsUserCollection.findAndModify(query, {}, update, {"new":true}, function( err, updatedAsset ) {
			if (err) {
				console.log("self.assetsUserCollection.findAndModify err=" + err);
				return cb(err);
			}

			return cb(null, self.data);
		});
	});
};


AssetsController.prototype.processAsset = function(asset, options, cb){
	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	if (options.clone) {
		asset = JSON.parse( JSON.stringify(asset) );
	}

	var configData = self.config.assets[asset.assetKey];

	for (var k in configData.attribs) {
		if (asset.attribs[k] == null) {
			asset.attribs[k] = configData.attribs;
		}
	}

	for (var m in asset.mods) {
		if (configData.mods[m] != null) {
			var mod = configData.mods[m];
			for (var mk in mod.attribs) {
				asset.attribs[mk] = asset.attribs[mk] || 0;
				asset.attribs[mk] += mod.attribs[mk];
			}
		}
	}

	return cb(null, asset);
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

