//initializes map from Leaflet
function initMap() {
  const geoMap = L.map("map").setView([0, 0], 1);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 15,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(geoMap);
  return geoMap;
}

function placeMarker(array, map) {
  console.log('array for markers', array);

  map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });

  array.forEach((item) => {
      console.log('placeMarker', item);
      const {coordinates} = item.geometry;
      const magnitude = item.properties.mag;

      //adjusts magnitude to be judged by size on map
      adjustedMagnitude = magnitude * 25000;

      //adjusts fillOpacity based on magnitude -> -1.4 is the min magnitude in the JSON, max is 7.1
      adjustedFill = (magnitude + 1.5) / 8.6;

      const circle = L.circle([coordinates[1], coordinates[0]], {
        color: 'red',
        fillColor: 'black',
        fillOpacity: adjustedFill,
        radius: adjustedMagnitude,
      }).addTo(map);
  })
}

//main async function
async function mainEvent() {
  const filterButton = document.querySelector("#filter_button");
  const textAfter = document.querySelector('#after');
  const textBefore = document.querySelector('#before');
  const textMagAbove = document.querySelector('#above');
  const textMagBelow = document.querySelector('#below');

  const geoMap = initMap();

  const results = await fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02');
  const currentData = await results.json();
  console.log(typeof currentData);

  elements = currentData.features;

  placeMarker(elements, geoMap);
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());
