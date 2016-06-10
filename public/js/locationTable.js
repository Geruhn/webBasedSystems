document.addEventListener('DOMContentLoaded', function() {
	//ToDo
	// implement update and delete button
	var deleteButtons = document.getElementsByClassName('delete-button');
	var updateButtons = document.getElementsByClassName('update-button');
	for (var i = updateButtons.length - 1; i >= 0; i--) {
		updateButtons[i].addEventListener('click', function(event) {
			console.log("Updating");
			console.log(event.target.id.split("update-location-")[1]);
			//ToDo
		});
	}
	for (var i = deleteButtons.length - 1; i >= 0; i--) {
		deleteButtons[i].addEventListener('click', function(event) {
			console.log("Deleting");
			console.log(event.target.id.split("delete-location-")[1]);
			//ToDo
		});
	}
});
