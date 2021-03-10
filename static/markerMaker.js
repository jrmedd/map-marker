let map;

let userEntry;
let userPosition;
let userTracking;
let addingLitterOrBin = "bin";
let editMode = false;

const mapContainer = document.getElementById("map");

const pageOutline = document.getElementById("outline");
pageOutline.style.border = "8px dashed #7DCDCD";

const searchForm = document.getElementById("search");
const locationQuery = document.getElementById("location-query");

const messageForm = document.getElementById("message");
const messageInput = document.getElementById("message-input");

const header = document.getElementsByTagName("header")[0];

const addMenu = document.getElementById("add-litter-or-bin");
const addLitterButton = document.getElementById("add-litter");
const addBinButton = document.getElementById("add-bin");

const closeButton = document.getElementById("close-message");
const footer = document.getElementsByTagName("footer")[0];

const findMeButton = document.getElementById("find-me");

const foundMessageContainer = document.getElementById("found-message-container");
const foundMessageContent = document.getElementById("found-message-content");
const foundMessageImage = document.getElementById("found-message-image");
const closeFoundMessageButton = document.getElementById("close-found-message");

const overlay = document.getElementById("overlay");

const litterOrBin = document.getElementById("litter-or-bin");
const messageTypeMenu = document.getElementById("message-or-photo");

const createMessageButton = document.getElementById("create-message");
const createPhotoButton = document.getElementById("create-photo");

const mapOptionsButton = document.getElementById("map-options-button");
const mapOptionsMenu = document.getElementById("map-options");
let optionsVisible = false;


const showAddButtons = () => {
 addMenu.style.right = "0px";
  mapOptionsMenu.style.left = "0px";
}

const hideAddButtons = () => {
  addMenu.style.right = "-100vh";
  mapOptionsMenu.style.left = "-100vh";
};

const showHeader = () => {
  header.style.top = "0vh";
};
const showFooter = () => {
  footer.style.bottom = "0vh";
};

const showMessageTypeMenu = () => {
  messageTypeMenu.style.right = "0vh";
};

const hideHeader = () => {
  header.style.top = "-100vh";
};
const hideFooter = () => {
  footer.style.bottom = "-100vh";
  document.getElementById("photo-preview").src = "";
  document.getElementById("photo-preview").transform = "scale(0)";
};

const hideMessageTypeMenu = () => {
  messageTypeMenu.style.right = "-100vh";
};

const showMessageCreator = () => {
  showFooter();
  hideMessageTypeMenu();
};

