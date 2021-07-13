// https://stackoverflow.com/questions/42401606/how-to-hide-collapsible-bootstrap-navbar-on-click
const menuToggle = document.getElementById('navbarNavBwr');
const navLinks = menuToggle.querySelectorAll('li.nav-item:not(.dropdown)');
if (menuToggle) {
  const bsCollapse = new bootstrap.Collapse(menuToggle, {toggle:false})
  navLinks.forEach((l) => {
    l.addEventListener('click', () => { 
      if (menuToggle.classList.contains('show')) { bsCollapse.toggle(); } 
    });
  })
}
// Local variables
const mapMarkers = {
  drink: getMarker('fa-coffee', 'red', 'circle', 'fas'),
  food: getMarker('fa-utensils', 'green', 'circle', 'fas'),
  bed: getMarker('fa-bed', 'blue', 'circle', 'fas')
};
const maps = [];
const placeLayers = [];

const mapDivs = document.querySelectorAll("div.map");
mapDivs.forEach(initMap);

function initMap(mapDiv, mapIndex) {

  // Tile Layers
  const tileLayers = {
    MapBox: L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
              attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              maxZoom: 18,
              id: 'mapbox/streets-v11',
              tileSize: 512,
              zoomOffset: -1,
              accessToken: 'pk.eyJ1IjoiaWFucGVycmluIiwiYSI6ImNrYWprc3V4bTA3dGsyeW82MGd5NDQ0M2gifQ.dexk2uljVBH4o5FoxuAYoQ'
            })
  }

  // Init Map
  const mapOptions = {
    scrollWheelZoom: false,
    "tap": false   // see bug https://github.com/Leaflet/Leaflet/issues/7255
  };
  maps[mapIndex] = L.map(mapDiv.id, mapOptions)
    .addLayer(tileLayers.MapBox);
//    .on('popupopen', function(e) { //alert(e.popup._source._popup._content); });

  // Route Layer
  const routeGeoJson = `/assets/data/bwr-trip-${mapIndex + 1}.json`;
  const routeOptions = { 
    style: getStyle 
  };
  const route = new L.geoJSON.ajax( routeGeoJson, routeOptions );
  route.on("data:loaded", function() {
    maps[mapIndex].fitBounds(route.getBounds().pad(0.1))
      .setMaxBounds(route.getBounds().pad(0.1))
      .setMinZoom(maps[mapIndex].getZoom());
  }).addTo(maps[mapIndex]);

  // Places Layer 
  const placeDivs = document.querySelectorAll(`div#bwr-trip-${mapIndex + 1} div.card[data-latlng]`);

  placeDivs.forEach((placeDiv, placeIndex) => {
    // Do stuff here
    //console.log(placeIndex, placeDiv.dataset);
  });

  if (placeDivs) { 
    placeLayers[mapIndex] = L.featureGroup().addTo(maps[mapIndex]);
    for (let placeIndex = 0; placeIndex < placeDivs.length; placeIndex++) {
      const placeData = placeDivs[placeIndex].dataset;
      const marker = L.marker(JSON.parse(placeData.latlng), { icon: mapMarkers[placeData.type] })
        .bindPopup(getPopupText(placeData.name, placeData.location))
        .on('popupopen', function(e) { 
          document.getElementById(`bwr-trip-${mapIndex + 1}-place-${placeIndex + 1}`).scrollIntoView(false)
        })
        .addTo(placeLayers[mapIndex]);

//      placeLayers[mapIndex].addLayer(marker);
    }
    // const placesOverlay = {'Places': placeLayers[i]};
    // L.control.layers(null, placesOverlay).addTo(maps[i]);
    //maps[i].fitBounds(placeLayers[i].getBounds())
  }
};



// Map Events

// Helper functions
function getStyle(geoJsonFeature) {
  // http://leafletjs.com/reference.html#geojson-style
  const geoJsonStyle = {
    color: geoJsonFeature.properties.stroke
  };
  return geoJsonStyle;
}
function getPopupText(title, subTitle) {
  const popupText =  `<strong>${title}</strong><br /><em>${subTitle}</em><br />`;
  return popupText;
}
function getMarker(icon = '', markerColor = 'blue', shape = 'circle', prefix = 'glyphicon') {
  const marker =  L.ExtraMarkers.icon({
    icon: icon,
    markerColor: markerColor,
    shape: shape,
    prefix: prefix
  });
  return marker;
}

