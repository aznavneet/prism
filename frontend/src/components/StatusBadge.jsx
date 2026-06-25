export default function StatusBadge({ status, conclusion }) {
  const normalized = status?.toLowerCase();
  const resolvedConclusion = (conclusion || '').toLowerCase();

  let variant = 'neutral';

  if (resolvedConclusion === 'success') {
    variant = 'success';
  } else if (['failure', 'cancelled', 'timed_out', 'action_required'].includes(resolvedConclusion)) {
    variant = 'failed';
  } else if (['in_progress', 'queued', 'requested', 'pending'].includes(normalized)) {
    variant = normalized === 'queued' ? 'queued' : 'running';
  }

  const label = resolvedConclusion || normalized || 'unknown';

  return <span className={`status-badge ${variant}`}>{label}</span>;
}
