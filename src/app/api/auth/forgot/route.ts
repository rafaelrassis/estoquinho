import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";

// Sempre responde a mesma mensagem, exista ou nao a conta (evita revelar e-mails cadastrados)
export async function POST(req: Request) {
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
