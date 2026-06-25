import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import { readRcaFromArtifact } from '../services/github';

const owner = import.meta.env.VITE_GITHUB_OWNER || 'octo';
const repo = import.meta.env.VITE_GITHUB_REPO || 'repo';
const token = import.meta.env.VITE_GITHUB_TOKEN;

export default function RCAViewer() {
  const { runId } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setError('No workflow run was provided.');
      setLoading(false);
      return;
    }

    let isCancelled = false;

    async function loadRca() {
      try {
        setLoading(true);
        setError(null);
        const report = await readRcaFromArtifact(owner, repo, Number(runId), token);
        if (!isCancelled) {
          setContent(report);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load RCA report.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadRca();

    return () => {
      isCancelled = true;
    };
  }, [runId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Navbar />

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">RCA Viewer</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Root Cause Analysis Report</h1>
            </div>
            <Link to="/" className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500 hover:text-white">
              Back to dashboard
            </Link>
          </div>
        </section>

        {loading && <p className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">Loading RCA report…</p>}
        {error && <p className="rounded-2xl border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</p>}

        {!loading && !error && (
          <article className="prose prose-invert max-w-none rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
