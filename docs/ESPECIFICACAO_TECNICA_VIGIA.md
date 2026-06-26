# ESPECIFICAÇÃO TÉCNICA — MVP
## Vigia

**Versão do documento:** 1.0.0
**Data:** Junho de 2026
**Status:** Aprovado para desenvolvimento
**Plataforma de anúncio (MVP):** Meta Ads (Facebook / Instagram)
**Público-alvo:** Gestores de tráfego autônomos
**Nome do produto:** Vigia
**Uso inicial:** Interno (Giga Cell) → expansão SaaS posterior

---

## SUMÁRIO

1. Visão geral e princípios de produto
2. Escopo: o que está dentro e o que está fora
3. Arquitetura de alto nível
4. Stack tecnológica
5. Modelo de dados
6. Onde a IA entra (e onde não entra)
7. Especificação dos módulos
8. Contratos de API
9. Integração com a Meta Ads API
10. Segurança e gestão de segredos
11. Modelo de cobrança e controle de custo de IA
12. Fases de construção e critérios de aceite
13. Requisitos não-funcionais
14. Glossário

---

## 1. VISÃO GERAL E PRINCÍPIOS DE PRODUTO

### 1.1. O que é o sistema

Um sistema de **gestão e monitoramento de campanhas de tráfego pago já ativas**. O produto assume a operação de uma campanha *depois* que o criativo já existe e a estratégia já foi decidida pelo gestor. Sua função é manter a campanha sob controle: operá-la, monitorá-la diariamente contra benchmarks, diagnosticar quedas de performance, sugerir ações e entregar relatórios automáticos.

### 1.2. O que o sistema NÃO é

Não é uma agência automatizada. Não cria criativos. Não escreve copy. Não define estratégia de posicionamento. Não monta briefings extensos de onboarding. Não substitui o julgamento do gestor — ele o acelera.

### 1.3. Princípios inegociáveis

1. **Human-in-the-loop no que envolve dinheiro.** Publicar, escalar verba e criar público nunca são automáticos. Sempre passam por aprovação humana.
2. **Hard stops absolutos.** Teto de verba diária e CPL máximo nunca são ultrapassados pela automação, em nenhuma circunstância.
3. **Auditabilidade total.** Toda decisão (humana ou automática) é registrada de forma imutável.
4. **IA como camada opcional e mensurável.** A inteligência é um recurso de custo controlado, não o núcleo obrigatório. O sistema funciona com inteligência mínima e ganha sofisticação progressivamente.
5. **Transparência de causa.** O sistema nunca age sem registrar o motivo (qual KPI, qual desvio, qual gatilho).

---

## 2. ESCOPO

### 2.1. Dentro do escopo (MVP)

| Módulo | Responsabilidade |
|---|---|
| M1 — Gestão de contas e campanhas | Conectar conta, criar/editar/pausar/arquivar campanha, vincular criativos, ajustar orçamento |
| M2 — Monitoramento e BI | Ingestão diária de métricas, cálculo de KPIs, comparação com benchmark, painel, alertas |
| M3 — Diagnóstico e otimização | Detectar desvios, gerar hipóteses, propor ações |
| M4 — Fila de aprovação | Human-in-the-loop para ações financeiras e de publicação |
| M5 — Relatórios automáticos | Geração e entrega agendada (WhatsApp / e-mail) |
| M6 — Validação automática (QA) | Score de qualidade em artefatos gerados pela IA |

### 2.2. Fora do escopo

- Criação de criativos (imagem, vídeo, carrossel)
- Redação de copy de anúncio
- Estratégia de posicionamento e funil
- Construção de landing pages
- Instalação de pixel e rastreamento (pré-requisito externo; o gestor instala antes)
- Briefing extenso de onboarding (perfil de cliente com dezenas de campos)
- Suporte a Google Ads, TikTok Ads e outras plataformas (fases futuras)

### 2.3. Pré-requisitos que o gestor traz

- Conta de anúncio Meta com pixel já instalado e testado
- Criativos prontos (carregados na biblioteca do Meta ou para upload)
- Acesso à conta (Ad Account ID + Access Token via System User)
- Definição de nicho, ticket médio e metas (CPL, CPA, ROAS alvo)

---

## 3. ARQUITETURA DE ALTO NÍVEL

