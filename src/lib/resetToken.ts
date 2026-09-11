import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET as string;
const RESET_TTL = "30m";

// fingerprint do hash atual da senha: ao trocar a senha, todo token de reset antigo vira invalido
// sozinho (sem precisar de tabela pra guardar/revogar token)
function passwordFingerprint(passwordHash: string) {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

export function signResetToken(userId: string, passwordHash: string) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET não configurado");
  return jwt.sign({ sub: userId, purpose: "reset", pwfp: passwordFingerprint(passwordHash) }, JWT_SECRET, {
    expiresIn: RESET_TTL,
  });
}

export function verifyResetToken(token: string, currentPasswordHash: string): { sub: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; purpose?: string; pwfp?: string };
    if (payload.purpose !== "reset") return null;
    if (payload.pwfp !== passwordFingerprint(currentPasswordHash)) return null; // senha ja foi trocada
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
