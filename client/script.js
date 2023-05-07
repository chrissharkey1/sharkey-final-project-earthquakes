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

function dateToEpoch(date) {
  return Date.parse(date);
}

function filterCircles(geoMap, array, afterQuery, beforeQuery, aboveQuery, belowQuery) {
  newArray = [];
  console.log('filterCircles');
  array.filter((item) => {
    if (item.properties.mag >= aboveQuery && item.properties.mag <= belowQuery && item.properties.time >= afterQuery && item.properties.time <= beforeQuery) { // 
      newArray.push(item);
    }
  });
  placeCircle(newArray, geoMap);
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
  console.log('elements type', typeof elements);
//  localStorage.setItem('storedData', JSON.stringify(elements));
//  const storedData = localStorage.getItem('storedData');
//  console.log('storedData type', typeof storedData)
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
      afterQuery = dateToEpoch(afterText);
      console.log('after', afterQuery);
    } else {
      afterQuery = -12685939200000; //Jan 1 1568 is the first date in the dataset
    }
    if (beforeText.length != 0) {
      beforeQuery = dateToEpoch(beforeText);
      console.log('before', beforeQuery);
    } else {
      beforeQuery = Math.floor(Date.now());
    }
    if (aboveText.length != 0) {
      aboveQuery = aboveText;
    } else {
      aboveQuery = -2; //-1.4 is the min magnitude, but smaller magnitudes can be recorded in the future
    }
    if (belowText.length != 0) {
      belowQuery = belowText;
    } else {
      belowQuery = 10; //7.1 is the max magnitude, but larger magnitudes can be recorded in the future
    }
    filterCircles(geoMap, elements, afterQuery, beforeQuery, aboveQuery, belowQuery);
    //call with 'elements' as array
  });

  resetButton.addEventListener("click", (event) => {
    filterCircles('', '', '', '', geoMap);
    var textInputs = document.querySelectorAll('input');
    textInputs.forEach(input => input.value = '');
});
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());
