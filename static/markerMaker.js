let map;

let userMarker;
let editMode = false;

const mapContainer = document.getElementById("map");

const pageOutline = document.getElementById("outline");
pageOutline.style.border = "8px dashed #B75B61";

const searchForm = document.getElementById("search");
const locationQuery = document.getElementById("location-query");

const messageForm = document.getElementById("message");
const messageInput = document.getElementById("message-input");

const addButton = document.getElementById("add-message");
const header = document.getElementsByTagName("header")[0];

const closeButton = document.getElementById("close-message");
const footer = document.getElementsByTagName("footer")[0];

const foundMessageContainer = document.getElementById("found-message-container");
const foundMessageContent = document.getElementById("found-message-content");
const closeFoundMessageButton = document.getElementById("close-found-message");


function initMap(callback) {
    map = new google.maps.Map(mapContainer, {
      center: { lat: 53.442332922585884, lng: -2.186768968688275 },
      zoom: 18,
      styles: mapStyle,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
        map.addListener("click", event=> {
        if (editMode) {
            if (userMarker != undefined) {
                userMarker.setMap(null)
            }
            userMarker = new google.maps.Marker({
              position: event.latLng,
              map: map,
              icon: { ...newMarkerIcon, anchor: new google.maps.Point(11, 22), strokeColor: icons.new.color},
              draggable: true,
              raiseOnDrag: false
            });
        }
          foundMessageContainer.style.opacity = 0;
        });
        messageForm.addEventListener("submit", event => {
          event.preventDefault();
          const lat = userMarker.position.lat();
          const lng = userMarker.position.lng();
          const submission = {message:messageInput.textContent, lat: lat, lng: lng }
          fetch(`${location.origin}/message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(submission)
          });
          editMode = false;
          pageOutline.style.opacity = 0;
          footer.style.left = "-100vw";
          setTimeout(()=>{footer.style.bottom = "-100vh";footer.style.left = "50%";}, 1000);
          header.style.top = "0px";
          map.setOptions({ draggable: true, draggableCursor: "grab" });
          messageInput.textContent = ""; 
          userMarker.setMap(null);
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
                };
              });
        });
    addButton.addEventListener("click", () => {
      editMode = true;
      footer.style.bottom = "0px";
      header.style.top = "-100vh"
      pageOutline.style.opacity = 1;
      map.setOptions({draggable: false, draggableCursor:'crosshair'})
    });

    closeButton.addEventListener("click", () => {
      editMode = false;
      footer.style.bottom = "-100vh";
      header.style.top = "0px";
      pageOutline.style.opacity = 0;
      map.setOptions({ draggable: true, draggableCursor: 'grab' });
      userMarker.setMap(null);
    });
    closeFoundMessageButton.addEventListener("click", () => {
      foundMessageContainer.style.opacity = 0;
    }) 
    callback();
}

const fetchMarkers = () => {
    fetch(`${location.origin}/markers`).then(res => res.status == 200 && res.json()).then(data => {
        console.log(data);
        data.markers.map(marker=> {
            let newMarker = new google.maps.Marker({
                position: { lat: marker.lat, lng: marker.lng },
                map: map,
                icon: { ...markerIcon, fillColor: icons.default.color, anchor: new google.maps.Point(11, 22)},
                title: marker.message
                
        });
        newMarker.addListener("mouseover", () => newMarker.setIcon({ ...markerIcon, anchor: new google.maps.Point(11, 22), fillColor: icons.hover.color }));
        newMarker.addListener("mouseout", () => newMarker.setIcon({ ...markerIcon, anchor: new google.maps.Point(11, 22), fillColor: icons.default.color }));
        newMarker.addListener("click", () => { 
          foundMessageContainer.style.opacity = 1;
          foundMessageContent.textContent = marker.message;
        }
        );
        });
    }) 
};

function init() {
    initMap(fetchMarkers)
}