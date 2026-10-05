export function LoadingState({ label = 'Loading content…' }) {
  return <div className="state-panel state-panel--loading" aria-live="polite"><span className="spinner" aria-hidden="true" />{label}</div>
}
