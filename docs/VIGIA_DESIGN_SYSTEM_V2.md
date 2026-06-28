# VIGIA — DESIGN SYSTEM V2

**Status:** validado por Benedito em sessão de wireframe (junho/2026); ampliado com a cor de marca e os padrões de tela de Login (junho/2026).
**Substitui:** a V1 (paleta azul clara com cards/badges coloridos) por uma direção mais madura e premium.
**Referência de sensação:** Linear / Apple — minimalista no sentido de cada elemento ter peso e propósito, não no sentido de vazio.

---

## 1. Princípio central

> A interface não compete por atenção. Ela se afasta para deixar a informação respirar, e quando fala, fala com peso.

Quatro regras que vêm antes de qualquer token de cor ou tipografia:

1. **Cor é exceção, não decoração.** A tela é majoritariamente neutra (cinza/branco sobre preto). Cor só aparece em dois tipos de elemento: um sinal de decisão real (crítico, atenção, sucesso) ou a identidade de marca (ver regra 4). Se tudo tem cor, nada tem prioridade.
2. **Hierarquia de atenção, não densidade de informação.** Nunca mostrar 4+ blocos competindo por atenção ao mesmo tempo. Sempre existe uma coisa que é a mais importante da tela — ela recebe o maior peso visual (tamanho, posição), o resto fica visualmente recuado.
3. **Indicador de status é linha, não bolinha/badge.** Uma barra vertical fina (3px) à esquerda do item, não um círculo colorido nem uma pill com fundo colorido. Comunica "instrumento de precisão", não "app consumer".
4. **Status e marca nunca se confundem.** Existem exatamente duas famílias de cor no produto: cor de **status** (crítico/atenção/bom — comunica um estado de dado) e cor de **marca** (ciano elétrico — comunica identidade/ação do produto, não um estado). Um elemento nunca usa a cor de marca para sinalizar status, nem a cor de status para decorar algo que não é um estado real.

---

## 2. Cor

### 2.1. Base (neutros — modo escuro é o padrão)

| Token | Hex | Uso |
|---|---|---|
| Fundo do app | `#0A0A0B` | Fundo principal de painéis/cards |
| Fundo elevado | `#15110F` | Fundo de alertas/destaques pontuais (uso raro) |
| Fundo de superfície secundária | `#1C1C1E` | Botões secundários, avatar placeholder |
| Texto primário | `#F4F4F3` | Títulos, valores, nomes — o "branco" da paleta |
| Texto secundário | `#D4D4D6` | Texto de apoio com alguma importância |
| Texto terciário | `#9C9C9F` | Labels, metadados, texto de apoio padrão |
| Texto quaternário (mais apagado) | `#6B6B6E` | Eyebrows, timestamps, texto quase decorativo |
| Borda padrão | `rgba(255,255,255,0.08)` | Divisores entre seções, bordas de card |
| Borda sutil (entre linhas de lista) | `rgba(255,255,255,0.06)` | Divisores internos de tabela/lista |
| Borda de input/botão secundário | `rgba(255,255,255,0.10–0.12)` | Contorno de botões "Ignorar" e similares |

### 2.2. Status (a cor que comunica estado de dado)

| Estado | Hex (linha/texto) | Quando usar |
|---|---|---|
| Crítico | `#E24B4A` (linha) / `#E89593` (texto sobre fundo escuro) | Desvio que exige ação imediata |
| Atenção | `#D9A441` (linha) | Aproximando de um limite, ainda não crítico |
| Bom / saudável | `#5BA85A` ou `#7FB87A` (texto) | Dentro ou acima da meta |
| Neutro / inativo | `#6B6B6E` ou `#8A8A8D` | Pausado, arquivado, sem dado |

**Regra de aplicação:** a cor de status vive na barra lateral de 3px e, quando o número também precisa comunicar o mesmo estado, no texto do número (nunca em fundo colorido/badge). Itens em estado "bom" ou "neutro" não precisam de cor no texto — só a linha já basta; reservar cor no texto para crítico/atenção, que são os estados que pedem ação.

