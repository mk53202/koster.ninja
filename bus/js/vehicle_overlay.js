VehicleOverlay.prototype = new google.maps.OverlayView();

function VehicleOverlay(map, route, color) {
  this.map_ = map;
  this.route_ = route;
  this.color_ = color;
  this.div_ = null;
  this.location_ = null;
  this.direction_ = null;
  this.moving_ = false;
  this.setMap(map);
}

var g_z_index = 100000;
var g_cur_z_index = g_z_index;

VehicleOverlay.prototype.onAdd = function() {
  this.div_ = document.getElementById('location_overlay')

  var div = document.createElement('div');
  div.className = 'bus';
  div.style.backgroundColor = '#' + this.color_;
  div.style.zIndex = g_z_index;

  var tag = document.createElement('p')
  tag.innerHTML = '<i class="fa fa-bus"></i> ' + this.route_

  div.appendChild(tag);
  this.div_ = div;

  var panes = this.getPanes();
  panes.overlayMouseTarget.appendChild(this.div_);
  this.height = this.div_.offsetHeight / 2;
  this.width = this.div_.offsetWidth / 2;


  google.maps.event.addDomListener(this.div_, 'click', function(e) {
    e.preventDefault();
    div.style.zIndex = g_cur_z_index;
    g_cur_z_index--;
  });
};

VehicleOverlay.prototype.updateLocation = function(location, direction) {
  this.location_ = location;
  if(typeof direction === "undefined" || direction === null) {
    this.direction_ = null;
  } else {
    this.direction_ = (direction + 360) % 360;
  }
  this.draw();
}

VehicleOverlay.prototype.getPosition = function() {
  return this.location_;
}

VehicleOverlay.prototype.draw = function() {
  if(document.hidden) {
    return;
  }
  if(this.location_ !== null && this.div_ !== null) {
    var overlayProjection = this.getProjection();
    var position = overlayProjection.fromLatLngToDivPixel(this.location_);

    this.div_.style.left = (position.x - this.width) + 'px';
    this.div_.style.top = (position.y - this.height) + 'px';
    var rotation = 360-this.direction_;
    if(this.direction_ === null) {
      this.div_.className = "bus no-dir"
      rotation = 0;
    }
    else if(this.direction_  <= 90 || this.direction_ >= 270) {
      this.div_.className = "bus bus-inverse";
    } else {
      this.div_.className = "bus";
      rotation = 360-(this.direction_+180);
    }
    this.div_.style.transform = 'rotate('+rotation+'deg)';
    this.div_.style.webkitTransform = 'rotate('+rotation+'deg)';
  }
};

VehicleOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};


/* Animates the Marker class (based on https://stackoverflow.com/a/10906464) */
VehicleOverlay.prototype.animatedMoveTo = function(newLocation, direction) {
  var toLat = newLocation[0];
  var toLng = newLocation[1];
  var toDirection = direction;

  var fromLat = this.getPosition().lat();
  var fromLng = this.getPosition().lng();
  var fromDirection = this.direction_;

  if (!coordinatesAreEquivalent(fromLat, toLat) || !coordinatesAreEquivalent(fromLng, toLng)) {
    if(this.moving_) {
      return;
    }
    this.moving_ = true
    var percent = 0;
    var latDistance = toLat - fromLat;
    var lngDistance = toLng - fromLng;
    var dirDistance = toDirection - fromDirection;
    if(dirDistance > 180) {
      dirDistance -= 360;
    } else if(dirDistance < -180) {
      dirDistance += 360;
    }

    var start = null;
    var bus = this;
    var step = function(timestamp) {
      if (!start) start = timestamp;
      var progress = timestamp - start;
      var percent = Math.min(progress / 5000, 1);
      var curLat = fromLat + (percent * latDistance);
      var curLng = fromLng + (percent * lngDistance);
      var curDir = fromDirection + (percent * dirDistance)
      if(fromDirection === null) {
        curDir = null;
      }
      var pos = new google.maps.LatLng(curLat, curLng);
      bus.updateLocation(pos, curDir);
      if (progress < 5000) {
        window.requestAnimationFrame(step);
      } else{
        bus.moving_ = false;
      }
    }
    window.requestAnimationFrame(step);
  }
};
