import { useOwnerInquiries, useStudentInquiries, useUpdateInquiryStatus } from '@/hooks/useInquiry';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Phone, Clock } from 'lucide-react';
import { useState } from 'react';
import type { Inquiry } from '@/types';

const statusBadge = (status: string) => {
  if (status === 'responded') return <Badge variant="success">Responded</Badge>;
  if (status === 'closed') return <Badge variant="outline">Closed</Badge>;
  return <Badge variant="warning">Pending</Badge>;
};

function InquiryCard({ inquiry, isOwner }: { inquiry: Inquiry; isOwner: boolean }) {
  const updateStatus = useUpdateInquiryStatus();
  const { addToast } = useUIStore();

  const handleStatus = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ id: inquiry._id, status });
      addToast({ title: 'Status updated', variant: 'success' });
    } catch {
      addToast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const pg = typeof inquiry.pg === 'object' ? inquiry.pg : null;
  const student = typeof inquiry.student === 'object' ? inquiry.student : null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-5 space-y-3 hover:border-violet-500/20 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {isOwner && student && (
            <p className="font-medium text-white">{student.name}</p>
          )}
          {pg && (
            <p className="text-sm text-violet-400">{typeof pg === 'object' ? pg.title : ''}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusBadge(inquiry.status)}
        </div>
      </div>
      <div className="rounded-xl bg-white/5 px-4 py-3 text-sm text-white/60 italic">
        "{inquiry.message}"
      </div>
      <div className="flex items-center justify-between text-xs text-white/30">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" /> {inquiry.phone}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatDate(inquiry.createdAt)}
          </span>
        </div>
        {isOwner && inquiry.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatus('responded')}
              loading={updateStatus.isPending}
              id={`mark-responded-${inquiry._id}`}
            >
              Mark Responded
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStatus('closed')}
              id={`close-inquiry-${inquiry._id}`}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function InquiriesPage() {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner';
  const [statusFilter, setStatusFilter] = useState('');

  const { data: ownerData, isLoading: ownerLoading } = useOwnerInquiries(
    isOwner ? { status: statusFilter || undefined } : undefined
  );
  const { data: studentData, isLoading: studentLoading } = useStudentInquiries();

  const isLoading = isOwner ? ownerLoading : studentLoading;

  const inquiries: Inquiry[] = isOwner
    ? (ownerData?.inquiries ?? [])
    : (studentData?.data?.inquiries ?? []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isOwner ? 'Inquiry Inbox' : 'My Inquiries'}
          </h1>
          <p className="text-white/50">
            {isOwner ? 'Manage inquiries from students' : 'Track your PG inquiries'}
          </p>
        </div>
        {isOwner && (
          <Select
            id="status-filter"
            options={[
              { value: '', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'responded', label: 'Responded' },
              { value: 'closed', label: 'Closed' },
            ]}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-violet-400" />
            {inquiries.length} {inquiries.length === 1 ? 'Inquiry' : 'Inquiries'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-white/20" />
              <p className="text-white/40">No inquiries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inquiry) => (
                <InquiryCard key={inquiry._id} inquiry={inquiry} isOwner={isOwner} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
