# VIGIA — DOCUMENTO DE REQUISITOS
## MVP mínimo viável (blocos 1–7 do roadmap)

**Versão do documento:** 1.0.0
**Data:** Junho de 2026
**Escopo:** apenas o MVP mínimo viável — fundação, conexão de conta Meta, M1 (campanhas), ingestão e benchmarks, M2 (monitoramento), M4 (fila de aprovação e hard stops), audit trail.
**Fora deste documento:** M3 (diagnóstico com IA), M5 (relatórios), M6 (QA), camadas de literacia — ver documentos próprios quando esses blocos entrarem em planejamento.
**Convenção de numeração:** RF-XXX (requisito funcional), RNF-XXX (requisito não-funcional). Cada requisito traz o módulo de origem e, quando aplicável, critério de aceite.

---

## 1. REQUISITOS FUNCIONAIS

### 1.1. Fundação (auth, multi-tenant, cofre de segredos) — Bloco 1

**RF-001 — Cadastro e login**
O sistema deve permitir que um usuário crie uma conta e faça login com e-mail e senha.
*Critério de aceite:* senha armazenada com hash (argon2 ou bcrypt); login retorna JWT válido.

**RF-002 — Papéis de usuário**
O sistema deve suportar três papéis por usuário: dono, operador, visualizador. Cada endpoint deve verificar o papel antes de autorizar a ação.
*Critério de aceite:* um usuário com papel "visualizador" não consegue executar ações de escrita (criar campanha, aprovar item da fila).

**RF-003 — Isolamento multi-tenant**
Toda tabela do sistema deve carregar `tenant_id`, mesmo que o MVP opere com um único tenant (uso interno Giga Cell).
*Critério de aceite:* nenhuma query do sistema retorna dados de um tenant diferente do tenant autenticado.

**RF-003a — Conta Meta representada como "Projeto" para o usuário**
Cada conta de anúncio (`ad_account`) conectada por um tenant deve ser apresentada ao usuário sob o conceito de **Projeto** (ex.: "Celulares Fortaleza", "Loja Aurora") — nunca como "conta Meta" ou termo técnico equivalente na interface. Por baixo, a relação é 1 para 1: um Projeto corresponde a exatamente uma conta de anúncio conectada. Hard stops, benchmark, campanhas, alertas e histórico são específicos de cada Projeto e não se misturam entre projetos do mesmo tenant.
*Contexto de decisão:* o público majoritário do Vigia é o gestor de tráfego autônomo que atende vários clientes diferentes — não equipes internas dividindo acesso à mesma conta. O modelo de organização prioritário é "um gestor, vários Projetos de cliente". O termo "conta Meta" foi descartado deliberadamente da camada de produto por expor vocabulário técnico da plataforma de anúncio ao usuário — inclusive ao público leigo (empresário de primeira viagem) que pensa em termos do próprio cliente/negócio, não da infraestrutura por trás. Essa decisão resolve a lacuna de "conexão de múltiplas contas" identificada no documento de fluxo de usuário.
*Critério de aceite:* nenhuma tela do MVP exibe o termo "conta Meta", "ad account" ou equivalente como rótulo principal de navegação — o usuário sempre vê e seleciona "Projetos". O usuário consegue alternar entre Projetos através de um seletor visível em toda tela do sistema; dados de um Projeto nunca aparecem ao operar em outro.

**RF-003b — Papel de usuário permanece simples e global (MVP)**
No MVP, os papéis (dono / operador / visualizador) aplicam-se ao tenant como um todo, não por Projeto individual. Granularidade de permissão por Projeto específico fica fora do MVP.
*Critério de aceite:* um usuário com papel "operador" tem o mesmo nível de acesso em todos os Projetos do tenant — não há, no MVP, restrição de "operador só no Projeto do Cliente X".

**RF-004 — Cofre de segredos**
Tokens de acesso à Meta Ads API nunca devem ser armazenados em texto puro no banco de dados.
*Critério de aceite:* a tabela `ad_account` armazena apenas `token_ref`; o valor real do token reside em variável de ambiente cifrada ou serviço de cofre.

---

### 1.2. Conexão de conta Meta — Bloco 2

**RF-005 — Conectar conta via token manual**
O usuário deve poder conectar uma conta de anúncio Meta inserindo Ad Account ID e Access Token (System User).
*Critério de aceite:* o sistema realiza uma chamada de teste (`GET /{ad-account-id}`) à Graph API antes de salvar a conexão.

