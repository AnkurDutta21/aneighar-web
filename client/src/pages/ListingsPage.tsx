import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import FilterSidebar from '@/features/pg/components/FilterSidebar'
import PGCard from '@/features/pg/components/PGCard'
import { PGGridSkeleton } from '@/features/pg/components/PGCardSkeleton'
import { usePGList, useSavedListings } from '@/features/pg/hooks/usePG'
import { useAuthStore } from '@/stores/auth.store'
import type { PGFilters } from '@/features/pg/pg.types'

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc',label: 'Price: High → Low' },
  { value: 'popular',   label: 'Most Popular' },
]

const parseFilters = (p: URLSearchParams): PGFilters => ({
  city:      p.get('city') || undefined,
  gender:    (p.get('gender') as PGFilters['gender']) || undefined,
  roomType:  (p.get('roomType') as PGFilters['roomType']) || undefined,
  minPrice:  p.get('minPrice') ? Number(p.get('minPrice')) : undefined,
  maxPrice:  p.get('maxPrice') ? Number(p.get('maxPrice')) : undefined,
  amenities: p.get('amenities') ? p.get('amenities')!.split(',') : undefined,
  isAvailable: p.get('isAvailable') === 'true' ? true : undefined,
  sort:      (p.get('sort') as PGFilters['sort']) || 'newest',
  page:      p.get('page') ? Number(p.get('page')) : 1,
})

const ListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = React.useState(false)
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
    if (next.city)              params.city = next.city
    if (next.gender)            params.gender = next.gender
    if (next.roomType)          params.roomType = next.roomType
    if (next.minPrice)          params.minPrice = String(next.minPrice)
    if (next.maxPrice)          params.maxPrice = String(next.maxPrice)
    if (next.amenities?.length) params.amenities = next.amenities.join(',')
    if (next.isAvailable)       params.isAvailable = 'true'
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
      <div className="mb-8 animate-fade-up opacity-0">
        <h1 className="text-h1 text-white mb-1">Find Your PG</h1>
        <p className="text-text-secondary">
          {isLoading ? 'Searching...' : `${pagination?.total ?? 0} listings found`}
        </p>
      </div>

      <div className="flex gap-7">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 shrink-0 animate-fade-up opacity-0 delay-100">
          <FilterSidebar filters={filters} onChange={setFilters} onReset={resetFilters} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Sort / Search Bar */}
          <div className="flex items-center gap-3 mb-6 animate-fade-up opacity-0 delay-200">
            {/* Mobile filter toggle */}
            <button
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/8 text-sm font-medium text-text-secondary hover:text-white transition-colors shrink-0"
              onClick={() => setShowMobileFilters(true)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            {/* Search input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                id="search-city"
                type="text"
                placeholder="Search by city..."
                value={filters.city || ''}
                onChange={e => setFilters({ ...filters, city: e.target.value || undefined, page: 1 })}
                className="w-full bg-bg-card border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {filters.city && (
                <button
                  onClick={() => setFilters({ ...filters, city: undefined, page: 1 })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort select */}
            <select
              id="sort-select"
              value={filters.sort || 'newest'}
              onChange={e => setFilters({ ...filters, sort: e.target.value as PGFilters['sort'], page: 1 })}
              className="bg-bg-card border border-white/8 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer shrink-0"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#0d1526' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <PGGridSkeleton count={9} />
          ) : isError ? (
            <div className="glass-card p-12 text-center animate-scale-in">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-400 mb-4 font-medium">Failed to load listings</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : listings.length === 0 ? (
            <div className="glass-card p-16 text-center animate-scale-in">
              <div className="text-6xl mb-5">🏠</div>
              <h3 className="text-xl font-bold text-white mb-2">No PGs found</h3>
              <p className="text-text-secondary mb-6 text-sm">
                Try adjusting your filters or search in a different city.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:brightness-110 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map((pg, i) => (
                <div
                  key={pg._id}
                  className="animate-fade-up opacity-0"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <PGCard
                    pg={pg}
                    isSaved={isAuthenticated && user?.role === 'student' ? savedIds.has(pg._id) : false}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10 animate-fade-in">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-white/8 text-sm text-text-secondary hover:text-white hover:border-white/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <div className="glass border border-white/8 px-5 py-2 rounded-xl text-sm text-text-secondary">
                <span className="text-white font-semibold">{pagination.page}</span>
                {' '}/{' '}
                {pagination.totalPages}
              </div>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-white/8 text-sm text-text-secondary hover:text-white hover:border-white/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="relative ml-auto w-80 h-full bg-bg-card overflow-y-auto p-5 animate-scale-in shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setShowMobileFilters(false) }} onReset={() => { resetFilters(); setShowMobileFilters(false) }} />
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default ListingsPage
