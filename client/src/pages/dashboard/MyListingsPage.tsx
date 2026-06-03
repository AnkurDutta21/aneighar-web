import { Link } from 'react-router-dom';
import { useMyListings, useDeletePG } from '@/hooks/usePG';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Building2, Eye, MessageSquare, PlusCircle, Pencil, Trash2 } from 'lucide-react';

export function MyListingsPage() {
  const { data, isLoading } = useMyListings();
  const deletePG = useDeletePG();
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My PG Listings</h1>
          <p className="text-white/50">Manage and monitor your properties</p>
        </div>
        <Link to="/dashboard/listings/new">
          <Button id="create-listing-btn">
            <PlusCircle className="h-4 w-4" />
            Add New Listing
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-violet-400" />
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
              <Building2 className="mx-auto mb-3 h-12 w-12 text-white/20" />
              <p className="text-white/40">You have no listings yet</p>
              <Link to="/dashboard/listings/new" className="mt-4 inline-block">
                <Button id="first-listing-btn">Create Your First Listing</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((pg) => (
                <div
                  key={pg._id}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 p-4 hover:border-violet-500/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                      {pg.images?.[0] ? (
                        <img src={pg.images[0].url} alt={pg.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Building2 className="h-6 w-6 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{pg.title}</p>
                      <p className="text-sm text-white/40">{pg.location.city} · {formatCurrency(pg.rent)}/mo · {pg.roomType}</p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-white/30">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {pg.analytics?.views ?? 0} views</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {pg.analytics?.inquiries ?? 0} inquiries</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={pg.availableRooms > 0 ? 'success' : 'destructive'}>
                      {pg.availableRooms > 0 ? `${pg.availableRooms} available` : 'Full'}
                    </Badge>
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
                      className="text-white/40 hover:text-red-400"
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
