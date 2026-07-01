import { BadRequestException } from '@nestjs/common';
import { ProjetosService } from './projetos.service';
import { StatusProjeto } from '@prisma/client';

describe('ProjetosService.conectar', () => {
  const dto = {
    clienteNome: 'Loja Aurora',
    nicho: 'E-commerce · Moda',
    externalId: 'act_123',
    accessToken: 'token-cru-secreto',
  };

  function montar() {
    const prisma = {
      projeto: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'proj-1', ...data })),
        findMany: jest.fn(),
      },
    };
    const metaAdsClient = {
      validarConta: jest.fn(),
    };
    const cofre = {
      cifrar: jest.fn().mockReturnValue('iv:tag:cifrado'),
    };
    const auditoria = {
      registrar: jest.fn().mockResolvedValue(undefined),
    };

    const service = new ProjetosService(
      prisma as never,
      metaAdsClient as never,
      cofre as never,
      auditoria as never,
    );
    return { service, prisma, metaAdsClient, cofre, auditoria };
  }

  it('conta válida: cifra o token, persiste e audita — sem vazar segredo', async () => {
    const { service, prisma, metaAdsClient, cofre, auditoria } = montar();
    metaAdsClient.validarConta.mockResolvedValue({
      externalId: 'act_123',
      nome: 'Loja Aurora',
      accountStatus: 1,
      moeda: 'BRL',
    });

    const resultado = await service.conectar('org-1', 'user-1', dto);

    // token cru foi cifrado, nunca gravado puro
    expect(cofre.cifrar).toHaveBeenCalledWith('token-cru-secreto');
    expect(prisma.projeto.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tokenRef: 'iv:tag:cifrado', status: StatusProjeto.conectado }),
      }),
    );
    // resposta não contém o tokenRef
    expect(resultado).not.toHaveProperty('tokenRef');
    // auditoria registrada
    expect(auditoria.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ acao: 'projeto.conectado', alvoRef: 'proj-1' }),
    );
  });

  it('conta com billing recusado: conecta como aviso_cobranca (RF-007)', async () => {
    const { service, metaAdsClient, prisma } = montar();
    metaAdsClient.validarConta.mockResolvedValue({
      externalId: 'act_123',
      nome: 'Loja Aurora',
      accountStatus: 2, // não-ativa
      moeda: 'BRL',
    });

    await service.conectar('org-1', 'user-1', dto);

    expect(prisma.projeto.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: StatusProjeto.aviso_cobranca }),
      }),
    );
  });

  it('token inválido: lança e NÃO cria nada (RF-006)', async () => {
    const { service, metaAdsClient, prisma, cofre, auditoria } = montar();
    metaAdsClient.validarConta.mockRejectedValue(new BadRequestException('Invalid OAuth access token'));

    await expect(service.conectar('org-1', 'user-1', dto)).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.projeto.create).not.toHaveBeenCalled();
    expect(cofre.cifrar).not.toHaveBeenCalled();
    expect(auditoria.registrar).not.toHaveBeenCalled();
  });
});
