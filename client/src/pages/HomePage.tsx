import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Building, ShieldCheck, ArrowRight, Zap, Star } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/listings?city=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate('/listings')
    }
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-24 pb-16 fade-in">
        
        {/* Hero Section */}
        <section className="relative pt-12 lg:pt-24 flex flex-col items-center text-center">
          {/* Deep blue glowing orb behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary-light text-sm font-medium mb-8 backdrop-blur-md">
            <Star size={16} className="fill-primary-light" />
            <span className="tracking-wide uppercase text-xs">Premium Student Housing</span>
          </div>

          <h1 className="text-display max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-primary-light mb-6">
            Find Your Perfect Home <br className="hidden md:block" /> Away From Home
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
            Discover verified, safe, and premium PG accommodations tailored for students and young professionals. Zero broker fees.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-2xl relative z-10 group">
            <div className="relative flex items-center bg-bg-card border border-white/10 rounded-full p-2 pl-6 shadow-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:ring-2 ring-primary/20">
              <MapPin className="text-gray-400 group-focus-within:text-primary transition-colors" size={24} />
              <input
                type="text"
                placeholder="Search by city (e.g., Pune, Mumbai, Delhi)"
                className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder:text-gray-500 text-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="bg-[var(--background-image-gradient-primary)] text-white px-8 py-3.5 rounded-full font-semibold shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center gap-2">
                <Search size={20} />
                <span className="hidden sm:inline">Search PGs</span>
              </button>
            </div>
          </form>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm text-gray-400 font-medium">
            <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-green-400" /> 100% Verified Listings</span>
            <span className="flex items-center gap-2"><Zap size={18} className="text-yellow-400" /> Instant Booking</span>
            <span className="flex items-center gap-2"><Building size={18} className="text-primary-light" /> 500+ Premium Properties</span>
          </div>
        </section>

        {/* Features / Steps */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              icon: Search,
              title: 'Smart Search',
              desc: 'Filter by amenities, distance to college, rent, and rules to find the exact match for your lifestyle.',
              color: 'text-blue-400',
              bg: 'bg-blue-400/10'
            },
            {
              icon: ShieldCheck,
              title: 'Verified Owners',
              desc: 'Every listing and landlord goes through strict background verification to ensure your safety.',
              color: 'text-green-400',
              bg: 'bg-green-400/10'
            },
            {
              icon: Zap,
              title: 'Hassle-free Move-in',
              desc: 'Connect directly with landlords, schedule visits, and move in without paying hefty brokerages.',
              color: 'text-yellow-400',
              bg: 'bg-yellow-400/10'
            }
          ].map((feat, i) => (
            <div key={i} className="glass-card p-8 group">
              <div className={`w-14 h-14 ${feat.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feat.icon size={28} className={feat.color} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-bg-card to-[#061225] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Are you a PG Owner?</h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              List your property on Anei Ghar and connect with thousands of verified students looking for accommodation in your area.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-3.5 rounded-full bg-white text-bg font-bold shadow-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                List Property <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="px-8 py-3.5 rounded-full bg-white/10 text-white font-medium border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2">
                Owner Login
              </Link>
            </div>
          </div>
          
          <div className="relative z-10 hidden lg:block">
            <div className="glass-card p-6 w-72 rotate-3 hover:rotate-0 transition-transform duration-500 border-primary/30 bg-bg-card/80">
              <div className="flex justify-between items-center mb-6">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-primary/20 text-primary-light rounded-full">Owner Dashboard</span>
              </div>
              <div className="space-y-3">
                <div className="h-2.5 bg-white/10 rounded-full w-full" />
                <div className="h-2.5 bg-white/10 rounded-full w-4/5" />
                <div className="h-2.5 bg-white/10 rounded-full w-5/6" />
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="text-sm text-gray-400">Total Views</div>
                <div className="text-lg font-bold text-white">1,204</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  )
}

export default HomePage
