import { CheckCircle2, X } from 'lucide-react'

export function Toast({ message, onClose }) {
  if (!message) return null
  return (
    <div className="toast" role="status">
      <CheckCircle2 size={18} aria-hidden="true" />
      <span>{message}</span>
      <button type="button" aria-label="Dismiss notification" className="icon-button icon-button--small" onClick={onClose}><X size={16} /></button>
    </div>
  )
}
