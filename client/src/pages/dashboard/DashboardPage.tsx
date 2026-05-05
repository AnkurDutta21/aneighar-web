import React from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Eye, Bookmark, MessageSquare, Home, Plus,
  TrendingUp, ArrowRight
} from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { useDashboard } from '@/features/pg/hooks/usePG'
import { useAuthStore } from '@/stores/auth.store'

const StatCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
  id: string
}> = ({ icon, label, value, color, id }) => (
  <div className="stat-card" id={id}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <TrendingUp size={16} className="text-green-400 opacity-60" />
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
  </div>
)

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const { data, isLoading } = useDashboard()

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 text-white">
            Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Here's how your listings are performing
          </p>
        </div>
        <Link to="/dashboard/listings/new" className="btn btn-primary" id="new-listing-cta">
          <Plus size={16} /> New Listing
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 fade-in">
          <StatCard
            id="stat-listings"
            icon={<Home size={20} className="text-white" />}
            label="Total Listings"
            value={data?.totalListings ?? 0}
            color="bg-gradient-primary"
          />
          <StatCard
            id="stat-views"
            icon={<Eye size={20} className="text-white" />}
            label="Total Views"
            value={data?.totalViews ?? 0}
            color="bg-blue-500/20"
          />
          <StatCard
            id="stat-saves"
            icon={<Bookmark size={20} className="text-white" />}
            label="Total Saves"
            value={data?.totalSaves ?? 0}
            color="bg-purple-500/20"
          />
          <StatCard
            id="stat-inquiries"
            icon={<MessageSquare size={20} className="text-white" />}
            label="Inquiries"
            value={data?.totalInquiries ?? 0}
            color="bg-green-500/20"
          />
        </div>
      )}

      {/* Inquiry Status Breakdown */}
      {data?.inquiryByStatus && (
        <div className="glass-card p-6 mb-6 fade-in">
          <h2 className="text-h3 text-white mb-4">Inquiry Status</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(data.inquiryByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`badge ${
                  status === 'pending' ? 'badge-amber' :
                  status === 'viewed' ? 'badge-blue' :
                  status === 'responded' ? 'badge-green' : 'badge-red'
                } capitalize`}>{status}</span>
                <span className="text-white font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Listings */}
      <div className="glass-card p-6 fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-h3 text-white">Recent Listings</h2>
          <Link to="/dashboard/listings" className="btn btn-ghost btn-sm flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : !data?.recentListings?.length ? (
          <div className="text-center py-8">
            <LayoutDashboard size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              No listings yet. Add your first PG!
            </p>
            <Link to="/dashboard/listings/new" className="btn btn-primary btn-sm">
              <Plus size={15} /> Add Listing
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentListings.map((l) => (
              <Link
                key={l._id}
                to={`/dashboard/listings/${l._id}/edit`}
                id={`recent-listing-${l._id}`}
                className="flex items-center justify-between p-4 rounded-xl border transition-all hover:border-primary/30 no-underline"
                style={{ borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={l.images?.[0]?.url || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=80&q=60`}
                      alt={l.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium line-clamp-1">{l.title}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--color-text-muted)' }}>
                      {l.location?.city} · ₹{l.rent?.toLocaleString()}/mo
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="flex items-center gap-1"><Eye size={12} /> {l.analytics?.views}</span>
                  <span className={`badge ${l.isAvailable ? 'badge-green' : 'badge-red'}`}>
                    {l.isAvailable ? 'Available' : 'Full'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default DashboardPage
