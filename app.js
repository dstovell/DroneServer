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
var defaultMongoServer = (process.env.NODE_ENV == 'development') ? "mongodb://localhost:27017/DroneServer" : "mongodb://droneadmin:droneadmin1234@proximus.modulusmongo.net:27017/qI7taqes";
var db = mongo.db(process.env.MONGO_URL || defaultMongoServer, { native_parser: true });


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

options.config = require('./config/global.json');

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
    app.use('/admin/galaxy', require('./routes/admin/galaxy')(options) );

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
