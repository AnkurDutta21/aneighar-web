import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Bookmark, MessageSquare, Loader2, AlertTriangle } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { useOwnerListings, useDeletePG } from '@/features/pg/hooks/usePG'
import type { PGListing } from '@/features/pg/pg.types'

const MyListingsPage: React.FC = () => {
  const { data: listings = [], isLoading } = useOwnerListings()
  const deletePG = useDeletePG()
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null)

  const handleDelete = (id: string) => {
    deletePG.mutate(id, { onSuccess: () => setConfirmDelete(null) })
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-h1 text-white">My Listings</h1>
        <Link to="/dashboard/listings/new" className="btn btn-primary" id="add-listing-btn">
          <Plus size={16} /> Add Listing
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-card p-16 text-center fade-in">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-h3 text-white mb-2">No listings yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Start by adding your first PG listing
          </p>
          <Link to="/dashboard/listings/new" className="btn btn-primary">
            <Plus size={16} /> Add Your First Listing
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((pg: PGListing) => (
            <div
              key={pg._id}
              id={`listing-row-${pg._id}`}
              className="glass-card p-5 flex items-center gap-5 fade-in"
            >
              {/* Thumbnail */}
              <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0">
                <img
                  src={pg.images?.[0]?.url || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=160&q=60`}
                  alt={pg.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm truncate">{pg.title}</h3>
                  <span className={`badge ${pg.isAvailable ? 'badge-green' : 'badge-red'} shrink-0`}>
                    {pg.isAvailable ? 'Available' : 'Full'}
                  </span>
                </div>
                <p className="text-xs capitalize mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  {pg.location.city} · ₹{pg.rent.toLocaleString()}/mo · {pg.roomType}
                </p>
                <div className="flex gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="flex items-center gap-1"><Eye size={12} /> {pg.analytics.views}</span>
                  <span className="flex items-center gap-1"><Bookmark size={12} /> {pg.analytics.saves}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {pg.analytics.inquiries}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/listings/${pg._id}`}
                  target="_blank"
                  className="btn btn-ghost btn-sm p-2"
                  title="View public listing"
                >
                  <Eye size={16} />
                </Link>
                <Link
                  to={`/dashboard/listings/${pg._id}/edit`}
                  id={`edit-btn-${pg._id}`}
                  className="btn btn-outline btn-sm"
                >
                  <Edit size={15} /> Edit
                </Link>
                {confirmDelete === pg._id ? (
                  <div className="flex items-center gap-2">
                    <button
                      id={`confirm-delete-${pg._id}`}
                      onClick={() => handleDelete(pg._id)}
                      disabled={deletePG.isPending}
                      className="btn btn-sm text-red-400 border-red-400/40 hover:bg-red-500/10"
                      style={{ background: 'transparent', border: '1px solid' }}
                    >
                      {deletePG.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost btn-sm">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    id={`delete-btn-${pg._id}`}
                    onClick={() => setConfirmDelete(pg._id)}
                    className="btn btn-ghost btn-sm p-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete modal hint */}
      {confirmDelete && (
        <div className="fixed bottom-6 right-6 glass-card p-4 flex items-center gap-3 text-sm fade-in">
          <AlertTriangle size={16} className="text-amber-400" />
          <span style={{ color: 'var(--color-text-secondary)' }}>This will soft-delete the listing.</span>
        </div>
      )}
    </MainLayout>
  )
}

export default MyListingsPage
