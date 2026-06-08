import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Shield, Star, ArrowRight, TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';
import logo from '@/assets/logo.png';

const features = [
  { icon: <Search className="h-5 w-5" />, title: 'Smart Search', desc: 'Filter by city, rent range, amenities and more' },
  { icon: <MapPin className="h-5 w-5" />, title: 'Verified Locations', desc: 'Google Maps integration for precise location' },
  { icon: <Shield className="h-5 w-5" />, title: 'Trusted Listings', desc: 'All PGs are verified by our team' },
  { icon: <Star className="h-5 w-5" />, title: 'Top Rated', desc: 'Browse highest rated PGs in your area' },
];

const stats = [
  { value: '1,200+', label: 'PG Listings' },
  { value: '8,500+', label: 'Happy Students' },
  { value: '50+', label: 'Cities' },
  { value: '4.8★', label: 'Avg Rating' },
];

export function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(222,47%,6%)]">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-600/10 blur-[80px]" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-600/10 blur-[80px]" />
        </div>

        {/* Navbar */}
        <nav className="absolute top-0 w-full flex items-center justify-between border-b border-white/8 px-8 py-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-500/20">
              <img src={logo} className="h-5 w-5 object-contain" alt="Anei Ghar Logo" />
            </div>
            <span className="gradient-text text-xl font-bold">Anei Ghar</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/pg">
              <Button variant="ghost" size="sm">Browse PGs</Button>
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>1,200+ PG listings across India</span>
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl">
            Find Your Perfect{' '}
            <span className="gradient-text">PG Stay</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/50">
            Anei Ghar connects students with verified PG accommodations. Browse
            listings, compare amenities, and move in — stress-free.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/pg')} id="hero-browse-btn">
              Browse PGs <ArrowRight className="h-4 w-4" />
            </Button>
            {!isAuthenticated && (
              <Button variant="outline" size="lg" onClick={() => navigate('/register')} id="hero-list-btn">
                List Your PG
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/8 px-6 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="gradient-text text-4xl font-bold">{s.value}</div>
              <div className="mt-1 text-sm text-white/50">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            Why Choose <span className="gradient-text">Anei Ghar</span>?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/8 bg-white/5 p-6 transition-all duration-300 hover:border-violet-500/30 hover:bg-white/8"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
                  {f.icon}
                </div>
                <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-3xl border border-violet-500/20 bg-violet-600/10 p-12 text-center backdrop-blur-sm">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to find your home?
          </h2>
          <p className="mb-8 text-white/50">
            Join thousands of students who found their perfect PG on Anei Ghar.
          </p>
          {!isAuthenticated ? (
            <Button size="lg" onClick={() => navigate('/register')} id="cta-btn">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="lg" onClick={() => navigate('/pg')} id="cta-btn">
              Browse Listings <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