### 2.3. Marca (a cor que comunica identidade/ação do produto — ciano elétrico)

Cor de marca não é uma decoração opcional nem um apêndice da paleta: é a segunda família de cor prevista pela regra 1.4, com função própria e distinta de status.

| Token | Hex | Uso |
|---|---|---|
| `--color-marca` | `#00E0DB` | Logo, foco de input, CTA primário, linha de tendência hero, estado ativo de navegação |
| `--color-marca-hover` | `#4EE8E4` | Hover de elementos `marca` (botão, links) |
| `--color-marca-glow` | `#00827E` | Tom escurecido da marca — usado em glows/gradientes, nunca sólido em texto |

**Por que esse hue:** ~178°, deliberadamente fora do azul saturado de concorrentes (Meta/Stripe/Linear) e fora do verde de status "bom" (`#5BA85A`) — a distância de hue entre marca e status "bom" é proposital, para que as duas cores nunca sejam confundidas mesmo em uso rápido/periférico. Saturação e brilho altos de propósito: remete a "tela de radar ligada", instrumento vivo, não apagado.

**Onde a marca aparece vs. onde não aparece:**
- Aparece: logo, foco de campo de formulário, CTA primário de telas de entrada (login/cadastro), navegação ativa, linha de tendência no hero do painel.
- Não aparece: qualquer lugar que hoje usa a paleta de status (seção 2.2) para indicar crítico/atenção/bom — trocar status por marca quebraria a regra 1.4 e removeria o sinal de prioridade do produto.

### 2.4. O que foi descartado da V1
- Badges com fundo colorido (`#E1F5EE`, `#FAEEDA`, `#FCEBEB` etc.) — geravam a sensação "app infantil"
- Bolinha de status colorida — substituída pela linha de 3px
- Grid de métrica em 4 colunas com fundo claro — a contagem de colunas e a cor de fundo da V1 foram descartadas, mas a ideia de "card de métrica com fundo de superfície" foi reabilitada na V2 (seção 5.6), só que com o fundo de superfície escuro do token `--secondary` (`#1C1C1E`), nunca um cinza-claro

---

## 3. Tipografia

**Fonte:** Inter (mantida da V1 — já era uma escolha correta; nenhuma fonte nova foi introduzida desde então, incluindo no lockup de logo).

