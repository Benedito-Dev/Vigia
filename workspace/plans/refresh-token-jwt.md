# Plano — Refresh token JWT (sessão que não cai)

**Status:** ✅ CONCLUÍDO (F1–F6). Backend verificado por curl (login/refresh/logout/reúso + auditoria no banco); frontend verificado por `tsc`/`oxlint`; F6 validada manualmente pelo usuário no browser (sessão sobrevive além dos 15 min).
**Data:** julho/2026
**Objetivo:** acabar com o deslogamento a cada 15 minutos. Introduzir um par
**access token (curto) + refresh token (longo)**, com o refresh **persistido no
banco** (revogável) e entregue ao browser em **cookie `httpOnly`**. A renovação
é transparente para o usuário — ele nunca mais é chutado para fora no meio do
trabalho.

---

## 1. Princípio deste incremento

> Access token de vida curta (15 min) continua no header `Authorization`.
> Refresh token de vida longa (30 dias) vive em cookie `httpOnly` que o JS
> nunca lê, e cujo **hash** mora no banco para poder ser revogado.
> Quando o access expira, o front chama `/auth/refresh` **uma vez**, ganha um
> access novo e **repete a request original** — sem o usuário perceber.

Regras inegociáveis deste passo:

1. **Refresh token nunca em texto puro no banco** (mesmo princípio do RF-004 /
   cofre da Meta). No banco mora só o **hash** (SHA-256). Se o banco vazar,
   ninguém reconstrói a sessão.
2. **Refresh token nunca acessível ao JavaScript.** Cookie `httpOnly` + `secure`
   (produção) + `sameSite`. Isso mata o roubo de sessão por XSS — o vetor mais
   comum em SPA. O access token, por ser efêmero (15 min), aceita ficar legível.
3. **Toda sessão é revogável.** Logout revoga de verdade; dá para invalidar um
   refresh específico (um dispositivo) sem derrubar os outros.
4. **Rotação de refresh (detecção de reúso).** A cada `/refresh`, o refresh
   antigo é revogado e um novo é emitido. Se um refresh **já revogado** for
   reapresentado, é sinal de roubo → revoga toda a família de tokens daquele
   usuário. Padrão OWASP para refresh token rotation.
5. **Auditabilidade.** Login, refresh, logout e reúso suspeito entram no
   `RegistroAuditoria` (coerente com o princípio de auditoria imutável do Vigia).
6. **Escopo mínimo honesto.** Este passo mexe só em autenticação. Não toca em
   projetos, campanhas, Meta, nem em RBAC por projeto.

---

## 2. Estado atual (ponto de partida)

### Backend — o que existe hoje
- `AuthModule` registra `JwtModule` com `expiresIn: '15m'` e um único segredo
  (`JWT_SECRET`). **Só access token, sem refresh.**
- `AuthService.login()` valida com argon2 e devolve `{ access_token, usuario }`.
- `AuthController` expõe apenas `POST /api/v1/auth/login`.
- `JwtStrategy` valida o Bearer com `ignoreExpiration: false` → depois de 15 min,
  **toda request vira 401**.
- `main.ts`: `enableCors({ origin: FRONTEND_URL })` — **sem `credentials: true`**,
  então cookie cross-origin ainda não passa. **Sem `cookie-parser`.**
- Prisma: model `Usuario` existe; **não há** model de sessão/refresh.

### Frontend — o que existe hoje
- `api-client.ts` (axios): injeta `Bearer` do `localStorage['vigia_token']`;
  no **401 apenas apaga o token** (não renova). **Sem `withCredentials`.**
- `use-login.ts`: no sucesso, grava `data.access_token` no localStorage.
- `use-auth.ts`: `estaAutenticado()` = existe token no localStorage; `logout()`
  = remove do localStorage. **Nenhuma chamada ao backend no logout.**
- `types/auth.ts`: `LoginResponse` tem `access_token` + `usuario`.

### Ambiente / dependências
- NestJS 11, `@nestjs/jwt` já instalado. Falta **`cookie-parser`** (+ `@types`).
- Postgres já sobe via docker-compose; Prisma migrations já em uso.
- Dev: front em `:5173`, back em `:3000` (cross-origin → cuidado com cookie/CORS).

