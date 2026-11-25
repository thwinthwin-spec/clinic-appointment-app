import { capitalize } from '../utils/formatters';

export default function StatusBadge({ status }) {
  const key = String(status || 'pending').toLowerCase();
  const label = capitalize(key);

  return (
    <span className={'status-badge status-badge--' + key}>
      {label}
    </span>
  );
}
