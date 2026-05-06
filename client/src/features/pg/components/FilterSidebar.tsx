import React from 'react'
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react'
import type { PGFilters, GenderPreference, RoomType } from '@/features/pg/pg.types'

const AMENITIES = [
  { value: 'wifi',          label: '📶 WiFi' },
  { value: 'ac',            label: '❄️ AC' },
  { value: 'parking',       label: '🚗 Parking' },
  { value: 'laundry',       label: '🧺 Laundry' },
  { value: 'meals',         label: '🍽️ Meals' },
  { value: 'gym',           label: '🏋️ Gym' },
  { value: 'cctv',          label: '📹 CCTV' },
  { value: 'housekeeping',  label: '🧹 Housekeeping' },
  { value: 'water_purifier',label: '💧 Water Purifier' },
  { value: 'power_backup',  label: '⚡ Power Backup' },
]

const ChipButton: React.FC<{
  active: boolean
  onClick: () => void
  children: React.ReactNode
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
      active
        ? 'bg-primary/20 border-primary/40 text-primary-light shadow-sm shadow-primary-glow/10'
        : 'bg-white/3 border-white/8 text-text-secondary hover:border-white/15 hover:text-white'
    }`}
  >
    {children}
  </button>
)

interface FilterSidebarProps {
  filters: PGFilters
  onChange: (f: PGFilters) => void
  onReset: () => void
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onChange, onReset }) => {
  const update = <K extends keyof PGFilters>(key: K, value: PGFilters[K]) =>
    onChange({ ...filters, [key]: value, page: 1 })

  const toggleAmenity = (val: string) => {
    const cur = filters.amenities || []
    update('amenities', cur.includes(val) ? cur.filter(a => a !== val) : [...cur, val])
  }

  const hasFilters = !!(
    filters.city || filters.gender || filters.roomType ||
    filters.minPrice || filters.maxPrice ||
    (filters.amenities && filters.amenities.length > 0) ||
    filters.isAvailable
  )

  return (
    <aside className="glass-card p-5 flex flex-col gap-6 h-fit sticky top-24" id="filter-sidebar">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <SlidersHorizontal size={15} className="text-primary-light" />
          Filters
          {hasFilters && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary-light text-xs">
              Active
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-error transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      {/* City */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">City</label>
        <div className="relative">
          <input
            id="filter-city"
            type="text"
            placeholder="Mumbai, Delhi, Pune..."
            value={filters.city || ''}
            onChange={e => update('city', e.target.value || undefined)}
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3.5 pr-8 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {filters.city && (
            <button
              onClick={() => update('city', undefined)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Price Range (₹/mo)</label>
        <div className="flex gap-2">
          <input
            id="filter-min-price"
            type="number"
            placeholder="Min"
            min={0}
            value={filters.minPrice || ''}
            onChange={e => update('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-1/2 bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <input
            id="filter-max-price"
            type="number"
            placeholder="Max"
            min={0}
            value={filters.maxPrice || ''}
            onChange={e => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-1/2 bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Gender */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Gender</label>
        <div className="flex gap-2">
          {(['male', 'female', 'any'] as GenderPreference[]).map(g => (
            <ChipButton
              key={g}
              active={filters.gender === g}
              onClick={() => update('gender', filters.gender === g ? undefined : g)}
            >
              {g === 'male' ? 'Boys' : g === 'female' ? 'Girls' : 'All'}
            </ChipButton>
          ))}
        </div>
      </div>

      {/* Room Type */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Room Type</label>
        <div className="flex flex-wrap gap-2">
          {(['single', 'double', 'triple', 'dormitory'] as RoomType[]).map(r => (
            <ChipButton
              key={r}
              active={filters.roomType === r}
              onClick={() => update('roomType', filters.roomType === r ? undefined : r)}
            >
              <span className="capitalize">{r}</span>
            </ChipButton>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(({ value, label }) => (
            <ChipButton
              key={value}
              active={(filters.amenities || []).includes(value)}
              onClick={() => toggleAmenity(value)}
            >
              {label}
            </ChipButton>
          ))}
        </div>
      </div>

      {/* Availability */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            id="filter-available"
            type="checkbox"
            checked={filters.isAvailable === true}
            onChange={e => update('isAvailable', e.target.checked ? true : undefined)}
            className="sr-only"
          />
          <div className={`w-10 h-5 rounded-full transition-all duration-200 ${
            filters.isAvailable ? 'bg-primary' : 'bg-white/10'
          }`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
              filters.isAvailable ? 'left-5' : 'left-0.5'
            }`} />
          </div>
        </div>
        <span className="text-sm text-text-secondary group-hover:text-white transition-colors">
          Available rooms only
        </span>
      </label>

    </aside>
  )
}

export default FilterSidebar
