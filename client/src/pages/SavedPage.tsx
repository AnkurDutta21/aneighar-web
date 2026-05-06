import React from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, MapPin, Bed, ArrowRight, Loader2 } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { useSavedListings, useToggleSave } from '@/features/pg/hooks/usePG'

const SavedPage: React.FC = () => {
  const { data: saved, isLoading } = useSavedListings()
  const toggleSave = useToggleSave()

  return (
    <MainLayout>
      <div className="mb-8 animate-fade-up opacity-0">
        <h1 className="text-h1 text-white mb-1">Saved PGs</h1>
        <p className="text-text-secondary text-sm">
          {saved?.length ?? 0} saved listings
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-56" />
          ))}
        </div>
      ) : !saved?.length ? (
        <div className="glass-card p-16 text-center animate-scale-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-400 mx-auto mb-5 flex items-center justify-center shadow-xl">
            <Bookmark size={36} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nothing saved yet</h3>
          <p className="text-text-secondary mb-6 text-sm">
            Save PGs while browsing to quickly come back to them later.
          </p>
          <Link to="/listings" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:brightness-110 transition-all no-underline">
            Browse PGs <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((item: any, i: number) => {
            const pg = item.pg
            if (!pg) return null
            return (
              <div
                key={item._id}
                className="glass-card-interactive overflow-hidden flex flex-col group animate-fade-up opacity-0"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={pg.images?.[0]?.url || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=70`}
                    alt={pg.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={e => { (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=70` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white font-bold text-lg">
                    ₹{pg.rent?.toLocaleString()}<span className="font-normal text-sm text-white/65">/mo</span>
                  </div>
                  {/* Remove from saved */}
                  <button
                    onClick={() => toggleSave.mutate(pg._id)}
                    disabled={toggleSave.isPending}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/80 backdrop-blur flex items-center justify-center hover:bg-primary transition-all hover:scale-110 active:scale-95"
                    title="Remove from saved"
                  >
                    {toggleSave.isPending
                      ? <Loader2 size={14} className="text-white animate-spin" />
                      : <Bookmark size={14} className="text-white fill-white" />
                    }
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2.5 flex-1">
                  <h3 className="text-white font-semibold leading-snug line-clamp-1 group-hover:text-primary-light transition-colors">
                    {pg.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                    <MapPin size={12} className="shrink-0" />
                    <span className="line-clamp-1">{pg.location?.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted border-t border-white/6 pt-2 mt-auto">
                    <Bed size={12} />
                    <span className="capitalize">{pg.roomType}</span>
                  </div>
                  <Link
                    to={`/listings/${pg._id}`}
                    className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/8 text-sm font-medium text-text-secondary hover:text-white hover:bg-primary/15 hover:border-primary/25 transition-all no-underline"
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </MainLayout>
  )
}

export default SavedPage
