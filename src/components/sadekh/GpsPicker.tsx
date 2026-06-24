'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import { Search, MapPin, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ─── Types ─── */
interface GpsPickerProps {
  lat?: number | null;
  lng?: number | null;
  onSelect: (lat: number, lng: number) => void;
  lang?: 'fr' | 'wo';
}

interface Location {
  name: string;
  lat: number;
  lng: number;
}

/* ─── Constants ─── */
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const DAKAR_CENTER = { latitude: 14.6937, longitude: -17.4441 };
const DEFAULT_ZOOM = 11;

const KNOWN_LOCATIONS: Location[] = [
  { name: 'Almadies', lat: 14.6937, lng: -17.4625 },
  { name: 'Plateau', lat: 14.6680, lng: -17.4440 },
  { name: 'Mermoz', lat: 14.6880, lng: -17.4520 },
  { name: 'Fann Hock', lat: 14.6820, lng: -17.4780 },
  { name: 'Liberté', lat: 14.6920, lng: -17.4460 },
  { name: 'Ngor', lat: 14.7250, lng: -17.5150 },
  { name: 'Yoff', lat: 14.7480, lng: -17.5050 },
  { name: 'Ouakam', lat: 14.6790, lng: -17.4840 },
  { name: 'Médina', lat: 14.6920, lng: -17.4410 },
  { name: 'Colobane', lat: 14.6850, lng: -17.4380 },
  { name: 'Parcelles Assainies', lat: 14.7040, lng: -17.4570 },
  { name: 'Diamniadio', lat: 14.7150, lng: -17.2300 },
  { name: 'Rufisque', lat: 14.7180, lng: -17.2590 },
  { name: 'Thiès', lat: 14.7930, lng: -16.9410 },
  { name: 'Saint-Louis', lat: 16.0335, lng: -16.4880 },
  { name: 'Ziguinchor', lat: 12.5830, lng: -16.2710 },
  { name: 'Kaolack', lat: 14.1580, lng: -16.0730 },
  { name: 'Saly', lat: 14.1150, lng: -16.8550 },
];

const LABELS: Record<string, Record<string, string>> = {
  fr: {
    search: 'Rechercher un quartier…',
    useLocation: 'Ma position',
    locating: 'Localisation…',
    coords: 'Coordonnées',
    noResults: 'Aucun résultat',
    locationError: 'Géolocalisation indisponible',
  },
  wo: {
    search: 'Wut saxaloon ndei sa bunt…',
    useLocation: 'Bunt bi',
    locating: 'Nangu sa bunt…',
    coords: 'Koordinaa',
    noResults: 'Mensa yaramu',
    locationError: 'Géolocalisation ndi man may',
  },
};

