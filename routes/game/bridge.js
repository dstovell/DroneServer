var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

    options.config = options.config || {};

    var starmap_controller = require('../../lib/starmap_controller').create(options);

    router.get('/', function(req, res) {

        console.log("generateNewMap start");
        starmap_controller.generateNewMap({}, function (err, map) {
            if (err != null) {
                //req.flash('error', err);
            }
 
            console.log("map=" + JSON.stringify(map));
            res.render('bridge', { config:options.config, layout:'game_layout', map:map });
        });
    });

    

    return router;
}
