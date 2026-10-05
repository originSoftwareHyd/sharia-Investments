const formatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : formatter.format(date)
}

export function archiveLabel(year, month) {
  const date = new Date(Number(year), Number(month) - 1, 1)
  return Number.isNaN(date.getTime()) ? 'Archive' : new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date)
}
