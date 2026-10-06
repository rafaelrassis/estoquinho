# Estoquinho — contexto pro Claude Code

Controle de estoque simples pra pequenos revendedores. Next.js 16 (App Router) + Prisma + PostgreSQL (Neon), deploy na Vercel.

## ⚠️ Duas sessões Claude mexem neste repo
Além do Claude Code, existe uma sessão no claude.ai (chat) trabalhando no mesmo repo, sem acesso de rede ao Neon/Prisma binaries/api.stripe.com — ela não roda `prisma generate`/`db push`/`build` de verdade nem chama a API do Stripe, só edita arquivos e valida com `tsc`/`eslint` locais (que não pegam mismatch de schema, já que o Prisma Client fica sem gerar). Ela entrega mudanças como zip pra aplicar manualmente — **esse arquivo já sumiu do repo uma vez** porque um zip não foi aplicado por completo. Se este arquivo estiver desatualizado ou ausente de novo, é sinal de que isso aconteceu — reconstruir a partir do histórico de commits e do estado real do projeto, não assumir que está tudo certo.

**Antes de começar qualquer tarefa aqui: `git pull`.** Depois de qualquer mudança em `schema.prisma`, `middleware.ts` ou variáveis de ambiente: `npm run build` local antes de subir, pra pegar o que só aparece com o Prisma Client gerado de verdade.

## Sincronia de schema
Este projeto usa **`prisma db push`**, não `migrate dev`/`deploy` — não existe pasta `prisma/migrations`. Depois de editar `schema.prisma`:
```bash
export DATABASE_URL="<pooler>"
export DIRECT_URL="<direta>"
npx prisma db push
```

## Armadilhas já resolvidas (não reintroduzir)
- **Middleware roda em Edge Runtime.** `jsonwebtoken` usa APIs do Node que não existem lá.
  - `src/lib/auth-edge.ts` tem `verifySessionEdge` usando `jose` (Web Crypto) — é o que o middleware usa.
  - `src/lib/auth.ts` (jsonwebtoken) é só pra rotas de API (Node runtime).
  - `src/lib/constants.ts` tem `COOKIE_NAME` isolado, sem import de libs Node — importe daqui no middleware, nunca de `lib/auth.ts` (senão arrasta jsonwebtoken pro bundle do Edge de novo).
- **`prisma.$transaction(async (tx) => {...})`**: não anotar o tipo de `tx` manualmente. Deixa o TS inferir via contextual typing. Localmente (sem generate) isso aparece como `implicitly has an 'any' type` no `tsc` — é esperado e some depois do `db push`/`generate` de verdade; não é bug.
- **Login é só Google** (OAuth code flow + PKCE em `src/lib/google.ts`, rotas `/api/auth/google` e `/callback`). Senha, cadastro e reset foram removidos. `User.passwordHash` (nullable), `failedLoginAttempts`, `lockedUntil` e a tabela `PasswordReset` ficaram no schema como legado (evita `--accept-data-loss`); remover numa rodada futura. Usuário existente é vinculado pelo e-mail do Google (verificado) no primeiro login.
- Stripe tem modo teste embutido via env var (ver abaixo) — não hardcodar chave de teste no código nem trocar `STRIPE_SECRET_KEY` na mão pra testar.

## Variáveis de ambiente (Vercel: Production + Preview + Development)
- `DATABASE_URL` — Neon, **com** `-pooler` no host (runtime)
- `DIRECT_URL` — Neon, **sem** `-pooler` (migrations/`db push`)
- `JWT_SECRET` — sessão de login
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — login Google. Redirect URI autorizada no Google Cloud: `<NEXT_PUBLIC_APP_URL>/api/auth/google/callback`
- `BLOB_READ_WRITE_TOKEN` — foto de produto (Vercel Blob, criado automático ao conectar o storage)
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` — produção (live)
- `STRIPE_TEST_MODE` — `"true"` faz `src/lib/stripe.ts` usar as 3 vars `_TEST` abaixo em vez das de produção
- `STRIPE_SECRET_KEY_TEST`, `STRIPE_PRICE_ID_TEST`, `STRIPE_WEBHOOK_SECRET_TEST` — teste (ver `docs/stripe-test-spec.md`)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — e-mail (boas-vindas, digest de estoque baixo). Sem domínio verificado no Resend, só entrega pro e-mail cadastrado na conta Resend.
- `CRON_SECRET` — **obrigatória**, protege `/api/cron/low-stock-digest`. Sem ela, a rota fica sem checagem nenhuma (o código só valida o header se a var existir).
- `NEXT_PUBLIC_APP_URL` — usado nos links dos e-mails

## Stack e convenções
- Preço/custo em **centavos** (`Int`), nunca float.
- `Product.stockQty` é desnormalizado — toda escrita de estoque passa por `/api/movements` (transação atômica), nunca update direto na tabela.
- Auth: Google OAuth manual + cookie httpOnly com JWT (sem NextAuth). Um usuário dono por conta (sem multi-loja/multi-usuário na v1).
- Mobile-first, PWA (manifest + service worker já configurados). Bottom nav de 3 abas.
- `active: false` em vez de deletar produto (soft delete) — histórico de movimentação fica intacto.

## Última auditoria (2026-09-21, Claude Code)
- Build: OK no último deploy de produção da Vercel (commit `1b91c5b`, READY). Build local falha sem as env vars no shell — não é bug, é ambiente sem `.env`.
- Schema: sem `prisma/migrations`; não foi possível confirmar 100% a sincronia com o Neon nesta auditoria (sem credenciais locais, não descriptografei env vars sensíveis via MCP).
- **Pendência confirmada:** `STRIPE_PRICE_ID` (live) **não está configurado** no projeto Vercel hoje, só as vars `_TEST`. Com `STRIPE_TEST_MODE=false`, `/api/billing/checkout` retorna 501.
- **Pendência confirmada:** `CRON_SECRET` **não está configurado** no projeto Vercel hoje — `/api/cron/low-stock-digest` está sem proteção.
- Resend segue sem domínio próprio verificado (`onboarding@resend.dev`).
