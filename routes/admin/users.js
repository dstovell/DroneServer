var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

    var users_controller = require('../../lib/users_controller').create(options);

    /*router.get('/', function (req, res) {
        //res.writeHead(301, { "location": "/userlist" });
        //res.end();
        return res.seeOther("/userlist");
    });*/

    router.get('/userlist', function (req, res) {

        users_controller.getUsers( function (err, userlist) {
            if (err != null) {
                //req.flash('error', err);
            }
            
            return res.render('userlist', { userlist: userlist });
        });
    });

    router.post('/adduser', function(req, res) {
 
        var username = req.param('username');
        var password = req.param('password');
        var email = req.param('email');

        users_controller.addUser( username, password, email, function(err, result){
            if (err != null) {
                //req.flash('error', err);
            }

            res.send(
                (err === null) ? { msg: '' } : { msg: err }
            );
        });
    });

    router.post('/deleteuser/:uid', function (req, res) {
        var uid = req.param('uid');

        users_controller.removeUser(uid, function(err, result) {
            res.send((result == true) ? { msg: '' } : { msg:'error: ' + err });
        });
    });

    router.post('/loginuser', function(req, res) {

        var username = req.param('username');
        var password = req.param('password');

        users_controller.loginUser( username, password, function(err, result){
            res.send(
                (err === null) ? { msg: '' } : { msg: err }
            );
        });
    });

    return router;
}
