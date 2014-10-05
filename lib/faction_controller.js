var JobManager = require('./framework/jobmanager');

function FactionController(options) {
	var self = this;

	self.options = options;
	self.config = options.config;

	var users_controller = require('./users_controller').create(options);

	self.factionCollection = options.db.collection('factions');
	self.factionCollection.ensureIndex({_id: 1}, {unique: true}, function() {});
	//self.factionCollection.ensureIndex({fid: 1}, {unique: true}, function() {});

	self.factionSectorCollection = options.db.collection('faction_sector');
	self.factionSectorCollection.ensureIndex({_id: 1}, {unique: true}, function() {});
	self.factionSectorCollection.ensureIndex({sid: 1}, {unique: false}, function() {});
	self.factionSectorCollection.ensureIndex({fid: 1, sid:1}, {unique: true}, function() {});
}

FactionController.prototype.getDataForSector = function(sid, cb) {
	var self = this;

	self.factionSectorCollection.find({sid:sid}, function (err, cursor) {
		if (err) {
			return cb(err);
		}

		cursor.toArray(function(err, factionSectors){
			if (err) {
				return cb(err);
			}

			return cb(null, factionSectors);
		});
	});
}

FactionController.prototype.bigBang = function(data, cb) {
	var self = this;

	//Remove all existing factions
	self.factionCollection.remove({}, function (err, result) {
		if (err != null) {
			return cb(err);
		}

		self.factionSectorCollection.remove({}, function (err, result) {
			if (err != null) {
				return cb(err);
			}

			var npcFactions = [];
			var npcFactionSectors = [];

			//Just one for now...
			var homeSector = data.sectors[0];
			
			var jm = new JobManager();
			jm.forEach(self.config.factions.npc,function(factionConfig, next){
				self.addNpcFaction(npcFactionSectors, homeSector, factionConfig, function (err, faction, factionSector) {
					if (err != null) {
						return next(err);
					}

					npcFactions.push(faction);
					npcFactionSectors.push(factionSector)

					next();
				});
			},function(err){
				data.npcFactions = npcFactions;
				data.npcFactionSectors = npcFactionSectors;
				return cb(err, data);
			});
		});
	});
}

FactionController.prototype.isControlled = function(factionSectors, sid, starId) {
	var self = this;

	//console.log("isControlled sid=" + sid + " starId=" + starId);

	for (var i in factionSectors) {
		if (factionSectors[i].sid == sid) {
			if (factionSectors[i].controlled[starId]) {
				return true;
			}
		}
	}

	return false;
}

FactionController.prototype.getNpcConfig = function(name) {
	var self = this;

	for (var i in self.config.factions.npc) {
		if (self.config.factions.npc[i].name == name) {
			return self.config.factions.npc[i];
		}
	}

	return null;
}

FactionController.prototype.generateSectorTerritory = function(factionSectors, sector, faction) {
	var self = this;

	var factionSector = {fid:faction._id, fName:faction.name, color:faction.color, sid:sector.sid, controlled:{}, visited:[]};
	var config = self.getNpcConfig(faction.name);

	if (config.starCount <= 0) {
		return factionSector;
	}

	var capitalStar = null;
	for (var i in sector.map.stars) {
		var star = sector.map.stars[i];
		if (!self.isControlled(factionSectors, sector.sid, star.id)) {
			capitalStar = star;
			factionSector.visited.push(star.id);
			var control = {capital:true};
			factionSector.controlled[star.id] = control;
			break;
		}
	}

	if (!capitalStar || (config.starCount == 1)) {
		return factionSector;
	}	

	//Recursively build the territory...must be careful here!
	var remainingStarCount = config.starCount - 1;
	self.generateSectorTerritoryR(factionSectors, sector, faction, factionSector, capitalStar, remainingStarCount);

	return factionSector;
}

FactionController.prototype.generateSectorTerritoryR = function(factionSectors, sector, faction, factionSector, startStar, starCount) {
	var self = this;

	var justAdded = [];

	var starsAdded = 0;
	var connections = self.getStarConnections(sector, startStar.id);
	for (var i in connections) {
		var thisStar = connections[i];
		
		if (!self.isControlled(factionSectors, sector.sid, thisStar.id) && !self.isControlled([factionSector], sector.sid, thisStar.id)) {
			factionSector.visited.push(thisStar.id);
			var control = {};
			factionSector.controlled[thisStar.id] = control;
			starCount--;
			starsAdded++;

			justAdded.push(thisStar);
		}

		if (starCount <= 0) {
			return starsAdded;
		}
	}

	for (var i in justAdded) {
		var thisStar = justAdded[i];
		
		var newStars = self.generateSectorTerritoryR(factionSectors, sector, faction, factionSector, thisStar, starCount);
		starCount -= newStars;
		starsAdded += newStars;
		if (starCount <= 0) {
			return starsAdded;
		}
	}

	return starsAdded;
}

