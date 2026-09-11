import { requireUserId } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUserId(); // redireciona pra /login se não autenticado
  return (
    <div className="flex flex-col flex-1 min-h-screen pb-20">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
