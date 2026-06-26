import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin, extrairMensagemDeErro } from '@/features/auth/use-login'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    login.mutate(
      { email, senha },
      { onSuccess: () => navigate('/') },
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-6">
      <Card className="w-full max-w-sm border-border/50">
        <CardHeader>
          <p className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
            Vigia
          </p>
          <CardTitle className="text-sm font-medium">Entrar na conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </div>
            {login.isError && (
              <p className="text-xs text-status-critico-texto">
                {extrairMensagemDeErro(login.error)}
              </p>
            )}
            <button
              type="submit"
              disabled={login.isPending}
              className="mt-2 h-9 rounded-md bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {login.isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
