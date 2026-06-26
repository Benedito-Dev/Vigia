-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('dono', 'operador', 'visualizador');

-- CreateEnum
CREATE TYPE "StatusProjeto" AS ENUM ('conectado', 'aviso_cobranca', 'desconectado');

-- CreateEnum
CREATE TYPE "Objetivo" AS ENUM ('lead', 'venda', 'mensagens', 'reconhecimento');

-- CreateEnum
CREATE TYPE "TipoOrcamento" AS ENUM ('CBO', 'ABO');

-- CreateEnum
CREATE TYPE "StatusCampanha" AS ENUM ('ativa', 'aprendendo', 'pausada_ia', 'pausada_user', 'arquivada');

-- CreateEnum
CREATE TYPE "TipoCriativo" AS ENUM ('video', 'imagem', 'carrossel');

-- CreateEnum
CREATE TYPE "EstadoCriativo" AS ENUM ('ativo', 'fadiga', 'pausado');

-- CreateEnum
CREATE TYPE "Severidade" AS ENUM ('critico', 'atencao', 'info');

-- CreateEnum
CREATE TYPE "OrigemAlerta" AS ENUM ('monitoramento', 'governanca');

-- CreateEnum
CREATE TYPE "StatusAlerta" AS ENUM ('aberto', 'resolvido', 'ignorado');

-- CreateEnum
CREATE TYPE "TipoAprovacao" AS ENUM ('publicar', 'escalar_verba', 'criar_publico', 'pausar');

-- CreateEnum
CREATE TYPE "OrigemAprovacao" AS ENUM ('diagnostico', 'sistema');

-- CreateEnum
CREATE TYPE "Autonomia" AS ENUM ('autonoma', 'assistida', 'vedada');

-- CreateEnum
CREATE TYPE "StatusAprovacao" AS ENUM ('pendente', 'aprovado', 'ignorado', 'executado', 'falhou');

-- CreateTable
CREATE TABLE "organizacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "plano" TEXT NOT NULL DEFAULT 'interno',
    "limite_analises_ia_mes" INTEGER NOT NULL DEFAULT 0,
    "analises_ia_consumidas" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "organizacao_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projeto" (
    "id" TEXT NOT NULL,
    "organizacao_id" TEXT NOT NULL,
    "cliente_nome" TEXT NOT NULL,
    "nicho" TEXT NOT NULL,
    "ticket_medio" DECIMAL(65,30) NOT NULL,
    "meta_external_id" TEXT NOT NULL,
    "token_ref" TEXT NOT NULL,
    "status" "StatusProjeto" NOT NULL DEFAULT 'conectado',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanha" (
    "id" TEXT NOT NULL,
    "projeto_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "objetivo" "Objetivo" NOT NULL,
    "tipo_orcamento" "TipoOrcamento" NOT NULL,
    "verba_diaria" DECIMAL(65,30) NOT NULL,
    "status" "StatusCampanha" NOT NULL DEFAULT 'pausada_user',
    "meta_external_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campanha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conjunto" (
    "id" TEXT NOT NULL,
    "campanha_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "verba" DECIMAL(65,30),
    "status" TEXT,
    "meta_external_id" TEXT NOT NULL,

    CONSTRAINT "conjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criativo" (
    "id" TEXT NOT NULL,
    "conjunto_id" TEXT NOT NULL,
    "tipo" "TipoCriativo" NOT NULL,
    "formato" TEXT NOT NULL,
    "estado" "EstadoCriativo" NOT NULL DEFAULT 'ativo',
    "meta_external_id" TEXT NOT NULL,

    CONSTRAINT "criativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrica_diaria" (
    "id" TEXT NOT NULL,
    "campanha_id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "impressoes" BIGINT NOT NULL,
    "cliques" BIGINT NOT NULL,
    "leads" BIGINT NOT NULL,
    "compras" BIGINT NOT NULL,
    "investimento" DECIMAL(65,30) NOT NULL,
    "receita" DECIMAL(65,30) NOT NULL,
    "cpl" DECIMAL(65,30),
    "cpa" DECIMAL(65,30),
    "roas" DECIMAL(65,30),
    "ctr" DECIMAL(65,30),
    "frequencia" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrica_diaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark" (
    "id" TEXT NOT NULL,
    "nicho" TEXT NOT NULL,
    "tipo_funil" TEXT NOT NULL,
    "ticket_range" TEXT NOT NULL,
    "kpi" TEXT NOT NULL,
    "valor_ruim" DECIMAL(65,30) NOT NULL,
    "valor_medio" DECIMAL(65,30) NOT NULL,
    "valor_bom" DECIMAL(65,30) NOT NULL,
    "fonte" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,

    CONSTRAINT "benchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "limite_seguranca" (
    "id" TEXT NOT NULL,
    "projeto_id" TEXT NOT NULL,
    "teto_verba_diaria" DECIMAL(65,30) NOT NULL,
    "cpl_maximo" DECIMAL(65,30) NOT NULL,
    "escala_max_pct_dia" INTEGER NOT NULL DEFAULT 20,

    CONSTRAINT "limite_seguranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerta" (
    "id" TEXT NOT NULL,
    "campanha_id" TEXT NOT NULL,
    "severidade" "Severidade" NOT NULL,
    "kpi" TEXT NOT NULL,
    "valor_atual" DECIMAL(65,30) NOT NULL,
    "valor_benchmark" DECIMAL(65,30) NOT NULL,
    "desvio_pct" DECIMAL(65,30) NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "fora_do_alcance_ia" BOOLEAN NOT NULL DEFAULT false,
    "origem" "OrigemAlerta" NOT NULL,
    "status" "StatusAlerta" NOT NULL DEFAULT 'aberto',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aprovacao" (
    "id" TEXT NOT NULL,
    "organizacao_id" TEXT NOT NULL,
    "tipo" "TipoAprovacao" NOT NULL,
    "alvo_ref" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "gatilho" JSONB NOT NULL,
    "origem" "OrigemAprovacao" NOT NULL,
    "autonomia" "Autonomia" NOT NULL,
    "status" "StatusAprovacao" NOT NULL DEFAULT 'pendente',
    "decidido_por" TEXT,
    "decidido_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aprovacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_auditoria" (
    "id" TEXT NOT NULL,
    "organizacao_id" TEXT NOT NULL,
    "ator" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "alvo_ref" TEXT,
    "dados_antes" JSONB,
    "dados_depois" JSONB,
    "gatilho" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registro_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "metrica_diaria_campanha_id_data_idx" ON "metrica_diaria"("campanha_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "limite_seguranca_projeto_id_key" ON "limite_seguranca"("projeto_id");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto" ADD CONSTRAINT "projeto_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conjunto" ADD CONSTRAINT "conjunto_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criativo" ADD CONSTRAINT "criativo_conjunto_id_fkey" FOREIGN KEY ("conjunto_id") REFERENCES "conjunto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrica_diaria" ADD CONSTRAINT "metrica_diaria_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "limite_seguranca" ADD CONSTRAINT "limite_seguranca_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprovacao" ADD CONSTRAINT "aprovacao_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprovacao" ADD CONSTRAINT "aprovacao_decidido_por_fkey" FOREIGN KEY ("decidido_por") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria" ADD CONSTRAINT "registro_auditoria_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
