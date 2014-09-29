

function StarMapController(options) {

	var self = this;

	self.options = options;

	self.config = {
		starmap: {
			starCount: 100,
			width: 2048,
			height: 2048,
			padding: 50,
			minStarDistance: 300,
			maxConnectionDistance: 400,
			starTypes: [
				{name:'yellow', color:'yellow', radius:10, img:'/game/starmap/Sun.png'},
				{name:'red', color:'red', radius:10, img:'/game/starmap/Sun.png'},
				{name:'blue', color:'blue', radius:10, img:'/game/starmap/Sun.png'}
			]
		}
	}

	//self.usersCollection = options.db.collection('users');
	//self.usersCollection.ensureIndex({uid: 1}, {unique: true}, function() {});
}

StarMapController.prototype.random = function(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

StarMapController.prototype.randomArrayEntry = function(values) {
	var self = this;

	if ((values == null) || (values.length == 0)) {
		return null;
	}

    var index = self.random(0, values.length-1);
    return values[index];
}

StarMapController.prototype.vector2 = function(x, y) {
	return {x:x, y:y};
}

StarMapController.prototype.getDistance = function(posA, posB) {
	var distanceSquared = (posA.x - posB.x)*(posA.x - posB.x) + (posA.y - posB.y)*(posA.y - posB.y);
	return Math.sqrt(distanceSquared);
}

StarMapController.prototype.isStarsLinked = function(map, starA, starB) {
	if ((map == null) || (map.links == null)) {
		return false;
	}

	for (var i in map.links) {
		var link = map.links[i];
		if ( ((link[0] == starA.id) && (link[1] == starB.id)) || ((link[0] == starB.id) && (link[1] == starA.id)) ) {
			return true;
		}
	}

	return false;
}

StarMapController.prototype.generateNewMap = function(options, cb) {
	var self = this;

	options = options || {};
	var starCount = options.starCount || self.config.starmap.starCount;
	var minStarDistance = options.minStarDistance || self.config.starmap.minStarDistance;
	var width = options.width || self.config.starmap.width;
	var height = options.height || self.config.starmap.height;
	var padding = options.padding || self.config.starmap.padding;
	var maxConnectionDistance = options.maxConnectionDistance || self.config.starmap.maxConnectionDistance;
	var starTypes = options.starTypes || self.config.starmap.starTypes;

	function isNearStar(stars, pos) {
		for (var i=0; i<stars.Length; i++)
		{
			if (stars[i])
			{
				var dist = self.getDistance(pos, stars[i].pos);
				if (dist < minStarDistance)
					return true;
			}
		}
		return false;
	}
	
	function randomStarPosition(stars, cornerA, cornerB) {
		var position = self.vector2(0,0);
		
		for (var i=0; i<200; i++)
		{
			position = self.vector2(self.random(cornerA.x, cornerB.x), self.random(cornerA.y, cornerB.y));
			
			if (!isNearStar(stars, position))
				return position;
		}
		
		return position;
	}

	function shouldLinkStars(links, starA, starB) {
		if (starA.id == starB.id)
			return false;
	
		if (self.isStarsLinked(starA, starB)) {
			return false;
		}
			
		var dist = self.getDistance(starA.pos, starB.pos);
		
		return (dist <= maxConnectionDistance);
	}

	function isStarLinkedToAnything(links, star) {
		for (var i in links) {
			if ((links[i][0] == star.id) || (links[i][1] == star.id)) {
				return true;
			}
		}
		return false;
	}

	//var cornerA = self.vector2(-1*width/2, height/2);
	//var cornerB = self.vector2(width/2, -1*height/2);
	var cornerA = self.vector2(padding, padding);
	var cornerB = self.vector2(width-padding, height-padding);

	var map = {stars:[], links:[]};

	for (var i=0; i<starCount; i++)
	{
		var id = i + 1;
		var name = "ST-" + id;
		var pos = randomStarPosition(map.stars, cornerA, cornerB);
		var type = self.randomArrayEntry(starTypes);

		var star = {id:id, name:name, pos:pos, type:type};
		map.stars.push(star);
	}

	console.log("stars done");

	for (i=0; i<map.stars.length; i++)
	{
		for (j=0; j<i; j++)
		{
			if ( shouldLinkStars(map.links, map.stars[j], map.stars[i]) )
			{
				var link = [map.stars[j].id, map.stars[i].id];
				map.links.push(link);
			}
		}
	}

	console.log("links done");

	for (i=0; i<map.stars.length; i++)
	{
		if ( !isStarLinkedToAnything(map.links, map.stars[i]) )
		{
			var closestStar = null;
			var closestDist = 99999999999;
			for (j=0; j<map.stars.length; j++)
			{
				var thisDist = self.getDistance(map.stars[j].pos, map.stars[i].pos);
				if ((i != j) && (closestDist > thisDist))
				{
					closestStar = map.stars[j];
					closestDist = thisDist;						
				}
			}
			if (closestStar)
			{
				var link = [map.stars[i].id, closestStar.id];
				map.links.push(link);
			}
		}
	}

	console.log("links done");

	return cb(null, map);
}


var starMapControllerInstance = null;
exports.create = function(options) {
	if( starMapControllerInstance == null ) {
		starMapControllerInstance = new StarMapController(options);
	}
	return starMapControllerInstance;
}


/*
private static function SortPlanetByType(p1 : PlanetNode, p2 : PlanetNode) 
	{
		if (p1.type == p2.type)
			return 0;
    	if (p1.type > p2.type)
    		return 1;
    	else
    		return -1;
	}
	
	function CreatePlanets()
	{
		for (var i=0; i<stars.Length; i++)
		{
			if (stars[i])
			{
				var j=0;
				var planetCount : int = Random.Range(minPlanetCount, maxPlanetCount);
				for (j=0; j<planetCount; j++)
				{
					var planet = new PlanetNode();
					var type : PlanetType = PlanetComponent.RandomType();
					var prefabIndex : int = PlanetComponent.GetRandomPrefabIndex(type);
					planet.Init(stars[i], type, prefabIndex, 0);
					stars[i].planets.Add(planet);
				}
				
				stars[i].planets.Sort(SortPlanetByType);
				
				var orbitDistance : float = StarComponent.GetSize(stars[i].type) - minPlanetOrbitIncrement;
				for (j=0; j<planetCount; j++)
				{
					orbitDistance += Random.Range(minPlanetOrbitIncrement, maxPlanetOrbitIncrement);
					orbitDistance += PlanetComponent.GetSize(stars[i].planets[j].type) * 2.0;
					stars[i].planets[j].orbitDistance = orbitDistance;
				}
			}
		}
	}
*/