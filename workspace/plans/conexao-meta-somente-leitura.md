# Plano — Conexão de conta Meta (somente leitura)

**Status:** aprovado, pronto para implementação
**Data:** junho/2026
**Objetivo:** sair do mock e ter um *estado de conexão estável* com uma conta Meta real,
puxando apenas dados de **leitura** (campanhas + investido + métricas que a conta entregar),
sem nenhuma escrita ou ação que impacte a conta real.

---

## 1. Princípio deste incremento

> Conectar uma conta Meta real → validar que a conexão é boa → puxar **só leitura** →
> onde não houver dado (ex.: ROAS sem pixel), mostrar **"—"** em vez de número falso.

Regras inegociáveis deste passo:

1. **Zero escrita.** Nenhuma chamada que crie, edite, pause ou altere qualquer coisa na
   conta Meta. Apenas `GET` na Graph/Insights API. A conta é usada de verdade em produção
   pelo cliente — risco operacional tem que ser nulo.
2. **Nunca inventar número.** Se o Meta não entrega o dado (sem pixel → sem receita → sem
   ROAS/CPA), o backend devolve `null` e o front exibe `"—"`. Nunca `0`, nunca estimativa.
3. **Token nunca em texto puro** (RF-004). Guardado cifrado no banco (ver seção 3).
4. **Só alimentar o que o front já exibe hoje.** Nem mais, nem menos — este passo não
   adiciona telas novas, só liga as existentes a dados reais.

---

## 2. Estado atual (ponto de partida)

### Backend — o que já existe
- Compila limpo. NestJS 11 + Prisma 5 + Postgres, multi-tenant via JWT.
- **Login real** (`POST /auth/login`), guards JWT, `RolesGuard`, `@CurrentUser`.
- Schema completo e migrado (Projeto tem `metaExternalId` + `tokenRef` + `status`).
- `ConectarProjetoDto` pronto: `{ clienteNome, nicho, externalId, accessToken }`.
- `POST /projetos/connect` e `MetaAdsClient.validarConta` existem como **TODO** (corpo vazio).
- `GET /projetos` e `GET /campaigns` respondem, mas **leem do banco**, não do Meta.
- `MetricasService.calcularKpis()` já pronto (puro, determinístico).
- `AuditoriaService.registrar()` já pronto (ponto único de escrita no log).

### Frontend — o que já existe
- `api-client.ts` (axios) com token JWT automático e trato de 401. **Tubulação pronta.**
- Login já consome a API real (`use-login.ts` + TanStack Query).
- Projetos e campanhas são **100% mock em memória** (`dados-mock.ts`, `projetos-page.tsx`).
- Modal de criar projeto já coleta o payload certo do `ConectarProjetoDto`.

### Ambiente / dependências
- Node 22 → **`fetch` nativo** (não precisa instalar cliente HTTP no backend).
- **`crypto` nativo** → AES-256-GCM para cifrar o token (sem dependência extra).
- Postgres sobe via `docker-compose.yml` já existente.
- Há um token Meta real + Ad Account ID disponíveis para teste.

### Decisões tomadas
- **Cofre:** token cifrado no próprio banco, chave em env (`TOKEN_ENCRYPTION_KEY`).
  Migração para Vault/AWS fica para depois, sem reescrever o resto.
- **Ritmo:** implementação passo a passo, com verificação a cada bloco.

---

## 3. Cofre de segredos (base de tudo)

**Arquivo novo:** `backend/src/common/cofre/cofre.service.ts` (ou util puro).

- AES-256-GCM via `node:crypto`. Chave de 32 bytes lida de `TOKEN_ENCRYPTION_KEY`
  (hex/base64 no env). Falha explícita no boot se a chave faltar ou tiver tamanho errado.
- API: `cifrar(textoPuro): string` e `decifrar(cifrado): string`.
- Formato armazenado: `iv:authTag:ciphertext` (base64), tudo numa string → cabe no
  campo `tokenRef` existente, sem mudar o schema.
- **Regra:** o token cru nunca sai deste serviço a não ser no instante da chamada ao Meta.

**Critério de aceite:** `decifrar(cifrar(x)) === x`; boot falha sem a chave.

---

## 4. MetaAdsClient — falar com o Meta (só GET)

**Arquivo:** `backend/src/integracoes/meta-ads/meta-ads.client.ts` (hoje só TODOs).

Ponto único de contato com a Graph API (nenhum outro service chama o Meta direto).
Usar `fetch` nativo. Versão da API em env (`META_API_VERSION`, default `v21.0`).

Métodos (todos leitura):
1. `validarConta(externalId, accessToken)` → `GET /{ad-account-id}?fields=name,account_status`.
   Retorna ok/erro. Base do RF-005.
2. `buscarCampanhas(externalId, accessToken)` →
   `GET /{ad-account-id}/campaigns?fields=name,objective,status,daily_budget`.
3. `buscarInsights(externalId, accessToken)` →
   `GET /{ad-account-id}/insights?fields=spend,impressions,clicks,actions&level=campaign`.
   `spend` = investido. `actions` traz leads/compras **se** houver pixel; senão vem ausente
   → mapear para `null`.

