"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/hooks/useUser";
import { getMaxLists } from "@/lib/plans";

interface CompanyPreview {
  company: {
    id: string;
    name: string;
    city: string | null;
    provincia: string | null;
  };
}

interface ListItem {
  id: string;
  name: string;
  createdAt: string;
  _count?: { companies: number };
  companies?: CompanyPreview[];
}

export default function ListsPage() {
  const { user } = useUser();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const plan = user?.plan || "starter";
  const maxLists = getMaxLists(plan);
  const atLimit = maxLists !== -1 && lists.length >= maxLists;

  const load = async () => {
    try {
      const r = await fetch("/api/lists");
      const data = await r.json();
      if (!Array.isArray(data)) { setLists([]); return; }
      // Load preview companies for each list
      const enriched = await Promise.all(data.map(async (list: ListItem) => {
        try {
          const lr = await fetch(`/api/lists/${list.id}`);
          const detail = await lr.json();
          return { ...list, companies: (detail.companies || []).slice(0, 3) };
        } catch {
          return list;
        }
      }));
      setLists(enriched);
    } catch {
      setLists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim()) return;
    if (atLimit) return;
    await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    setShowForm(false);
    setLoading(true);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta lista? Se perderán todas las empresas asociadas.")) return;
    await fetch(`/api/lists/${id}`, { method: "DELETE" });
    setLoading(true);
    load();
  };

  const exportList = async (listId: string, listName: string) => {
    setExporting(listId);
    try {
      const r = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "list", listId }),
      });
      if (r.status === 403) { alert("Has alcanzado el límite de exportaciones de tu plan."); return; }
      if (!r.ok) { alert("Error al exportar"); return; }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${listName}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Error de conexión");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8 bg-grid">
        <div className="flex items-center justify-between mb-6 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f0]">Mis listas</h1>
            {maxLists !== -1 && (
              <p className="text-xs text-[#555] mt-1">{lists.length} / {maxLists} listas usadas</p>
            )}
          </div>
          {atLimit ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#888]">Límite alcanzado</span>
              <button className="px-4 py-2 bg-[#00ff88] text-[#0a0a0a] rounded-xl text-sm font-semibold hover:bg-[#00e07a] transition-colors">
                Upgrade →
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-[#00ff88] text-[#0a0a0a] rounded-xl text-sm font-semibold hover:bg-[#00e07a] transition-colors"
            >
              + Nueva lista
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-5 mb-6 animate-in">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#555] mb-1.5">Nombre de la lista</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="ej: Pymes Barcelona Tech"
                  className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88] placeholder:text-[#444] transition-colors"
                  onKeyDown={e => e.key === "Enter" && create()}
                />
              </div>
              <button
                onClick={create}
                className="px-6 py-2.5 bg-[#00ff88] text-[#0a0a0a] rounded-xl text-sm font-semibold hover:bg-[#00e07a] transition-colors"
              >
                Crear
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#181818] border border-[#222] rounded-2xl p-5">
                <div className="skeleton h-5 w-32 mb-3" />
                <div className="skeleton h-3 w-20 mb-4" />
                <div className="space-y-2 mb-4">
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-3/4" />
                </div>
                <div className="skeleton h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-12 text-center animate-in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-[#333] mx-auto mb-3">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h4" />
            </svg>
            <p className="text-[#888]">No tienes listas. Crea una para organizar tus leads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map(l => {
              const count = l._count?.companies || 0;
              const previews = l.companies || [];
              return (
                <div key={l.id} className="bg-[#181818] border border-[#222] rounded-2xl p-5 hover:border-[#333] transition-all group card-hover">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#f0f0f0] group-hover:text-[#00ff88] transition-colors truncate">{l.name}</h3>
                        <span className="text-xs bg-[#00ff88]/10 text-[#00ff88] px-2 py-0.5 rounded-full font-mono shrink-0">
                          {count}
                        </span>
                      </div>
                      <p className="text-xs text-[#444] mt-1">{new Date(l.createdAt).toLocaleDateString("es-ES")}</p>
                    </div>
                    <button
                      onClick={() => remove(l.id)}
                      className="text-[#444] hover:text-red-400 transition-colors p-1 shrink-0"
                      title="Eliminar lista"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>

                  {/* Company previews */}
                  {previews.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {previews.map((p) => (
                        <Link
                          key={p.company.id}
                          href={`/company/${p.company.id}`}
                          className="flex items-center gap-2 text-xs text-[#888] hover:text-[#00ff88] transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#333] shrink-0" />
                          <span className="truncate">{p.company.name}</span>
                          {p.company.city && <span className="text-[#444] shrink-0">· {p.company.city}</span>}
                        </Link>
                      ))}
                      {count > 3 && (
                        <p className="text-xs text-[#444] pl-3.5">+{count - 3} más</p>
                      )}
                    </div>
                  )}

                  {count === 0 && (
                    <p className="text-xs text-[#444] mb-3">Sin empresas aún</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-[#222]">
                    <Link
                      href={`/lists/${l.id}`}
                      className="flex-1 text-center px-3 py-1.5 text-xs border border-[#333] text-[#888] rounded-lg hover:text-white hover:border-[#555] transition-colors"
                    >
                      Ver lista
                    </Link>
                    <button
                      onClick={() => exportList(l.id, l.name)}
                      disabled={count === 0 || exporting === l.id}
                      className="flex-1 text-center px-3 py-1.5 text-xs border border-[#00ff88] text-[#00ff88] rounded-lg hover:bg-[#00ff88]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {exporting === l.id ? "Exportando..." : "📥 Exportar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