### 3.1. Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (SPA)                          │
│         React + TypeScript + Vite + Tailwind                 │
│   Painel · Campanhas · Otimização · Aprovações · Relatórios  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / REST (JSON)
┌───────────────────────────▼─────────────────────────────────┐
│                    BACKEND (API REST)                        │
│              NestJS (Node + TypeScript)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Camada de aplicação (controllers + services)         │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Camada de domínio (regras de negócio, hard stops)    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Camada de integração (Meta Ads API client)           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────┬──────────────────┬───────────────────┬───────────────┘
       │                  │                   │
┌──────▼──────┐   ┌────────▼────────┐   ┌──────▼───────────┐
│ PostgreSQL  │   │  Redis          │   │  Workers (cron)  │
│ (dados)     │   │  (fila + cache) │   │  BullMQ          │
└─────────────┘   └─────────────────┘   └──────┬───────────┘
                                              │
                          ┌───────────────────┼─────────────────┐
                          │                   │                 │
                   ┌──────▼─────┐   ┌──────────▼──────┐  ┌───────▼──────┐
                   │ Meta Ads   │   │ Camada de IA    │  │ Notificações │
                   │ API        │   │ (Claude API)    │  │ WhatsApp/    │
                   │            │   │ — opcional      │  │ e-mail       │
                   └────────────┘   └─────────────────┘  └──────────────┘
