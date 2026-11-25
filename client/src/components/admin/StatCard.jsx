export default function StatCard({ label, value, tone }) {
  let className = 'card stat-card';
  if (tone) className = className + ' ' + tone;

  return (
    <div className={className}>
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
    </div>
  );
}
