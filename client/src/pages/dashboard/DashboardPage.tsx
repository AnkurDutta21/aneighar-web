import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, Bookmark, MessageSquare, Home, Plus, TrendingUp, ArrowRight, LayoutDashboard, Loader2 } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { useDashboard } from '@/features/pg/hooks/usePG'
import { useAuthStore } from '@/stores/auth.store'

const STAT_COLORS = [
  { from: 'from-blue-500',   to: 'to-cyan-400',    glow: 'shadow-blue-500/20' },
  { from: 'from-violet-500', to: 'to-purple-400',  glow: 'shadow-violet-500/20' },
  { from: 'from-emerald-500',to: 'to-teal-400',    glow: 'shadow-emerald-500/20' },
  { from: 'from-amber-500',  to: 'to-orange-400',  glow: 'shadow-amber-500/20' },
]

const StatCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: number | string
  colorIdx: number
  delay?: number
}> = ({ icon, label, value, colorIdx, delay = 0 }) => {
  const c = STAT_COLORS[colorIdx]
  return (
    <div
      className="glass-card p-6 flex flex-col gap-4 animate-fade-up opacity-0 group hover:border-white/15 transition-all"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center shadow-lg ${c.glow} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <TrendingUp size={16} className="text-emerald-400 opacity-50" />
      </div>
      <div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
    </div>
  )
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
  viewed:    { label: 'Viewed',    cls: 'bg-blue-500/15 text-blue-300 border-blue-500/20' },
  responded: { label: 'Responded', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
  rejected:  { label: 'Rejected',  cls: 'bg-red-500/15 text-red-300 border-red-500/20' },
}

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const { data, isLoading } = useDashboard()

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-10 animate-fade-up opacity-0">
        <div>
          <p className="text-text-secondary text-sm mb-1">Good day,</p>
          <h1 className="text-h1 text-white">
            {user?.name?.split(' ')[0]}{' '}
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-text-secondary mt-1.5 text-sm">Here's how your listings are performing</p>
        </div>
        <Link
          to="/dashboard/listings/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg shadow-primary-glow/25 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all no-underline text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Listing</span>
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-36" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Home size={20} className="text-white" />}        label="Total Listings" value={data?.totalListings ?? 0}  colorIdx={0} delay={0} />
          <StatCard icon={<Eye size={20} className="text-white" />}         label="Total Views"    value={data?.totalViews ?? 0}     colorIdx={1} delay={100} />
          <StatCard icon={<Bookmark size={20} className="text-white" />}    label="Total Saves"    value={data?.totalSaves ?? 0}     colorIdx={2} delay={200} />
          <StatCard icon={<MessageSquare size={20} className="text-white" />} label="Inquiries"    value={data?.totalInquiries ?? 0} colorIdx={3} delay={300} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Listings — 2 cols */}
        <div className="lg:col-span-2 glass-card p-6 animate-fade-up opacity-0 delay-400">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Recent Listings</h2>
            <Link to="/dashboard/listings" className="flex items-center gap-1 text-sm text-primary-light hover:text-white transition-colors no-underline">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : !data?.recentListings?.length ? (
            <div className="text-center py-12">
              <LayoutDashboard size={40} className="mx-auto mb-3 text-text-muted opacity-40" />
              <p className="text-text-secondary mb-4 text-sm">No listings yet. Add your first PG!</p>
              <Link to="/dashboard/listings/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:brightness-110 transition-all no-underline">
                <Plus size={15} /> Add Listing
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.recentListings.map((l, i) => (
                <Link
                  key={l._id}
                  to={`/dashboard/listings/${l._id}/edit`}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-white/6 bg-white/2 hover:bg-white/5 hover:border-primary/20 transition-all duration-200 no-underline group animate-fade-up opacity-0"
                  style={{ animationDelay: `${(i + 4) * 80}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/8">
                    <img
                      src={l.images?.[0]?.url || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=60`}
                      alt={l.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-primary-light transition-colors">{l.title}</p>
                    <p className="text-xs text-text-muted capitalize mt-0.5">
                      {l.location?.city} · ₹{l.rent?.toLocaleString()}/mo
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Eye size={12} /> {l.analytics?.views}
                    </span>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                      l.isAvailable
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                        : 'bg-red-500/15 text-red-300 border-red-500/20'
                    }`}>
                      {l.isAvailable ? 'Open' : 'Full'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Inquiry Status — 1 col */}
        <div className="glass-card p-6 animate-fade-up opacity-0 delay-500">
          <h2 className="text-lg font-bold text-white mb-5">Inquiry Status</h2>
          {data?.inquiryByStatus ? (
            <div className="flex flex-col gap-3">
              {Object.entries(data.inquiryByStatus).map(([status, count]) => {
                const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-white/10 text-white border-white/15' }
                const total = data.totalInquiries || 1
                const pct = Math.round(((count as number) / total) * 100)
                return (
                  <div key={status} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      <span className="text-white font-bold text-sm">{count as number}</span>
                    </div>
                    <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-primary transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center py-8">No inquiry data yet</p>
          )}

          {/* Quick links */}
          <div className="mt-6 pt-5 border-t border-white/6 flex flex-col gap-2">
            <Link to="/dashboard/inquiries" className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/6 hover:border-white/12 transition-all no-underline group">
              <span className="text-sm text-text-secondary group-hover:text-white transition-colors flex items-center gap-2">
                <MessageSquare size={14} /> View all inquiries
              </span>
              <ArrowRight size={14} className="text-text-muted group-hover:text-primary-light transition-colors" />
            </Link>
            <Link to="/dashboard/listings" className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/6 hover:border-white/12 transition-all no-underline group">
              <span className="text-sm text-text-secondary group-hover:text-white transition-colors flex items-center gap-2">
                <Home size={14} /> Manage listings
              </span>
              <ArrowRight size={14} className="text-text-muted group-hover:text-primary-light transition-colors" />
            </Link>
          </div>
        </div>

      </div>
    </MainLayout>
  )
}

export default DashboardPage
