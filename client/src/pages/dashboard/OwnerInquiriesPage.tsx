import React from 'react'
import { MessageSquare, User, Clock, ChevronDown } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { useOwnerInquiries, useUpdateInquiryStatus } from '@/features/pg/hooks/usePG'
import type { Inquiry } from '@/features/pg/pg.types'

const STATUS_OPTIONS = ['pending', 'viewed', 'responded', 'closed']

const statusStyle: Record<string, string> = {
  pending:   'badge-amber',
  viewed:    'badge-blue',
  responded: 'badge-green',
  closed:    'badge-red',
}

const OwnerInquiriesPage: React.FC = () => {
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>()
  const { data, isLoading } = useOwnerInquiries(page, statusFilter)
  const updateStatus = useUpdateInquiryStatus()

  const inquiries: Inquiry[] = data?.inquiries || []

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-h1 text-white">Inquiries</h1>
        <select
          id="status-filter"
          value={statusFilter || ''}
          onChange={(e) => { setStatusFilter(e.target.value || undefined); setPage(1) }}
          className="input w-auto cursor-pointer"
          style={{ borderRadius: 'var(--radius-button)', padding: '0.5rem 1rem' }}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} style={{ background: '#111827' }} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="glass-card p-16 text-center fade-in">
          <MessageSquare size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
          <h3 className="text-h3 text-white mb-2">No inquiries yet</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Inquiries from students will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {inquiries.map((inq) => (
            <div key={inq._id} id={`inquiry-${inq._id}`} className="glass-card p-5 fade-in">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {inq.student?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{inq.student?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{inq.student?.email}</p>
                  </div>
                </div>
                <span className={`badge ${statusStyle[inq.status]} capitalize shrink-0`}>{inq.status}</span>
              </div>

              <p className="text-sm mb-3 pl-12" style={{ color: 'var(--color-text-secondary)' }}>
                {inq.message}
              </p>

              <div className="flex items-center justify-between pl-12">
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="flex items-center gap-1"><Clock size={12} />
                    {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {inq.phone && (
                    <span className="flex items-center gap-1"><User size={12} /> {inq.phone}</span>
                  )}
                </div>

                {/* Status Updater */}
                <div className="relative">
                  <select
                    id={`status-update-${inq._id}`}
                    value={inq.status}
                    onChange={(e) => updateStatus.mutate({ id: inq._id, status: e.target.value })}
                    className="text-xs pr-6 pl-2 py-1 rounded-lg cursor-pointer appearance-none"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} style={{ background: '#111827' }} className="capitalize">{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
              </div>

              {inq.pg && (
                <div className="mt-3 pt-3 pl-12 text-xs" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  Re: <span className="text-primary-light">{inq.pg.title}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-outline btn-sm">Prev</button>
          <span className="text-sm text-gray-400 self-center">Page {page} of {data.totalPages}</span>
          <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-outline btn-sm">Next</button>
        </div>
      )}
    </MainLayout>
  )
}

export default OwnerInquiriesPage
