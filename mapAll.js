var spData = null;
var kidPicBaseUrl = 'images/kids/';
var titles = {};
var kids = {};


function doData(json) {
	spData = json.feed.entry;
}

function getTitleFromCol(titles, col) {
	return titles[col];
}

function toHumanDate(date) {
	var options = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	};
	var locale = 'he-IL';
	if(date instanceof Date && !isNaN(date.valueOf())){
		return date.toLocaleDateString(locale, options);		
	}else{
		return null;
	}
}

function createVcard(kid, includePic) {
	// create a downloadable vcard
	
	function getPicBase64(kidPicAddress, cb){
		loadXHR(kidPicAddress).then(function(blob) {
		var reader = new window.FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = function() {
//			console.log(reader.result);
			cb ('PHOTO;ENCODING=b;TYPE=JPEG:' + reader.result);
			}
		})
		
	}
	
	vcard = {
		version: "3.0",
		n: kid["Last_Name"] + ";" + kid["First_Name"] + ";",
		fn: kid["Full Name"],
		org: "אהבת ציון; תשע\"ט; א' 3",
		adr: [],
		tel: [],
		email: []
	}

	if(toHumanDate(kid["DOB"])){
		vcard.bday = kid["DOB"];
	}
	// a kid may have more than one address. Put them all in the vcard
	var addresses = kid["Address"].split("\n");
	for (var address in addresses) {
		vcard.adr.push({
			value: ";;" + addresses[address] + ";תל אביב;;ישראל",
			type: "home"
		});
	}

	// add each phone and email that exists
	if ("Parent 1 phone" in kid) {
		var typeVal = "CELL";
		if(kid["Parent1 Full Name"].trim() != ""){
			typeVal = "X-" + kid["Parent1 Full Name"]
		}
		vcard.tel.push({
			value: kid["Parent 1 phone"],
			type: typeVal
		});
	}
	if ("Parent 2 phone" in kid) {
		var typeVal = "CELL";
		if(kid["Parent2 Full Name"].trim() != ""){
			typeVal = "X-" + kid["Parent2 Full Name"]
		}
		vcard.tel.push({
			value: kid["Parent 2 phone"],
			type: typeVal
		});
	}
	if ("Parent 1 Email" in kid) {
		var typeval = "HOME";
		if(kid["Parent1 Full Name"].trim() != ""){
			typeval = "X-" + kid["Parent1 Full Name"];
		}
		vcard.email.push({
			value: kid["Parent 1 Email"],
			type: typeval
		});
	}
	if ("Parent 2 Email" in kid) {
		var typeval = "HOME";
		if(kid["Parent2 Full Name"].trim ()!= ""){
			typeval = "X-" + kid["Parent2 Full Name"];
		}
		vcard.email.push({
			value: kid["Parent 2 Email"],
			type: typeval
		});
	}

	// generate base64 for image, if needed
	if (includePic) {
		var kidPicAddress = kidPicBaseUrl + kid["Full Name"] + '.jpg';
		getPicBase64(kidPicAddress, function(photo){
			vcard.photo = 'photo';
//			console.log(photo);
		})
	}
	
	console.log(vcard);	
	return vCard.export(vcard, kid["Full Name"], false) // use parameter true to force download
}
// top details box
function showDetails(kid) {
	console.log(kid);
	history.pushState(null, null, '#details');

	details = $("<div class = 'kid' />");
//	var imgURL = ("ImageID" in kid) ? "https://drive.google.com/uc?export=view&id=" + kid["ImageID"] : "";
	var imgURL = kidPicBaseUrl + kid["Full Name"]+ '.jpg'
	var img = $("<img onerror='$(this).attr(\"src\",\"images/transparent.png\");' src='" + imgURL + "' class='kidpic'/>");
	details.append(img);

	var info = $("<span class='info'/>");
	var name = $("<div class = 'fullName'/>");
	var address = $("<div class='address' title='כתובת'/>");
	var dob = $("<div class='dob' title='תאריך לידה'/>");
	details.append(info);
	info.append(name);

	var dateString = toHumanDate(new Date(kid["DOB"]));
	if(dateString){
		dob.append(dateString);
		info.append(dob);
	}
	
	if(kid["Address"] != ""){
		address.append(kid["Address"].replace("\n", "<br />"));
		info.append(address);
	}
	
	name.append(kid["Full Name"]);
	
	var contact = $("<div class='contact'/>");
	var parent1 = $("<div class='parent  parent1'/>");
	var parent2 = $("<div class='parent  parent2'/>");

	details.append(contact);

	if(kid["Parent1 Full Name"].trim() !=""){
		parent1.append(kid["Parent1 Full Name"]);
	}
	if(kid["Parent 1 phone"] != ""){
		parent1.append(getContactInfo(kid["Parent 1 phone"], "phone"));
	}
	if(kid["Parent 1 Email"] != ""){
		parent1.append(getContactInfo(kid["Parent 1 Email"], "email"));
	}
	var thereAreTwoParents = false;
	if(kid["Parent2 Full Name"].trim() !=""){
		parent2.append(kid["Parent2 Full Name"]);
		thereAreTwoParents = true;
	}
	if(kid["Parent 2 phone"] && kid["Parent 2 phone"].length > 0){
		parent2.append(getContactInfo(kid["Parent 2 phone"], "phone"));
		thereAreTwoParents = true;
	}
	if(kid["Parent 2 Email"] && kid["Parent 2 Email"].length > 0){
		parent2.append(getContactInfo(kid["Parent 2 Email"], "email"));
		thereAreTwoParents = true;
	}
	contact.append(parent1);
	if (thereAreTwoParents) {
		contact.append(parent2);
	}

	$("#details").empty().append(details);

	if (kid["Address"] != "") {
		var googleMap = $("<div id = 'GoogleMap' class = 'GoogleMap'>");
		$("#details").append(googleMap);
		drawMap(kid["Address For Map"]);
	}
	$(".dynamic").addClass("showDetails");
	$("#details").scrollTop(0);

	var vcardLink = createVcard(kid, true)
	info.append(vcardLink)
	
	//higlight relevant details
	var filterStr = $("#filter")[0].value.toUpperCase();
	if ( filterStr ) {
		$('#detailsContainer').highlight( filterStr );
	}

}

