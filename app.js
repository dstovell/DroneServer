var express = require('express');
var engine = require('ejs-locals');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
// Database
var mongo = require('mongoskin');
var db = mongo.db(process.env.MONGO_URL || "mongodb://localhost:27017/DroneServer", { native_parser: true });


function printTitle() {
    console.log("                              /~~~~~|     ");
    console.log("                         .__./''''''|     ");
    console.log("          ._____________/   |/^^^^^^^\\    ");
    console.log("          |             `==='\\_______/    ");
    console.log("          `.             .___/^^^^^^^^\\   ");
    console.log("            `------------'~~~\\________/   ");
    console.log("                            `........\\    ");
    console.log("                              `-------'   ");

    console.log("    ________                              ");
    console.log("    \\______ \\_______  ____   ____   ____  ");
    console.log("     |    |  \\_  __ \\/  _ \\ /    \\_/ __ \\ ");
    console.log("     |    |   \\  | \\(  <_> )   |  \\  ___/ ");
    console.log("    /_______  /__|   \\____/|___|  /\\___  >");
    console.log("            \\/                  \\/     \\/ ");

    console.log("              _________                                ");
    console.log("            /   _____/ ______________  __ ___________   ");
    console.log("            \\_____  \\_/ __ \\_  __ \\  \\/ // __ \\_  __ \\  ");
    console.log("            /        \\  ___/|  | \\/\\   /\\  ___/|  | \\/  ");
    console.log("           /_______  /\\___  >__|    \\_/  \\___  >__|    ");
    console.log("                   \\/     \\/                 \\/        ");
}

var options = {};

//Move this somewhere else later
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
    },

    factions: {
        npc:[
            { name:'Feds', color:'green', starCount:10, contiguous:true },
            { name:'Pirates', color:'red', starCount:5, contiguous:false},
            { name:'Civillians', color:'yellow', starCount:0 }
        ]
    },

    fleets: {
        classes:[
            {name:'Fighter'},
            {name:'Shuttle'},
            {name:'Corvette'},
            {name:'Freighter'},
            {name:'Capitol'},
        ],

        baseShips:[
            { name:'Shuttle Pod',       warp:6, holds:5,    figs:50,    shields:50,     odds:0.7,   cost:0},
            { name:'Merchant Cruiser',  warp:3, holds:75,   figs:2500,  shields:400,    odds:1.0,   cost:131695},
            { name:'Scout Marauder',    warp:2, holds:25,   figs:150,   shields:100,    odds:2.0,   cost:27785},
            { name:'Missile Frigate',  warp:3, holds:60,   figs:5000,  shields:400,    odds:1.3,   cost:146832},
            { name:'BattleShip',        warp:4, holds:80,   figs:10000, shields:750,    odds:1.6,   cost:190236},
            { name:'Corporate FlagShip',warp:3, holds:85,   figs:20000, shields:1500,   odds:1.2,   cost:352285},
            { name:'Colonial Transport',warp:6, holds:250,  figs:200,   shields:500,    odds:0.6,   cost:711400},
            { name:'CargoTran',         warp:4, holds:125,  figs:400,   shields:1000,   odds:0.8,   cost:226125},
            { name:'Merchant Freighter',warp:2, holds:65,   figs:300,   shields:500,    odds:0.8,   cost:100015},
            { name:'Imperial StarShip', warp:4, holds:150,  figs:50000, shields:2000,   odds:1.5,   cost:669290},
        ]
    }
}

exports.init = function (port) {

    printTitle();

    var app = express();

    app.engine('ejs', engine);

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.set('layout', 'layout')

    app.use(expressLayouts);
    app.use(favicon());
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(flash());

    app.use(express.static(path.join(__dirname, 'static')));
    //app.use(express.methodOverride());
    //app.enable("jsonp callback");

    app.locals.title = 'DroneServer2';
    app.locals.description = 'DroneServer2';
    app.locals.author = 'dstovell';
    //app.locals._layoutFile = true;

    // Make our db accessible to our router
    app.use(function (req, res, next) {
        req.db = db;
        next();
    });

    options.db = db;

    app.use('/', require('./routes/admin/index'));
    app.use('/admin', require('./routes/admin/index'));
    app.use('/admin/users', require('./routes/admin/users')(options) );

    app.use('/api/users', require('./routes/api/users'));

    app.use('/game/bridge', require('./routes/game/bridge')(options) );
    app.use('/game/users', require('./routes/game/users')(options) );

    //var art = require('framework/art');

    /// catch 404 and forwarding to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        res.render('404.ejs', { locals: { error: err }, status: 404 });
    });

    /// error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    return app;
}


//module.exports = app;
