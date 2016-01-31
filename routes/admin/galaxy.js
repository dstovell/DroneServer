"use strict";

var express = require('express');
var router = express.Router();

exports = module.exports = function routeSetup(options) {

    var galaxy_controller = require('../../lib/galaxy/galaxy_controller').create(options);

    router.get('/viewgalaxy', function(req, res){
        console.log("/viewgalaxy");

        var galaxyConfig = galaxy_controller.getConfig();

        galaxy_controller.getGalaxy(function(err, galaxy){
             res.render('viewgalaxy', {layout:'game_layout', galaxy:galaxy, config:galaxyConfig, helper:galaxy_controller.galaxyHelper});
        });
       
    });

    router.get('/generate', function(req, res){
        galaxy_controller.generate(function(err, galaxy){
            return res.json({err:err, result:galaxy});
        });
    });

    router.get('/getStar/:starId', function(req, res){
        var starId = req.params.starId;
        galaxy_controller.getStar(starId, function(err, star){
            return res.json({err:err, result:star});
        });
    });   

    return router;
}

