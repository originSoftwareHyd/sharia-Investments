import { ArrowUpRight, BookOpen, CalendarDays, Compass, Mail, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '../components/common/Container'
import { Button } from '../components/common/Button'
import { ArticleGrid } from '../components/articles/ArticleGrid'
import { FeaturedArticle } from '../components/articles/FeaturedArticle'
import { CategoryCard } from '../components/categories/CategoryCard'
import { categories } from '../data/categories'
import { siteData } from '../data/siteData'
import { useArticles } from '../hooks/useArticles'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { SectionHeading } from '../components/common/SectionHeading'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function Home() {
  useDocumentTitle('Home')
  const { articles, status, error, reload } = useArticles()
  const featured = articles.find((item) => item.featured) || articles[0]
  const latest = articles.filter((item) => item.id !== featured?.id).slice(0, 6)

  return (
    <>
      <section className="home-hero">
        <div className="hero-gridline" aria-hidden="true" />
        <Container>
          <div className="home-hero__masthead">
            <div className="home-hero__copy">
              <span className="eyebrow eyebrow--gold">The Shariah Investments archive</span>
              <h1>Ideas worth <span>reading</span> before they become decisions.</h1>
              <p>Explore a focused public archive covering Islamic finance, Shariah-compliant investing and financial wellbeing.</p>
              <div className="home-hero__actions">
                <Button to="/articles">Explore articles <ArrowUpRight size={17} /></Button>
                <Button to="/search" variant="ghost">Search the archive <Search size={17} /></Button>
              </div>
            </div>
            <div className="home-hero__ledger" aria-label="Archive overview">
              <div className="ledger-card ledger-card--large">
                <div className="ledger-card__top"><span>ARCHIVE</span><span>01</span></div>
                <div className="ledger-card__seal">SI</div>
                <strong>Shariah<br />Investments</strong>
                <small>Islamic finance · halal investing · financial wellbeing</small>
              </div>
              <div className="ledger-card ledger-card--small">
                <span className="ledger-card__label">Published</span>
                <strong>9</strong>
                <small>source posts</small>
              </div>
              <div className="ledger-card ledger-card--small ledger-card--dark">
                <span className="ledger-card__label">Categories</span>
                <strong>2</strong>
                <small>General Overview · Myths</small>
              </div>
            </div>
          </div>
          <div className="home-hero__rail">
            <span>Primary source <b>shariahinvestments.in</b></span>
            <span>Latest publication <b>15 Sep 2026</b></span>
            <span>Author <b>{siteData.source.authorName}</b></span>
          </div>
        </Container>
      </section>

      <section className="section section--tight-top">
        <Container>
          <div className="editorial-intro">
            <div>
              <span className="eyebrow">01 / Start here</span>
              <h2>The newest piece in the archive.</h2>
            </div>
            <p>Lead with the latest source article, then move backward through the archive by topic or date.</p>
          </div>
          {status === 'loading' && <LoadingState label="Loading the archive…" />}
          {status === 'error' && <ErrorState description={error?.message} onRetry={reload} />}
          {status === 'success' && featured && <FeaturedArticle article={featured} />}
        </Container>
      </section>

      <section className="section section--sand">
        <Container>
          <div className="section-index"><span>02 / Latest</span><Link className="text-link" to="/articles">All articles <ArrowUpRight size={17} /></Link></div>
          <SectionHeading title="Read through the archive" description="Every card below is tied to one of the nine publicly listed source articles." />
          {status === 'success' && <ArticleGrid articles={latest} />}
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="section-index"><span>03 / Source categories</span><Link className="text-link" to="/categories">View categories <ArrowUpRight size={17} /></Link></div>
          <div className="category-grid category-grid--source">
            {categories.map((category, index) => <CategoryCard key={category.slug} category={{ ...category, index: String(index + 1).padStart(2, '0') }} />)}
          </div>
        </Container>
      </section>

      <section className="section section--dark source-panel">
        <Container>
          <div className="source-panel__grid">
            <div>
              <span className="eyebrow eyebrow--gold">Read it at the source</span>
              <h2>A redesigned experience around the public archive.</h2>
            </div>
            <div>
              <p>Article titles, dates, authors, reading times, categories, archive dates, source URLs and verified source images are mapped from the primary website. Original article pages remain available through the source action on each post.</p>
              <div className="source-panel__actions">
                <a className="button button--light" href={siteData.source.url} target="_blank" rel="noreferrer">Open source site <ArrowUpRight size={17} /></a>
                <Link className="text-link text-link--light" to="/contact">Contact <Mail size={16} /></Link>
              </div>
            </div>
          </div>
          <div className="source-panel__facts">
            <div><BookOpen size={18} /><span>9 source posts</span></div>
            <div><Compass size={18} /><span>2 source categories</span></div>
            <div><CalendarDays size={18} /><span>4 source archives</span></div>
          </div>
        </Container>
      </section>
    </>
  )
}
