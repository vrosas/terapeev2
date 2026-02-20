import { lazy, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/lib/store'
import { AppSidebar, AppHeader, GlobalSearch } from '@/components/layout'
import { LoadingSpinner } from '@/components/ui'
import { T } from '@/utils/theme'
import AuthPage from '@/components/modules/auth'

// Lazy load modules for code splitting
const Dashboard = lazy(() => import('@/components/modules/dashboard'))
const Agenda = lazy(() => import('@/components/modules/agenda'))
const Pacientes = lazy(() => import('@/components/modules/pacientes'))
const Prontuarios = lazy(() => import('@/components/modules/prontuarios'))
const Financeiro = lazy(() => import('@/components/modules/financeiro'))
const Profissionais = lazy(() => import('@/components/modules/profissionais'))
const Mensagens = lazy(() => import('@/components/modules/mensagens'))
const Relatorios = lazy(() => import('@/components/modules/relatorios'))
const Configuracoes = lazy(() => import('@/components/modules/configuracoes'))

const MODULES = {
  dashboard: Dashboard,
  agenda: Agenda,
  pacientes: Pacientes,
  prontuarios: Prontuarios,
  financeiro: Financeiro,
  profissionais: Profissionais,
  mensagens: Mensagens,
  relatorios: Relatorios,
  configuracoes: Configuracoes,
}

function AppShell() {
  const { currentPage, sidebarCollapsed } = useAppStore()
  const Module = MODULES[currentPage] || Dashboard

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.n100 }}>
      <AppSidebar />
      <div style={{
        flex: 1,
        marginLeft: sidebarCollapsed ? 72 : 240,
        transition: 'margin-left 250ms cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <AppHeader />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Suspense fallback={<LoadingSpinner />}>
            <Module />
          </Suspense>
        </main>
      </div>
      <GlobalSearch />
    </div>
  )
}

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: T.n100,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: T.primary500, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: T.n0, fontWeight: 700,
            fontSize: 22, margin: '0 auto 16px',
          }}>T</div>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return isAuthenticated ? <AppShell /> : <AuthPage />
}
