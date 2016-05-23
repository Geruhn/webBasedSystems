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
	var location = req.app.tagging.correctRepresentation(JSON.parse(req.body['data']));
	console.log(location);
	var options = {};
	if(req.app.tagging.validateLocation(location, options)) {
		req.app.locationTable.add(location, function(success) {
			if(success) {
				res.status(200).send('Success');
			} else {
				res.status(400).send('You\'re request was invalid');
			}
		});
	} else {
		res.status(400).send('You\'re request was invalid');
	}
});
//update
router.put('/locations', function(req, res, next) {

});
//remove
router.delete('/locations:id', function(req, res, next) {

});


module.exports = router;
