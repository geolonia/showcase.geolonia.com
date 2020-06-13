import { Deck } from '@deck.gl/core'
import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers'

import './app.scss'

const INITIAL_VIEW_STATE = {
  latitude: 37.092,
  longitude: 138.219,
  zoom: 6,
  bearing: 0,
  pitch: 60,
}

const backgroundColor = '#111111'
const waterColor = '#000000'
const borderColor = '#555555'

const style = {
  version: 8,
  sources: {
    geolonia: {
      type: 'vector',
      url: 'https://geolonia.github.io/tiny-tileserver/tiles.json',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': backgroundColor,
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'geolonia',
      'source-layer': 'water',
      filter: [
        '==',
        '$type',
        'Polygon',
      ],
      layout: {
        visibility: 'visible',
      },
      paint: {
        'fill-color': waterColor,
        'fill-antialias': true,
      },
    },
    {
      id: 'water-outline',
      type: 'line',
      source: 'geolonia',
      'source-layer': 'water',
      filter: [
        '==',
        '$type',
        'Polygon',
      ],
      layout: {
        visibility: 'visible',
      },
      paint: {
        'line-color': borderColor,
        'line-width': 1,
        'line-blur': 0.4,
      },
    },
    {
      id: 'boundary-state',
      type: 'line',
      source: 'geolonia',
      'source-layer': 'boundary',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
        visibility: 'visible',
      },
      paint: {
        'line-color': borderColor,
        'line-width': 1,
        'line-blur': 0.4,
      },
    },
    {
      id: 'boundary-country',
      type: 'line',
      source: 'geolonia',
      'source-layer': 'boundary',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': borderColor,
        'line-width': 1,
        'line-blur': 0.4,
      },
    },
  ],
}

const map = new window.geolonia.Map({
  container: '#map',
  style: style,
  interactive: true,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  bearing: INITIAL_VIEW_STATE.bearing,
  pitch: INITIAL_VIEW_STATE.pitch,
})
