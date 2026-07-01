import { BadRequestException } from '@nestjs/common';
import { MetaAdsClient } from './meta-ads.client';

function mockFetchOk(payload: unknown) {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  });
}

function mockFetchErro(message: string, status = 400) {
  return jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: { message } }),
  });
}

describe('MetaAdsClient', () => {
  let client: MetaAdsClient;
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    client = new MetaAdsClient();
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  describe('validarConta', () => {
    it('normaliza o ID sem act_ e retorna os dados da conta', async () => {
      const fetchMock = mockFetchOk({
        id: 'act_123',
        name: 'Loja Aurora',
        account_status: 1,
        currency: 'BRL',
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      const conta = await client.validarConta('123', 'token');

      expect(conta).toEqual({
        externalId: 'act_123',
        nome: 'Loja Aurora',
        accountStatus: 1,
        moeda: 'BRL',
      });
      // a URL chamada deve conter act_123, não '123' cru
      expect(fetchMock.mock.calls[0][0]).toContain('/act_123?');
    });

    it('lança BadRequest quando a Meta responde erro (token inválido)', async () => {
      global.fetch = mockFetchErro('Invalid OAuth access token') as unknown as typeof fetch;
      await expect(client.validarConta('act_1', 'ruim')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('buscarInsights', () => {
    it('devolve null (não 0) para leads/compras/receita quando não há pixel', async () => {
      global.fetch = mockFetchOk({
        data: [
          { campaign_id: 'c1', spend: '150.50', impressions: '1000', clicks: '50' },
        ],
      }) as unknown as typeof fetch;

      const [insight] = await client.buscarInsights('act_1', 'token');

      expect(insight.investido).toBe(150.5);
      expect(insight.impressoes).toBe(1000);
      expect(insight.leads).toBeNull();
      expect(insight.compras).toBeNull();
      expect(insight.receita).toBeNull();
    });

    it('soma actions de leads quando existem', async () => {
      global.fetch = mockFetchOk({
        data: [
          {
            campaign_id: 'c1',
            spend: '100',
            impressions: '500',
            clicks: '20',
            actions: [
              { action_type: 'lead', value: '3' },
              { action_type: 'landing_page_view', value: '80' },
            ],
          },
        ],
      }) as unknown as typeof fetch;

      const [insight] = await client.buscarInsights('act_1', 'token');
      expect(insight.leads).toBe(3);
      expect(insight.compras).toBeNull();
    });
  });

  describe('buscarCampanhas', () => {
    it('mapeia daily_budget para número e mantém null quando ausente', async () => {
      global.fetch = mockFetchOk({
        data: [
          { id: 'c1', name: 'CBO', objective: 'OUTCOME_SALES', status: 'ACTIVE', daily_budget: '5000' },
          { id: 'c2', name: 'ABO', objective: 'OUTCOME_LEADS', status: 'PAUSED' },
        ],
      }) as unknown as typeof fetch;

      const campanhas = await client.buscarCampanhas('act_1', 'token');
      expect(campanhas[0].verbaDiariaCentavos).toBe(5000);
      expect(campanhas[1].verbaDiariaCentavos).toBeNull();
    });
  });
});
