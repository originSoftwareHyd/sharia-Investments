import { ArrowUpRight, Mail, ShieldCheck } from 'lucide-react'
import { Container } from '../components/common/Container'
import { SectionHeading } from '../components/common/SectionHeading'
import { Button } from '../components/common/Button'
import { appConfig } from '../config/appConfig'
import { siteData } from '../data/siteData'
import { useGmail } from '../hooks/useGmail'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function ContactPage() {
  useDocumentTitle('Contact')
  const openContact = useGmail()
  return (
    <section className="section page-section contact-page">
      <Container>
        <div className="contact-hero-grid">
          <SectionHeading eyebrow="Contact" title="A direct route to the public email shown on the source site." description="There is no simulated contact backend here. The action below opens Gmail with the recipient, subject and body encoded for review before sending." />
          <div className="contact-address-card"><Mail size={20} /><span>Public source email</span><strong>{appConfig.contactEmail}</strong><small>{appConfig.contactEmailSource}</small><Button as="button" onClick={openContact}>Open Gmail compose <ArrowUpRight size={16} /></Button></div>
        </div>

        <div className="contact-topic-grid">
          <div><span>01</span><h3>Article questions</h3><p>Use email for questions about published source articles and their presentation.</p></div>
          <div><span>02</span><h3>Corrections</h3><p>Point out source or metadata issues that should be checked against the primary site.</p></div>
          <div><span>03</span><h3>Feedback</h3><p>Share interface or editorial feedback through the same direct email path.</p></div>
        </div>

        <div className="contact-boundary"><ShieldCheck size={19} /><div><strong>Educational boundary</strong><p>The redesign does not present itself as personalized financial or religious advice.</p></div></div>
        <a className="source-inline-link" href={siteData.source.url} target="_blank" rel="noreferrer">Visit the primary source <ArrowUpRight size={16} /></a>
      </Container>
    </section>
  )
}
