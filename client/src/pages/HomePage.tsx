import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Shield, Zap, MapPin, ArrowRight, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur']

const FEATURES = [
  {
    icon: <Search size={22} />,
    title: 'Smart Search',
    desc: 'Filter by city, price, gender, amenities and more to find your perfect PG.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Verified Listings',
    desc: 'All listings are reviewed to ensure quality and accurate information.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Instant Inquiries',
    desc: 'Connect directly with owners in seconds. No middlemen, no hidden fees.',
  },
]

const HomePage: React.FC = () => {
  const [searchCity, setSearchCity] = React.useState('')

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden pt-20 pb-32 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30,144,255,0.18) 0%, transparent 70%)',
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-80 opacity-20"
          style={{ background: 'linear-gradient(to bottom, #1E90FF, transparent)' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{ background: 'rgba(30,144,255,0.1)', border: '1px solid rgba(30,144,255,0.2)', color: '#60AFFF' }}
          >
            <Star size={14} fill="currentColor" /> Find your home away from home
          </div>

          <h1 className="text-display text-white mb-6">
            Find the Perfect PG
            <br />
            <span className="gradient-text">Across India</span>
          </h1>

          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Discover verified PG accommodations for students and working professionals.
            Compare prices, amenities, and connect directly with landlords.
          </p>

          {/* Search Bar */}
          <div className="flex items-center gap-3 max-w-xl mx-auto mb-6">
            <div className="relative flex-1">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="hero-search"
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search by city — Mumbai, Delhi..."
                className="input pl-11"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchCity.trim()) {
                    window.location.href = `/listings?city=${searchCity}`
                  }
                }}
              />
            </div>
            <Link
              to={`/listings${searchCity ? `?city=${searchCity}` : ''}`}
              id="hero-search-btn"
              className="btn btn-primary btn-lg shrink-0"
            >
              <Search size={18} /> Search
            </Link>
          </div>

          {/* City Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {CITIES.map((city) => (
              <Link
                key={city}
                to={`/listings?city=${city}`}
                id={`city-pill-${city.toLowerCase()}`}
                className="px-4 py-1.5 rounded-full text-sm transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-10 px-4" style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '10,000+', label: 'PG Listings' },
            { value: '50+', label: 'Cities' },
            { value: '1 Lakh+', label: 'Happy Tenants' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold gradient-text">{value}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-h1 text-white text-center mb-3">Why Anei Ghar?</h2>
          <p className="text-center mb-12" style={{ color: 'var(--color-text-secondary)' }}>
            Everything you need to find the right PG, all in one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <div key={i} className="glass-card p-7 text-center">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-button">
                  {icon}
                </div>
                <h3 className="text-h3 text-white mb-2">{title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto glass-card p-12 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(30,144,255,0.1) 0%, rgba(11,61,145,0.08) 100%)' }}
        >
          <h2 className="text-h1 text-white mb-3">List Your PG Today</h2>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Reach thousands of students and professionals looking for quality accommodation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" id="cta-register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/listings" id="cta-browse" className="btn btn-outline btn-lg">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
        © {new Date().getFullYear()} Anei Ghar · Built with ❤️ for students across India
      </footer>
    </div>
  )
}

export default HomePage
