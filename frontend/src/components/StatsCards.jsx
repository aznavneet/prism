export default function StatsCards({ totalRuns, successfulRuns, failedRuns, runningRuns }) {
  const cards = [
    { label: 'Total Runs', value: totalRuns },
    { label: 'Successful Runs', value: successfulRuns },
    { label: 'Failed Runs', value: failedRuns },
    { label: 'Running Runs', value: runningRuns }
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
        </div>
      ))}
    </section>
  );
}
