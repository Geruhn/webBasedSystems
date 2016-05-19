var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')

var index = require('./routes/index');
var tagging = require('./routes/tagging');
var discovery = require('./routes/discovery');
var api = require('./routes/api.js');


var app = express();
app.locationTable = require('./app/locationTable');
//app.locations = Array();

// test data

app.locationTable.add({
	name: 'A', 
	hashtag: 'school',
	latitude: 160,
	longitude: 10
});

app.locationTable.add({
	name: 'B', 
	hashtag: 'school',
	latitude: -20,
	longitude: 110
});

app.locationTable.add({
	name: 'C', 
	hashtag: 'school',
	latitude: -20,
	longitude: -10
});


//app.set('css', path.join(__dirname, 'public/css'));
app.use(express.static('public'));

//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'jade');
app.use('/', index);
app.use('/tagging', tagging);
app.use('/discovery', discovery);
app.use('/api', api);

app.listen(7120);

module.exports = app;
