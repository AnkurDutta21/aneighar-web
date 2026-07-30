import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Wifi, Wind, Car, Utensils, Tv, Shield, Star,
  Heart, BedDouble, SlidersHorizontal, X, LayoutGrid, Map as MapIcon,
  Navigation, Loader2, GraduationCap,
} from 'lucide-react';
import { usePGListings } from '@/hooks/usePG';
import { useToggleSave } from '@/hooks/useInquiry';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { PGMapView } from '@/components/maps/PGMapView';
import { formatCurrency } from '@/lib/utils';
import type { PGFilters, PGListing } from '@/types';

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-3.5 w-3.5" />,
  ac: <Wind className="h-3.5 w-3.5" />,
  parking: <Car className="h-3.5 w-3.5" />,
  meals: <Utensils className="h-3.5 w-3.5" />,
  tv: <Tv className="h-3.5 w-3.5" />,
  security: <Shield className="h-3.5 w-3.5" />,
};

function PGCard({ pg }: { pg: PGListing }) {
  const toggleSave = useToggleSave();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl premium-shadow hover:scale-[1.01]">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-50">
        {pg.images?.[0] ? (
          <>
            <img
              src={pg.images[0].url}
              alt={pg.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-100">
              <BedDouble className="h-12 w-12 text-slate-350" />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100">
            <BedDouble className="h-12 w-12 text-slate-355" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Save button */}
        {isAuthenticated && (
          <button
            onClick={() => toggleSave.mutate(pg._id)}
            className="absolute right-3 top-3 rounded-full p-2 bg-white/95 text-slate-400 hover:text-red-500 shadow-sm transition-colors"
            id={`save-${pg._id}`}
          >
            <Heart className="h-4 w-4" />
          </button>
        )}
        {/* Map pin badge — shows when coordinates exist */}
        {pg.location.coordinates?.lat && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              <MapPin className="h-2.5 w-2.5" /> On Map
            </span>
          </div>
        )}
        {/* Gender badge & Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <Badge variant={pg.genderPreference === 'female' ? 'success' : pg.genderPreference === 'male' ? 'default' : 'outline'}>
            {pg.genderPreference === 'any' ? '👥 Co-ed' : pg.genderPreference === 'male' ? '♂ Males' : '♀ Females'}
          </Badge>
          {Boolean(pg.ratingAverage) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[11px] font-extrabold text-amber-700 shadow-sm border border-amber-200">
              <Star className="h-3 w-3 fill-current text-amber-400" />
              {pg.ratingAverage}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <Badge variant={pg.availableRooms > 0 ? 'success' : 'destructive'}>
            {pg.availableRooms > 0 ? `${pg.availableRooms} available` : 'Full'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{pg.title}</h3>
          <span className="shrink-0 text-lg font-bold text-blue-600">
            {formatCurrency(pg.rent)}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </span>
        </div>
        <div className="mb-3 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{pg.location.address}, {pg.location.city}</span>
        </div>
        {/* Amenities */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {pg.amenities.slice(0, 4).map((a) => (
            <span key={a} className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 px-2 py-1 text-xs text-slate-600">
              {amenityIcons[a] || null}
              {a}
            </span>
          ))}
          {pg.amenities.length > 4 && (
            <span className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1 text-xs text-slate-400">
              +{pg.amenities.length - 4}
            </span>
          )}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="capitalize">{pg.roomType} room</span>
            <span>·</span>
            <span>{pg.totalRooms} total rooms</span>
          </div>
          <Link to={`/pg/${pg._id}`}>
            <Button size="sm" variant="outline" id={`view-pg-${pg._id}`}>View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function PGCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden premium-shadow">
      <Skeleton className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export function PGListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCity = searchParams.get('city') || '';
  const initialLat = searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined;
  const initialLng = searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined;
  const initialRadius = searchParams.get('radius') ? Number(searchParams.get('radius')) : undefined;
  const initialCollege = searchParams.get('college') || '';

  const [filters, setFilters] = useState<PGFilters>({
    page: 1,
    limit: 12,
    city: initialCity || undefined,
    availableOnly: true,
    lat: initialLat,
    lng: initialLng,
    radius: initialRadius || (initialLat ? 3 : undefined),
  });
  const [activeCollege, setActiveCollege] = useState(initialCollege);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [cityInput, setCityInput] = useState(initialCity);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [gpsLoading, setGpsLoading] = useState(false);
  const { data, isLoading } = usePGListings(filters);

  useEffect(() => {
    if (initialCity) {
      setFilters((prev) => ({ ...prev, city: initialCity }));
    }
    if (initialLat && initialLng) {
      setFilters((prev) => ({
        ...prev,
        lat: initialLat,
        lng: initialLng,
        radius: initialRadius || 3,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync city input with filters via debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => {
        const cleaned = cityInput ? cityInput.trim() : undefined;
        if (prev.city === cleaned) return prev;
        return { ...prev, city: cleaned, page: 1 };
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [cityInput]);

  const handleFilter = (key: keyof PGFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const applyRentRange = () => {
    setFilters((prev) => ({
      ...prev,
      minRent: minRent ? Number(minRent) : undefined,
      maxRent: maxRent ? Number(maxRent) : undefined,
      page: 1,
    }));
  };

  const hasActiveFilters = !!filters.city || !!filters.genderPreference || !!filters.roomType
    || !!filters.minRent || !!filters.maxRent || !availableOnly || !!filters.lat;

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
    setAvailableOnly(true);
    setMinRent('');
    setMaxRent('');
    setCityInput('');
    setActiveCollege('');
    navigate('/pg', { replace: true });
  };

  // ── "Near Me" geolocation ─────────────────────────────────────────────────
  const findNearMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
          let city = '';
          if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=locality&key=${apiKey}`
            );
            const d = await res.json();
            city = d.results?.[0]?.address_components?.find(
              (c: { types: string[] }) => c.types.includes('locality')
            )?.long_name ?? '';
          }
          if (!city) {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const d = await res.json();
            city = d.address?.city || d.address?.town || d.address?.village || '';
          }
          if (city) {
            setCityInput(city);
            setFilters((prev) => ({ ...prev, city, page: 1 }));
          }
          setViewMode('map');
        } catch {
          // silently fall through
        } finally {
          setGpsLoading(false);
        }
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse PG Listings</h1>
          <p className="mt-1 text-slate-500">Find your perfect paying guest accommodation</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Near Me button */}
          <button
            id="list-near-me-btn"
            type="button"
            onClick={findNearMe}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-100 disabled:opacity-60"
          >
            {gpsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
            Near Me
          </button>
          {/* Map / Grid toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 premium-shadow">
            <button
              id="view-grid-btn"
              type="button"
              onClick={() => setViewMode('grid')}
              className={[
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Grid
            </button>
            <button
              id="view-map-btn"
              type="button"
              onClick={() => setViewMode('map')}
              className={[
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              <MapIcon className="h-3.5 w-3.5" /> Map
            </button>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 premium-shadow"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* College proximity banner */}
      {activeCollege && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 premium-shadow">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-blue-800 truncate">{activeCollege}</p>
            <p className="text-xs text-blue-500 font-medium">Showing PGs within {filters.radius ?? 3} km radius</p>
          </div>
          <button
            onClick={clearFilters}
            className="ml-auto shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
          >
            Clear
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Row 1: Text + selects */}
        <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 premium-shadow">
          <Input
            id="filter-city"
            placeholder="Search city..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
          <Select
            id="filter-gender"
            options={[
              { value: '', label: 'Any Gender' },
              { value: 'male', label: 'Males Only' },
              { value: 'female', label: 'Females Only' },
              { value: 'any', label: 'Co-ed' },
            ]}
            onChange={(e) => handleFilter('genderPreference', e.target.value)}
          />
          <Select
            id="filter-room"
            options={[
              { value: '', label: 'Any Room Type' },
              { value: 'single', label: 'Single' },
              { value: 'double', label: 'Double' },
              { value: 'triple', label: 'Triple' },
              { value: 'dormitory', label: 'Dormitory' },
            ]}
            onChange={(e) => handleFilter('roomType', e.target.value)}
          />
          <Select
            id="filter-sort"
            options={[
              { value: '', label: 'Sort By' },
              { value: 'rent_asc', label: 'Rent: Low to High' },
              { value: 'rent_desc', label: 'Rent: High to Low' },
              { value: 'newest', label: 'Newest First' },
            ]}
            onChange={(e) => handleFilter('sort', e.target.value)}
          />
        </div>

        {/* Row 2: Price range + availability toggle */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 premium-shadow">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
          <div className="flex items-center gap-2">
            <input
              id="filter-min-rent"
              type="number"
              placeholder="Min ₹"
              value={minRent}
              onChange={(e) => setMinRent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyRentRange()}
              className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
            />
            <span className="text-sm text-slate-450">to</span>
            <input
              id="filter-max-rent"
              type="number"
              placeholder="Max ₹"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyRentRange()}
              className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
            />
            <button
              onClick={applyRentRange}
              className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 shadow-sm"
            >
              Apply
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-slate-600 font-medium">Available only</span>
            <button
              id="filter-available-toggle"
              type="button"
              onClick={() => {
                const next = !availableOnly;
                setAvailableOnly(next);
                setFilters((prev) => ({ ...prev, availableOnly: next || undefined, page: 1 }));
              }}
              className={[
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer',
                availableOnly ? 'bg-blue-600' : 'bg-slate-200',
              ].join(' ')}
            >
              <span
                className={[
                  'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                  availableOnly ? 'translate-x-4' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      {data && (
        <p className="mb-4 text-sm text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {data.listings.length}
          </span>{' '}
          of {data.pagination?.total ?? 0} listings
          {availableOnly && ' (available only)'}
          {viewMode === 'map' && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
              <MapIcon className="h-3 w-3" /> Map view
            </span>
          )}
        </p>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="mb-6">
          {isLoading ? (
            <Skeleton className="h-[560px] w-full rounded-2xl" />
          ) : (
            <PGMapView listings={data?.listings ?? []} />
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <PGCardSkeleton key={i} />)
            : data?.listings?.map((pg) => <PGCard key={pg._id} pg={pg} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data?.listings?.length === 0 && (
        <div className="py-20 text-center">
          <BedDouble className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-slate-500">No PGs found matching your filters</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Pagination (grid view only) */}
      {viewMode === 'grid' && data?.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-slate-500">
            Page {filters.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === data.pagination.totalPages}
            onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
