var express = require('express');
var router = express.Router();

router.get('/locations', function(req, res, next) {
	/*res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(locations));*/
	res.json(req.app.locationTable.get());
})


module.exports = router;
