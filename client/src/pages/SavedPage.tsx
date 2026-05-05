import React from 'react'
import { Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import PGCard from '@/features/pg/components/PGCard'
import { PGGridSkeleton } from '@/features/pg/components/PGCardSkeleton'
import { useSavedListings } from '@/features/pg/hooks/usePG'

const SavedPage: React.FC = () => {
  const { data: saved = [], isLoading } = useSavedListings()

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-h1 text-white flex items-center gap-3">
          <Bookmark size={28} className="text-primary" />
          Saved Listings
        </h1>
        {!isLoading && (
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {saved.length} saved PG{saved.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {isLoading ? (
        <PGGridSkeleton count={6} />
      ) : saved.length === 0 ? (
        <div className="glass-card p-16 text-center fade-in">
          <Bookmark size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
          <h3 className="text-h3 text-white mb-2">No saved listings</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Bookmark PGs you like while browsing
          </p>
          <Link to="/listings" className="btn btn-primary">Browse Listings</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((item: { pg: Parameters<typeof PGCard>[0]['pg'] }) => (
            <PGCard key={item.pg._id} pg={item.pg} isSaved />
          ))}
        </div>
      )}
    </MainLayout>
  )
}

export default SavedPage
