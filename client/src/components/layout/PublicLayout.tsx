import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Home, Search, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Footer } from './Footer';
import logo from '@/assets/logo.png';

export function PublicLayout() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
    { label: 'Browse PGs', href: '/pg', icon: <Search className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(222,47%,6%)] text-white select-none">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-[hsl(222,47%,6%)]/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-500/20">
              <img src={logo} className="h-5 w-5 object-contain" alt="Anei Ghar Logo" />
            </div>
            <span className="gradient-text text-xl font-bold tracking-tight">Anei Ghar</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-violet-600/10 text-violet-300 shadow-sm'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Authentication CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <Button size="sm" onClick={() => navigate('/dashboard')} id="header-dashboard-btn" className="glow-violet">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" id="header-signin-btn">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" id="header-signup-btn">
                    <UserPlus className="h-4 w-4" />
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-white/60 hover:bg-white/5 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-white/8 bg-[hsl(222,47%,7%)]/95 p-6 shadow-xl backdrop-blur-lg md:hidden animate-fade-in">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    active
                      ? 'bg-violet-600/20 text-violet-300'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-white/8 pt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full justify-center">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button className="w-full justify-center">
                      <UserPlus className="h-4 w-4" />
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Layout Wrapper */}
      <main className="flex-1 overflow-hidden py-12 px-6 md:px-12 max-w-7xl mx-auto w-full animate-fade-in">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
