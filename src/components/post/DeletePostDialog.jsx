import { AlertTriangle } from 'lucide-react'
import { Button } from '../common/Button'

export function DeletePostDialog({ article, onConfirm, onCancel }) {
  if (!article) return null
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <div className="modal-icon"><AlertTriangle size={20} /></div>
        <span className="eyebrow">Delete article</span>
        <h2 id="delete-title">Remove “{article.title}”?</h2>
        <p>This permanently deletes your user-created article or draft. Source articles are protected.</p>
        <div className="modal-actions"><Button as="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button as="button" variant="danger" onClick={onConfirm}>Delete</Button></div>
      </div>
    </div>
  )
}
