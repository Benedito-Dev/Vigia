import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';

/**
 * Cofre de segredos (RF-004) — cifra/decifra dados sensíveis (o Access Token
 * da Meta) com AES-256-GCM. O token nunca é gravado em texto puro; no banco
 * mora apenas o resultado de `cifrar()`.
 *
 * Este é o único ponto do sistema que conhece o token cru. Qualquer service
 * que precise do token chama `decifrar()` no instante da chamada ao Meta e
 * descarta o valor logo em seguida — nunca o persiste nem o loga.
 *
 * Formato armazenado: "iv:authTag:ciphertext" (cada parte em base64). Cabe
 * numa string única, então usa o campo `tokenRef` existente sem mudar o schema.
 *
 * A chave vem de TOKEN_ENCRYPTION_KEY (32 bytes em hex, ex.: `openssl rand -hex 32`).
 * O boot falha explicitamente se a chave faltar ou tiver tamanho errado — é
 * preferível não subir a subir sem conseguir proteger segredo nenhum.
 */
@Injectable()
export class CofreService implements OnModuleInit {
  private static readonly ALGORITMO = 'aes-256-gcm';
  private static readonly TAMANHO_IV = 12; // recomendado para GCM
  private static readonly TAMANHO_CHAVE = 32; // AES-256

  private chave!: Buffer;

  onModuleInit() {
    const bruta = process.env.TOKEN_ENCRYPTION_KEY;
    if (!bruta) {
      throw new Error(
        'TOKEN_ENCRYPTION_KEY ausente. Gere com `openssl rand -hex 32` e coloque no .env.',
      );
    }

    const chave = Buffer.from(bruta, 'hex');
    if (chave.length !== CofreService.TAMANHO_CHAVE) {
      throw new Error(
        `TOKEN_ENCRYPTION_KEY deve ter ${CofreService.TAMANHO_CHAVE} bytes (64 hex chars). ` +
          `Recebido: ${chave.length} bytes. Gere com \`openssl rand -hex 32\`.`,
      );
    }

    this.chave = chave;
  }

  cifrar(textoPuro: string): string {
    const iv = randomBytes(CofreService.TAMANHO_IV);
    const cipher = createCipheriv(CofreService.ALGORITMO, this.chave, iv);
    const cifrado = Buffer.concat([cipher.update(textoPuro, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString('base64'), authTag.toString('base64'), cifrado.toString('base64')].join(':');
  }

  decifrar(armazenado: string): string {
    const partes = armazenado.split(':');
    if (partes.length !== 3) {
      throw new InternalServerErrorException('Formato de segredo cifrado inválido.');
    }

    const [ivB64, authTagB64, cifradoB64] = partes;
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    const cifrado = Buffer.from(cifradoB64, 'base64');

    const decipher = createDecipheriv(CofreService.ALGORITMO, this.chave, iv);
    decipher.setAuthTag(authTag);
    const puro = Buffer.concat([decipher.update(cifrado), decipher.final()]);
    return puro.toString('utf8');
  }
}
