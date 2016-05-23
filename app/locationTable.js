var redis = require('redis');

var client = redis.createClient();
var locations = Array();
var id = 0;
var redisIsConnected = false;
client.on('connect', function() {
	console.log('Connected');
	redisIsConnected = true;
});
client.on('error', function(err) {
	redisIsConnected = false;
	console.log(err);
});

module.exports.add = function(location, callback) {
//	if(redisIsConnected) {

		client.incr('locationID', function(err, reply) {
			client.hmset('locations:' + reply, location, function(err, res) {
				console.log('locations:' + reply);
				client.hgetall('locations:' + reply, function(err, reply) {
					console.log(reply);
				});
				if(callback) {
					callback(!err);
				}
			});
		});
//	}

};

module.exports.remove = function(id, callback) {
	client.del('locations:' + id, function(err, reply) {
		if(callback) {
			callback(!err)
		}
	});
};/*
module.exports.get = function() {
//	if(redisIsConnected) {
		return simpleClone(locations);
//	} else {

//	}
};*/

module.exports.getAllLocations = function(callback) {
	client.keys('locations:[0-9]*', function(err, reply) {
		var res = Array();
		for(var i = 0; i < reply.length; i++) {
			client.hgetall(reply[i], (function(length, res, callback) {
				return function(err, reply) {
					res.push(reply);
					if(res.length == length) {
						callback(res);
					}
				}
			})(reply.length, res, callback));
		}
	});
}

function simpleClone(object) {
	return JSON.parse(JSON.stringify(object));
}
