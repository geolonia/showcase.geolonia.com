import { Deck } from '@deck.gl/core'
import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers'

import './app.scss'

const air_ports = './airports.geojson'

const config = {
  latitude: 37.092,
  longitude: 138.219,
  zoom: 6,
  bearing: 0,
  pitch: 60,
}

// Mapbox GL JS 用のスタイルを定義
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

// 地図用のコンテナーを初期化
const mainContainer = document.getElementById('showcase-container')
const mapContainer = document.createElement('div')
mapContainer.dataset.navigationControl = 'off'
mainContainer.appendChild(mapContainer)

// Deck.GL 用のコンテナーを初期化
const deckContainer = document.createElement('div')
const deckCanvas = document.createElement('canvas')
deckContainer.appendChild(deckCanvas)
mainContainer.appendChild(deckContainer)

// 地図を設置
const map = new window.geolonia.Map({
  container: mapContainer,
  style: style,
  interactive: true,
  center: [config.longitude, config.latitude],
  zoom: config.zoom,
  bearing: config.bearing,
  pitch: config.pitch,
})

// 空港の GeoJSON を取得して Deck.GL のレイヤーを設置
fetch(air_ports).then(res => {
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
      pickable: true,
      autoHighlight: true,
    }),
  ]

  for (let i = 0; i < data.features.length; i++) {
    const airport = data.features[i]
    if ('cf04_00030' !== airport.properties.C28_000) {
      continue // 羽田以外は除外
    }
    const arc = new ArcLayer({
      id: `arcs-${i}`,
      data: air_ports,
      greatCircle: true,
      wrapLongitude: true,
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
    canvas: deckCanvas,
    width: '100%',
    height: '100%',
    initialViewState: config,
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
