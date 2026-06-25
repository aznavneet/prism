import { Link } from 'react-router-dom';
import type { WorkflowRun } from '../services/github';
import StatusBadge from './StatusBadge';

type RunTableProps = {
  runs: WorkflowRun[];
};

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

export default function RunTable({ runs }: RunTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-slate-950/30">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-950/70 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Commit ID</th>
              <th className="px-4 py-3 font-medium">Branch</th>
              <th className="px-4 py-3 font-medium">Workflow</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Trigger Time</th>
              <th className="px-4 py-3 font-medium">View RCA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {runs.map((run) => (
              <tr key={run.id} className="hover:bg-slate-800/70">
                <td className="px-4 py-3 font-mono text-xs text-sky-300">{run.head_sha.slice(0, 8)}</td>
                <td className="px-4 py-3">{run.head_branch}</td>
                <td className="px-4 py-3">{run.name}</td>
                <td className="px-4 py-3"><StatusBadge status={run.status} conclusion={run.conclusion} /></td>
                <td className="px-4 py-3">{formatTime(run.created_at)}</td>
                <td className="px-4 py-3">
                  <Link to={`/rca/${run.id}`} className="font-medium text-sky-400 transition hover:text-sky-300">
                    View RCA
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
