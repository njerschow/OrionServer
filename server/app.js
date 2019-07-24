//Required Modules
const express = require('express');
const app = require('express')();
const bodyParser = require('body-parser');
const path = require('path')



//View configuration
app.set('views', 'views');
app.set('view engine', 'pug');
app.use('/', express.static(path.join(__dirname, 'public')));
app.locals.basedir = path.join(__dirname, 'public');



//JS files
require('./router/login')(app);
require('./router/talent')(app);




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




//run test server on http port
app.listen(80);