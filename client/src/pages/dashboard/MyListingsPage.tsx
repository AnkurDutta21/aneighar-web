import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, Edit2, Trash2, Home, AlertTriangle, Loader2 } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { useMyListings, useDeletePG } from '@/features/pg/hooks/usePG'

const MyListingsPage: React.FC = () => {
  const { data: listings, isLoading, isError } = useMyListings()
  const deletePG = useDeletePG()
  const [confirmId, setConfirmId] = React.useState<string | null>(null)

  const handleDelete = (id: string) => {
    deletePG.mutate(id, { onSuccess: () => setConfirmId(null) })
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up opacity-0">
        <div>
          <h1 className="text-h1 text-white mb-1">My Listings</h1>
          <p className="text-text-secondary text-sm">
            {listings?.length ?? 0} total property listings
          </p>
        </div>
        <Link
          to="/dashboard/listings/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg shadow-primary-glow/25 hover:brightness-110 hover:-translate-y-0.5 transition-all no-underline text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Listing</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-56" />
          ))}
        </div>
      ) : isError ? (
        <div className="glass-card p-12 text-center animate-scale-in">
          <AlertTriangle size={40} className="mx-auto mb-3 text-error opacity-70" />
          <p className="text-red-400 font-medium mb-4">Failed to load listings</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors">
            Retry
          </button>
        </div>
      ) : !listings?.length ? (
        <div className="glass-card p-16 text-center animate-scale-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary mx-auto mb-5 flex items-center justify-center shadow-xl shadow-primary-glow/25">
            <Home size={36} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No listings yet</h3>
          <p className="text-text-secondary mb-6 text-sm">Create your first PG listing and start getting inquiries.</p>
          <Link to="/dashboard/listings/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:brightness-110 transition-all no-underline">
            <Plus size={16} /> Create First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {listings.map((pg, i) => (
            <div
              key={pg._id}
              className="glass-card overflow-hidden flex flex-col group animate-fade-up opacity-0"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <img
                  src={pg.images?.[0]?.url || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=70`}
                  alt={pg.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* Availability badge */}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${
                    pg.isAvailable
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25'
                      : 'bg-red-500/20 text-red-300 border-red-500/25'
                  }`}>
                    {pg.isAvailable ? `${pg.availableRooms} Available` : 'Full'}
                  </span>
                </div>
                {/* Price */}
                <div className="absolute bottom-3 left-3 text-white font-bold text-lg">
                  ₹{pg.rent?.toLocaleString()}<span className="text-white/60 font-normal text-sm">/mo</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <h3 className="text-white font-semibold leading-snug line-clamp-1 group-hover:text-primary-light transition-colors">
                  {pg.title}
                </h3>
                <p className="text-text-muted text-xs capitalize">{pg.location?.city}</p>

                {/* Analytics */}
                <div className="flex items-center gap-4 text-xs text-text-muted border-t border-white/6 pt-3 mt-auto">
                  <span className="flex items-center gap-1"><Eye size={12} /> {pg.analytics?.views} views</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/listings/${pg._id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/8 text-xs font-medium text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/15 transition-all no-underline"
                  >
                    <Edit2 size={13} /> Edit
                  </Link>
                  {confirmId === pg._id ? (
                    <div className="flex-1 flex gap-1">
                      <button
                        onClick={() => handleDelete(pg._id)}
                        disabled={deletePG.isPending}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-error/20 border border-error/30 text-red-400 text-xs font-medium hover:bg-error/30 transition-all"
                      >
                        {deletePG.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-xs text-text-muted hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(pg._id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-xs font-medium text-text-muted hover:text-red-400 hover:bg-error/10 hover:border-error/20 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  )
}

export default MyListingsPage
