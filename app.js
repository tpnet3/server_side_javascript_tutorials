var express = require('express');
var app = express();
app.use(express.static('public'));
app.get('/', function(req, res){
    res.send('Hello home page');;
});
app.get('/dynamic', function(req, res){
  var lis = '';
  for(var i=0; i<5; i++){
    lis = lis+'<li>coding</li>';
  }
  var output = `
    <!DOCTYPE html>
    <html>
      <body>
        Hello, Dynamic HTML
        ${lis}
      </body>
    </html>
  `;
  res.send(output);
});
app.get('/route', function(req, res){
    res.send('Hello Router, <img src="/route.png">')
})
app.get('/login', function(req, res){
    res.send('<h1>Login please</h1>');
});
app.listen(3000, function(){
    console.log('Conneted 3000 port!');
});
