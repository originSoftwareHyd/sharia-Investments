import { Navigate, Route, Routes } from 'react-router-dom'
import { AboutPage } from '../pages/AboutPage'
import { ArchivesPage } from '../pages/ArchivesPage'
import { ArchivePage } from '../pages/ArchivePage'
import { ArticlePage } from '../pages/ArticlePage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { CategoryPage } from '../pages/CategoryPage'
import { ContactPage } from '../pages/ContactPage'
import { CreatePostPage } from '../pages/CreatePostPage'
import { Home } from '../pages/Home'
import { NotFound } from '../pages/NotFound'
import { SearchPage } from '../pages/SearchPage'
import { ArticlesPage } from '../pages/ArticlesPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/articles/:slug" element={<ArticlePage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/archives" element={<ArchivesPage />} />
      <Route path="/archives/:year/:month" element={<ArchivePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/create-post" element={<CreatePostPage />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
