var lat;
var lon;
var errors = Array();
var errorMessages = {
	nameIsEmpty: "The name field was empty.",
	hashtagIsEmpty: "The hashtag field was empty.",
	latitudeIsNaN: "The latitude was not a number.", 
	longitudeIsNaN: "The longitude was not a number."
}
document.addEventListener('DOMContentLoaded', function() {
	lat = document.getElementById('latitude');
	lon = document.getElementById('longitude');
	if(navigator.geolocation) {
		document.getElementById('refresh').addEventListener('click', refresh);
		refresh();
	}
	var inputs = document.getElementsByTagName('input');
	for(var i = 0; i < inputs.length; i++) {
		var type = inputs[i].getAttribute("type");
		if(type === "text") {
			inputs[i].validate = makeValidate(validateText);
		} else if(type === "number") {
			inputs[i].validate = makeValidate(validateNumber);
		}
		inputs[i].addEventListener("blur", function(event) {
			event.target.validate();
		});
	}
	document.getElementById('submit').addEventListener('click', validateForm);
	document.getElementById('name').focus();
});

function makeValidate(validationFunction) {
	return function() {
		document.getElementById('taggingForm').classList.remove('invalid');
		var valid = validationFunction(this);
		if(!valid) {
			document.getElementById('taggingForm').classList.add('invalid');
		}

		return valid;
	};
}

function validateForm(event) {
	var correct = true;
	var inputs = document.getElementById('taggingForm').getElementsByTagName('input');
	for(var i = 0; i < inputs.length; i++) {
		correct &= inputs[i].validate();
	}

	if(!correct) {
		event.preventDefault();
	}
}

function validateNumber(target) {
	return target.checkValidity();
}

function validateText(target) {
	return target.checkValidity();
}

function refresh () {
	navigator.geolocation.getCurrentPosition(function(position){
		lat.value = position.coords.latitude;
		lon.value = position.coords.longitude;
		lat.validate(); 
		lon.validate();
	});
}