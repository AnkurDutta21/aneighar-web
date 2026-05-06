import React from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, ExternalLink, Clock, CheckCircle2, Eye, XCircle } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { useMyInquiries } from '@/features/inquiry/hooks/useInquiry'

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   cls: 'bg-amber-500/15 text-amber-300 border-amber-500/20',   icon: <Clock size={12} /> },
  viewed:    { label: 'Viewed',    cls: 'bg-blue-500/15 text-blue-300 border-blue-500/20',       icon: <Eye size={12} /> },
  responded: { label: 'Responded', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
  rejected:  { label: 'Rejected',  cls: 'bg-red-500/15 text-red-300 border-red-500/20',         icon: <XCircle size={12} /> },
}

const InquiriesPage: React.FC = () => {
  const { data: inquiries, isLoading } = useMyInquiries()

  return (
    <MainLayout>
      <div className="mb-8 animate-fade-up opacity-0">
        <h1 className="text-h1 text-white mb-1">My Inquiries</h1>
        <p className="text-text-secondary text-sm">
          Track the status of all your PG inquiries
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-24" />)}
        </div>
      ) : !inquiries?.length ? (
        <div className="glass-card p-16 text-center animate-scale-in">
          <MessageSquare size={40} className="mx-auto mb-3 text-text-muted opacity-40" />
          <h3 className="text-xl font-bold text-white mb-2">No inquiries sent yet</h3>
          <p className="text-text-secondary mb-6 text-sm">
            Browse PGs and send inquiries to landlords. You'll track them here.
          </p>
          <Link to="/listings" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:brightness-110 transition-all no-underline">
            Browse PGs
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {inquiries.map((inq: any, i: number) => {
            const cfg = STATUS_CONFIG[inq.status] || STATUS_CONFIG.pending
            return (
              <div
                key={inq._id}
                className="glass-card p-5 flex flex-col sm:flex-row gap-4 animate-fade-up opacity-0"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {/* PG Image */}
                <div className="w-full sm:w-24 h-20 sm:h-20 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={inq.pg?.images?.[0]?.url || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=70`}
                    alt={inq.pg?.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Link
                      to={`/listings/${inq.pg?._id}`}
                      className="text-white font-semibold text-sm hover:text-primary-light transition-colors flex items-center gap-1 no-underline line-clamp-1"
                    >
                      {inq.pg?.title}
                      <ExternalLink size={12} />
                    </Link>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-2">{inq.message}</p>
                  <p className="text-xs text-text-muted">
                    Sent {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Rent */}
                <div className="text-right shrink-0">
                  <p className="text-white font-bold">₹{inq.pg?.rent?.toLocaleString()}</p>
                  <p className="text-xs text-text-muted">/month</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </MainLayout>
  )
}

export default InquiriesPage
