import React from 'react'
import { MessageSquare, Clock, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { useStudentInquiries } from '@/features/pg/hooks/usePG'
import type { Inquiry } from '@/features/pg/pg.types'

const statusStyle: Record<string, string> = {
  pending:   'badge-amber',
  viewed:    'badge-blue',
  responded: 'badge-green',
  closed:    'badge-red',
}

const InquiriesPage: React.FC = () => {
  const { data: inquiries = [], isLoading } = useStudentInquiries()

  return (
    <MainLayout>
      <h1 className="text-h1 text-white mb-8 flex items-center gap-3">
        <MessageSquare size={28} className="text-primary" />
        My Inquiries
      </h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="glass-card p-16 text-center fade-in">
          <MessageSquare size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
          <h3 className="text-h3 text-white mb-2">No inquiries sent yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Find a PG you like and send an inquiry to the owner
          </p>
          <Link to="/listings" className="btn btn-primary">Browse Listings</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(inquiries as Inquiry[]).map((inq) => (
            <div key={inq._id} id={`student-inq-${inq._id}`} className="glass-card p-5 fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {inq.pg && (
                    <Link
                      to={`/listings/${inq.pg._id}`}
                      className="flex items-center gap-1 text-primary-light hover:text-white transition-colors text-sm font-medium mb-2 no-underline"
                    >
                      {inq.pg.title} <ExternalLink size={12} />
                    </Link>
                  )}
                  <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>{inq.message}</p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <span className={`badge ${statusStyle[inq.status]} capitalize shrink-0`}>{inq.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  )
}

export default InquiriesPage
