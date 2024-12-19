import { SlideDeck } from './slidedeck.js';

let currentIndex = 0;
const carouselItems = document.querySelectorAll('.carousel-item');
const totalItems = carouselItems.length;

function showItem(index) {
    carouselItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function nextItem() {
    currentIndex = (currentIndex + 1) % totalItems;
    showItem(currentIndex);
}

setInterval(nextItem, 3600);

showItem(currentIndex);

const map = L.map('map', {scrollWheelZoom: false}).setView([0, 0], 0);

//
// Add a base layer to the map
//
const mapboxKey = 'pk.eyJ1IjoiamppaXl5IiwiYSI6ImNtMHlidTN1cDBtNnEybHBzYWRpYzFxNXIifQ.2iHj6INb3fqTB_zAkGrlpg';
const mapboxStyle = 'mapbox/light-v11';

// ## The Base Tile Layer
const baseLayer = L.tileLayer(
  `https://api.mapbox.com/styles/v1/${mapboxStyle}/tiles/512/{z}/{x}/{y}{r}?access_token=${mapboxKey}`, {
    tileSize: 512,
    zoomOffset: -1,
    detectRetina: true,
    maxZoom: 14,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });
baseLayer.addTo(map);

// ## Interface Elements
const container = document.querySelector('.slide-section');
const slides = document.querySelectorAll('.slide');

const slideOptions = {
  'title-slide': {
    style: (feature) => {
      return {
        color: '#496a84',
        weight: 1,
        opacity:0.6,
        fillColor: 'white', 
        fillOpacity: 0,
      };
    },
  },
  'first-slide':{
    style:(feature) => {
      return{
        color: '#496a84',
        weight: 1.6,
        opacity:0.6,
        fillColor: 'white', 
        fillOpacity: 0.1,
      }
    }
  },
  'second-slide': {
    style: (feature) => {
      return {
        color: '#526e84',
        fillColor: 'white',
        fillOpacity: 0.1,
      };
    },
  },
  'third-slide': {
    style: (feature) => {
      return {
        color: 'blue',
        fillColor: 'yellow',
        fillOpacity: 0.5,
      };
    },
  },
};

// ## The SlideDeck object
const deck = new SlideDeck(container, slides, map, slideOptions);

document.addEventListener('scroll', () => deck.calcCurrentSlideIndex());

deck.preloadFeatureCollections();
deck.syncMapToCurrentSlide();

// slides from title
let currentLayer = null; // Track active GeoJSON layer

function clearMapLayer() {
  if (currentLayer) {
    map.removeLayer(currentLayer); // Remove previous layer
    currentLayer = null; // Reset the currentLayer variable
  }
}

// Load Title Slide
function loadTitleSlide() {
  fetch('data/title-slide.json')
    .then((response) => response.json())
    .then((data) => {
      clearMapLayer(); 

      currentLayer = L.geoJSON(data, {
        style: {
          color: '#526e84',
          weight: 0.2,
          fillOpacity: 0.0,
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.NAME) {
            layer.bindTooltip(feature.properties.NAME, {
              permanent: false,
              direction: 'center',
              className: 'custom-tooltip',
            });
          }
        },
      }).addTo(map);

      map.fitBounds(currentLayer.getBounds()); // Zoom to Denmark
    });
}

// Load First Slide with Copenhagen Districts
function loadFirstSlide() {
  fetch('data/first-slide.json') // Load the GeoJSON for First Slide
    .then((response) => response.json()) // Parse the JSON
    .then((data) => {
      clearMapLayer(); // Properly clear Title Slide layers and tooltips

      // Add Copenhagen District GeoJSON layer
      currentLayer = L.geoJSON(data, {
        style: (feature) => {
          return feature.properties.style || {
            color: '#526e84',   // Default boundary color
            weight: 0.5,        // Border thickness
            fillOpacity: 0.0,   // No fill for districts
          };
        },
        onEachFeature: (feature, layer) => {
          // Bind tooltip ONCE for district names ('navn')
          if (feature.properties && feature.properties.navn) {
            layer.bindTooltip(feature.properties.navn, {
              direction: 'center',
              className: 'custom-tooltip',
              sticky: true, // Tooltip follows the cursor
            });
          }

          // Add highlight effect on mouseover
          layer.on({
            mouseover: (e) => {
              const target = e.target;
              target.setStyle({
                weight: 2,
                color: '#ff7800', // Highlight color
                fillOpacity: 0.2,
              });
              target.bringToFront();
            },
            mouseout: (e) => {
              currentLayer.resetStyle(e.target); // Reset style on mouseout
            },
          });
        },
      }).addTo(map);

      // Fit the map to show all the districts
      map.fitBounds(currentLayer.getBounds());
    })
    .catch((error) => console.error('Error loading First Slide GeoJSON:', error));
}



// 7th
function loadLastSlide() {
  clearMapLayer(); // Clear previous layers
  fetch('data/seventh-slide.json')
    .then((response) => response.json())
    .then((data) => {
      currentLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng);
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.image && feature.properties.label) {
            const popupContent = `
              <div style="text-align: center;">
                <strong>${feature.properties.label}</strong><br>
                <img src="${feature.properties.image}" 
                     alt="${feature.properties.label}" 
                     style="width: 200px; height: auto; border-radius: 8px; margin-top: 5px;">
              </div>
            `;
            layer.bindPopup(popupContent);
          }
        }
      }).addTo(map);
      map.fitBounds(currentLayer.getBounds());
    });
}
