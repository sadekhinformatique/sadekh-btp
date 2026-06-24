'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Map, { Source, Layer, Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import { t, formatPrice, type Lang } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Building2, Home, FileText, Navigation } from 'lucide-react';

interface Property {
  id: string;
  type: string;
  title: string;
  price: number;
  isPremium: boolean;
  surfaceM2: number | null;
  rooms: number | null;
  quartier: string;
  city: string;
  images: string[];
  user: { profile: { fullName: string | null; verified: boolean } | null };
}

interface MapViewProps {
  properties: Property[];
  lang: Lang;
  onPropertyClick: (p: Property) => void;
}

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const TYPE_COLORS_MAP: Record<string, string> = {
  maison: '#df2531',
  appartement: '#555555',
  terrain: '#888888',
  plan: '#333333',
};

const clusterLayer: any = {
  id: 'clusters',
  type: 'circle',
  source: 'properties',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#df2531', 10, '#888888', 50, '#333333'],
    'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 30],
    'circle-stroke-width': 3,
    'circle-stroke-color': '#ffffff',
  },
};

const clusterCountLayer: any = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'properties',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 13,
  },
  paint: {
    'text-color': '#ffffff',
  },
};

const unclusteredPointLayer: any = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'properties',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': ['get', 'color'],
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
};

function PinMarker({ property, onClick }: { property: Property; onClick: () => void }) {
  const color = TYPE_COLORS_MAP[property.type] || '#df2531';
  const icons: Record<string, React.ReactNode> = {
    maison: <Home className="w-3 h-3" />,
    appartement: <Building2 className="w-3 h-3" />,
    terrain: <MapPin className="w-3 h-3" />,
    plan: <FileText className="w-3 h-3" />,
  };

  return (
    <div onClick={onClick} className="cursor-pointer group">
      <div
        className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125"
        style={{ backgroundColor: color }}
      >
        <span className="text-white">{icons[property.type]}</span>
        {property.isPremium && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border border-white flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">★</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapView({ properties, lang, onPropertyClick }: MapViewProps) {
  const [viewState, setViewState] = useState({
    latitude: 14.6937,
    longitude: -17.4441,
    zoom: 11,
  });
  const [popupInfo, setPopupInfo] = useState<Property | null>(null);
  const [mapStyle, setMapStyle] = useState(LIGHT_STYLE);
  const mapRef = useRef<any>(null);

  const geojsonFeatures = properties
    .filter((p) => p.lat && p.lng)
    .map((p) => ({
      type: 'Feature' as const,
      properties: { ...p, color: TYPE_COLORS_MAP[p.type] || '#df2531' },
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
    }));

  const geojson: any = { type: 'FeatureCollection', features: geojsonFeatures };

  const onClusterClick = useCallback((event: any) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const features = map.queryRenderedFeatures(event.point, { layers: ['clusters'] });
    const clusterId = features[0]?.properties?.cluster_id;
    if (!clusterId) return;
    const source = map.getSource('properties') as any;
    source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
      if (err) return;
      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom,
        duration: 500,
      });
    });
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        mapLib={import('maplibre-gl')}
        onClick={onClusterClick}
      >
        {geojsonFeatures.length > 0 && (
          <Source id="properties" type="geojson" data={geojson} cluster={true} clusterMaxZoom={14} clusterRadius={50}>
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />
          </Source>
        )}

        {/* Individual markers for more control */}
        {properties.filter((p) => p.lat && p.lng).map((p) => (
          <Marker key={p.id} longitude={p.lng!} latitude={p.lat!} anchor="bottom">
            <PinMarker property={p} onClick={() => setPopupInfo(p)} />
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            longitude={popupInfo.lng!}
            latitude={popupInfo.lat!}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            className="map-popup"
            maxWidth="280px"
            closeOnClick={false}
          >
            <div className="bg-card rounded-xl overflow-hidden shadow-xl border border-border">
              <img
                src={popupInfo.images[0] || '/logo-sadekh.png'}
                alt={popupInfo.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ${TYPE_COLORS_MAP[popupInfo.type] ? '' : ''}`}
                    style={TYPE_COLORS_MAP[popupInfo.type] ? { backgroundColor: TYPE_COLORS_MAP[popupInfo.type] + '20', color: TYPE_COLORS_MAP[popupInfo.type] } : {}}>
                    {t(`filter.${popupInfo.type}`, lang)}
                  </Badge>
                  {popupInfo.isPremium && <span className="text-amber-500 text-xs">★ Premium</span>}
                </div>
                <h4 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">{popupInfo.title}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" /> {popupInfo.quartier}, {popupInfo.city || popupInfo.region}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-primary">{formatPrice(popupInfo.price, lang)}</span>
                  <Button size="sm" className="h-7 text-xs" onClick={() => { onPropertyClick(popupInfo); setPopupInfo(null); }}>
                    Voir
                  </Button>
                </div>
              </div>
            </div>
          </Popup>
        )}

        <NavigationControl position="top-right" />
        <GeolocateControl position="bottom-right" />
      </Map>

      {/* Map style toggle */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <button
          onClick={() => setMapStyle(LIGHT_STYLE)}
          className={`w-8 h-8 rounded-full border-2 shadow-md flex items-center justify-center text-xs font-bold ${mapStyle === LIGHT_STYLE ? 'border-primary bg-primary text-primary-foreground' : 'border-white bg-white text-gray-600'}`}
        >
          L
        </button>
        <button
          onClick={() => setMapStyle(MAP_STYLE)}
          className={`w-8 h-8 rounded-full border-2 shadow-md flex items-center justify-center text-xs font-bold ${mapStyle === MAP_STYLE ? 'border-primary bg-primary text-primary-foreground' : 'border-white bg-white text-gray-600'}`}
        >
          D
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-16 left-4 z-10 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-md border border-border">
        <div className="text-xs font-semibold mb-2">Légende</div>
        {Object.entries(TYPE_COLORS_MAP).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs">{t(`filter.${type}`, lang)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}