function initMap(callback) {
    map = new google.maps.Map(mapContainer, {
      center: { lat: clientLat, lng: clientLng },
      zoom: 14,
      styles: mapStyle,
      gestureHandling: "greedy",
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      disableDefaultUI: true,
    });
    map.addListener("click", event=> {
    if (editMode) {
        if (userEntry != undefined) {
            userEntry.setMap(null)
        }
        const addingIcon = addingLitterOrBin == "bin" ? newBinIcon : newLitterIcon;
        showMessageTypeMenu();
        userEntry = new google.maps.Marker({
          position: event.latLng,
          map: map,
          icon: {
            ...addingIcon,
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(8, 8),
            strokeColor: icons.new.color,
          },
          draggable: true,
          raiseOnDrag: false,
        });
        overlay.style.opacity = 0;
    }
      foundMessageContainer.style.opacity = 0;
    });
    messageForm.addEventListener("submit", event => {
      event.preventDefault();
      const lat = userEntry.position.lat();
      const lng = userEntry.position.lng();
      const submission = {
        type: addingLitterOrBin,
        message:messageInput.textContent, 
        lat: lat, 
        lng: lng, 
        photoId: document.getElementById("photo-id").value
      }
      fetch(`${location.origin}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission)
      });
      editMode = false;
      pageOutline.style.opacity = 0;
      hideFooter();
      showHeader();
      showAddButtons();
      map.setOptions({ draggable: true, draggableCursor: "grab" });
      messageInput.textContent = ""; 
      userEntry.setMap(null);
    })
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      locationQuery.value.length > 0 &&
        fetch(`${location.origin}/search?query=${locationQuery.value}&locationbias=${map.center.lat()},${map.center.lng()}`)
          .then((response) => response.status == 200 && response.json())
          .then((data) => {
            if (data.result.candidates.length > 0) {
                const newLocation = data.result.candidates[0].geometry.location;
                map.setCenter(new google.maps.LatLng(newLocation.lat, newLocation.lng));
                map.setZoom(20)
            };
          });
    });
    
    findMeButton.addEventListener("click", ()=>{
      findMeButton.classList.toggle('spin');
      findMeButton.setAttribute('disabled', true);
      let userFound = false;
      navigator.geolocation.clearWatch(userTracking);
      if ('geolocation' in navigator) {
        userTracking = navigator.geolocation.watchPosition(location=> {
          if (userPosition != undefined) {
            userPosition.setMap(null);
          }
          let userIcon = location.heading ? locationIcon : locationIconWithHeading;
          userPosition = new google.maps.Marker({
            position: {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            },
            map: map,
            icon: {
              ...userIcon,
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(8, 8),
              fillColor: "#1900FF",
              strokeColor: "#ffffff",
              strokeWeight: 1,
              rotation: location.heading || 0,
              className: "userLocation",
            },
            draggable: false,
            raiseOnDrag: false,
          });
          if (!userFound) {
            findMeButton.classList.toggle('spin');
            findMeButton.removeAttribute("disabled");
            map.setCenter(
              new google.maps.LatLng(location.coords.latitude, location.coords.longitude)
            );
            map.setZoom(20);
            userFound = true;
          }
        })
      }
    })

    const hideMessageCreator = () => {
      editMode = false;
      hideFooter();
      showHeader();
      pageOutline.style.opacity = 0;
      showAddButtons();
      map.setOptions({ draggable: true, draggableCursor: "grab" });
      userEntry.setMap(null);
    };
    const showMessageTypes = marking => {
      document.getElementById("photo-id").value = null;
      hideHeader();
      hideAddButtons();
      addingLitterOrBin = marking;
      document.getElementById("litter-or-bin-message").innerText = marking;
      litterOrBin.setAttribute("value", marking);
      overlay.style.opacity = 1;
      editMode = true;
      pageOutline.style.opacity = 1;
      map.setOptions({ draggable: false, draggableCursor: "crosshair" });
    }
    addBinButton.addEventListener("click", ()=>showMessageTypes("bin"));
    addLitterButton.addEventListener("click", ()=>showMessageTypes("litter"));
    closeButton.addEventListener("click", hideMessageCreator);

    createMessageButton.addEventListener("click", showMessageCreator);
    closeFoundMessageButton.addEventListener("click", () => {
      foundMessageContainer.style.opacity = 0;
    });

    const showCamera = () =>{
      loadingScreen.style.opacity = 1;
      document.getElementById("camera-container").style.display = "flex";
      document.getElementById("camera-container").style.pointerEvents = "unset";
    } 

    createPhotoButton.addEventListener("click",()=>{
      hideMessageTypeMenu();
      showCamera();
      switchCamera();
    });

    callback();
}

mapOptionsButton.addEventListener("click", ()=> {
  toggleMapOptions(optionsVisible ? "hide" : "show")
  optionsVisible = !optionsVisible;
})


const endpoints = [
  {
    name: "litterBins",
    path: "litter-bins",
    icon: binIcon,
  },
  {
    name: "litter",
    path: "litter",
    icon: litterIcon,
  },
];

let markers = {
  litterBins: {
    data: [],
    gradient: [],
    heatmapData: [],
    heatmap: {},
  },
  litter: {
    data: [],
    gradient: [],
    heatmapData: [],
    heatmap: {},
  },
};

for (let option of document.getElementsByClassName("map-option")) {
  option.addEventListener("click", (event) => {
    let toToggle = option.getAttribute("data-display");
    if (option.getAttribute("data-toggle") == "marker") {
      toggleMarkers(toToggle);
    } else if (option.getAttribute("data-toggle") == "heatmap") {
      toggleHeatMap(toToggle);
    }
  });
}

const toggleMapOptions = (showOrHide) => {
  const mapOptions = document.getElementsByClassName("map-option");
  for (let i = 0; i < mapOptions.length; i++) {
    mapOptions[i].style.transitionDelay = `${0.2 + i * 0.05}s`;
    mapOptions[i].style.marginLeft = showOrHide == "show" ? 0 : "-100vh";
  }
};

const fetchMarkers = () => {
  endpoints.forEach(endpoint=>{
    fetch(`${location.origin}/${endpoint.path}`)
      .then((res) => res.status == 200 && res.json())
      .then((data) => {
        console.log(data);
        data.markers.map((litterBin) => {
          let newMarker = new google.maps.Marker({
            position: { lat: litterBin.lat, lng: litterBin.lng },
            icon: {
              ...endpoint.icon,
              fillColor: icons.default.color,
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(8,8),
            },
            title: litterBin.message,
          });
          newMarker.addListener("mouseover", () =>
            newMarker.setIcon({
              ...endpoint.icon,
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(8,8),
              fillColor: icons.hover.color,
            })
          );
          newMarker.addListener("mouseout", () =>
            newMarker.setIcon({
              ...endpoint.icon,
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(8,8),
              fillColor: icons.default.color,
            })
          );
          newMarker.addListener("click", () => {
            foundMessageContainer.style.opacity = 1;
            foundMessageContent.textContent = litterBin.message;
            foundMessageImage.src = "";
            if (litterBin.photoId.length > 0) {
              fetch(`${location.origin}/image?id=${litterBin.photoId}`)
                .then((res) => res.status == 200 && res.json())
                .then((data) => (foundMessageImage.src = data.image));
            }
          });
          markers[endpoint.name].data.push(newMarker);
          markers[endpoint.name].heatmapData.push(new google.maps.LatLng(litterBin.lat,litterBin.lng));
          newMarker.setMap(map);
        });
        markers[endpoint.name].heatmap = new google.maps.visualization.HeatmapLayer({data: markers[endpoint.name].heatmapData, radius: 80})
      }); 
  })
};

const toggleMarkers = dataset => {
  markers[dataset].data.forEach(marker=>marker.setMap(!marker.getMap() ? map : null))
}

const toggleHeatMap = dataset => {
  markers[dataset].heatmap.setMap(!markers[dataset].heatmap.getMap() ? map : null);
}


function init() {
    initMap(fetchMarkers)
}