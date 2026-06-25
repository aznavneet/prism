type StatCardProps = {
  label: string;
  value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

type StatsProps = {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  runningRuns: number;
};

export default function Stats({ totalRuns, successfulRuns, failedRuns, runningRuns }: StatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard label="Total Runs" value={totalRuns} />
      <StatCard label="Successful Runs" value={successfulRuns} />
      <StatCard label="Failed Runs" value={failedRuns} />
      <StatCard label="Running" value={runningRuns} />
    </div>
  );
}
