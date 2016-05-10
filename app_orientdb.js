var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
var upload = multer({ storage: _storage });
var fs = require('fs');
var OrientDB = require('orientjs');
var server = OrientDB({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: '111111'
});
var db = server.use('o2');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;
app.use('/user', express.static('uploads'));
app.set('views', './views/orientdb');
app.set('view engine', 'jade');
app.get('/upload', function(req, res){
  res.render('upload');
});
app.post('/upload', upload.single('userfile'), function(req, res){
  res.send('Uploaded : '+req.file.filename);
});

var topic = require('./routes/orientdb/topic')();
app.use('/topic', topic);

app.listen(3003, function(){
  console.log('Connected, 3003 port!');
})
