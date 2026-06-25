import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl shadow-slate-950/50">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-400">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Page not found</h1>
        <p className="mt-3 text-sm text-slate-400">The requested route could not be found.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500 hover:text-white">
          Return home
        </Link>
      </div>
    </div>
  );
}
