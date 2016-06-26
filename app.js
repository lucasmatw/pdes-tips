var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var passport = require('passport');
require('./models/Users');
require('./models/Ideas');
require('./models/Activities');
require('./models/Assignments');


require('./config/passport');

var connectionString = process.env.HEROKU_MONGODB_URI;
console.log('mongodb connection is = '+ connectionString);
mongoose.connect(connectionString || 'mongodb://localhost/news');

var routes = require('./routes/index');
//var users = require('./routes/users');
var activityLog = require('./routes/activityLog').logger;
var activities = require('./routes/activities');
var ideas = require('./routes/ideas');
var authentication = require('./routes/authentication');
var pendingIdeas = require('./routes/pendingIdeas');
var findUser = require('./routes/findUser');
var assignments = require('./routes/assignments');

var app = express();

// view engine setuphu
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());


app.all('/*', function(req, res, next){
 activityLog(req, res);
 next();
});

//app.use(findUser);

app.use('/', routes);
//app.use('/users', users);
app.use('/ideas', ideas);
app.use('/auth', authentication);
app.use('/activities', activities);
app.use('/pending_ideas', pendingIdeas);
app.use('/assignments', assignments);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
