# VIGIA — CAMADAS DE LITERACIA
## Especificação de feature pós-MVP

**Status:** especificada, não incluída no MVP mínimo viável
**Prioridade pós-MVP:** alta — primeira feature a entrar depois do MVP (blocos 1-7) estar funcionando
**Padrão no MVP:** sistema opera com linguagem "avançada" fixa para todos os usuários (sem esta feature ativa)
**Origem:** identificada durante sessão de fluxo de usuário (junho/2026) — Benedito observou que o Vigia, com a linguagem técnica padrão (CPL, ROAS, CTR, benchmark), serve bem o gestor de tráfego autônomo experiente, mas exclui o segundo público definido na spec original: o empresário solo/de primeira viagem que contrata integração mas não entende jargão de marketing no dia a dia.

---

## 1. Princípio central

**O dado nunca muda. A linguagem muda.**

CPL, ROAS, CTR e todo cálculo de KPI são produzidos exatamente da mesma forma para todo tenant, independente do nível de literacia. O que varia é exclusivamente a camada de apresentação textual — como o sistema *fala* sobre aquele número para a pessoa que está olhando.

Isso não é uma feature de IA generativa rodando em tempo real (custo e imprevisibilidade desnecessários para isto) — é um sistema de **templates de texto em camadas**, resolvido por um dicionário de strings por nível.

---

## 2. Os três níveis

| Nível | Perfil-alvo | Característica da linguagem |
|---|---|---|
| **Iniciante** | Empresário solo/primeira viagem em tráfego pago, sem vocabulário de marketing | Linguagem cotidiana, sem siglas. Explica o "o que isso significa pra mim" em vez de nomear a métrica |
| **Intermediário** | Pessoa com alguma familiaridade — já ouviu os termos mas não vive deles | Usa o termo técnico, mas sempre acompanhado de uma explicação curta entre parênteses ou em texto de apoio |
| **Avançado** | Gestor de tráfego autônomo, profissional | Linguagem técnica direta, sem explicação adicional — é o padrão atual do MVP |

### Exemplo de aplicação (alerta de CPL acima do benchmark)

| Nível | Texto exibido |
|---|---|
| Avançado | "CPL R$ 18,40 vs. benchmark R$ 13,00" |
| Intermediário | "Custo por lead (CPL): R$ 18,40 — a média do seu nicho é R$ 13,00" |
| Iniciante | "Você está pagando mais caro do que devia por cada pessoa interessada. O normal para esse tipo de negócio seria gastar menos" |

### Exemplo de aplicação (hipótese de diagnóstico M3)

| Nível | Texto exibido |
|---|---|
| Avançado | "H1 (60%): criativos cansados (frequência alta) → propor pausa dos criativos com fadiga" |
| Intermediário | "Maior chance (60%): seus anúncios já foram vistos demais pelas mesmas pessoas (frequência alta) → recomendamos pausar e trocar o criativo" |
| Iniciante | "O motivo mais provável: as mesmas pessoas já viram seu anúncio muitas vezes e enjoaram dele. Sugestão: trocar a imagem/vídeo do anúncio" |

---

## 3. Como o nível é definido

### 3.1. Decisão de produto (não é autoavaliação direta)

Perguntar diretamente "qual seu nível de conhecimento em tráfego pago?" sofre de viés de ego — pessoas tendem a se autoavaliar acima do real (efeito Dunning-Kruger), o que anularia o propósito da feature.

**Abordagem escolhida:** pergunta comportamental indireta no onboarding, não uma autoavaliação de competência. Exemplos de formulação:
- "Você já rodou campanhas no Meta Ads antes?" (nunca / algumas vezes / sim, regularmente)
- "Você sabe o que é CPL?" (sim / não / não tenho certeza)

A resposta mapeia para um nível inicial, mas **nunca é definitiva** — ver seção 3.2.

### 3.2. Trocável a qualquer momento

Nas configurações do usuário, um controle simples (ex.: segmented control ou dropdown) permite trocar o nível manualmente em qualquer momento: "Modo simplificado" / "Modo intermediário" / "Modo avançado". Isso cobre tanto o caso de a pergunta inicial ter sido respondida incorretamente quanto o caso de a pessoa evoluir com o uso e querer mais densidade técnica depois.

---

## 4. Onde isso entra no produto

### 4.1. Modelo de dados (campo novo)
Adicionar à tabela `user` (já existente na spec técnica principal):

| Campo | Tipo | Notas |
|---|---|---|
| nivel_literacia | TEXT | 'iniciante' / 'intermediario' / 'avancado'. Default: 'avancado' (comportamento atual do MVP) |

### 4.2. Onboarding (fluxo já mapeado)
Nova etapa entre "Definir hard stops" e "Criar/importar campanha": pergunta comportamental indireta, grava `nivel_literacia`.

### 4.3. Telas afetadas
Toda tela que exibe métrica, alerta, diagnóstico ou ação proposta consulta `nivel_literacia` e renderiza o texto correspondente:
- Painel (M2) — alertas, status de KPI
- Campanhas (M1) — descrição de status
- Diagnóstico (M3) — hipóteses e ações propostas
- Aprovações (M4) — descrição da ação e do gatilho
- Relatórios (M5) — narrativa do relatório (templates e modo IA, ambos precisam de variante por nível)

### 4.4. Implementação técnica recomendada
Dicionário de templates por chave de evento, com 3 variantes (uma por nível) — não geração de texto via IA em tempo real, para manter custo previsível e comportamento determinístico.

```
Exemplo de estrutura:
{
  "alerta.cpl_acima_benchmark": {
    "avancado": "{kpi} {valor_atual} vs. benchmark {valor_benchmark}",
    "intermediario": "Custo por lead ({kpi}): {valor_atual} — a média do seu nicho é {valor_benchmark}",
    "iniciante": "Você está pagando mais caro do que devia por cada pessoa interessada. O normal seria gastar menos"
  }
}
```

Cada módulo (M2, M3, M4, M5) precisa ter suas mensagens-chave catalogadas com as 3 variantes antes da implementação desta feature — é um trabalho de copywriting tanto quanto de engenharia.

---

## 5. Fora de escopo desta feature (mesmo pós-MVP)

- Geração de texto via IA em tempo real para personalizar a linguagem (custo/imprevisibilidade desnecessários — usar templates fixos)
- Inferência automática do nível por comportamento de uso (complexidade de engenharia alta para acerto incerto; reavaliar apenas se templates fixos se mostrarem insuficientes)
- Mais de 3 níveis, ou um slider contínuo de literacia
- Tradução de termos em outros idiomas (isso é internacionalização, tema separado)

---

## 6. Por que isso não é só um "nice to have"

Esta feature ataca diretamente um dos dois públicos-alvo definidos desde a spec original do Vigia ("empresário solo ou de primeira viagem"). Sem ela, o produto técnicamente atende esse público (a integração é feita pela equipe, a automação funciona), mas a experiência de uso diário do painel é hostil a quem não tem vocabulário de marketing — o que compromete retenção e percepção de valor justamente no segmento que mais precisaria do produto "fazer o trabalho pesado por ele".
