import { Search, X } from 'lucide-react'

export function SearchBar({ value, onChange, onClear, autoFocus = false }) {
  return (
    <div className="search-field">
      <Search size={19} aria-hidden="true" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search articles, categories, authors…" aria-label="Search articles" autoFocus={autoFocus} />
      {value && <button type="button" className="icon-button icon-button--small" onClick={onClear} aria-label="Clear search"><X size={16} /></button>}
    </div>
  )
}
