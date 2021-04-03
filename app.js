var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
const cors = require("cors");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var balanceRouter = require('./routes/balanceReq');
var flyerRouter = require('./routes/flyer')
var willRouter = require('./routes/basicWill')

var app = express();
const port = 61550;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/balance', balanceRouter);
app.use('/flyer', flyerRouter);
app.use('/will', willRouter);

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
  res.render('error');
});

mongoose
  .connect("mongodb+srv://aamna:aamna@cluster0.z9eyp.mongodb.net/will?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(success => console.log("Successfully connected to database"))
  .catch(err => console.log("Error while connecting to database"));

app.listen(port, () => console.log(`App listening on port : ${port}`));
module.exports = app;
