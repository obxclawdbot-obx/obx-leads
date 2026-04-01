"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

interface ProvinciaItem {
  name: string;
  count: number;
}

interface SectorItem {
  name: string;
  count: number;
}

interface ActivityItem {
  id: string;
  action: string;
  createdAt: string;
  metadata: string | null;
}

interface DashboardData {
  totalCompanies: number;
  totalLists: number;
  totalExports: number;
  recentActivity: ActivityItem[];
  empresasPorProvincia: ProvinciaItem[];
  topSectores: SectorItem[];
}

const ACTION_LABELS: Record<string, string> = {
  search: "🔍 Búsqueda",
  view_company: "👁 Vista empresa",
  export: "📥 Exportación",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => {
      if (r.status === 401) { window.location.href = "/auth/login"; return null; }
      return r.json();
    }).then(data => { if (data) setData(data); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        {loading ? (
          <div className="animate-pulse text-gray-500">Cargando...</div>
        ) : !data ? (
          <p className="text-red-500">Error cargando datos. <a href="/auth/login" className="underline">Iniciar sesión</a></p>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <p className="text-sm text-gray-500 mb-1">Empresas en base</p>
                <p className="text-4xl font-bold text-gray-900">{data.totalCompanies.toLocaleString("es-ES")}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <p className="text-sm text-gray-500 mb-1">Mis listas</p>
                <p className="text-4xl font-bold text-emerald-600">{data.totalLists}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <p className="text-sm text-gray-500 mb-1">Exportaciones totales</p>
                <p className="text-4xl font-bold text-blue-600">{data.totalExports}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Empresas por provincia chart */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Empresas por provincia</h2>
                {data.empresasPorProvincia.length > 0 ? (
                  <div className="space-y-3">
                    {data.empresasPorProvincia.map((p) => {
                      const maxCount = data.empresasPorProvincia[0].count;
                      const pct = Math.round((p.count / maxCount) * 100);
                      return (
                        <div key={p.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">{p.name}</span>
                            <span className="text-gray-500">{p.count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Sin datos</p>
                )}
              </div>

              {/* Top sectores */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sectores más representados</h2>
                {data.topSectores.length > 0 ? (
                  <div className="space-y-3">
                    {data.topSectores.map((s, i) => {
                      const maxCount = data.topSectores[0].count;
                      const pct = Math.round((s.count / maxCount) * 100);
                      const colors = ["bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
                      return (
                        <div key={s.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium truncate mr-2">{s.name}</span>
                            <span className="text-gray-500 shrink-0">{s.count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div className={`${colors[i % colors.length]} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Sin datos</p>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h2>
              {data.recentActivity?.length ? (
                <div className="space-y-3">
                  {data.recentActivity.map(a => {
                    let detail = "";
                    try {
                      const meta = a.metadata ? JSON.parse(a.metadata) : {};
                      if (meta.query) detail = `"${meta.query}"`;
                      if (meta.companyName) detail = meta.companyName;
                      if (meta.provincia) detail += ` · ${meta.provincia}`;
                    } catch {}
                    return (
                      <div key={a.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <div>
                          <span className="text-gray-800 font-medium">{ACTION_LABELS[a.action] || a.action}</span>
                          {detail && <span className="text-gray-500 ml-2">{detail}</span>}
                        </div>
                        <span className="text-gray-400 text-xs">{new Date(a.createdAt).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin actividad reciente</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