### Decisões já tomadas (com o usuário)
- **Refresh persistido no banco** (revogável), não stateless.
- **Refresh em cookie `httpOnly`**; access segue em localStorage (como hoje).
- Rotação de refresh com detecção de reúso.

---

## 3. Modelo de dados (Prisma)

**Arquivo:** `backend/prisma/schema.prisma` (+ migration nova).

Novo model `RefreshToken`:

| Campo | Tipo | Notas |
|---|---|---|
| id | String (uuid) | PK |
| usuarioId | String | FK → Usuario |
| tokenHash | String | SHA-256 do refresh token (nunca o token cru) |
| familiaId | String | agrupa a cadeia de rotações (para revogar a família toda no reúso) |
| expiraEm | DateTime | agora + `REFRESH_TOKEN_TTL_DIAS` (default 30) |
| revogadoEm | DateTime? | preenchido no logout, na rotação e no reúso suspeito |
| substituidoPor | String? | id do refresh que o sucedeu (trilha da rotação) |
| criadoEm | DateTime | @default(now()) |
| userAgent | String? | opcional — origem da sessão, para telas de "dispositivos" no futuro |

- Relação: `Usuario` ganha `refreshTokens RefreshToken[]`.
- Índices: `@@index([usuarioId])`, `@@index([familiaId])`, `@@index([tokenHash])`.
- `@@map("refresh_token")`, mesmo padrão snake_case do resto do schema.

**Critério de aceite:** `npx prisma migrate dev` cria a tabela; o client tipa
`prisma.refreshToken`.

---

## 4. Serviço de tokens (emissão / hash / rotação)

**Arquivos:** `auth.service.ts` (ou um `token.service.ts` dedicado — decidir na
implementação; provável extrair para manter o `AuthService` enxuto).

- **Access token:** JWT assinado com `JWT_SECRET`, `expiresIn: 15m` (payload atual:
  `sub`, `organizacaoId`, `papel`).
- **Refresh token:** valor aleatório opaco (`randomBytes(32).toString('base64url')`)
  — **não** é JWT. Guardamos `sha256(valor)` no banco; o valor cru só volta ao
  browser no cookie.
- **Emitir sessão** (`emitirSessao(usuario, familiaId?)`): gera access + refresh,
  persiste o hash do refresh (com `familiaId` — novo no login, herdado na rotação),
  devolve `{ accessToken, refreshTokenCru, expiraEm }`.
- **Rotacionar** (`rotacionar(refreshCru)`):
  1. `sha256(refreshCru)` → busca no banco.
  2. **Não achou** → 401 (`Sessão inválida`).
  3. Achou mas **revogado** → REÚSO SUSPEITO: revoga a **família inteira**
     (`familiaId`), audita `sessao.reuso_suspeito`, lança 401.
  4. Achou e **expirado** → 401 (`Sessão expirada, faça login novamente`).
  5. Válido → marca o atual como revogado + `substituidoPor`, emite nova sessão
     na **mesma** `familiaId`, devolve novo par.
- **Revogar** (`revogar(refreshCru)`): marca `revogadoEm` (idempotente — logout).

Segredo/config novos (env): `REFRESH_TOKEN_TTL_DIAS` (default 30). O access TTL
(15m) pode virar env `ACCESS_TOKEN_TTL` também, opcional.

**Critério de aceite:** `rotacionar` devolve par novo e invalida o antigo;
reapresentar um refresh já rotacionado revoga a família e retorna 401.

---

## 5. Endpoints de auth

**Arquivos:** `auth.controller.ts`, `auth.service.ts`, `main.ts`.

Cookie helper (nome `vigia_refresh`), flags:
`httpOnly: true`, `secure: NODE_ENV === 'production'`, `sameSite: 'lax'`,
`path: '/api/v1/auth'` (o cookie só é enviado nas rotas de auth — não vaza em
toda request), `maxAge` = TTL do refresh.

- **`POST /auth/login`** (ajustar): valida credenciais → `emitirSessao` → **seta o
  cookie** `vigia_refresh` → responde `{ access_token, usuario }` (corpo **não**
  muda; o refresh vai só no cookie). Audita `sessao.login`.
- **`POST /auth/refresh`** (novo): lê `req.cookies['vigia_refresh']` → `rotacionar`
  → seta cookie novo → responde `{ access_token }`. Sem cookie → 401. Audita
  `sessao.refresh`.
