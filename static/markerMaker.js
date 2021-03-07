let map;

let userEntry;
let addingLitterOrBin = "bin";
let editMode = false;

const mapContainer = document.getElementById("map");

const pageOutline = document.getElementById("outline");
pageOutline.style.border = "8px dashed #7DCDCD";

const searchForm = document.getElementById("search");
const locationQuery = document.getElementById("location-query");

const messageForm = document.getElementById("message");
const messageInput = document.getElementById("message-input");

const addBinButton = document.getElementById("add-bin");
const header = document.getElementsByTagName("header")[0];

const addLitterButton = document.getElementById("add-litter");

const closeButton = document.getElementById("close-message");
const footer = document.getElementsByTagName("footer")[0];

const foundMessageContainer = document.getElementById("found-message-container");
const foundMessageContent = document.getElementById("found-message-content");
const closeFoundMessageButton = document.getElementById("close-found-message");

const overlay = document.getElementById("overlay");

const litterOrBin = document.getElementById("litter-or-bin");
const messageTypeMenu = document.getElementById("message-or-photo");

const createMessageButton = document.getElementById("create-message");
const createPhotoButton = document.getElementById("create-photo");


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
            userEntry = new google.maps.Marker({
              position: event.latLng,
              map: map,
              icon: { ...newBinIcon, anchor: new google.maps.Point(11, 22), strokeColor: icons.new.color},
              draggable: true,
              raiseOnDrag: false
            });
            overlay.style.opacity = 0;
        }
          foundMessageContainer.style.opacity = 0;
        });
        messageForm.addEventListener("submit", event => {
          event.preventDefault();
          const lat = userEntry.position.lat();
          const lng = userEntry.position.lng();
          const submission = {litterOrBin: addingLitterOrBin,message:messageInput.textContent, lat: lat, lng: lng }
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
    
    const showAddButtons = () => {
      addBinButton.style.opacity = 1;
      addBinButton.style.pointerEvent - "unset";
      addLitterButton.style.opacity = 1;
      addLitterButton.style.pointerEvent - "unset";
    }

    const hideAddButtons = () => {
      addBinButton.style.opacity = 0;
      addBinButton.style.pointerEvent - "none";
      addLitterButton.style.opacity = 0;
      addLitterButton.style.pointerEvent - "none";
    };

    const showHeader = () => {
      header.style.top = "0vh";
    }
    const showFooter = () => {
      footer.style.bottom = "0vh";
    }

    const showMessageTypeMenu = ()=>{
      messageTypeMenu.style.right = "0vh"
    }

    const hideHeader = () => {
      header.style.top = "-100vh";
    };
    const hideFooter = () => {
      footer.style.bottom = "-100vh";
    };

    const hideMessageTypeMenu = () => {
      messageTypeMenu.style.right = "-100vh";
    };

    const showMessageCreator = () => {
      showFooter();
      hideMessageTypeMenu();
    };

    const hideMessageCreator = () => {
      editMode = false;
      hideFooter();
      showHeader();
      pageOutline.style.opacity = 0;
      showAddButtons();
      map.setOptions({ draggable: true, draggableCursor: "grab" });
      userEntry.setMap(null);
    };
    const showMessageTypes = event => {
      console.log(event);
      hideHeader();
      hideAddButtons();
      showMessageTypeMenu();
      addingLitterOrBin = event.target.value;
      document.getElementById("litter-or-bin-message").innerText = addingLitterOrBin;
      litterOrBin.setAttribute("value", addingLitterOrBin);
      overlay.style.opacity = 1;
      editMode = true;
      pageOutline.style.opacity = 1;
      map.setOptions({ draggable: false, draggableCursor: "crosshair" });
    }
    addBinButton.addEventListener("click", showMessageTypes);
    addLitterButton.addEventListener("click", showMessageTypes);
    closeButton.addEventListener("click", hideMessageCreator);

    createMessageButton.addEventListener("click", showMessageCreator);
    closeFoundMessageButton.addEventListener("click", () => {
      foundMessageContainer.style.opacity = 0;
    });

    const showCamera = () =>{
      document.getElementById("camera-container").style.display = "flex";
      document.getElementById("camera-container").style.pointerEvents = "unset";
    } 

    createPhotoButton.addEventListener(()=>{
      showCamera();
      switchCamera();
    });

    callback();
}

const fetchMarkers = () => {
    fetch(`${location.origin}/litter-bins`).then(res => res.status == 200 && res.json()).then(data => {
        console.log(data);
        data.litterBins.map(litterBin=> {
            let newMarker = new google.maps.Marker({
                position: { lat: litterBin.lat, lng: litterBin.lng },
                map: map,
                icon: { ...markerIcon, fillColor: icons.default.color, anchor: new google.maps.Point(11, 22)},
                title: litterBin.message
                
        });
        newMarker.addListener("mouseover", () => newMarker.setIcon({ ...newBinIcon, anchor: new google.maps.Point(11, 22), fillColor: icons.hover.color }));
        newMarker.addListener("mouseout", () => newMarker.setIcon({ ...newBinIcon, anchor: new google.maps.Point(11, 22), fillColor: icons.default.color }));
        newMarker.addListener("click", () => { 
          foundMessageContainer.style.opacity = 1;
          foundMessageContent.textContent = litterBin.message;
        }
        );
        });
    }) 
};

function init() {
    initMap(fetchMarkers)
}