# VIGIA — DIAGRAMA FÍSICO DO BANCO DE DADOS

**Status:** validado por Benedito em sessão de modelagem (junho/2026)
**Convenção de nomenclatura:** nomes de entidade em português, alinhados ao conceito de produto (não ao jargão técnico da plataforma Meta). Esta é a referência conceitual; a decisão de manter tabelas em português ou inglês no código real do banco fica para a fase de implementação.
**Origem:** traduzido da especificação técnica original (`ESPECIFICACAO_TECNICA_VIGIA.md`), com renomeações validadas nesta sessão — `tenant` → `ORGANIZACAO`, `ad_account` → `PROJETO`, e os demais nomes técnicos para seus equivalentes em português.

---

## 1. Hierarquia — como as entidades se encaixam

Cada entidade "mora dentro" da entidade acima dela, como uma matriochka — uma organização tem várias pessoas e vários projetos; um projeto tem várias campanhas; uma campanha tem vários conjuntos; um conjunto tem vários criativos.

```
🏢 ORGANIZACAO  (a empresa — ex.: Giga Cell)
   │
   ├── 👤 USUARIO        (pessoas que logam: dono, operador, visualizador)
   │
   └── 📁 PROJETO         (cada cliente — ex.: "Loja do João", "Loja da Maria")
          │
          ├── 🛡️ LIMITE_SEGURANCA   (1 só por projeto — o teto de gasto)
          │
          └── 📢 CAMPANHA          (os anúncios daquele cliente)
                 │
                 └── 🎯 CONJUNTO    (onde mora verba e segmentação)
                        │
                        └── 🎨 CRIATIVO   (a imagem/vídeo já existente, vinculada)
                 │
                 └── 📊 METRICA_DIARIA   (o boletim de resultado de cada dia)
```

### 1.1. Os dois tipos de ligação

Nem toda ligação entre entidades é do mesmo tipo — essa distinção é importante para não confundir a leitura do diagrama:

| Tipo | O que significa | Exemplo no Vigia |
|---|---|---|
| **Um para vários** (linha sólida no ERD) | A entidade de cima pode ter múltiplas instâncias da entidade de baixo | Um Projeto tem **várias** Campanhas; uma Organização tem **vários** Projetos |
| **Um para um** (linha tracejada no ERD) | A entidade de cima tem exatamente uma instância da entidade de baixo — nunca duas, nunca zero | Um Projeto tem **exatamente um** Limite de Segurança |

**Regra prática para decidir qual tipo é uma relação nova:** se faz sentido o cliente ter várias daquela coisa ao mesmo tempo, é "um para vários". Se por natureza só pode existir uma (um teto de gasto, um RG), é "um para um".

---

## 2. Núcleo operacional

Entidades que existem desde a fundação do MVP (blocos 1 a 5 do roadmap) — identidade, organização dos clientes, e a operação diária da campanha.

### 2.1. ORGANIZACAO
A empresa-dona de tudo dentro do Vigia. No MVP interno, existe um único registro (a Giga Cell). Se o Vigia se tornar SaaS, cada gestor que assinar vira uma organização nova e isolada.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| nome | TEXT | |
| plano | TEXT | 'interno' no MVP; 'free'/'pro'/'agency' no SaaS |
| limite_analises_ia_mes | INT | Cota de chamadas de IA por mês (não usado no MVP) |
| analises_ia_consumidas | INT | Contador mensal (não usado no MVP) |
| created_at | TIMESTAMPTZ | |

### 2.2. USUARIO
As pessoas que fazem login. Papel é simples e global no MVP (não varia por projeto).

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizacao_id | UUID | FK → ORGANIZACAO |
| nome | TEXT | |
| email | TEXT | único |
| senha_hash | TEXT | bcrypt/argon2 |
| papel | TEXT | 'dono' / 'operador' / 'visualizador' |
| created_at | TIMESTAMPTZ | |

