var express = require('express');
var router = express.Router();
var defaultOptions = {
	title : 'GeoTagging App - Tagging',
	pageName : 'Tagging'
};
var options;
var errorMessages = {
	nameIsEmpty: "The name field was empty.",
	hashtagIsEmpty: "The hashtag field was empty.",
	latitudeIsNaN: "The latitude was not a number.",
	longitudeIsNaN: "The longitude was not a number.",

}
/* GET home page. */
router.get('/', function index(req, res, next) {
	setupOptions();
	req.app.locationTable.getAllLocations((function(res, options) {
		return function(reply) {
			options.locations = reply;
			res.render('tagging', options);
		}
	})(res, options));
	//res.render('tagging', options);
})
.post('/', function postingTag(req, res, next) {
	setupOptions();
	options.title += ' Posted';
	var location = correctRepresentation(req.body);
	if(validateLocation(location, options)) {
		req.app.locationTable.add(location, function(successfullyPosted) {
			options.successfullyPosted = successfullyPosted;
			if(!options.successfullyPosted) {
				options.postData = location;
				appendErrorMessages();
			}
			req.app.locationTable.getAllLocations((function(res, options) {
				return function(reply) {
					options.locations = reply;
					res.render('tagging', options);
				}
			})(res, options));
		});
	} else {
		options.successfullyPosted = false;
		options.postData = location
		appendErrorMessages();
		req.app.locationTable.getAllLocations((function(res, options) {
			return function(reply) {
				options.locations = reply;
				res.render('tagging', options);
			}
		})(res, options));
	}
});
function correctRepresentation(location) {
	if(location.hasOwnProperty("latitude") && location.hasOwnProperty("longitude")) {
		var latFl = parseFloat(location.latitude);
		var lonFl =  parseFloat(location.longitude);
		if(!isNaN(latFl)) {
			location.latitude = latFl;
		}
		if (!isNaN(lonFl)) {
			location.longitude = lonFl;
		}
	}
	return location;
}


function validateLocation(location, options) {
	options.errors = {};
	options.errors.nameIsEmpty = location.hasOwnProperty("name") && location.name.length === 0;
	options.errors.hashtagIsEmpty = location.hasOwnProperty("hashtag") &&  location.hashtag.length === 0;
	options.errors.latitudeIsNaN = typeof(location.latitude) !== 'number';
	options.errors.longitudeIsNaN = typeof(location.longitude) !== 'number';

	var correctedLocation = !options.errors.nameIsEmpty
							&& !options.errors.hashtagIsEmpty
							&& !options.errors.latitudeIsNaN
							&& !options.errors.longitudeIsNaN
							&& !location.hasOwnProperty("id");/*
							&& !isNaN(location.latitude)
							&& !isNaNsentation;
module.exports.validateLocation = validateLocation;(location.longitude);*/

	return correctedLocation;
}


function setupOptions() {
	options = JSON.parse(JSON.stringify(defaultOptions));
}

function appendErrorMessages() {
	for (error in options.errors) {
		if(options.errors[error] === true) {
			options.errors[error] = errorMessages[error];
		} else {
			delete options.errors[error];
		}
	}
}

module.exports = router;
module.exports.correctRepresentation = correctRepresentation;
module.exports.validateLocation = validateLocation;
