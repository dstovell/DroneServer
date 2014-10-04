var JobManager = require('./framework/jobmanager');

function FactionController(options) {
	var self = this;

	self.options = options;
	self.config = options.config;

	var users_controller = require('./users_controller').create(options);

	self.factionCollection = options.db.collection('factions');
	self.factionCollection.ensureIndex({_id: 1}, {unique: true}, function() {});
	//self.factionCollection.ensureIndex({fid: 1}, {unique: true}, function() {});
}

FactionController.prototype.bigBang = function(data, cb) {
	var self = this;

	//Remove all existing factions
	self.factionCollection.remove({}, function (err, result) {
		if (err != null) {
			return cb(err);
		}

		var npcFactions = [];
		
		var jm = new JobManager();
		jm.forEach(self.config.factions.npc,function(factionConfig, next){
			self.addNpcFaction(data.map, factionConfig, function (err, faction) {
				if (err != null) {
					return next(err);
				}

				npcFactions.push(faction);

				next();
			});
		},function(err){
			data.npcFactions = npcFactions;
			return cb(err, data);
		});
	});
}

FactionController.prototype.addNpcFaction = function(map, factionConfig, cb) {
	var self = this;

	var faction = {uid:0, name:factionConfig.name, color:factionConfig.color};

	self.factionCollection.insert(faction, function (err, updatedFaction) {
		if (err != null) {
			return cb(err);
		}

		return cb(null, updatedFaction);
	});
}

FactionController.prototype.addUserFaction = function(uid, factionConfig, cb) {
	var self = this;

	var faction = {uid:uid, name:factionConfig.name, color:factionConfig.color};

	console.log('addUserFaction faction=' + JSON.stringify(faction));

	self.factionCollection.insert(faction, function (err, updatedFaction) {
		if (err != null) {
			return cb(err);
		}

		//investigate...
		if (updatedFaction && updatedFaction.length) {
			updatedFaction = updatedFaction[0];
		}

		console.log('addUserFaction updatedFaction=' + JSON.stringify(updatedFaction));

		return cb(null, updatedFaction);
	});
}

FactionController.prototype.getUserFaction = function(uid, cb) {
	var self = this;

	console.log('getUserFaction uid=' + uid);

	self.factionCollection.findOne({uid:uid}, function (err, faction) {
		if (err != null) {
			return cb(err);
		}

		console.log('getUserFaction faction=' + JSON.stringify(faction));

		return cb(null, faction);		
	});
}

var factionControllerInstance = null;
exports.create = function(options) {
	if( factionControllerInstance == null ) {
		factionControllerInstance = new FactionController(options);
	}
	return factionControllerInstance;
}
