// Global map variable
var map;
var location_overlay;
var zoom = 14;

/* Initializes Google Maps */
function initializeMap() {
  // Get the location as a Google Maps latitude-longitude object
  var loc = new google.maps.LatLng(center[0], center[1]);

  // Create the Google Map
  map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: loc,
    zoom: zoom,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: true,
  });
  location_overlay = new LocationOverlay(map);

  var updateCriteria = _.debounce(function() {
    var bounds = map.getBounds();
    updateCenter(bounds.getCenter());
    var criteria = {
      center: [bounds.getCenter().lat(), bounds.getCenter().lng()],
      radius: Math.min(getDistance(bounds.getNorthEast(), bounds.getSouthWest()) / 2 / 1000, 150)
    };
    for(geoQuery in geoQueries) {
      geoQueries[geoQuery].updateCriteria(criteria);
    }
  }, 10);

  google.maps.event.addListener(map, "bounds_changed", updateCriteria);
  google.maps.event.addDomListener(document.getElementById('mylocation'), 'click', function() {
    icon = this.childNodes[1];
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        icon.className = icon.className + ' widget-mylocation-button-blue'
        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.panTo(pos);
        location_overlay.updateLocation(pos, position.coords.accuracy);
        location_overlay.show(pos);
      });
    }
  });
}

/**********************/
/*  HELPER FUNCTIONS  */
/**********************/
function createVehicleMarker(vehicle, lat, lon, vehicleColor) {
  var rt = (typeof vehicle.r === 'undefined') ? vehicle.routeTag : vehicle.r;
  vehicle_overlay = new VehicleOverlay(map, rt, vehicleColor);
  vehicle_overlay.updateLocation(new google.maps.LatLng(lat, lon), vehicle.d);
  return vehicle_overlay;
}

/* Returns true if the two inputted coordinates are approximately equivalent */
function coordinatesAreEquivalent(coord1, coord2) {
  return (Math.abs(coord1 - coord2) < 0.000001);
}

var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};
