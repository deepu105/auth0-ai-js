var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');
//var oauth2Router = require('./routes/oauth2');
//var cibaRouter = require('./routes/ciba');

/*
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"message":"Hello"}' \
  http://localhost:3000/api/login
*/

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

//app.use('/oauth2', oauth2Router);
//app.use('/oauth2', cibaRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
  res.json({
    error: err.message
  })
});

module.exports = app;
