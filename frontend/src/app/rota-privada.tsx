import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { estaAutenticado } from '@/features/auth/use-auth'

export function RotaPrivada({ children }: { children: ReactNode }) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />
  }
  return children
}
