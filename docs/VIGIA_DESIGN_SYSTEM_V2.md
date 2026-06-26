# VIGIA — DESIGN SYSTEM V2

**Status:** validado por Benedito em sessão de wireframe (junho/2026)
**Substitui:** a V1 (paleta azul clara com cards/badges coloridos) por uma direção mais madura e premium.
**Referência de sensação:** Linear / Apple — minimalista no sentido de cada elemento ter peso e propósito, não no sentido de vazio.

---

## 1. Princípio central

> A interface não compete por atenção. Ela se afasta para deixar a informação respirar, e quando fala, fala com peso.

Três regras que vêm antes de qualquer token de cor ou tipografia:

1. **Cor é exceção, não decoração.** A tela é majoritariamente neutra (cinza/branco sobre preto). Cor só aparece nos elementos que carregam um sinal de decisão real (crítico, atenção, sucesso). Se tudo tem cor, nada tem prioridade.
2. **Hierarquia de atenção, não densidade de informação.** Nunca mostrar 4+ blocos competindo por atenção ao mesmo tempo. Sempre existe uma coisa que é a mais importante da tela — ela recebe o maior peso visual (tamanho, posição), o resto fica visualmente recuado.
3. **Indicador de status é linha, não bolinha/badge.** Uma barra vertical fina (3px) à esquerda do item, não um círculo colorido nem uma pill com fundo colorido. Comunica "instrumento de precisão", não "app consumer".

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

### 2.2. Status (a única cor que existe na interface)

| Estado | Hex (linha/texto) | Quando usar |
|---|---|---|
| Crítico | `#E24B4A` (linha) / `#E89593` (texto sobre fundo escuro) | Desvio que exige ação imediata |
| Atenção | `#D9A441` (linha) | Aproximando de um limite, ainda não crítico |
| Bom / saudável | `#5BA85A` ou `#7FB87A` (texto) | Dentro ou acima da meta |
| Neutro / inativo | `#6B6B6E` ou `#8A8A8D` | Pausado, arquivado, sem dado |

**Regra de aplicação:** a cor de status vive na barra lateral de 3px e, quando o número também precisa comunicar o mesmo estado, no texto do número (nunca em fundo colorido/badge). Itens em estado "bom" ou "neutro" não precisam de cor no texto — só a linha já basta; reservar cor no texto para crítico/atenção, que são os estados que pedem ação.

### 2.3. O que foi descartado da V1
- Badges com fundo colorido (`#E1F5EE`, `#FAEEDA`, `#FCEBEB` etc.) — geravam a sensação "app infantil"
- Bolinha de status colorida — substituída pela linha de 3px
- Cards de métrica com fundo cinza-claro em grid 4 colunas — substituído por hierarquia de atenção (1 destaque + grid secundário de 3 colunas, separado por linhas de 1px, não por cards)

---

## 3. Tipografia

**Fonte:** Inter (mantida da V1 — já era uma escolha correta).

| Nível | Tamanho | Peso | Cor | Uso |
|---|---|---|---|---|
| Número hero | 44px | 500 | Texto primário | O destaque único do topo do painel ("1 campanha em desvio") |
| Número de card secundário | 26px | 500 | Texto primário | Métricas da grid de "visão geral" |
| Título de seção | 14px | 500 | Texto primário | Nome do app, títulos de tela |
| Corpo / item de lista | 13px | 400 | Texto primário ou secundário | Nome de campanha, conteúdo principal de linha |
| Apoio / metadado | 12px | 400 | Texto terciário (#9C9C9F) | CPL, ROAS ao lado do nome, descrição de gatilho |
| Eyebrow (label de seção) | 12px | 400, uppercase, letter-spacing 0.6px | Texto quaternário (#6B6B6E) | "VISÃO GERAL · HOJE", "PRECISA DA SUA ATENÇÃO" |
| Microtexto | 11px | 400 | Texto quaternário | Notas de rodapé, disclaimers de regra de negócio |

**Regras:**
- Pesos permitidos: somente 400 e 500 (mantido da V1 — nunca 600/700)
- Sentence case sempre — eyebrows são a única exceção (uppercase), e mesmo assim com letter-spacing largo para não parecer grito
- Contraste de escala > contraste de cor: para indicar "isso é importante", aumentar o tamanho da fonte primeiro, usar cor como segundo recurso, nunca peso 700 ou caixa alta no corpo

---

## 4. Layout e espaçamento

- **Estrutura de card único:** cada tela é um card-mestre (`background: #0A0A0B`, borda 0.5px `rgba(255,255,255,0.08)`, `border-radius: var(--border-radius-lg)`), dividido internamente em seções por linhas finas — não por cards aninhados com fundo cinza
- **Padding generoso:** 24px nas laterais das seções principais, 18-24px verticalmente entre blocos
- **Divisores:** 0.5px, `rgba(255,255,255,0.08)` entre seções grandes; `rgba(255,255,255,0.06)` entre itens de uma mesma lista (mais sutil ainda)
- **Grids de métrica secundária:** 3 colunas, separadas por linha de 1px (`background: rgba(255,255,255,0.08)` no gap), não por cards individuais com fundo
- **Linha de status:** sempre 3px de largura, altura ajustada à linha do item (16-18px em linha de lista, ~28-38px em card de alerta), `border-radius: 0` (é um traço, não uma pill)

---

## 5. Componentes-padrão já validados

### 5.1. Bloco de destaque único (hero do painel)
Eyebrow pequeno → número grande (44px/500) + texto de apoio na mesma linha (baseline) → uma linha de contexto abaixo em texto terciário.

### 5.2. Card de alerta crítico
Fundo levemente diferenciado (`#15110F`), borda sutil na cor do estado (ex: `rgba(226,75,74,0.25)`), barra lateral de 3px na cor cheia, conteúdo + CTA textual à direita (não botão grande — um link discreto tipo "ver diagnóstico").

### 5.3. Linha de lista (campanha, item de fila)
Barra de status (3px) + texto primário (nome) + texto secundário/terciário alinhado à direita (métrica) + ícone de ação discreto (chevron ou dots) — tudo numa única linha horizontal, sem quebra, sem padding excessivo.

### 5.4. Botões em fila de aprovação
- **Ação primária (Aprovar):** fundo sólido claro (`#F4F4F3`), texto escuro (`#0A0A0B`), sem borda — única coisa "sólida" na tela, isso é proposital, marca claramente onde está a decisão de peso
- **Ação secundária (Ignorar):** fundo transparente, borda sutil (`rgba(255,255,255,0.12)`), texto terciário

---

## 6. O que ainda falta decidir / validar
- Versão em modo claro (se algum dia for necessária) — a V1 tinha tokens de claro prontos; a V2 ainda não foi adaptada para claro, pois a direção escolhida foi escuro como padrão
- Telas de Diagnóstico, Relatórios e Conexão de conta ainda não foram desenhadas nesta linguagem — aplicar os mesmos princípios quando chegarem
- Microinterações / estados de hover, foco, loading — ainda não especificados
- Iconografia: usei Tabler outline nos mockups (ti-bell, ti-chevron-right, ti-dots, ti-plus) — confirmar se é essa a biblioteca definitiva para o código real
