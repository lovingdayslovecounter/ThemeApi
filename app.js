let port = 9001
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
var Request = require("request");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(bodyParser.json());
app.use(logger('dev'));

// Mongoose
mongoose.connect("mongodb+srv://admin:YgyV7SmnmIBGbfGD@clustertheme-nyrvr.mongodb.net/ThemeDB?retryWrites=true&w=majority", {
  "useNewUrlParser": true,
  "socketTimeoutMS": 0,
  "keepAlive": true,
  "reconnectTries": 10
});

var themes = new mongoose.Schema({
  "_id": {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  }
  , "count": Number
  , "name": String
  , "data": String
});

let Themes = mongoose.model("themes", themes);

app.get("/themes/:count", (req, res) => {
  //res.set("Content-Type", "application/json");
  process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
    return prepareUnsuccessfulResponse(false, res);
  });
  
  var count = req.params.count;

  if(count > 0) {
    Themes.find({ count: { $gte: count } }, { "data": true, "count": true, "name": true, "_id": false }, (err, themes) => {
      if (themes != null && themes.length > 0) {
        var themeData = themes.map(theme => ({ name: theme.name, count: theme.count, data: theme.data }));
        var responseData = {
          isSuccess: true, 
          data : themeData
        };
        res.status(200).send(responseData);
      }
      else {
        return prepareUnsuccessfulResponse(true, res);
      }
    });
  }
  else {
    return prepareUnsuccessfulResponse(true, res);
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
app.listen(port);
console.log("Server is running @ port ".concat(port));

function prepareUnsuccessfulResponse(isSuccess, res) {
  var responseData = {
    isSuccess: isSuccess,
    data: null
  };
  res.status(200).send(responseData);
  return responseData;
}