| Nível | Tamanho | Peso | Cor | Uso |
|---|---|---|---|---|
| Número hero | 64px (`text-[64px]`) | 600 | Texto primário | O destaque único do topo do painel ("2 campanhas em desvio") — revisado de 44px/500 para dar mais peso real ao número que mais importa na tela |
| Número de card de métrica | 36px (`text-4xl`) | 600 | Texto primário | Valor em destaque dentro do card de métrica (seção 5.6) — revisado de 26px/500 |
| Título de seção | 14px | 500 | Texto primário | Nome do app, títulos de tela |
| Corpo / item de lista | 13px | 400 | Texto primário ou secundário | Nome de campanha, conteúdo principal de linha |
| Apoio / metadado | 12px | 400 | Texto terciário (#9C9C9F) | CPL, ROAS ao lado do nome, descrição de gatilho |
| Eyebrow (label de seção) | 12px | 400, uppercase, letter-spacing 0.6px | Texto quaternário (#6B6B6E) | "VISÃO GERAL · HOJE", "PRECISA DA SUA ATENÇÃO" |
| Eyebrow de campo de formulário | 12px (`text-xs`) | 600, uppercase, letter-spacing wide | Cor de marca (`#00E0DB`) | Label de input em telas de entrada ("EMAIL", "SENHA") — variante do eyebrow acima, usa peso 600 e cor de marca por estar associada a um campo ativo/editável, não a um metadado passivo |
| Lockup de logo | 16px (`text-base`) | 600 | Texto primário | Nome "VIGIA" ao lado do ícone — único outro uso de peso 600 no sistema |
| Microtexto | 11px | 400 | Texto quaternário | Notas de rodapé, disclaimers de regra de negócio |

**Regras:**
- Pesos permitidos no corpo do produto: 400 e 500 para texto corrido (nunca 700). Peso 600 é reservado a números de destaque (hero do painel, valor do card de métrica) e aos dois usos originais (lockup de logo, eyebrow de campo de formulário) — nunca aplicado a títulos de seção ou texto de corpo comuns. A regra continua: 600 marca "isto é o número/identidade que importa", não é um recurso geral de ênfase.
- Sentence case sempre — eyebrows são a exceção (uppercase), e mesmo assim com letter-spacing largo para não parecer grito.
- Contraste de escala > contraste de cor: para indicar "isso é importante", aumentar o tamanho da fonte primeiro, usar cor como segundo recurso. Cor de marca em texto (como no eyebrow de campo) é aceitável porque comunica "isto é um campo ativo da marca", não "isto é importante" — não usar cor de marca como atalho geral de ênfase.

---

## 4. Layout e espaçamento

- **Estrutura de seção:** blocos de conteúdo do painel interno usam dois níveis de card — o card sutil (fundo igual ao app, seção 5.6, usado para agrupar listas/conteúdo) e o card de métrica (fundo de superfície `--secondary`, seção 5.6, usado para números isolados que merecem destaque próprio). Nenhum dos dois usa cinza-claro ou sombra pesada.
- **Padding generoso:** 24px nas laterais das seções principais, 18-24px verticalmente entre blocos
- **Divisores:** 0.5px, `rgba(255,255,255,0.08)` entre seções grandes; `rgba(255,255,255,0.06)` entre itens de uma mesma lista (mais sutil ainda)
- **Grids de cards de métrica:** 3-4 colunas, `gap-4`, cada card com seu próprio fundo de superfície e `border-radius` (`--radius-lg`) — não mais separados por linha de 1px sem fundo (regra revista; ver seção 5.6)
- **Linha de status:** sempre 3px de largura, altura ajustada à linha do item (16-18px em linha de lista, ~28-38px em card de alerta), `border-radius: 0` (é um traço, não uma pill)

---

## 5. Componentes-padrão já validados (painel interno)

### 5.1. Bloco de destaque único (hero do painel)
Eyebrow pequeno → número grande (44px/500) + texto de apoio na mesma linha (baseline) → uma linha de contexto abaixo em texto terciário.

### 5.2. Card de alerta crítico
Fundo levemente diferenciado (`#15110F`), borda sutil na cor do estado (ex: `rgba(226,75,74,0.25)`), barra lateral de 3px na cor cheia, conteúdo + CTA textual à direita (não botão grande — um link discreto tipo "ver diagnóstico").

### 5.3. Linha de lista (campanha, item de fila)
Barra de status (3px) + texto primário (nome) + texto secundário/terciário alinhado à direita (métrica) + ícone de ação discreto (chevron ou dots) — tudo numa única linha horizontal, sem quebra, sem padding excessivo.

### 5.4. Botões em fila de aprovação
- **Ação primária (Aprovar):** fundo sólido claro (`#F4F4F3`), texto escuro (`#0A0A0B`), sem borda — única coisa "sólida" na tela, isso é proposital, marca claramente onde está a decisão de peso
- **Ação secundária (Ignorar):** fundo transparente, borda sutil (`rgba(255,255,255,0.12)`), texto terciário

**Nota de distinção:** este botão primário (claro/texto escuro, sóbrio) é o padrão do *painel interno*. Telas de entrada (login/cadastro) usam um botão primário diferente, com cor de marca — ver seção 7.5. As duas regras coexistem porque resolvem problemas diferentes: dentro do painel, a sobriedade é o sinal de "decisão de peso"; numa tela de entrada, a marca é o sinal de "isto é o produto falando com você".

### 5.5. Sidebar de navegação (painel interno)
Coluna fixa à esquerda, fundo igual ao app (`#0A0A0B`), separada do conteúdo por uma única borda vertical de 0.5px (`rgba(255,255,255,0.08)`) — não é um painel "elevado" com fundo diferente. Dimensionada para ser o "mapa" confortável da aplicação, não uma tira estreita de ícones:
- Largura: `w-64` (256px) — espaço suficiente para ícone + label sem apertar.
- Lockup logo+nome (seção 6.2) no topo da sidebar, em escala um pouco maior que o padrão de telas de entrada (`size-7`/`text-lg`), já que aqui é o único lockup da tela.
- Item de navegação: ícone (Lucide, `size-[18px]`) + label (14px/500), padding `px-3 py-2.5`, `rounded-lg`, `text-text-terciario` em repouso — itens grandes o bastante para parecerem clicáveis à distância, não uma lista densa de texto pequeno.
- Item ativo: fundo `bg-marca/10`, texto em `text-foreground`, ícone em `text-marca` (a marca aqui sinaliza *navegação ativa/identidade do produto*, conforme regra 1.4/2.3 — não é um estado de dado). Uma barra de 2px à esquerda do item, na cor de marca, reforça o item ativo — não confundir com a linha de status de 3px da seção 1.3, que é exclusiva para estado de dado (crítico/atenção/bom/neutro).
- Hover (item inativo): `bg-muted/50`, sem mudança de cor de texto.
- Itens ainda sem tela própria implementada (ex.: Aprovações antes de M4 ter página dedicada, Configurações) aparecem normalmente na lista — não ficam ocultos nem com aparência "desabilitada" — mas a tela de destino mostra um estado vazio claro ("Em construção") em vez de simular dados que não existem.

### 5.6. Cards do painel interno
Dois tipos de card coexistem no painel, cada um com um papel diferente — não são intercambiáveis:

**Card sutil** (agrupamento de conteúdo — listas, hero textual): fundo igual ao fundo do app (`#0A0A0B`), borda 0.5px `rgba(255,255,255,0.08)` (a borda padrão da seção 2.1), sem sombra, `border-radius` no token padrão (`--radius-lg`). Cabeçalho de card (quando existir): eyebrow (seção 3) + ação opcional alinhada à direita — nunca título com peso 600. Usado para a lista de campanhas e qualquer bloco que precise só de agrupamento, sem chamar atenção para si.

**Card de métrica** (número isolado em destaque — grid de KPIs no topo do painel): fundo de superfície (`--secondary`, `#1C1C1E`), `border-radius` generoso (`rounded-2xl`, maior que o token padrão de card — este componente é deliberadamente mais "redondo e confortável" que o card sutil, para comunicar "isto é um número para ler rápido", não "isto é uma tabela densa"). Padding generoso (`px-6 py-6`). Estrutura interna: eyebrow uppercase (12px/500, `text-text-terciario`) na linha superior, com um badge de ícone (`size-9`, `rounded-xl`, fundo translúcido na cor do tom do card — ver abaixo — não mais um badge neutro cinza) alinhado à direita da mesma linha; abaixo, o valor em destaque grande (`text-4xl`/600, sempre `text-foreground` — o badge de ícone já carrega o tom de cor, o número em si fica neutro para não competir); opcionalmente, uma linha de apoio (`text-sm`, `text-text-quaternario`) abaixo do valor. Usado em grids de 3 colunas (`gap-6`) no topo do painel.

O badge de ícone de cada card de métrica usa um "tom" (`marca` / `crítico` / `atenção` / `bom` / `neutro`) escolhido pelo significado do KPI — ex.: investimento usa tom `marca` (é sobre a operação do produto), CPL usa o tom de status correspondente ao seu desvio atual, ROAS idem. Isso é uma aplicação pontual e contida da cor (somente no badge pequeno, nunca no número grande nem no fundo do card inteiro) — mantém a regra 1.1 (cor é exceção) porque o uso é sempre no mesmo elemento pequeno e previsível, nunca espalhado.

Em ambos os tipos de card, a regra 1.2 (hierarquia de atenção) continua valendo: um card não é desculpa para empilhar blocos de mesmo peso visual. O hero do painel (seção 5.1) ganhou escala própria nesta revisão — o número principal sobe para `text-[64px]`/600 (era 44px/500) para manter a distância de peso visual em relação aos cards de métrica, que agora também são bem mais presentes do que na primeira versão deste componente.

---

## 6. Logo e identidade de marca

### 6.1. Construção do logo
- Ícone vetorizado (lighthouse/sentinela), sem wordmark embutido — o nome "VIGIA" é tipografado ao lado em Inter peso 600 (ver seção 3), nunca faz parte do arquivo SVG do ícone.
- Dois formatos do mesmo path, cada um com um propósito:
  - **Asset estático** (`frontend/src/assets/vigia-logo.svg`, copiado em `frontend/public/favicon.svg`): cor cravada em `fill="#00E0DB"` — usado como favicon e em qualquer contexto fora de componente React, onde não há `currentColor` para herdar.
  - **Componente React** (`frontend/src/components/shared/vigia-logo.tsx`): mesmo path com `fill="currentColor"`, herda cor via classe Tailwind (`text-marca`) — usado dentro de telas, para poder variar de cor por contexto se necessário no futuro.
- `viewBox="10 11 176 184"` — bounding box exato do traçado, sem padding assimétrico entre os lados.

### 6.2. Lockup logo + nome
Ícone (tamanho `size-8`–`size-9`) + espaço (`gap-2`) + "VIGIA" em Inter 600, `text-base`, `tracking-wide`. Em telas internas do painel ainda não há posição fixa definida; em telas de entrada, vive no topo da coluna de formulário (ver 7.1).

---

## 7. Padrões de tela de entrada (Login — referência validada)

A tela de Login (`frontend/src/pages/login/login-page.tsx`) é a primeira aplicação completa da V2 com cor de marca, e fixa o conjunto de padrões abaixo como referência para outras telas públicas/de entrada (cadastro, recuperação de senha).

### 7.1. Estrutura
Duas colunas em telas grandes (`lg:grid-cols-2`), uma coluna em mobile:
- **Coluna de vitrine** (esquerda, oculta em mobile): fundo `#0A0A0B`, mockup vivo do produto — não é arte estática, é um recorte real da UI (card de métrica + linha de status) traduzido em linguagem humana, não em jargão técnico.
- **Coluna de formulário** (direita): lockup logo+nome no topo (seção 6.2), heading, formulário, e um rodapé de transição para cadastro.

### 7.2. Glow e grid de fundo (coluna de vitrine)
Dois efeitos de fundo sobrepostos, ambos na cor de marca (nunca branco neutro):
```css
/* Glow radial duplo */
radial-gradient(circle at 15% 15%, rgba(0,224,219,0.32), transparent 55%),
radial-gradient(circle at 85% 75%, rgba(0,224,219,0.16), transparent 55%)

/* Grid de fundo */
linear-gradient(rgba(0,224,219,0.5) 1px, transparent 1px),
linear-gradient(90deg, rgba(0,224,219,0.5) 1px, transparent 1px)
/* background-size: 40px 40px; opacidade do container: 0.14 */
```
A intensidade desses valores foi calibrada para que a marca tenha presença visual sem virar decoração gratuita — ajustar opacidade antes de considerar trocar o hue.

### 7.3. Animação de entrada — "Reveal cinematográfico"
Efeito padrão para qualquer tela de entrada/primeira impressão (não usar em telas internas do painel, onde a regra é instrumento sóbrio, sem floreio). Blur-to-focus + leve escala, não fade/slide simples:
```css
@keyframes cinematic-reveal {
  from { opacity: 0; filter: blur(14px); transform: scale(1.04); }
  to   { opacity: 1; filter: blur(0);    transform: scale(1); }
}
.animate-cinematic-reveal {
  animation: cinematic-reveal 1100ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
```
Os blocos da tela disparam em cascata via `animationDelay` inline (lockup `0ms`/coluna do form `160ms`, headline da vitrine `100ms`, card de métrica `220ms`, rodapé `340ms`) — staggering de ~100–120ms entre elementos, nunca simultâneo.

### 7.4. Estado de foco de input
Substitui o `ring` genérico do shadcn por um foco com identidade de marca, em quatro camadas simultâneas:
- Borda sólida na cor de marca (`focus-visible:border-marca`)
- Fundo levemente tingido (`focus-visible:bg-marca/[0.06]`)
- Sombra em duas camadas — anel fino + glow externo difuso: `0 0 0 3px rgba(0,224,219,0.18), 0 0 20px -4px rgba(0,224,219,0.5)`
- Caret do cursor de texto também na cor de marca (`caret-marca`)

Cada input tem um ícone à esquerda (Lucide, `size-4`, cor `text-text-quaternario` em repouso) indicando o tipo de campo — não decorativo, ajuda escaneabilidade em formulários curtos. Label do campo segue o eyebrow de formulário da seção 3 (uppercase, peso 600, cor de marca).

### 7.5. Botão primário de tela de entrada (CTA de submit)
Diferente do botão primário do painel interno (seção 5.4). Não é cor sólida — é gradiente diagonal + glow externo sutil (sem inset, sem "brilho lavado"):
```css
background: linear-gradient(135deg, #00E0DB 0%, #00B8B3 100%);
box-shadow: 0 0 28px rgba(0,224,219,0.25);
/* estado pending: background rgba(0,224,219,0.3), sem box-shadow */
```
Texto sempre branco (`#FFFFFF`), nunca preto — ao contrário do botão primário do painel. A diferença é deliberada: o botão de painel é "decisão de peso visualmente sóbria" (regra 5.4), o CTA de login é "ação de entrada com identidade de marca" (regra 1.4 aplicada).

Durante `isPending`, o texto é substituído por spinner SVG (`animate-spin`, `viewBox 0 0 24 24`, traço com `opacity 0.25` no anel base e `0.75` no arco ativo) + label de progresso ("Entrando...") — nunca apenas desabilitar o botão sem feedback visual.

### 7.6. Microinterações de botão/link
- Todo elemento clicável (`<button>`) recebe `cursor-pointer` explícito — o reset do design system zera o cursor nativo, então isso não é opcional.
- Feedback de clique: `active:scale-[0.98]` em botões primários e links de ação (não em texto puramente informativo).

### 7.7. Padrões textuais
- Divisor "ou" entre formulário e CTA secundário: duas linhas finas (`bg-white/10`) + label central uppercase em `text-text-quaternario`.
- Transição para ação secundária (ex.: "Não tem conta? Criar conta grátis"): frase em `text-text-terciario` + link em `text-marca` com `hover:text-marca-hover` — nunca um botão de mesmo peso visual que o CTA primário.
- Copy de telas de entrada (headline/promessa) evita tom de anúncio/ad ("perca X, ganhe Y") — usa tom de autoridade tranquila, coerente com a vigilância 24h do produto, não com conversão agressiva de tráfego pago.

---

## 8. O que ainda falta decidir / validar
- Versão em modo claro (se algum dia for necessária) — a V1 tinha tokens de claro prontos; a V2 ainda não foi adaptada para claro, pois a direção escolhida foi escuro como padrão.
- Telas de Diagnóstico, Relatórios e Conexão de conta ainda não foram desenhadas nesta linguagem — aplicar os mesmos princípios quando chegarem.
- Iconografia: usei Tabler outline nos mockups do painel (ti-bell, ti-chevron-right, ti-dots, ti-plus), mas a tela de Login real foi implementada com Lucide — decidir qual biblioteca é definitiva e unificar.
- Microinterações / estados de hover, foco, loading **do painel interno** ainda não foram formalizados (a seção 7 cobre apenas telas de entrada).
- Se o "Reveal cinematográfico" (7.3) e o botão de marca (7.5) devem se estender a outras telas públicas (cadastro, recuperação de senha) ou são exclusivos da tela de login.
- Estado "Em construção" das telas placeholder de Aprovações/Configurações (seção 5.5) ainda é genérico — refinar copy quando essas telas começarem a ser desenhadas de verdade.
