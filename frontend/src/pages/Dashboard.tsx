import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import RunTable from '../components/RunTable';
import Stats from '../components/Stats';
import { getWorkflowRuns, type WorkflowRun } from '../services/github';

const owner = import.meta.env.VITE_GITHUB_OWNER || 'octo';
const repo = import.meta.env.VITE_GITHUB_REPO || 'repo';
const token = import.meta.env.VITE_GITHUB_TOKEN;

export default function Dashboard() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadRuns() {
      try {
        setLoading(true);
        setError(null);
        const data = await getWorkflowRuns(owner, repo, token);
        if (!isCancelled) {
          setRuns(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load workflow runs.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadRuns();

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredRuns = useMemo(() => {
    const query = search.toLowerCase();
    return runs.filter((run) => {
      const haystack = `${run.head_sha} ${run.head_branch} ${run.name}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [runs, search]);

  const stats = useMemo(() => {
    const successfulRuns = runs.filter((run) => run.conclusion === 'success').length;
    const failedRuns = runs.filter((run) => run.conclusion && ['failure', 'cancelled', 'timed_out', 'action_required'].includes(run.conclusion)).length;
    const runningRuns = runs.filter((run) => run.status === 'in_progress' || run.status === 'queued' || run.status === 'requested' || run.status === 'pending').length;

    return {
      totalRuns: runs.length,
      successfulRuns,
      failedRuns,
      runningRuns
    };
  }, [runs]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Navbar />

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Overview</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Workflow runs and RCA artifacts</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Review the latest GitHub Actions runs, search by commit or branch, and open the corresponding RCA report.
              </p>
            </div>
            <div className="w-full max-w-md">
              <label htmlFor="search" className="mb-2 block text-sm text-slate-400">
                Search by commit or branch
              </label>
              <input
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="e.g. 48a91d2 or main"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-sky-500"
              />
            </div>
          </div>
        </section>

        <Stats {...stats} />

        {loading && <p className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">Loading workflow runs…</p>}
        {error && <p className="rounded-2xl border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</p>}

        {!loading && !error && <RunTable runs={filteredRuns} />}
      </div>
    </div>
  );
}
