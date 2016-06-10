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
		return function(err, reply) {
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
		console.log(successfullyPosted);
		if(!options.successfullyPosted) {
			options.postData = location;
			appendErrorMessages(options);
		}
		req.app.locationTable.getAllLocations((function(res, options) {
			return function(err, reply) {
				options.locations = reply;
				res.render('tagging', options);
			}
		})(res, options));
	});
})
.get('/delete/:id', function getDeleteTagPage(req, res, next) {
	var options = {};
	options.deletedId = req.params.id;
	req.app.locationTable.get(req.params.id, (function(res, options) {
		return function(success, reply) {
			if(success && reply !== null) {
				options.title = "Deleting \"" + reply.name + "\"";
				options.location = reply;
				options.location.hashtag = options.location.hashtag.split(',');
				res.render('deleteTagPage', options);
			} else {
				options.title = "404";
				options.errorMessage = "Sorry the location you requested is not available.";
				res.render('404', options);
			}
		}
	})(res, options));
})
.post('/delete/:id', function deleteTag(req, res, next) {
	req.app.locationTable.remove(req.params.id, (function(res) {
		return function(successfullyDeleted) {
			res.redirect(302, '/tagging?deletedId=' + req.params.id);
		}
	})(res));
})
.get('/update/:id', function getUpdateTagPage(req, res, next) {
	var options = {};
	req.app.locationTable.get(req.params.id, (function(res, options) {
		return function(success, reply) {
			if(success && reply !== null) {
				options.title = 'Updating "' + reply.name + '"';
				options.location = reply;
				res.render('updateTagPage', options);
			} else {
				options.title = "404";
				options.errorMessage = "Sorry the location you requested is not available.";
				res.render('404', options);
			}
		}
	})(res, options));
})
.post('/update/:id', function updateTag(req, res, next) {
	console.log('Updating Post');
	req.app.locationTable.update(req.body, (function(res) {
		return function(successfullyUpdated) {
			console.log('success');
			res.redirect(302, '/tagging?updatedId=' + req.params.id);
		}
	})(res));
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
