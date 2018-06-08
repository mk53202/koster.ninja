var center = null;

if(typeof(Storage) !== "undefined") {
  var saved_loc = null;
  try {
    saved_loc = localStorage['center']
  } catch(err) {
    console.log("Could not read position from local storage.")
  }
  if(typeof saved_loc !== "undefined" && saved_loc !== null) {
    center = saved_loc.slice(1, saved_loc.length - 1).split(',')
    center[0] = parseFloat(center[0]);
    center[1] = parseFloat(center[1]);
  }
}

function updateCenter(new_center) {
  if(typeof(Storage) !== "undefined") {
    try {
     localStorage.setItem("center", new_center);
    } catch(err) {
      console.log("Could not save position in local storage")
    }
  }
  center = new_center;
}

var cities = [
  {'name': "Pittsburgh",    'location': [40.440876, -79.9497555], 'zoom': 13, 'radius':  10 * 1000, 'fb_account': 'showmethebus-pit'},
  // {'name': "Chicago",       'location': [41.858541, -87.738335],  'zoom': 12, 'radius': 100 * 1000, 'fb_account': 'showmethebus-chi'},
  {'name': "NJ",            'location': [40.733487, -74.174846],  'zoom': 12, 'radius': 100 * 1000, 'fb_account': 'showmethebus-nj'},
  // {'name': "Sacramento",    'location': [38.565165, -121.487373], 'zoom': 12, 'radius':  50 * 1000, 'fb_account': 'showmethebus-sac'},
  // {'name': "Worcester",     'location': [42.261525, -71.802176],  'zoom': 13, 'radius':  25 * 1000, 'fb_account': 'showmethebus'},
  // {'name': "Pinellas Park", 'location': [27.859641, -82.719506],  'zoom': 13, 'radius':  50 * 1000, 'fb_account': 'showmethebus'},
  {'name': 'Milwaukee',     'location': [43.046602, -88.005882],  'zoom': 13, 'radius':  50 * 1000, 'fb_account': 'showmethebus-mil'},
  // {'name': 'Syracuse',      'location': [43.044142, -76.138250],  'zoom': 13, 'radius':  50 * 1000, 'fb_account': 'showmethebus'},
  // {'name': 'Fort Collins',  'location': [40.564875, -105.087221], 'zoom': 13, 'radius':  50 * 1000, 'fb_account': 'showmethebus'},
  // {'name': 'Niagara Falls', 'location': [43.081750, -79.076051],  'zoom': 13, 'radius':  20 * 1000, 'fb_account': 'showmethebus'},
  // {'name': 'Aspen',         'location': [39.199446, -106.840330], 'zoom': 12, 'radius':  50 * 1000, 'fb_account': 'showmethebus'},
  {'name': 'Richmond',      'location': [37.535415, -77.445540],  'zoom': 14, 'radius':  50 * 1000, 'fb_account': 'showmethebus-dc'},
  {'name': 'DC',            'location': [38.897879, -77.0361960], 'zoom': 13, 'radius':  50 * 1000, 'fb_account': 'showmethebus-dc'},
];

var domain_name_to_city = {
  "pitlivebus.com": "Pittsburgh",
  "chilivebus.com": "Chicago",
  "njlivebus.com": "NJ",
};



function initLocation(done) {
  closest_city = null;
  if(window.location.hostname in domain_name_to_city) {
    closest_city_name = domain_name_to_city[window.location.hostname];
    for(city in cities) {
      if(cities[city].name == closest_city_name) {
        closest_city = cities[city];
        break;
      }
    }
  }

  if(closest_city != null) {
    return done(closest_city.location[0], closest_city.location[1], closest_city)
  }

  getLocation(function (lat, lon) {
    // get close to a city we support
    closest_city = _.min(cities, function (city) {
      return getDistance(new google.maps.LatLng(city.location[0], city.location[1]), new google.maps.LatLng(lat,lon));
    });

    console.log(closest_city)

    if(getDistance(new google.maps.LatLng(closest_city.location[0], closest_city.location[1]), new google.maps.LatLng(lat,lon)) > closest_city.radius) {
      lat = closest_city.location[0];
      lon = closest_city.location[1];
    }

    try {
      console.log(closest_city.name)
    } catch (e) {
      Bugsnag.notifyException(e);
      closest_city = cities[1];
    }
    done(lat, lon, closest_city);
  })
}

function getLocation(callback) {
  if(center != null) {
    return callback(center[0], center[1]);
  }
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      callback(position.coords.latitude, position.coords.longitude);
    }, function () {
      getLocationWithGeoIP(callback);
    });
  } else {
    getLocationWithGeoIP(callback);
  }
}

function getLocationWithGeoIP(callback) {
  $.getJSON("http://www.telize.com/geoip?callback=?", function(json) {
    callback(json.latitude, json.longitude);
  });
}
