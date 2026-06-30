# VIGIA — DESIGN SYSTEM V2

**Status:** reescrito a partir da implementação real do painel (dashboard) — junho/2026. Toda a V2 anterior (paleta ciano elétrico sobre preto puro, modo escuro fixo) foi **descartada por completo** e substituída pelo sistema abaixo, que documenta exatamente o que está implementado em `frontend/src/index.css` e nos componentes do painel.
**Fonte de verdade:** `frontend/src/pages/dashboard/dashboard-page.tsx` + `frontend/src/index.css`. Qualquer divergência entre este documento e o código deve ser resolvida a favor do código, e este documento atualizado.

---

## 1. Princípio central

> A interface não compete por atenção. É majoritariamente neutra, e quando uma cor aparece, ela tem um significado único e não-ambíguo.

1. **Cor é exceção, não decoração.** O fundo e as superfícies são sempre neutros (cinza). Cor só aparece em números, ícones de status, barras de estado e na identidade de marca.
2. **Cada cor tem exatamente um significado, nunca dois.** Azul = identidade/marca OU investimento (nunca os dois ao mesmo tempo no mesmo contexto). Verde = bom/dentro da meta. Vermelho = crítico/fora da meta. Âmbar = atenção. Cinza = neutro/sem sinal. Uma cor nunca é reaproveitada com sentido diferente em telas próximas — foi exatamente o erro corrigido nesta sessão (Faturamento usava azul só por ser "dinheiro", colidindo com o significado de marca).
3. **Indicador de status é linha, não bolinha/badge.** Uma barra vertical fina à esquerda do item — em cards de projeto/alerta, 1px de largura colorida; nunca círculo ou pill com fundo saturado competindo com o conteúdo.
4. **Suporte a tema claro e escuro, com a mesma vivacidade de cor nos dois.** Cada token de cor de sinal (status, marca, gráfico) tem um par claro/escuro calibrado para ter a mesma intensidade percebida — nunca "vivo no escuro, apagado no claro".
5. **Intensidade de cor segue a lógica dos gráficos.** A paleta `--color-grafico-*` (mais viva/saturada, pensada para leitura rápida em linha fina) é a referência de intensidade para toda cor de sinal do produto — incluindo números de KPI e tokens de status. Não existem dois níveis de "verde" ou "vermelho" na interface.

---

## 2. Cor

Todos os tokens vivem em `frontend/src/index.css`, declarados em `:root` (claro) e `.dark` (escuro), expostos ao Tailwind via `@theme inline`.

### 2.1. Base / neutros

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--background` | `#dadde3` | `#0e1116` | Fundo do app, atrás dos cards |
| `--card` | `#f8f9fb` | `#171b22` | Fundo de card/painel — sempre mais claro/elevado que o background no claro, e vice-versa no escuro real |
| `--foreground` | `#16191f` | `#e9ebef` | Texto primário |
| `--secondary` / `--muted` / `--accent` | `#cfd3da` | `#1d222b` | Superfície secundária (hover de nav, fundo de badge sutil) |
| `--muted-foreground` | `#5b6270` | `#9aa1ad` | Texto apagado padrão (shadcn) |
| `--border` | `#c3c8d1` | `#262c36` | Bordas de card, divisores |
| `--color-text-terciario` | `#6b7280` | `#9aa1ad` | Labels, metadados |
| `--color-text-quaternario` | `#9aa0ab` | `#737a86` | Texto quase decorativo (rodapé de card, eyebrow apagado) |

O claro **não é um cinza neutro único**: `--background` e `--card` são deliberadamente separados por um salto de luminosidade perceptível (não apenas 2-3% de diferença), para que a hierarquia fundo→superfície exista de verdade — um ajuste feito nesta sessão depois de identificar que a primeira versão do claro estava "lavada" (fundo e card quase indistinguíveis).

### 2.2. Status (a cor que comunica estado de dado)

