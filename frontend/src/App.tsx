import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/login/login-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { AprovacoesPage } from '@/pages/aprovacoes/aprovacoes-page'
import { ConfiguracoesPage } from '@/pages/configuracoes/configuracoes-page'
import { RotaPrivada } from '@/app/rota-privada'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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
    </BrowserRouter>
  )
}

export default App