**RF-006 — Tratamento de token inválido**
Se a validação do token falhar, o sistema deve exibir mensagem de erro com orientação de como gerar um novo token, e não deve salvar a conexão.
*Critério de aceite:* nenhum registro de `ad_account` é criado quando a validação falha; o usuário permanece na tela de conexão.

**RF-007 — Detecção de problema de cobrança**
Se a Meta sinalizar erro de billing na conta (ex.: cartão recusado), o sistema deve marcar `ad_account.status = 'aviso_cobranca'` e gerar um alerta crítico com `fora_do_alcance_ia = true`.
*Critério de aceite:* o alerta gerado não pode ser resolvido por nenhuma ação automática do sistema — exige ação manual do gestor fora do Vigia.

---

### 1.3. M1 — Gestão de contas e campanhas — Bloco 3

**RF-008 — Definir hard stops por conta**
O usuário deve poder configurar, por conta de anúncio: teto de verba diária, CPL máximo, nicho (usado para benchmark).
*Critério de aceite:* uma conta não pode operar sem esses três valores definidos — o sistema bloqueia a criação de campanhas até que existam.

**RF-009 — Criar campanha**
O usuário deve poder criar uma campanha informando nome, objetivo (lead/venda/mensagens/reconhecimento), tipo de orçamento (CBO/ABO), verba diária, e vinculação de criativos já existentes na biblioteca Meta.
*Critério de aceite:* a campanha é criada na Meta API sempre em estado `PAUSED`, independentemente do que o usuário selecionar.

**RF-010 — Importar campanha existente**
O usuário deve poder importar uma campanha que já está ativa na Meta para que o Vigia passe a monitorá-la.
*Critério de aceite:* o sistema lê os dados atuais da campanha (nome, objetivo, orçamento, status) via Graph API e os grava localmente sem alterar o estado da campanha na Meta no momento da importação.

**RF-011 — Editar campanha**
O usuário deve poder editar nome, verba diária e status de uma campanha existente.
*Critério de aceite:* alteração de verba acima do `escala_max_pct_dia` configurado gera item na fila de aprovação (M4) em vez de aplicar a mudança diretamente.

**RF-012 — Pausar campanha**
O usuário deve poder pausar qualquer campanha em qualquer momento, sem necessidade de aprovação.
*Critério de aceite:* a ação de pausar é sempre uma ação direta e imediata, refletida tanto no Vigia quanto na Meta.

**RF-013 — Reativar campanha**
O usuário deve poder solicitar a reativação de uma campanha pausada.
*Critério de aceite:* se a campanha foi pausada pelo próprio usuário, a reativação é direta; se foi pausada pelo sistema (ex.: hard stop), a reativação exige passagem pela fila de aprovação (M4).

**RF-014 — Arquivar campanha**
O usuário deve poder arquivar uma campanha, encerrando seu monitoramento pelo Vigia.
*Critério de aceite:* uma campanha arquivada não aparece mais no painel nem gera novos alertas; seus dados históricos permanecem acessíveis.

**RF-015 — Vincular criativo existente**
O usuário deve poder associar um criativo já existente na biblioteca Meta a um conjunto de anúncios.
*Critério de aceite:* o Vigia não permite upload ou criação de criativo — apenas seleção de algo que já existe na conta Meta conectada.

**RF-016 — Publicação exige aprovação**
Nenhuma campanha pode ser ativada (mudar de `PAUSED` para `ACTIVE`) sem que essa ação tenha passado pela fila de aprovação e sido aprovada por um usuário com papel dono ou operador.
*Critério de aceite:* não existe nenhum caminho no sistema, incluindo automações futuras, que ative uma campanha sem um registro de aprovação correspondente no audit log.

---

### 1.4. Ingestão diária e benchmarks — Bloco 4

**RF-017 — Ingestão diária automática**
O sistema deve executar, via worker agendado, a coleta de métricas das últimas 24h de cada campanha ativa, através da Meta Insights API.
*Critério de aceite:* a execução ocorre uma vez por dia em horário configurável (ex.: 6h da manhã), sem necessidade de ação manual.

