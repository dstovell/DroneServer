
function getShipType(config, name) {
	var shipTypes = config.fleets.baseShips;
	for (var i in shipTypes) {
		if (shipTypes[i].name == name) {
			return shipTypes[i];
		}
	}
	return null;
}


function Ship(config, pgame, data)
{
	this.data = data;
	this.pgame = pgame;
	this.config = config;
	this.data.type = getShipType(config, data.name);

	this.shipGroup = pgame.add.group();
	this.shipObj = null;
	this.thrusterObjs = [];
	this.shieldObj = null;

	this.shieldScale = this.data.type.scale * 1.2
	this.thrusterScale = this.data.type.scale * 2;

	this.drones = [];

	this.moveTarget = null;
	this.moveQueue = [];
	this.followTarget = null;

	this.shieldUp = false;

	this.menu = null;
	this.menuMode = 'none';

	this.accel = this.data.type.accel || 150;
	this.maxSpeed =this.data.type.maxSpeed || 200;
	this.maxTurnRate = this.data.type.maxTurnRate || 0.3;	

	this.getFactionColor = function() {
		return (this.faction != null) ? this.faction.color : 'FFFFFF';
	}

	this.getFactionName = function() {
		return (this.faction != null) ? this.faction.fName : 'none';
	}

	function shieldToggle() {
		this.showShield(!this.shieldUp);
		closeCircleMenu(this.pgame, this.menu);
		this.menu = null;
	}

	function moveToToggle() {
		var self = this;
		closeCircleMenu(this.pgame, this.menu, function(){
			self.menu = null;
			self.menuMode = 'MoveTo';
		});
	}

	function launchDrones() {
		var self = this;
		closeCircleMenu(this.pgame, this.menu, function(){
			self.menu = null;
			self.spawnDrones(4);
		});
	}

	function selectShipBridge(item, pointer)
	{
		if (this.menu == null) {
			var items = [];
			items.push({name:'MoveTo', cb:moveToToggle, ctx:this});
			items.push({name:'MovePath', cb:null});
			items.push({name:'Shield', cb:shieldToggle, ctx:this});
			items.push({name:'Fire', cb:null});
			items.push({name:'Launch', cb:launchDrones, ctx:this});
			var pos = this.getPosition();
			var options = { menuRadius:110, itemRadius:55 };
			this.menu = openCircleMenu(this.pgame, pos.x, pos.y, items, options);
			//alert("pos" + JSON.stringify(pos));
		}
		else {
			closeCircleMenu(this.pgame, this.menu);
			this.menu = null;
		}
	}

	this.drawShip = function() {
		this.shipObj = phaserGame.add.sprite(0, 0, this.data.type.name);
		this.shipObj.scale.setTo(this.data.type.scale, this.data.type.scale);
		this.shipObj.anchor.setTo(0.5, 0.5);
		if (this.data.selectable) {
			this.shipObj.inputEnabled = true;
			this.shipObj.gameObject = this;
			this.shipObj.events.onInputDown.add(selectShipBridge, this);
		}
		this.pgame.physics.enable(this.shipObj, Phaser.Physics.ARCADE);
		this.shipObj.body.allowRotation = true;
	}

	this.drawShield = function() {

		this.shieldObj = phaserGame.add.sprite(0, 0, 'shield');
		this.shieldObj.anchor.setTo(0.5, 0.5);
		this.shieldObj.scale.setTo(this.shieldScale, this.shieldScale);
		this.shieldObj.angle = 90;
		this.showShield(false);

		this.shipGroup.add(this.shieldObj);
	}

	this.drawThrusters = function() {
		var thrusterObj = phaserGame.add.sprite(0, 160*this.data.type.scale, 'exhaust1');
		thrusterObj.anchor.setTo(0.5, 0.5);
		thrusterObj.alpha = 0;
		thrusterObj.scale.setTo(this.thrusterScale, this.thrusterScale);

		this.thrusterObjs.push(thrusterObj);
		this.shipGroup.add(thrusterObj);
	}

	this.spawnDrones = function(num) {
		for (var i=0; i<num; i++) {
			var spawnPos = {};
			spawnPos.x = this.getBodyObj().x + randomRange(-50, 50);
			spawnPos.y = this.getBodyObj().y + randomRange(-50, 50);
			var droneData = { name:'Drone', pos:spawnPos };
			var drone = new Ship(this.config, this.pgame, droneData);
			drone.follow(this);
			this.drones.push(drone);
		}
	}

	this.showShield = function(show) {
		this.shieldUp = show;
		var a = show ? 1 : 0;
		this.shieldObj.alpha = a;
		//this.pgame.add.tween(this.shipObjs[i]).to({ x:x, y:y }, travelTime, Phaser.Easing.Quadratic.InOut, true);
	}

	this.setThrust = function(amount) {
		var a = Math.max(0, Math.min(1, amount));
		for (var i in this.thrusterObjs) {
			this.thrusterObjs[i].alpha = a;
			var scale = this.thrusterScale; //* randomRange(0.95, 1);
			this.thrusterObjs[i].scale.setTo(scale, scale);
		}
	}

	this.getPosition = function() {
		return {x:this.getBodyObj().x, y:this.getBodyObj().y};
	}

	this.setPosition = function(x, y) {
		this.getBodyObj().x = x;
		this.getBodyObj().y = y;
	}

	this.getBodyObj = function() {
		return this.shipObj;
	}

	this.distanceTo = function(x, y) {
		return distanceVector2( {x:x, y:y}, this.getPosition());
	}

	this.setAngle = function(angle) {
		this.getBodyObj().angle = angle;
	}

	this.follow = function(ship) {
		this.followTarget = ship;
	}

	this.movePath = function(moves, removeExisting) {
		if (removeExisting) {
			this.moveQueue  = [];
		}
		for (var i in moves) {
			this.moveQueue.push( moves[i] );
		}
	}

	this.moveTo = function(x, y) {
		var pos = this.getPosition();
		var line = new Phaser.Line(pos.x, pos.y, x, y);

		var turnAngle = this.pgame.physics.arcade.accelerateToXY(this.getBodyObj(), x, y, this.accel, this.maxSpeed, this.maxSpeed);
		//turnAngle = Math.min(turnAngle, maxTurnRate);
		//this.getBodyObj().body.rotation = turnAngle;
		this.getBodyObj().angle = radiansToDegrees(this.getBodyObj().body.angle) + 90;
	}

	this.stop = function() {
		//this.shipGroup.setAll('body.velocity.x', 0);
        //this.shipGroup.setAll('body.velocity.y', 0);
	}

	this.hasReached = function(pos) {
		var dist = this.distanceTo(pos);
		return (dist < 2.0);
	}

	this.update = function() {
		var touch1 = null;
        if (this.pgame.input.mousePointer.isDown) {
        	touch1 = this.pgame.input.mousePointer;
        }
        else if (this.pgame.input.pointer1.isDown) {
        	touch1 = this.pgame.input.pointer1;
        }

		if (this.menuMode == 'MoveTo') {
			if (touch1) {
				this.moveTarget = {x:touch1.clientX, y:touch1.clientY};
				this.menuMode = 'none';
    		}
		}

		if ((this.moveTarget == null) || this.hasReached(this.moveTarget)) {
			if (this.moveQueue.length > 0) {
				this.moveTarget = this.moveQueue.shift();
			}
		}

		if (this.moveTarget) {
			this.moveTo(this.moveTarget.x, this.moveTarget.y);
		}
		else if (this.followTarget) {
			this.moveTo(this.followTarget.getBodyObj().x, this.followTarget.getBodyObj().y);
		}

		//adjust thrust
		var v = this.getBodyObj().body.speed;
		var normalizedV = v / this.maxSpeed;
		this.setThrust(normalizedV*2);

		this.shipGroup.x = this.getBodyObj().x;
		this.shipGroup.y = this.getBodyObj().y;
		this.shipGroup.angle = this.getBodyObj().angle;

		for (var i in this.drones) {
			this.drones[i].update();
		}
	}

	this.render = function() {
		if (this.getBodyObj() && this.getBodyObj().body.enable)
		{
			//this.pgame.debug.body(this.getBodyObj());
		    //this.pgame.debug.spriteInfo(this.getBodyObj(), 100, 100);
		    //this.pgame.debug.bodyInfo(this.getBodyObj(), 100, 175);
		}
	}

	this.drawThrusters();
	this.drawShield();
	this.drawShip();

	this.setPosition(this.data.pos.x, this.data.pos.y);

	this.setAngle(0);

	return this;
}