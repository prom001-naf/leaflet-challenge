//Part 1

// Create the map
let map = L.map("map").setView([37.7749, -122.4194], 5); // Centered on the US

// Add a Tile Layer (base map)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(map);

// Define a function to set marker size based on magnitude
function markerSize(magnitude) {
  return magnitude * 4; // Adjust size scaling as necessary
}

// Define a function to set marker color based on depth
function markerColor(depth) {
  if (depth > 90) return "#ff5f65";
  if (depth > 70) return "#fca35d";
  if (depth > 50) return "#fdb72a";
  if (depth > 30) return "#f7db11";
  if (depth > 10) return "#dcf400";
  return "#a3f600";
}

// Define a function to style markers
function styleMarker(feature) {
  return {
    radius: markerSize(feature.properties.mag),
    fillColor: markerColor(feature.geometry.coordinates[2]), // Depth is the third coordinate
    color: "#000",
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.8,
  };
}

// URL for USGS earthquake GeoJSON data
let earthquakeUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the data using D3
d3.json(earthquakeUrl).then(function (data) {
  // Create a GeoJSON layer with the retrieved data
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleMarker,
    onEachFeature: function (feature, layer) {
      // Add a popup with earthquake details
      layer.bindPopup(
        `<h3>${feature.properties.place}</h3>
         <hr>
         <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
         <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>`
      );
    },
  }).addTo(map);

  // Add a legend to the map
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#a3f600",
      "#dcf400",
      "#f7db11",
      "#fdb72a",
      "#fca35d",
      "#ff5f65",
    ];

    // Add legend title
    div.innerHTML = "<h4>Depth (km)</h4>";

    // Loop through depth intervals and create a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background: ${colors[i]}"></i> ` +
        `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"}<br>`;
    }

    return div;
  };

  legend.addTo(map);
});

//Part 2

// URL for tectonic plates GeoJSON data
let tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Fetch the tectonic plates data using D3
d3.json(tectonicPlatesUrl).then(function (tectonicData) {
  // Add a GeoJSON layer for tectonic plates
  let tectonicPlates = L.geoJson(tectonicData, {
    style: {
      color: "#ff5733", // Line color for tectonic plates
      weight: 2,
    },
  });

  // Add tectonic plates to the map
  tectonicPlates.addTo(map);

  // Add a layer control to switch between tectonic plates and earthquakes
  let overlays = {
    "Earthquakes": earthquakeLayer, // Earthquake layer from Part 1
    "Tectonic Plates": tectonicPlates,
  };

  L.control.layers(null, overlays, { collapsed: false }).addTo(map);
});

// Base map and earthquake data from Part 1
let earthquakeLayer = L.layerGroup();
d3.json(earthquakeUrl).then(function (data) {
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleMarker,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<h3>${feature.properties.place}</h3>
         <hr>
         <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
         <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>`
      );
    },
  }).addTo(earthquakeLayer);
  earthquakeLayer.addTo(map);
});