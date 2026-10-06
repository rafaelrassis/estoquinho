import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export const OAUTH_STATE_COOKIE = "estoquinho_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "estoquinho_oauth_verifier";

function clientId() {
  const v = process.env.GOOGLE_CLIENT_ID;
  if (!v) throw new Error("GOOGLE_CLIENT_ID não configurado");
  return v;
}

function clientSecret() {
  const v = process.env.GOOGLE_CLIENT_SECRET;
  if (!v) throw new Error("GOOGLE_CLIENT_SECRET não configurado");
  return v;
}

export function redirectUri(origin: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || origin;
  return `${base.replace(/\/$/, "")}/api/auth/google/callback`;
}

function b64url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64url");
}

export function randomToken() {
  return b64url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function pkceChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return b64url(new Uint8Array(digest));
}

export function buildAuthUrl(origin: string, state: string, challenge: string) {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return `${AUTH_URL}?${params}`;
}

export type GoogleProfile = { sub: string; email: string; name: string };

// Troca o code por tokens e valida o id_token (assinatura, issuer, audience, e-mail verificado).
export async function exchangeCode(origin: string, code: string, verifier: string): Promise<GoogleProfile> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error(`Falha ao trocar code (${res.status})`);
  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("id_token ausente");

  const { payload } = await jwtVerify(id_token, JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: clientId(),
  });

  if (payload.email_verified !== true || typeof payload.email !== "string" || typeof payload.sub !== "string") {
    throw new Error("E-mail do Google não verificado");
  }

  const email = payload.email.toLowerCase();
  const name = typeof payload.name === "string" && payload.name ? payload.name : email.split("@")[0];
  return { sub: payload.sub, email, name };
}
