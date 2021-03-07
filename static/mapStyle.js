const markerIcon = {
  scale: 2,
  path:"M7.05882 0H1.41176L5.45383e-06 0.941173L0 15.5294L0.941177 16H7.70588L8.47059 15.5294L8.47059 0.941177L7.05882 0ZM7.05883 1.58825H1.41177V4.00001H7.05883V1.58825Z",
  fillOpacity: 1,
  strokeWeight: 0,
};

const newBinIcon = {
  scale: 2,
  path:"M7.05882 0H1.41176L5.45383e-06 0.941173L0 15.5294L0.941177 16H7.70588L8.47059 15.5294L8.47059 0.941177L7.05882 0ZM7.05883 1.58825H1.41177V4.00001H7.05883V1.58825Z",
};

const icons = {
  default: { color: "#007C7C" },
  hover: { color: "#C0E8E8" },
  active: { color: "#1900FF" },
  new: { color: "#007C7C" },
};

const mapStyle = [
  {
    featureType: "landscape.natural",
    elementType: "geometry.fill",
    stylers: [
      {
        visibility: "on",
      },
      {
        color: "#e0efef",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry.fill",
    stylers: [
      {
        visibility: "on",
      },
      {
        hue: "#1900ff",
      },
      {
        color: "#c0e8e8",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        lightness: 100,
      },
      {
        visibility: "simplified",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        visibility: "on",
      },
      {
        lightness: 700,
      },
    ],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [
      {
        color: "#007C7C",
      },
    ],
  },
];