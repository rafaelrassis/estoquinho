import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession, COOKIE_NAME } from "@/lib/auth";

export default async function Home() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const session = token ? verifySession(token) : null;
  redirect(session ? "/dashboard" : "/login");
}
