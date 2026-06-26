import { Autonomia } from '../../generated/prisma';

/**
 * Classifica uma ação do sistema conforme a matriz de autonomia
 * definida em docs/ESPECIFICACAO_TECNICA_VIGIA.md, secao 7.4.
 *
 * Função pura e isolada de propósito: erro aqui é erro com dinheiro
 * do cliente, então a regra fica testável sem precisar simular
 * controller, service ou banco.
 */
export type AcaoSistema =
  | 'pausar_criativo_fadiga'
  | 'emitir_alerta'
  | 'pausar_campanha_cpl_acima_teto'
  | 'publicar_campanha'
  | 'escalar_verba'
  | 'reativar_campanha_pausada_ia'
  | 'gastar_acima_do_teto'
  | 'alterar_dados_pagamento';

const MATRIZ: Record<AcaoSistema, Autonomia> = {
  pausar_criativo_fadiga: Autonomia.autonoma,
  emitir_alerta: Autonomia.autonoma,
  pausar_campanha_cpl_acima_teto: Autonomia.autonoma,
  publicar_campanha: Autonomia.assistida,
  escalar_verba: Autonomia.assistida,
  reativar_campanha_pausada_ia: Autonomia.assistida,
  gastar_acima_do_teto: Autonomia.vedada,
  alterar_dados_pagamento: Autonomia.vedada,
};

export function classificarAcao(acao: AcaoSistema): Autonomia {
  return MATRIZ[acao];
}
