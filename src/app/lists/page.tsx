"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/hooks/useUser";
import { getMaxLists } from "@/lib/plans";

interface ListItem {
  id: string;
  name: string;
  createdAt: string;
  _count?: { companies: number };
}

export default function ListsPage() {
  const { user } = useUser();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const plan = user?.plan || "starter";
  const maxLists = getMaxLists(plan);
  const atLimit = maxLists !== -1 && lists.length >= maxLists;

  const load = () => {
    fetch("/api/lists").then(r => r.json()).then(setLists).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

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
    if (!confirm("¿Eliminar esta lista?")) return;
    await fetch(`/api/lists/${id}`, { method: "DELETE" });
    setLoading(true);
    load();
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
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
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-5 mb-6">
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
          <div className="text-[#555] animate-pulse">Cargando listas...</div>
        ) : lists.length === 0 ? (
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-[#888]">No tienes listas. Crea una para organizar tus leads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map(l => (
              <div key={l.id} className="bg-[#181818] border border-[#222] rounded-2xl p-5 hover:border-[#333] transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[#f0f0f0] group-hover:text-[#00ff88] transition-colors">{l.name}</h3>
                    <p className="text-sm text-[#00ff88] mt-1 font-mono">{l._count?.companies || 0} empresas</p>
                    <p className="text-xs text-[#444] mt-2">{new Date(l.createdAt).toLocaleDateString("es-ES")}</p>
                  </div>
                  <button
                    onClick={() => remove(l.id)}
                    className="text-[#444] hover:text-red-400 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
