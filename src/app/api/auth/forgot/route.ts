import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";
import { EMAIL_ENABLED } from "@/lib/features";

// Sempre responde a mesma mensagem, exista ou nao a conta (evita revelar e-mails cadastrados)
export async function POST(req: Request) {
  if (!EMAIL_ENABLED) {
    return NextResponse.json(
      { unavailable: true, message: "Redefinição de senha por e-mail indisponível por enquanto." },
      { status: 503 }
    );
  }
  const { email } = await req.json();
  const generic = NextResponse.json({
    message: "Se existir uma conta com esse e-mail, enviamos um link de redefinição.",
  });

  if (!email) return generic;

  const token = await createResetToken(email);
  if (!token) return generic;

  const origin = new URL(req.url).origin;
  const resetUrl = `${origin}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl);

  return generic;
}
