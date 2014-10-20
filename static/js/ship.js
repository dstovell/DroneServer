
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

	this.shipGroup = pgame.add.group();
	this.shipGroup.enableBody = true;
	this.shipObjs = [];
	this.thrusterObjs = [];
	this.shieldObj = null;

	this.shieldUp = false;

	this.menu = null;
	this.menuMode = 'none';

	this.data.type = getShipType(config, data.name);

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

	function selectShipBridge(item, pointer)
	{
		if (this.menu == null) {
			var items = [];
			items.push({name:'MoveTo', cb:moveToToggle, ctx:this});
			items.push({name:'MovePath', cb:null});
			items.push({name:'Shield', cb:shieldToggle, ctx:this});
			items.push({name:'Fire', cb:null});
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
		var shipObj = phaserGame.add.sprite(0, 0, this.data.type.name);
		shipObj.scale.setTo(this.data.type.scale, this.data.type.scale);
		shipObj.anchor.setTo(0.5, 0.5);
		shipObj.inputEnabled = true;
		shipObj.gameObject = this;
		shipObj.events.onInputDown.add(selectShipBridge, this);

		this.shipGroup.add(shipObj);
		this.shipObjs.push(shipObj);
	}

	this.drawShield = function() {

		this.shieldObj = phaserGame.add.sprite(0, 0, 'shield');
		this.shieldObj.anchor.setTo(0.5, 0.5);
		this.shieldObj.scale.setTo(this.data.type.scale * 1.2, this.data.type.scale * 1.2);
		this.showShield(false);

		this.shipGroup.add(this.shieldObj);
	}

	this.drawThrusters = function() {
		var thrusterObj = phaserGame.add.sprite(0, 50, 'exhaust1');
		thrusterObj.anchor.setTo(0.5, 0.5);
		thrusterObj.alpha = 0;

		this.thrusterObjs.push(thrusterObj);
		this.shipGroup.add(thrusterObj);
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
			//this.thrusterObjs[i].alpha = a;
			this.pgame.add.tween(this.thrusterObjs[i]).to({ alpha:a }, 1000, Phaser.Easing.Quadratic.InOut, true);//.yoyo(true);
		}
	}

	this.getPosition = function() {
		return {x:this.shipGroup.x, y:this.shipGroup.y};
	}

	this.setPosition = function(x, y) {
		this.shipGroup.x = x
		this.shipGroup.y = y;
	}

	this.distanceTo = function(x, y) {
		return distanceVector2( {x:x, y:y}, this.getPosition());
	}

	this.setAngle = function(angle) {
		this.shipGroup.angle = angle;
	}

	this.moveTo = function(x, y) {
		var pos = this.getPosition();
		var line = new Phaser.Line(pos.x, pos.y, x, y);

		var newAngle = radiansToDegrees(line.angle);
		newAngle = pgame.physics.arcade.angleToPointer(this.shipGroup);

		var travelTime = line.length * 10;
		this.pgame.add.tween(this.shipGroup).to({ x:x, y:y, angle:newAngle }, travelTime, Phaser.Easing.Quadratic.InOut, true);

		this.setThrust(1);
	}

	this.stop = function() {
		this.shipGroup.setAll('body.velocity.x', 0);
        this.shipGroup.setAll('body.velocity.y', 0);
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
				this.moveTo(touch1.clientX, touch1.clientY);
				this.menuMode = 'none';
    		}
		}
	}

	this.drawThrusters();
	this.drawShield();
	this.drawShip();

	//this.shipGroup.x = this.data.pos.x
	//this.shipGroup.y = this.data.pos.y;
	this.setPosition(this.data.pos.x, this.data.pos.y);

	this.setAngle(0);

	return this;
}