import { useSavedListings, useToggleSave } from '@/hooks/useInquiry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Trash2, BedDouble } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { PGListing } from '@/types';

export function SavedListingsPage() {
  const { data, isLoading } = useSavedListings();
  const toggleSave = useToggleSave();

  const saved: { pg: PGListing }[] = data?.data?.saved ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Saved PGs</h1>
        <p className="text-white/50">Your wishlist of saved PG listings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-400" />
            {saved.length} Saved {saved.length === 1 ? 'Listing' : 'Listings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
            </div>
          ) : saved.length === 0 ? (
            <div className="py-12 text-center">
              <Heart className="mx-auto mb-3 h-10 w-10 text-white/20" />
              <p className="text-white/40">No saved listings yet</p>
              <Link to="/pg" className="mt-3 inline-block">
                <Button size="sm" variant="outline">Browse PGs</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map(({ pg }) => (
                <div key={pg._id} className="group rounded-2xl border border-white/8 bg-white/5 overflow-hidden hover:border-violet-500/20 transition-all">
                  <div className="relative h-40 bg-gradient-to-br from-violet-900/20 to-slate-900">
                    {pg.images?.[0] ? (
                      <img src={pg.images[0].url} alt={pg.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BedDouble className="h-10 w-10 text-white/20" />
                      </div>
                    )}
                    <button
                      onClick={() => toggleSave.mutate(pg._id)}
                      className="absolute right-2 top-2 rounded-full p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                      id={`unsave-${pg._id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 font-semibold text-white line-clamp-1">{pg.title}</h3>
                    <div className="mb-2 flex items-center gap-1 text-xs text-white/40">
                      <MapPin className="h-3 w-3" />
                      <span>{pg.location.city}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-violet-400">{formatCurrency(pg.rent)}<span className="text-xs font-normal text-white/40">/mo</span></span>
                      <Link to={`/pg/${pg._id}`}>
                        <Button size="sm" variant="outline" id={`view-saved-${pg._id}`}>View</Button>
                      </Link>
                    </div>
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
