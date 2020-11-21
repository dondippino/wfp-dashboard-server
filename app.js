var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var zeroHungerRouter = require('./routes/zero-hunger');
var mvamRouter = require('./routes/mvam');

// var zeroHungermodel = require('./models/zero-hunger')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(zeroHungermodel);

app.use('/', indexRouter);
app.use('/zero-hunger', zeroHungerRouter);
app.use('/mvam', mvamRouter);

module.exports = app;
