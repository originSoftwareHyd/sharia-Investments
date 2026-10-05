import { AlertCircle } from 'lucide-react'

export function ErrorState({ title = 'Something went wrong', description = 'Please try again.' , onRetry }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <AlertCircle size={24} strokeWidth={1.7} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
      {onRetry && <button type="button" className="text-button" onClick={onRetry}>Retry</button>}
    </div>
  )
}
