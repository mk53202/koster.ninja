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
