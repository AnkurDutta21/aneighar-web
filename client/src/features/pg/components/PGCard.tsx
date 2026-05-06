import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Bed, Users, Bookmark, BookmarkCheck, Wifi, AirVent, Car, Utensils, Dumbbell } from 'lucide-react'
import type { PGListing } from '@/features/pg/pg.types'
import { useAuthStore } from '@/stores/auth.store'
import { useToggleSave } from '@/features/pg/hooks/usePG'

interface PGCardProps {
  pg: PGListing
  isSaved?: boolean
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi size={12} />,
  ac: <AirVent size={12} />,
  parking: <Car size={12} />,
  meals: <Utensils size={12} />,
  gym: <Dumbbell size={12} />,
}

const genderConfig: Record<string, { label: string; cls: string }> = {
  male:   { label: 'Boys Only', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/20' },
  female: { label: 'Girls Only', cls: 'bg-pink-500/15 text-pink-300 border-pink-500/20' },
  any:    { label: 'Co-ed', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
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

  const gender = genderConfig[pg.genderPreference]
  const firstImage = pg.images[0]?.url || ''
  const shownAmenities = pg.amenities.filter(a => amenityIcons[a]).slice(0, 4)

  return (
    <Link to={`/listings/${pg._id}`} className="block no-underline group">
      <article className="glass-card-interactive overflow-hidden h-full flex flex-col">

        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
          <img
            src={firstImage}
            alt={pg.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={e => {
              (e.target as HTMLImageElement).src =
                `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=70`
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${
              pg.isAvailable
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25'
                : 'bg-red-500/20 text-red-300 border-red-500/25'
            }`}>
              {pg.isAvailable ? `${pg.availableRooms} Rooms Free` : 'Full'}
            </span>
          </div>

          {/* Save button */}
          {isAuthenticated && user?.role === 'student' && (
            <button
              onClick={handleSave}
              disabled={toggleSave.isPending}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                isSaved
                  ? 'bg-primary/80 shadow-lg shadow-primary-glow/30'
                  : 'bg-black/40 hover:bg-black/60'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
            >
              {isSaved
                ? <BookmarkCheck size={15} className="text-white" />
                : <Bookmark size={15} className="text-white" />
              }
            </button>
          )}

          {/* Price bottom left */}
          <div className="absolute bottom-3 left-3">
            <div className="text-white font-bold text-xl leading-none">
              ₹{pg.rent.toLocaleString()}
              <span className="text-white/60 font-normal text-sm ml-1">/mo</span>
            </div>
          </div>

          {/* Gender badge bottom right */}
          <div className="absolute bottom-3 right-3">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${gender.cls}`}>
              {gender.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2.5 flex-1">
          <h3 className="text-white font-semibold text-base leading-snug line-clamp-1 group-hover:text-primary-light transition-colors duration-200">
            {pg.title}
          </h3>

          <div className="flex items-center gap-1.5 text-text-secondary text-xs">
            <MapPin size={12} className="shrink-0" />
            <span className="line-clamp-1">{pg.location.address}, {pg.location.city}</span>
          </div>

          {/* Details row */}
          <div className="flex items-center gap-3 text-xs text-text-muted mt-auto pt-2 border-t border-white/6">
            <span className="flex items-center gap-1 capitalize">
              <Bed size={12} /> {pg.roomType}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} /> {pg.totalRooms} rooms
            </span>
            {shownAmenities.length > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                {shownAmenities.map(a => (
                  <span key={a} title={a} className="text-text-muted hover:text-primary-light transition-colors">
                    {amenityIcons[a]}
                  </span>
                ))}
                {pg.amenities.length > 4 && (
                  <span className="text-text-muted">+{pg.amenities.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default PGCard
