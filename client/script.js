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

function placeCircle(array, map) {
  map.eachLayer((layer) => {
      if (layer instanceof L.Circle) {
        layer.remove();
      }
    });

  array.forEach((item) => {
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

async function filterCircles(afterQuery, beforeQuery, aboveQuery, belowQuery, geoMap) {
  const queriedResults = await fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson' 
    + afterQuery + beforeQuery + aboveQuery + belowQuery);
  const newData = await queriedResults.json();
  newElements = newData.features;
  placeCircle(newElements, geoMap);  
}

var afterQuery = '';
var beforeQuery = '';
var aboveQuery = '';
var belowQuery = '';

//main async function
async function mainEvent() {
  const filterButton = document.querySelector("#filter_button");
  const textAfter = document.querySelector('#after');
  const textBefore = document.querySelector('#before');
  const textMagAbove = document.querySelector('#above');
  const textMagBelow = document.querySelector('#below');
  const resetButton = document.querySelector('#reset_button');

  var afterText = '';
  var beforeText = '';
  var aboveText = '';
  var belowText = '';

  let geoMap = initMap();

  
  const results = await fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson');
  const currentData = await results.json();
  console.log(typeof currentData);

  elements = currentData.features;

  placeCircle(elements, geoMap);


  textAfter.addEventListener('input', (event) => {
    afterText = event.target.value;
  });

  textBefore.addEventListener('input', (event) => {
    beforeText = event.target.value;
  });

  textMagAbove.addEventListener('input', (event) => {
    aboveText = event.target.value;
  });

  textMagBelow.addEventListener('input', (event) => {
    belowText = event.target.value;
  });

  //filterButton filters off of the API URL querying, may need to adjust later
  filterButton.addEventListener('click', (event) => {
    if (afterText.length != 0) {
      afterQuery = '&starttime=' + afterText;
    }
    if (beforeText.length != 0) {
      beforeQuery = '&endtime=' + beforeText;
    }
    if (aboveText.length != 0) {
      aboveQuery = '&minmagnitude=' + aboveText;
    }
    if (belowText.length != 0) {
      belowQuery = '&maxmagnitude=' + belowText;
    }
    filterCircles(afterQuery, beforeQuery, aboveQuery, belowQuery, geoMap);
  });

  resetButton.addEventListener("click", (event) => {
    filterCircles('', '', '', '', geoMap);
    var textInputs = document.querySelectorAll('input');
    textInputs.forEach(input => input.value = '');
});
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());
