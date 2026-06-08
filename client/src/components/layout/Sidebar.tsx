import { Link, useLocation } from 'react-router-dom';
import {
  Home, Search, Heart, MessageSquare, LayoutDashboard,
  PlusCircle, Building2, Menu, X, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useLogout } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  role?: 'student' | 'owner' | 'any';
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: <Home className="h-4 w-4" />, role: 'any' },
  { label: 'Browse PGs', href: '/pg', icon: <Search className="h-4 w-4" />, role: 'any' },
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, role: 'any' },
  { label: 'My Listings', href: '/dashboard/listings', icon: <Building2 className="h-4 w-4" />, role: 'owner' },
  { label: 'Add Listing', href: '/dashboard/listings/new', icon: <PlusCircle className="h-4 w-4" />, role: 'owner' },
  { label: 'Inquiries', href: '/dashboard/inquiries', icon: <MessageSquare className="h-4 w-4" />, role: 'any' },
  { label: 'Saved', href: '/dashboard/saved', icon: <Heart className="h-4 w-4" />, role: 'student' },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();
  const logout = useLogout();

  const filtered = navItems.filter(
    (item) => item.role === 'any' || item.role === user?.role
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-white/8 bg-[hsl(222,47%,7%)]',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-500/20">
              <img src={logo} className="h-5 w-5 object-contain" alt="Anei Ghar Logo" />
            </div>
            <span className="gradient-text text-xl font-bold">Anei Ghar</span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {filtered.map((item) => {
              const active = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-violet-600/20 text-violet-300 shadow-sm'
                        : 'text-white/50 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {item.icon}
                    {item.label}
                    {active && <ChevronRight className="ml-auto h-3 w-3 text-violet-400" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer */}
        {user && (
          <div className="border-t border-white/8 p-4">
            <div className="flex items-center gap-3 rounded-xl p-2">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-white/40 capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => logout.mutate()}
                className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export function Topbar() {
  const { toggleSidebar } = useUIStore();
  return (
    <header className="flex h-16 items-center gap-4 border-b border-white/8 bg-[hsl(222,47%,6%)]/80 px-6 backdrop-blur-md">
      <button
        onClick={toggleSidebar}
        className="rounded-xl p-2 text-white/40 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
}
