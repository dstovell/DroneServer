var JobManager = require('./framework/jobmanager');

function FleetController(options) {
	var self = this;

	self.options = options;
	self.config = options.config;

	var users_controller = require('./users_controller').create(options);

	self.fleetCollection = options.db.collection('fleets');
	self.fleetCollection.ensureIndex({_id: 1}, {unique: true}, function() {});
	//self.factionCollection.ensureIndex({fid: 1}, {unique: true}, function() {});
}

FleetController.prototype.bigBang = function(data, cb) {
	var self = this;

	//Remove all existing fleets
	self.fleetCollection.remove({}, function (err, result) {
		if (err != null) {
			return cb(err);
		}

		return cb(null, data);
	});
}

FleetController.prototype.addFactionFleet = function(faction, ships, sid, starId, cb) {
	var self = this;

	console.log('addFleet faction=' + JSON.stringify(faction));

	console.log('addFleet faction._id=' + faction._id);
	console.log('addFleet faction.name=' + faction.name);
	console.log('addFleet faction.color=' + faction.color);

	var fleet = {fid:faction._id, fName:faction.name, color:faction.color, ships:ships, sid:sid, starId:starId};

	console.log('addFleet fleet=' + JSON.stringify(fleet));

	self.fleetCollection.insert(fleet, function (err, updatedFleet) {
		if (err != null) {
			return cb(err);
		}

		//investigate...
		if (updatedFleet && updatedFleet.length) {
			updatedFleet = updatedFleet[0];
		}

		console.log('addFleet updatedFleet=' + JSON.stringify(updatedFleet));

		return cb(null, updatedFleet);
	});
}

FleetController.prototype.getFactionFleet = function(fid, cb) {
	var self = this;

	self.fleetCollection.findOne({fid:fid}, function (err, fleet) {
		if (err != null) {
			return cb(err);
		}

		return cb(null, fleet);		
	});
}

FleetController.prototype.warpFleet = function(uid, fleetId, sid, starId, cb) {
	var self = this;

	self.fleetCollection.findOne({_id:fleetId}, function (err, fleet) {
		if (err != null) {
			return cb(err);
		}

		var currentTime = Math.ceil( new Date().getTime() / 1000 );

		var update = {$set:{}};
		if (fleet.dest) {
			if (fleet.dest.arrivalTime > currentTime) {
				return cb("currentlyWarping");
			}
			else {
				update.$set.sid = fleet.dest.sid;
				update.$set.starId = fleet.dest.starId;
			}
		}

		//here we would calculate the travel time

		//seconds
		var travelTime = 10;
		var leaveTime = currentTime;
		var arrivalTime = leaveTime + travelTime;

		update.$set.dest = {sid:sid, starId:starId, travelTime:travelTime, arrivalTime:arrivalTime};

		self.fleetCollection.findAndModify({_id:fleetId}, {}, update, {new:true}, function (err, updatedFleet) {
			if (err != null) {
				return cb(err);
			}

			return cb(null, updatedFleet);		
		});
	});
}

var fleetControllerInstance = null;
exports.create = function(options) {
	if( fleetControllerInstance == null ) {
		fleetControllerInstance = new FleetController(options);
	}
	return fleetControllerInstance;
}
