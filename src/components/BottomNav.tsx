"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Painel", icon: "📊" },
  { href: "/products", label: "Produtos", icon: "📦" },
  { href: "/products/new", label: "Novo", icon: "➕" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 flex safe-area-bottom">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs ${
              active ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
