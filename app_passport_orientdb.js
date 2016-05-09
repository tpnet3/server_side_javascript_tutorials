var express = require('express');
var session = require('express-session');
var OrientoStore = require('connect-oriento')(session);
var bodyParser = require('body-parser');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var db = require('./config/orientdb/db')();
var app = express();
app.set('views', './views/orientdb');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true,
  store:new OrientoStore({
    server:'host=localhost&port=2424&username=root&password=111111&db=o2'
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/count', function(req, res){
  if(req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('count : '+req.session.count);
});
app.get('/auth/logout', function(req, res){
  req.logout();
  req.session.save(function(){
    res.redirect('/welcome');
  });
});
app.get('/welcome', function(req, res){
  if(req.user && req.user.displayName) {
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a>
    `);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
    `);
  }
});
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.authId);
});
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  var sql = "SELECT displayName FROM user WHERE authId=:authId";
  db.query(sql, {params:{authId:id}}).then(function(results){
    if(results.length === 0){
      done('There is no user.');
    } else {
      done(null, results[0]);
    }
  });
});
passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;
    var sql = 'SELECT * FROM user WHERE authId=:authId';
    db.query(sql, {params:{authId:'local:'+uname}}).then(function(results){
      if(results.length === 0){
        return done(null, false);
      }
      var user = results[0];
      return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
        if(hash === user.password){
          console.log('LocalStrategy', user);
          done(null, user);
        } else {
          done(null, false);
        }
      });
    })
  }
));
passport.use(new FacebookStrategy({
    clientID: '1602353993419626',
    clientSecret: 'ad9ceec42e67b706992ac7f1fc2aeee7',
    callbackURL: "/auth/facebook/callback",
    profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authId = 'facebook:'+profile.id;
    var sql = 'SELECT FROM user WHERE authId=:authId';
    db.query(sql, {params:{authId:authId}}).then(function(results){
      console.log(results, authId);
      if(results.length === 0){
        var newuser = {
          'authId':authId,
          'displayName':profile.displayName,
          'email':profile.emails[0].value
        };
        var sql = 'INSERT INTO user (authId, displayName, email) VALUES(:authId, :displayName, :email)';
        db.query(sql, {params:newuser}).then(function(){
          done(null, newuser);
        }, function(error){
          console.log(error);
          done('Error');
        })
      } else {
        return done(null, results[0]);
      }
    })
  }
));

var auth = require('./routes/orientdb/auth')(passport);
app.use('/auth', auth);

app.listen(3003, function(){
  console.log('Connected 3003 port!!!');
});
