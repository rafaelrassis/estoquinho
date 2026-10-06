import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { signSession, COOKIE_NAME } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { OAUTH_STATE_COOKIE, OAUTH_VERIFIER_COOKIE, exchangeCode } from "@/lib/google";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const fail = (code: string) => {
    const res = NextResponse.redirect(new URL(`/login?error=${code}`, origin));
    res.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/api/auth/google", maxAge: 0 });
    res.cookies.set(OAUTH_VERIFIER_COOKIE, "", { path: "/api/auth/google", maxAge: 0 });
    return res;
  };

  if (url.searchParams.get("error")) return fail("cancelado");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieHeader = req.headers.get("cookie") ?? "";
  const getCookie = (name: string) =>
    cookieHeader.split(/;\s*/).find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);
  const savedState = getCookie(OAUTH_STATE_COOKIE);
  const verifier = getCookie(OAUTH_VERIFIER_COOKIE);

  if (!code || !state || !savedState || !verifier || state !== savedState) return fail("estado");

  let profile;
  try {
    profile = await exchangeCode(origin, code, verifier);
  } catch (err) {
    console.error("Falha no login Google:", err);
    return fail("google");
  }

  // 1) já vinculado ao googleId; 2) conta existente com o mesmo e-mail (vincula); 3) cria
  let user = await prisma.user.findUnique({ where: { googleId: profile.sub } });
  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email: profile.email } });
    if (byEmail) {
      user = await prisma.user.update({ where: { id: byEmail.id }, data: { googleId: profile.sub } });
    } else {
      user = await prisma.user.create({
        data: { name: profile.name, email: profile.email, googleId: profile.sub },
      });
      const { email, name } = user;
      after(() =>
        sendWelcomeEmail(email, name).catch((err) =>
          console.error("Falha ao enviar e-mail de boas-vindas:", err)
        )
      );
    }
  }

  const res = NextResponse.redirect(new URL("/dashboard", origin));
  res.cookies.set(COOKIE_NAME, signSession(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/api/auth/google", maxAge: 0 });
  res.cookies.set(OAUTH_VERIFIER_COOKIE, "", { path: "/api/auth/google", maxAge: 0 });
  return res;
}
