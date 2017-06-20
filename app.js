/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const fs = require('fs');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
//const RedisStore = require('connect-redis')(session);
//const redisUrl = require('redis-url');
// const sessionStore = require('sessionstore');
//


/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Create Express server.
 */
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);



/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

const sessionStore = new MongoStore({
  url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
  autoReconnect: true,
  clear_interval: 3600
});
//var sessionStore = new RedisStore({ client: redisUrl.connect(process.env.REDIS_URL) });


/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
/**
 * Session configuration.
 */
app.use(session({
  //key: 'connect.sid',
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  cookieParser: cookieParser
}));
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  //key: 'connect.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  //passport: passport,
  success: onAuthorizeSuccess,
  fail: onAuthorizeFail
}));

function onAuthorizeFail(d, m, e, accept) {
  console.log('Connection Failed to socket.io ', e, m);
  accept(null, false);
}
function onAuthorizeSuccess(d, accept) {
  console.log('successful connection to socket.io');
  accept(null, true);
}

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
    req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Router
 */
const socketIO = require('./routes/websockets')(io);

const indexRoute = require('./routes/index');
const authRoute = require('./routes/auth');
const accountRoute = require('./routes/account');
const gameRoute = require('./routes/game');
app.use('/', indexRoute);
app.use('/auth', authRoute);
app.use('/account', accountRoute);
app.use('/', gameRoute);


/**
 * Start Express server.
 */
server.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
});

module.exports = app;
