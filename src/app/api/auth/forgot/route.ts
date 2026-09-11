import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signResetToken } from "@/lib/resetToken";
import { sendPasswordResetEmail } from "@/lib/email";

// Sempre responde a mesma mensagem, exista ou nao a conta (evita revelar e-mails cadastrados)
export async function POST(req: Request) {
  const { email } = await req.json();
  const generic = NextResponse.json({
    message: "Se existir uma conta com esse e-mail, enviamos um link de redefinição.",
  });

  if (!email) return generic;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return generic;

  const token = signResetToken(user.id, user.passwordHash);
  const origin = new URL(req.url).origin;
  const resetUrl = `${origin}/reset-password?token=${token}`;

  await sendPasswordResetEmail(user.email, resetUrl);
  return generic;
}
