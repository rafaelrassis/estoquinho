// Versao do verifySession que roda no Edge Runtime (usada pelo middleware).
// jsonwebtoken usa APIs do Node que nao existem no Edge; jose usa Web Crypto e funciona nos dois.
// Os tokens sao os mesmos (HS256) - so muda a lib que verifica.
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);

export async function verifySessionEdge(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
