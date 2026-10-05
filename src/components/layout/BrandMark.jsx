export function BrandMark({ footer = false }) {
  return (
    <span className={`brand-mark ${footer ? 'brand-mark--footer' : ''}`} aria-hidden="true">
      <span className="brand-mark__arch" />
      <span className="brand-mark__letters">SI</span>
      <span className="brand-mark__line" />
    </span>
  )
}
