import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import FilterSidebar from '@/features/pg/components/FilterSidebar'
import PGCard from '@/features/pg/components/PGCard'
import { PGGridSkeleton } from '@/features/pg/components/PGCardSkeleton'
import { usePGList, useSavedListings } from '@/features/pg/hooks/usePG'
import { useAuthStore } from '@/stores/auth.store'
import type { PGFilters } from '@/features/pg/pg.types'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'popular', label: 'Most Viewed' },
]

const parseFilters = (params: URLSearchParams): PGFilters => ({
  city: params.get('city') || undefined,
  gender: (params.get('gender') as PGFilters['gender']) || undefined,
  roomType: (params.get('roomType') as PGFilters['roomType']) || undefined,
  minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
  maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
  amenities: params.get('amenities') ? params.get('amenities')!.split(',') : undefined,
  isAvailable: params.get('isAvailable') === 'true' ? true : undefined,
  sort: (params.get('sort') as PGFilters['sort']) || 'newest',
  page: params.get('page') ? Number(params.get('page')) : 1,
})

const ListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFilters(searchParams)
  const { user, isAuthenticated } = useAuthStore()

  const { data, isLoading, isError } = usePGList(filters)
  const { data: savedData } = useSavedListings()

  const savedIds = React.useMemo(
    () => new Set((savedData || []).map((s: { pg: { _id: string } }) => s.pg._id)),
    [savedData]
  )

  const setFilters = (next: PGFilters) => {
    const params: Record<string, string> = {}
    if (next.city) params.city = next.city
    if (next.gender) params.gender = next.gender
    if (next.roomType) params.roomType = next.roomType
    if (next.minPrice) params.minPrice = String(next.minPrice)
    if (next.maxPrice) params.maxPrice = String(next.maxPrice)
    if (next.amenities?.length) params.amenities = next.amenities.join(',')
    if (next.isAvailable) params.isAvailable = 'true'
    if (next.sort && next.sort !== 'newest') params.sort = next.sort
    if (next.page && next.page > 1) params.page = String(next.page)
    setSearchParams(params)
  }

  const resetFilters = () => setSearchParams({})

  const listings = data?.listings || []
  const pagination = data?.pagination

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-h1 text-white mb-2">Find Your PG</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {pagination ? `${pagination.total} listings found` : 'Searching...'}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} onReset={resetFilters} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-5 gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="search-city"
                type="text"
                placeholder="Search by city..."
                value={filters.city || ''}
                onChange={(e) => setFilters({ ...filters, city: e.target.value, page: 1 })}
                className="input pl-10"
              />
            </div>
            <select
              id="sort-select"
              value={filters.sort || 'newest'}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value as PGFilters['sort'], page: 1 })}
              className="input w-auto cursor-pointer"
              style={{ borderRadius: 'var(--radius-button)', padding: '0.5rem 1rem' }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: '#111827' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <PGGridSkeleton count={9} />
          ) : isError ? (
            <div className="glass-card p-12 text-center">
              <p className="text-red-400 mb-4">Failed to load listings.</p>
              <button onClick={() => window.location.reload()} className="btn btn-outline">Retry</button>
            </div>
          ) : listings.length === 0 ? (
            <div className="glass-card p-16 text-center fade-in">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-h3 text-white mb-2">No PGs found</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Try adjusting your filters or search in a different city.
              </p>
              <button onClick={resetFilters} className="btn btn-primary">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map((pg) => (
                <PGCard
                  key={pg._id}
                  pg={pg}
                  isSaved={isAuthenticated && user?.role === 'student' ? savedIds.has(pg._id) : false}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10" id="pagination">
              <button
                id="prev-page-btn"
                disabled={!pagination.hasPrevPage}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                className="btn btn-outline btn-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                id="next-page-btn"
                disabled={!pagination.hasNextPage}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                className="btn btn-outline btn-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default ListingsPage
