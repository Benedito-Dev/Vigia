# VIGIA — FLUXO DE USUÁRIO

**Status:** validado por Benedito em sessão de fluxo (junho/2026)
**Cobre:** o caminho completo do usuário, do primeiro acesso ao uso recorrente diário
**Nota importante:** este documento já inclui a etapa de **nível de literacia**, que é uma feature pós-MVP (ver `VIGIA_CAMADAS_LITERACIA.md`). No MVP mínimo viável, essa etapa não existe — o fluxo pula direto de "definir hard stops" para "criar/importar campanha", e o sistema opera com linguagem avançada fixa.

---

## PARTE 1 — ONBOARDING

Caminho percorrido uma única vez, do cadastro até a primeira campanha entrar sob monitoramento.

### 1.1. Cadastro / login
Usuário cria conta ou faz login.

### 1.2. Conectar conta Meta
Usuário insere Ad Account ID + Access Token (System User). O sistema faz uma chamada de teste à Graph API para validar.

**Decisão — token válido?**
- **Não** → erro exibido, com orientação de como gerar um novo token. Retorna para a etapa de conexão.
- **Sim** → segue para a próxima etapa.

### 1.3. Definir hard stops
Usuário configura teto de verba diária, CPL máximo, e nicho da conta (usado para selecionar o benchmark de comparação).

### 1.4. *(Pós-MVP)* Nível de literacia
Pergunta comportamental indireta é exibida — por exemplo, "Você já rodou campanhas no Meta Ads antes?" (nunca / algumas vezes / sim, regularmente).

A resposta grava o campo `nivel_literacia` no perfil do usuário (iniciante / intermediário / avançado). Este nível é **trocável a qualquer momento** depois, via configurações.

*No MVP: esta etapa não existe. O sistema usa linguagem avançada fixa para todos.*

### 1.5. Decisão — já tem campanha ativa na Meta?
- **Sim** → **importar campanha existente**. O sistema lê os dados da campanha já ativa e passa a monitorá-la.
- **Não** → **criar campanha nova**. Formulário com nome, objetivo, tipo de orçamento (CBO/ABO), verba diária, vinculação de criativos existentes.

Os dois caminhos convergem no próximo passo.

### 1.6. Campanha entra como PAUSED na Meta
Regra de negócio inegociável: toda campanha criada pelo sistema nasce em estado pausado na Meta, independente de ser nova ou importada para ativação.

### 1.7. Vai para fila de aprovação
A ativação (publicação) da campanha é uma ação assistida — precisa de aprovação humana explícita antes de ir ao ar.

### 1.8. Campanha sob monitoramento
Fim do onboarding. A campanha passa a ser monitorada diariamente pelo M2.

---

## PARTE 2 — CICLO DIÁRIO

Caminho que se repete todos os dias depois que o onboarding termina — é onde o usuário vive a maior parte do tempo de uso.

### 2.1. Abre o Painel
Ponto de entrada diário do gestor.

### 2.2. Decisão — há desvio crítico?
- **Não** → tudo saudável, o gestor fecha o app. Esse caminho é deliberadamente curto: o Vigia não deve forçar navegação quando não há nada que precise de atenção.
- **Sim** → segue para o diagnóstico.

### 2.3. Abre diagnóstico (M3)
O sistema já gerou 3 hipóteses ordenadas por probabilidade para o desvio detectado, cada uma com causa provável e ação proposta.

### 2.4. Decisão — a ação envolve verba ou publicação?

Esta é a bifurcação mais importante do sistema — materializa o princípio inegociável nº1 (human-in-the-loop no que envolve dinheiro).

- **Não** (ex.: pausar criativo em fadiga, emitir alerta) → **executa direto e registra no audit log**. Ação autônoma.
- **Sim** (ex.: escalar verba, publicar campanha, reativar campanha pausada pela IA) → **vai para a fila de aprovação (M4)**.

### 2.5. Fila de aprovação — gestor decide
Para ações que foram à fila:
- **Aprova** → o sistema executa a ação na Meta API e registra no audit log. Hard stops são verificados mesmo após aprovação — se a ação violar o teto de verba ou CPL máximo, é bloqueada de qualquer forma.
- **Ignora** → a ação é descartada, mas o evento fica registrado (nada se perde do histórico).

### 2.6. Relatório semanal entregue (M5)
Independente de qual caminho cada campanha seguiu durante a semana (autônomo, aprovado ou ignorado), o relatório consolidado é gerado e entregue automaticamente — via WhatsApp (versão curta) e/ou e-mail (PDF white-label).

O ciclo então recomeça no próximo dia, a partir de 2.1.

---

## Decisões de produto que este fluxo materializa

| Decisão | Onde aparece no fluxo |
|---|---|
| Human-in-the-loop no que envolve dinheiro | Etapa 2.4 — bifurcação central de todo o ciclo diário |
| Hard stops absolutos | Etapas 1.3 (definição) e 2.5 (verificação mesmo após aprovação) |
| Auditabilidade total | Toda execução (autônoma, aprovada ou ignorada) gera registro — etapas 2.4, 2.5 |
| Transparência de causa | Diagnóstico (2.3) sempre mostra a causa provável antes de qualquer ação proposta |
| Suporte a dois públicos (gestor experiente vs. empresário de primeira viagem) | Etapa 1.4 — nível de literacia (pós-MVP) |
| Importação de campanha já existente | Etapa 1.5 — ramificação identificada durante esta sessão, não estava explícita na spec original |

---

## Lacunas conhecidas / pontos a revisitar
- O caminho de **erro ao tentar publicar** (ex.: a Meta rejeita a ativação por algum motivo da própria plataforma) ainda não foi mapeado neste fluxo
- O que acontece quando o **hard stop bloqueia uma ação já aprovada** (etapa 2.5) — qual é a experiência exata do gestor nesse caso — não foi detalhado
- Fluxo de **conexão de múltiplas contas** (um gestor com vários clientes) não foi mapeado nesta sessão
