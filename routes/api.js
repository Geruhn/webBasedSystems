var express = require('express');
var router = express.Router();

//get
router.get('/locations', function(req, res, next) {
	req.app.locationTable.getAllLocations(function(reply) {
		res.json(reply);
	});
});
//add
router.post('/locations', function(req, res, next) {
	req.app.locationTable.add(location, function(success) {
		if(success) {
			res.status(200).send('Success');
		} else {
			res.status(400).send('You\'re request was invalid');
		}
	});
});
//update
router.put('/location/:id', function(req, res, next) {
	var location = JSON.parse(req.body['data']);
	console.log(location);
	var options = {};


	res.status(500).send('Me no can do, yet');


});
//remove
router.delete('/location/:id', function(req, res, next) {
	res.status(500).send('Me no can do, yet');
});

router.get('/location/:searchterm', function(req, res, next) {
	req.app.locationTable.search(req.params.searchterm, (function(res) {
		return function(err, reply) {
			if(!!err) {
				console.log(reply);
				res.json(reply);
			} else {
				res.status(404).send("You're requested searchterm delivered no results.");
			}
		}
	})(res));
});

module.exports = router;
