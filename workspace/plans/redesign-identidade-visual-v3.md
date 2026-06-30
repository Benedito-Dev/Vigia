# Plano: Nova identidade visual do Vigia (V3)

**Status:** proposto, aguardando validação antes de qualquer implementação.
**Substitui:** o Design System V2 (`docs/VIGIA_DESIGN_SYSTEM_V2.md`) — descartado por completo nesta frente. A V2 documentava deliberadamente o ciano elétrico saturado + glow como identidade de marca; na prática, esse é exatamente o elemento que faz o produto comunicar "jogo/futurista" em vez de "ferramenta financeira séria". Este plano não tenta conciliar com a V2, ele propõe a substituição.
**Origem:** comparação direta entre o dashboard do Vigia e o dashboard de um concorrente (Rizar), feita durante sessão de revisão visual em 2026-06-28.

---

## 1. Diagnóstico (por que mudar)

O problema não é estrutural. A organização de informação do Vigia — hero de alerta, grid de KPIs, tabela de campanhas, sidebar de navegação — está correta e não muda neste plano. O problema é inteiramente **cromático e de efeitos visuais**, e está concentrado em 5 pontos:

1. **Hue e saturação do ciano de marca (`#00E0DB`)**: saturação e luminosidade muito altas. Esse é o vocabulário de cor de HUD de jogo / painel sci-fi (Tron, e-sports, cyberpunk), não de fintech/consultoria. É a maior causa isolada da sensação "infantil/gamer".
2. **Frequência de uso da cor de marca**: aparece em quase todo elemento "ativo" da tela (logo, nav ativa, foco de input, CTA, linha de tendência, indicador "monitorando"). Cor viva usada com tanta frequência perde a função de destaque e passa a ler como "tela cheia de luzes".
3. **Glow/blur em múltiplos elementos**: sombra radial no topo da sidebar, `shadow-[inset...]` no item de nav ativo, glow duplo na tela de login, box-shadow difuso no botão primário de login. Glow ao redor de elementos UI é uma assinatura visual de jogo/app consumer, não de instrumento profissional.
4. **Ponto pulsante animado (`animate-pulse`)** no indicador "Tudo sob vigilância" — bolinha que pulsa é linguagem de "sistema ligado" de painel de ficção científica.
5. **Ausência total de um momento "claro"**: o produto é 100% dark, sem nenhuma superfície clara de respiro. Isso intensifica o peso "tech/gamer" porque não há contraste de registro — tudo vive no mesmo modo visual extremo.

Nenhum desses 5 pontos exige tocar em layout, grid, espaçamento ou hierarquia de informação.

---

## 2. Direção nova

**Referência de sensação:** fintech/banking premium sóbrio (Bloomberg Terminal, private banking, Stripe Dashboard em dark mode) — não Linear/Apple (que foi a referência da V2 e ainda assim resultou em "gamer" por causa da cor, não da estrutura).

### 2.1. Princípios

1. **Saturação contida.** Nenhuma cor de UI passa de ~65% de saturação. Cores vivas usadas devem parecer "ricas", não "neon".
2. **Cor de marca vira exceção rara, não onipresente.** Aparece em no máximo 1-2 pontos por tela — preferencialmente onde representa valor/ação concreta (ex: número de economia, CTA principal), nunca em decoração de navegação ou indicadores de status "ambiente".
3. **Zero glow, zero blur decorativo, zero pulse.** Sombras, quando existirem, são neutras (preto/cinza), nunca coloridas. Nenhuma animação de "respiração"/pulso em indicadores passivos.
4. **Um momento de superfície clara por tela principal**, para dar respiro e quebrar o peso 100% dark — sem virar modo claro completo.
5. **Distinção status vs. marca continua existindo** (isso a V2 acertou) — crítico/atenção/bom seguem com suas próprias cores, sóbrias, sem glow.

### 2.2. Nova paleta proposta

| Papel | Direção de cor | Por quê |
|---|---|---|
| Fundo base | Navy muito escuro, **não neutro puro** (ex.: `#0E1420`–`#101826`) | Preto neutro puro lê como "modo escuro de app qualquer"; navy com leve tom azul lê como "painel financeiro". Pequena mudança, grande efeito de percepção. |
| Superfície de card | Um tom acima do fundo, mesma família azulada (ex.: `#161F30`) | Cria profundidade sem depender de borda ou sombra. |
| Cor de marca/acento | Âmbar/dourado queimado, saturação média (ex.: `#C8893D`–`#D9A441`, já existe um tom parecido nos tokens de "atenção" — usar uma variante exclusiva para marca, distinta da de status) | Âmbar contido é a cor mais associada a "valor/precisão/seriedade" em produtos financeiros. Susbtitui o ciano como cor de identidade. |
| Superfície clara de respiro | Off-white/creme quente (ex.: `#F3EEE6`), usada 1x por tela no card hero | Quebra o all-dark, humaniza, dá ponto de pausa ao olho — like o card de saudação do Rizar. |
| Status crítico/atenção/bom | Mantém a família de cor atual, mas revisar saturação para ficar visualmente consistente com a nova base (sem glow, sem fundo translúcido brilhante) | Já existia separação status≠marca; só precisa herdar a contenção geral. |

### 2.3. O que sai de cena

