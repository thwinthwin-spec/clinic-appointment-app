export default function Loading({ label, fullPage, small }) {
  let className = 'loading-state';
  if (fullPage) className = className + ' loading-state--page';
  if (small) className = className + ' loading-state--small';

  const text = label || 'Loading…';

  return (
    <div className={className} role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
