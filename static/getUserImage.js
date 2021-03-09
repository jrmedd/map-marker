let videoDevices;
let cameraIndex = -1;
let imageCapture;
let imagePreview;
let photoOptions = {
  fillLightMode: "off",
};

const cameraContainer = document.getElementById("camera-container");
const loadingScreen = document.getElementById("loading");


navigator.mediaDevices
  .enumerateDevices()
  .then((foundDevices) => {
    videoDevices = foundDevices.filter((device) => device.kind === "videoinput").map(device=>device.deviceId);
    cameraIndex = videoDevices.length - 1;
  }
);

function switchCamera() {
  cameraIndex = (cameraIndex + 1) % videoDevices.length;
  imageCapture && imageCapture.track.stop();
  navigator.mediaDevices
  .getUserMedia({ video: { deviceId:videoDevices[cameraIndex]}})
  .then((stream) => {
    document.querySelector("video").srcObject = stream;
    const track = stream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);
  }).catch(()=>{
    loadingScreen.style.opacity = 0;
    cameraContainer.style.pointerEvents = "none";
    cameraContainer.style.display = "none";
    showFooter();
  });
}
document.getElementById("switch-camera").addEventListener("click", switchCamera);

document.getElementById("take-picture").addEventListener("click", ()=> {
  cameraContainer.style.transform = "scale(0)";
  imageCapture.takePhoto().then((blob) => {
    let formData = new FormData();
    const imageData = URL.createObjectURL(blob);
    let resizedImage = resizedataURL(imageData, 480, 270).then(image=>{
      formData.append("image", image);
      imagePreview = image;
      fetch(`${location.origin}/image`, {
        method: "POST",
        body: formData,
      }).then((res) => res.status == 200 && res.json()).then(data=>{
        URL.revokeObjectURL(imageData);
        loadingScreen.style.opacity = 0;
        cameraContainer.style.pointerEvents = "none";
        cameraContainer.style.display = "none";
        cameraContainer.style.transform = "scale(1)";
        document.getElementById("photo-id").value = data.image_id;
        document.getElementById("photo-preview").src = imagePreview;
        document.getElementById("photo-preview").transform = "scale(1)"
        imageCapture.track.stop();
        cameraIndex = videoDevices.length - 1;
        showFooter();
      });
    });
    
  });
}
)

// Takes a data URI and returns the Data URI corresponding to the resized image at the wanted size.
function resizedataURL(datas, wantedWidth, wantedHeight){
    return new Promise(async function(resolve,reject){

        // We create an image to receive the Data URI
        var img = document.createElement('img');

        // When the event "onload" is triggered we can resize the image.
        img.onload = function()
        {        
            // We create a canvas and get its context.
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            // We set the dimensions at the wanted size.
            let scaleFactor = 1/(img.width/wantedWidth);
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;

            // We resize the image with the canvas method drawImage();
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);

            var dataURI = canvas.toDataURL('image/jpeg', 0.5);

            // This is the return of the Promise
            resolve(dataURI);
        };

        // We put the Data URI in the image's src attribute
        img.src = datas;

    })
}