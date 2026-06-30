import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LinhaStatus } from '@/components/shared/linha-status'
import { VigiaLogo } from '@/components/shared/vigia-logo'
import { useLogin, extrairMensagemDeErro } from '@/features/auth/use-login'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    login.mutate(
      { email, senha },
      { onSuccess: () => navigate('/') },
    )
  }

  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      {/* Coluna de vitrine — mockup vivo do produto */}
      <div className="relative hidden overflow-hidden bg-[#0e1116] lg:flex lg:flex-col lg:justify-center lg:px-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div
          className="relative z-10 mb-12 max-w-lg animate-cinematic-reveal"
          style={{ animationDelay: '100ms' }}
        >
          <h2 className="text-2xl font-semibold leading-tight text-white lg:text-3xl">
            Seu anúncio não para de gastar só porque você parou de olhar.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/65">
            O Vigia continua de olho — 24 horas por dia, sem precisar abrir
            relatório nenhum. Se algo sair do esperado, a gente avisa antes
            que vire prejuízo.
          </p>
        </div>

        {/* Vitrine traduzida — número técnico explicado em linguagem humana */}
        <div
          className="relative z-10 w-full max-w-lg animate-cinematic-reveal rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/40 backdrop-blur-sm"
          style={{ animationDelay: '220ms' }}
        >
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm text-white/60">Cada cliente novo custou</p>
              <p className="mt-1 text-3xl font-semibold text-white">R$ 18,40</p>
            </div>
            <div className="h-px bg-white/10" />
            <div>
              <p className="text-sm text-white/60">Pra cada R$ 1 investido, voltaram</p>
              <p className="mt-1 text-3xl font-semibold text-white">
                R$ 3,20
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-status-bom/15 px-2.5 py-1 text-sm font-medium text-status-bom-texto align-middle">
                  <TrendingUp className="size-3.5" />
                  bom sinal
                </span>
              </p>
            </div>
            <div className="h-px bg-white/10" />
            <LinhaStatus estado="critico">
              <span className="text-sm text-white">
                Uma campanha está gastando mais do que devia
              </span>
              <span className="text-sm text-white/50">ver agora →</span>
            </LinhaStatus>
          </div>
        </div>

        <div
          className="relative z-10 mt-10 flex animate-cinematic-reveal items-center gap-2 text-sm text-white/40"
          style={{ animationDelay: '340ms' }}
        >
          <Zap className="size-4 text-text-terciario" />
          Sem termos técnicos. Sem precisar virar especialista.
        </div>
      </div>

      {/* Coluna do formulário */}
      <div className="flex items-center justify-center border-t border-border px-6 py-12 lg:border-l lg:border-t-0">
        <div
          className="w-full max-w-md animate-cinematic-reveal"
          style={{ animationDelay: '160ms' }}
        >
          <div className="mb-10 flex items-center gap-2">
            <VigiaLogo className="size-8 text-foreground" />
            <span className="text-base font-semibold tracking-wide text-foreground">
              VIGIA
            </span>
          </div>

          <h1 className="text-2xl font-semibold leading-tight text-foreground">
            Bem-vindo de volta
          </h1>
          <div className="mt-3 h-0.5 w-10 rounded-full bg-marca" />
          <p className="mt-4 text-sm text-text-terciario">
            Entre para continuar acompanhando seus anúncios.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wide text-text-terciario"
              >
                E-mail
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-quaternario" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-12 pl-10 text-base"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="senha"
                  className="text-xs font-semibold uppercase tracking-wide text-text-terciario"
                >
                  Senha
                </Label>
                <button
                  type="button"
                  className="cursor-pointer text-xs font-medium text-text-terciario transition-colors hover:text-marca-texto"
                >
                  Esqueceu?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-quaternario" />
                <Input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                  className="h-12 px-10 text-base"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((atual) => !atual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-quaternario transition-colors hover:text-text-terciario"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {login.isError && (
              <div className="flex items-start gap-2 rounded-lg border border-status-critico/25 bg-status-critico/10 px-3 py-2.5">
                <p className="text-xs leading-relaxed text-status-critico-texto">
                  {extrairMensagemDeErro(login.error)}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="mt-2 h-12 cursor-pointer rounded-lg text-base font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: login.isPending ? 'rgba(58,82,184,0.35)' : '#3a52b8',
              }}
            >
              {login.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="size-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      opacity="0.25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      opacity="0.75"
                    />
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar no painel'
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-wide text-text-quaternario">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="mt-6 text-center text-sm text-text-terciario">
            Não tem conta?{' '}
            <button
              type="button"
              className="cursor-pointer font-medium text-marca-texto transition-all hover:text-marca-hover active:scale-[0.98]"
            >
              Criar conta grátis
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
