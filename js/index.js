/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
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
    style: () => {
      return {
        color: '#496a84',
        weight: 2,
        opacity: 0.6,
        fillColor: 'white',
        fillOpacity: 0,
      };
    },
  },
  'first-slide': {
    style: () => {
      return {
        color: '#496a84',
        weight: 1.6,
        opacity: 0.6,
        fillColor: 'white',
        fillOpacity: 0.1,
      };
    },
  },
  'second-slide': {
    style: () => {
      return {
        color: '#526e84',
        fillColor: 'white',
        fillOpacity: 0.1,
      };
    },
  },
  'third-slide': {
    style: () => {
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
let currentLayer = null;

function clearMapLayer() {
  if (currentLayer) {
    map.removeLayer(currentLayer);
    currentLayer = null;
  }
}
