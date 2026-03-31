"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

interface ListItem {
  id: string;
  name: string;
  createdAt: string;
  _count?: { companies: number };
}

export default function ListsPage() {
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch("/api/lists").then(r => r.json()).then(setLists).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const create = async () => {
    if (!newName.trim()) return;
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mis listas</h1>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">+ Nueva lista</button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la lista</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="ej: Pymes Barcelona Tech" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" onKeyDown={e => e.key === "Enter" && create()} />
              </div>
              <button onClick={create} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Crear</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse text-gray-500">Cargando listas...</div>
        ) : lists.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
            No tienes listas. Crea una para organizar tus leads.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map(l => (
              <div key={l.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{l.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{l._count?.companies || 0} empresas</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(l.createdAt).toLocaleDateString("es-ES")}</p>
                  </div>
                  <button onClick={() => remove(l.id)} className="text-gray-400 hover:text-red-500 text-sm">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
