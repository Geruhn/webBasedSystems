var currentLocation = {
	latitude: 20,
	longitude: 5
};
var inputVicinityRange;
var allLocations;
var locationsInTable;
var lastLocationÍndex;
document.addEventListener('DOMContentLoaded', function() {
	inputVicinityRange = document.getElementById('vicinityRange');

	var xhr = new XMLHttpRequest();
	xhr.open('GET', './api/locations/');
	xhr.send(null);
	xhr.onreadystatechange = function () {
		var DONE = 4; // readyState 4 means the request is done.
		var OK = 200; // status 200 is a successful return.
		if (xhr.readyState === DONE) {
			if (xhr.status === OK) {
				allLocations = JSON.parse(xhr.responseText); 	// 'This is the returned text.'
				calculateDistances();
			} else {
		  		console.log('Error: ' + xhr.status); 		// An error occurred during the request.
	  		}
		}
	}
	var inputLabel = document.getElementById('vicinityRangeLabel');
	var updateLabel = makeUpdateLabel(inputVicinityRange, inputLabel);
	inputVicinityRange.addEventListener('input', updateLabel);
//	inputVicinityRange.addEventListener('input', updateLocationsTable);
	//document.getElementById('vicinityRange').addEventListener('input', updateLocationsTable);

});

function makeUpdateLabel(input, label) {
	var suffix = ' km';
	label.innerHTML = input.value + suffix;
	return function(event) {
		label.innerHTML = event.target.value + suffix;
	};
}

function updateLocationsTable(event) {
	var distance = event.target.value;
	allLocations.sort(sortLocations);
}

function sortLocations(locA, locB) {
	if(locA.distance < locB.distance) {
		return -1;
	}
	if (locA.distance > locB.distance) {
		return 1;
	}

	return 0;
}

function toDegrees(rad) {
	return rad*(180/Math.PI);
}

function toRadians(deg) {
	return deg * (Math.PI/180);
}

function calculateDistances() {
	for(var i = 0; i < allLocations.length; i++) {
		allLocations[i].distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, allLocations[i].latitude, allLocations[i].longitude);
	}
	allLocations.sort(sortLocations);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
	var R = 6371000; // metres
	var φ1 = toRadians(lat1);
	var φ2 = toRadians(lat2);
	var Δφ = toRadians(lat2-lat1);
	var Δλ = toRadians(lon2-lon1);


	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	        Math.cos(φ1) * Math.cos(φ2) *
	        Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;

	return d/1000.0;
}
