// Local variables
const mapMarkers = {
  drink: getMarker("fa-coffee", "red", "circle", "fas"),
  food: getMarker("fa-utensils", "green", "circle", "fas"),
  bed: getMarker("fa-bed", "blue", "circle", "fas")
};
const maps = [];
const placeLayers = [];
const mapDivs = document.querySelectorAll("div.map");

// Lazy-loading - https://consto.uk/2018/09/10/lazy-loading-images-the-jekyll-way
let observer;
function onIntersection(entries) {
  entries.forEach((entry) => {
    if (entry.intersectionRatio > 0) {
      initMap(entry.target); // Load map
      observer.unobserve(entry.target); // Stop watching
      console.log("Unobserving map", entry.target.id);
    }
  });
}
if ("IntersectionObserver" in window) {
  console.log("set up IntersectionObserver");
  observer = new IntersectionObserver(onIntersection, { rootMargin: "250px" });
  mapDivs.forEach((mapDiv) => {
    if (
      typeof mapDiv === "object" &&
      "classList" in mapDiv &&
      !mapDiv.classList.contains("lazy-loaded") &&
      !mapDiv.classList.contains("lazy-error")
    ) {
      console.log("Observing map", mapDiv.id);
      observer.observe(mapDiv);
    }
  });
} else {
  console.log("no observer");
  mapDivs.forEach(initMap);
}

// Load Map
function initMap(mapDiv) {
  console.log("loading map:", mapDiv.id);
  const mapIndex = mapDiv.id.split("-")[1];
  // Tile Layers
  const tileLayers = {
    MapBox: L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a>, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        maxZoom: 18,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          "pk.eyJ1IjoiaWFucGVycmluIiwiYSI6ImNrcmY1NXM2ZDA0ZXUyeGt3b29iZm56NTkifQ.ZzoGHO0lnc5aX4FK5xvO8Q"
      }
    )
  };

  // Init Map
  const mapOptions = {
    scrollWheelZoom: false,
    tap: false // see bug https://github.com/Leaflet/Leaflet/issues/7255
  };
  maps[mapIndex] = L.map(mapDiv.id, mapOptions).addLayer(tileLayers.MapBox);
  maps[mapIndex].attributionControl.setPrefix();

  // Route Layer
  const routeGeoJson = `/assets/data/bwr-trip-${mapIndex}.json`;
  const routeOptions = {
    style: getStyle
  };
  const route = new L.geoJSON.ajax(routeGeoJson, routeOptions);
  route
    .on("data:loaded", function () {
      maps[mapIndex]
        .fitBounds(route.getBounds().pad(0.1))
        .setMaxBounds(route.getBounds().pad(0.1))
        .setMinZoom(maps[mapIndex].getZoom());
    })
    .addTo(maps[mapIndex]);

  // Places Layer
  const placeDivs = document.querySelectorAll(
    `div#bwr-trip-${mapIndex} div.card[data-latlng]`
  );

  placeDivs.forEach((placeDiv, placeIndex) => {
    // Do stuff here
    //console.log(placeIndex, placeDiv.dataset);
  });

  if (placeDivs) {
    placeLayers[mapIndex] = L.featureGroup().addTo(maps[mapIndex]);
    for (let placeIndex = 0; placeIndex < placeDivs.length; placeIndex++) {
      const placeData = placeDivs[placeIndex].dataset;
      const marker = L.marker(JSON.parse(placeData.latlng), {
        icon: mapMarkers[placeData.type]
      })
        .bindPopup(getPopupText(placeData.name, placeData.location))
        .on("popupopen", function (e) {
          document
            .getElementById(`bwr-trip-${mapIndex}-place-${placeIndex + 1}`)
            .scrollIntoView(false);
        })
        .addTo(placeLayers[mapIndex]);

      //      placeLayers[mapIndex].addLayer(marker);
    }
    // const placesOverlay = {'Places': placeLayers[i]};
    // L.control.layers(null, placesOverlay).addTo(maps[i]);
    //maps[i].fitBounds(placeLayers[i].getBounds())
  }
}

// Helper functions
function getStyle(geoJsonFeature) {
  // http://leafletjs.com/reference.html#geojson-style
  const geoJsonStyle = {
    color: geoJsonFeature.properties.stroke
  };
  return geoJsonStyle;
}
function getPopupText(title, subTitle) {
  const popupText = `<strong>${title}</strong><br /><em>${subTitle}</em><br />`;
  return popupText;
}
function getMarker(
  icon = "",
  markerColor = "blue",
  shape = "circle",
  prefix = "glyphicon"
) {
  const marker = L.ExtraMarkers.icon({
    icon: icon,
    markerColor: markerColor,
    shape: shape,
    prefix: prefix
  });
  return marker;
}
