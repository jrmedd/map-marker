let videoDevices = new Array();
let cameraIndex = 0;
let imageCapture;
let photoOptions = {
  fillLightMode: "off",
};

navigator.mediaDevices
  .enumerateDevices()
  .then((foundDevices) => {
    videoDevices = foundDevices.filter((device) => device.kind === "videoinput")
    const videoOptions = document.getElementById("video-options");
  }
);

document.getElementById("switch-camera").addEventListener("click", event => {
  cameraIndex = (cameraIndex + 1) % videoDevices.length;
  navigator.mediaDevices
    .getUserMedia({ video: { deviceId: videoDevices[cameraIndex].deviceId } })
    .then((stream) => {
      document.querySelector("video").srcObject = stream;
      const track = stream.getVideoTracks()[0];
      imageCapture = new ImageCapture(track);
    });
});

document.getElementById("take-picture").addEventListener("click", ()=> {
  imageCapture.takePhoto().then((blob) => {
    let formData = new FormData();
    const imageData = URL.createObjectURL(blob);
    let resizedImage = resizedataURL(imageData, 480, 270).then(image=>{
      formData.append("image", image);
      fetch(`${location.origin}/post-image`, {
        method: "POST",
        body: formData,
      }).then((res) => res.status == 200 && URL.revokeObjectURL(imageData));
    });
    
  });
}
)
/*
document.getElementById("toggle-flash").addEventListener("click", event=>{
  photoOptions.fillLightMode = photoOptions.fillLightMode == "off" ? "flash" : "off";
  document.getElementById("flash-setting").textContent = photoOptions.fillLightMode === "flash" ? "on" : "off";
  imageCapture.setOptions(photoOptions);
})
*/
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
            canvas.width = wantedWidth;
            canvas.height = wantedHeight;

            // We resize the image with the canvas method drawImage();
            ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);

            var dataURI = canvas.toDataURL('image/jpeg', 0.5);

            // This is the return of the Promise
            resolve(dataURI);
        };

        // We put the Data URI in the image's src attribute
        img.src = datas;

    })
}