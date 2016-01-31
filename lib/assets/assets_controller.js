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

	console.log("AssetsController.prototype.addAsset");

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
		//trans:"12345",
		uid: uid,
		assetKey:assetKey,
		attribs:options.attribs || {},
		mods:options.mods || {},
		course:[location],
	};
	console.log("data=" + JSON.stringify(data));

	self.assetsUserCollection.insert(data, function( err, asset ) {
		console.log("err=" + err + " asset=" + JSON.stringify(asset));
		if (err) {
			console.log("self.galaxyStaticCollection.findAndModify err=" + err);
			return cb(err);
		}

		self.galaxy_controller.handleAssetCourseSet(data.trans, uid, data.course, function( err ) {
			return cb(err, data);
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

			var query = {trans:transponder, uid:uid};

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

