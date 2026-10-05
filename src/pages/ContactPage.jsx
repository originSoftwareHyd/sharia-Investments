import { useState } from 'react'
import { CheckCircle2, Mail, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { Container } from '../components/common/Container'
import { SectionHeading } from '../components/common/SectionHeading'
import { Button } from '../components/common/Button'
import { appConfig } from '../config/appConfig'
import { siteData } from '../data/siteData'
import { enquiryService } from '../services/enquiryService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const SUBJECTS = [
  'Investment enquiry',
  'Article question',
  'Correction / feedback',
  'General question',
  'Other',
]

const blank = { name: '', email: '', phone: '', subject: '', message: '', website: '' }

export function ContactPage() {
  useDocumentTitle('Contact')
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.'
    if (!form.subject) e.subject = 'Please select a subject.'
    if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Please enter a message (at least 10 characters).'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    // Honeypot check
    if (form.website !== '') return
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    setTimeout(() => {
      enquiryService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject,
        message: form.message.trim(),
      })
      setSent(true)
      setSubmitting(false)
    }, 400)
  }

  if (sent) {
    return (
      <section className="section page-section contact-page">
        <Container>
          <div className="contact-success">
            <CheckCircle2 size={44} className="contact-success__icon" />
            <h2>Message sent</h2>
            <p>Thank you for reaching out. We'll get back to you soon.</p>
            <Button as="button" onClick={() => { setForm(blank); setSent(false) }}>Send another</Button>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="section page-section contact-page">
      <Container>
        <div className="contact-hero-grid">
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch."
            description="Send us a message and we'll respond as soon as possible."
          />
          <div className="contact-address-card">
            <Mail size={20} />
            <span>Direct email</span>
            <strong>{appConfig.contactEmail}</strong>
            <small>Or use the form below.</small>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          {/* Honeypot */}
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: 'none' }}
          />

          <div className="contact-form__grid">
            <label className="contact-field">
              <span>Full name *</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                maxLength={120}
                placeholder="Your name"
              />
              {errors.name && <span className="contact-field__error">{errors.name}</span>}
            </label>

            <label className="contact-field">
              <span>Email *</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && <span className="contact-field__error">{errors.email}</span>}
            </label>

            <label className="contact-field">
              <span>Phone <small>(optional)</small></span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </label>

            <label className="contact-field">
              <span>Subject *</span>
              <select value={form.subject} onChange={(e) => update('subject', e.target.value)}>
                <option value="">Select a subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.subject && <span className="contact-field__error">{errors.subject}</span>}
            </label>

            <label className="contact-field contact-field--full">
              <span>Message *</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder="How can we help you?"
                maxLength={2000}
              />
              {errors.message && <span className="contact-field__error">{errors.message}</span>}
            </label>
          </div>

          <div className="contact-form__actions">
            <Button as="button" type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Message'}
            </Button>
          </div>
        </form>

        <div className="contact-boundary">
          <ShieldCheck size={19} />
          <div>
            <strong>Educational boundary</strong>
            <p>The redesign does not present itself as personalized financial or religious advice.</p>
          </div>
        </div>
        <a className="source-inline-link" href={siteData.source.url} target="_blank" rel="noreferrer">
          Visit the primary source <ArrowUpRight size={16} />
        </a>
      </Container>
    </section>
  )
}
