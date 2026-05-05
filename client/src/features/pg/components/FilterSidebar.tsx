import React from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import type { PGFilters, GenderPreference, RoomType } from '@/features/pg/pg.types'

interface FilterSidebarProps {
  filters: PGFilters
  onChange: (filters: PGFilters) => void
  onReset: () => void
}

const AMENITIES = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'ac', label: 'AC' },
  { value: 'parking', label: 'Parking' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'meals', label: 'Meals' },
  { value: 'gym', label: 'Gym' },
  { value: 'cctv', label: 'CCTV' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'water_purifier', label: 'Water Purifier' },
  { value: 'power_backup', label: 'Power Backup' },
]

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onChange, onReset }) => {
  const update = <K extends keyof PGFilters>(key: K, value: PGFilters[K]) =>
    onChange({ ...filters, [key]: value, page: 1 })

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities || []
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity]
    update('amenities', next)
  }

  const hasFilters = !!(
    filters.city || filters.gender || filters.roomType ||
    filters.minPrice || filters.maxPrice ||
    (filters.amenities && filters.amenities.length > 0)
  )

  return (
    <aside className="glass-card p-5 flex flex-col gap-5 h-fit sticky top-24" id="filter-sidebar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-semibold">
          <SlidersHorizontal size={16} />
          Filters
        </div>
        {hasFilters && (
          <button
            id="reset-filters-btn"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={13} /> Reset
          </button>
        )}
      </div>

      {/* City */}
      <div>
        <label className="input-label">City</label>
        <input
          id="filter-city"
          type="text"
          placeholder="e.g. Mumbai, Delhi..."
          value={filters.city || ''}
          onChange={(e) => update('city', e.target.value)}
          className="input"
        />
      </div>

      {/* Price Range */}
      <div>
        <label className="input-label">Price Range (₹/mo)</label>
        <div className="flex gap-2">
          <input
            id="filter-min-price"
            type="number"
            placeholder="Min"
            min={0}
            value={filters.minPrice || ''}
            onChange={(e) => update('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="input"
          />
          <input
            id="filter-max-price"
            type="number"
            placeholder="Max"
            min={0}
            value={filters.maxPrice || ''}
            onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="input"
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="input-label">Gender</label>
        <div className="flex gap-2 flex-wrap">
          {(['male', 'female', 'any'] as GenderPreference[]).map((g) => (
            <button
              key={g}
              id={`filter-gender-${g}`}
              onClick={() => update('gender', filters.gender === g ? undefined : g)}
              className={`btn btn-sm capitalize ${
                filters.gender === g ? 'btn-primary' : 'btn-outline'
              }`}
            >
              {g === 'male' ? 'Boys' : g === 'female' ? 'Girls' : 'Co-ed'}
            </button>
          ))}
        </div>
      </div>

      {/* Room Type */}
      <div>
        <label className="input-label">Room Type</label>
        <div className="flex gap-2 flex-wrap">
          {(['single', 'double', 'triple', 'dormitory'] as RoomType[]).map((r) => (
            <button
              key={r}
              id={`filter-room-${r}`}
              onClick={() => update('roomType', filters.roomType === r ? undefined : r)}
              className={`btn btn-sm capitalize ${
                filters.roomType === r ? 'btn-primary' : 'btn-outline'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="input-label">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(({ value, label }) => {
            const selected = (filters.amenities || []).includes(value)
            return (
              <button
                key={value}
                id={`filter-amenity-${value}`}
                onClick={() => toggleAmenity(value)}
                className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-outline'}`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-3">
        <input
          id="filter-available"
          type="checkbox"
          checked={filters.isAvailable === true}
          onChange={(e) => update('isAvailable', e.target.checked ? true : undefined)}
          className="w-4 h-4 accent-primary rounded"
        />
        <label htmlFor="filter-available" className="text-sm text-gray-300 cursor-pointer">
          Available only
        </label>
      </div>
    </aside>
  )
}

export default FilterSidebar
