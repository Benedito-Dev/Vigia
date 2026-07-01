import type { ProjetoResumo } from '@/features/dashboard/dados-mock'
import type { ProjetoApi, StatusProjetoApi } from '@/types/projeto'

/**
 * Concilia o status do backend (conectado | aviso_cobranca | desconectado)
 * com o vocabulário atual da UI (conectado | expirado). "conectado" segue
 * conectado; qualquer outro estado a UI trata como "expirado" (precisa de ação).
 */
function mapearStatus(status: StatusProjetoApi): 'conectado' | 'expirado' {
  return status === 'conectado' ? 'conectado' : 'expirado'
}

/**
 * Adapta o projeto real (ProjetoApi) para o formato que as telas ainda
 * consomem (ProjetoResumo). Os agregados — investido do mês, ROAS médio,
 * contagem de campanhas em desvio, limites — dependem da ingestão diária,
 * que é bloco futuro; por ora vêm neutros (0) e serão preenchidos quando
 * o backend passar a fornecê-los.
 */
export function mapearProjeto(api: ProjetoApi): ProjetoResumo {
  return {
    id: api.id,
    clienteNome: api.clienteNome,
    nicho: api.nicho,
    ticketMedio: api.ticketMedio,
    // Pendentes de ingestão (bloco futuro) — não inventar valor.
    investidoMes: 0,
    roasMedio: 0,
    campanhasAtivas: 0,
    campanhasEmDesvio: 0,
    conexaoMeta: {
      status: mapearStatus(api.status),
      externalId: api.metaExternalId,
      conectadoEm: api.createdAt.slice(0, 10),
    },
    limiteSeguranca: {
      tetoVerbaDiaria: 0,
      cplMaximo: 0,
      escalaMaxPctDia: 20,
      atualizadoEm: api.createdAt.slice(0, 10),
    },
  }
}
