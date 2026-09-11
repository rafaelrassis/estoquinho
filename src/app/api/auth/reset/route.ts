import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { verifyResetToken } from "@/lib/resetToken";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Informe uma senha com pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  // precisa achar o dono do token antes de validar (o fingerprint depende do hash atual dele)
  let payloadSub: string;
  try {
    const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    payloadSub = decoded.sub;
  } catch {
    return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: payloadSub } });
  if (!user) return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 400 });

  const valid = verifyResetToken(token, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 400 });

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });

  return NextResponse.json({ ok: true });
}
