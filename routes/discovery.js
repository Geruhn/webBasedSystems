var express = require('express');
var router = express.Router();
var options;
var defaultOptions = {
	title : 'GeoTagging App - Discovery',
	pageName : "Discovery"
};
/* GET home page. */
router.get('/', function index(req, res, next) {
	setupOptions();
	options.locations = req.app.locationTable.get();
	res.render('discovery', options);
}).post('/', function getVicinity(req, res, next) {
	setupOptions();

	options.locations = req.app.locationTable.get();
	res.render('discovery', options);
});

function simpleClone(object) {
	return JSON.parse(JSON.stringify(object));
}

function setupOptions() {
	options = simpleClone(defaultOptions);
}

function toDegrees(rad) {
	return rad*(180/Math.PI);
}
 
function toRadians(deg) {
	return deg * (Math.PI/180);
}

function calculateDistance (location1, location2) {
	return calculateDistance(location1.latitude, location1.longitude, location2.latitude, location2.longitude);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
	var R = 6371000; // metres
	var φ1 = toRadians(lat1);
	var φ2 = toRadians(lat2);
	var Δφ = toRadians(lat2-lat1);
	var Δλ = toRadians(lon2-lon1);

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	        Math.cos(φ1) * Math.cos(φ2) *
	        Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;

	return d/1000.0;
}

module.exports = router;
