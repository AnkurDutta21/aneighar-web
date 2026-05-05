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
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-bg/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 9v13h18V9L12 2z" fill="white" opacity="0.9"/>
              <path d="M12 2L3 9l9-2 9 2L12 2z" fill="white"/>
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            anei<span className="text-primary-light">ghar</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role === 'owner' && (
                <button
                  onClick={() => navigate('/dashboard/listings/new')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-primary hover:brightness-110 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                  <Plus size={16} />
                  Add Listing
                </button>
              )}
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="w-8 h-8 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center text-primary-light text-sm font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  disabled={logout.isPending}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-5 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Login</Link>
              <Link to="/register" className="px-5 py-2 rounded-full text-sm font-medium text-white bg-gradient-primary hover:brightness-110 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-4 flex flex-col gap-2 bg-bg/95 backdrop-blur-xl absolute w-full shadow-2xl fade-in">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <div className="h-px bg-white/10 my-2" />
          {isAuthenticated ? (
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors w-full text-left">
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-center font-medium text-gray-300 border border-white/10 hover:bg-white/5">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-center font-medium text-white bg-gradient-primary">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
