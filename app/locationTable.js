var locations = Array();
var id = 0;
module.exports.add = function(location) {
	location.id = id++;
	locations.push(location);
};
module.exports.get = function() {
	return simpleClone(locations);
};

function simpleClone(object) {
	return JSON.parse(JSON.stringify(object));
}