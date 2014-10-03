var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

    var users_controller = require('../../lib/users_controller').create(options);

    router.post('/adduser', function(req, res) {
 
        var username = req.param('username');
        var password = req.param('password');
        var email = req.param('email');

        users_controller.addUser( username, password, email, function(err, user){
            if (err != null) {
                return res.json({err:err});
            }

            res.cookie('uid', user.uid);
            res.cookie('username', user.username);
            return res.json({err:null});
        });
    });

    router.post('/loginuser', function(req, res) {

        var username = req.param('username');
        var password = req.param('password');

        console.log("loginUser username=" + username);
        console.log("loginUser password=" + password);

        users_controller.loginUser( username, password, function(err, user){
            if (err != null) {
                console.log("loginUser err=" + err);
                return res.json({err:err});
            }

            res.cookie('uid', user.uid);
            res.cookie('username', user.username);
            console.log("loginUser success cookies=" + res.cookies);
            return res.json({err:null});
        });
    });

    router.post('/logoutuser', function(req, res) {
        res.cookie('uid', '');
        res.cookie('username', '');
        return res.json({err:null});
    });

    return router;
}