- **`POST /auth/logout`** (novo): lê o cookie → `revogar` → **limpa o cookie** →
  204. Idempotente (sem cookie também responde 204). Audita `sessao.logout`.

Infra em `main.ts`:
- `app.use(cookieParser())`.
- CORS: `enableCors({ origin: FRONTEND_URL, credentials: true })` (obrigatório
  para o browser mandar/aceitar o cookie cross-origin).

**Critério de aceite:** login seta cookie `httpOnly`; `/refresh` sem novo login
devolve access válido; `/logout` revoga (um `/refresh` depois falha com 401).

---

## 6. Frontend — renovação transparente

**Arquivos:** `lib/api-client.ts`, `features/auth/use-login.ts`,
`features/auth/use-auth.ts`, `types/auth.ts`, e onde `logout()` é chamado.

1. **axios com credenciais:** `axios.create({ baseURL, withCredentials: true })`
   — para o cookie de refresh viajar.
2. **Interceptor de resposta (o coração):** no `401`:
   - Se a request falhada **já era** `/auth/refresh` ou `/auth/login` → não tenta
     de novo: limpa estado e manda para `/login`.
   - Senão: chama `POST /auth/refresh` **uma única vez**. Deu certo → guarda o
     access novo → **refaz a request original** e devolve ao chamador (usuário não
     percebe). Falhou → limpa token, `logout()` local, redireciona a `/login`.
   - **Fila de espera:** se várias requests tomam 401 ao mesmo tempo, só **uma**
     dispara o `/refresh`; as outras aguardam e são refeitas com o access novo
     (evita tempestade de refresh). Guardar uma `Promise` de refresh em curso.
3. **`use-auth.ts`:** `logout()` passa a chamar `POST /auth/logout` (revoga no
   servidor) e então limpa o localStorage — hoje só faz o local.
4. **`use-login.ts`:** inalterado no essencial (segue lendo `access_token` do
   corpo); o cookie é setado pelo servidor automaticamente.
5. **Tipos:** `RefreshResponse = { access_token: string }`.

**Critério de aceite:** deixar a aba aberta > 15 min e agir → a request renova
sozinha e conclui, **sem** voltar para a tela de login. Logout derruba a sessão
de verdade (refresh seguinte falha).

---

## 7. Config / env

- `backend/.env.example`: adicionar `REFRESH_TOKEN_TTL_DIAS=30` (e, opcional,
  `ACCESS_TOKEN_TTL=15m`). Conferir `NODE_ENV` para a flag `secure` do cookie.
- Confirmar `FRONTEND_URL` (origem exata do CORS com credentials).
- Documentar no README do backend o novo fluxo de sessão (login/refresh/logout).

---

## 8. Ordem de execução (fase a fase — paramos e conferimos a cada uma)

- [x] **F1.** Prisma: model `RefreshToken` + migration. (§3)
- [x] **F2.** Serviço de tokens: emissão, hash, rotação, detecção de reúso. (§4)
- [x] **F3.** `cookie-parser` + CORS `credentials` + cookie helper. (§5 infra)
- [x] **F4.** Endpoints `login` (ajuste), `refresh` (novo), `logout` (novo) +
      auditoria. (§5) — `token.service.ts` audita `sessao.reuso_suspeito`; controller audita login/refresh/logout.
- [x] **F5.** Front: `withCredentials`, interceptor com refresh + fila
      (`refreshEmAndamento`), `logout` no servidor. (§6)
- [x] **F6.** Teste ponta a ponta: sessão sobrevive a > 15 min (validado no
      browser pelo usuário); logout revoga; reúso de refresh derruba a família
      (provado por curl na F4).

Cada fase é verificável isoladamente.

---

## 9. Explicitamente FORA deste passo

- Tela de "dispositivos ativos" / "sair de todos os dispositivos" (o schema já
  deixa a porta aberta com `familiaId`/`userAgent`, mas a UI fica para depois).
- Mover o **access** token para cookie `httpOnly` também (mantemos em localStorage
  por ora, coerente com o app atual).
- Migração do cofre/segredos para Vault/AWS.
- RBAC por projeto, refresh com MFA, rate limiting no `/auth/*`.
- "Lembrar-me" / TTL de refresh variável por escolha do usuário.
