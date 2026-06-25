import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-4 shadow-lg shadow-slate-950/30">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">PRISM Console</p>
        <p className="text-sm text-slate-400">AI-generated RCA reports from GitHub Actions</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-300">
        <Link to="/" className="transition hover:text-white">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
