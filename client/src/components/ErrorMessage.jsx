export default function ErrorMessage({ message, title, onRetry, retryLabel }) {
  if (!message) return null;

  let retryButton = null;
  if (onRetry) {
    retryButton = (
      <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
        {retryLabel || 'Try again'}
      </button>
    );
  }

  return (
    <div className="alert alert--error" role="alert">
      <div>
        <strong>{title || 'Something went wrong'}</strong>
        <p>{message}</p>
      </div>
      {retryButton}
    </div>
  );
}