```

### 3.2. Fluxo principal de dados

1. **Ingestão (diária, via worker cron):** o worker puxa métricas da Meta Ads API → normaliza → grava no PostgreSQL.
2. **Cálculo (M2):** serviço calcula KPIs canônicos e compara com tabela de benchmarks. Pura matemática, sem IA.
3. **Detecção de desvio (M2):** se um KPI sai dos limites configurados, gera um registro de alerta.
4. **Diagnóstico (M3):** para cada alerta, a camada de IA (ou regras fixas, no MVP inicial) gera hipóteses e propostas de ação.
5. **Aprovação (M4):** ações que envolvem verba/publicação entram na fila de aprovação. O gestor decide.
6. **Execução:** ações aprovadas são enviadas à Meta Ads API. Tudo é registrado no audit trail.
7. **Relatório (M5):** worker agendado gera relatório e dispara entrega.

### 3.3. Por que essa arquitetura (e não a do RIZAR original)

O documento original previa orquestração com LangGraph, múltiplos agentes especializados, RAG com Qdrant/pgvector e um event bus complexo. **Para o MVP, isso é over-engineering.** O sistema da Giga Cell tem um fluxo linear e previsível. Adotamos:

- **Monolito modular** (NestJS) em vez de microserviços — mais simples de desenvolver, depurar e implantar com uma equipe pequena.
- **Workers com BullMQ sobre Redis** em vez de Celery + event bus — nativo do ecossistema Node, menos peças móveis.
- **IA como chamada pontual de API** em vez de orquestração de agentes — controle de custo direto, sem infraestrutura de orquestração.
- A complexidade do RIZAR pode ser reintroduzida na fase SaaS, se e quando o volume justificar.

---

## 4. STACK TECNOLÓGICA

### 4.1. Frontend

| Item | Escolha | Justificativa |
|---|---|---|
| Framework | React 18 + TypeScript | Reaproveita conhecimento existente (AteneuHub) |
| Build | Vite | Build rápido, DX moderna |
| Estilo | Tailwind CSS | Consistência, velocidade de prototipação |
| Componentes | shadcn/ui | Componentes acessíveis e customizáveis |
| Roteamento | React Router | Padrão de mercado |
| Estado servidor | TanStack Query | Cache, refetch, sincronização com API |
| Gráficos | Recharts | Dashboards de métricas |
| Formulários | React Hook Form + Zod | Validação tipada |

### 4.2. Backend

| Item | Escolha | Justificativa |
|---|---|---|
| Runtime | Node.js 20 LTS | Ecossistema, mesma linguagem do front |
| Framework | NestJS | Estrutura modular, injeção de dependência, TypeScript nativo |
| ORM | Prisma | Type-safe, migrations versionadas |
| Banco relacional | PostgreSQL 16 | Robusto, suporta row-level security para o futuro multi-tenant |
| Fila / cache | Redis 7 | Filas de jobs e cache de métricas |
| Processamento assíncrono | BullMQ | Jobs agendados (cron) e filas de tarefas |
| Validação | Zod / class-validator | Schemas de I/O |

### 4.3. Integrações

| Item | Escolha |
|---|---|
| Meta Ads | Graph API (Marketing API) v19.0+ |
| IA | Claude API (Anthropic) — camada opcional |
| WhatsApp | WhatsApp Cloud API (Meta) ou provedor BSP |
| E-mail | Resend ou Amazon SES |
| Cofre de segredos | Variáveis de ambiente cifradas / AWS Secrets Manager (futuro) |

### 4.4. Infraestrutura e DevOps

| Item | Escolha | Justificativa |
|---|---|---|
| Hospedagem frontend | Vercel | Deploy automático, CDN |
| Hospedagem backend | Railway ou Render | Simples, suporta cron e workers |
| Banco gerenciado | Railway PostgreSQL / Neon | Backups automáticos |
| Redis gerenciado | Railway Redis / Upstash | Sem gestão de servidor |
| CI/CD | GitHub Actions | Lint, testes, deploy |
| Monitoramento | Sentry (erros) + logs estruturados | Observabilidade básica |
| Versionamento | Git (GitHub) | Padrão |

---

## 5. MODELO DE DADOS

Todas as tabelas carregam `tenant_id` desde o início (mesmo no uso interno) para evitar refatoração dolorosa na migração para SaaS. No MVP interno, há um único tenant.

### 5.1. Tabela: `tenant`
Representa um gestor/organização. No MVP, há apenas um registro.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| nome | TEXT | |
| plano | TEXT | 'interno' no MVP; 'free'/'pro'/'agency' no SaaS |
| limite_analises_ia_mes | INT | Cota de chamadas de IA por mês |
| analises_ia_consumidas | INT | Contador resetado mensalmente |
| created_at | TIMESTAMPTZ | |

### 5.2. Tabela: `user`
Usuário que faz login.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | FK → tenant |
| nome | TEXT | |
| email | TEXT | único |
| senha_hash | TEXT | bcrypt/argon2 |
| papel | TEXT | 'dono' / 'operador' / 'visualizador' |
| created_at | TIMESTAMPTZ | |

### 5.3. Tabela: `ad_account`
Conta de anúncio Meta conectada.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | FK |
| cliente_nome | TEXT | Nome do cliente final (ex.: "Loja X") |
| nicho | TEXT | Usado para selecionar benchmark |
| ticket_medio | NUMERIC | Em BRL |
| plataforma | TEXT | 'meta' (fixo no MVP) |
| external_id | TEXT | Ad Account ID da Meta |
| token_ref | TEXT | Referência ao token no cofre, **nunca o token cru** |
| status | TEXT | 'conectado' / 'aviso_cobranca' / 'desconectado' |
| created_at | TIMESTAMPTZ | |

### 5.4. Tabela: `campaign`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | FK |
| ad_account_id | UUID | FK |
| nome | TEXT | |
| objetivo | TEXT | 'lead' / 'venda' / 'mensagens' / 'reconhecimento' |
| tipo_orcamento | TEXT | 'CBO' / 'ABO' |
| verba_diaria | NUMERIC | |
| status | TEXT | 'ativa' / 'aprendendo' / 'pausada_ia' / 'pausada_user' / 'arquivada' |
| external_id | TEXT | ID da campanha na Meta |
| created_by | TEXT | 'sistema' ou user_id |
| created_at | TIMESTAMPTZ | |

### 5.5. Tabela: `ad_set`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id, campaign_id | UUID | FK |
| nome | TEXT | |
| verba | NUMERIC | quando ABO |
| status | TEXT | |
| external_id | TEXT | |

### 5.6. Tabela: `creative`
Criativos **vinculados** (não gerados pelo sistema).

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id, ad_set_id | UUID | FK |
| tipo | TEXT | 'video' / 'imagem' / 'carrossel' |
| formato | TEXT | '1:1' / '4:5' / '9:16' |
| asset_ref | TEXT | Referência ao asset na Meta |
| estado | TEXT | 'ativo' / 'fadiga' / 'pausado' |
| external_id | TEXT | |

### 5.7. Tabela: `metric_daily`
Snapshot diário de métricas por campanha (saída da ingestão).

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id, campaign_id | UUID | FK |
| data | DATE | |
| impressoes | BIGINT | |
| cliques | BIGINT | |
| leads | BIGINT | |
| compras | BIGINT | |
| investimento | NUMERIC | BRL |
| receita | NUMERIC | BRL |
| cpl | NUMERIC | calculado |
| cpa | NUMERIC | calculado |
| roas | NUMERIC | calculado |
| ctr | NUMERIC | calculado |
| frequencia | NUMERIC | |
| created_at | TIMESTAMPTZ | |

Índice composto: `(tenant_id, campaign_id, data)`.

### 5.8. Tabela: `benchmark`
Ground truth de comparação. Pré-populado por nicho/funil/ticket.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| nicho | TEXT | |
| tipo_funil | TEXT | |
| ticket_range | TEXT | ex.: 'ate_100', '100_500', 'acima_500' |
| kpi | TEXT | 'CPL' / 'CPA' / 'ROAS' / 'CTR' |
| valor_ruim | NUMERIC | |
| valor_medio | NUMERIC | |
| valor_bom | NUMERIC | |
| fonte | TEXT | |
| ano | INT | |

### 5.9. Tabela: `alert`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id, campaign_id | UUID | FK |
| severidade | TEXT | 'critico' / 'atencao' / 'info' |
| kpi | TEXT | |
| valor_atual | NUMERIC | |
| valor_benchmark | NUMERIC | |
| desvio_pct | NUMERIC | |
| titulo | TEXT | |
| descricao | TEXT | |
| fora_do_alcance_ia | BOOLEAN | ex.: falha de cobrança |
| origem | TEXT | 'M2' / 'governanca' |
| status | TEXT | 'aberto' / 'resolvido' / 'ignorado' |
| created_at | TIMESTAMPTZ | |

### 5.10. Tabela: `diagnosis`
Saída do M3 — diagnóstico de um alerta.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id, alert_id | UUID | FK |
| etapa_funil | TEXT | |
| hipoteses | JSONB | array de {id, probabilidade, causa, acao_proposta} |
| gerado_por | TEXT | 'ia' / 'regra_fixa' |
| custo_ia | NUMERIC | tokens × preço, se gerado por IA |
| created_at | TIMESTAMPTZ | |

### 5.11. Tabela: `approval`
Fila human-in-the-loop.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | FK |
| tipo | TEXT | 'publicar' / 'escalar_verba' / 'criar_publico' / 'pausar' |
| alvo_ref | UUID | campaign / ad_set |
| descricao | TEXT | |
| gatilho | JSONB | KPIs/snapshot que motivaram |
| origem | TEXT | 'M3' / 'sistema' |
| autonomia | TEXT | 'autonoma' / 'assistida' / 'vedada' |
| status | TEXT | 'pendente' / 'aprovado' / 'ignorado' / 'executado' / 'falhou' |
| decidido_por | TEXT | user_id |
| decidido_em | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### 5.12. Tabela: `safety_limit`
Hard stops por conta.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id, ad_account_id | UUID | FK |
| teto_verba_diaria | NUMERIC | |
| cpl_maximo | NUMERIC | |
| escala_max_pct_dia | INT | default 20 |

### 5.13. Tabela: `report`

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id, ad_account_id | UUID | FK |
| tipo | TEXT | 'semanal' / 'mensal' / 'pos' |
| formato | TEXT | 'pdf' / 'whatsapp' |
| agendamento | TEXT | expressão cron |
| destino | TEXT | número WhatsApp / e-mail |
| conteudo_gerado | JSONB | última narrativa gerada |
| gerado_por | TEXT | 'ia' / 'template' |
| created_at | TIMESTAMPTZ | |

### 5.14. Tabela: `audit_log`
Append-only. Imutável.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | FK |
| ator | TEXT | user_id ou 'sistema' |
| acao | TEXT | ex.: 'campanha.pausada', 'verba.escalada' |
| alvo_ref | UUID | |
| dados_antes | JSONB | |
| dados_depois | JSONB | |
| gatilho | JSONB | |
| timestamp | TIMESTAMPTZ | default now() |

Regra: nenhuma operação de UPDATE ou DELETE é permitida nesta tabela. Apenas INSERT.

### 5.15. Tabela: `ia_usage_log`
Rastreamento de consumo de IA para controle de custo e cota.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | FK |
| modulo | TEXT | 'M3' / 'M5' / 'M6' |
| tokens_in | INT | |
| tokens_out | INT | |
| custo_brl | NUMERIC | |
| sucesso | BOOLEAN | |
| timestamp | TIMESTAMPTZ | |

---

## 6. ONDE A IA ENTRA (E ONDE NÃO ENTRA)

Esta é uma decisão arquitetural central. A IA é tratada como **camada opcional e mensurável**, não como núcleo obrigatório. Cada chamada de IA é registrada em `ia_usage_log` com custo associado.

### 6.1. Mapa de uso de IA

| Módulo | IA necessária? | Substituível por algoritmo? | Frequência | Custo |
|---|---|---|---|---|
| M1 — Campanhas | Não | — (é CRUD puro) | Sob demanda | Zero |
| M2 — Monitoramento | Não | — (é matemática) | Diário | Zero |
| M3 — Diagnóstico | Sim (núcleo do valor) | Parcialmente, via regras fixas | 1× / dia / campanha com desvio | Médio |
| M4 — Aprovações | Não | — (é lógica condicional) | Sob demanda | Zero |
| M5 — Relatórios | Moderado | Sim, via template | 1× / semana e 1× / mês | Baixo |
| M6 — QA | Leve | Sim, via checklist de regras | Por artefato | Baixo |

### 6.2. Estratégia de duas velocidades

O sistema é projetado para operar em dois modos, configurável por tenant:

**Modo "regras" (custo zero de IA):**
- M3 usa uma árvore de decisão fixa: mapeia o tipo de desvio (CPL alto, frequência alta, CTR baixo) a hipóteses pré-escritas com probabilidades baseadas em frequência histórica.
- M5 usa templates de relatório com preenchimento de variáveis.
- M6 usa um checklist booleano de validação.

**Modo "IA" (custo controlado por cota):**
- M3 envia o contexto da campanha + histórico ao Claude API, que gera hipóteses contextualizadas em linguagem natural.
- M5 gera narrativa fluida e personalizada.
- M6 avalia qualidade semântica.

Isso permite lançar o MVP em modo regras (custo zero), validar o produto, e ativar IA progressivamente conforme a cobrança por plano for definida.

### 6.3. Contrato da camada de IA (M3 — diagnóstico)

Quando em modo IA, a chamada segue este formato:

```
Entrada para o Claude API:
{
  "campanha": { nome, objetivo, nicho, ticket_medio },
  "desvio": { kpi, valor_atual, valor_benchmark, desvio_pct, etapa_funil },
  "historico_7d": [ { data, cpl, ctr, frequencia, ... } ],
  "instrucao": "Gere exatamente 3 hipóteses para esta queda de
                performance, ordenadas por probabilidade. Para cada
                hipótese, indique a causa provável e uma ação concreta.
                Responda apenas em JSON, sem texto adicional."
}

