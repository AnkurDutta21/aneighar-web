import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Wifi, Wind, Car, Utensils, Tv, Shield,
  Heart, Eye, BedDouble, Users,
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
    <div className="group rounded-2xl border border-white/8 bg-white/5 overflow-hidden transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-900/30 to-slate-900">
        {pg.images?.[0] ? (
          <img
            src={pg.images[0].url}
            alt={pg.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BedDouble className="h-12 w-12 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Save button */}
        {isAuthenticated && (
          <button
            onClick={() => toggleSave.mutate(pg._id)}
            className="absolute right-3 top-3 rounded-full p-2 bg-black/40 backdrop-blur-sm text-white/60 hover:text-red-400 transition-colors"
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
          <h3 className="font-semibold text-white line-clamp-1">{pg.title}</h3>
          <span className="shrink-0 text-lg font-bold text-violet-400">
            {formatCurrency(pg.rent)}
            <span className="text-xs font-normal text-white/40">/mo</span>
          </span>
        </div>
        <div className="mb-3 flex items-center gap-1.5 text-sm text-white/40">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{pg.location.address}, {pg.location.city}</span>
        </div>
        {/* Amenities */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {pg.amenities.slice(0, 4).map((a) => (
            <span key={a} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs text-white/50">
              {amenityIcons[a] || null}
              {a}
            </span>
          ))}
          {pg.amenities.length > 4 && (
            <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-white/30">
              +{pg.amenities.length - 4}
            </span>
          )}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-white/30">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {pg.analytics?.views ?? 0}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {pg.analytics?.inquiries ?? 0}</span>
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
    <div className="rounded-2xl border border-white/8 overflow-hidden">
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
  const [filters, setFilters] = useState<PGFilters>({ page: 1, limit: 12 });
  const { data, isLoading } = usePGListings(filters);

  const handleFilter = (key: keyof PGFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Browse PG Listings</h1>
      <p className="mb-6 text-white/50">Find your perfect paying guest accommodation</p>

      {/* Filters */}
      <div className="mb-6 grid gap-3 rounded-2xl border border-white/8 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          id="filter-city"
          placeholder="Search city..."
          onChange={(e) => handleFilter('city', e.target.value)}
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

      {/* Results count */}
      {data && (
        <p className="mb-4 text-sm text-white/40">
          Showing {data.listings.length} of {data.pagination?.total ?? 0} listings
        </p>
      )}

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <PGCardSkeleton key={i} />)
          : data?.listings.map((pg) => <PGCard key={pg._id} pg={pg} />)}
      </div>

      {/* Empty state */}
      {!isLoading && data?.listings.length === 0 && (
        <div className="py-20 text-center">
          <BedDouble className="mx-auto mb-4 h-12 w-12 text-white/20" />
          <p className="text-white/40">No PGs found matching your filters</p>
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
          <span className="flex items-center px-4 text-sm text-white/50">
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
