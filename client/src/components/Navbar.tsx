import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Search, Bookmark, MessageSquare, LayoutDashboard, LogOut, Menu, X, Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useLogout } from '@/features/auth/hooks/useAuth'

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const logout = useLogout()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleLogout = () => {
    logout.mutate()
    setMobileOpen(false)
  }

  const navLinks = React.useMemo(() => {
    if (!isAuthenticated) return []
    if (user?.role === 'owner') {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/dashboard/listings', label: 'My Listings', icon: Home },
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
    <nav className="navbar" id="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 9v13h18V9L12 2z" fill="white" opacity="0.9"/>
              <path d="M12 2L3 9l9-2 9 2L12 2z" fill="white"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            anei<span className="gradient-text">ghar</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="btn btn-ghost btn-sm text-sm flex items-center gap-1.5"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === 'owner' && (
                <button
                  id="add-listing-btn"
                  onClick={() => navigate('/dashboard/listings/new')}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={15} />
                  Add Listing
                </button>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-300 max-w-[120px] truncate">{user?.name}</span>
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                disabled={logout.isPending}
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          id="mobile-menu-btn"
          className="md:hidden btn btn-ghost btn-sm p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/8 px-4 py-4 flex flex-col gap-2 bg-bg-card/95 backdrop-blur-xl fade-in">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="btn btn-ghost text-left justify-start gap-2"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div className="divider" />
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn btn-ghost justify-start gap-2 text-red-400">
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-outline">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
