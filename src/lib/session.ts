import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, COOKIE_NAME } from "@/lib/auth";

// Use em Server Components/Actions. Redireciona para /login se não autenticado.
export async function requireUserId(): Promise<string> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) redirect("/login");
  return session.sub;
}
