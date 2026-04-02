"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { PLANS } from "@/lib/plans";
import type { PlanType } from "@/lib/plans";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
    </svg>
  )},
  { href: "/search", label: "Buscar empresas", icon: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10 10l4 4"/>
    </svg>
  )},
  { href: "/lists", label: "Mis listas", icon: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="2" y="1" width="12" height="14" rx="1.5"/><path d="M5 4h6M5 7h6M5 10h3"/>
    </svg>
  )},
];

const PLAN_COLORS: Record<string, string> = {
  starter: "text-[#888]",
  growth: "text-[#00ff88]",
  business: "text-[#ffd700]",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const plan = (user?.plan || "starter") as PlanType;
  const planConfig = PLANS[plan] || PLANS.starter;

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#1a1a1a] min-h-screen flex flex-col">
      <div className="p-6 border-b border-[#1a1a1a]">
        <h1 className="text-xl font-bold text-white">
          OBX <span className="text-[#00ff88]">Leads</span>
        </h1>
        <p className="text-xs text-[#555] mt-1">Base de datos B2B España</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative ${
                isActive
                  ? "text-[#00ff88] bg-transparent"
                  : "text-[#888] hover:bg-[#111] hover:text-[#f0f0f0] hover:translate-x-0.5"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#00ff88] rounded-r-full" />
              )}
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[#222] to-transparent" />

      {/* Plan badge */}
      <div className="px-4 py-3">
        <div className="bg-[#111] border border-[#222] rounded-xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#555] uppercase tracking-wider">Plan</span>
            <span className={`text-xs font-semibold ${PLAN_COLORS[plan] || PLAN_COLORS.starter}`}>
              {planConfig.name}
            </span>
          </div>
          {plan === "starter" && (
            <button className="w-full mt-2 px-3 py-1.5 text-xs bg-[#00ff88] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#00e07a] transition-colors">
              Upgrade →
            </button>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-[#1a1a1a]">
        {user && (
          <p className="text-xs text-[#555] mb-2 truncate">{user.email}</p>
        )}
        <button
          onClick={() => fetch("/api/auth/signout", { method: "POST" }).then(() => window.location.href = "/auth/login")}
          className="text-sm text-[#555] hover:text-[#f0f0f0] transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
