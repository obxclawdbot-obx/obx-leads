"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

interface Company {
  id: string;
  name: string;
  cif: string;
  city: string | null;
  provincia: string | null;
  cnaeDescription: string | null;
  employees: number | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

interface ListDetail {
  id: string;
  name: string;
  createdAt: string;
  companies: { company: Company; addedAt: string }[];
}

export default function ListDetailPage() {
  const { id } = useParams();
  const [list, setList] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lists/${id}`)
      .then(r => { if (r.status === 401) { window.location.href = "/auth/login"; return null; } return r.json(); })
      .then(data => { if (data) setList(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const removeCompany = async (companyId: string) => {
    await fetch(`/api/lists/${id}/companies`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });
    setList(prev => prev ? { ...prev, companies: prev.companies.filter(c => c.company.id !== companyId) } : null);
  };

  const exportList = async () => {
    const r = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "list", listId: id }),
    });
    if (r.status === 403) { alert("Límite de exportaciones alcanzado."); return; }
    if (!r.ok) return;
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${list?.name || "lista"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#0a0a0a]"><Sidebar /><main className="flex-1 p-8 bg-grid">
      <div className="skeleton h-4 w-32 mb-6" />
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="skeleton h-3 w-36 mb-6" />
      <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#181818] border border-[#222] rounded-2xl p-5">
          <div className="skeleton h-5 w-40 mb-2" /><div className="skeleton h-3 w-24 mb-3" /><div className="skeleton h-3 w-full" />
        </div>
      ))}</div>
    </main></div>
  );

  if (!list) return (
    <div className="flex min-h-screen bg-[#0a0a0a]"><Sidebar /><main className="flex-1 p-8 bg-grid"><p className="text-red-400">Lista no encontrada</p></main></div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8 bg-grid">
        <Link href="/lists" className="text-sm text-[#00ff88] hover:underline mb-4 inline-flex items-center gap-1 animate-in">
          ← Volver a listas
        </Link>

        <div className="flex items-center justify-between mb-6 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]">{list.name}</h1>
            <p className="text-xs text-[#555] mt-1">{list.companies.length} empresas · Creada el {new Date(list.createdAt).toLocaleDateString("es-ES")}</p>
          </div>
          <button
            onClick={exportList}
            disabled={list.companies.length === 0}
            className="px-4 py-2 text-sm border border-[#00ff88] text-[#00ff88] rounded-xl hover:bg-[#00ff88]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            📥 Exportar CSV
          </button>
        </div>

        {list.companies.length === 0 ? (
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-12 text-center animate-in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-[#333] mx-auto mb-3">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h4" />
            </svg>
            <p className="text-[#888]">Esta lista está vacía. Busca empresas y añádelas desde la búsqueda.</p>
            <Link href="/search" className="inline-block mt-4 px-4 py-2 bg-[#00ff88] text-[#0a0a0a] rounded-xl text-sm font-semibold hover:bg-[#00e07a] transition-colors">
              Buscar empresas →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.companies.map(({ company: c, addedAt }) => (
              <div key={c.id} className="bg-[#181818] border border-[#222] rounded-2xl p-5 hover:border-[#333] transition-all group card-hover flex items-start gap-4">
                <Link href={`/company/${c.id}`} className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-[#f0f0f0] font-semibold group-hover:text-[#00ff88] transition-colors truncate">{c.name}</h3>
                      <p className="text-xs text-[#555] font-mono mt-0.5">{c.cif}</p>
                    </div>
                    {c.employees && (
                      <span className="text-xs bg-[#111] text-[#888] px-2 py-1 rounded-lg border border-[#222] shrink-0 ml-3">{c.employees} emp.</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#888]">
                    {c.city && <span>📍 {c.city}{c.provincia ? `, ${c.provincia}` : ""}</span>}
                    {c.cnaeDescription && <span className="truncate max-w-[250px]">🏢 {c.cnaeDescription}</span>}
                  </div>
                  <p className="text-[10px] text-[#444] mt-2">Añadida {new Date(addedAt).toLocaleDateString("es-ES")}</p>
                </Link>
                <button
                  onClick={() => removeCompany(c.id)}
                  className="text-[#444] hover:text-red-400 transition-colors p-1 shrink-0"
                  title="Quitar de la lista"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
