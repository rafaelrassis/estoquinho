import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Preencha nome, e-mail e senha (mínimo 6 caracteres)" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Já existe uma conta com esse e-mail" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  const token = await signSession(user.id);
  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
