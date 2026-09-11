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