Saída esperada (JSON estrito):
{
  "hipoteses": [
    { "id": "H1", "probabilidade": 0.60, "causa": "...", "acao_proposta": "..." },
    { "id": "H2", "probabilidade": 0.25, "causa": "...", "acao_proposta": "..." },
    { "id": "H3", "probabilidade": 0.15, "causa": "...", "acao_proposta": "..." }
  ]
}
```

Antes de cada chamada, o serviço verifica `tenant.analises_ia_consumidas < tenant.limite_analises_ia_mes`. Se a cota estourou, faz fallback para o modo regras e registra o evento.

---

## 7. ESPECIFICAÇÃO DOS MÓDULOS

### 7.1. M1 — Gestão de contas e campanhas

**Responsabilidade:** operação completa do ciclo de vida de uma campanha.

**Funcionalidades:**
- Conectar conta Meta: o gestor insere Ad Account ID + Access Token. O sistema valida fazendo uma chamada de teste à Graph API. Token vai para o cofre; apenas a referência é salva.
- Criar campanha: formulário com nome, objetivo, tipo de orçamento (CBO/ABO), verba diária, vinculação de criativos existentes. Ao salvar, o sistema cria a campanha na Meta via API **em estado PAUSADO**. A publicação (ativação) passa pela fila de aprovação (M4).
- Editar campanha: alterar nome, verba, status. Alteração de verba acima do limite de escala gera item de aprovação.
- Pausar / reativar: ação direta (pausar é sempre permitido sem aprovação; reativar passa por aprovação se estava pausada pela IA).
- Arquivar campanha: encerra o monitoramento.
- Vincular criativo: associa um criativo já existente na biblioteca Meta a um conjunto.

**Regras de negócio:**
- Nenhuma campanha é publicada (ativada) sem aprovação humana.
- Toda criação/edição é registrada no audit_log.
- Toda ação de escrita na Meta passa pela camada de integração, que respeita rate limits.

### 7.2. M2 — Monitoramento e BI diário

**Responsabilidade:** dar visão diária do estado das campanhas, sem IA.

**Funcionalidades:**
- Worker de ingestão (cron diário, ex.: 6h da manhã) puxa métricas das últimas 24h de cada campanha ativa via Meta Insights API.
- Normaliza e grava em `metric_daily`.
- Calcula KPIs: CPL = investimento/leads; CPA = investimento/compras; ROAS = receita/investimento; CTR = cliques/impressões.
- Compara cada KPI com o benchmark do nicho/ticket da conta.
- Atribui status por KPI: ABAIXO (vermelho) / NA_MEDIA (amarelo) / ACIMA (verde).
- Gera alertas quando os gatilhos disparam.

**Gatilhos de alerta:**
- KPI cai >15% em 7 dias
- CPL sobe >25% em 3 dias
- ROAS < 1,5×
- Frequência > 3
- Custo > 120% do orçamento previsto

**Painel:** três níveis de visão — operacional (por campanha, hoje), tático (tendência 7d), estratégico (mês). Renderiza os dados já calculados; o front nunca calcula nada.

### 7.3. M3 — Diagnóstico e otimização

**Responsabilidade:** transformar um sinal de desvio em hipóteses e propostas de ação.

**Funcionalidades:**
- Worker diário processa alertas abertos.
- Para cada alerta, gera diagnóstico (modo regras OU modo IA, conforme config do tenant).
- Produz exatamente 3 hipóteses ordenadas por probabilidade.
- Cada hipótese tem uma ação proposta concreta.
- Ações que envolvem verba/publicação viram itens na fila de aprovação (M4).
- Controle de testes: máximo 3 testes ativos simultâneos por conta.

**Exemplo (modo regras), desvio "CPL alto":**
- H1 (60%): criativos cansados (frequência alta) → propor pausa dos criativos com fadiga
- H2 (25%): público degradado → propor revisão de segmentação
- H3 (15%): oferta/LP não converte → sinalizar ao gestor (fora do escopo de ação automática)

**Regras inegociáveis:**
- Nunca propor mais de 3 testes simultâneos.
- Toda proposta registra o gatilho que a motivou.
- Aprendizado é arquivado para refinar probabilidades futuras.

### 7.4. M4 — Fila de aprovação (human-in-the-loop)

**Responsabilidade:** garantir que dinheiro e publicação sempre passem pelo humano.

**Matriz de autonomia:**

| Ação | Classificação | Comportamento |
|---|---|---|
| Pausar criativo em fadiga | Autônoma | Faz e registra |
| Emitir alerta | Autônoma | Faz e registra |
| Pausar campanha com CPL acima do teto | Autônoma | Faz e registra |
| Publicar campanha nova | Assistida | Sugere → humano aprova |
| Escalar verba | Assistida | Sugere → humano aprova |
| Reativar campanha pausada pela IA | Assistida | Sugere → humano aprova |
| Gastar acima do teto | Vedada | IA nunca executa |
| Alterar dados de pagamento da conta | Vedada | IA nunca executa |

**Funcionalidades:**
- Tela de fila com itens pendentes, ordenados por severidade.
- Cada item mostra: o que será feito, o gatilho (KPIs que motivaram), e botões aprovar/ignorar.
- Ao aprovar, o sistema executa a ação na Meta e registra no audit_log.
- Hard stops são verificados em toda execução: se a ação violaria `teto_verba_diaria` ou `cpl_maximo`, é bloqueada mesmo com aprovação.

### 7.5. M5 — Relatórios automáticos

**Responsabilidade:** entregar resultados ao cliente de forma autônoma e agendada.

**Funcionalidades:**
- Tipos: semanal, mensal, pós-campanha.
- Geração: modo template (variáveis preenchidas) ou modo IA (narrativa gerada).
- Entrega: WhatsApp (versão curta) e/ou e-mail (PDF white-label).
- Agendamento: expressão cron por relatório (ex.: toda segunda 8h).
- White-label: o relatório sai com a marca do gestor, sem menção ao sistema.

**Conteúdo:** dados consolidados do período + comparação com benchmark + (em modo IA) narrativa explicativa + recomendações.

### 7.6. M6 — Validação automática (QA)

**Responsabilidade:** garantir qualidade de artefatos gerados pela IA antes de chegarem ao gestor.

**Funcionalidades:**
- Todo output de IA (diagnóstico, narrativa de relatório) passa por validação.
- Modo regras: checklist booleano (tem 3 hipóteses? probabilidades somam ~100%? ação é concreta?).
- Modo IA: score semântico 0–100.
- Score ≥ 80: aprovado. < 80: volta ao gerador (até 2 retentativas). 3 rejeições: escala ao gestor.

---

## 8. CONTRATOS DE API (FRONT ↔ BACK)

Todas as respostas seguem os schemas das tabelas. Todo request carrega autenticação (JWT) e o `tenant_id` derivado do token.

| Tela | Método + endpoint | Devolve |
|---|---|---|
| Login | `POST /api/v1/auth/login` | JWT + dados do usuário |
| Painel | `GET /api/v1/metrics/daily?ad_account_id=` | métricas + status por campanha |
| Painel | `GET /api/v1/metrics/trend?period=7d` | tendência para gráficos |
| Campanhas | `GET /api/v1/campaigns` | lista de campanhas + ad_sets + métricas |
| Campanhas | `POST /api/v1/campaigns` | cria campanha (estado pausado) |
| Campanhas | `PATCH /api/v1/campaigns/{id}` | edita (verba/status/nome) |
| Campanhas | `DELETE /api/v1/campaigns/{id}` | arquiva |
| Criativos | `GET /api/v1/creatives?ad_account_id=` | lista criativos da biblioteca Meta |
| Criativos | `POST /api/v1/ad-sets/{id}/creatives` | vincula criativo a conjunto |
| Otimização | `GET /api/v1/diagnoses/latest` | últimos diagnósticos (M3) |
| Aprovações | `GET /api/v1/approvals?status=pendente` | fila |
| Aprovações | `POST /api/v1/approvals/{id}/decide` | `{decisao: 'aprovar'\|'ignorar'}` → executa ou descarta |
| Relatórios | `GET /api/v1/reports` | lista de relatórios configurados |
| Relatórios | `POST /api/v1/reports` | cria configuração de relatório agendado |
| Relatórios | `POST /api/v1/reports/{id}/generate` | gera sob demanda |
| Conta | `POST /api/v1/ad-accounts/connect` | `{external_id, access_token}` → valida e conecta |
| Limites | `PUT /api/v1/ad-accounts/{id}/safety-limits` | define hard stops |

**Padrões:**
- Toda ação financeira retorna `requires_approval: true` quando excede alçada, em vez de executar direto.
- Paginação por cursor.
- Erros seguem formato `{ error: { code, message, details } }`.

---

## 9. INTEGRAÇÃO COM A META ADS API

### 9.1. Autenticação
- O gestor fornece um System User Access Token de longa duração + Ad Account ID.
- O sistema valida com uma chamada a `GET /{ad-account-id}` na Graph API.
- Token armazenado no cofre; apenas `token_ref` no banco.

### 9.2. Leitura de métricas (ingestão)
- Endpoint: Insights API (`GET /{campaign-id}/insights`).
- Campos: impressions, clicks, spend, actions (leads, purchases), ctr, frequency.
- Janela: últimas 24h, agregação diária.

### 9.3. Escrita (criação/edição de campanhas)
- Criação sempre em `status: PAUSED`.
- Ativação (`status: ACTIVE`) somente após aprovação na fila M4.
- Edição de verba via `POST /{campaign-id}` com `daily_budget`.

### 9.4. Rate limits
- A Meta impõe limites por app e por conta de anúncio.
- O scheduler deve respeitar janelas e implementar backoff exponencial em caso de throttling.
- **Importante:** verificar os limites atuais na documentação oficial da Meta antes de dimensionar a frequência do cron, pois variam por tier de acesso da app.

### 9.5. Tratamento de falhas
- Erro de billing na conta → marca `ad_account.status = 'aviso_cobranca'` → gera alerta crítico com `fora_do_alcance_ia = true`.
- Retry 3× com backoff antes de marcar falha.
- Toda falha é logada.

---

## 10. SEGURANÇA E GESTÃO DE SEGREDOS

- **Tokens nunca em texto puro no banco.** Sempre no cofre de segredos, com apenas referência no banco.
- **Senhas:** hash com argon2 ou bcrypt.
- **Autenticação:** JWT com expiração curta + refresh token.
- **Autorização:** verificação de papel (dono/operador/visualizador) em cada endpoint.
- **Multi-tenant desde o início:** `tenant_id` em toda tabela. No SaaS, ativar row-level security do PostgreSQL.
- **HTTPS obrigatório** em toda comunicação.
- **Audit trail imutável:** apenas INSERT na tabela audit_log.
- **Validação de entrada:** Zod/class-validator em todo payload.

---

## 11. MODELO DE COBRANÇA E CONTROLE DE CUSTO DE IA

### 11.1. Modelo escolhido: acesso/limitação por plano

Modelo familiar ao mercado e ao usuário leigo. Cada plano inclui uma cota mensal de "análises de IA" (chamadas a M3/M5 em modo IA). Quem usa mais, sobe de plano.

### 11.2. Estrutura de planos (rascunho para a fase SaaS)

| Plano | Contas de anúncio | Análises de IA/mês | Relatórios IA | Observação |
|---|---|---|---|---|
| Interno (MVP) | ilimitado | controlado por config | sim | uso Giga Cell |
| Free | 1 | 0 (modo regras) | template | porta de entrada |
| Pro | 5 | 100 | sim | gestor autônomo típico |
| Agency | 20 | 500 | sim | agências |

### 11.3. Controle técnico
- Cada chamada de IA registra custo em `ia_usage_log`.
- Antes de cada chamada, verifica cota do tenant.
- Cota estourada → fallback automático para modo regras (custo zero), sem quebrar a experiência.
- Relatório mensal de custo de IA por tenant para validar se a margem fecha.

### 11.4. Recomendação para o MVP interno
Como o uso inicial é interno e o consumo de IA é baixo (análises diárias, não geração em massa), opere em **modo regras** ou **IA com cota generosa** e **meça o consumo real** por 1–2 meses antes de fixar os preços dos planos SaaS. Os números reais decidem a precificação, não estimativas.

---

## 12. FASES DE CONSTRUÇÃO E CRITÉRIOS DE ACEITE

| # | Bloco | Pronto quando |
|---|---|---|
| 1 | Fundação: auth + multi-tenant + cofre de segredos | Usuário loga; tenant isolado; token nunca exposto |
| 2 | Conexão de conta Meta (token manual) | Conta valida e conecta; billing vira alerta |
| 3 | M1: CRUD de campanhas + vinculação de criativos | Cria campanha pausada na Meta; edita; pausa; arquiva |
| 4 | Ingestão diária + metric_daily + benchmarks | Métricas chegam diárias e comparam com benchmark |
| 5 | M2: painel + alertas | Dashboard renderiza KPIs com status; alertas disparam |
| 6 | M4: fila de aprovação + hard stops | Ações de verba param na fila; teto nunca é ultrapassado |
| 7 | Audit trail + telemetria | Toda decisão logada e imutável |
| 8 | M3: diagnóstico (modo regras primeiro) | Gera 3 hipóteses por desvio; máx. 3 testes |
| 9 | M5: relatórios (template primeiro) | Relatório gerado e entregue por e-mail/WhatsApp |
| 10 | M6: QA | Artefato com score < 80 volta ao gerador |
| 11 | Camada de IA opcional + ia_usage_log | M3/M5 em modo IA com cota e fallback |

**Ordem de prioridade do MVP mínimo viável:** blocos 1 a 7 entregam um sistema já útil para a Giga Cell (operar e monitorar campanhas com aprovação humana). Os blocos 8 a 11 adicionam a inteligência progressivamente.

---

## 13. REQUISITOS NÃO-FUNCIONAIS

- **Desempenho:** painel carrega em < 2s; ingestão diária completa em < 10min para até 50 campanhas.
- **Disponibilidade:** alvo 99% no MVP.
- **Observabilidade:** logs estruturados; erros no Sentry; métricas de custo de IA.
- **Escalabilidade:** arquitetura monolítica modular suporta o uso interno e a fase inicial de SaaS; migração para serviços separados só se o volume exigir.
- **Backup:** banco com backup automático diário.
- **Internacionalização:** interface em português (BR) no MVP.

---

## 14. GLOSSÁRIO

- **CPL** — Custo Por Lead.
- **CPA** — Custo Por Aquisição (venda).
- **ROAS** — Return On Ad Spend (retorno sobre investimento em anúncio).
- **CTR** — Click-Through Rate (taxa de cliques).
- **CBO** — Campaign Budget Optimization (orçamento na campanha).
- **ABO** — Ad Set Budget Optimization (orçamento no conjunto).
- **Benchmark** — valor de referência de um KPI para um nicho/ticket.
- **Human-in-the-loop** — modelo em que ações sensíveis exigem aprovação humana.
- **Hard stop** — limite absoluto que a automação nunca ultrapassa.
- **Fadiga de criativo** — queda de performance por excesso de exibição (frequência alta).
- **Audit trail** — registro imutável de todas as decisões.
- **Tenant** — uma organização/gestor isolado dentro do sistema multi-cliente.

---

*Fim do documento. Versão 1.0.0.*
