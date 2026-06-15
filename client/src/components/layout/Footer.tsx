import { Link } from 'react-router-dom';
import logo from '@/assets/logo-dark.png';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-slate-50/50 w-full">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Branding Column */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity duration-200 shrink-0">
              <img src={logo} className="h-[44px] w-auto object-contain" alt="Anei Ghar Logo" />
            </Link>
            <p className="max-w-sm text-sm text-slate-500 leading-relaxed">
              Helping students find trusted PG accommodation.
            </p>
          </div>

          {/* Discover Links */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-700">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
              <li><Link to="/pg" className="hover:text-blue-600 transition-colors">Browse PGs</Link></li>
              <li><Link to="/register" className="hover:text-blue-600 transition-colors">List Your Property</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-700">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Safety Support</a></li>
            </ul>
          </div>
        </div>

        {/* Sub-Footer Copyright */}
        <div className="mt-12 border-t border-slate-200/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Anei Ghar. Built with ❤️ for students.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-800 transition-colors">Twitter</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Instagram</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-800 transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
