import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-4 shadow-lg shadow-slate-950/30 backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-400">PRISM Console</p>
        <p className="mt-1 text-sm text-slate-400">AI RCA dashboard for GitHub Actions</p>
      </div>
      <Link to="/" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500 hover:text-white">
        Dashboard
      </Link>
    </nav>
  );
}
