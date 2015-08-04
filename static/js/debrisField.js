
function getShipType(config, name) {
	var shipTypes = config.fleets.baseShips;
	for (var i in shipTypes) {
		if (shipTypes[i].name == name) {
			return shipTypes[i];
		}
	}
	return null;
}

function DebrisObj(pgame, data)
{
	this.data = data;
	this.pgame = pgame;

	this.obj = null;

	this.draw = function() {
		this.obj = phaserGame.add.sprite(this.data.pos.x, this.data.pos.y, this.data.sprite);
		this.obj.scale.setTo(this.data.scale, this.scale);
		this.obj.anchor.setTo(0.5, 0.5);
		
		//this.pgame.physics.enable(this.obj, Phaser.Physics.ARCADE);
		//this.obj.body.allowRotation = true;
	}

	this.getPosition = function() {
		return {x:this.getBodyObj().x, y:this.getBodyObj().y};
	}

	this.setPosition = function(x, y) {
		this.getBodyObj().x = x;
		this.getBodyObj().y = y;
	}

	this.getBodyObj = function() {
		return this.obj;
	}

	this.distanceTo = function(x, y) {
		return distanceVector2( {x:x, y:y}, this.getPosition());
	}

	this.setAngle = function(angle) {
		this.getBodyObj().angle = angle;
	}
}


function DebrisField(config, pgame, data)
{
	this.data = data;
	this.pgame = pgame;
	this.config = config;

	this.debrisObjs = [];

	this.drawDebris = function() {
		for (var i=0; i<this.data.numObjects; i++) {
			var objData = {sprite:'asteroid', pos:{x:0,y:0}, scale:1};
			var dObj = new DebrisObj(objData);
			dObj.draw();
		}
	}

	this.update = function() {
		for (var i in this.debrisObjs) {
		}
	}

	this.render = function() {
		for (var i in this.debrisObjs) {
		}
	}

	this.drawDebris();

	return this;
}