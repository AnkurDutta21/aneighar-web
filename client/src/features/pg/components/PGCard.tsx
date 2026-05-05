import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Users, Bed, Bookmark, BookmarkCheck, Wifi, AirVent, Car } from 'lucide-react'
import type { PGListing } from '@/features/pg/pg.types'
import { useAuthStore } from '@/stores/auth.store'
import { useToggleSave } from '@/features/pg/hooks/usePG'

interface PGCardProps {
  pg: PGListing
  isSaved?: boolean
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi size={13} />,
  ac: <AirVent size={13} />,
  parking: <Car size={13} />,
}

const genderLabel: Record<string, { label: string; cls: string }> = {
  male: { label: 'Boys', cls: 'badge-blue' },
  female: { label: 'Girls', cls: 'badge-red' },
  any: { label: 'Co-ed', cls: 'badge-green' },
}

const PGCard: React.FC<PGCardProps> = ({ pg, isSaved = false }) => {
  const { isAuthenticated, user } = useAuthStore()
  const toggleSave = useToggleSave()

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) return
    toggleSave.mutate(pg._id)
  }

  const gender = genderLabel[pg.genderPreference]
  const firstImage = pg.images[0]?.url || '/placeholder-pg.jpg'
  const displayAmenities = pg.amenities.slice(0, 3)

  return (
    <Link to={`/listings/${pg._id}`} className="block no-underline" id={`pg-card-${pg._id}`}>
      <article className="pg-card fade-in">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
          <img
            src={firstImage}
            alt={pg.title}
            className="pg-card-image"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80`
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
          }} />

          {/* Availability Badge */}
          <div className="absolute top-3 left-3">
            <span className={`badge ${pg.isAvailable ? 'badge-green' : 'badge-red'}`}>
              {pg.isAvailable ? `${pg.availableRooms} Available` : 'Full'}
            </span>
          </div>

          {/* Save Button */}
          {isAuthenticated && user?.role === 'student' && (
            <button
              id={`save-btn-${pg._id}`}
              onClick={handleSave}
              disabled={toggleSave.isPending}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center transition-all hover:bg-black/60 hover:scale-110"
              aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
            >
              {isSaved
                ? <BookmarkCheck size={15} className="text-primary" />
                : <Bookmark size={15} className="text-white" />
              }
            </button>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="text-white font-semibold text-lg">
              ₹{pg.rent.toLocaleString()}
              <span className="text-xs font-normal text-white/70">/mo</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-white font-semibold text-base leading-tight line-clamp-1 flex-1">
              {pg.title}
            </h3>
            <span className={`badge ${gender.cls} shrink-0`}>{gender.label}</span>
          </div>

          <div className="flex items-center gap-1 mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            <MapPin size={13} />
            <span className="text-xs line-clamp-1">
              {pg.location.address}, {pg.location.city}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <div className="flex items-center gap-1">
              <Bed size={13} />
              <span className="capitalize">{pg.roomType}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={13} />
              <span>{pg.totalRooms} rooms</span>
            </div>
            {displayAmenities.map((a) => (
              <div key={a} className="flex items-center gap-1" title={a}>
                {amenityIcons[a] || null}
              </div>
            ))}
            {pg.amenities.length > 3 && (
              <span>+{pg.amenities.length - 3}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default PGCard
