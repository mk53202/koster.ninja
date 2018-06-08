
// Query radius
var radiusInKm = 1.5;
var vehiclesInQuery = {};
var geoQueries = [];

function addFirebaseRef(url) {
  var transitFirebaseRef = new Firebase(url);

  var geoFire = new GeoFire(transitFirebaseRef.child("_geofire"));

  var geoQuery = geoFire.query({
    center: center,
    radius: radiusInKm
  });
  geoQueries.push(geoQuery);

  geoQuery.on("key_entered", function(vehicleId, vehicleLocation) {
    dataset = vehicleId.split(":")[0];
    vehicleIdWithoutDataset = vehicleId.split(":")[1];
    vehiclesInQuery[vehicleId] = true;

    transitFirebaseRef.child(dataset).child("buses").child(vehicleIdWithoutDataset).once("value", function(dataSnapshot) {
      vehicle = dataSnapshot.val();
      if (vehicle !== null && vehiclesInQuery[vehicleId] === true) {
        vehiclesInQuery[vehicleId] = vehicle;
        vehicle.marker = createVehicleMarker(vehicle, vehicleLocation[0], vehicleLocation[1], getVehicleColor(vehicle));
      }
    });
  });

  geoQuery.on("key_moved", function(vehicleId, vehicleLocation) {
    var vehicle = vehiclesInQuery[vehicleId];
    vehicleIdWithoutDataset = vehicleId.split(":")[1];

    if (typeof vehicle !== "undefined" && typeof vehicle.marker !== "undefined") {
      try {
        transitFirebaseRef.child(dataset).child("buses").child(vehicleIdWithoutDataset).once("value", function(dataSnapshot) {
          if(dataSnapshot.val() !== null) {
            var direction = dataSnapshot.val().d
            var pos = new google.maps.LatLng(vehicleLocation[0], vehicleLocation[1]);
            vehicle.marker.animatedMoveTo(vehicleLocation, direction)
          }
        });
      } catch (e) {
        console.log(e)
        Bugsnag.notifyException(e);
      }
    }
  });

  geoQuery.on("key_exited", function(vehicleId, vehicleLocation) {
    var vehicle = vehiclesInQuery[vehicleId];
    if (vehicle !== true) {
      vehicle.marker.setMap(null);
    }
    delete vehiclesInQuery[vehicleId];
  });
}

function setupFeed(fb_account) {
  console.log("Setting up feed...")
  addFirebaseRef("https://" + fb_account + ".firebaseio.com/");
}


function getVehicleColor(vehicle) {
  var rt = (typeof vehicle.r === 'undefined') ? vehicle.routeTag : vehicle.r;
  return getColor(rt);
}


function handleVisibilityChange() {
  if (document.hidden) {
    console.log('going offline')
    Firebase.goOffline();
  } else  {
    console.log('going online')
    for (var key in vehiclesInQuery) {
      try {
        vehiclesInQuery[key].marker.draw();
      } catch (e) {
        console.log('oops');
        console.log(e);
      }
    }
    Firebase.goOnline();
  }
}

document.addEventListener("visibilitychange", handleVisibilityChange, false);
