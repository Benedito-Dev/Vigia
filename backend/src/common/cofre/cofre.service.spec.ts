import { CofreService } from './cofre.service';

describe('CofreService', () => {
  const CHAVE_VALIDA = 'a'.repeat(64); // 32 bytes em hex
  let cofre: CofreService;

  beforeEach(() => {
    process.env.TOKEN_ENCRYPTION_KEY = CHAVE_VALIDA;
    cofre = new CofreService();
    cofre.onModuleInit();
  });

  it('faz round-trip: decifrar(cifrar(x)) === x', () => {
    const token = 'EAAG_token_de_acesso_meta_ficticio_123';
    expect(cofre.decifrar(cofre.cifrar(token))).toBe(token);
  });

  it('nunca guarda o texto puro no valor cifrado', () => {
    const token = 'segredo-sensivel';
    const cifrado = cofre.cifrar(token);
    expect(cifrado).not.toContain(token);
    expect(cifrado.split(':')).toHaveLength(3);
  });

  it('gera saídas diferentes a cada cifragem (IV aleatório)', () => {
    const token = 'mesmo-valor';
    expect(cofre.cifrar(token)).not.toBe(cofre.cifrar(token));
  });

  it('falha no boot se a chave estiver ausente', () => {
    delete process.env.TOKEN_ENCRYPTION_KEY;
    const semChave = new CofreService();
    expect(() => semChave.onModuleInit()).toThrow(/TOKEN_ENCRYPTION_KEY ausente/);
  });

  it('falha no boot se a chave tiver tamanho errado', () => {
    process.env.TOKEN_ENCRYPTION_KEY = 'abc123';
    const chaveCurta = new CofreService();
    expect(() => chaveCurta.onModuleInit()).toThrow(/32 bytes/);
  });

  it('rejeita conteúdo cifrado adulterado (GCM auth tag)', () => {
    const cifrado = cofre.cifrar('intacto');
    const [iv, tag, dados] = cifrado.split(':');
    const adulterado = [iv, tag, Buffer.from('outro-dado').toString('base64')].join(':');
    expect(() => cofre.decifrar(adulterado)).toThrow();
  });
});
