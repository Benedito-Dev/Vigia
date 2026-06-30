import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/login/login-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { AprovacoesPage } from '@/pages/aprovacoes/aprovacoes-page'
import { ConfiguracoesPage } from '@/pages/configuracoes/configuracoes-page'
import { ProjetosPage } from '@/pages/projetos/projetos-page'
import { RotaPrivada } from '@/app/rota-privada'
import { ProjetoAtualProvider } from '@/app/use-projeto-atual'

function App() {
  return (
    <BrowserRouter>
      <ProjetoAtualProvider>
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
                <DashboardPage />
              </RotaPrivada>
            }
          />
          <Route
            path="/aprovacoes"
            element={
              <RotaPrivada>
                <AprovacoesPage />
              </RotaPrivada>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <RotaPrivada>
                <ConfiguracoesPage />
              </RotaPrivada>
            }
          />
        </Routes>
      </ProjetoAtualProvider>
    </BrowserRouter>
  )
}

export default App
