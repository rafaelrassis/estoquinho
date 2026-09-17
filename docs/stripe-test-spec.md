# Spec de teste — Cobrança (Stripe)

Objetivo: validar checkout, portal e webhook em **modo teste**, sem gerar cobrança real, antes de liberar pra usuários de verdade.

## 0. Pré-requisito: separar teste de produção
Nunca testar com chave `sk_live_`. No Stripe Dashboard, ativar **Test mode** e criar, nesse modo:
- Produto + preço recorrente → `price_id` de teste
- Developers → API keys → `sk_test_...`
- Developers → Webhooks → endpoint apontando pra `https://estoquinho.vercel.app/api/billing/webhook`, eventos `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` → `whsec_...` de teste

O app tem um toggle de modo teste (`STRIPE_TEST_MODE=true`) que troca as chaves usadas em runtime, independente do ambiente Vercel:
- `STRIPE_SECRET_KEY_TEST`, `STRIPE_PRICE_ID_TEST`, `STRIPE_WEBHOOK_SECRET_TEST` → usadas quando `STRIPE_TEST_MODE=true`
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` → produção (`sk_live_`), usadas quando o toggle está desligado

Configurar as 4 variáveis de teste + `STRIPE_TEST_MODE=true` no ambiente **Preview** do Vercel (nunca em Production). Com o toggle ligado, a tela `/billing` mostra um aviso "Modo teste do Stripe ativo".

Cartão de teste: `4242 4242 4242 4242`, validade futura qualquer, CVC qualquer, CEP qualquer.

## 1. Checkout — assinatura nova
1. Logar com um usuário FREE (sem `stripeCustomerId`).
2. Ir em `/billing` → confirmar que mostra "Gratuito" e botão "Assinar PRO".
3. Tocar "Assinar PRO" → deve redirecionar pro Checkout do Stripe (hospedado, fora do app).
4. Preencher com o cartão de teste → concluir.
5. **Esperado**: redireciona de volta pra `/billing?status=success`.
6. Recarregar `/billing` → deve mostrar **"PRO"** e `subscriptionStatus: active`.
7. Conferir no banco (`prisma studio` ou query direta): `User.plan = PRO`, `stripeCustomerId` preenchido, `planProductLimit = 1000`.

## 2. Webhook — chegou o evento?
No Stripe Dashboard → Developers → Webhooks → endpoint de teste → aba **Events**:
- Confirmar `checkout.session.completed` com status **200** (sucesso).
- Se der erro/timeout: checar logs da function na Vercel (`get_runtime_errors` ou `vercel logs`).

## 3. Limite de produto respeitando o plano
1. Com usuário ainda FREE, cadastrar produtos até bater o limite (`planProductLimit`, padrão 30).
2. Tentar cadastrar mais um → **esperado**: erro 402 "Limite de X produtos do plano atingido".
3. Assinar PRO (passo 1) → tentar cadastrar de novo → **esperado**: sucesso (limite virou 1000).

## 4. Portal do cliente — gerenciar assinatura
1. Com usuário PRO, ir em `/billing` → botão deve mudar pra "Gerenciar assinatura".
2. Tocar → deve abrir o **Customer Portal** do Stripe (hospedado).
3. Cancelar a assinatura por lá.
4. **Esperado**: evento `customer.subscription.deleted` chega no webhook (conferir na aba Events).
5. Recarregar `/billing` → deve voltar pra "Gratuito", `planProductLimit = 30`.

## 5. Casos de erro
| Cenário | Como forçar | Esperado |
|---|---|---|
| Webhook com assinatura inválida | Enviar POST manual pro endpoint sem o header `stripe-signature` correto (ex: `curl`) | 400 "Assinatura inválida" |
| Checkout sem `STRIPE_PRICE_ID` configurado | Remover a env var temporariamente | 501 "Cobrança não configurada" |
| Usuário sem assinatura acessa o portal | Chamar `/api/billing/portal` sem `stripeCustomerId` | 404 "Nenhuma assinatura encontrada" |
| Pagamento recusado | Cartão de teste `4000 0000 0000 0002` (decline genérico) | Checkout mostra erro, não completa, `plan` continua FREE |

## 6. Antes de ir pra produção de verdade
- [ ] Todos os testes acima passaram em modo teste
- [ ] Variáveis de produção (`sk_live_`, price_id live, webhook secret live) conferidas no ambiente **Production** do Vercel
- [ ] Webhook de produção criado no Stripe (modo live), apontando pro mesmo endpoint
- [ ] Ninguém rodou o fluxo de checkout em produção "pra ver o que acontece" antes desse checklist
