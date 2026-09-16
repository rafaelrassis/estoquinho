import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Enquanto nao configurar dominio proprio no Resend, use "onboarding@resend.dev"
// (so consegue mandar pro seu proprio e-mail cadastrado no Resend, mas ja destrava o fluxo)
const FROM = process.env.RESEND_FROM_EMAIL || "Estoquinho <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY não configurado — e-mail de reset não enviado. Link:", resetUrl);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Redefinir senha — Estoquinho",
    html: `
      <p>Recebemos um pedido pra redefinir sua senha no Estoquinho.</p>
      <p><a href="${resetUrl}">Clique aqui pra criar uma nova senha</a> (o link expira em 30 minutos).</p>
      <p>Se você não pediu isso, pode ignorar este e-mail.</p>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) {
    console.warn(`RESEND_API_KEY não configurado — e-mail de boas-vindas não enviado pra ${to}`);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bem-vindo ao Estoquinho 👋",
    html: `
      <p>Oi, ${name}!</p>
      <p>Sua conta no Estoquinho tá pronta. Cadastre seus primeiros produtos e comece a registrar
      entradas e saídas direto do celular.</p>
    `,
  });
}

type LowStockItem = { name: string; sku: string; stockQty: number; lowStockAt: number };

export async function sendLowStockDigest(to: string, items: LowStockItem[], appUrl: string) {
  if (!resend) {
    console.warn(`RESEND_API_KEY não configurado — digest de estoque baixo não enviado pra ${to}`);
    return;
  }
  const rows = items
    .map((p) => `<tr><td>${p.name}</td><td>${p.sku}</td><td>${p.stockQty}</td><td>${p.lowStockAt}</td></tr>`)
    .join("");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ ${items.length} produto(s) com estoque baixo — Estoquinho`,
    html: `
      <p>Estes produtos estão no limite de estoque baixo ou abaixo dele:</p>
      <table cellpadding="6" style="border-collapse:collapse">
        <thead><tr><th align="left">Produto</th><th align="left">SKU</th><th align="left">Estoque</th><th align="left">Alerta</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p><a href="${appUrl}/products">Ver produtos no Estoquinho</a></p>
    `,
  });
}
