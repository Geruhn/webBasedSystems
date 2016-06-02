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

module.exports.add = function(location, callback) {
//	if(redisIsConnected) {
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
				location.id = id;
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
													for (var i = hashtags.length - 1; i >= 0; i--) {
														//console.log('adding hashtag: ' + hashtags[i]);
														client.sadd('hashtag:' + hashtags[i], id, ( function(tag) {
																return function(err, reply) {
																	if(!err) {
																		client.sadd('hashtags', tag, function(err, reply) {
																			if(callback && i == 0) {
																				//console.log('adding hashtags done');
																				callback(!err, options);
																			}
																		});
																	}
																}
														})(hashtags[i]));
													}
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

};

module.exports.search = function(searchterm, callback) {
	console.log("Started searching: " + searchterm);
	var search = Array();
	search["location"] = Array();
	search["hashtag"] = Array();
	var searchL = Array();
	var searchH = Array();

	var status = {
		locationReceived: false,
		hashtagsReceived: false,
		result: "",
		resultLength: 0,
		lastRequestForIdWasSent: false,
		lastRequestForLocationWasSent: false,
		ids: "",
		idsLength: 0,
		locations: "",
		locationsLength: 0,
		errors: {
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
/*
	console.log("Searching:" + searchterm);
	getAllLocationNames(function(err, reply) {
		if(!err) {
			for (var i = reply.length - 1; i >= 0; i--) {
				searchL.push(reply[i]);
			}
			getAllHashtagNames(function(err, reply) {
				if(!err) {
					for (var i = reply.length - 1; i >= 0; i--) {
						searchH.push(reply[i]);
					}

					var searchterm = RegExp(searchterm, 'gi');
					for (var i = searchH.length - 1; i >= 0; i--) {
						if(searchH[i].search(searchterm) >= 0) {
							result.push('hashtag:' + searchH[i]);
							console.log('Pushing');
						}
					}
					for (var i = searchL.length - 1; i >= 0; i--) {
						if(searchL[i].search(searchterm) >= 0) {
							result.push('location:' + searchL[i]);
							console.log('Pushing');
						}
					}
					console.log(result);
					var ids = Array();
					var idsLength = 0;
					for (var i = result.length - 1; i >= 0; i--) {
						client.smembers(result[i], (function(length, ids, callback, finalCallback) {
							return function(err, reply) {
								idsLength += reply.length;
								for (var i = reply.length - 1; i >= 0; i--) {
									ids.push(reply[i]);
								}
								callback(length, ids, idsLength, finalCallback);
							}
						})(result.length, ids, idsLength, function(length, ids, idsLength, finalCallback) {
							for (var i = ids.length - 1; i >= 0; i--) {
								var finalResults = Array();
								client.hgetall(ids[i], function(err, reply) {
									finalResults.push(reply);
								});
								if(length === 0 && idsLength === 0) {
									finalCallback();
								}
							}
						}, callback));
					}
					res.status(200).send('Success');
				} else {
					res.status(500).send('Sorry, something went wrong');
				}
			});
		} else {
			res.status(500).send('Sorry, something went wrong');
		}
	});*/
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
						callback(res);
					}
				}
			})(reply.length, res, callback));
		}
	});
}

module.exports.update = function(location, callback) {
	client.hmset('locations:'+location.id, location, function(err, reply) {
		if(callback) {
			callback(!err);
		}
	});
};

function makeResultCallback(prefix, status, searchterm, callback) {
	return function(err, reply) {
		if(!err) {
			var searchtermRE = RegExp(searchterm, 'gi');
			for (var i = reply.length - 1; i >= 0; i--) {
				if(reply[i].search(searchtermRE) >= 0) {
					status.resultLength++;
					status.result.push(prefix + ":" + reply[i]);
					//console.log(status);

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
