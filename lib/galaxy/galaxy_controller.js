"use strict";

var JobManager = require('../framework/jobmanager');

function GalaxyController(options) {
	var self = this;

	self.galaxyHelper = require('../../lib/galaxy/galaxy_helper');

	self.fleetCollection = options.db.collection('fleets');

	self.galaxyStaticCollection = options.db.collection('galaxy_static');
	self.galaxyStaticCollection.ensureIndex({_id: 1}, {unique: true}, function() {});

	self.galaxyDynamicCollection = options.db.collection('galaxy_dynamic');
	self.galaxyDynamicCollection.ensureIndex({starId: 1}, {unique: true}, function() {});

	self.jm = new JobManager();

	self.galaxyStaticCollection.findOne({randomSeed:self.galaxyHelper.config.randomSeed}, function( err, galaxy ) {
		if (err) {
			console.log("self.galaxyStaticCollection.findOne err=" + err);
		}
		self.data = galaxy;

		if ((self.data != null) && (self.data.stars != null)) {
			console.log("GalaxyController load galaxy starCount=" + Object.keys(self.data.stars).length + " dataSize=" + JSON.stringify(self.data).length);

			//var path = self.galaxyHelper.generateNavPath(self.data.stars, self.data.sectors, self.data.aabb, 11433, 11360, 0);
			//console.log("GalaxyController generateNavPath=" + JSON.stringify(path));
		}
	});
}

GalaxyController.prototype.generate = function(cb){
	var self = this;


	self.data = self.galaxyHelper.generateGalaxy();

	var update = {$set:self.data};
	self.galaxyStaticCollection.findAndModify({randomSeed:self.galaxyHelper.config.randomSeed}, {}, update, {"new":true, "upsert":true}, function( err, galaxy ) {
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

GalaxyController.prototype.getConfig = function(){
	var self = this;
	return self.galaxyHelper.config;
};

GalaxyController.prototype.getGalaxy = function(cb){
	var self = this;

	if (self.data == null) {
		return cb("noGalaxy");
	}

	console.log("aabb=" + JSON.stringify(self.data.aabb));

	return cb(null, self.data);
};

GalaxyController.prototype.getStar = function(starId, cb){
	var self = this;

	if (self.data == null) {
		return cb("noGalaxy");
	}

	var star = self.data.stars[starId];
	if (star == null) {
		return cb("noStar");
	}

	var starCopy = JSON.parse(JSON.stringify(star));

	//starCopy.c = self.galaxyHelper.bvToHex(star.ci);

	self.galaxyHelper.generateSolarSystem(starCopy, self.data.aabb);

	self.galaxyDynamicCollection.findOne({starId:starCopy.id}, function( err, starDynamicData ) {
		if (err) {
			console.log("self.galaxyDynamicCollection.findOne err=" + err);
			return cb(err);
		}

		if (starDynamicData != null) {
			for (var k in starDynamicData) {
				if ((k != "_id") && (k != "starId")) {
					starCopy[k] = starDynamicData[k];
				}
			}
		}

		return cb(null, starCopy);
	});
};

GalaxyController.prototype.processAssetCourse = function(course, cb){
	var self = this;

	return cb(null, course);
};

GalaxyController.prototype.handleAssetCourseSet = function(trans, uid, course, options, cb){
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	var baseAssetKey = "users." + uid + ".assets." + trans;

	self.jm.forEach(course,function(courseSegment, next){
		if (courseSegment.starId == null) {
			return next();
		}

		console.log("handleAssetCourseSet courseSegment=" + JSON.stringify(courseSegment));

		var starId = parseInt(courseSegment.starId);
		delete courseSegment.starId;

		var update = {$set:{}};
		update.$set[baseAssetKey] = courseSegment;

		self.galaxyDynamicCollection.findAndModify({starId:starId}, {}, update, {"new":true, "upsert":true}, function( err, result ) {
			if (err) {
				console.log("self.galaxyStaticCollection.findAndModify err=" + err);
				return next(err);
			}

			return next();
		});
	},
	function(err) {
		return cb(null, {});
	});
};

GalaxyController.prototype.handleAssetCourseRemove = function(trans, uid, course, options, cb){
	var self = this;

	if (cb == null) {
		cb = options;
		options = {};
	}
	options = options || {};

	var baseAssetKey = "users." + uid + ".assets." + trans;

	self.jm.forEach(course,function(courseSegment, next){
		if (courseSegment.starId == null) {
			return next();
		}

		console.log("handleAssetCourseRemove courseSegment=" + JSON.stringify(courseSegment));

		var starId = parseInt(courseSegment.starId);
		delete courseSegment.starId;

		var update = {$unset:{}};
		update.$unset[baseAssetKey] = true;

		self.galaxyDynamicCollection.findAndModify({starId:starId}, {}, update, {"new":true}, function( err, star ) {
			if (err) {
				console.log("self.galaxyDynamicCollection.findAndModify err=" + err);
				return next(err);
			}

			console.log("handleAssetCourseRemove star=" + JSON.stringify(star));

			return next();
		});
	},
	function(err) {
		return cb(null, {});
	});
};


var instance = null;
exports.create = function(options) {
	if( instance == null ) {
		instance = new GalaxyController(options);
	}
	return instance;
};

