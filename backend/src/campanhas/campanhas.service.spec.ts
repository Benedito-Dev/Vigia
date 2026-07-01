import { NotFoundException } from '@nestjs/common';
import { CampanhasService } from './campanhas.service';
import { MetricasService } from '../metricas/metricas.service';

describe('CampanhasService.listarPorProjeto', () => {
  function montar() {
    const prisma = {
      projeto: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'proj-1',
          organizacaoId: 'org-1',
          metaExternalId: 'act_123',
          tokenRef: 'iv:tag:cifrado',
        }),
      },
    };
    const metaAdsClient = {
      buscarCampanhas: jest.fn(),
      buscarInsights: jest.fn(),
    };
    const cofre = {
      decifrar: jest.fn().mockReturnValue('token-cru'),
    };
    // MetricasService real — é lógica pura, não vale a pena mockar.
    const service = new CampanhasService(
      prisma as never,
      metaAdsClient as never,
      cofre as never,
      new MetricasService(null as never),
    );
    return { service, prisma, metaAdsClient, cofre };
  }

  it('campanha SEM pixel: CPL/CPA/ROAS vêm null (nunca inventa número)', async () => {
    const { service, metaAdsClient } = montar();
    metaAdsClient.buscarCampanhas.mockResolvedValue([
      { externalId: 'c1', nome: 'Sem pixel', objetivo: 'OUTCOME_TRAFFIC', status: 'ACTIVE', verbaDiariaCentavos: 5000 },
    ]);
    metaAdsClient.buscarInsights.mockResolvedValue([
      { campanhaExternalId: 'c1', investido: 150, impressoes: 1000, cliques: 50, leads: null, compras: null, receita: null },
    ]);

    const [c] = await service.listarPorProjeto('org-1', 'proj-1');

    expect(c.investido).toBe(150);
    expect(c.verbaDiaria).toBe(50); // 5000 centavos → R$ 50
    expect(c.ctr).toBeCloseTo(0.05); // 50/1000 tem dado
    expect(c.cpl).toBeNull();
    expect(c.cpa).toBeNull();
    expect(c.roas).toBeNull();
  });

  it('campanha COM dados: calcula os KPIs disponíveis', async () => {
    const { service, metaAdsClient } = montar();
    metaAdsClient.buscarCampanhas.mockResolvedValue([
      { externalId: 'c1', nome: 'Com leads', objetivo: 'OUTCOME_LEADS', status: 'ACTIVE', verbaDiariaCentavos: null },
    ]);
    metaAdsClient.buscarInsights.mockResolvedValue([
      { campanhaExternalId: 'c1', investido: 100, impressoes: 1000, cliques: 40, leads: 5, compras: 2, receita: 400 },
    ]);

    const [c] = await service.listarPorProjeto('org-1', 'proj-1');

    expect(c.cpl).toBe(20); // 100 / 5
    expect(c.cpa).toBe(50); // 100 / 2
    expect(c.roas).toBe(4); // 400 / 100
    expect(c.verbaDiaria).toBeNull(); // ABO, sem daily_budget
  });

  it('campanha sem insight correspondente: investido 0, KPIs null', async () => {
    const { service, metaAdsClient } = montar();
    metaAdsClient.buscarCampanhas.mockResolvedValue([
      { externalId: 'c1', nome: 'Nova', objetivo: 'OUTCOME_SALES', status: 'PAUSED', verbaDiariaCentavos: 3000 },
    ]);
    metaAdsClient.buscarInsights.mockResolvedValue([]); // sem gasto ainda

    const [c] = await service.listarPorProjeto('org-1', 'proj-1');
    expect(c.investido).toBe(0);
    expect(c.cpl).toBeNull();
    expect(c.roas).toBeNull();
  });

  it('projeto de outra organização: NotFound (tenant isolado)', async () => {
    const { service, prisma } = montar();
    prisma.projeto.findFirst.mockResolvedValue(null);
    await expect(service.listarPorProjeto('org-1', 'proj-de-outro')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
