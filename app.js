var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')

var index = require('./routes/index');
var discovery = require('./routes/discovery');
var api = require('./routes/api.js');


var app = express();
app.tagging = require('./routes/tagging');
app.locationTable = require('./app/locationTable');
//app.locations = Array();

// test data

app.locationTable.add({
	name: 'HSKA',
	hashtag: 'school, workplace',
	latitude: 160,
	longitude: 10
});

app.locationTable.add({
	name: 'Büro',
	hashtag: 'school, workplace',
	latitude: -20,
	longitude: 110
});

app.locationTable.add({
	name: 'Cha Cha Unterricht',
	hashtag: 'school ,fun',
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
app.use('/tagging', app.tagging);
app.use('/discovery', discovery);
app.use('/api', api);

app.listen(7120);

module.exports = app;
