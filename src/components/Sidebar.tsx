"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { PLANS } from "@/lib/plans";
import type { PlanType } from "@/lib/plans";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )},
  { href: "/search", label: "Buscar empresas", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )},
  { href: "/lists", label: "Mis listas", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )},
];

const PLAN_COLORS: Record<string, string> = {
  starter: "text-[#888]",
  growth: "text-[#00ff88]",
  enterprise: "text-[#ffd700]",
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
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname?.startsWith(item.href)
                ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20"
                : "text-[#888] hover:bg-[#111] hover:text-[#f0f0f0]"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Plan badge */}
      <div className="px-4 pb-2">
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
