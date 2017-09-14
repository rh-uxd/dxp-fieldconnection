//  OpenShift sample Node application
var express = require('express'),
  fs      = require('fs'),
  app     = express(),
  eps     = require('ejs'),
  morgan  = require('morgan'),
  path    = require('path');

//var bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
console.log('serving from this folder: ' + path.join(__dirname, 'dist'));
app.use('/', express.static(path.join(__dirname , 'dist')));

Object.assign=require('object-assign');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));

var port = 8080,
  ip   = '0.0.0.0';

// app.get('*', function(req, res) {
//
// })
// app.get('/app', function(req, res, next) {
//   //Path to your main file
//   res.status(200).sendFile(path.join(__dirname + '/dist/index.html'));
// });

//app.use(express.static('/dist/index.html'));

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
