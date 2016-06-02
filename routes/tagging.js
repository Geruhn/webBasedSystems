var express = require('express');
var router = express.Router();
var defaultOptions = {
	title : 'GeoTagging App - Tagging',
	pageName : 'Tagging'
};
//var options = {};
var errorMessages = {
	nameIsEmpty: "The name field was empty.",
	hashtagIsEmpty: "The hashtag field was empty.",
	latitudeIsNaN: "The latitude was not a number.",
	longitudeIsNaN: "The longitude was not a number.",
}
/* GET home page. */
router.get('/', function index(req, res, next) {
	var options = {};
	setupOptions(options);
	req.app.locationTable.getAllLocations((function(res, options) {
		return function(reply) {
			options.locations = reply;
			res.render('tagging', options);
		}
	})(res, options));
	//res.render('tagging', options);
})
.post('/', function postingTag(req, res, next) {
	var options = {};
	req.app.locationTable.add(req.body, function(successfullyPosted, options) {
		setupOptions(options);
		options.successfullyPosted = successfullyPosted;
		if(!options.successfullyPosted) {
			options.postData = location;
			appendErrorMessages(options);
		}
		req.app.locationTable.getAllLocations((function(res, options) {
			return function(reply) {
				options.locations = reply;
				res.render('tagging', options);
			}
		})(res, options));
	});
});


function setupOptions(options) {
	var newOptions = JSON.parse(JSON.stringify(defaultOptions));
	options.title = newOptions.title;
	options.pageName = newOptions.pageName;
}

function appendErrorMessages(options) {
	for (error in options.errors) {
		if(options.errors[error] === true) {
			options.errors[error] = errorMessages[error];
		} else {
			delete options.errors[error];
		}
	}
}

module.exports = router;
