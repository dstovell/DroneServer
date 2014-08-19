
function UsersController(options) {

	var self = this;

	self.options = options;

	self.usersCollection = options.db.collection('users');
	self.usersCollection.ensureIndex({uid: 1}, {unique: true}, function() {});
}

UsersController.prototype.getNextUid = function(name, cb) {
	var self = this;

    //var ret = self.usersCounter.findAndModify({query:{_id:name}, update:{$inc : {next:1}}, "new":true, upsert:true});
    // ret == { "_id" : "users", "next" : 1 }
    //return cb(null, ret.next);

    //Holy crap, this sucks, but it works for now
    self.usersCollection.find().toArray(function (err, userlist) {
		if (err != null) {
			return cb(err);
		}

		var highestUid = 0;
		for (var i in userlist) {
			if (userlist[i].uid > highestUid) {
				highestUid = userlist[i].uid;
			}
		}

		return cb(null, highestUid+1);
	});
}

UsersController.prototype.getUsers = function( cb ) {
	var self = this;

	self.usersCollection.find().toArray(function (err, userlist) {
		if (err != null) {
			return cb(err);
		}

        return cb(null, userlist);
    });
}

UsersController.prototype.addUser = function( username, password, email, cb ) {
	var self = this;

	self.usersCollection.find({username:username}, function(err, existingUser){
		if (err != null) {
			return cb(err);
		}

		if ((existingUser != null) && (existingUser.username == username)) {
			return cb("Username taken");
		}

		self.getNextUid(username, function (err, uid) {
			if (err != null) {
				return cb(err);
			}

			//salt and hash this fucker later
			var user = { uid:uid, username:username, password:password, email:email };

			self.usersCollection.insert( user, function( err, addedUser ) {
				if (err != null) {
					return cb(err);
				}

		        return cb(null, user);
			});
		});
	});
}

UsersController.prototype.removeUser = function( uid, cb ) {
	var self = this;

	self.usersCollection.remove( {uid:uid}, function( err ) {
		if (err != null) {
			return cb(err);
		}

        return cb(null, true);
    });
}

UsersController.prototype.loginUser = function( username, password, cb ) {
	var self = this;

	self.usersCollection.findOne( {uid:uid}, function( err, user ) {
		if ((err != null) || (user == null)) {
			return cb(err || "No User");
		}

		if (password != user.password) {
			return cb("Bad Password");
		}

		//add auth shit here...

        return cb(null, user);
	});
}

var usersControllerInstance = null;
exports.create = function(options) {
	if( usersControllerInstance == null ) {
		usersControllerInstance = new UsersController(options);
	}
	return usersControllerInstance;
}
