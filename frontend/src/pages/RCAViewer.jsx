import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { getRcaArtifact } from '../services/githubService';

export default function RCAViewer() {
  const { runId } = useParams();
  const [markdown, setMarkdown] = useState('');
  const [artifactName, setArtifactName] = useState('');
  const [artifactDownloadUrl, setArtifactDownloadUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadRca() {
      try {
        setLoading(true);
        setError('');
        const result = await getRcaArtifact(runId);
        if (isMounted) {
          setMarkdown(result.markdown);
          setArtifactName(result.artifactName || 'ci-rca');
          setArtifactDownloadUrl(result.artifactDownloadUrl || '');
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load RCA report.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (runId) {
      void loadRca();
    } else {
      setError('No workflow run ID was supplied.');
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [runId]);

  const content = useMemo(() => markdown || '', [markdown]);

  function handleDownloadMarkdown() {
    if (!content) {
      return;
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifactName || 'ci-rca'}-extracted.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_45%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Navbar />

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">RCA Report</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Root Cause Analysis</h1>
              <p className="mt-2 text-sm text-slate-400">The selected workflow’s exported RCA report is rendered below.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500 hover:text-white"
              >
                Download extracted .md
              </button>
              <Link to="/" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500 hover:text-white">
                Back to dashboard
              </Link>
            </div>
          </div>
        </section>

        {loading && <Loader label="Downloading and extracting RCA report..." />}
        {error && <div className="rounded-2xl border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</div>}

        {!loading && !error && (
          <article className="prose prose-invert max-w-none rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
