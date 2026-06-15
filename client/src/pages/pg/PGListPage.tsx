import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin, Wifi, Wind, Car, Utensils, Tv, Shield,
  Heart, BedDouble, SlidersHorizontal, X,
} from 'lucide-react';
import { usePGListings } from '@/hooks/usePG';
import { useToggleSave } from '@/hooks/useInquiry';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
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
        {/* Gender badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant={pg.genderPreference === 'female' ? 'success' : pg.genderPreference === 'male' ? 'default' : 'outline'}>
            {pg.genderPreference === 'any' ? '👥 Co-ed' : pg.genderPreference === 'male' ? '♂ Males' : '♀ Females'}
          </Badge>
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
  const initialCity = searchParams.get('city') || '';

  const [filters, setFilters] = useState<PGFilters>({ page: 1, limit: 12, city: initialCity || undefined, availableOnly: true });
  const [availableOnly, setAvailableOnly] = useState(true);
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [cityInput, setCityInput] = useState(initialCity);
  const { data, isLoading } = usePGListings(filters);

  // Sync URL city param on mount
  useEffect(() => {
    if (initialCity) {
      setFilters((prev) => ({ ...prev, city: initialCity }));
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
    || !!filters.minRent || !!filters.maxRent || !availableOnly;

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
    setAvailableOnly(true);
    setMinRent('');
    setMaxRent('');
    setCityInput('');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse PG Listings</h1>
          <p className="mt-1 text-slate-500">Find your perfect paying guest accommodation</p>
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
        </p>
      )}

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <PGCardSkeleton key={i} />)
          : data?.listings?.map((pg) => <PGCard key={pg._id} pg={pg} />)}
      </div>

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

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
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