### 2.3. PROJETO
Representa um cliente do gestor. Por baixo corresponde a uma conta de anúncio Meta conectada (relação 1 para 1), mas esse vocabulário técnico nunca é exposto ao usuário — na interface, é sempre "Projeto".

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizacao_id | UUID | FK → ORGANIZACAO |
| cliente_nome | TEXT | Nome do cliente final (ex.: "Loja Aurora") |
| nicho | TEXT | Usado para selecionar benchmark |
| ticket_medio | NUMERIC | Em BRL |
| meta_external_id | TEXT | Ad Account ID da Meta — detalhe técnico de integração |
| token_ref | TEXT | Referência ao token no cofre; **nunca o token cru** |
| status | TEXT | 'conectado' / 'aviso_cobranca' / 'desconectado' |
| created_at | TIMESTAMPTZ | |

### 2.4. CAMPANHA
A unidade de trabalho real — o anúncio rodando (ou pausado) na Meta.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| projeto_id | UUID | FK → PROJETO |
| nome | TEXT | |
| objetivo | TEXT | 'lead' / 'venda' / 'mensagens' / 'reconhecimento' |
| tipo_orcamento | TEXT | 'CBO' / 'ABO' |
| verba_diaria | NUMERIC | |
| status | TEXT | 'ativa' / 'aprendendo' / 'pausada_ia' / 'pausada_user' / 'arquivada' |
| meta_external_id | TEXT | ID da campanha na Meta |
| created_at | TIMESTAMPTZ | |

### 2.5. CONJUNTO
Subdivisão da campanha onde mora a verba e a segmentação (quando o tipo de orçamento é ABO).

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| campanha_id | UUID | FK → CAMPANHA |
| nome | TEXT | |
| verba | NUMERIC | quando ABO |
| status | TEXT | |
| meta_external_id | TEXT | |

### 2.6. CRIATIVO
A imagem/vídeo do anúncio já existente na biblioteca da Meta — apenas vinculada, nunca criada pelo Vigia.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| conjunto_id | UUID | FK → CONJUNTO |
| tipo | TEXT | 'video' / 'imagem' / 'carrossel' |
| formato | TEXT | '1:1' / '4:5' / '9:16' |
| estado | TEXT | 'ativo' / 'fadiga' / 'pausado' |
| meta_external_id | TEXT | |

### 2.7. METRICA_DIARIA
Snapshot diário de métricas por campanha — o "boletim" gerado pela ingestão automática. Sempre congelado; o painel nunca recalcula em tempo real.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| campanha_id | UUID | FK → CAMPANHA |
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

Índice composto recomendado: `(projeto_id, campanha_id, data)`.

### 2.8. LIMITE_SEGURANCA
O hard stop — teto de verba e CPL máximo. Exatamente um registro por projeto (relação 1 para 1).

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| projeto_id | UUID | FK → PROJETO (único) |
| teto_verba_diaria | NUMERIC | |
| cpl_maximo | NUMERIC | |
| escala_max_pct_dia | INT | default 20 |

### 2.9. BENCHMARK
Ground truth de comparação — pré-populado por nicho/funil/ticket. Não pertence a um projeto específico; é uma tabela de referência compartilhada.

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

---

## 3. Núcleo de governança

Entidades que materializam os princípios de human-in-the-loop, hard stops e auditabilidade (blocos 6 e 7 do roadmap), além das tabelas de M3/M5/IA que existem na spec original mas estão **fora do MVP mínimo**.

| Entidade | No MVP? | Papel |
|---|---|---|
| ALERTA | ✅ Sim (bloco 5) | Detecta quando um KPI sai do esperado |
| APROVACAO | ✅ Sim (bloco 6) | Fila human-in-the-loop para ações com dinheiro/publicação |
| REGISTRO_AUDITORIA | ✅ Sim (bloco 7) | Log imutável de toda decisão do sistema |
| DIAGNOSTICO | ❌ Não (M3) | Hipóteses de causa para um alerta — fora do MVP |
| RELATORIO | ❌ Não (M5) | Configuração de relatório automático — fora do MVP |
| USO_IA | ❌ Não (camada de IA) | Rastreamento de custo de chamadas de IA — fora do MVP |

### 3.1. ALERTA

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| campanha_id | UUID | FK → CAMPANHA |
| severidade | TEXT | 'critico' / 'atencao' / 'info' |
| kpi | TEXT | |
| valor_atual | NUMERIC | |
| valor_benchmark | NUMERIC | |
| desvio_pct | NUMERIC | |
| titulo | TEXT | |
| descricao | TEXT | |
| fora_do_alcance_ia | BOOLEAN | ex.: falha de cobrança |
| origem | TEXT | 'monitoramento' / 'governanca' |
| status | TEXT | 'aberto' / 'resolvido' / 'ignorado' |
| created_at | TIMESTAMPTZ | |

