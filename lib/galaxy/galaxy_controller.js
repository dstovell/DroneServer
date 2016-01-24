"use strict";

var starDB = require('../../lib/galaxy/stars');
var galaxyHelper = require('../../lib/galaxy/galaxy_helper');

function GalaxyController(options) {
	var self = this;

	self.starDB = starDB.db;

	self.fleetCollection = options.db.collection('fleets');

	self.galaxyStaticCollection = options.db.collection('galaxy_static');
	self.galaxyStaticCollection.ensureIndex({_id: 1}, {unique: true}, function() {});

	self.galaxyStaticCollection.findOne({}, function( err, galaxy ) {
		console.log("self.galaxyStaticCollection.findOne err=" + err);
		if (err) {
			console.log("self.galaxyStaticCollection.findOne err=" + err);
		}
		self.data = galaxy;
	});
}

GalaxyController.prototype.generate = function(cb){
	var self = this;


	self.data = galaxyHelper.generateGalaxy(self.starDB);

	var update = {$set:self.data};
	self.galaxyStaticCollection.findAndModify({}, {}, update, {"new":true, "upsert":true}, function( err, galaxy ) {
		if (err) {
			console.log("self.galaxyStaticCollection.findAndModify err=" + err);
			return cb(err);
		}

		console.log("GalaxyController.generate galaxy.length=" + JSON.stringify(self.data).length);

		return cb(null, self.data);
	});
};

GalaxyController.prototype.getGalaxy = function(cb){
	var self = this;

	if (self.data == null) {
		return cb("noGalaxy");
	}

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

	galaxyHelper.generateSolarSystem(starCopy, self.data.aabb);

	return cb(null, starCopy);
};


var instance = null;
exports.create = function(options) {
	if( instance == null ) {
		instance = new GalaxyController(options);
	}
	return instance;
};

