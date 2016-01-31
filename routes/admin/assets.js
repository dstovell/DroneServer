"use strict";

var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

    var assets_controller = require('../../lib/assets/assets_controller').create(options);

  	 router.get('/add/:uid/:assetKey/:starId', function(req, res){
        console.log("/add");
        var uid = req.params.uid;
        var assetKey = req.params.assetKey;
        var starId = req.params.starId;

        console.log("/add uid=" + uid);
        assets_controller.addAsset(assetKey, uid, starId, options, function(err, asset){
            return res.json({err:err, result:asset});
        });
    });

    router.get('/setCourse/:uid/:transponder/:destStarId', function(req, res){
        var uid = req.params.uid;
        var transponder = req.params.transponder;
        var destStarId = req.params.destStarId;

        assets_controller.setAssetCourse(transponder, uid, destStarId, options, function(err, asset){
            return res.json({err:err, result:asset});
        });
    });
   

    return router;
}