Os 4 estados de saúde de campanha — únicos consumidores legítimos desta paleta:

| Estado | Claro | Escuro | Quando usar |
|---|---|---|---|
| Crítico | `#dc2626` | `#f87171` | Fora da meta, exige ação |
| Atenção | `#d97706` | `#fbbf24` | Aproximando de um limite |
| Bom | `#16a34a` | `#4ade80` | Dentro/acima da meta |
| Neutro | `#6b7280` | `#9aa1ad` | Aprendendo, pausado, sem sinal de mérito |

Tokens: `--color-status-critico`, `--color-status-atencao`, `--color-status-bom`, `--color-status-neutro` (+ variantes `-texto` para crítico/bom, usadas quando o texto precisa do mesmo tom da barra).

**Regra de aplicação:** a barra lateral de uma linha/card usa a cor cheia (`bg-status-*`); o texto ao lado usa a variante `-texto` só quando o número precisa comunicar o mesmo estado (ex.: "0 críticas" em vermelho). Itens neutros não precisam de cor no texto.

### 2.3. Marca (identidade do produto — azul institucional)

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--color-marca` | `#2563eb` | `#60a5fa` | Logo, CTA de navegação, foco de input |
| `--color-marca-hover` | `#1d4ed8` | `#3b82f6` | Hover de elementos de marca |
| `--color-marca-texto` | `#2563eb` | `#60a5fa` | Texto/ícone na cor de marca (lockup do logo, item ativo da sidebar) |
| `--color-marca-fundo` | `#eef1f9` | `#1e2740` | Fundo sutil tingido de marca (badge, destaque de card) |

**Onde aparece:** lockup "VIGIA" + ícone na sidebar (`app-sidebar.tsx`), item de navegação ativo, KPI "Investido" (ver 2.5 — é a única métrica numérica que usa a cor de marca, porque investimento é "operação do produto", não um resultado bom/ruim).
**Onde não aparece:** nunca em um número que representa um resultado de campanha (Faturamento, Lucro líquido, CPL, ROAS) — esses usam exclusivamente a paleta de status/gráfico, para não colidir com o significado de "marca" e com o estado "aprendendo" da legenda de saúde (que também é azul).

Esta separação `--color-marca-*` vs `--color-status-*` é arquitetural e deliberada: são dois sistemas de tokens independentes, mesmo quando o tom de azul é visualmente parecido com o `neutro` ou usado perto da legenda — nunca compartilham variável.

### 2.4. Gráfico (paleta viva — fonte de intensidade)

| Token | Claro | Escuro |
|---|---|---|
| `--color-grafico-positivo` | `#16a34a` | `#4ade80` |
| `--color-grafico-negativo` | `#dc2626` | `#f87171` |
| `--color-grafico-atencao` | `#d97706` | `#fbbf24` |
| `--color-grafico-azul` | `#2563eb` | `#60a5fa` |
| `--color-grafico-neutro` | `#6b7280` | `#9aa1ad` |

Esta paleta é numericamente idêntica à de status (mesmos hex) — a unificação aconteceu nesta sessão depois de identificar que os KPIs (que usavam `--color-grafico-*`) estavam mais vivos que a legenda "Saúde das campanhas" (que usava uma paleta antiga, mais apagada). Em vez de enfraquecer os KPIs, a legenda foi promovida à mesma intensidade — `--color-status-*` passou a usar os mesmos valores de `--color-grafico-*`. Os dois grupos de token continuam existindo separadamente por motivo semântico (status = estado de dado discreto; gráfico = série contínua), não por diferença de cor.

### 2.5. Cor por KPI (regra específica do grid de métricas do dashboard)

Cada um dos 5 KPIs do topo do painel (`Investido`, `Faturamento`, `Lucro líquido`, `CPL médio`, `ROAS médio`) tem exatamente um significado de cor, nunca dividido com outro KPI:

