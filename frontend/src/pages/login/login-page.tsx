import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LinhaStatus } from '@/components/shared/linha-status'
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
    <div className="relative grid min-h-svh lg:grid-cols-2">
      {/* Logo fixa no canto superior esquerdo da tela */}
      <div className="absolute left-6 top-6 z-20 flex items-center gap-2 lg:left-10 lg:top-10">
        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
          <ShieldCheck className="size-5 text-black" strokeWidth={2.5} />
        </div>
        <span className="text-base font-semibold tracking-wide text-white">
          VIGIA
        </span>
      </div>

      {/* Coluna de vitrine — mockup vivo do produto */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0b3b34] via-[#0a2e3d] to-[#0a1f3d] lg:flex lg:flex-col lg:justify-center lg:px-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 15%, rgba(52,211,153,0.55), transparent 45%), radial-gradient(circle at 85% 75%, rgba(34,211,238,0.45), transparent 50%), radial-gradient(circle at 50% 100%, rgba(99,102,241,0.3), transparent 55%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 mb-12 max-w-lg">
          <h2 className="text-2xl font-semibold leading-tight text-white lg:text-3xl">
            Você não precisa entender de marketing pra saber se ele está
            funcionando.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/65">
            O Vigia traduz seu anúncio em uma resposta simples: o dinheiro que
            você investiu está voltando? Se não, a gente te avisa antes que
            vire prejuízo.
          </p>
        </div>

        {/* Vitrine traduzida — número técnico explicado em linguagem humana */}
        <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/40 backdrop-blur-sm">
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
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-sm font-medium text-emerald-300 align-middle">
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

        <div className="relative z-10 mt-10 flex items-center gap-2 text-sm text-white/40">
          <Zap className="size-4 text-emerald-400" />
          Sem termos técnicos. Sem precisar virar especialista.
        </div>
      </div>

      {/* Coluna do formulário */}
      <div className="flex items-center justify-center border-t border-border px-6 py-12 lg:border-l lg:border-t-0">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold leading-tight text-foreground">
            Bem-vindo de volta
          </h1>
          <p className="mt-3 text-sm text-text-terciario">
            Entre para continuar acompanhando seus anúncios.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="voce@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
                className="h-12 text-base"
              />
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
              className="mt-2 h-12 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 text-base font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:brightness-110 disabled:opacity-50"
            >
              {login.isPending ? 'Entrando...' : 'Entrar no painel'}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-text-quaternario">
            Acesso restrito a contas autorizadas pela sua organização.
          </p>
        </div>
      </div>
    </div>
  )
}
