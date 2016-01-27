"use strict";

function GalaxyController(options) {
	var self = this;

	self.galaxyHelper = require('../../lib/galaxy/galaxy_helper');

	self.fleetCollection = options.db.collection('fleets');

	self.galaxyStaticCollection = options.db.collection('galaxy_static');
	self.galaxyStaticCollection.ensureIndex({_id: 1}, {unique: true}, function() {});

	self.galaxyStaticCollection.findOne({}, function( err, galaxy ) {
		if (err) {
			console.log("self.galaxyStaticCollection.findOne err=" + err);
		}
		self.data = galaxy;

		if ((self.data != null) && (self.data.stars != null)) {
			console.log("GalaxyController load galaxy starCount=" + Object.keys(self.data.stars).length + " dataSize=" + JSON.stringify(self.data).length);

			var path = self.galaxyHelper.generateNavPath(self.data.stars, self.data.sectors, self.data.aabb, 11433, 11360, 0);
			console.log("GalaxyController generateNavPath=" + JSON.stringify(path));
		}
	});
}

GalaxyController.prototype.generate = function(cb){
	var self = this;


	self.data = self.galaxyHelper.generateGalaxy();

	var update = {$set:self.data};
	self.galaxyStaticCollection.findAndModify({}, {}, update, {"new":true, "upsert":true}, function( err, galaxy ) {
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

	return cb(null, starCopy);
};


var instance = null;
exports.create = function(options) {
	if( instance == null ) {
		instance = new GalaxyController(options);
	}
	return instance;
};

