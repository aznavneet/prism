type StatusBadgeProps = {
  status: string;
  conclusion: string | null;
};

function resolveVariant(status: string, conclusion: string | null) {
  if (conclusion === 'success') {
    return 'success';
  }

  if (conclusion && ['failure', 'cancelled', 'timed_out', 'action_required'].includes(conclusion)) {
    return 'failure';
  }

  if (status === 'in_progress' || status === 'queued' || status === 'requested' || status === 'pending') {
    return 'running';
  }

  return 'neutral';
}

export default function StatusBadge({ status, conclusion }: StatusBadgeProps) {
  const variant = resolveVariant(status, conclusion);

  return <span className={`status-badge ${variant}`}>{conclusion ?? status}</span>;
}
