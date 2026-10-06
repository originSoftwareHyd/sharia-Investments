import { Save, Send, X } from 'lucide-react'
import { Button } from '../common/Button'
import { PostPreview } from './PostPreview'
import { CloudinaryUploader } from './CloudinaryUploader'

export function PostForm({ value, onChange, onSaveDraft, onPublish, onCancel, submitting, categories }) {
  const update = (field, next) => onChange({ ...value, [field]: next })
  return (
    <div className="post-editor-layout">
      <form className="post-form" onSubmit={(event) => { event.preventDefault(); onPublish() }}>
        <div className="form-section">
          <span className="eyebrow">Editorial details</span>
          <div className="form-grid form-grid--two">
            <label className="field field--full"><span>Article title *</span><input value={value.title} onChange={(e) => update('title', e.target.value)} required maxLength={140} placeholder="Enter a clear, specific title" /></label>
            <label className="field"><span>Category *</span><select value={value.categorySlug} onChange={(e) => update('categorySlug', e.target.value)} required disabled={!categories.length}><option value="">Select category</option>{categories.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}</select></label>
            <label className="field"><span>Author *</span><input value={value.author} onChange={(e) => update('author', e.target.value)} required maxLength={80} /></label>
            <label className="field"><span>Publication date</span><input type="date" value={value.date} onChange={(e) => update('date', e.target.value)} /></label>
            <label className="field"><span>Reading time</span><input value={value.readingTime} onChange={(e) => update('readingTime', e.target.value)} placeholder="5 min read" maxLength={30} /></label>
            <label className="field field--full"><span>Excerpt *</span><textarea rows="4" value={value.excerpt} onChange={(e) => update('excerpt', e.target.value)} required maxLength={320} placeholder="A short editorial summary for cards and search results" /></label>
          </div>
        </div>

        <div className="form-section">
          <span className="eyebrow">Featured image</span>
          <CloudinaryUploader
            value={value.image.src}
            alt={value.image.alt}
            onChange={(img) => update('image', img)}
          />
        </div>

        <div className="form-section">
          <div className="editor-heading"><span className="eyebrow">Article content</span><small>Each paragraph becomes a structured content block.</small></div>
          <label className="field"><span>Body *</span><textarea rows="18" value={value.bodyText} onChange={(e) => update('bodyText', e.target.value)} required placeholder="Write one paragraph per block. Use a blank line to separate paragraphs." /></label>
        </div>

        <div className="form-actions">
          <Button as="button" type="button" variant="ghost" onClick={onCancel}><X size={16} /> Cancel</Button>
          <div>
            <Button as="button" type="button" variant="secondary" onClick={onSaveDraft} disabled={submitting}><Save size={16} /> Save Draft</Button>
            <Button as="button" type="submit" disabled={submitting}><Send size={16} /> {submitting ? 'Publishing…' : 'Publish Article'}</Button>
          </div>
        </div>
      </form>

      <aside className="post-preview-panel">
        <div className="post-preview-panel__sticky">
          <span className="eyebrow">Preview</span>
          <PostPreview
            article={{
              title: value.title || 'Your article title',
              excerpt: value.excerpt || 'Your excerpt will appear here.',
              author: value.author || 'Author',
              date: value.date || 'Date',
              readingTime: value.readingTime || 'Reading time',
              category: categories.find((cat) => cat.slug === value.categorySlug) || { name: 'Category' },
              image: value.image,
            }}
          />
        </div>
      </aside>
    </div>
  )
}