Tratamento de erro:
- Erro de auth/token inválido → erro claro para o chamador (RF-006).
- Erro de billing (`account_status` de cobrança) → sinalizar para marcar `aviso_cobranca` (RF-007).
- Retry/backoff (RF-020, RNF-011): estrutura preparada, mas **mínimo** neste passo —
  não é o foco; não sobre-engenheirar agora.

**Critério de aceite:** com token real, `validarConta` confirma a conta e `buscarCampanhas`
devolve a lista real; `buscarInsights` devolve `spend` e `null` onde não há pixel.

---

## 5. POST /projetos/connect (conectar o projeto)

**Arquivos:** `projetos.controller.ts`, `projetos.service.ts`.

Fluxo (`conectar(organizacaoId, dto)`):
1. `metaAdsClient.validarConta(dto.externalId, dto.accessToken)`.
2. Se inválido → lançar erro **sem criar registro** (RF-006).
3. Se válido → `cofre.cifrar(dto.accessToken)` → criar `Projeto` no banco com o cifrado
   em `tokenRef`, `metaExternalId`, `status: conectado`.
4. Registrar em `AuditoriaService` (`projeto.conectado`).
5. Devolver o projeto criado (sem o token, nunca).

**Critério de aceite:** token válido cria projeto e persiste cifrado; token inválido
retorna erro estruturado e **não** grava nada.

---

## 6. Leitura para o front (dados reais)

**Arquivos:** `projetos.controller.ts` (novo `GET /:id`), `campanhas.service.ts`.

- `GET /projetos/:id` → resumo do projeto (nome, nicho, status, investido do mês).
- `GET /campaigns?projeto_id=` → para o projeto, decifra o token, chama
  `buscarCampanhas` + `buscarInsights`, junta, calcula o que dá via `calcularKpis`,
  e devolve **`null`** no que não dá (ROAS/CPA/receita sem pixel).
- Não persistir métricas ainda (isso é o worker de ingestão, passo futuro) — este passo
  lê ao vivo. (Reavaliar cache leve se ficar lento; não é requisito agora.)

**Contrato de resposta (campanha):**
```
{
  id, nome, objetivo, status,
  verbaDiaria,            // daily_budget
  investido,             // spend
  cpl: number | null,     // null se sem leads
  roas: number | null,    // null se sem receita/pixel
  ...
}
```

**Critério de aceite:** o front recebe campanhas reais; campos sem dado vêm `null`.

---

## 7. Frontend — trocar mock por API real

**Arquivos:** `projetos-page.tsx`, `criar-projeto-dialog.tsx`, `dados-mock.ts` (aposentar),
`configuracoes-page.tsx`, `campanhas-page.tsx`, novos hooks em `features/`.

1. Hook `useProjetos()` (TanStack Query) → `GET /projetos`. Aposenta `projetosMock`.
2. Criar projeto → `POST /projetos/connect` de verdade; erro do back vira feedback na UI.
3. Campanhas → `GET /campaigns`; render trata `null` como `"—"` (KpiCard, cards, tabela).
4. **Conciliar vocabulário de status:** front usa `conectado`/`expirado`; back usa
   `conectado`/`aviso_cobranca`/`desconectado`. Adotar o do back e mapear os rótulos na UI.
5. Estados de carregando/erro/vazio reais (hoje é tudo síncrono em memória).

**Critério de aceite:** conectar uma conta real pela UI cria o projeto no banco e a tela
de campanhas mostra dados reais, com "—" onde o Meta não entrega.

---

## 8. Config / env

- `backend/.env.example`: adicionar `TOKEN_ENCRYPTION_KEY=` (com nota de como gerar:
  `openssl rand -hex 32`) e `META_API_VERSION=v21.0`.
- Confirmar `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`/CORS.
- Documentar no README do backend o passo de gerar a chave.

---

## 9. Ordem de execução (checklist)

- [ ] **B1.** Cofre de segredos (`cofre.service.ts`) + env `TOKEN_ENCRYPTION_KEY`.
- [ ] **B2.** `MetaAdsClient`: `validarConta`, `buscarCampanhas`, `buscarInsights` (fetch).
- [ ] **B3.** `POST /projetos/connect` (validar → cifrar → salvar → auditar).
- [ ] **B4.** Leitura real: `GET /projetos/:id` + `GET /campaigns` com `null` honesto.
- [ ] **B5.** Front: hooks reais, aposentar mock, tratar `null` → "—", conciliar status.
- [ ] **B6.** Teste ponta a ponta com a conta real (subir Postgres + backend + front).

Cada bloco é verificável isoladamente. Paramos e conferimos ao fim de cada um.

---

## 10. Explicitamente FORA deste passo

- Qualquer escrita na Meta (criar/pausar/editar/aprovar campanha).
- Worker de ingestão diária (BullMQ/cron) — este passo lê ao vivo.
- Geração de alertas / diagnóstico / relatórios (M3/M5).
- Refresh token, cofre externo (Vault/AWS), RBAC por projeto.
- Persistir histórico de métricas (`metrica_diaria`) — vem com a ingestão.
