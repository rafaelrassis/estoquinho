import { NextResponse } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  buildAuthUrl,
  pkceChallenge,
  randomToken,
} from "@/lib/google";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const state = randomToken();
  const verifier = randomToken();

  const res = NextResponse.redirect(buildAuthUrl(origin, state, await pkceChallenge(verifier)));
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/auth/google",
    maxAge: 60 * 10,
  };
  res.cookies.set(OAUTH_STATE_COOKIE, state, opts);
  res.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, opts);
  return res;
}
