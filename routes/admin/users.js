var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    //res.writeHead(301, { "location": "/userlist" });
    //res.end();
    return res.seeOther("/userlist");
});

/*
 * GET userlist.
 */
router.get('/userlist', function (req, res) {
    var db = req.db;
    db.collection('userlist').find().toArray(function (err, userlist) {
        console.log('userlist=' + JSON.stringify(userlist));
        return res.render('userlist', { userlist: userlist });
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    db.collection('userlist').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * POST to deleteuser.
 */
router.post('/deleteuser/:id', function (req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('userlist').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;