| KPI | Cor | Por quê |
|---|---|---|
| Investido | Azul (`text-grafico-azul`) | Não tem meta nem direção "boa/ruim" — é a única métrica de identidade/operação, não de resultado |
| Faturamento | Verde/vermelho dinâmico por tendência (`direcaoBoa="subir"`) | É um resultado de campanha — segue a mesma lógica de Lucro líquido/CPL/ROAS, não a cor de marca |
| Lucro líquido | Verde (`text-grafico-positivo`) | Resultado positivo no período |
| CPL médio | Âmbar quando acima da meta (`text-grafico-atencao`) | Custo por lead acima do benchmark |
| ROAS médio | Verde quando acima da meta (`text-grafico-positivo`) | Retorno batendo a meta |

Essa tabela existe porque, ao longo da sessão, tentamos por duas vezes dar a um KPI uma cor "emprestada" de outro significado (Faturamento em azul só por ser dinheiro; Investido em cinza apagado por padrão, depois cogitado em azul pelo motivo errado) — a régua final foi: **a cor descreve o que o número É (identidade vs. resultado), nunca o que ele parece** (dinheiro, ROI etc.).

### 2.6. Sombra (tema-aware, não hardcoded)

```css
/* :root (claro) — sutil, pois preto pesado sobre fundo claro lê como mancha */
--shadow-card:    0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 16px -12px rgba(16,19,25,0.12);
--shadow-card-lg: 0 1px 0 rgba(255,255,255,0.6) inset, 0 14px 26px -16px rgba(16,19,25,0.14);
--shadow-button:  0 6px 14px -8px rgba(220,38,38,0.35);

/* .dark — mais profunda, pois o fundo já é escuro */
--shadow-card:    0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 28px -16px rgba(0,0,0,0.65);
--shadow-card-lg: 0 1px 0 rgba(255,255,255,0.05) inset, 0 20px 40px -20px rgba(0,0,0,0.75);
--shadow-button:  0 8px 16px -8px rgba(220,38,38,0.6);
```

Consumidos via `shadow-[var(--shadow-card)]` (Tailwind arbitrary value). Nunca usar um valor de sombra hardcoded fora desses 3 tokens — foi exatamente o problema corrigido nesta sessão (sombras escuras fixas ficavam pesadas demais no tema claro).

---

## 3. Tipografia

**Fonte:** Inter (`@fontsource-variable/inter`).

| Nível | Tamanho | Peso | Uso |
|---|---|---|---|
| Número hero (alerta/OK do painel) | `text-7xl` (72px) | 700 | O número que mais importa na tela — "2 de 4 campanhas fora da meta" ou o ícone de check do estado OK |
| Número de KPI | `text-2xl` (24px) | 700 | Valor de cada card do grid de métricas |
| Headline de estado OK | `text-2xl` (24px) | 700 | "Todas as suas campanhas estão OK" |
| Nome de projeto / título de página | `text-xl` (20px) | 600 | Header do dashboard, título "Meus projetos" |
| Nome de campanha / item de lista | `text-sm` (14px) | 500 | Coluna principal da tabela de campanhas |
| Label de KPI / metadado | `text-xs` (12px) | 500 | "Investido", "de R$ 800 orçados" |
| Eyebrow (label de seção) | `text-xs` (12px), uppercase, `tracking-wide` | 600 | "TUDO SOB CONTROLE", "PRECISA DA SUA ATENÇÃO", "SAÚDE DAS CAMPANHAS" |
| Lockup de logo | `text-lg` (18px) | 600 | "VIGIA" ao lado do ícone |

Regra geral: peso 700 reservado a números/headlines de destaque real (o que a tela quer que o olho ache primeiro); peso 500-600 para tudo que é label ou navegação; nunca peso 400 em texto de UI funcional (corpo neutro do produto usa 500 como piso).

---

## 4. Layout e espaçamento

