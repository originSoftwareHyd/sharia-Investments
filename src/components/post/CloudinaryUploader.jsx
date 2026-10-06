import { useRef, useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Direct-to-Cloudinary image uploader (unsigned upload preset).
 * Set in .env.local:
 *   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
 *   VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
 *
 * Props:
 *   value     – current image URL string
 *   alt       – current alt text string
 *   onChange  – fn({ src, alt }) called on select/upload/remove
 */
export function CloudinaryUploader({ value, alt = '', onChange }) {
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const configured = Boolean(CLOUD_NAME && UPLOAD_PRESET)

  async function upload(file) {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return }
    if (!configured) { setError('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local.'); return }

    setUploading(true); setProcessing(false); setProgress(0); setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', 'shariah-investments/blog')

    await new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 90)
          setProgress(pct)
          if (pct >= 90) setProcessing(true)
        }
      }
      xhr.onload = () => {
        setUploading(false); setProcessing(false); setProgress(0)
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText)
          onChange({ src: res.secure_url, alt: file.name.replace(/\.[^.]+$/, '') })
        } else {
          try { setError(JSON.parse(xhr.responseText)?.error?.message ?? 'Upload failed.') }
          catch { setError('Upload failed. Please try again.') }
        }
        resolve()
      }
      xhr.onerror = () => { setUploading(false); setProcessing(false); setError('Network error.'); resolve() }
      xhr.ontimeout = () => { setUploading(false); setProcessing(false); setError('Upload timed out.'); resolve() }
      xhr.timeout = 120_000
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
      xhr.send(fd)
    })
  }

  const onDrop = useCallback(async (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await upload(file)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function remove() { onChange({ src: '', alt: '' }) }

  // Preview state — image already selected
  if (value) {
    return (
      <div className="cloudinary-preview-wrap">
        <div className="cloudinary-preview">
          <img src={value} alt={alt || 'Cover image'} className="cloudinary-preview__img" />
          <button type="button" onClick={remove} className="cloudinary-preview__remove" aria-label="Remove image">
            <X size={14} />
          </button>
        </div>
        <label className="field">
          <span>Alt text</span>
          <input
            type="text"
            value={alt}
            onChange={(e) => onChange({ src: value, alt: e.target.value })}
            placeholder="Describe the image for accessibility"
            maxLength={180}
          />
        </label>
      </div>
    )
  }

  return (
    <div className="cloudinary-uploader">
      {error && <p className="cloudinary-uploader__error">{error}</p>}

      <div
        className={`cloudinary-drop-zone ${dragging ? 'cloudinary-drop-zone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {uploading ? (
          <div className="cloudinary-progress">
            <p>{processing ? 'Processing…' : 'Uploading…'}</p>
            <div className="cloudinary-progress__track">
              {processing
                ? <div className="cloudinary-progress__bar cloudinary-progress__bar--pulse" />
                : <div className="cloudinary-progress__bar" style={{ width: `${progress}%` }} />
              }
            </div>
            {!processing && <span>{progress}%</span>}
          </div>
        ) : (
          <div className="cloudinary-drop-zone__inner">
            <Upload size={22} strokeWidth={1.5} />
            <p>
              Drag & drop, or{' '}
              <button type="button" className="cloudinary-browse-btn" onClick={() => fileRef.current?.click()}>
                browse files
              </button>
            </p>
            <small>PNG, JPG, WebP · Max 10 MB</small>
            {!configured && (
              <small className="cloudinary-unconfigured">
                Set <code>VITE_CLOUDINARY_CLOUD_NAME</code> &amp; <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> in <code>.env.local</code>
              </small>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="cloudinary-file-input"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }}
      />
    </div>
  )
}
