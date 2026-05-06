import React from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, ArrowRight, ExternalLink, Clock, CheckCircle2, Eye, XCircle, Loader2 } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { useOwnerInquiries, useUpdateInquiryStatus } from '@/features/inquiry/hooks/useInquiry'

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   cls: 'bg-amber-500/15 text-amber-300 border-amber-500/20',   icon: <Clock size={12} /> },
  viewed:    { label: 'Viewed',    cls: 'bg-blue-500/15 text-blue-300 border-blue-500/20',       icon: <Eye size={12} /> },
  responded: { label: 'Responded', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
  rejected:  { label: 'Rejected',  cls: 'bg-red-500/15 text-red-300 border-red-500/20',         icon: <XCircle size={12} /> },
}

const NEXT_STATUS: Record<string, string | null> = {
  pending: 'viewed',
  viewed:  'responded',
  responded: null,
  rejected: null,
}

const OwnerInquiriesPage: React.FC = () => {
  const { data: inquiries, isLoading } = useOwnerInquiries()
  const updateStatus = useUpdateInquiryStatus()
  const [filter, setFilter] = React.useState<string>('all')

  const filtered = React.useMemo(() => {
    if (!inquiries) return []
    if (filter === 'all') return inquiries
    return inquiries.filter((inq: any) => inq.status === filter)
  }, [inquiries, filter])

  return (
    <MainLayout>
      <div className="mb-8 animate-fade-up opacity-0">
        <h1 className="text-h1 text-white mb-1">Inquiries</h1>
        <p className="text-text-secondary text-sm">
          {inquiries?.length ?? 0} total inquiries from students
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 animate-fade-up opacity-0 delay-100">
        {['all', 'pending', 'viewed', 'responded', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize shrink-0 transition-all duration-200 border ${
              filter === tab
                ? 'bg-primary/20 border-primary/35 text-primary-light'
                : 'bg-white/3 border-white/8 text-text-secondary hover:text-white hover:border-white/15'
            }`}
          >
            {tab === 'all' ? `All (${inquiries?.length ?? 0})` : tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-28" />
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="glass-card p-16 text-center animate-scale-in">
          <MessageSquare size={40} className="mx-auto mb-3 text-text-muted opacity-40" />
          <h3 className="text-lg font-bold text-white mb-2">No inquiries yet</h3>
          <p className="text-text-secondary text-sm">
            {filter === 'all' ? 'Students will send inquiries here once they see your listings.' : `No ${filter} inquiries.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((inq: any, i: number) => {
            const cfg = STATUS_CONFIG[inq.status] || STATUS_CONFIG.pending
            const next = NEXT_STATUS[inq.status]
            return (
              <div
                key={inq._id}
                className="glass-card p-5 flex flex-col sm:flex-row gap-4 animate-fade-up opacity-0"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Left: student info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-glow/20">
                    {inq.student?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm">{inq.student?.name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-2">{inq.student?.email}</p>
                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{inq.message}</p>
                    {inq.phone && (
                      <p className="text-xs text-primary-light mt-1.5">📞 {inq.phone}</p>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex flex-col gap-2 sm:items-end shrink-0">
                  <Link
                    to={`/listings/${inq.pg?._id}`}
                    className="flex items-center gap-1.5 text-xs text-primary-light hover:text-white transition-colors no-underline"
                  >
                    <ExternalLink size={12} />
                    <span className="line-clamp-1 max-w-[160px]">{inq.pg?.title}</span>
                  </Link>
                  <p className="text-xs text-text-muted">
                    {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {next && (
                    <button
                      onClick={() => updateStatus.mutate({ id: inq._id, status: next })}
                      disabled={updateStatus.isPending}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/8 text-xs font-medium text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/15 transition-all"
                    >
                      {updateStatus.isPending && updateStatus.variables?.id === inq._id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <ArrowRight size={12} />
                      }
                      Mark as {next}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </MainLayout>
  )
}

export default OwnerInquiriesPage
