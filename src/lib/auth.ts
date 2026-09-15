import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET as string;
const COOKIE_NAME = "estoquinho_session";
const TOKEN_TTL = "30d";

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// jose (em vez de jsonwebtoken) porque o middleware roda no Edge Runtime,
// que não tem o modulo node:crypto que o jsonwebtoken precisa
export function signSession(userId: string) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET não configurado");
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(TOKEN_TTL)
    .sign(new TextEncoder().encode(JWT_SECRET));
}

export async function verifySession(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return { sub: payload.sub as string };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
