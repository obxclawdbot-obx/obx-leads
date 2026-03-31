"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

interface DashboardData {
  totalCompanies: number;
  totalLists: number;
  totalExports: number;
  recentActivity: { id: string; action: string; createdAt: string; metadata: string | null }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        {loading ? (
          <div className="animate-pulse text-gray-500">Cargando...</div>
        ) : !data ? (
          <p className="text-red-500">Error. <a href="/auth/login" className="underline">Iniciar sesión</a></p>
        ) : (
          <>
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
                <p className="text-sm text-gray-500 mb-1">Exportaciones</p>
                <p className="text-4xl font-bold text-blue-600">{data.totalExports}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h2>
              {data.recentActivity?.length ? (
                <div className="space-y-3">
                  {data.recentActivity.map(a => (
                    <div key={a.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{a.action}</span>
                      <span className="text-gray-400">{new Date(a.createdAt).toLocaleDateString("es-ES")}</span>
                    </div>
                  ))}
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
