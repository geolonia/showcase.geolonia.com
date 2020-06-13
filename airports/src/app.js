import { Deck } from '@deck.gl/core'
import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers'

import './app.scss'

const AIR_PORTS = './airports.geojson'

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

fetch(AIR_PORTS).then(res => {
  return res.json()
}).then(data => {
  const layers = [
    new GeoJsonLayer({
      id: 'airports',
      data: data,
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getRadius: () => 5,
      getFillColor: [200, 0, 80, 180],
      pickable: false,
      autoHighlight: false,
    }),
  ]

  for (let i = 0; i < data.features.length; i++) {
    const airport = data.features[i]
    if ('cf04_00030' !== airport.properties.C28_000) {
      continue // 羽田以外は除外
    }
    const arc = new ArcLayer({
      id: `arcs-${i}`,
      data: AIR_PORTS,
      dataTransform: d => {
        return d.features
      },
      getSourcePosition: () => airport.geometry.coordinates,
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [255, 255, 100],
      getTargetColor: [200, 0, 80],
      getWidth: 1,
    })

    layers.push(arc)
  }

  new Deck({
    canvas: 'deck-canvas',
    width: '100%',
    height: '100%',
    initialViewState: INITIAL_VIEW_STATE,
    controller: true,
    onViewStateChange: ({ viewState }) => {
      map.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        bearing: viewState.bearing,
        pitch: viewState.pitch,
      })
    },
    layers: layers,
  })
})
