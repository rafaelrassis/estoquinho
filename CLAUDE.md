# Estoquinho

Controle de estoque simples (multi-tenant por usuário). Next.js App Router + Prisma + PostgreSQL (Neon).

## Stack

- Next.js 16 (App Router, Turbopack), React 19
- Prisma 6 + PostgreSQL (Neon) — schema em `prisma/schema.prisma`, sem migrations (usa `prisma db push`)
- Auth própria: JWT em cookie (`jose` no middleware/Edge, `jsonwebtoken`/`bcryptjs` no resto), sessão em `src/lib/session.ts` / `src/lib/auth.ts` / `src/lib/auth-edge.ts`
- Stripe (assinatura PRO) com alternância test/live via `STRIPE_TEST_MODE`
- Resend (e-mail transacional: boas-vindas, reset de senha, digest de estoque baixo)
- Vercel Blob (foto de produto)
- Vercel Cron (`vercel.json`) chamando `/api/cron/low-stock-digest`
- Deploy: Vercel, projeto `estoquinho`, time `rafaelrassis-projects`

## Estrutura

- `src/app/(app)/*` — páginas autenticadas (dashboard, products, billing)
- `src/app/api/*` — rotas de API (auth, billing, cron, products, movements, upload, export)
- `src/lib/*` — prisma client, auth, sessão, stripe, email, constantes
- `src/middleware.ts` — checagem de sessão no Edge Runtime (via `jose`, não `jsonwebtoken`)
- `prisma/schema.prisma` — modelos `User`, `PasswordReset`, `Product`, `StockMovement`

## Modelo de dados (resumo)

- `Product.stockQty` é desnormalizado (saldo atual), atualizado a partir de `StockMovement` (tipos `ENTRADA`/`SAIDA`/`AJUSTE`)
- `Product` único por `(userId, sku)`
- Campos monetários em centavos (`costCents`, `priceCents`) — evitar float
- Estrutura de plano (`PlanType`, `planProductLimit`, `stripeCustomerId`) já existe no schema, mas regra de limite ainda não está implementada (comentário no schema)

## Variáveis de ambiente

Ver `.env.example` para lista completa e comentários. Configuradas hoje na Vercel (produção): `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID`, `BLOB_WEBHOOK_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY_TEST`, `STRIPE_WEBHOOK_SECRET_TEST`, `STRIPE_PRICE_ID_TEST`, `STRIPE_TEST_MODE`, `RESEND_API_KEY`.

**Faltando / pendências:**
- `STRIPE_PRICE_ID` (preço live) **não está configurado**. Se `STRIPE_TEST_MODE=false`, `/api/billing/checkout` retorna 501 ("Cobrança não configurada"). Só funciona em modo teste hoje.
- `CRON_SECRET` **não está configurado**. O código só valida o header se a var existir (`if (process.env.CRON_SECRET && ...)`), então a rota `/api/cron/low-stock-digest` está sem proteção enquanto isso não for setado.
- `RESEND_FROM_EMAIL` e `NEXT_PUBLIC_APP_URL` têm fallback no código, não bloqueiam nada.
- Resend está usando domínio padrão (`onboarding@resend.dev`) — sem domínio próprio verificado, só envia para o e-mail cadastrado na conta Resend, não para usuários reais.

## Comandos

```bash
npm install       # postinstall roda `prisma generate`
npm run dev
npm run build
npm run lint
npx prisma db push   # aplica schema.prisma direto no Neon (sem migrations)
```

## Convenções

- Rotas de API validam sessão via cookie JWT; Edge (`middleware.ts`) usa `jose`, resto do server usa `jsonwebtoken`
- Toda query de dados do usuário deve escopar por `userId` (multi-tenant simples, sem RLS)
- `StockMovement.userId` é desnormalizado de propósito (evita join só para escopar por conta)

## Última auditoria (2026-09-21)

- Build na Vercel: OK (último deploy de produção, commit `1b91c5b`, READY)
- Schema: sem migrations formais; não foi possível confirmar 100% a sincronia com o Neon nesta auditoria (sem credenciais locais)
- Pendências reais listadas acima (Stripe live, CRON_SECRET, domínio Resend)
