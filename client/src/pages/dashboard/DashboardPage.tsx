import { useDashboard } from '@/hooks/useInquiry';
import { useMyListings } from '@/hooks/usePG';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Building2, Eye, MessageSquare, Heart, PlusCircle,
  BarChart3,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function StatCard({
  icon, label, value, color = 'violet',
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: 'violet' | 'cyan' | 'emerald' | 'amber';
}) {
  const colors = {
    violet: 'bg-violet-500/10 text-violet-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };
  return (
    <Card glow>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50">{label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{value}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: dashData, isLoading: dashLoading } = useDashboard();
  const { data: listingsData, isLoading: listLoading } = useMyListings();

  const isOwner = user?.role === 'owner';
  const stats = dashData?.data;
  const listings = listingsData?.data?.listings ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/50">
            {isOwner ? "Here's how your PGs are performing" : "Manage your PG search"}
          </p>
        </div>
        {isOwner && (
          <Link to="/dashboard/listings/new">
            <Button id="add-listing-btn">
              <PlusCircle className="h-4 w-4" />
              Add Listing
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      {isOwner && (
        <>
          {dashLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<Building2 className="h-6 w-6" />} label="Active Listings" value={stats?.availableListings ?? 0} color="violet" />
              <StatCard icon={<Eye className="h-6 w-6" />} label="Total Views" value={stats?.totalViews ?? 0} color="cyan" />
              <StatCard icon={<MessageSquare className="h-6 w-6" />} label="Inquiries" value={stats?.totalInquiries ?? 0} color="emerald" />
              <StatCard icon={<Heart className="h-6 w-6" />} label="Total Saves" value={stats?.totalSaves ?? 0} color="amber" />
            </div>
          )}
        </>
      )}

      {/* Student stats */}
      {!isOwner && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={<Building2 className="h-6 w-6" />} label="Browse PGs" value="1,200+" color="violet" />
          <StatCard icon={<Heart className="h-6 w-6" />} label="Saved PGs" value={stats?.totalSaves ?? 0} color="cyan" />
          <StatCard icon={<MessageSquare className="h-6 w-6" />} label="My Inquiries" value={stats?.totalInquiries ?? 0} color="emerald" />
        </div>
      )}

      {/* My Listings (Owner) */}
      {isOwner && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Listings</CardTitle>
              <Link to="/dashboard/listings">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {listLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : listings.length === 0 ? (
              <div className="py-8 text-center">
                <Building2 className="mx-auto mb-3 h-10 w-10 text-white/20" />
                <p className="text-white/40">No listings yet</p>
                <Link to="/dashboard/listings/new" className="mt-3 inline-block">
                  <Button size="sm">Create your first listing</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.slice(0, 5).map((pg) => (
                  <div key={pg._id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
                        <Building2 className="h-5 w-5 text-violet-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{pg.title}</p>
                        <p className="text-sm text-white/40">{pg.location.city} · {formatCurrency(pg.rent)}/mo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden gap-4 text-sm text-white/40 sm:flex">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {pg.analytics?.views ?? 0}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {pg.analytics?.inquiries ?? 0}</span>
                      </div>
                      <Badge variant={pg.availableRooms > 0 ? 'success' : 'destructive'}>
                        {pg.availableRooms > 0 ? 'Active' : 'Full'}
                      </Badge>
                      <Link to={`/dashboard/listings/${pg._id}/edit`}>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/pg">
              <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 p-4 hover:border-violet-500/30 hover:bg-white/8 transition-all cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Browse PGs</p>
                  <p className="text-xs text-white/40">Explore all listings</p>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/inquiries">
              <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 p-4 hover:border-violet-500/30 hover:bg-white/8 transition-all cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Inquiries</p>
                  <p className="text-xs text-white/40">{isOwner ? 'View inbox' : 'My inquiries'}</p>
                </div>
              </div>
            </Link>
            {!isOwner && (
              <Link to="/dashboard/saved">
                <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 p-4 hover:border-violet-500/30 hover:bg-white/8 transition-all cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Saved PGs</p>
                    <p className="text-xs text-white/40">Your wishlist</p>
                  </div>
                </div>
              </Link>
            )}
            {isOwner && (
              <Link to="/dashboard/listings/new">
                <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 p-4 hover:border-violet-500/30 hover:bg-white/8 transition-all cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                    <PlusCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Add PG</p>
                    <p className="text-xs text-white/40">Create new listing</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
