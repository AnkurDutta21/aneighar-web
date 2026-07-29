/// <reference types="google.maps" />
/**
 * LocationPicker — rich location selection component for Add/Edit PG form
 *
 * Features:
 * - Google Places Autocomplete (addresses, landmarks, Plus Codes like P473+7HW)
 * - "Use My Location" GPS detection + reverse geocoding → auto-fills all fields
 * - Interactive draggable map marker for fine-tuning
 * - Click anywhere on map to drop a pin
 * - All address fields auto-filled from geocoding result
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LocationResult {
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value?: { lat?: number; lng?: number };
  onChange: (result: LocationResult) => void;
  className?: string;
}

// ─── Geocoding helpers ────────────────────────────────────────────────────────

type GeocoderAddressComponent = google.maps.GeocoderAddressComponent;
type GeocoderResult = google.maps.GeocoderResult;

function extractComp(components: GeocoderAddressComponent[], type: string): string {
  return components.find((c) => c.types.includes(type))?.long_name ?? '';
}

function parseGeocodeResult(res: GeocoderResult): Omit<LocationResult, 'lat' | 'lng'> {
  const comps = res.address_components;
  const streetNum = extractComp(comps, 'street_number');
  const route = extractComp(comps, 'route');
  const sub1 = extractComp(comps, 'sublocality_level_1') || extractComp(comps, 'sublocality');
  const address =
    [streetNum, route, sub1].filter(Boolean).join(', ') ||
    res.formatted_address.split(',')[0];
  const city =
    extractComp(comps, 'locality') ||
    extractComp(comps, 'administrative_area_level_3') ||
    extractComp(comps, 'administrative_area_level_2');
  const state = extractComp(comps, 'administrative_area_level_1');
  const pincode = extractComp(comps, 'postal_code');
  return { address, city, state, pincode };
}

// ─── Marker overlay — must live inside <Map> to call useMap() ────────────────

interface MarkerOverlayProps {
  markerPos: google.maps.LatLngLiteral | null;
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  onDragEnd: (lat: number, lng: number) => void;
}

function MarkerOverlay({ markerPos, mapRef, onDragEnd }: MarkerOverlayProps) {
  const map = useMap('location-picker-map');
  // Store the map instance in the ref so the parent can call panTo/setZoom
  useEffect(() => {
    if (map) mapRef.current = map;
  }, [map, mapRef]);

  if (!markerPos) return null;
  return (
    <AdvancedMarker
      position={markerPos}
      draggable={true}
      onDragEnd={(e: google.maps.MapMouseEvent) => {
        if (e.latLng) onDragEnd(e.latLng.lat(), e.latLng.lng());
      }}
      title="Drag to fine-tune location"
    />
  );
}

// ─── LocationPicker ───────────────────────────────────────────────────────────

export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const geocodingLib = useMapsLibrary('geocoding');
  const placesLib = useMapsLibrary('places');

  const mapRef = useRef<google.maps.Map | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geocoderRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionTokenRef = useRef<any>(null);

  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(
    value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : null
  );
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);
  const [error, setError] = useState('');

  // Initialise geocoder + places services
  useEffect(() => {
    if (geocodingLib) geocoderRef.current = new geocodingLib.Geocoder();
  }, [geocodingLib]);

  useEffect(() => {
    if (placesLib) {
      autocompleteRef.current = new placesLib.AutocompleteService();
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    }
  }, [placesLib]);

  // Places autocomplete with debounce
  useEffect(() => {
    const val = searchInput.trim();
    if (!val || val.length < 3 || !autocompleteRef.current) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      autocompleteRef.current.getPlacePredictions(
        {
          input: val,
          sessionToken: sessionTokenRef.current,
          componentRestrictions: { country: 'in' },
        },
        (preds: google.maps.places.AutocompletePrediction[] | null, status: string) => {
          if (status === 'OK' && preds) {
            setSuggestions(preds);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        }
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Geocode and apply result
  const geocodeAndApply = useCallback(
    async (request: google.maps.GeocoderRequest) => {
      if (!geocoderRef.current) return;
      setIsLoadingGeocode(true);
      setError('');
      try {
        const result = await geocoderRef.current.geocode(request);
        if (!result.results?.length) {
          setError('Could not find that location. Try a different address or Plus Code.');
          return;
        }
        const res: GeocoderResult = result.results[0];
        const lat = res.geometry.location.lat();
        const lng = res.geometry.location.lng();
        const parsed = parseGeocodeResult(res);
        setMarkerPos({ lat, lng });
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(17);
        }
        onChange({ ...parsed, lat, lng });
        // Rotate session token for billing efficiency
        if (placesLib) sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
      } catch {
        setError('Failed to resolve location. Please try again.');
      } finally {
        setIsLoadingGeocode(false);
      }
    },
    [onChange, placesLib]
  );

  // Select a Places suggestion
  const selectSuggestion = (pred: google.maps.places.AutocompletePrediction) => {
    setSearchInput(pred.description);
    setSuggestions([]);
    setShowSuggestions(false);
    geocodeAndApply({ placeId: pred.place_id, region: 'IN' });
  };

  // GPS "Use My Location"
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoadingGPS(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await geocodeAndApply({ location: { lat: coords.latitude, lng: coords.longitude } });
        setIsLoadingGPS(false);
      },
      (err) => {
        setIsLoadingGPS(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access denied. Allow it in your browser settings.'
            : 'Could not get your location. Please search manually.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Map click → drop pin
  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      if (!e.detail.latLng) return;
      const { lat, lng } = e.detail.latLng;
      setMarkerPos({ lat, lng });
      await geocodeAndApply({ location: { lat, lng } });
    },
    [geocodeAndApply]
  );

  // Marker drag end → re-geocode
  const handleMarkerDragEnd = useCallback(
    async (lat: number, lng: number) => {
      setMarkerPos({ lat, lng });
      await geocodeAndApply({ location: { lat, lng } });
    },
    [geocodeAndApply]
  );

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const mapsEnabled = API_KEY && API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  if (!mapsEnabled) {
    return (
      <div className={cn('rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center', className)}>
        <MapPin className="mx-auto mb-2 h-6 w-6 text-slate-400" />
        <p className="text-sm font-semibold text-slate-600">Google Maps not configured</p>
        <p className="mt-1 text-xs text-slate-400">
          Add <code className="rounded bg-slate-100 px-1">VITE_GOOGLE_MAPS_API_KEY</code> to your{' '}
          <code className="rounded bg-slate-100 px-1">.env</code> file.
        </p>
      </div>
    );
  }

  if (!geocodingLib || !placesLib) {
    return (
      <div
        className={cn('flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50', className)}
        style={{ height: 340 }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search + GPS row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {isLoadingGeocode
              ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              : <Search className="h-4 w-4 text-slate-400" />}
          </div>
          <input
            id="location-search"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchInput.trim()) {
                e.preventDefault();
                setSuggestions([]);
                setShowSuggestions(false);
                geocodeAndApply({ address: searchInput.trim(), region: 'IN' });
              }
              if (e.key === 'Escape') { setSuggestions([]); setShowSuggestions(false); }
            }}
            placeholder="Search address, landmark, or Plus Code (e.g. P473+7HW Jorhat)"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSuggestions([]); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
              {suggestions.map((pred) => (
                <button
                  key={pred.place_id}
                  type="button"
                  onMouseDown={() => selectSuggestion(pred)}
                  className="flex w-full items-start gap-2.5 px-4 py-3 text-left text-sm transition-colors hover:bg-blue-50"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="font-semibold text-slate-800 leading-tight">
                      {pred.structured_formatting.main_text}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {pred.structured_formatting.secondary_text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLoadingGPS}
          title="Use my current GPS location"
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200',
            isLoadingGPS
              ? 'border-blue-200 bg-blue-50 text-blue-400 cursor-not-allowed'
              : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300'
          )}
        >
          {isLoadingGPS ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          <span className="hidden sm:inline">Use My Location</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          <X className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}

      {/* Contextual hint */}
      {!markerPos && !error && (
        <p className="text-xs text-slate-400">
          💡 Search above, tap "Use My Location", or{' '}
          <span className="font-semibold text-slate-500">click on the map</span> to drop a pin.
        </p>
      )}
      {markerPos && (
        <p className="text-xs text-emerald-600 font-medium">
          📍 Location pinned — drag the marker to fine-tune, or search again to reposition.
        </p>
      )}

      {/* Interactive Map */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm" style={{ height: 300 }}>
        <Map
          id="location-picker-map"
          defaultCenter={markerPos ?? { lat: 20.5937, lng: 78.9629 }}
          defaultZoom={markerPos ? 17 : 5}
          mapId="location-picker-map"
          gestureHandling="greedy"
          style={{ width: '100%', height: '100%' }}
          onClick={handleMapClick}
        >
          <MarkerOverlay
            markerPos={markerPos}
            mapRef={mapRef}
            onDragEnd={handleMarkerDragEnd}
          />
        </Map>
      </div>
    </div>
  );
}