- **Sidebar:** `w-64` (256px), fundo igual ao app, separada por `border-r border-border`. Lockup logo+nome no topo, seguido por uma **divisória horizontal** (`h-px bg-border`) antes do menu de navegação — adicionada nesta sessão para separar visualmente identidade de navegação.
- **Cards do painel:** um único tipo de card sutil (`PainelCard` / `KpiCard`) — fundo `bg-card`, borda `border-border`, sombra `shadow-[var(--shadow-card)]`, `rounded-lg`/`rounded-xl`. Não existe um segundo tipo de "card de métrica com fundo de superfície diferente" — todos os cards do painel compartilham o mesmo tratamento visual, diferenciados por conteúdo e tamanho, não por skin.
- **Grid de KPIs:** 5 colunas (`grid-cols-5`), `gap-3`.
- **Card de projeto (tela "Meus projetos"):** grid de 3 colunas, `gap-4`, cada card com barra lateral de estado (verde/vermelho) + nome + nicho + 2 métricas (Investido, ROAS) + rodapé com pill de saúde resumido.
- **Divisores:** `border-border` (1px) entre seções; nada mais sutil que isso é usado hoje — não há um segundo tom de borda "quase invisível".

---

## 5. Componentes-padrão (estado real)

### 5.1. Hero do painel — dois estados permanentes

O dashboard tem dois estados visuais completos e ambos estão implementados e visíveis (alternando por filtro de período, ver `dados-mock.ts`):

**Estado de alerta** (`campanhasEmDesvio > 0`):
- Borda `border-status-critico/40`, barra lateral 1px `bg-status-critico`, fundo `bg-card`, sombra `shadow-card-lg`.
- Eyebrow vermelho "PRECISA DA SUA ATENÇÃO".
- Número gigante (`text-7xl`, 700) na cor crítica + texto de apoio em `text-foreground` na mesma linha.
- Texto de contexto + botão de ação sólido na cor crítica (`bg-status-critico`, texto branco, `shadow-[var(--shadow-button)]`) — não um link discreto; aqui o CTA é a ação primária da tela.

**Estado "tudo OK"** (`campanhasEmDesvio === 0`):
- Mesma estrutura de card, borda/barra em `status-bom`.
- Eyebrow verde "TUDO SOB CONTROLE".
- `CheckCircle2` (Lucide, `size-12`) + headline "Todas as suas campanhas estão OK" em vez do número.
- Linha de apoio com o lucro líquido do período.

### 5.2. Card "Saúde das campanhas" (legenda)

Mini-grid de barras de progresso (uma por estado: crítica/atenção/saudável/aprendendo) + contagem numérica abaixo, em duas colunas. Usa exatamente os tokens de `--color-status-*` — nenhuma cor própria.

### 5.3. KpiCard (`components/shared/kpi-card.tsx`)

Estrutura: label (`text-xs`) → valor animado via count-up (`text-2xl`/700, cor conforme tabela 2.5) → linha de rodapé (variação % ou meta) → sparkline SVG customizado (`components/shared/sparkline.tsx`) com gradiente de preenchimento na mesma cor do traço.

A cor do número é **sempre estática por prop** (`corValor`), nunca computada dinamicamente dentro do componente — a decisão de qual cor usar é responsabilidade de quem instancia o card (`dashboard-page.tsx`), seguindo a tabela 2.5. Essa escolha foi revertida de uma tentativa anterior de cor 100% dinâmica dentro do componente, por ser overengineering para o que a tela precisa hoje.

### 5.4. Linha de lista (tabela de campanhas)

Barra de status (1px, cor do estado) + nome da campanha + KPI principal + barra de progresso vs. benchmark + investido — uma linha horizontal por campanha, sem badges, sem fundo alternado.

### 5.5. Sidebar de navegação