- `--color-marca-glow` e qualquer uso de `box-shadow`/`radial-gradient` colorido (sidebar, login, foco de input, botão CTA).
- `animate-pulse` no indicador "Tudo sob vigilância".
- Fundo translúcido vibrante em cards de alerta (`bg-status-critico/[0.05]` com borda + glow visual resultante) — trocar por tratamento mais discreto (faixa fina, sem viés de "alerta de dano").
- Ciano como cor de nav ativa / foco de input / CTA de login — todos migram para o novo âmbar contido, com uso ainda mais raro do que o ciano tinha.

### 2.4. O que fica igual (não tocar nesta frente)

- Grid de KPIs, tabela de campanhas, sidebar com lista de navegação, hero de alerta como bloco estrutural, distinção "—" vs "0" em dados vazios.
- Tipografia (Inter) e escala de tamanhos — a hierarquia por tamanho está correta, o ajuste é só de cor/efeito.
- A regra "linha de status de 3px em vez de bolinha colorida" — isso é sóbrio e continua funcionando bem, não é parte do problema.

---

## 3. Escopo de execução (fases, para não flutuar)

A ideia é não tentar mudar tudo de uma vez. Cada fase termina em um estado visualmente coerente e revisável antes de avançar para a próxima.

### Fase 1 — Fundação de cor (tokens)
Reescrever os tokens em `frontend/src/index.css`: nova paleta de fundo/superfície (navy), nova cor de marca (âmbar contido), remover tokens de glow. Sem tocar em nenhum componente ainda — só os tokens existirem já permite visualizar o impacto básico ao rodar a aplicação (cores vão mudar onde já são referenciadas via variável).

### Fase 2 — Sidebar e navegação
Aplicar a nova paleta em `app-sidebar.tsx`: remover o `radial-gradient` de glow no topo, remover `shadow-[inset...]` do item ativo, trocar a cor da nav ativa de ciano para âmbar, remover `animate-pulse` do indicador "Tudo sob vigilância" (manter o texto, sem o ponto pulsante ou com ponto estático).

### Fase 3 — Dashboard (hero + KPIs + tabela)
Aplicar em `dashboard-page.tsx`: revisar o card de alerta crítico (remover qualquer aparência de "glow"/translúcido vibrante, deixar mais sóbrio), revisar cor do CTA "Revisar N campanhas" (de ciano para âmbar), confirmar que a tabela de campanhas e os KPIs já herdam a paleta nova sem ajuste manual (a maioria usa tokens de status, que não mudam de família).
Avaliar inserir 1 superfície clara de respiro no topo do dashboard (card de saudação/contexto), inspirado no padrão Rizar, **mas só decidir isso depois de ver as fases 1-2 implementadas** — pode ser que a nova paleta escura já resolva a sensação sem precisar desse elemento extra.

### Fase 4 — Tela de Login
Aplicar a mesma reformulação de cor na tela de login (`login-page.tsx`): remover o glow duplo de fundo, remover o box-shadow difuso do botão CTA, remover o foco de input em 4 camadas com glow — substituir por um foco sóbrio (borda sólida na cor de marca nova, sem sombra difusa colorida). A animação "cinematic-reveal" (blur-to-focus) pode ficar — é uma transição de entrada, não uma cor; reavaliar separadamente se ainda parecer "demais" depois do resto resolvido.

### Fase 5 — Revisão e ajuste fino
Depois das 4 fases implementadas, nova rodada de comparação visual lado a lado com Rizar (e qualquer outra referência que surgir) para checar se a sensação "profissional/confiança" foi atingida, ou se algum ponto específico ainda precisa de ajuste pontual (provavelmente saturação fina ou frequência de algum elemento).

---

## 4. Ordem de decisão (para não flutuar entre direções)

1. Validar a paleta da seção 2.2 (cores específicas) — **decisão a tomar antes de qualquer código.**
2. Validar fase a fase (1 → 2 → 3 → 4), sem pular para a fase seguinte sem ver o resultado da anterior rodando no navegador.
3. Decisão sobre superfície clara de respiro (fase 3) fica para depois de ver o resto pronto — não decidir agora.
4. Nenhuma mudança estrutural de layout entra nesta frente — se surgir vontade de mudar estrutura no meio do caminho, isso é um novo plano, não uma expansão deste.

---

## 5. Arquivos que serão tocados (mapeado, não exaustivo)

- `frontend/src/index.css` — tokens de cor (fase 1)
- `frontend/src/components/shared/app-sidebar.tsx` — nav (fase 2)
- `frontend/src/pages/dashboard/dashboard-page.tsx` — hero/KPIs/tabela (fase 3)
- `frontend/src/pages/login/login-page.tsx` — tela de entrada (fase 4)
- Possivelmente `frontend/src/components/shared/vigia-logo.tsx` e `frontend/public/favicon.svg` se a cor cravada do logo (`#00E0DB`) for migrada para o novo âmbar — **decisão pendente**, o logo pode ficar neutro (branco/cinza) em vez de carregar a cor de marca, o que reduziria ainda mais a frequência de cor viva na tela.

---

## 6. Pendências explícitas (não decidir sozinho, perguntar quando chegar a hora)

- Tom exato do âmbar de marca (testar 2-3 variações no navegador antes de fixar hex final).
- Se o logo deve carregar a cor de marca ou ficar neutro.
- Se entra superfície clara de respiro no dashboard (fase 3) ou se fica só dark com a nova paleta.
- Se a animação "cinematic-reveal" do login se mantém como está.
