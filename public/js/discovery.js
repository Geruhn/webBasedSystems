var currentLocation = {
	latitude: 20,
	longitude: 5
};
var inputVicinityRange;
var allLocations;
var locationsInTable;
var lastLocationÍndex;
var tbody;
document.addEventListener('DOMContentLoaded', function() {
	inputVicinityRange = document.getElementById('vicinityRange');

	var xhr = new XMLHttpRequest();
	xhr.open('GET', './api/locations/');
	xhr.send(null);
	xhr.onreadystatechange = function () {
		var DONE = 4;
		var OK = 200;
		if (xhr.readyState === DONE) {
			if (xhr.status === OK) {
				allLocations = JSON.parse(xhr.responseText);
				calculateDistances();
				sortTable();
			} else {
		  		console.log('Error: ' + xhr.status);
	  		}
		}
	}
	var inputLabel = document.getElementById('vicinityRangeLabel');
	var updateLabel = makeUpdateLabel(inputVicinityRange, inputLabel);
	inputVicinityRange.addEventListener('input', updateLabel);
	inputVicinityRange.addEventListener('input', updateLocationsTable);
});

function sortTable() {
	tbody = document.getElementById('locations').getElementsByTagName('tbody')[0];
	for(var i = 0; i < allLocations.length; i++) {
		var el = document.getElementById('location-'+allLocations[i].id);
		tbody.appendChild(el);
	}
	var attributes = inputVicinityRange.attributes;
	var max = Math.round(allLocations[allLocations.length-1].distance + 0.5);
	var min = Math.round(allLocations[0].distance + 0.5);
	var step = Math.round((max - min) / 1000);
	max += step-(max-min)%step;

	attributes['max'].value = max;
	attributes['value'].value = min
	attributes['min'].value = min
	attributes['step'].value = step;
	updateLocationsTable({target: {value: inputVicinityRange.value}});
}

function makeUpdateLabel(input, label) {
	var suffix = ' km';
	label.innerHTML = input.value + suffix;
	return function(event) {
		label.innerHTML = event.target.value + suffix;
	};
}

function updateLocationsTable(event) {
	var distance = event.target.value;
	for (var i = allLocations.length - 1; i >= 0; i--) {
		if(allLocations[i].distance > distance) {
			document.getElementById('location-' + allLocations[i].id).classList.add('hide');
		} else {
			document.getElementById('location-' + allLocations[i].id).classList.remove('hide');
		}
	}
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
	for(var i = 0; i < allLocations.length; i++) {
		console.log(allLocations[i].id);
	}
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
