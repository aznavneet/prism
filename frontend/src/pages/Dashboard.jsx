import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import StatsCards from '../components/StatsCards';
import PipelineTable from '../components/PipelineTable';
import Loader from '../components/Loader';
import { getWorkflowRuns } from '../services/githubService';

export default function Dashboard() {
  const [runs, setRuns] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadRuns() {
      try {
        setLoading(true);
        setError('');
        const data = await getWorkflowRuns();
        if (isMounted) {
          setRuns(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load workflow runs.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadRuns();

    return () => {
      isMounted = false;
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
    const failedRuns = runs.filter((run) => ['failure', 'cancelled', 'timed_out', 'action_required'].includes(run.conclusion || '')).length;
    const runningRuns = runs.filter((run) => ['in_progress', 'queued', 'requested', 'pending'].includes(run.status || '')).length;

    return {
      totalRuns: runs.length,
      successfulRuns,
      failedRuns,
      runningRuns
    };
  }, [runs]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_45%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Navbar />

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Overview</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">PRISM Console</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Review GitHub Actions workflow runs, inspect their health, and open AI-generated RCA reports in one place.
              </p>
            </div>
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </section>

        <StatsCards {...stats} />

        {loading && <Loader label="Loading workflow runs..." />}
        {error && <div className="rounded-2xl border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</div>}
        {!loading && !error && runs.length === 0 && <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">No workflow runs were found for this repository.</div>}
        {!loading && !error && <PipelineTable runs={filteredRuns} />}
      </div>
    </div>
  );
}
