var express = require('express');
var ObjectId = require('bson').ObjectId;
var router = express.Router();

exports = module.exports = function routeSetup(options) {

    options.config = options.config || {
        starmap: {
            sectorCount: 1,
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
    var faction_controller = require('../../lib/faction_controller').create(options);
    var fleet_controller = require('../../lib/fleet_controller').create(options);

    router.get('/', function(req, res) {
        var uid = req.cookies.uid;
        var username = req.cookies.username;

        function getOrAddFaction(uid, cb) {
            faction_controller.getUserFaction(uid, function (err, faction) {
                if (err != null) {
                   return cb(err);
                }

                if (faction != null) {
                    return cb(null, faction);
                }

                var factionConfig = {name:username, color:'cyan'};

                faction_controller.addUserFaction(uid, factionConfig, function (err, faction) {
                    if (err != null) {
                       return cb(err);
                    }

                    return cb(null, faction);
                });
            });
        }

        function getOrAddFleet(uid, faction, cb) {
            fleet_controller.getFactionFleet(faction._id, function (err, fleet) {
                if (err != null) {
                   return cb(err);
                }

                if (fleet != null) {
                    return cb(null, fleet);
                }

                var ships = ['Shuttle Pod'];
                var sid = 0;
                var starId = 1;

                console.log("getOrAddFleet faction=" + JSON.stringify(faction));

                fleet_controller.addFactionFleet(faction, ships, sid, starId, function (err, fleet) {
                    if (err != null) {
                       return cb(err);
                    }
                    
                    return cb(null, fleet);
                });
            });
        }

        if ((uid == null) || (uid == '')) {
            res.render('login', { config:options.config, layout:'game_layout' });
        }
        else {
            getOrAddFaction(uid, function (err, faction) {

                getOrAddFleet(uid, faction, function (err, fleet) {

                    starmap_controller.getSector(fleet.sid, function (err, sector) {
                        if (err != null) {
                            //req.flash('error', err);
                        }

                        faction_controller.getDataForSector(fleet.sid, function (err, factionSectors) {
                            if (err != null) {
                                //req.flash('error', err);
                            }
             
                            //console.log("sector=" + JSON.stringify(sector));
                            res.render('bridge', {  config:options.config, layout:'game_layout', 
                                                    sector:sector, faction:faction, fleet:fleet, factionSectors:factionSectors });
                        });
                    });
                });
            });
        }
    });

    router.get('/bigbang', function(req, res) {

        var bigBangData = {};
        starmap_controller.bigBang(bigBangData, function (err, bigBangData) {
            faction_controller.bigBang(bigBangData, function (err, bigBangData) {
                fleet_controller.bigBang(bigBangData, function (err, bigBangData) {
                    res.json(bigBangData);
                });
            });
        });
    });

    router.post('/warpfleet', function(req, res) {
        var uid = req.cookies.uid;
        var fleetIdString = req.param("fleetId");
        var fleetId = new ObjectId( fleetIdString );
        var sid = parseInt(req.param("sid"));
        var starId = parseInt(req.param("starId"));

        fleet_controller.warpFleet(uid, fleetId, sid, starId, function (err, updatedFleet) {
            res.json(updatedFleet);
        });
    });    

    return router;
}
