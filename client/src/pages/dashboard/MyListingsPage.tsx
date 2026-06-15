import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyListings, useDeletePG, useUpdatePG } from '@/hooks/usePG';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Building2, Eye, MessageSquare, PlusCircle, Pencil, Trash2, Minus, Plus, Loader2 } from 'lucide-react';
import type { PGListing } from '@/types';

export function MyListingsPage() {
  const { data, isLoading } = useMyListings();
  const deletePG = useDeletePG();
  const updatePG = useUpdatePG();
  const { addToast } = useUIStore();

  const listings = data?.data?.listings ?? [];

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deletePG.mutateAsync(id);
      addToast({ title: 'Listing deleted', variant: 'success' });
    } catch {
      addToast({ title: 'Failed to delete listing', variant: 'destructive' });
    }
  };

  /** Quick vacancy inline control */
  function VacancyControl({ pg }: { pg: PGListing }) {
    const [rooms, setRooms] = useState(pg.availableRooms);
    const [saving, setSaving] = useState(false);

    const update = async (next: number) => {
      if (next < 0 || next > pg.totalRooms) return;
      setRooms(next);
      setSaving(true);
      try {
        await updatePG.mutateAsync({ id: pg._id, payload: { availableRooms: next } as never });
      } catch {
        setRooms(pg.availableRooms); // revert on failure
        addToast({ title: 'Failed to update vacancy', variant: 'destructive' });
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => update(rooms - 1)}
          disabled={rooms <= 0 || saving}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-850 disabled:cursor-not-allowed disabled:opacity-30 border border-slate-200"
          title="Decrease available rooms"
          id={`vacancy-dec-${pg._id}`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <div className="flex h-6 min-w-[2.5rem] items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-800">
          {saving ? <Loader2 className="h-3 w-3 animate-spin text-blue-600" /> : `${rooms}/${pg.totalRooms}`}
        </div>
        <button
          onClick={() => update(rooms + 1)}
          disabled={rooms >= pg.totalRooms || saving}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-850 disabled:cursor-not-allowed disabled:opacity-30 border border-slate-200"
          title="Increase available rooms"
          id={`vacancy-inc-${pg._id}`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My PG Listings</h1>
          <p className="text-slate-500">Manage and monitor your properties</p>
        </div>
        <Link to="/dashboard/listings/new">
          <Button id="create-listing-btn">
            <PlusCircle className="h-4 w-4" />
            Add New Listing
          </Button>
        </Link>
      </div>

      <Card className="premium-shadow border border-slate-100 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            {listings.length} {listings.length === 1 ? 'Listing' : 'Listings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-slate-500">You have no listings yet</p>
              <Link to="/dashboard/listings/new" className="mt-4 inline-block">
                <Button id="first-listing-btn">Create Your First Listing</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((pg) => (
                <div
                  key={pg._id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-50 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200 relative">
                      {pg.images?.[0] ? (
                        <>
                          <img
                            src={pg.images[0].url}
                            alt={pg.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-100">
                            <Building2 className="h-6 w-6 text-slate-350" />
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100">
                          <Building2 className="h-6 w-6 text-slate-355" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{pg.title}</p>
                      <p className="text-sm text-slate-500 font-medium">{pg.location.city} · {formatCurrency(pg.rent)}/mo · {pg.roomType}</p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {pg.analytics?.views ?? 0} views</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {pg.analytics?.inquiries ?? 0} inquiries</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={pg.availableRooms > 0 ? 'success' : 'destructive'}>
                        {pg.availableRooms > 0 ? 'Active' : 'Full'}
                      </Badge>
                      <VacancyControl pg={pg} />
                    </div>
                    <Link to={`/pg/${pg._id}`}>
                      <Button size="icon" variant="ghost" title="View" id={`view-${pg._id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/dashboard/listings/${pg._id}/edit`}>
                      <Button size="icon" variant="ghost" title="Edit" id={`edit-${pg._id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Delete"
                      className="text-slate-400 hover:text-red-500"
                      onClick={() => handleDelete(pg._id)}
                      loading={deletePG.isPending}
                      id={`delete-${pg._id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
