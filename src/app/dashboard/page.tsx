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
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#f0f0f0] mb-6">Dashboard</h1>

        {/* Quick search */}
        <div className="bg-[#181818] border border-[#222] rounded-2xl p-5 mb-6">
          <div className="flex gap-3">
            <input
              value={quickSearch}
              onChange={e => setQuickSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleQuickSearch()}
              placeholder="Buscar empresa por nombre o CIF..."
              className="flex-1 bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00ff88] placeholder:text-[#555] transition-colors"
            />
            <button
              onClick={handleQuickSearch}
              className="px-6 py-3 bg-[#00ff88] text-[#0a0a0a] rounded-xl text-sm font-semibold hover:bg-[#00e07a] transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-[#555] animate-pulse">Cargando...</div>
        ) : !data ? (
          <p className="text-red-400">Error cargando datos. <a href="/auth/login" className="text-[#00ff88] underline">Iniciar sesión</a></p>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
                <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Empresas en base</p>
                <p className="text-3xl font-bold text-[#f0f0f0]">{data.totalCompanies.toLocaleString("es-ES")}</p>
              </div>
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
                <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Mis listas</p>
                <p className="text-3xl font-bold text-[#00ff88]">{data.totalLists}</p>
              </div>
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
                <p className="text-xs text-[#555] uppercase tracking-wider mb-1">Exportaciones</p>
                <p className="text-3xl font-bold text-[#f0f0f0]">{data.totalExports}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Empresas por provincia */}
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
                <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Top provincias</h2>
                {data.empresasPorProvincia.length > 0 ? (
                  <div className="space-y-3">
                    {data.empresasPorProvincia.slice(0, 5).map((p) => {
                      const maxCount = data.empresasPorProvincia[0].count;
                      const pct = Math.round((p.count / maxCount) * 100);
                      return (
                        <div key={p.name}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-[#ccc] font-medium">{p.name}</span>
                            <span className="text-[#555] font-mono text-xs">{p.count}</span>
                          </div>
                          <div className="w-full bg-[#111] rounded-full h-2">
                            <div className="bg-[#00ff88] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[#555]">Sin datos</p>
                )}
              </div>

              {/* Top sectores */}
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
                <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Top sectores</h2>
                {data.topSectores.length > 0 ? (
                  <div className="space-y-3">
                    {data.topSectores.map((s, i) => {
                      const maxCount = data.topSectores[0].count;
                      const pct = Math.round((s.count / maxCount) * 100);
                      const colors = ["bg-[#00ff88]", "bg-[#00ccff]", "bg-[#ff6b6b]", "bg-[#ffd700]", "bg-[#c084fc]"];
                      return (
                        <div key={s.name}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-[#ccc] font-medium truncate mr-2">{s.name}</span>
                            <span className="text-[#555] shrink-0 font-mono text-xs">{s.count}</span>
                          </div>
                          <div className="w-full bg-[#111] rounded-full h-2">
                            <div className={`${colors[i % colors.length]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[#555]">Sin datos</p>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
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
                <p className="text-sm text-[#555]">Sin actividad reciente</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
