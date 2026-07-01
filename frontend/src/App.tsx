import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { LoginPage } from '@/pages/login/login-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { AprovacoesPage } from '@/pages/aprovacoes/aprovacoes-page'
import { CampanhasPage } from '@/pages/campanhas/campanhas-page'
import { ConfiguracoesPage } from '@/pages/configuracoes/configuracoes-page'
import { ProjetosPage } from '@/pages/projetos/projetos-page'
import { EquipePage } from '@/pages/equipe/equipe-page'
import { RotaPrivada } from '@/app/rota-privada'
import { RotaComProjeto } from '@/app/rota-com-projeto'
import { ProjetoAtualProvider } from '@/app/use-projeto-atual'
import { SidebarShell } from '@/components/shared/sidebar-shell'

function AppShell() {
  const location = useLocation()
  const exibirSidebar = location.pathname !== '/login'

  return (
    <div className="flex min-h-svh">
      {exibirSidebar && <SidebarShell />}
      <div className="min-h-svh min-w-0 flex-1">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/projetos"
          element={
            <RotaPrivada>
              <ProjetosPage />
            </RotaPrivada>
          }
        />
        <Route
          path="/"
          element={
            <RotaPrivada>
              <RotaComProjeto>
                <DashboardPage />
              </RotaComProjeto>
            </RotaPrivada>
          }
        />
        <Route
          path="/equipe"
          element={
            <RotaPrivada>
              <EquipePage />
            </RotaPrivada>
          }
        />
        <Route
          path="/campanhas"
          element={
            <RotaPrivada>
              <RotaComProjeto>
                <CampanhasPage />
              </RotaComProjeto>
            </RotaPrivada>
          }
        />
        <Route
          path="/aprovacoes"
          element={
            <RotaPrivada>
              <RotaComProjeto>
                <AprovacoesPage />
              </RotaComProjeto>
            </RotaPrivada>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <RotaPrivada>
              <RotaComProjeto>
                <ConfiguracoesPage />
              </RotaComProjeto>
            </RotaPrivada>
          }
        />
      </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ProjetoAtualProvider>
        <AppShell />
      </ProjetoAtualProvider>
    </BrowserRouter>
  )
}

export default App
