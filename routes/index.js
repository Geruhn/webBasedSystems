var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function index(req, res, next) {
	res.render('layout', {
		title : 'GeoTagging App - Home',
		pageName : 'Home'
	});
});

module.exports = router;
