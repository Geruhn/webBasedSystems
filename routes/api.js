var express = require('express');
var router = express.Router();

router.get('/locations', function(req, res, next) {
	req.app.locationTable.getAllLocations(function(reply) {
		res.json(reply);
	});
});


module.exports = router;