- Lockup logo+ícone em `text-marca-texto` (não mais neutro — alterado nesta sessão para dar identidade real à marca).
- Divisória horizontal abaixo do lockup.
- Item de navegação ativo: borda esquerda `border-marca`, fundo `bg-secondary`, ícone `text-marca-texto`.
- Item inativo: `text-text-terciario`, hover `bg-muted/50`.
- Rodapé fixo "Monitorando 24h" com dot pulsante em `bg-marca-texto`.

### 5.6. Card de projeto (`pages/projetos/projetos-page.tsx`)

Grid de cards na camada global (fora de qualquer projeto), cada um:
- Barra lateral 1px: verde se `campanhasEmDesvio === 0`, vermelho caso contrário.
- Nome do cliente (700) + nicho (`text-text-terciario`, `text-xs`).
- Duas métricas lado a lado: Investido (mês) e ROAS médio.
- Rodapé com contagem de campanhas ativas + pill resumido de saúde ("tudo ok" ou "N precisam atenção"), nunca a legenda completa de 4 estados — a tela de lista é um resumo, não um diagnóstico.
- Último item do grid é um card tracejado "Criar novo projeto", sempre presente (não some quando há outros projetos).
- Estado vazio (zero projetos): painel centralizado tracejado substituindo o grid inteiro, com ícone, headline e CTA.

### 5.7. Modal de criar projeto (`features/projetos/criar-projeto-dialog.tsx`)

Construído sobre um primitivo `Dialog` próprio (`components/ui/dialog.tsx`, Base UI), não um componente shadcn genérico — segue a mesma linha visual dos cards (`bg-card`, `border-border`, `shadow-card-lg`). 4 campos batendo 1:1 com o `ConectarProjetoDto` do backend: nome do cliente, nicho, Ad Account ID, Access Token (campo `password`). Botão primário em `bg-marca` (ação de criar/conectar, não um resultado de status).

---

## 6. Logo e identidade de marca

- Ícone vetorizado, sem wordmark embutido — "VIGIA" é tipografado ao lado em Inter 600.
- Componente React (`components/shared/vigia-logo.tsx`): `fill="currentColor"`, herda cor via classe Tailwind — hoje sempre `text-marca-texto` no lockup da sidebar e da tela de projetos.
- Asset estático (`assets/vigia-logo.svg`, `public/favicon.svg`): cor cravada, usado fora de componente React.

---

## 7. Arquitetura de camadas (produto)

Esta seção documenta uma decisão estrutural fixada nesta sessão, não apenas visual:

- **Camada Global** (`/projetos`, fora de `AppLayout`): lista de projetos do usuário/agência, criação/conexão de novo projeto. Vive fora da sidebar/header de projeto — tem seu próprio header minimalista (logo + ação de sair).
- **Camada de Projeto** (`/`, `/aprovacoes`, `/configuracoes`, dentro de `AppLayout` + `AppSidebar`): tudo escopado a **um projeto = uma conta de anúncios conectada** (ex.: uma conta Meta Ads por projeto, nunca compartilhada entre projetos).
- **Projeto atual** é estado de aplicação centralizado em `app/use-projeto-atual.tsx` (Context API, mesmo padrão de `use-theme.tsx`) — nenhuma página mais guarda esse estado localmente.
- **Caminho de volta:** o dropdown de projeto no header (`app-layout.tsx`) tem, abaixo da lista de projetos e de um separador, o item "Ver todos os projetos", que navega para `/projetos`. Este é o único ponto de entrada/saída entre as duas camadas.

---

## 8. O que ainda falta decidir / validar

- Telas de Aprovações e Configurações ainda são placeholder ("Em construção") — ainda não desenhadas nesta linguagem.
- Conexão real com a API do Meta Ads (OAuth ou token manual) — o modal de criar projeto hoje é mock, sem chamada real ao backend.
- Tema de telas de entrada (login) pode ter divergido visualmente do painel após esta reescrita — revalidar consistência entre `login-page.tsx` e os tokens atuais antes de considerar o conjunto unificado.
- Billing/configurações da camada Global ainda não têm tela — só a lista de projetos foi implementada.
