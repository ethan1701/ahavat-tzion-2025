// jquery(function($) {
    // // asynchronously load the map api 
	// var apikey = "aizasydvls9ns9jb8rycf8hawzs5jylfdip2vdk";
    // var script = document.createelement('script');
    // script.src = "http://maps.googleapis.com/maps/api/js?callback=drawMap&key=" + apikey;
    // document.body.appendchild(script);
	// console.log('foo');

// });

function drawMap(markers='{"addresses":[{"title":"nowhere","latlng":{"lat": 0, "lng": 0}}]}') {
	markers = JSON.parse(markers);
//	console.log(markers);

  const position = markers.addresses[0].latlng;

  const map = new google.maps.Map(document.getElementById("GoogleMap"),  {
    zoom: 15,
    center: position,
    mapId: "DEMO_MAP_ID", // Map ID is required for advanced markers.
  });

    const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: position,
        title: markers.addresses[0].title,
    });
} 
