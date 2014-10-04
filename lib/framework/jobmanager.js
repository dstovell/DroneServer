var JobManager = function( options ) {
	options = options || {};
	this.setImmediate = ( options.setImmediate != null ) ? options.setImmediate : true;
}

JobManager.prototype = {
	add: function(callback) {
		this.pile = this.pile || [];
		this.pile.push(callback);
	},

	run: function(done, numParallelJobs) {
		var self = this;
		var numJobs = numParallelJobs || 1;

		var inflight = 0;
		
		done = done || function(){};
		
		var next = function(err) {
			if (err) {
				return done(err);
			}
			
			if (self.pile && self.pile.length > 0) {
				var callback = self.pile.shift();

				inflight += 1;
				callback( function(err2) {
					inflight -= 1;
					next(err2);
				});
			}
			else if ( inflight == 0 ) {
				inflight = -1; // make sure we don't double call this
				done();
			}
		};

		if( self.setImmediate == true ) {
			var old = next;
			next = function( err ) { setImmediate( function( err ) { old( err ) }); }
		}

		for ( var i = 0; i < numJobs; ++i ) {
			next();	
		}
	},

	executeN: function(n,eachCallback,endCallback, numParallelJobs) {
		var self = this;
		if( n <= 0 ) {
			n = 0;
		}
		var array = [];
		for( var i = 0; i < n; ++i ) {
			array.push( i );
		}
		self.forEach( array, eachCallback, endCallback, numParallelJobs );
	},

	while: function( executeCallback, endCallback ) {
		var self = this;

		var cb = endCallback || function(){};

		var count = 0;
		var next = function( err, keepExecuting ) {
			if( err ) {
				return cb( err, count );
			}

			count++;
			if( !keepExecuting ) {
				return cb( null, count );
			}

			executeCallback( function( err, keepExecuting ) {
				return next( err, keepExecuting );
			}, count );
		}

		next( null, true );
	},

	forEach: function(array,eachCallback,endCallback, numParallelJobs) {
		var self = this;
		
		array = array || [];
		var inflight = 0;
		var done = endCallback || function(){};
		var i = 0;
		var numJobs = numParallelJobs || 1;
		
		var next = function(err){
			// stop
			if (err) {
				inflight = -Number.MAX_VALUE;
				i = Number.MAX_VALUE;
				var cb = done;
				done = function(){};
				return cb(err);
			}
			
			if (i < array.length) {
				var index = i;
				var item = array[i++];
				inflight += 1;
				
				// this fixes problems with max call stacks
				setImmediate(function(){
					eachCallback( item, function(err2) {
						inflight -= 1;
						next(err2);
					},index);
				});
			}
			else if ( inflight == 0 ) {
				inflight = -1; // make sure we don't double call this
				done();
			}
		};

		for ( var j = 0; j < numJobs; ++j ) {
			next();	
		}
	},
	
	forEachKey: function(array,eachCallback,endCallback, numParallelJobs) {
		var self = this;

		var tmp = []
		for (var i in array) {
			tmp.push(i);
		}
		self.forEach(tmp, eachCallback, endCallback, numParallelJobs );
	},

	// NOTE: Modifies the passed in array
	forEachBatch: function(array,batchSize,batchCallback,endCallback) {
		var self = this;

		var batches = [];
		while (array.length > 0) {
			batches.push(array.splice(0,Math.min(array.length,batchSize)));
		}

		self.forEach(batches,
			batchCallback,
			endCallback
		);
	}
}

exports = module.exports = JobManager;