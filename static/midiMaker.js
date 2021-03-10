let midiNoteMin = 21;
let midiNoteMax = 108;

let midiVelocityMin = 63;
let midiVelocityMax = 127;

let midiControlMin = 0;
let midiControlMax = 127;

const litterBins = new Array(); 

const litter = new Array(); 
const litterX = new Array();
const litterY = new Array();
let litterXMin, litterXMax, litterYMin, litterYMax;

let destinationIp = "192.168.86.31";
let destinationPort = 8001;


const midiNoteMinInput = document.getElementById("midi-note-min");
const midiNoteMaxInput = document.getElementById("midi-note-max");
const midiVelocityMinInput = document.getElementById("midi-velocity-min");
const midiVelocityMaxInput = document.getElementById("midi-velocity-max");
const midiControlMinInput = document.getElementById("midi-control-min");
const midiControlMaxInput = document.getElementById("midi-control-max");

const midiTrigger = document.getElementById("send-notes");

const destinationIpInput = document.getElementById("destination-ip");
const destinationPortInput = document.getElementById("destination-port");

midiNoteMinInput.addEventListener("change", event=> midiNoteMin = parseInt(event.target.value));
midiNoteMaxInput.addEventListener("change", event=> midiNoteMax = parseInt(event.target.value));
midiVelocityMinInput.addEventListener("change", event=> midiVelocityMin = parseInt(event.target.value));
midiVelocityMaxInput.addEventListener("change", event=> midiVelocityMax = parseInt(event.target.value));
midiControlMinInput.addEventListener("change", event=> midiControlMin = parseInt(event.target.value));
midiControlMaxInput.addEventListener("change", event=> midiControlMax = parseInt(event.target.value));

destinationIpInput.addEventListener("change", event=> destinationIp = event.target.value);
destinationPortInput.addEventListener("change", event=> destinationPort = parseInt(event.target.value));

fetch(`${location.origin}/litter-bins`)
    .then(res => res.status = 200 && res.json())
    .then(data => litterBins.push(...data.markers)
)

fetch(`${location.origin}/litter`)
  .then((res) => (res.status = 200 && res.json()))
  .then((data) => {
      litter.push(...data.markers);
      litterX.push(...litter.map(v=>v.lng))
      litterY.push(...litter.map((v) => v.lat));
      litterXMin = Math.min(...litterX);
      litterXMax = Math.max(...litterX);
      litterYMin = Math.min(...litterY);
      litterYMax = Math.max(...litterY);
  });

const scaleToRange = (input, inputLower, inputUpper, outputLower, outputUpper) => {
    const scaledOutput = ((input - inputLower) / (inputUpper - inputLower) * (outputUpper - outputLower) + outputLower);
    return scaledOutput < outputLower ? outputLower : scaledOutput > outputUpper ? outputUpper : scaledOutput;
};

const markerToMidi = marker => {
    const note  = parseInt(scaleToRange(marker.lng, litterXMin, litterXMax, midiNoteMin, midiNoteMax));
    const velocity = parseInt(scaleToRange(marker.lat, litterYMin, litterYMax, midiVelocityMin, midiVelocityMax));
    const closestBin = Math.min(...litterBins.map((bin) =>
        haversine_distance(marker, bin)
    ));
    const control = parseInt(scaleToRange(closestBin, 0, 100, midiControlMin, midiControlMax));
    return ({note:note, velocity:velocity, control:control});
}
function haversine_distance(mk1, mk2) {
      var R = 6371.071; // Radius of the Earth in km
      var rlat1 = mk1.lat * (Math.PI/180); // Convert degrees to radians
      var rlat2 = mk2.lat * (Math.PI/180); // Convert degrees to radians
      var difflat = rlat2-rlat1; // Radian difference (latitudes)
      var difflon = (mk2.lng-mk1.lng) * (Math.PI/180); // Radian difference (longitudes)
      var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
      return d;
}

midiTrigger.addEventListener("click", event=>{
    event.preventDefault();
    const notes = litter.map((v) => markerToMidi(v));
    console.log(notes)
    fetch('http://127.0.0.1:8000/relay',
        {
            method: 'POST', 
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ip:'192.168.86.31', port: 8001, data:notes})
        })
})