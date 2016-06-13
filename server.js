var path = require('path'),
    express = require('express'),
    session = require('express-session'),
    nunjucks = require('express-nunjucks'),
    routes = require(__dirname + '/app/routes.js'),
    favicon = require('serve-favicon'),
    app = express(),
    basicAuth = require('basic-auth'),
    bodyParser = require('body-parser'),
    browserSync = require('browser-sync'),
    config = require(__dirname + '/app/config.js'),
    port = (process.env.PORT || config.port),
    utils = require(__dirname + '/lib/utils.js'),
    packageJson = require(__dirname + '/package.json'),
    Mincer  = require('mincer');

// Middleware to serve static assets
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_template/assets'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit'));
app.use('/public/images/icons', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit/images'));

// Elements refers to icon folder instead of images folder
app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images','favicon.ico')));

Mincer.logger.use({
  error: function(msg) {
    console.error('ERROR:', msg);
  },
  log: function(msg) {
    console.error('LOG:', msg);
  },
  debug: function(msg) {
    console.error('DEBUG:', msg);
  }
});

var environment = new Mincer.Environment();

environment.appendPath('app/assets/javascripts');
environment.appendPath('app/assets/javascripts/vendor');
environment.appendPath('lib/admin');
environment.appendPath('govuk_modules/govuk_frontend_toolkit/javascripts');
environment.appendPath('lib/govuk_admin_template/app/assets');
environment.appendPath('lib/govuk_admin_template/app/assets/javascripts');
environment.appendPath('lib/jquery-rails-3.1.3/vendor/assets/javascripts');
environment.appendPath('lib/jquery-ui-rails-5.0.5/app/assets/javascripts');
environment.appendPath('lib/shared_mustache-0.2.1/vendor/assets/javascripts');
environment.appendPath('node_modules/bootstrap-sass/assets/javascripts');
environment.appendPath('node_modules/bootstrap-sass/assets');

app.use('/public', Mincer.createServer(environment));

// Grab environment variables specified in Procfile or as Heroku config vars
var releaseVersion = packageJson.version,
    username = process.env.USERNAME,
    password = process.env.PASSWORD,
    env      = process.env.NODE_ENV || 'development',
    useAuth  = process.env.USE_AUTH || config.useAuth,
    useHttps = process.env.USE_HTTPS || config.useHttps,
    useAutoStoreData  = process.env.USE_AUTOSTOREDATA || config.useAutoStoreData;

// Authenticate against the environment-provided credentials, if running
// the app in production (Heroku, effectively)
if (env === 'production' && useAuth === 'true'){
    app.use(utils.basicAuth(username, password));
}

// Application settings
app.set('view engine', 'html');
app.set('views', [__dirname + '/app/views', __dirname + '/lib/']);

nunjucks.setup({
  autoescape: true,
  watch: true,
  noCache: true
}, app);


// Support for parsing data in POSTs
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Support session data
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: Math.round(Math.random()*100000).toString()
}));

// send assetPath to all views
app.use(function (req, res, next) {
  res.locals.asset_path="/public/";
  next();
});

// Add variables that are available in all views
app.use(function (req, res, next) {
  res.locals.serviceName = config.serviceName;
  res.locals.cookieText = config.cookieText;
  res.locals.releaseVersion = "v" + releaseVersion;
  res.locals.useAutoStoreData = (useAutoStoreData == 'true');
  next();
});

// Force HTTPs on production connections
if (env === 'production' && useHttps === 'true'){
  app.use(utils.forceHttps);
}

// Automatically store form data and send to all views
if (useAutoStoreData === 'true'){
  app.use(utils.autoStoreData);
}

// Disallow search index idexing
app.use(function (req, res, next) {
  // Setting headers stops pages being indexed even if indexed pages link to them.
  res.setHeader('X-Robots-Tag', 'noindex');
  next();
});

app.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /");
});

// routes (found in app/routes.js)
if (typeof(routes) != "function"){
  console.log(routes.bind);
  console.log("Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.")
  routes.bind(app);
} else {
  app.use("/", routes);
}

// auto render any view that exists
app.get(/^\/([^.]+)$/, function (req, res) {

  var path = (req.params[0]);

  res.render(path, function(err, html) {
    if (err) {
      res.render(path + "/index", function(err2, html) {
        if (err2) {
          console.log(err);
          res.status(404).send(err + "<br>" + err2);
        } else {
          res.end(html);
        }
      });
    } else {
      res.end(html);
    }
  });

});

// redirect all POSTs to GETs to avoid nasty refresh warning
app.post(/^\/([^.]+)$/, function(req, res){
  res.redirect("/" + req.params[0]);
});

console.log("\nGOV.UK Prototype kit v" + releaseVersion);
// Display warning not to use kit for production services.
console.log("\nNOTICE: the kit is for building prototypes, do not use it for production services.");

// start the app
utils.findAvailablePort(app, function(port) {
  console.log('Listening on port ' + port + '   url: http://localhost:' + port);
  if (env === 'production') {
    app.listen(port);
  } else {
    app.listen(port-50,function()
    {
      browserSync({
        proxy:'localhost:'+(port-50),
        port:port,
        ui:false,
        files:['public/**/*.*','app/views/**/*.*'],
        ghostmode:false,
        open:false,
        notify:false,
        logLevel: "error"
      });
    });
  }
});