**RF-018 — Cálculo de KPIs canônicos**
O sistema deve calcular CPL (investimento/leads), CPA (investimento/compras), ROAS (receita/investimento) e CTR (cliques/impressões) para cada campanha, a partir dos dados ingeridos.
*Critério de aceite:* os valores calculados são determinísticos e reproduzíveis a partir dos dados brutos armazenados — sem uso de IA nesse cálculo.

**RF-019 — Comparação com benchmark**
O sistema deve comparar cada KPI calculado com o benchmark correspondente ao nicho e ticket médio configurados na conta.
*Critério de aceite:* toda campanha sem benchmark cadastrado para seu nicho/ticket recebe status "sem dado de comparação" em vez de um falso "dentro da média".

**RF-020 — Retry em falha de ingestão**
Se a chamada à Meta API falhar durante a ingestão, o sistema deve tentar novamente até 3 vezes com backoff exponencial antes de marcar a falha.
*Critério de aceite:* toda falha, mesmo após os retries, é registrada em log com identificação da campanha e do motivo do erro.

---

### 1.5. M2 — Monitoramento e painel — Bloco 5

**RF-021 — Painel com status por campanha**
O painel deve exibir, para cada campanha ativa, seu status calculado (crítico / atenção / bom / neutro) com base na comparação com benchmark.
*Critério de aceite:* o status exibido é sempre derivado dos dados de `metric_daily` mais recentes — nunca calculado em tempo real na tela.

**RF-022 — Geração de alertas**
O sistema deve gerar um alerta automaticamente quando: KPI cai mais de 15% em 7 dias; CPL sobe mais de 25% em 3 dias; ROAS fica abaixo de 1,5×; frequência supera 3; ou custo excede 120% do orçamento previsto.
*Critério de aceite:* cada alerta gerado registra o KPI, o valor atual, o valor de benchmark, e o gatilho exato que o originou.

**RF-023 — Visão por níveis de tempo**
O painel deve oferecer três níveis de visão: operacional (campanha, hoje), tático (tendência de 7 dias), estratégico (mês).
*Critério de aceite:* a troca entre níveis não exige nova consulta de cálculo — os dados já estão pré-calculados e armazenados.

---

### 1.6. M4 — Fila de aprovação e hard stops — Bloco 6

**RF-024 — Matriz de autonomia**
O sistema deve classificar toda ação possível em autônoma, assistida ou vedada, conforme a tabela de autonomia definida na especificação técnica.
*Critério de aceite:* nenhuma ação classificada como "assistida" ou "vedada" pode ser executada sem passar pela fila ou ser bloqueada, respectivamente.

**RF-025 — Itens da fila mostram gatilho**
Cada item da fila de aprovação deve exibir a ação proposta e o gatilho (dados/KPIs) que a motivou.
*Critério de aceite:* não existe item de fila sem gatilho associado registrado.

**RF-026 — Decisão do gestor**
O usuário deve poder aprovar ou ignorar cada item da fila.
*Critério de aceite:* aprovar executa a ação na Meta API e registra no audit log; ignorar descarta a execução mas mantém o registro do evento (nunca é apagado).

**RF-027 — Hard stop absoluto, mesmo após aprovação**
Toda execução de ação, mesmo aprovada por um usuário, deve ser verificada contra `teto_verba_diaria` e `cpl_maximo` da conta antes de ser efetivada.
*Critério de aceite:* se a ação aprovada violaria o hard stop, a execução é bloqueada e um novo alerta é gerado informando o motivo do bloqueio — a ação não é silenciosamente ignorada.

**RF-028 — Falha de execução não trava a fila**
Se a execução de uma ação aprovada falhar na Meta API, o item deve ser marcado como `falhou`, e a fila deve continuar funcional para os demais itens.
*Critério de aceite:* uma falha de execução não impede o gestor de aprovar ou ignorar outros itens pendentes.

---

### 1.7. Audit trail — Bloco 7

**RF-029 — Registro append-only**
Toda ação do sistema (autônoma, aprovada ou ignorada) deve gerar um registro imutável no audit log, contendo ator, ação, dados antes/depois e gatilho.
*Critério de aceite:* a tabela `audit_log` não permite operações de UPDATE ou DELETE em nenhuma camada do sistema — apenas INSERT.

**RF-030 — Rastreabilidade completa**
Deve ser possível, a partir de qualquer ação executada, identificar quem ou o que a originou (usuário específico ou "sistema") e qual dado motivou a decisão.
*Critério de aceite:* um auditor externo, olhando apenas o audit log, consegue reconstruir a sequência de decisões sobre uma campanha sem acessar nenhuma outra tabela.

