import { Injectable } from '@nestjs/common';

/**
 * Único ponto de contato com a Graph/Insights API da Meta.
 * Nenhum outro service do sistema deve chamar a Meta diretamente —
 * rate limit (RNF-011) e backoff exponencial ficam garantidos
 * uma única vez aqui, em vez de reimplementados em cada módulo.
 */
@Injectable()
export class MetaAdsClient {
  // TODO (Bloco 2 — RF-005): validarConta(externalId, accessToken)
  //   GET /{ad-account-id} na Graph API

  // TODO (Bloco 4 — RF-017): buscarInsights(campaignExternalId, periodo)
  //   GET /{campaign-id}/insights

  // TODO (Bloco 3 — RF-009, RF-011): criarCampanha / atualizarVerba
  //   sempre cria em status PAUSED (RF-009)

  // TODO: backoff exponencial + retry (até 3x, RF-020) centralizado aqui
}
