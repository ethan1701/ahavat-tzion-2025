jQuery(function($) {
    // Asynchronously Load the map API 
	var apiKey = "AIzaSyDVLs9Ns9jb8RyCf8haWZS5JYLfdiP2vDk";
    var script = document.createElement('script');
    script.src = "http://maps.googleapis.com/maps/api/js?key=" + apiKey;
    document.body.appendChild(script);

});

function drawMap(markers) {
	markers = JSON.parse(markers);
//	console.log(markers);
    var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap'
    };
                    
    // Display a map on the page
    map = new google.maps.Map(document.getElementById("GoogleMap"), mapOptions);
    map.setTilt(45);
                         
    // Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(), marker, i;
    
    // Loop through our array of markers & place each one on the map  
    for( i = 0; i < markers.addresses.length; i++ ) {
		var position = new google.maps.LatLng(markers.addresses[i].lat, markers.addresses[i].long);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markers.addresses[i].title
        });
        
        // Automatically center the map fitting all markers on the screen
        map.fitBounds(bounds);
    }

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        this.setZoom(15);
        google.maps.event.removeListener(boundsListener);
    });
    
} 