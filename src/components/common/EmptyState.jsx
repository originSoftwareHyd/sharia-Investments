import { SearchX } from 'lucide-react'

export function EmptyState({ title = 'Nothing here yet', description = 'There is no content to show right now.' }) {
  return (
    <div className="state-panel">
      <SearchX size={24} strokeWidth={1.7} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
