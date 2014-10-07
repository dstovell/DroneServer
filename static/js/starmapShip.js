	
	function StarmapShipController(shipObj, trailObj)
	{
		this.shipObj = shipObj;
		this.trailObj = trailObj;
		this.mode = 'none';

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

		this.orbit = function(targetPos, radius) {
			this.orbitTargetPos = targetPos;
			this.orbitRadius = radius;
			this.mode = 'orbit';

			//make this smater later for smooth transition
			this.orbitAngle = 0;
			this.shipObj.rotate(90);
		}

		this.warp = function(destStar, startPos, endPos, travelTime, arrivalTime) {
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
		}

		this.step = function() {
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
				
				this.shipObj.position = {x:x, y:y};
				this.shipObj.rotate(inc_deg);

				for (var i in this.trailObj.segments) {
					var segmentAngle = this.orbitAngle - parseInt(i)*inc*5;
					var segment = this.trailObj.segments[i];
					var x = this.orbitTargetPos.x + this.orbitRadius * Math.cos(segmentAngle);
					var y = this.orbitTargetPos.y + this.orbitRadius * Math.sin(segmentAngle);
					segment.point.x = x;
					segment.point.y = y;
				}
			}
			else if (this.mode == 'warp') {
				if (this.travelTime != 0) {
					var currentTime = getServerTime_s();
					var t = (currentTime - this.travelStartTime) / this.travelTime;
					t = Math.min(t, 1.0);
					var pos = this.interpolate(this.warpStartPos, this.warpEndPos, t);

					this.shipObj.position = {x:pos.x, y:pos.y};

					for (var i in this.trailObj.segments) {
						var segmentAngle = this.orbitAngle - parseInt(i)*inc*5;
						var segment = this.trailObj.segments[i];
						var seg_pos = this.interpolate(this.warpStartPos, this.warpEndPos, t - (i*0.01));
						segment.point.x = seg_pos.x;
						segment.point.y = seg_pos.y;
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