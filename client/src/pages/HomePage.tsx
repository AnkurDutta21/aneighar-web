import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, ShieldCheck, Zap, Building2, ArrowRight, Star, Users, TrendingUp } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'

const CITIES = ['Mumbai', 'Delhi', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai']

const STATS = [
  { value: '2,400+', label: 'Verified PGs', icon: ShieldCheck, color: 'text-emerald-400' },
  { value: '18K+', label: 'Happy Students', icon: Users, color: 'text-blue-400' },
  { value: '95%', label: 'Satisfaction Rate', icon: Star, color: 'text-amber-400' },
  { value: '40+', label: 'Cities Covered', icon: TrendingUp, color: 'text-purple-400' },
]

const FEATURES = [
  {
    icon: Search, color: 'from-blue-500 to-cyan-400',
    title: 'Smart Filtering',
    desc: 'Filter by amenities, room type, gender preference, and price range to find exactly what you need.'
  },
  {
    icon: ShieldCheck, color: 'from-emerald-500 to-teal-400',
    title: 'Verified Listings',
    desc: 'Every property and owner is background-verified for your complete safety and peace of mind.'
  },
  {
    icon: Zap, color: 'from-amber-500 to-orange-400',
    title: 'Zero Brokerage',
    desc: 'Connect directly with landlords. No hidden fees, no middlemen, no commissions ever.'
  },
]

const HomePage: React.FC = () => {
  const [query, setQuery] = React.useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(query.trim() ? `/listings?city=${encodeURIComponent(query)}` : '/listings')
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-28 pb-16">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative pt-10 lg:pt-20 flex flex-col items-center text-center">
          {/* Hero glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-glow pointer-events-none" />

          {/* Badge */}
          <div className="animate-fade-up opacity-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/25 text-primary-light text-xs font-semibold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Premium Student Housing Platform
          </div>

          {/* Headline */}
          <h1 className="text-display max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-slate-100 via-blue-100 to-primary-light mb-6 animate-fade-up opacity-0 delay-100">
            Find Your Perfect
            <br className="hidden sm:block" />
            <span className="gradient-text"> PG in Minutes</span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mb-12 leading-relaxed animate-fade-up opacity-0 delay-200">
            Browse thousands of verified paying-guest accommodations. Filter by city, budget, and amenities — zero broker fees.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-2xl animate-fade-up opacity-0 delay-300"
          >
            <div className="relative flex items-center glass border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/30 focus-within:border-primary/40 focus-within:shadow-primary/10 transition-all duration-300">
              <div className="pl-3 pr-2 shrink-0">
                <MapPin size={22} className="text-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search by city — Pune, Mumbai, Delhi..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-text-muted text-base py-2 px-2"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg shadow-primary-glow/30 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shrink-0"
              >
                <Search size={18} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>

          {/* Quick city chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-5 animate-fade-up opacity-0 delay-400">
            <span className="text-sm text-text-muted">Popular:</span>
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => navigate(`/listings?city=${city}`)}
                className="px-3 py-1 rounded-full text-xs font-medium glass border border-white/10 text-text-secondary hover:text-white hover:border-primary/30 transition-all duration-200"
              >
                {city}
              </button>
            ))}
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className={`glass-card p-6 text-center animate-fade-up opacity-0`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`flex justify-center mb-3 ${stat.color}`}>
                <stat.icon size={26} />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs md:text-sm text-text-secondary">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* ── Features ─────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <div
              key={i}
              className={`glass-card-interactive p-8 group animate-fade-up opacity-0`}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} p-0.5 mb-6`}>
                <div className="w-full h-full bg-bg-card rounded-[14px] flex items-center justify-center">
                  <feat.icon size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary-light transition-colors">
                {feat.title}
              </h3>
              <p className="text-text-secondary leading-relaxed text-sm">{feat.desc}</p>
            </div>
          ))}
        </section>

        {/* ── Owner CTA ─────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/15 p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 animate-fade-up opacity-0">
          {/* background */}
          <div className="absolute inset-0 bg-gradient-card pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-primary-light text-xs font-semibold uppercase tracking-wider mb-6">
              <Building2 size={14} />
              For Property Owners
            </div>
            <h2 className="text-h1 text-white mb-4">
              List Your PG &amp;<br />Reach Thousands
            </h2>
            <p className="text-text-secondary text-lg mb-8 leading-relaxed">
              Join 2,400+ verified property owners on Anei Ghar. Get real inquiries from verified students — completely free.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-bg bg-white hover:bg-slate-100 shadow-xl transition-all hover:-translate-y-0.5 no-underline"
              >
                Start Listing Free <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white glass border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all no-underline"
              >
                Owner Login
              </Link>
            </div>
          </div>

          {/* Decorative card mockup */}
          <div className="relative z-10 hidden lg:block shrink-0 animate-float">
            <div className="glass-card p-6 w-72 border-primary/20 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Live Dashboard</span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              {[
                { label: 'Views Today', val: '142', trend: '+12%' },
                { label: 'New Inquiries', val: '8', trend: '+3' },
                { label: 'Saved by Students', val: '24', trend: '+5' },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between py-3 ${i < 2 ? 'border-b border-white/6' : ''}`}>
                  <span className="text-sm text-text-secondary">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{row.val}</span>
                    <span className="text-xs text-emerald-400">{row.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  )
}

export default HomePage
