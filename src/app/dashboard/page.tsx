"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface ProvinciaItem { name: string; count: number; }
interface SectorItem { name: string; count: number; }
interface ActivityItem { id: string; action: string; createdAt: string; metadata: string | null; }
interface DashboardData {
  totalCompanies: number;
  totalLists: number;
  totalExports: number;
  recentActivity: ActivityItem[];
  empresasPorProvincia: ProvinciaItem[];
  topSectores: SectorItem[];
}

const ACTION_LABELS: Record<string, string> = {
  search: "Búsqueda",
  view_company: "Vista empresa",
  export: "Exportación",
};

function SkeletonCard() {
  return (
    <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
      <div className="skeleton h-3 w-20 mb-2" />
      <div className="skeleton h-8 w-16" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
      <div className="skeleton h-5 w-28 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1.5">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-3 w-8" />
            </div>
            <div className="skeleton h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard").then(r => {
      if (r.status === 401) { window.location.href = "/auth/login"; return null; }
      return r.json();
    }).then(data => { if (data) setData(data); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleQuickSearch = () => {
    if (quickSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8 bg-grid">
        <h1 className="text-2xl font-bold text-[#f0f0f0] mb-6 animate-in">Dashboard</h1>

        {/* Quick search */}
        <div className="bg-[#181818] border border-[#222] rounded-2xl p-5 mb-6 card-hover animate-in">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">
                <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10 10l4 4"/>
              </svg>
              <input
                value={quickSearch}
                onChange={e => setQuickSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleQuickSearch()}
                placeholder="Buscar empresa por nombre o CIF..."
                className="w-full bg-[#111] border border-[#333] text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#00ff88] placeholder:text-[#555] transition-colors"
              />
            </div>
            <button
              onClick={handleQuickSearch}
              className="px-6 py-3 bg-[#00ff88] text-[#0a0a0a] rounded-xl text-sm font-semibold hover:bg-[#00e07a] transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex gap-3 mb-6 animate-in">
          <button
            onClick={() => router.push("/search")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#181818] border border-[#222] rounded-xl text-sm text-[#f0f0f0] hover:border-[#00ff88]/30 hover:bg-[#1a1a1a] transition-all"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#00ff88]">
              <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10 10l4 4"/>
            </svg>
            Nueva búsqueda
          </button>
          <button
            onClick={() => router.push("/lists")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#181818] border border-[#222] rounded-xl text-sm text-[#f0f0f0] hover:border-[#00ff88]/30 hover:bg-[#1a1a1a] transition-all"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#00ff88]">
              <rect x="2" y="1" width="12" height="14" rx="1.5"/><path d="M5 4h6M5 7h6M5 10h3"/>
            </svg>
            Crear lista
          </button>
          <button
            onClick={() => router.push("/search")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#181818] border border-[#222] rounded-xl text-sm text-[#f0f0f0] hover:border-[#00ff88]/30 hover:bg-[#1a1a1a] transition-all"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#00ff88]">
              <path d="M8 1v10M4 7l4 4 4-4"/><path d="M2 12v2h12v-2"/>
            </svg>
            Exportar
          </button>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SkeletonChart /><SkeletonChart />
            </div>
          </>
        ) : !data ? (
          <p className="text-red-400">Error cargando datos. <a href="/auth/login" className="text-[#00ff88] underline">Iniciar sesión</a></p>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-in-delay-1">
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-6 card-hover">
                <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Empresas en base</p>
                <p className="text-3xl font-bold text-[#f0f0f0] font-mono">{data.totalCompanies.toLocaleString("es-ES")}</p>
              </div>
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-6 card-hover">
                <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Mis listas</p>
                <p className="text-3xl font-bold text-[#00ff88] font-mono">{data.totalLists}</p>
              </div>
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-6 card-hover">
                <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Exportaciones</p>
                <p className="text-3xl font-bold text-[#f0f0f0] font-mono">{data.totalExports}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in-delay-2">
              {/* Empresas por provincia */}
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-6 card-hover">
                <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Top provincias</h2>
                {data.empresasPorProvincia.length > 0 ? (
                  <div className="space-y-3">
                    {data.empresasPorProvincia.slice(0, 5).map((p) => {
                      const maxCount = data.empresasPorProvincia[0].count;
                      const pct = Math.round((p.count / maxCount) * 100);
                      return (
                        <div key={p.name} className="group cursor-default">
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-[#ccc] font-medium group-hover:text-[#00ff88] transition-colors">{p.name}</span>
                            <span className="text-[#555] font-mono text-xs group-hover:text-[#888] transition-colors">{p.count}</span>
                          </div>
                          <div className="w-full bg-[#111] rounded-full h-2 overflow-hidden">
                            <div className="bg-[#00ff88] h-2 rounded-full transition-all group-hover:bg-[#00e07a]" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-[#333] mx-auto mb-2">
                      <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
                    </svg>
                    <p className="text-sm text-[#555]">Sin datos</p>
                  </div>
                )}
              </div>

              {/* Top sectores */}
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-6 card-hover">
                <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Top sectores</h2>
                {data.topSectores.length > 0 ? (
                  <div className="space-y-3">
                    {data.topSectores.map((s, i) => {
                      const maxCount = data.topSectores[0].count;
                      const pct = Math.round((s.count / maxCount) * 100);
                      const colors = ["bg-[#00ff88]", "bg-[#00ccff]", "bg-[#ff6b6b]", "bg-[#ffd700]", "bg-[#c084fc]"];
                      return (
                        <div key={s.name} className="group cursor-default">
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-[#ccc] font-medium truncate mr-2 group-hover:text-[#f0f0f0] transition-colors">{s.name}</span>
                            <span className="text-[#555] shrink-0 font-mono text-xs group-hover:text-[#888] transition-colors">{s.count}</span>
                          </div>
                          <div className="w-full bg-[#111] rounded-full h-2 overflow-hidden">
                            <div className={`${colors[i % colors.length]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-[#333] mx-auto mb-2">
                      <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
                    </svg>
                    <p className="text-sm text-[#555]">Sin datos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-[#181818] border border-[#222] rounded-2xl p-6 card-hover animate-in-delay-3">
              <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Actividad reciente</h2>
              {data.recentActivity?.length ? (
                <div className="space-y-2">
                  {data.recentActivity.map(a => {
                    let detail = "";
                    try {
                      const meta = a.metadata ? JSON.parse(a.metadata) : {};
                      if (meta.query) detail = `"${meta.query}"`;
                      if (meta.companyName) detail = meta.companyName;
                      if (meta.provincia) detail += ` · ${meta.provincia}`;
                    } catch { /* ignore */ }
                    return (
                      <div key={a.id} className="flex justify-between items-center text-sm border-b border-[#222] pb-2 last:border-0">
                        <div>
                          <span className="text-[#ccc] font-medium">{ACTION_LABELS[a.action] || a.action}</span>
                          {detail && <span className="text-[#555] ml-2">{detail}</span>}
                        </div>
                        <span className="text-[#444] text-xs font-mono">{new Date(a.createdAt).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-[#333] mx-auto mb-2">
                    <path d="M1 8a7 7 0 1114 0A7 7 0 011 8z"/><path d="M8 4v4l3 2"/>
                  </svg>
                  <p className="text-sm text-[#555]">Sin actividad reciente</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
