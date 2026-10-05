import { ArrowUpRight, BookOpen, ExternalLink } from 'lucide-react'
import { Container } from '../components/common/Container'
import { SectionHeading } from '../components/common/SectionHeading'
import { Button } from '../components/common/Button'
import { siteData } from '../data/siteData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function AboutPage() {
  useDocumentTitle('About')
  return (
    <section className="section page-section">
      <Container>
        <div className="about-hero-grid">
          <div>
            <span className="eyebrow">About the archive</span>
            <h1>Shariah Investments, presented as a modern reading room.</h1>
          </div>
          <p>The primary website is a compact public publication. It currently lists nine posts across two categories, with one named public author and four visible archive periods. This redesign keeps those source facts intact while giving the archive a new interface.</p>
        </div>

        <div className="fact-grid">
          <div className="fact-card"><span className="eyebrow">01</span><strong>9</strong><span>public source posts</span></div>
          <div className="fact-card"><span className="eyebrow">02</span><strong>2</strong><span>source categories</span></div>
          <div className="fact-card"><span className="eyebrow">03</span><strong>4</strong><span>visible archive periods</span></div>
          <div className="fact-card"><span className="eyebrow">04</span><strong>1</strong><span>public author page</span></div>
        </div>

        <div className="about-source-block">
          <div>
            <SectionHeading eyebrow="Source record" title="What is verified on the primary site?" description="This page intentionally avoids adding founders, awards, certifications, credentials, returns, religious authorities or other facts that are not established by the source site." />
          </div>
          <div className="about-source-list">
            <div><BookOpen size={19} /><span>Author</span><strong>{siteData.source.authorName}</strong></div>
            <div><BookOpen size={19} /><span>Categories</span><strong>General Overview · Myths</strong></div>
            <div><BookOpen size={19} /><span>Archives</span><strong>September 2026 · November 2022 · November 2019 · October 2019</strong></div>
            <div><ExternalLink size={19} /><span>Primary site</span><a href={siteData.source.url} target="_blank" rel="noreferrer">Open shariahinvestments.in <ArrowUpRight size={15} /></a></div>
          </div>
        </div>

        <div className="about-actions"><Button to="/articles">Read the archive <ArrowUpRight size={17} /></Button><Button as="a" href={siteData.source.authorPage} target="_blank" rel="noreferrer" variant="secondary">Author archive <ExternalLink size={16} /></Button></div>
      </Container>
    </section>
  )
}
