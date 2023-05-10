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

async function storeOrginalData() {
    const results = await fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=0000-01-01&endtime=2100-01-01&minmagnitude=7.5');
    const currentData = await results.json();
    localStorage.setItem('storedData', JSON.stringify(currentData));
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
      const place = item.properties.place;

      var epochSeconds = item.properties.time;
      var epochMilli = epochSeconds / 1000;
      var date = new Date(0);
      date.setUTCSeconds(epochMilli);

      //adjusts magnitude to be judged by size on map
      adjustedMagnitude = magnitude * 22000;

      //adjusts fillOpacity based on magnitude -> 7 is the min magnitude in the JSON
      adjustedFill = (magnitude + 1.5) / 12;

      const circle = L.circle([coordinates[1], coordinates[0]], {
        color: 'red',
        fillColor: 'black',
        fillOpacity: adjustedFill,
        radius: adjustedMagnitude,
      }).addTo(map);

      var popup = L.popup().setContent('(' + coordinates[1] + ', ' + coordinates[0] + ')<br> Magnitude: ' + 
        magnitude + '<br> Timestamp: ' + date + '<br> Place: ' + place);
      circle.bindPopup(popup);
      circle.on('mouseover', function (open) {
        this.openPopup();
      });
      circle.on('mouseout', function (close) {
        this.closePopup();
      });
  })
}

function dateToEpoch(date) {
  return Date.parse(date);
}

let newArray = [];

function filterCircles(geoMap, array, afterQuery, beforeQuery, aboveQuery, belowQuery) {
  newArray = [];
  console.log('filterCircles');
  array.filter((item) => {
    if (item.properties.mag >= aboveQuery && item.properties.mag <= belowQuery && item.properties.time >= afterQuery && item.properties.time <= beforeQuery) {
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
  const refreshButton = document.querySelector('#refresh_button');

  var afterText = '';
  var beforeText = '';
  var aboveText = '';
  var belowText = '';

  let geoMap = initMap();
  geoMap.setMinZoom(1);

  if (localStorage.getItem('storedData') === null) {
    storeOrginalData();
  }
  const storedData = localStorage.getItem('storedData');
  let parsedData = JSON.parse(storedData);
  elements = parsedData.features;
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
    if (aboveText.length != 0 && aboveText >= 7.5) {
      aboveQuery = aboveText;
    } else {
      aboveQuery = 7.5; //7.5 is the min magnitude
    }
    if (belowText.length != 0) {
      belowQuery = belowText;
    } else {
      belowQuery = 10;
    }
    filterCircles(geoMap, elements, afterQuery, beforeQuery, aboveQuery, belowQuery);
    //call with 'elements' as array
  });

  resetButton.addEventListener("click", async (event) => {
    storeOrginalData();
    var textInputs = document.querySelectorAll('input');
    textInputs.forEach(input => input.value = '');
    const storedData = localStorage.getItem('storedData');
    let parsedData = JSON.parse(storedData);
    elements = parsedData.features; 
    placeCircle(elements, geoMap);
  });

  refreshButton.addEventListener("click", (event) => {
    console.log(newArray);
    if (newArray.length !== 0) {
      localStorage.removeItem('storedData');
      localStorage.setItem('storedData', JSON.stringify(newArray));
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());
