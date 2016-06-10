var redis = require('redis');

var client = redis.createClient();
var locations = Array();
var id = 0;
var redisIsConnected = false;
client.on('connect', function() {
	//console.log('Connected');
	redisIsConnected = true;
});
client.on('error', function(err) {
	redisIsConnected = false;
	//console.log(err);
});

module.exports.get = function(id, callback) {
	client.hgetall('locations:' + id, function(err, reply) {
		if (callback) {
			callback(!err, reply);
		}
	})
}

module.exports.add = function(location, callback) {
//	if(redisIsConnected) {
		console.log(location);
		var options = {};
		location = correctRepresentation(location);
		//console.log('ASDF1');
		//console.log(location.hashtag);
		var hashtags = location.hashtag;
		//console.log(hashtags);
		location.hashtag = location.hashtag.join(', ');
		if(validateLocation(location, options)) {
			//console.log('Adding: location');
			//console.log(location.name);
			//console.log(location.hashtag);

			client.incr('locationID', function(err, id) {
				id -= 1; //is done so IDs start with 0 and I dont have to lock, get, incr, unlock, hmset
				if(!err) {
					//console.log('ASDF2');
					//console.log(location.hashtag);
					//console.log(hashtags);
					client.sadd('hashtags:' + location.id, location.hashtag, function(err, res) {
						if(!err) {
							client.hmset('locations:' + id, location, function(err, res) {
								//console.log('locations:' + id);
								client.hgetall('locations:' + id, function(err, reply) {
									//console.log(reply);
								});
								if(!err) {
									client.sadd('location:' + location.name, id, function(err, reply) {
										if(!err) {
											client.sadd('locations', location.name, function(err, reply) {
												if(!err) {
													var status = {
														hashtagsLength: 0,
														lastRequestForHashtagWasSent: false
													}
													for (var i = hashtags.length - 1; i >= 0; i--) {
														//console.log('adding id ' + id + ' to hashtag ' + hashtags[i]);
														status.hashtagsLength++;
														//console.log('status.hashtagsLength is now: ' + status.hashtagsLength);
														client.sadd('hashtag:' + hashtags[i], id, ( function(tag, status) {
																return function(err, reply) {
																	if(!err) {
																		//console.log("No Error");
																		//console.log('Adding hashtag: ' + tag + ' to the hashtags list');
																		client.sadd('hashtags', tag, (function(status) {
																			return function(err, reply) {
																				status.hashtagsLength--;
																				if(!err) {

																					//console.log('status.lastRequestForHashtagWasSent is now: ' + status.lastRequestForHashtagWasSent);
																					//console.log('status.hashtagsLength is now: ' + status.hashtagsLength);
																					if(status.lastRequestForHashtagWasSent && status.hashtagsLength === 0) {
																						//console.log('adding hashtags done');
																						if(callback) {
																							callback(!err, options);
																						}
																					}
																				}
																			}
																		})(status));
																	}
																}
														})(hashtags[i], status));
													}
													status.lastRequestForHashtagWasSent = true;
													//console.log('status.lastRequestForHashtagWasSent is now: ' + status.lastRequestForHashtagWasSent);
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		} else {
			if(callback) {
				callback(false, options);
			}
		}

//	}
//TRANSACTIONS versuchen
};

module.exports.search = function(searchterm, callback) {
	console.log("Started searching: " + searchterm);
	var search = Array();
	search["location"] = Array();
	search["hashtag"] = Array();
	var searchL = Array();
	var searchH = Array();

	var status = {
		result: "", //debugging Array
		resultLength: 0,
		lastRequestForIdWasSent: false,
		lastRequestForLocationWasSent: false,
		ids: "",
		idsLength: 0,
		locations: "",
		locationsLength: 0,
		errors: { 					//not yet implemented
			getLocations: false,
			getHashtags: false,
			getIds: false,
			getLocationsByIds: false
		},
		hasError : function() {
			var result = false;
			for(error in errors) {
				result = result | errors[error];
			}
		}
	};
	status.result = Array();
	status.ids = Array();
	status.locations = Array();

	getAllLocationNames(makeResultCallback("location", status, searchterm, callback))
	getAllHashtagNames(makeResultCallback("hashtag", status, searchterm, callback));
};

module.exports.remove = function(id, callback) {
	client.del('locations:' + id, function(err, reply) {
		if(callback) {
			callback(!err)
		}
	});
};

function getAllLocationNames(callback) {
	client.smembers('locations', function(err, reply) {
		callback(err, reply);
	});
}

function getAllHashtagNames(callback) {
	client.smembers('hashtags', function(err, reply) {
		callback(err, reply);
	});
}

module.exports.getAllLocationNames = getAllLocationNames;

module.exports.getAllHashtagNames = getAllHashtagNames;

module.exports.getAllLocations = function(callback) {
	client.keys('locations:[1-9]*', function(err, reply) {
		var res = Array();
		for(var i = 0; i < reply.length; i++) {
			client.hgetall(reply[i], (function(length, res, callback) {
				return function(err, reply) {
					res.push(reply);
					if(res.length == length) {
						callback(err, res);
					}
				}
			})(reply.length, res, callback));
		}
	});
}

module.exports.update = function(location, callback) {
	console.log("Huh?");
	module.exports.add(location, callback);
	console.log("jo");
};

function makeResultCallback(prefix, status, searchterm, callback) {
	return function(err, reply) {
		if(!err) {
			var searchtermRE = RegExp(searchterm, 'gi');
			for (var i = reply.length - 1; i >= 0; i--) {
				if(reply[i].search(searchtermRE) >= 0) {
					status.resultLength++;
					//status.result.push(prefix + ":" + reply[i]);

					client.smembers(prefix + ":" + reply[i], makeIdResultCallback(status, callback));
				}
			}
			status.lastRequestForIdWasSent = true;
		}
	};
}

function makeIdResultCallback(status, callback) {
	return function(err, reply) {
		status.resultLength--;
		for (var i = reply.length - 1; i >= 0; i--) {
			status.ids.push(reply[i]);
		}

		if(status.lastRequestForIdWasSent && status.resultLength === 0) {
			status.ids.sort();
			var lastValue = -1;
			for (var i = status.ids.length - 1; i >= 0; i--) {
				if(status.ids[i] != lastValue) {
					status.idsLength++;
					lastValue = status.ids[i];
					client.hgetall("locations:" + status.ids[i], makeLocationResultCallback(status, callback));
				}
			}
			status.lastRequestForLocationWasSent = true;
		}
	}
}

function makeLocationResultCallback(status, callback) {
	return function(err, reply) {
		status.idsLength--;
		status.locations.push(reply);
		if(status.lastRequestForLocationWasSent && status.idsLength === 0) {
			callback(!err, status.locations);
		}
	}
}

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
	location.hashtag = location.hashtag.replace(/\s+/g, '');
	location.hashtag = location.hashtag.split(',');
	//console.log(location.hashtag.length);
	for (var i = location.hashtag.length - 1; i >= 0; i--) {
		//console.log(location.hashtag[i]);
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

function simpleClone(object) {
	return JSON.parse(JSON.stringify(object));
}
