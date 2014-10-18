	
	function StarmapShipController(shipObj, shieldObj, emitter, trailObj)
	{
		this.shipObj = shipObj;
		this.shieldObj = shieldObj;
		this.emitter = emitter;
		this.trailObj = trailObj;
		this.mode = 'none';

		this.initialAngle = 180;

		this.orbitTargetPos = null;
		this.orbitRadius = 1;
		this.orbitAngle = 0;

		this.warpStartPos = null;
		this.warpEndPos = null;
		this.travelTime = 0;
		this.travelStartTime = 0;
		this.travelEndTime = 0;

		this.nextUpdateTime = 0;
		this.minUpdateInterval = 33;

		this.setShieldAngle = function(shipAngle) {
			this.shieldObj.angle = shipAngle +  90;
		}

		this.orbit = function(targetPos, radius) {
			this.orbitTargetPos = targetPos;
			this.orbitRadius = radius;
			this.mode = 'orbit';

			//make this smater later for smooth transition
			this.orbitAngle = 0;
			this.shipObj.angle = this.initialAngle;
			this.setShieldAngle(this.shipObj.angle);

			if (this.emitter) {
				this.emitter.forEach(function(particle) {
	  				particle.kill();
				});
			}
		}

		this.warp = function(destStar, startPos, endPos, travelAngle, travelTime, arrivalTime) {
			if (this.mode == 'warp') {
				return;
			}

			this.destStar = destStar;
			this.warpStartPos = startPos;
			this.warpEndPos = endPos;
			this.travelTime = travelTime;
			this.travelStartTime = new Date().getTime() / 1000;
			this.travelStartTime = arrivalTime - travelTime;
			this.travelEndTime = arrivalTime;
			this.mode = 'warp';
			
			this.shipObj.angle = travelAngle + 90 + this.initialAngle;
			this.setShieldAngle(this.shipObj.angle);

			if (this.emitter) {
				this.emitter.forEach(function(particle) {
	  				particle.kill();
				});
			}
		}

		this.step = function() {
			if (this.emitter) {
				this.emitter.forEach(function(particle) {
	  				// tint every particle cyan
	  				particle.tint = 0x00ffff;
				});
			}

			var currentTime = new Date().getTime();
			if ((this.nextUpdateTime != 0) && (currentTime < this.nextUpdateTime)) {
				return false;
			}

			this.nextUpdateTime = currentTime + this.minUpdateInterval;

			if (this.mode == 'orbit') {
				var count = 240;
				var twoPI = 2 * Math.PI;
				var inc = twoPI / count;
				var inc_deg = inc / twoPI * 360;
				this.orbitAngle += inc;
				if (this.orbitAngle > twoPI) {
					this.orbitAngle -= twoPI;
				}
				var x = this.orbitTargetPos.x + this.orbitRadius * Math.cos(this.orbitAngle);
				var y = this.orbitTargetPos.y + this.orbitRadius * Math.sin(this.orbitAngle);

				var eX = this.orbitTargetPos.x + this.orbitRadius * Math.cos(this.orbitAngle-inc_deg*0.2);
				var eY = this.orbitTargetPos.y + this.orbitRadius * Math.sin(this.orbitAngle-inc_deg*0.2);
				
				this.shipObj.x = x;
				this.shipObj.y = y;
				this.shieldObj.x = x;
				this.shieldObj.y = y;
				this.shipObj.angle += inc_deg;
				this.setShieldAngle(this.shipObj.angle);
				if (this.emitter) {
					this.emitter.emitX = eX;
					this.emitter.emitY = eY;
				}

				if (this.trailObj) {
					for (var i in this.trailObj.segments) {
						var segmentAngle = this.orbitAngle - parseInt(i)*inc*5;
						var segment = this.trailObj.segments[i];
						var x = this.orbitTargetPos.x + this.orbitRadius * Math.cos(segmentAngle);
						var y = this.orbitTargetPos.y + this.orbitRadius * Math.sin(segmentAngle);
						segment.point.x = x;
						segment.point.y = y;
					}
				}
			}
			else if (this.mode == 'warp') {
				if (this.travelTime != 0) {
					var currentTime = getServerTime_s();
					var t = (currentTime - this.travelStartTime) / this.travelTime;
					t = Math.min(t, 1.0);
					var pos = this.interpolate(this.warpStartPos, this.warpEndPos, t);
					var ePos = this.interpolate(this.warpStartPos, this.warpEndPos, t-0.1);

					this.shipObj.x = pos.x;
					this.shipObj.y = pos.y;
					this.shieldObj.x = pos.x;
					this.shieldObj.y = pos.y;
					if (this.emitter) {
						this.emitter.emitX = ePos.x;
						this.emitter.emitY = ePos.y;
					}

					if (this.trailObj) {
						for (var i in this.trailObj.segments) {
							var segmentAngle = this.orbitAngle - parseInt(i)*inc*5;
							var segment = this.trailObj.segments[i];
							var seg_pos = this.interpolate(this.warpStartPos, this.warpEndPos, t - (i*0.01));
							segment.point.x = seg_pos.x;
							segment.point.y = seg_pos.y;
						}
					}

					if (t == 1.0) {
						this.star = this.destStar;
						this.orbit(this.star.data.pos, this.orbitRadius)
						return true;
					}
				}
			}

			return false;
		}

		this.interpolate = function(a, b, t)
		{
		    var nx = a.x+(b.x-a.x)*t;
		    var ny = a.y+(b.y-a.y)*t;
		    return {x:nx,  y:ny};
		}
	}