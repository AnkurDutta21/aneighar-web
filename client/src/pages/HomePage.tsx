import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Shield, Star, ArrowRight, TrendingUp, Navigation, Loader2, X,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';
import logo from '@/assets/logo.png';
import logoDark from '@/assets/logo-dark.png';

const features = [
  { icon: <Search className="h-5 w-5" />, title: 'Smart Search', desc: 'Filter by city, rent range, gender preference, amenities and more' },
  { icon: <MapPin className="h-5 w-5" />, title: 'Precise Locations', desc: 'Full address, pincode, and map view for every listing' },
  { icon: <Shield className="h-5 w-5" />, title: 'Safe & Secure', desc: 'Direct contact with verified owners — no middlemen' },
  { icon: <Star className="h-5 w-5" />, title: 'Detailed Listings', desc: 'Photos, amenities, pricing, and availability in one place' },
];

const POPULAR_CITIES = ['Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Mumbai', 'Delhi'];

type LocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'resolving'; lat: number; lng: number }
  | { status: 'ready'; city: string; area: string; lat: number; lng: number }
  | { status: 'denied' }
  | { status: 'error' };

export function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [citySearch, setCitySearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useState<LocationState>({ status: 'idle' });
  const hasFetched = useRef(false);

  // ── Reverse geocode coords → city + area name ─────────────────────────────
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLocation({ status: 'resolving', lat, lng });
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
      let city = '';
      let area = '';

      if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality|sublocality&key=${apiKey}`
        );
        const data = await res.json();
        const comps = data.results?.[0]?.address_components ?? [];
        city = comps.find((c: { types: string[] }) => c.types.includes('locality'))?.long_name ?? '';
        area = comps.find((c: { types: string[] }) => c.types.includes('sublocality_level_1'))?.long_name ?? '';
      }

      // Fallback: Nominatim (no key needed)
      if (!city) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        city = data.address?.city || data.address?.town || data.address?.village || '';
        area = data.address?.suburb || data.address?.neighbourhood || '';
      }

      if (city) {
        setLocation({ status: 'ready', city, area, lat, lng });
      } else {
        setLocation({ status: 'ready', city: 'Your Area', area: '', lat, lng });
      }
    } catch {
      setLocation({ status: 'error' });
    }
  }, []);

  // ── Auto-request location on mount ───────────────────────────────────────
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (!navigator.geolocation) return;

    setLocation({ status: 'requesting' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        reverseGeocode(coords.latitude, coords.longitude);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocation({ status: 'denied' });
        } else {
          setLocation({ status: 'error' });
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [reverseGeocode]);

  // ── Navigate to nearby PGs ────────────────────────────────────────────────
  const goToNearbyPGs = useCallback(() => {
    if (location.status !== 'ready') return;
    const { city, lat, lng } = location;
    navigate(`/pg?city=${encodeURIComponent(city)}&lat=${lat}&lng=${lng}`);
  }, [location, navigate]);

  // ── Retry location ────────────────────────────────────────────────────────
  const retryLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocation({ status: 'requesting' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => reverseGeocode(coords.latitude, coords.longitude),
      (err) => setLocation({ status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error' }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [reverseGeocode]);

  // ── Scroll handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Location pill renderer ────────────────────────────────────────────────
  const renderLocationPill = () => {
    if (location.status === 'requesting' || location.status === 'resolving') {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-200" />
          <span>Detecting your location…</span>
        </div>
      );
    }

    if (location.status === 'ready') {
      const { city, area } = location;
      return (
        <button
          id="hero-location-pill"
          type="button"
          onClick={goToNearbyPGs}
          className="group inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-blue-600 hover:border-white hover:shadow-lg hover:shadow-blue-900/20 active:scale-95"
        >
          {/* Pulsing dot */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <MapPin className="h-4 w-4 shrink-0 group-hover:text-blue-500" />
          <span>
            {area ? `${area}, ` : ''}<span className="font-extrabold">{city}</span>
          </span>
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold group-hover:bg-blue-100 group-hover:text-blue-700">
            Find PGs →
          </span>
        </button>
      );
    }

    if (location.status === 'denied') {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-500/10 px-4 py-2 text-xs text-red-200 backdrop-blur-sm">
          <X className="h-3.5 w-3.5" />
          <span>Location blocked — enable it in browser settings</span>
          <button
            onClick={retryLocation}
            className="ml-1 underline hover:text-white transition-colors font-semibold"
          >
            Retry
          </button>
        </div>
      );
    }

    if (location.status === 'error') {
      return (
        <button
          onClick={retryLocation}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm hover:bg-white/20 transition-all"
        >
          <Navigation className="h-3.5 w-3.5" />
          Find PGs near me
        </button>
      );
    }

    // idle — geolocation not supported
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 w-full h-20 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-[16px] border-b border-slate-900/[0.08]'
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link to="/" className="flex items-center pr-6 hover:opacity-90 transition-opacity duration-200 shrink-0">
            <img
              src={scrolled ? logoDark : logo}
              className="h-[40px] lg:h-[48px] w-auto object-contain transition-all duration-300"
              alt="Anei Ghar Logo"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/pg">
              <button className={`text-sm font-semibold transition-all duration-300 px-3 py-1.5 rounded-lg cursor-pointer ${
                scrolled
                  ? 'text-slate-900 hover:text-blue-600 hover:bg-slate-50'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}>
                Browse PGs
              </button>
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button
                  size="sm"
                  id="home-dashboard-btn"
                  className={`transition-all duration-300 ${
                    scrolled
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-transparent hover:bg-white/10 text-white border border-white/30'
                  }`}
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className={`text-sm font-semibold transition-all duration-300 px-3 py-1.5 rounded-lg cursor-pointer ${
                    scrolled
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}>
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    id="home-signup-btn"
                    className={`transition-all duration-300 ${
                      scrolled
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'bg-transparent hover:bg-white/10 text-white border border-white/30'
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 py-24">
        {/* Ambient overlay */}
        <div className="absolute inset-0 bg-white/[0.03] backdrop-brightness-[0.98]" />

        {/* Hero Content */}
        <div className="relative z-10 animate-fade-in max-w-4xl mx-auto mt-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4.5 py-1.5 text-xs font-semibold text-white shadow-sm">
            <TrendingUp className="h-3.5 w-3.5 text-sky-200" />
            <span>India's newest student PG platform — join early</span>
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight text-white md:text-7xl tracking-tight">
            Find Your Perfect <br className="hidden md:inline" />
            <span className="text-sky-100">PG Stay</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/90 leading-relaxed font-medium">
            Anei Ghar connects students with verified PG accommodations. Browse
            listings, compare amenities, and move in — stress-free.
          </p>

          {/* Location pill — auto-detected, click to browse nearby PGs */}
          <div className="mb-5 flex flex-col items-center gap-2">
            {renderLocationPill()}
          </div>

          {/* City search bar */}
          <div className="mx-auto mb-6 flex max-w-lg items-center gap-2 rounded-2xl border border-slate-100/50 bg-white p-2.5 premium-shadow">
            <Search className="ml-2.5 h-4 w-4 shrink-0 text-slate-400" />
            <input
              id="hero-city-search"
              type="text"
              placeholder="Or search PGs by city…"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && citySearch.trim()) {
                  navigate(`/pg?city=${encodeURIComponent(citySearch.trim())}`);
                }
              }}
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
            <Button
              size="sm"
              onClick={() => citySearch.trim() && navigate(`/pg?city=${encodeURIComponent(citySearch.trim())}`)}
              id="hero-search-btn"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Search
            </Button>
          </div>

          {/* Popular cities */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => navigate(`/pg?city=${encodeURIComponent(city)}`)}
                className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white hover:text-blue-600 hover:border-white shadow-sm"
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/pg')}
              id="hero-browse-btn"
              className="bg-white text-blue-600 hover:bg-slate-100 hover:shadow-lg shadow-md font-semibold"
            >
              Browse All PGs <ArrowRight className="h-4 w-4" />
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/register')}
                id="hero-list-btn"
                className="border-white/30 hover:bg-white/10 text-white backdrop-blur-sm"
              >
                List Your PG
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Early traction banner */}
      <section className="bg-white border-y border-slate-200/60 px-6 py-12 premium-shadow">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">🚀 Growing fast</p>
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            Anei Ghar is launching city by city. Be among the first students and owners to shape the platform.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-extrabold text-slate-900 tracking-tight md:text-4xl">
            Why Choose <span className="gradient-text">Anei Ghar</span>?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-[20px] bg-white border border-slate-100/50 p-8 transition-all duration-300 premium-shadow hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {f.icon}
                </div>
                <h3 className="mb-2.5 font-bold text-slate-900 text-lg">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-white border-t border-slate-200/50">
        <div className="mx-auto max-w-3xl rounded-[24px] bg-slate-50 border border-slate-100 p-12 md:p-16 text-center premium-shadow">
          <h2 className="mb-4 text-3xl font-extrabold text-slate-900 tracking-tight md:text-4xl">
            Ready to find your home?
          </h2>
          <p className="mb-8 text-slate-500 max-w-md mx-auto text-base leading-relaxed font-medium">
            Be among the first to find your perfect PG on Anei Ghar — built for students, by people who get it.
          </p>
          {!isAuthenticated ? (
            <Button size="lg" onClick={() => navigate('/register')} id="cta-btn" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="lg" onClick={() => navigate('/pg')} id="cta-btn" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md">
              Browse Listings <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
