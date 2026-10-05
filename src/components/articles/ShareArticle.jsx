import { Check, Copy, Facebook, Linkedin, Share2 } from 'lucide-react'
import { useState } from 'react'

export function ShareArticle({ title }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="share-bar">
      <span><Share2 size={16} /> Share</span>
      <div>
        <button type="button" className="share-button" onClick={copyLink} aria-label="Copy article link">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
        <a className="share-button" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" aria-label={`Share ${title} on LinkedIn`}><Linkedin size={16} /></a>
        <a className="share-button" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" aria-label={`Share ${title} on Facebook`}><Facebook size={16} /></a>
      </div>
    </div>
  )
}
