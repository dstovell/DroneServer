var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

    options.config = options.config || {
        starmap: {
            starCount: 40,
            width: 2048,
            height: 2048,
            padding: 100,
            minStarDistance: 250,
            maxConnectionDistance: 400,
            randomPositionAttempts:400,
            starTypes: [
                {id:'yellow', name:'Yellow Dwarf', color:'yellow', radius:10, img:'/game/starmap/Sun.png'},
                {id:'red', name:'Red Giant', color:'red', radius:10, img:'/game/starmap/RedStar.png'},
                {id:'blue', name:'Blue Giant', color:'blue', radius:10, img:'/game/starmap/BlueStar.png'}
            ]
        }
    }

    var starmap_controller = require('../../lib/starmap_controller').create(options);

    router.get('/', function(req, res) {
        var uid = req.cookies.uid;

        if ((uid == null) || (uid == '')) {
            res.render('login', { config:options.config, layout:'game_layout' });
        }
        else {
            starmap_controller.generateNewMap({}, function (err, map) {
                if (err != null) {
                    //req.flash('error', err);
                }
     
                //console.log("map=" + JSON.stringify(map));
                res.render('bridge', { config:options.config, layout:'game_layout', map:map });
            });
        }
    });

    

    return router;
}
