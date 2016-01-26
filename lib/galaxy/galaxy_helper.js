"use strict";

var GalaxyHelper = function() {
	var self = this;

	self.config = require('../../lib/galaxy/galaxy_config').galaxy;

	self.maxNumber = 999999999999;
	self.minNumber = -999999999999;
	self.dimensionKeys = ['x', 'y'];

	self.lightYearsPerParsec = 3.26156;

	self.secsPerMin = 60;
	self.secsPerHour = self.secsPerMin * 60;
	self.secsPerDay = self.secsPerHour * 24;

	self.isObject = function(d) {
		return ( (typeof d === "object") && (d !== null) );
	};

	self.getRandomSeed = function(star) {
		return (star != null) ? (star.id + self.config.randomSeed) : self.config.randomSeed;
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
		if (min === max) {
			return min;
		}
		return Math.floor((self.random() * (max-min+1)) + min);
	};

	self.randomRangeFloat = function(min, max, fixed) {
		if (min === max) {
			return min;
		}
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


	self.bvToRgb = function(bv) {    // RGB <0,1> <- BV <-0.4,+2.0> [-]
    	var r;
    	var g;
    	var b;
    	var t;  r=0.0; g=0.0; b=0.0; if (bv<-0.4) bv=-0.4; if (bv> 2.0) bv= 2.0;
		if ((bv>=-0.40)&&(bv<0.00)) { t=(bv+0.40)/(0.00+0.40); r=0.61+(0.11*t)+(0.1*t*t); }
    	else if ((bv>= 0.00)&&(bv<0.40)) { t=(bv-0.00)/(0.40-0.00); r=0.83+(0.17*t)          ; }
    	else if ((bv>= 0.40)&&(bv<2.10)) { t=(bv-0.40)/(2.10-0.40); r=1.00                   ; }
        if ((bv>=-0.40)&&(bv<0.00)) { t=(bv+0.40)/(0.00+0.40); g=0.70+(0.07*t)+(0.1*t*t); }
		else if ((bv>= 0.00)&&(bv<0.40)) { t=(bv-0.00)/(0.40-0.00); g=0.87+(0.11*t)          ; }
		else if ((bv>= 0.40)&&(bv<1.60)) { t=(bv-0.40)/(1.60-0.40); g=0.98-(0.16*t)          ; }
		else if ((bv>= 1.60)&&(bv<2.00)) { t=(bv-1.60)/(2.00-1.60); g=0.82         -(0.5*t*t); }
		if ((bv>=-0.40)&&(bv<0.40)) { t=(bv+0.40)/(0.40+0.40); b=1.00                   ; }
		else if ((bv>= 0.40)&&(bv<1.50)) { t=(bv-0.40)/(1.50-0.40); b=1.00-(0.47*t)+(0.1*t*t); }
		else if ((bv>= 1.50)&&(bv<1.94)) { t=(bv-1.50)/(1.94-1.50); b=0.63         -(0.6*t*t); }

		return {r:r,g:g,b:b};
    };

	self.rgbToHex = function(red, green, blue) {
        var rgb = blue | (green << 8) | (red << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1);
  	};

  	self.bvToHex = function(bv) {
  		var colour = self.bvToRgb(bv);
		return self.rgbToHex(colour.r, colour.g, colour.b);
  	};

  	self.getStarRadius = function(M) {
  		if (M === 1.0) {
  			return 1.0;
  		}
  		else if (M < 1.0) {
  			return Math.pow(M, 0.8);
  		}
  		else {
  			return Math.pow(M, 0.5);
  		}
  	};

  	self.getStarLuminosity = function(M) {
  		return Math.pow(M, 3.5);
  	};

  	self.getStarTemperature = function(M) {
  		var L = self.getStarLuminosity(M);
  		var R = self.getStarRadius(M);
  		return Math.pow( (L/Math.pow(R, 2)), 0.25);
  	};

  	self.getStarHabitableZone = function(M) {
  		var L = self.getStarLuminosity(M);
  		var zone = {};
  		zone.min = Math.sqrt( L / 1.1 );
  		zone.max = Math.sqrt( L / 0.53 );
  		return zone;
  	};

  	self.getStarPlanetZone = function(M) {
  		var zone = {};
  		zone.min = 0.1 * M;
  		zone.max = 40.0 * M;
  		return zone;
  	};

  	self.getStarFrostPoint = function(M) {
  		var L = self.getStarLuminosity(M);
  		return 4.85 * Math.sqrt( L );
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

	self.generateNavGraph = function(starTable) {
		var graph = require('../../lib/galaxy/dijkstras');

		var start = new Date().getTime();
		
		for (var starId in starTable) {
			var star = starTable[starId];
			var links = {};
			for (var i=0; i<star.lnk.length; i++) {
				links[star.lnk[i]] = 1;
			}
			graph.addVertex(starId, links);
		}

		console.log("generateNavGraph took " + (new Date().getTime() - start) + "ms");

		return graph;
	};

	self.getNavPath = function(graph, starIdStart, starIdEnd) {
		var path = graph.shortestPath(starIdStart.toString(), starIdEnd.toString());

		path.push(starIdStart.toString());
		path.reverse();

		return path;
	};

	self.generateProceduralBoundingBox = function(options) {
		var dimensions = this.config.dimensions;
		options = options || {};
		var dims = {};

		for (var d=0; d<self.dimensionKeys.length; d++) {
			var dKey = self.dimensionKeys[d];
			dims[dKey] = {min:(-1*dimensions[dKey]), max:dimensions[dKey]};
			dims[dKey].size = dims[dKey].max - dims[dKey].min;
		}

		return dims;
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

	self.generateProceduralStarTable = function(aabb, options) {
		self.seedRandomNumber(self.getRandomSeed());

		options = options || {};
		//var units = options.units || "lightyear";

		var table = {};

		var starClasses = [];
		for (var k in self.config.stars.classes) {
			starClasses.push({value:k, chance:self.config.stars.classes[k].chance});
		}

		//console.log("generateProceduralStarTable self.config.starCount=" + self.config.starCount);
		//console.log("generateProceduralStarTable aabb=" + JSON.stringify(aabb));
		//console.log("generateProceduralStarTable starClasses=" + JSON.stringify(starClasses));

		var useOld = false;
		if (useOld) {
			for (var i=0; i<self.config.starCount; i++) {
				var star = {id:i};

				//something better later....
				for (var d=0; d<self.dimensionKeys.length; d++) {
					var dKey = self.dimensionKeys[d];
					if ((aabb[dKey].min !== 0) || (aabb[dKey].min !== 0)) {
						star[dKey] = self.randomRangeInt(aabb[dKey].min, aabb[dKey].max);
					}
				}			

				star.c = self.randomPick( starClasses );
				var classData = self.config.stars.classes[star.c] 
				star.M = self.randomRangeFloat(classData.mass.min, classData.mass.max, 2);
				
				table[star.id] = star;
			}
		}
		else {
			var baseChance = 50*self.config.starCount / ((aabb.x.max-aabb.x.min) * (aabb.y.max-aabb.y.min));
			var maxRadius = self.getDistance({x:0, y:0}, {x:aabb.x.max, y:aabb.y.max});
			var minRadius = self.config.coreSize;
			var idSeq = 0;
			console.log("baseChance=" + baseChance + " maxRadius=" + maxRadius);
			//console.log(aabb.x.min + " -> " + aabb.x.max);
			//console.log(aabb.y.min + " -> " + aabb.y.max);
			for (var x=aabb.x.min; x<aabb.x.max; x++) {
				for (var y=aabb.y.min; y<aabb.y.max; y++) {
					//for (var z=aabb.z.min; z<aabb.z.max; z++) {
					//}
					var posRadius = self.getDistance({x:0, y:0}, {x:x, y:y});
					if (posRadius < minRadius) {
						continue;
					}

					var posChance = (maxRadius - minRadius - posRadius) / (maxRadius - minRadius);
					var chance = baseChance*posChance*posChance*posChance;
					var diceRoll = self.randomRangeFloat(0, 1);
					//console.log("posRadius=" + posRadius);
					//console.log("posChance=" + posChance);
					//console.log("chance=" + chance);
					//console.log("diceRoll=" + diceRoll);
					//console.log("====================");
					if (diceRoll <= chance) {
						var star = {id:idSeq, x:x, y:y};

						star.c = self.randomPick( starClasses );
						var classData = self.config.stars.classes[star.c] 
						star.M = self.randomRangeFloat(classData.mass.min, classData.mass.max, 2);
					
						table[star.id] = star;
						idSeq++;

						//if (idSeq > 10000) {
						//	break;
						//}
					}
				}
			}
			console.log("idSeq=" + idSeq);
		}

		return table;
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

	self.generateGalaxy = function(options) {
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
		var data2 = {};

		data.units = options.outCoord;
		data2.units = options.outCoord;

		start = new Date().getTime();
		data.aabb = self.generateProceduralBoundingBox(options);
		console.log("generateProceduralBoundingBox took " + (new Date().getTime() - start) + "ms");

		start = new Date().getTime();
		data.stars = self.generateProceduralStarTable(data.aabb, options);
		console.log("generateProceduralStarTable took " + (new Date().getTime() - start) + "ms");

		start = new Date().getTime();
		data.sectors = self.generateSectorTable(data.stars, data.aabb, {x:10, y:10});
		console.log("generateSectorTable took " + (new Date().getTime() - start) + "ms");

		//start = new Date().getTime();
		//data.links = self.generateLinks(data.stars, data.sectors, data.aabb, options);
		//console.log("generateLinks took " + (new Date().getTime() - start) + "ms to generate " + data.links.totalLinkCount + " links"); //28423ms -> 16667ms -> 4535ms -> 15812ms
		
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
