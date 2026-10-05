import { BrowserRouter } from 'react-router-dom'
import { PageShell } from './components/layout/PageShell'
import { AppRoutes } from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <PageShell>
        <AppRoutes />
      </PageShell>
    </BrowserRouter>
  )
}