---

## 2. REQUISITOS NÃO-FUNCIONAIS

**RNF-001 — Desempenho do painel**
O painel deve carregar em menos de 2 segundos para até 50 campanhas monitoradas.

**RNF-002 — Desempenho da ingestão**
A ingestão diária completa deve ser concluída em menos de 10 minutos para até 50 campanhas.

**RNF-003 — Disponibilidade**
O sistema deve manter disponibilidade igual ou superior a 99% no período do MVP.

**RNF-004 — Observabilidade**
Toda execução de worker, falha de integração e erro de aplicação deve gerar log estruturado, capturado por uma ferramenta de monitoramento (ex.: Sentry).

**RNF-005 — Segurança de transporte**
Toda comunicação entre frontend, backend e serviços externos deve usar HTTPS, sem excecão.

**RNF-006 — Segurança de autenticação**
Sessões devem usar JWT de curta duração com mecanismo de refresh token; senhas nunca trafegam ou são armazenadas em texto puro.

**RNF-007 — Validação de entrada**
Todo payload recebido pela API deve ser validado (schema) antes de qualquer processamento, rejeitando dados malformados com erro estruturado.

**RNF-008 — Backup**
O banco de dados deve ter backup automático diário.

**RNF-009 — Escalabilidade da arquitetura**
A arquitetura (monolito modular) deve suportar o uso interno e a fase inicial de expansão SaaS sem necessidade de redesenho — separação em serviços independentes só deve ser considerada se o volume de uso exigir.

**RNF-010 — Idioma**
A interface do MVP deve ser inteiramente em português (PT-BR).

**RNF-011 — Respeito a rate limits externos**
Toda chamada à Meta Ads API deve respeitar os limites de taxa impostos pela plataforma, implementando backoff exponencial em caso de throttling.

---

## 3. RASTREABILIDADE — LACUNAS DO FLUXO DE USUÁRIO RESOLVIDAS NESTE DOCUMENTO

O documento `VIGIA_FLUXO_USUARIO.md` registrou três lacunas conhecidas. Este documento de requisitos resolve parcialmente duas delas:

| Lacuna identificada no fluxo | Requisito que a endereça | Status |
|---|---|---|
| Erro ao tentar publicar (Meta rejeita a ativação) | RF-028 (falha de execução não trava a fila) | Parcialmente resolvida — define o comportamento da fila, mas não a mensagem exata exibida ao gestor nesse caso específico |
| Hard stop bloqueia ação já aprovada | RF-027 (hard stop absoluto, mesmo após aprovação) | Resolvida — define que um novo alerta é gerado, não apenas um bloqueio silencioso |
| Conexão de múltiplas contas (um gestor, vários clientes) | RF-003a, RF-003b | **Resolvida** (sessão de revisão de papéis, junho/2026). Decisão: cada conta Meta conectada é representada ao usuário como um **Projeto** (ex.: "Loja Aurora") — relação 1 para 1 com a conta Meta por baixo, mas sem expor esse vocabulário técnico na interface. Hard stops, benchmark, campanhas e histórico são próprios de cada Projeto; o gestor alterna entre Projetos via seletor visível em toda tela. Papel de usuário (dono/operador/visualizador) permanece simples e global no MVP — RBAC granular por Projeto foi avaliado e descartado para o MVP por não corresponder ao caso de uso majoritário do público (gestor autônomo com múltiplos clientes, não equipe interna dividindo acesso por conta). |

---

## 4. FORA DESTE DOCUMENTO (POR DESENHO)

Os seguintes itens existem na especificação técnica e no roadmap do produto, mas foram deliberadamente excluídos deste documento de requisitos por estarem fora do escopo do MVP mínimo (blocos 1–7):

- M3 — Diagnóstico e otimização (geração de hipóteses, modo regras ou IA)
- M5 — Relatórios automáticos (geração e entrega agendada)
- M6 — Validação automática de qualidade (QA)
- Camada de IA opcional e `ia_usage_log`
- Camadas de literacia (nível de conhecimento do usuário) — ver `VIGIA_CAMADAS_LITERACIA.md`
- Modelo de cobrança e planos SaaS — relevante apenas na fase de expansão pós-uso-interno

Cada um desses itens deve receber seu próprio documento de requisitos quando entrar em planejamento de implementação.
