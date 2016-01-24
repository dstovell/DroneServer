"use strict";

var GalaxyHelper = function() {
	var self = this;

	self.config = require('../../lib/galaxy/galaxy_config').galaxy;

	self.maxNumber = 999999999999;
	self.minNumber = -999999999999;
	self.dimensionKeys = ['x', 'y', 'z'];

	self.lightYearsPerParsec = 3.26156;

	self.secsPerMin = 60;
	self.secsPerHour = self.secsPerMin * 60;
	self.secsPerDay = self.secsPerHour * 24;

	self.isObject = function(d) {
		return ( (typeof d === "object") && (d !== null) );
	};

	self.getRandomSeed = function(star) {
		return star.id;
	};

	self._randomSeed = 0;

	self.seedRandomNumber = function(seed) {
	    self._randomSeed = seed + 1;
	};

	self.random = function() {
	    var x = Math.sin(self._randomSeed++) * 10000;
	    return x - Math.floor(x);
	};

	self.randomRangeInt = function(min, max) {
		return Math.floor((self.random() * (max-min+1)) + min);
	};

	self.randomRangeFloat = function(min, max, fixed) {
		var rFloat = ((self.random() * (max-min)) + min);
		return (fixed == null) ? rFloat : parseFloat(rFloat.toFixed(fixed));
	};

	self.randomPick = function(picks) {
		picks = picks || [];
		if (picks.length === 0) {
			return null;
		}

		var total = 0;
		var defaultChance = 1.0/picks.length;
		for (var p=0; p<picks.length; p++) {
			if (!self.isObject(picks[p])) {
				picks[p] = {value:picks[p], chance:defaultChance};
			}
			total += picks[p].chance;
		}

		var val = self.randomRangeFloat(0.0, total);
		var pickTotal = 0;
		for (var pp=0; pp<picks.length; pp++) {
			pickTotal += picks[pp].chance;
			if (pickTotal >= val) {
				return picks[pp].value;
			}
		}

		return null;
	};

	self.interpolateFloat = function(min, max, t) {
		var range = (max - min);
		return min + t*range;
	};

	self.interpolateInt = function(min, max, t) {
		return Math.floor(self.interpolateFloat(min, max, t));
	};

	self.getDistanceSquared = function(pos1, pos2) {
		var total = 0;
		for (var d=0; d<self.dimensionKeys.length; d++) {
			var dKey = self.dimensionKeys[d];
			var delta = (pos2[dKey] - pos1[dKey]);
			total = total + delta*delta;
		}
		return total;
	};

	self.getDistance = function(pos1, pos2) {
		return Math.sqrt( self.getDistanceSquared(pos1, pos2) );
	};

	self.renameParam = function(obj, oldKey, newKey) {
		if (obj[oldKey] != null) {
			if (obj[oldKey] !== "") {
				obj[newKey] = obj[oldKey];
			}
			delete obj[oldKey];
		}
	};

	self.getSector = function(sectorTable, sectorCoords) {
		return (sectorTable[sectorCoords.x] != null) ? sectorTable[sectorCoords.x][sectorCoords.y] : null;
	};

	self.getSectorsAround = function(sectorTable, sectorCoords, options) {
		options = options || {};
		options.range = options.range || 1;
		var sectors = [];

		var min = -1*options.range;
		var max = options.range;
		for (var x=min; x<=max; x++) {
			for (var y=min; y<=max; y++) {
				var sector = self.getSector(sectorTable, {x:(sectorCoords.x+x), y:(sectorCoords.y+y)});
				if (sector) {
					sectors.push(sector);
				}
			}
		}

		return sectors;
	};

	self.getSectorCoordinates = function(pos, aabb) {
		var sectorSize = {};
		sectorSize.x = aabb.x.size / aabb.x.secDim;
		sectorSize.y = aabb.y.size / aabb.y.secDim;

		var sectorCoords = {};
		sectorCoords.x = Math.floor(pos.x/sectorSize.x);
		sectorCoords.y = Math.floor(pos.y/sectorSize.y);

		return sectorCoords;
	};

	self.findNearbyStars = function(starTable, sectorTable, aabb, star, options) {
		options = options || {};
		options.searchArea = options.searchArea || "sectors-near";
		options.range = options.range || 1;
		var near = [];

		if (options.searchArea == "sector") {
			var sectorCoords = self.getSectorCoordinates(star, aabb);
			var sector = self.getSector(sectorTable, sectorCoords);
			if (sector && sector.stars) {
				near = near.concat(sector.stars);
			}
		}
		else if (options.searchArea == "sectors-near") {
			var sectorCoords2 = self.getSectorCoordinates(star, aabb);
			var sectors = self.getSectorsAround(sectorTable, sectorCoords2, options);
			for (var i=0; i<sectors.length; i++) {
				near = near.concat(sectors[i].stars);
			}
		}
		else if (options.searchArea == "galaxy") {
			near = Object.keys(starTable);
		}

		var selfIndex = near.indexOf(star.id);
		if (selfIndex != -1) {
			console.log("removing " + star.id + " from search results");
			near.splice(selfIndex, 1);
		}

		//console.log("findNearbyStars " + star.id + " count=" + near.length);

		return near;
	};

	self.generateBoundingBox = function(starArray, options) {
		starArray = starArray || [];
		options = options || {};
		var multiplier = options.coordinateMult || 1;
		var maxX = options.maxX || self.maxNumber;
		var maxY = options.maxY || self.maxNumber;
		var maxZ = options.maxZ || self.maxNumber;
		var dims = {};

		for (var i=0; i<starArray.length; i++) {
			var star = starArray[i];
			if ((Math.abs(star.x) > maxX) || (Math.abs(star.y) > maxY) || (Math.abs(star.z) > maxZ)) {
				continue;
			}

			for (var d=0; d<self.dimensionKeys.length; d++) {
				var dKey = self.dimensionKeys[d];

				dims[dKey] = dims[dKey] || {min:self.maxNumber, max:self.minNumber};
				dims[dKey].min = Math.min(dims[dKey].min, (star[dKey]*multiplier));
				dims[dKey].max = Math.max(dims[dKey].max, (star[dKey]*multiplier));
				dims[dKey].size = dims[dKey].max - dims[dKey].min;
			}
		}

		return dims;
	};

	self.generateStarTable = function(starArray, options) {
		starArray = starArray || [];
		options = options || {};
		var multiplier = options.coordinateMult || 1;
		var maxX = options.maxX || self.maxNumber;
		var maxY = options.maxY || self.maxNumber;
		var maxZ = options.maxZ || self.maxNumber;

		var table = {};

		for (var i=0; i<starArray.length; i++) {
			var star = starArray[i];

			self.renameParam(star, "proper", "n");
			self.renameParam(star, "absmag", "mag");

			for (var d=0; d<self.dimensionKeys.length; d++) {
				var dKey = self.dimensionKeys[d];
				star[dKey] = star[dKey] * multiplier;
			}

			if ((Math.abs(star.x) > maxX) || (Math.abs(star.y) > maxY) || (Math.abs(star.z) > maxZ)) {
				continue;
			}

			var key = star.id;
			table[key] = star;
		}

		return table;
	};

	self.generateSectorTable = function(starTable, aabb, sectorDimentions) {
		starTable = starTable || {};
		sectorDimentions = sectorDimentions || {};
		aabb.x.secDim = sectorDimentions.x || 10;
		aabb.y.secDim = sectorDimentions.y || 10;

		var table = {};

		for (var k in starTable) {
			var star = starTable[k];
			var sectorCoords = self.getSectorCoordinates(star, aabb);
			table[sectorCoords.x] = table[sectorCoords.x] || {};
			table[sectorCoords.x][sectorCoords.y] = table[sectorCoords.x][sectorCoords.y] || {sc:0};

			table[sectorCoords.x][sectorCoords.y].sc++;
			table[sectorCoords.x][sectorCoords.y].stars = table[sectorCoords.x][sectorCoords.y].stars || [];
			table[sectorCoords.x][sectorCoords.y].stars.push(k);
			//star.s = sectorCoords;
		}

		return table;
	};

	self.isUnlinked = function(star) {
		return ((star.lnk == null) || (star.lnk.length === 0));
	};

	self.generateLink = function(star1, star2) {
		star1.lnk = star1.lnk || [];
		star2.lnk = star2.lnk || [];

		if (star1.lnk.indexOf(star2.id) == -1) {
			star1.lnk.push(star2.id);
			star2.lnk.push(star1.id);
			return true;
		}
		return false;
	};

	self.generateLinks = function(starTable, sectorTable, aabb, options) {
		starTable = starTable || {};
		options = options || {};
		options.maxLinkDist = options.maxLinkDist || 10.0;

		var maxLinkDistSquared = options.maxLinkDist*options.maxLinkDist;

		var linkData = {totalLinkCount:0, maxLinkCount:0, unlinkedCount:Object.keys(starTable).length, searchExpansion1:0, searchExpansion2:0};

		var linkStars = function(s1, s2) {
			var s1Unlinked = self.isUnlinked(s1);
			var s2Unlinked = self.isUnlinked(s2);

			var didLink = self.generateLink(s1, s2);
			if (didLink) {
				linkData.totalLinkCount++;
				linkData.maxLinkCount = Math.max(linkData.maxLinkCount, s1.lnk.length);
				linkData.maxLinkCount = Math.max(linkData.maxLinkCount, s2.lnk.length);
				if (s1Unlinked) {
					linkData.unlinkedCount--;
				}
				if (s2Unlinked) {
					linkData.unlinkedCount--;
				}
			}
		};

		for (var k1 in starTable) {
			var star1 = starTable[k1];
			var closest = {id:-1, dist:self.maxNumber};
			var nearbyStars = self.findNearbyStars(starTable, sectorTable, aabb, star1, {searchArea:"sectors-near", range:1});
			if (nearbyStars.length === 0) {
				linkData.searchExpansion1++;
				console.log("expanding search to range 4");
				nearbyStars = self.findNearbyStars(starTable, sectorTable, aabb, star1, {searchArea:"sectors-near", range:4});
			}
			if (nearbyStars.length === 0) {
				linkData.searchExpansion2++;
				console.log("expanding search to all");
				nearbyStars = self.findNearbyStars(starTable, sectorTable, aabb, star1, {searchArea:"galaxy"});
			}
			//console.log("nearbyStars=" + JSON.stringify(nearbyStars));
			for (var i=0; i<nearbyStars.length; i++) {
				var star2 = starTable[ nearbyStars[i] ];

				if (k1 == star2.id) {//don't need this
					continue;
				}
				var distSquared = self.getDistanceSquared(star1, star2);
				if (closest.dist > distSquared) {
					closest.id = star2.id;
					closest.dist = distSquared;
				}

				if (distSquared < maxLinkDistSquared) {
					linkStars(star1, star2);
				}
			}

			if (self.isUnlinked(star1)) {
				if (closest.id > -1) {
					linkStars(star1, starTable[closest.id]);
				}
			}
		}

		return linkData;
	};

	self.generateGalaxy = function(starArray, options) {
		options = options || {};
		options.inCoord = options.inCoord || "parsec";
		options.outCoord = options.outCoord || "parsec";
		options.maxX = options.maxX || 1000.0;
		options.maxY = options.maxY || 1000.0;
		options.maxLinkDist = options.maxLinkDist || 5.0;

		options.coordinateMult = 1;
		if ((options.inCoord == "parsec") && (options.outCoord == "lightyear")) {
			options.coordinateMult = self.lightYearsPerParsec;
		}
		else if ((options.inCoord == "lightyear") && (options.outCoord == "parsec")) {
			options.coordinateMult = 1.0/self.lightYearsPerParsec;
		}

		options.maxX = options.maxX * options.coordinateMult;
		options.maxY = options.maxY * options.coordinateMult;

		var start = 0;
		var startTotal = new Date().getTime();
		var data = {};

		data.units = options.outCoord;

		console.log("generateGalaxy startInputSize=" + starArray.length);
		console.log("==========================================");

		start = new Date().getTime();
		data.aabb = self.generateBoundingBox(starArray, options);
		console.log("generateBoundingBox took " + (new Date().getTime() - start) + "ms");


		start = new Date().getTime();
		data.stars = self.generateStarTable(starArray, options);
		console.log("generateStarTable took " + (new Date().getTime() - start) + "ms to generate " + Object.keys(data.stars).length + " stars");

		start = new Date().getTime();
		data.sectors = self.generateSectorTable(data.stars, data.aabb, {x:10, y:10});
		console.log("generateSectorTable took " + (new Date().getTime() - start) + "ms");

		start = new Date().getTime();
		data.links = self.generateLinks(data.stars, data.sectors, data.aabb, options);
		console.log("generateLinks took " + (new Date().getTime() - start) + "ms to generate " + data.links.totalLinkCount + " links"); //28423ms -> 16667ms -> 4535ms -> 15812ms

		//start = new Date().getTime();
		//self.generateSolarSystem(data.stars["0"]);
		//console.log("==========================================");
		//self.generateSolarSystem(data.stars["0"]);
		//console.log("generateSolarSystem took " + (new Date().getTime() - start) + "ms");
		
		console.log("==========================================");
		console.log("Total took " + (new Date().getTime() - startTotal) + "ms");

		return data;
	};

	self.generatePlanet = function(star, planetConfig) {
		var planet = {};

		planet.c = self.randomPick( Object.keys(planetConfig.classes) );
		var classData = planetConfig.classes[planet.c];
		planet.od = self.randomRangeFloat( classData.orbitalRange.min, classData.orbitalRange.max, 4 );
		planet.sz = self.randomRangeFloat( classData.sizeRange.min, classData.sizeRange.max, 4 );
		
		var sizePercentage = (planet.sz - classData.sizeRange.min) / (classData.sizeRange.max - classData.sizeRange.min);
		planet.res = {};
		for (var r in (classData.resources||{})) {
			planet.res[r] = self.interpolateInt(classData.resources[r].min, classData.resources[r].max, sizePercentage);
		}

		planet.cn = classData.name;

		return planet;
	};

	self.generateSolarSystem = function(star, aabb, options) {
		self.seedRandomNumber(self.getRandomSeed(star));

		var sectorCoords = self.getSectorCoordinates(star, aabb);
		star.s = sectorCoords;

		var planetConfig = self.config.planets;
		var planetCount = self.randomRangeInt(planetConfig.count.min, planetConfig.count.max);
		star.planets = {};
		var planetList = [];
		for (var i=0; i<planetCount; i++) {
			planetList.push( self.generatePlanet(star, planetConfig) );
		}
		planetList.sort(function( a, b ) {
			return a.od - b.od;
		});
		for (var j=0; j<planetList.length; j++) {
			star.planets[j] = planetList[j];
		}
	};
};

module.exports = new GalaxyHelper();
