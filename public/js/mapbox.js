/* eslint-disable prefer-destructuring */

/* global document */
const locations = JSON.parse(document.getElementById('map').dataset.locations);

console.log(locations);

// creates the map, passing your access token to associate it with your Mapbox account, and setting the container, initial center, and zoom level
const map = new mapboxgl.Map({
  accessToken: process.env.MAPBOX_ACCESS_TOKEN,
  style: 'mapbox://styles/nadashoukry/cmwjoc1bf00wq01r5e81g5zef',
  container: 'map', // container ID
  scrollZoom: false,
  //   first longtitude then latitude
  // center: [-71.06776, 42.35816], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  // zoom: 9, // starting zoom
  // interactive: false,
});

// the area that will be displayed on the map
const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  //create the marker element
  const markerEl = document.createElement('div');
  markerEl.className = 'marker';

  //Add the marker
  new mapboxgl.Marker({ element: markerEl, anchor: 'bottom' })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);
  //Extend the bounds to add the location
  bounds.extend(loc.coordinates);
});
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 200,
    left: 100,
    right: 100,
  },
});
