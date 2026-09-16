import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/passwordReset";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Informe uma senha com pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  try {
    await resetPassword(token, password);
  } catch {
    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
