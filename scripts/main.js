window.onscroll = function() {
  myFunction();
};
var request = new XMLHttpRequest();
request.open("GET", "http://127.0.0.1:5500/Data/data.json", true);
request.send(null);
var hosNameGbs = [];
request.onreadystatechange = function() {
  if (request.readyState === 4 && request.status === 200) {
    var my_JSON_object = JSON.parse(request.responseText);
     hosNameGbs = handleJSONHosData(my_JSON_object); // call the fuction to handle hospital data from Jasom 
     RoomsNameType = handleJSONErrData(my_JSON_object); // call the function to handle Rooms Data 
    
  
// Define hospital icons
var hosIcon1 = L.icon({
  iconUrl: "/images/hospital.png",
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [30, 30],
  shadowSize: [30, 30],
  iconAnchor: [12, 55],
  shadowAnchor: [4, 62],
  popupAnchor: [-3, -76]
});

var hosIcon2 = L.icon({
  iconUrl: "/images/hospital2.png",
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [30, 30],
  shadowSize: [30, 30],
  iconAnchor: [12, 55],
  shadowAnchor: [4, 62],
  popupAnchor: [-3, -76]
});

var defaultZoomLevel = 13; 

// ...
// Rooms button onclick event
var roomButton = document.getElementById("ER");
var roomDiv = document.getElementById("RoomList");
var RoomsDisplayed = false; // Track whether Rooms are currently displayed
var RoomDropdown = null;

roomButton.onclick = function() {
  if (!RoomsDisplayed) {
    // Remove hospitals dropdown if it's currently displayed
    if (hospitalDropdown) {
      HosDiv.removeChild(hospitalDropdown);
      hospitalDropdown = null;
      hospitalsDisplayed = false;
      var ZoomIn = 15
    }

    // Remove hospitals from the map if displayed
    map.eachLayer(function(layer) {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    RoomDropdown = document.createElement("select"); // create a dropdown room menu
    RoomDropdown.id = "roomDropdown"; // id for the newly inserted dropdown menu
    roomDiv.appendChild(RoomDropdown); // adding the drobdwon menu to the room div

    for (var i = 0; i < RoomsNameType.length; i++) {
      var GbsArray = RoomsNameType[i].Gbs;
      var workingRooms = RoomsNameType[i].RoomNumbers;

      if (workingRooms > 0) {
        roomColor = "blue";
      } else {
        roomColor = "red";
        document.getElementById("roomDropdown").style.backgroundColor = "rgba(255, 0, 0, 0.8)"; // Set background to red for non-working rooms
      }

      // Check if GbsArray contains valid coordinates
      if (GbsArray.length >= 6 && GbsArray.length % 2 === 0 && GbsArray.every(function(num) { return !isNaN(num); })) {
        var roomOption = document.createElement("option");

        roomOption.id = "room" + i;
        roomOption.textContent = RoomsNameType[i].RoomName;
        roomOption.classList.add("RoomClasses");
        RoomDropdown.appendChild(roomOption);

        // Create an array to hold the LatLng objects
        var latLngs = [];

        // Iterate over GbsArray to group coordinates into pairs and create LatLng objects
        for (var j = 0; j < GbsArray.length; j += 2) {
          var lat = GbsArray[j];
          var lng = GbsArray[j + 1];
          latLngs.push([lat, lng]);
        }


        // Roo20m Dropdown event listener for changing the map view
        RoomDropdown.addEventListener('change', function() {
          var selectedIndex = RoomDropdown.selectedIndex;
          if (selectedIndex !== -1) {
            defaultZoomLevel= 15;
             
            var selectedRoomGbs = RoomsNameType[selectedIndex].Gbs;
            if (!isNaN(selectedRoomGbs[0]) && !isNaN(selectedRoomGbs[1])) {
              map.setView([selectedRoomGbs[0], selectedRoomGbs[1]], defaultZoomLevel);
            }
          }
        });

        // Create a polygon with the LatLng objects
        var responseRooms = L.polygon(latLngs, {
          color: roomColor,
          fillColor: roomColor,
          fillOpacity: 0.3,
          weight: 1
        }).bindPopup(RoomsNameType[i].RoomName).addTo(map);
      } else {
        console.error("Invalid GeoLocation data for room: " + RoomsNameType[i].RoomName);
      }
    }

    RoomsDisplayed = true;
    
  } else {
    // Remove rooms from the map
    map.eachLayer(function(layer) {
      if (layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    // Remove the dropdown menu
    if (RoomDropdown) {
      roomDiv.removeChild(RoomDropdown);
      
      RoomDropdown = null; // Reset the dropdown variable
    }

    RoomsDisplayed = false;
    defaultZoomLevel = 13;
    map.setView([15.609705, 32.530528], defaultZoomLevel); // Set map view to default coordinates and zoom level
  }
};

// Hospitals button onclick event
var hosButton = document.getElementById("hos");
var HosDiv = document.getElementById("HosList");
var hospitalsDisplayed = false; // Track whether hospitals are currently displayed
var hospitalDropdown = null; // Track the dropdown list

// ...

hosButton.onclick = function() {
  if (!hospitalsDisplayed) {
    // Remove rooms dropdown if it's currently displayed
    if (RoomDropdown) {
      roomDiv.removeChild(RoomDropdown);
      RoomDropdown = null;
      RoomsDisplayed = false;
    }

    // Remove rooms from the map if displayed
    map.eachLayer(function(layer) {
      if (layer instanceof L.Polygon) {
        map.removeLayer(layer);
      }
    });

    // Display hospitals as a dropdown list
    hospitalDropdown = document.createElement("select");
    hospitalDropdown.id = "hospitalDropdown";
    HosDiv.appendChild(hospitalDropdown);

    for (var i = 0; i < hosNameGbs.length; i++) {
      var Gbs = hosNameGbs[i].Gbs;
      var status = hosNameGbs[i].HospitalStatus;
      console.log(status);

      var Pinicon;
      var statusStatment;

      if (status === "Operational") {
        Pinicon = hosIcon1;
        statusStatment = " hospital is operating ";
      } else {
        Pinicon = hosIcon2;
        statusStatment = " hospital is out of service ";
      }

      // Check if both latitude and longitude are valid numbers
      if (!isNaN(Gbs[0]) && !isNaN(Gbs[1])) {
        var marker = new L.marker([Gbs[0], Gbs[1]], { icon: Pinicon })
          .bindPopup(hosNameGbs[i].name + statusStatment)
          .addTo(map);

        // Create an option element for each hospital
        var option = document.createElement("option");
        //option.value = hosNameGbs[i].name;
        option.id = "hos" + i;
        option.textContent = hosNameGbs[i].name;
        option.classList.add("hosClasses");
        hospitalDropdown.appendChild(option);

        if (status !== "Operational") {
          option.style.backgroundColor = "red"; // Set background color to red for non-operational hospitals
        }
      } else {
        console.error("Invalid Gbs values at index " + i + ": " + Gbs);
      }
    }
    hospitalsDisplayed = true;

    // Add event listener for select change
    hospitalDropdown.addEventListener('change', function() {
      var selectedIndex = hospitalDropdown.selectedIndex;
      if (selectedIndex !== -1) {
        defaultZoomLevel = 15;
        var selectedGbs = hosNameGbs[selectedIndex].Gbs;
        if (!isNaN(selectedGbs[0]) && !isNaN(selectedGbs[1])) {
          map.setView([selectedGbs[0], selectedGbs[1]], defaultZoomLevel);
        }
      }
    });
  } else {
    // Remove hospitals from the map
    map.eachLayer(function(layer) {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Remove the dropdown menu
    if (hospitalDropdown) {
      HosDiv.removeChild(hospitalDropdown);
      hospitalDropdown = null; // Reset the dropdown variable
    }

    hospitalsDisplayed = false;
    defaultZoomLevel = 13; 
    map.setView([15.609705, 32.530528], defaultZoomLevel);
  }
};

    
  } 
  }


function handleJSONHosData(data) {
  var resultArray = [];
  

  for (var i = 0; i < data.Hospitals.length; i++) {
    
    var name = data.Hospitals[i].Name;
    var GbsString = data.Hospitals[i].GPSLocation;
    var HospitalStatus = data.Hospitals[i].status;

    // Split the GbsString and convert to numbers
    var Gbs = GbsString.split(',').map(function(item) {
      return parseFloat(item.trim()); // Trim any whitespace around the numbers
    });

    // Check if Gbs contains valid coordinates
    if (Gbs.length === 2 && !isNaN(Gbs[0]) && !isNaN(Gbs[1])) {
      resultArray.push({ name: name, Gbs: Gbs  , HospitalStatus:HospitalStatus});
    } else {
      console.error("Invalid GPSLocation data for hospital: " + name);
    }
  }

  return  resultArray;
}

function handleJSONErrData(data) {
  var resultArray = [];

  for ( var i = 0; i < data.AdminUnits.length ; i ++) {
    var RoomName = data.AdminUnits[i].ERname;
    var RoomType = data.AdminUnits[i].ERRtype;
    var RoomNumbers = data.AdminUnits[i].Rooms;
    var GbsString = data.AdminUnits[i].GeoLocation;

    var GbsArray = GbsString.split(',').map(function(item) {
      return parseFloat(item.trim()); // Trim any whitespace around the numbers
    });

  // Check if GbsArray contains valid coordinates
  if (GbsArray.length >= 2 && GbsArray.every(function(num) { return !isNaN(num); })) {
    resultArray.push({RoomName: RoomName, RoomType: RoomType, RoomNumbers:RoomNumbers, Gbs:GbsArray})
  } else {
    console.error("Invalid GPSLocation data for hospital: " + RoomName);
  }

    //
  }

  return resultArray
  

}



//var workingHostTemp = "hospital is working ";

var header = document.getElementById("headermain");
var sticky = header.offsetTop;

function myFunction() {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}

const apiKey = '';

var map = L.map('map').setView([15.609705, 32.530528], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  maxZoom: 20,
  id: 'ahmed-isam/clhos6n5v01ml01qt6cqgcmnr',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: apiKey
}).addTo(map);




/*
var hosLocations = [
  ["Royal Scare", 15.598876, 32.570644],
  ["Haj Alsafi", 15.650982, 32.531898],
  ["Khartoum Hospital", 15.597838243365723, 32.53498665644436],
  ["East Nile hospital", 15.598180, 32.604627],
  ["Yastbshroon", 15.575573, 32.55818],
  ["Bashair Hospitals", 15.49018, 32.55237],
  ["bahri teaching hospital", 15.625413, 32.52959],
  ["Jawda Hospital", 15.576127, 32.534306],
  ["Albarha hospital", 15.673365, 32.544333],
  ["Fedail Hospital", 15.599371, 32.532373],
  ["Alnau Hospitals", 15.688268, 32.491883],
  ["Yastbshroon", 15.580329, 32.548122],
  ["Yastbshroon", 15.575573, 32.55818],
  ["Yastbshroon", 15.575573, 32.55818],
  ["Martyrs", 15.72392, 32.57995],
  ["Umdawwanban", 15.42213, 32.83633],
  ["Alban Jaded", 15.61767, 32.63211],
  ["Turkish" , 15.46264, 32.47649],
  ["Jebel Aulia" , 15.24355, 32.49819],
  ["Omdurman" , 15.64195, 32.48772],
  ["Abu Saad" , 15.593199, 32.460317],
  ["Ombada", 15.65305, 32.4104],
  ["Al Rajhi" ,15.64899, 32.36911],
  ["Al Buluk" , 15.68116, 32.48076]

];







// Er circle code 

var responsRooms = [

  ["Al-Jerif West الجريف غرب " , 15.588204, 32.574827 , 15.587577, 32.586250,15.570500, 32.591942,15.543213, 32.607505 ,15.536744, 32.583777 , "blue"],
  ["Al-Jerif East الجريف شرق", 15.599104, 32.591127 , 15.596574, 32.599248 ,15.598707, 32.610303 , 15.580581, 32.622428 , 15.569593, 32.596944, "blue"],
  ["Wad Nubawi , ود نوباوي", 15.665932, 32.490366 , 15.663004, 32.496372,15.662638, 32.501351 ,15.651630, 32.492549 ,15.650667, 32.489057 ,"blue"],
  ["Khartoum west , غرب الخرطوم", 15.580697, 32.499800 ,15.579724, 32.515826 , 15.524613, 32.490656 ,15.525481, 32.481471 ,15.556287, 32.490927 , "blue"],
  ["Al Amarat العمارات", 15.584684, 32.541080 ,15.585756, 32.547649 ,15.564774, 32.552271 ,15.563426, 32.544393 ,15.579628, 32.542012 , "red"],
  ["Al shafa الصحافة", 15.541064, 32.526825 , 15.545672, 32.555343 , 15.532322, 32.557802 , 15.527843, 32.529060 ,15.534475, 32.527809 , "blue"],
  ["Aldaim الديم   ",15.578488, 32.534073,15.579284, 32.541730 ,15.578037, 32.541667 ,15.563375, 32.544162 , 15.562234, 32.536833 , "red"],
  ["Eleimtdad  , ",15.557536, 32.537552 , 15.558528, 32.544686 ,15.558303, 32.544939, 15.544401, 32.547305 , 15.543401, 32.539905  , "blue"],
  ["Arkweet , اركويت", 15.546667, 32.555882,15.548251, 32.565964,15.557213, 32.579724,15.536453, 32.583229,15.534660, 32.558522, "blue"],
  ["Shamabat&Safia شمبات والصافية", 15.673895, 32.537141,15.672160, 32.551389,15.647291, 32.542346,15.647467, 32.522805,15.660186, 32.526713, "blue"],
  ["Halfait Almluk ,حلفاية الملوك", 15.720468, 32.550259,15.718279, 32.561052,15.688492, 32.556953,15.688046, 32.546742,15.690640, 32.539272, "blue"],
  ["AlDroshab " , 15.735980, 32.566009 , 15.737797, 32.574077,15.740606, 32.582788, 15.709211, 32.592187, 15.720035, 32.562747 , "blue"],
  ["Samrab" , 15.707456, 32.570794 ,15.708323, 32.603109 , 15.706175, 32.602122 , 15.692665, 32.602422 ,15.692665, 32.602422 , "blue"],
  ["Soba" , 15.508807, 32.609082 ,15.513367, 32.693009 , 15.486062, 32.711560 , 15.459660, 32.667805 ,15.502129, 32.626946 , "red"],
  ["Gabra" , 15.551845, 32.501983,15.549887, 32.508012, 15.552116, 32.523016, 15.515195, 32.529173,15.510438, 32.499480  , "blue"]


]


/*function clickEr(ER){
for (var i = 0 ; i < responsRooms.length ; i++) {
   var Responserooms = L.polygon([[responsRooms[i][1], responsRooms[i][2]] , [responsRooms[i][3], responsRooms[i][4]],[responsRooms[i][5],responsRooms[i][6]],
    [responsRooms[i][7],responsRooms[i][8]],[responsRooms[i][9] , responsRooms[i][10]]], 
    {
    color: responsRooms[i][11],
    fillColor: responsRooms[i][11],
    fillOpacity: 0.3,
    weight: 1
}).bindPopup(responsRooms[i][0]).addTo(map);
  }

}*/
