var spData = null;
var kidPicBaseUrl = 'images/kids/';

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
	return date.toLocaleDateString(locale, options);
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
		bday: kid["DOB"],
		adr: [],
		tel: [],
		email: []
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
		vcard.tel.push({
			value: kid["Parent 1 phone"],
			type: "X-" + kid["Parent1 Full Name"]
		});
	}
	if ("Parent 2 phone" in kid) {
		vcard.tel.push({
			value: kid["Parent 2 phone"],
			type: "X-" + kid["Parent2 Full Name"]
		});
	}
	if ("Parent 1 Email" in kid) {
		vcard.email.push({
			value: kid["Parent 1 Email"],
			type: "X-" + kid["Parent1 Full Name"]
		});
	}
	if ("Parent 2 Email" in kid) {
		vcard.email.push({
			value: kid["Parent 2 Email"],
			type: "X-" + kid["Parent2 Full Name"]
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

function showDetails(kid) {
	console.log(kid);
	history.pushState(null, null, '#details');

	details = $("<div class = 'kid' />");
	var imgURL = ("ImageID" in kid) ? "https://drive.google.com/uc?export=view&id=" + kid["ImageID"] : "";
	//      var imgURL = kid["Image Base64"] ;
	var img = $("<img src='" + imgURL + "' class='kidpic'/>");
	details.append(img);

	var info = $("<span class='info'/>");
	var name = $("<div class = 'fullName'/>");
	var address = $("<div class='address' title='כתובת'/>");
	var dob = $("<div class='dob' title='תאריך לידה'/>");
	details.append(info);
	info.append(name);
	info.append(dob);
	info.append(address);
	name.append(kid["Full Name"]);
	address.append(kid["Address"].replace("\n", "<br />"));
	dob.append(toHumanDate(new Date(kid["DOB"])));

	var contact = $("<div class='contact'/>");
	var parent1 = $("<div class='parent  parent1'/>");
	var parent2 = $("<div class='parent  parent2'/>");

	details.append(contact);

	parent1.append(kid["Parent1 Full Name"]);
	parent1.append(getContactInfo(kid["Parent 1 phone"], "phone"));
	parent1.append(getContactInfo(kid["Parent 1 Email"], "email"));
	parent2.append(kid["Parent2 Full Name"]);
	parent2.append(getContactInfo(kid["Parent 2 phone"], "phone"));
	parent2.append(getContactInfo(kid["Parent 2 Email"], "email"));
	contact.append(parent1);
	if ("Parent2 Full Name" in kid || "Parent 2 phone" in kid || "Parent 2 Email" in kid) {
		contact.append(parent2);
	}

	$("#details").empty().append(details);

	if (null != kid["Address For Map"]) {
		var googleMap = $("<div id = 'GoogleMap' class = 'GoogleMap'>");
		$("#details").append(googleMap);
	}
	$(".dynamic").addClass("showDetails");
	$("#details").scrollTop(0);
	drawMap(kid["Address For Map"]);

	var vcardLink = createVcard(kid, true)
	info.append(vcardLink)
}

function hideDetails() {
	$(".dynamic").removeClass("showDetails");
}
// deprecated
function mapAddress(address) {
	if (null == address) return null;
	else return "<a href='https://m.google.co.il/maps/search/" + address + ", תל אביב' target='_blank' title='פתח מפה'>" + address + "</a>"
}

function getContactInfo(info, type) {
	if (null == info) return null;
	if (type == "phone") {
		return ("<div class= '" + type + "'><a href='tel:" + info + "' title='חייג' target='_blank'>" + info + "</a><a href='https://api.whatsapp.com/send?phone=972" + info + "' title='שלח הודעת WhatsApp' target='_blank' class='whatsapp'></a></div>");
	} else if (type == "email") {
		return ("<a href='mailto:" + info + "' class='" + type + "' target='_blank' title='שלח מייל'>" + info + "</a>");
	} else return null;
}

function drawDetails(form, kid) {
	//   console.log(kid);
	var container = $("<div class = 'kidContainer' />");
	var div = $("<div class = 'kid' title='" + kid["Full Name"] + "'/>").click(function() {
		showDetails(kid)
	});
	// http://www.husky-owners.com/forum/uploads/monthly_2015_06/558fcc225abae_photo.thumb_jpgsz256.65bbc89b7dc3a7d0047f701989439647
	var imgURL = ("ImageID" in kid) ? "https://drive.google.com/uc?export=view&id=" + kid["ImageID"] : "";
	var img = $("<img src='" + imgURL + "' class='kidpic' />");
	var name = $("<div class = 'fullName'/>");
	var info = $("<div class='info'/>");
	var address = $("<div class='address' title='כתובת'/>");
//	var addressDetails = $("<div class='addressDetails'/>");
	var dob = $("<div class='dob' title='תאריך לידה'/>");
	var contact = $("<div class='contact'/>");
	var parent1 = $("<div class='parent  parent1'/>");
	var parent2 = $("<div class='parent  parent2'/>");
	form.append(container);
	container.append(div);
	div.append(img);
	div.append(name);
	div.append(info);
	info.append(dob);
	info.append(address);
//	info.append(addressDetails);
	div.append(contact);
	name.append(kid["Full Name"]);
	address.append(kid["Address"].replace("\n", "<br />"));
//	addressDetails.append(kid["Address For Map"]);
	dob.append(toHumanDate(new Date(kid["DOB"])));
	parent1.append(kid["Parent1 Full Name"]);
	parent1.append(getContactInfo(kid["Parent 1 phone"], "phone"));
	parent1.append(getContactInfo(kid["Parent 1 Email"], "email"));
	parent2.append(kid["Parent2 Full Name"]);
	parent2.append(getContactInfo(kid["Parent 2 phone"], "phone"));
	parent2.append(getContactInfo(kid["Parent 2 Email"], "email"));
	contact.append(parent1);
	if ("Parent2 Full Name" in kid || "Parent 2 phone" in kid || "Parent 2 Email" in kid) {
		contact.append(parent2);
	}
}

function readData(parent) {
	var data = spData;
	// create array of column titles and corresponding column numbers
	var titles = {};
	var kids = {};
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

	for (i in kids) {
		drawDetails(parent, kids[i]);
	}
}

function filterKids(){
	var filterStr = $("#filter")[0].value.toUpperCase();
	var kids = document.getElementsByClassName('kidContainer');	
	for (var kid in kids){

		var aKid = kids[kid];
		// start by hiding all
		aKid.classList.add('hidden');
		
		// remove any previously filtered values
		if (filterStr==''){
			aKid.classList.remove('hidden');
		}
		// get all descendant elements of the kid
		var elementList = aKid.querySelectorAll('*').forEach(function(node) {
			if (node.firstChild &&  node.firstChild.nodeType === Node.TEXT_NODE && node.innerHTML.toUpperCase().indexOf(filterStr) > -1){
					console.log(node);
					aKid.classList.remove('hidden');
					node.classList.add('highlight');
			}
		});
	}
}

$(document).ready(function() {
	readData($("#data"));
	if (window.history && window.history.pushState) {
		window.history.pushState('forward', null, './#forward');
		$(window).on('popstate', function() {
			hideDetails();
		});

	}
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
small layout tweaks
get all kids from vaad
O	link to contact download
add image to vcard. possibly store base64 in spreadsheet
enable bookmark on mobile
search
*/