/* ─── Component ─── */
export default function GpsPicker({ lat, lng, onSelect, lang = 'fr' }: GpsPickerProps) {
  const t = LABELS[lang] || LABELS.fr;

  // Map view state — start at Dakar or at the provided coords
  const [viewState, setViewState] = useState({
    latitude: lat ?? DAKAR_CENTER.latitude,
    longitude: lng ?? DAKAR_CENTER.longitude,
    zoom: DEFAULT_ZOOM,
  });

  // Sync view state when lat/lng props change externally
  useEffect(() => {
    if (lat != null && lng != null) {
      setViewState((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    }
  }, [lat, lng]);

  // Marker position — controlled by props so the parent owns the source of truth
  const markerLat = lat ?? viewState.latitude;
  const markerLng = lng ?? viewState.longitude;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // Filtered locations for search dropdown
  const filteredLocations = searchQuery.trim().length > 0
    ? KNOWN_LOCATIONS.filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle map click — place marker and call onSelect
  const handleMapClick = useCallback(
    (event: any) => {
      const { lngLat } = event;
      if (lngLat) {
        onSelect(lngLat.lat, lngLat.lng);
        setViewState((prev) => ({
          ...prev,
          latitude: lngLat.lat,
          longitude: lngLat.lng,
        }));
      }
    },
    [onSelect]
  );

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback(
    (event: any) => {
      const lngLat = event.lngLat;
      if (lngLat) {
        onSelect(lngLat.lat, lngLat.lng);
        setViewState((prev) => ({
          ...prev,
          latitude: lngLat.lat,
          longitude: lngLat.lng,
        }));
      }
    },
    [onSelect]
  );

  // Handle selecting a search result
  const handleLocationSelect = useCallback(
    (loc: Location) => {
      setSearchQuery(loc.name);
      setSearchOpen(false);
      onSelect(loc.lat, loc.lng);
      setViewState((prev) => ({
        ...prev,
        latitude: loc.lat,
        longitude: loc.lng,
        zoom: 14,
      }));
    },
    [onSelect]
  );

  // "Use my location" button
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      setTimeout(() => setLocationError(false), 3000);
      return;
    }

    setLocating(true);
    setLocationError(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onSelect(latitude, longitude);
        setViewState((prev) => ({
          ...prev,
          latitude,
          longitude,
          zoom: 15,
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationError(true);
        setTimeout(() => setLocationError(false), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onSelect]);

  const hasCoords = lat != null && lng != null;

  return (
    <div className="relative w-full rounded-xl border border-border overflow-hidden shadow-sm bg-background">
      {/* ─── Search bar ─── */}
      <div ref={searchRef} className="absolute top-3 left-3 right-3 z-20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder={t.search}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-white/80 bg-white/95 backdrop-blur-sm shadow-md outline-none focus:ring-2 focus:ring-[#df2531]/40 focus:border-[#df2531]/50 placeholder:text-muted-foreground/60"
          />

          {/* Search dropdown */}
          {searchOpen && filteredLocations.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-lg border border-border max-h-48 overflow-y-auto">
              {filteredLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleLocationSelect(loc)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[#df2531]/5 transition-colors text-left"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#df2531] shrink-0" />
                  <span className="font-medium">{loc.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {searchOpen && searchQuery.trim().length > 0 && filteredLocations.length === 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-lg border border-border p-3 text-sm text-muted-foreground">
              {t.noResults}
            </div>
          )}
        </div>
      </div>

      {/* ─── Geolocation error toast ─── */}
      {locationError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm">
          {t.locationError}
        </div>
      )}

      {/* ─── Map ─── */}
      <div className="w-full" style={{ height: 350 }}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLE}
          mapLib={import('maplibre-gl')}
          onClick={handleMapClick}
          interactiveLayerIds={undefined}
        >
          {/* Draggable marker */}
          {hasCoords && (
            <Marker
              latitude={markerLat}
              longitude={markerLng}
              anchor="bottom"
              draggable
              onDragEnd={handleMarkerDragEnd}
            >
              <div className="relative flex flex-col items-center">
                {/* Pin */}
                <svg
                  width="32"
                  height="42"
                  viewBox="0 0 32 42"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-lg"
                >
                  <path
                    d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z"
                    fill="#df2531"
                  />
                  <circle cx="16" cy="15" r="6" fill="white" />
                  <circle cx="16" cy="15" r="3" fill="#df2531" />
                </svg>
                {/* Pulsing ring */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full bg-[#df2531]/30 animate-pulse" />
              </div>
            </Marker>
          )}

          <NavigationControl position="bottom-right" />
        </Map>
      </div>

      {/* ─── Bottom controls ─── */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
        {/* Coordinates badge */}
        <Badge
          variant="secondary"
          className="bg-white/95 backdrop-blur-sm shadow-md text-xs font-mono border border-border/50 px-2.5 py-1"
        >
          <MapPin className="w-3 h-3 mr-1 text-[#df2531]" />
          {hasCoords
            ? `${markerLat.toFixed(5)}, ${markerLng.toFixed(5)}`
            : '—'}
        </Badge>

        {/* "Use my location" button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={handleGeolocate}
          disabled={locating}
          className="bg-white/95 backdrop-blur-sm shadow-md border border-border/50 hover:bg-[#df2531]/10 hover:text-[#df2531] h-8 gap-1.5 text-xs font-medium"
        >
          {locating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#df2531] border-t-transparent rounded-full animate-spin" />
              {t.locating}
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5" />
              {t.useLocation}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
