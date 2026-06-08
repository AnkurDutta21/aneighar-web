import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[hsl(222,47%,8%)]/50 w-full">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Branding Column */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 shadow-md">
                <img src={logo} className="h-4.5 w-4.5 object-contain" alt="Anei Ghar Logo" />
              </div>
              <span className="gradient-text font-bold text-lg">Anei Ghar</span>
            </Link>
            <p className="max-w-sm text-sm text-white/50 leading-relaxed">
              Connects student stays with fully verified premium paying guest locations across India. Designed to offer comfort, connectivity, and peace of mind.
            </p>
          </div>

          {/* Discover Links */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/80">Explore</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link to="/" className="hover:text-violet-400 transition-colors">Home</Link></li>
              <li><Link to="/pg" className="hover:text-violet-400 transition-colors">Browse PGs</Link></li>
              <li><Link to="/register" className="hover:text-violet-400 transition-colors">List Your Property</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/80">Legal</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Safety Support</a></li>
            </ul>
          </div>
        </div>

        {/* Sub-Footer Copyright */}
        <div className="mt-12 border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Anei Ghar. Built with ❤️ for students.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