### 3.2. APROVACAO
A fila human-in-the-loop — onde toda ação que envolve dinheiro ou publicação espera decisão humana.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizacao_id | UUID | FK → ORGANIZACAO |
| tipo | TEXT | 'publicar' / 'escalar_verba' / 'criar_publico' / 'pausar' |
| alvo_ref | UUID | referência à campanha ou conjunto afetado |
| descricao | TEXT | |
| gatilho | JSONB | KPIs/snapshot que motivaram |
| origem | TEXT | 'diagnostico' / 'sistema' |
| autonomia | TEXT | 'autonoma' / 'assistida' / 'vedada' |
| status | TEXT | 'pendente' / 'aprovado' / 'ignorado' / 'executado' / 'falhou' |
| decidido_por | UUID | FK → USUARIO |
| decidido_em | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### 3.3. REGISTRO_AUDITORIA
Append-only. Imutável — nenhuma operação de UPDATE ou DELETE é permitida em nenhuma camada do sistema, apenas INSERT.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizacao_id | UUID | FK → ORGANIZACAO |
| ator | TEXT | usuario_id ou 'sistema' |
| acao | TEXT | ex.: 'campanha.pausada', 'verba.escalada' |
| alvo_ref | UUID | |
| dados_antes | JSONB | |
| dados_depois | JSONB | |
| gatilho | JSONB | |
| timestamp | TIMESTAMPTZ | default now() |

### 3.4. DIAGNOSTICO *(fora do MVP — M3)*

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| alerta_id | UUID | FK → ALERTA |
| hipoteses | JSONB | array de {id, probabilidade, causa, acao_proposta} |
| gerado_por | TEXT | 'ia' / 'regra_fixa' |
| custo_ia | NUMERIC | tokens × preço, se gerado por IA |
| created_at | TIMESTAMPTZ | |

### 3.5. RELATORIO *(fora do MVP — M5)*

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| projeto_id | UUID | FK → PROJETO |
| tipo | TEXT | 'semanal' / 'mensal' / 'pos' |
| formato | TEXT | 'pdf' / 'whatsapp' |
| agendamento | TEXT | expressão cron |
| destino | TEXT | número WhatsApp / e-mail |
| conteudo_gerado | JSONB | última narrativa gerada |
| gerado_por | TEXT | 'ia' / 'template' |
| created_at | TIMESTAMPTZ | |

### 3.6. USO_IA *(fora do MVP — camada de IA opcional)*

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| organizacao_id | UUID | FK → ORGANIZACAO |
| modulo | TEXT | 'diagnostico' / 'relatorio' / 'qa' |
| tokens_in | INT | |
| tokens_out | INT | |
| custo_brl | NUMERIC | |
| sucesso | BOOLEAN | |
| timestamp | TIMESTAMPTZ | |

---

## 4. Decisões registradas nesta sessão

| Decisão | Antes | Agora | Por quê |
|---|---|---|---|
| Nome da entidade-raiz | `tenant` | `ORGANIZACAO` | "Tenant" é jargão de engenharia (multi-tenancy) sem significado intuitivo. "Organização" comunica o conceito (a empresa-dona-de-tudo) sem precisar de explicação |
| Nome da conta de cliente | `ad_account` | `PROJETO` | Evita expor vocabulário técnico da Meta ao usuário, incluindo o público leigo que pensa em termos do próprio negócio/cliente, não de infraestrutura de anúncio |
| Papel de usuário | — | Global e simples no MVP | Avaliado que múltiplos usuários com papéis granulares por projeto é caso de uso periférico para o público majoritário (gestor autônomo sozinho, não equipe dividindo acesso) |
| Demais entidades | inglês técnico | português, conceito de produto | Consistência com a decisão acima — toda a documentação fala a mesma língua, do começo ao fim |

**Nota para implementação futura:** esta tradução é conceitual/documental. Ao codar o banco real, a equipe de desenvolvimento decide se as tabelas físicas usam português (`projeto`, `campanha`) ou inglês (`project`, `campaign`) como convenção de nomenclatura no banco — isso não afeta a clareza deste documento como referência de produto.
