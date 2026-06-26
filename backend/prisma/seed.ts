import { PrismaClient, Papel } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const organizacao = await prisma.organizacao.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nome: 'Giga Cell',
      plano: 'interno',
    },
  });

  const senhaHash = await argon2.hash('vigia123');

  const usuario = await prisma.usuario.upsert({
    where: { email: 'dono@gigacell.com.br' },
    update: {},
    create: {
      organizacaoId: organizacao.id,
      nome: 'Dono Giga Cell',
      email: 'dono@gigacell.com.br',
      senhaHash,
      papel: Papel.dono,
    },
  });

  console.log('Seed concluído:', { organizacao: organizacao.nome, usuario: usuario.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