FactionController.prototype.getStarConnections = function(sector, starId) {
	var self = this;

	function getStar(id) {
		//console.log("getStar id=" + id);
		for (var j in sector.map.stars) {
			if (sector.map.stars[j].id == id) {
				//console.log("getStar id=" + sector.map.stars[j].id);
				return sector.map.stars[j];
			}
		}
		return null;
	}

	//console.log("check link sector=" + JSON.stringify(sector));

	var connections = [];
	for (var i in sector.map.links) {
		var link = sector.map.links[i];
		//console.log("check link link=" + JSON.stringify(link));
		if (link[0] == starId) {
			var s = getStar(link[1]);
			if (s) connections.push(s);
		}
		else if (link[1] == starId) {
			var s = getStar(link[0]);
			if (s) connections.push(s);
		}
	}

	return connections;
}

FactionController.prototype.addNpcFaction = function(factionSectors, sector, factionConfig, cb) {
	var self = this;

	var faction = {uid:0, name:factionConfig.name, color:factionConfig.color};

	self.factionCollection.insert(faction, function (err, updatedFaction) {
		if (err != null) {
			return cb(err);
		}

		//investigate...
		if (updatedFaction && updatedFaction.length) {
			updatedFaction = updatedFaction[0];
		}

		var factionSector = self.generateSectorTerritory(factionSectors, sector, updatedFaction);

		self.factionSectorCollection.insert(factionSector, function (err, updatedFactionSector) {
			if (err != null) {
				return cb(err);
			}

			//investigate...
			if (updatedFactionSector && updatedFactionSector.length) {
				updatedFactionSector = updatedFactionSector[0];
			}

			return cb(null, updatedFaction, updatedFactionSector);
		});
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

/*
	function GenerateAIFaction(factionName : String, factionColor : Color, starCount : int)
	{
		FactionManager.AddFaction(factionName, factionColor, false, false);
	
		for (var i=0; i<stars.Length; i++)
		{
			var thisStar : StarNode = stars[stars.Length-i-1];
			if (!FactionManager.IsTerritoryControlled(thisStar) && !FactionManager.IsTerritoryOccupied(thisStar))
			{
				FactionManager.ChangeTerritoryControl(thisStar, factionName, true);
				FactionManager.BuildBase(thisStar.planets[0], factionName);
				
				GenerateTerritory(thisStar, factionName, factionColor, starCount-1);
				return;
			}
		}
	}
	
	function GenerateTerritory(startStar : StarNode, factionName : String, factionColor : Color, starCount : int) : int
	{
		var starsAdded : int = 0;
		var i : int = 0;
		var thisStar : StarNode = null;
		for (i=0; i<startStar.connections.Count; i++)
		{
			if (startStar.connections[i].startStar == startStar)
				thisStar = startStar.connections[i].endStar;
			else
				thisStar = startStar.connections[i].startStar;
			
			if (!FactionManager.IsTerritoryControlled(thisStar) && !FactionManager.IsTerritoryOccupied(thisStar))
			{
				FactionManager.ChangeTerritoryControl(thisStar, factionName, false);
				FactionManager.BuildBase(thisStar.planets[0], factionName);
				starCount--;
				starsAdded++;
			}
			if (starCount <= 0)
				return starsAdded;
		}
		
		for (i=0; i<startStar.connections.Count; i++)
		{
			if (startStar.connections[i].startStar == startStar)
				thisStar = startStar.connections[i].endStar;
			else
				thisStar = startStar.connections[i].startStar;
			
			if (!FactionManager.IsTerritoryControlled(thisStar) && !FactionManager.IsTerritoryOccupied(thisStar))
			{
				var newStars : int = GenerateTerritory(thisStar, factionName, factionColor, starCount);
				starCount -= newStars;
				starsAdded += newStars;
				if (starCount <= 0)
					return starsAdded;
			}
		}
		
		return starsAdded;
	}

	*/
