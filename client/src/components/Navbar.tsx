import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, Search, Bookmark, MessageSquare, LayoutDashboard,
  LogOut, Menu, X, Plus, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useLogout } from '@/features/auth/hooks/useAuth'

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  React.useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/')

  const navLinks = React.useMemo(() => {
    if (!isAuthenticated) return []
    if (user?.role === 'owner') {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/dashboard/listings', label: 'Listings', icon: Home },
        { to: '/dashboard/inquiries', label: 'Inquiries', icon: MessageSquare },
      ]
    }
    return [
      { to: '/listings', label: 'Browse PGs', icon: Search },
      { to: '/saved', label: 'Saved', icon: Bookmark },
      { to: '/my-inquiries', label: 'Inquiries', icon: MessageSquare },
    ]
  }, [isAuthenticated, user?.role])

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-bg/90 backdrop-blur-2xl border-b border-white/8 shadow-xl shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline shrink-0 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 9v13h6v-6h6v6h6V9L12 2z" fill="white" />
                </svg>
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              anei<span className="gradient-text">ghar</span>
            </span>
          </Link>

          {/* Desktop: pill nav links */}
          {isAuthenticated && navLinks.length > 0 && (
            <div className="hidden md:flex items-center gap-1 glass rounded-full px-2 py-1.5 border border-white/8">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 no-underline ${
                    isActive(to)
                      ? 'bg-primary text-white shadow-md shadow-primary-glow'
                      : 'text-text-secondary hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop: right actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'owner' && (
                  <button
                    onClick={() => navigate('/dashboard/listings/new')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:brightness-110 shadow-lg shadow-primary-glow/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Plus size={15} />
                    New Listing
                  </button>
                )}
                <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
                  <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary-glow/20 ring-2 ring-primary/20">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-text-secondary hidden lg:block max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={() => logout.mutate()}
                    disabled={logout.isPending}
                    className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all duration-200"
                    title="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-white/6 transition-all duration-200 no-underline"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:brightness-110 shadow-lg shadow-primary-glow/30 transition-all duration-200 hover:-translate-y-0.5 no-underline"
                >
                  Get Started <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/6 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer panel */}
        <div
          className={`absolute top-16 left-0 right-0 glass border-b border-white/8 p-4 flex flex-col gap-2 transition-all duration-300 ${
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 no-underline ${
                isActive(to)
                  ? 'bg-primary/15 text-white border border-primary/25'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <div className="h-px bg-white/8 my-1" />

          {isAuthenticated ? (
            <button
              onClick={() => logout.mutate()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-error hover:bg-error/10 transition-all duration-200 text-left"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" className="px-4 py-3 rounded-xl text-center font-medium text-text-secondary border border-white/10 hover:bg-white/5 transition-colors no-underline">
                Login
              </Link>
              <Link to="/register" className="px-4 py-3 rounded-xl text-center font-semibold text-white bg-gradient-primary hover:brightness-110 transition-all no-underline">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar
