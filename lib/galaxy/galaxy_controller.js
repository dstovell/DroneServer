"use strict";

var starDB = require('../../lib/galaxy/stars');

function GalaxyController(options) {
	var self = this;

	self.starDB = starDB.db;

	self.galaxyHelper = require('../../lib/galaxy/galaxy_helper');

	self.fleetCollection = options.db.collection('fleets');

	self.galaxyStaticCollection = options.db.collection('galaxy_static');
	self.galaxyStaticCollection.ensureIndex({_id: 1}, {unique: true}, function() {});

	self.galaxyStaticCollection.findOne({}, function( err, galaxy ) {
		console.log("self.galaxyStaticCollection.findOne err=" + err);
		if (err) {
			console.log("self.galaxyStaticCollection.findOne err=" + err);
		}
		self.data = galaxy;

		if (self.data != null) {
			self.data.graph = self.galaxyHelper.generateNavGraph(self.data.stars);
			var start = new Date().getTime();
			console.log("path=" + JSON.stringify(self.galaxyHelper.getNavPath(self.data.graph, 0, 7736)) + " took " + (new Date().getTime() - start) + "ms");
		}
	});
}

GalaxyController.prototype.generate = function(cb){
	var self = this;


	self.data = self.galaxyHelper.generateGalaxy(self.starDB);

	var update = {$set:self.data};
	self.galaxyStaticCollection.findAndModify({}, {}, update, {"new":true, "upsert":true}, function( err, galaxy ) {
		if (err) {
			console.log("self.galaxyStaticCollection.findAndModify err=" + err);
			return cb(err);
		}

		console.log("GalaxyController.generate galaxy.length=" + JSON.stringify(self.data).length);

		if (self.data != null) {
			self.data.graph = self.galaxyHelper.generateNavGraph(self.data.stars);
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

