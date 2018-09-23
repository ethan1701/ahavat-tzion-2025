  var spData = null;

  function doData(json) {
      spData = json.feed.entry;
  }

  function getTitleFromCol(titles, col){
      return titles[col];
  }
  
  function showDetails(kid){
      console.log(kid);
      history.pushState(null, null, '#details');
      var details = kid.cloneNode(true);
      $("#details").empty().append(details);
      $(".dynamic").addClass("showDetails");
      $("#details").scrollTop(0);
  }

  function hideDetails(){
      $(".dynamic").removeClass("showDetails");
}

  function mapAddress(address){
      if (null == address) return null;
      else return "<a href='https://google.co.il/maps/search/" + address + ", תל אביב' target='_blank'>" + address + "</a>"
  }

  function getContactInfo(info, type){
    if (null == info) return null;
    if (type=="phone"){
        return ("<div class= '"+ type +"'><a href='tel:"+info+"' target='_blank'>" + info + "</a><a href='https://api.whatsapp.com/send?phone=972"+info+"' alt='שלח הודעת WhatsApp' target='_blank' class='whatsapp'></a></div>");
    }else if(type=="email"){
        return ("<a href='mailto:"+info+"' class='"+ type +"' target='_blank'>" + info + "</a>");
    }else return null;
  }

  function drawDetails(form, kid){
 //     console.log(kid);
      var container = $("<div class = 'kidContainer' />");
      var div = $("<div class = 'kid' title='" + kid["Full Name"] + "'/>").click(function(){showDetails(this)});
   // http://www.husky-owners.com/forum/uploads/monthly_2015_06/558fcc225abae_photo.thumb_jpgsz256.65bbc89b7dc3a7d0047f701989439647
      var imgURL = ("ImageID" in kid)  ? "https://drive.google.com/uc?export=view&id=" + kid["ImageID"] : "";
      var img = $("<img src='"+ imgURL +"' class='kidpic' />");
      var name = $("<div class = 'fullName'/>");
      var info = $("<div class='info'/>");
      var address = $("<div class='address'/>");
      var dob = $("<div class='dob'/>");
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
      div.append(contact);
      name.append(kid["Full Name"]);
      address.append(mapAddress(kid["Address"]));
      dob.append(kid["DOB"]);
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
            if (col == 1){
            	kids["kid" + (row-1)] = {};    
            }
            kids["kid" + (row-1)][getTitleFromCol(titles, col)] = val;
        }
      }
   
      console.log(titles);
      console.log(kids);
      console.log(kids.kid22);
      console.log(parent);
      
      for (i in kids){
       drawDetails(parent, kids[i]);
      }
  }
$(document).ready(function () {
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

$.preloadImages("images/print-user.png","images/email-Icon.png","images/phone-icon.png");