function hideDetails() {
	$(".dynamic").removeClass("showDetails");
}

function loadMap(){
	var allAddresses = {
		addresses:[]
	};
	for (var i in kids){
		var kid = kids[i];
		var kidAddresses = JSON.parse(kid["Address For Map"]).addresses;
		var markerURL = kidPicBaseUrl + "/markers/" + kid["photoName"]+ '.png'
		console.log(kidAddresses);
		for (var j in kidAddresses){
			console.log(kidAddresses[j]);
			if(kidAddresses[j].lat !=""){
				console.log(kidAddresses[j].lat);
				var address = kidAddresses[j];
				address.title = kid["Full Name"];
				address.details = kid["Full Name"];
				address.marker = markerURL;
				allAddresses.addresses.push(address);
			}
		}
	}
	console.log(allAddresses);
	
	drawMap(allAddresses);
}



function readData(parent) {
	var data = spData;
	// create array of column titles and corresponding column numbers
	for (var r = 0; r < data.length; r++) {
		var cell = data[r]["gs$cell"];
		var val = cell["$t"];
		var col = cell["col"];
		var row = cell["row"];
		if (row == 1) {
			titles[col] = val;
		} else { // let's get some kids!
			if (col == 1) {
				kids["kid" + (row - 1)] = {};
			}
			kids["kid" + (row - 1)][getTitleFromCol(titles, col)] = val;
		}
	}

	//   console.log(titles);
	   console.log(kids);
}

function filterKids(){
	var filterStr = $("#filter")[0].value.toUpperCase();
	var kids = document.getElementsByClassName('kidContainer');
	[].forEach.call(kids, (function (kid){
		// start by hiding all
		if(filterStr != ''){
			kid.classList.add('hidden');
		}
		
		// if search is empty, show all
		if(filterStr == ''){
			kid.classList.remove('hidden');
		}
		
		if (kid.innerText.toUpperCase().indexOf(filterStr) > -1){
				kid.classList.remove('hidden');
			}
	}));
	
	// remove any old highlighted terms
	$('#body, #detailsContainer').removeHighlight();
	// disable highlighting if empty
	if ( filterStr ) {
		// highlight the new term
		$('#body, #detailsContainer').highlight( filterStr );
	}
}

$(document).ready(function() {
	readData($("#data"));
});

$.preloadImages = function() {
	for (var i = 0; i < arguments.length; i++) {
		$("<img />").attr("src", arguments[i]);
	}
}

$.preloadImages("images/print-user.png", "images/email-Icon.png", "images/phone-icon.png");

/*
todo:
O 	use map API instead of embed
O 	format field address for map, use that
O	remove link to map from displayed address
O	improve print layout
O	small layout tweaks
O	get all kids from vaad
O	link to contact download
add image to vcard. possibly store base64 in spreadsheet
enable bookmark on mobile
O	search
links on bottom. Do we need them?
all on one map
*/