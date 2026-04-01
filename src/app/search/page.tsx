"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

interface Company {
  id: string;
  cif: string;
  name: string;
  city: string | null;
  provincia: string | null;
  cnaeDescription: string | null;
  employees: number | null;
  website: string | null;
  phone: string | null;
  email: string | null;
}

interface SearchResult {
  companies: Company[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function SearchPage() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ query: "", provincia: "", cnae: "", minEmployees: "", maxEmployees: "" });

  const search = useCallback(async (p: number = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.provincia) params.set("provincia", filters.provincia);
    if (filters.cnae) params.set("cnae", filters.cnae);
    if (filters.minEmployees) params.set("minEmployees", filters.minEmployees);
    if (filters.maxEmployees) params.set("maxEmployees", filters.maxEmployees);
    params.set("page", String(p));
    params.set("limit", "10");
    try {
      const r = await fetch(`/api/companies?${params}`);
      if (r.status === 401) {
        window.location.href = "/auth/login";
        return;
      }
      const data = await r.json();
      setResult(data);
      setPage(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    search(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exportCSV = async () => {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.provincia) params.set("provincia", filters.provincia);
    if (filters.cnae) params.set("cnae", filters.cnae);
    if (filters.minEmployees) params.set("minEmployees", filters.minEmployees);
    if (filters.maxEmployees) params.set("maxEmployees", filters.maxEmployees);
    const r = await fetch(`/api/export?${params}`);
    if (r.status === 401) { window.location.href = "/auth/login"; return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "empresas.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const companies = result?.companies || [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Buscar empresas</h1>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre o CIF</label>
              <input value={filters.query} onChange={e => setFilters({...filters, query: e.target.value})} placeholder="Buscar..." className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" onKeyDown={e => e.key === "Enter" && search(1)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Provincia</label>
              <select value={filters.provincia} onChange={e => setFilters({...filters, provincia: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white">
                <option value="">Todas</option>
                <option value="Barcelona">Barcelona</option>
                <option value="Madrid">Madrid</option>
                <option value="Valencia">Valencia</option>
                <option value="Sevilla">Sevilla</option>
                <option value="Vizcaya">Vizcaya</option>
                <option value="Málaga">Málaga</option>
                <option value="Zaragoza">Zaragoza</option>
                <option value="Alicante">Alicante</option>
                <option value="Murcia">Murcia</option>
                <option value="A Coruña">A Coruña</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sector (CNAE)</label>
              <input value={filters.cnae} onChange={e => setFilters({...filters, cnae: e.target.value})} placeholder="ej: consultoría" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" onKeyDown={e => e.key === "Enter" && search(1)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Empleados (min-max)</label>
              <div className="flex gap-1">
                <input value={filters.minEmployees} onChange={e => setFilters({...filters, minEmployees: e.target.value})} placeholder="5" className="w-full border rounded-lg px-2 py-2 text-sm text-gray-900" type="number" />
                <input value={filters.maxEmployees} onChange={e => setFilters({...filters, maxEmployees: e.target.value})} placeholder="200" className="w-full border rounded-lg px-2 py-2 text-sm text-gray-900" type="number" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={() => search(1)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors flex-1">Buscar</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse text-gray-500">Buscando empresas...</div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
            No se encontraron empresas con esos criterios
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">{result!.total} empresas encontradas · Página {result!.page} de {result!.pages}</span>
              <button onClick={exportCSV} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">📥 Exportar CSV</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Empresa</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">CIF</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ciudad</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sector</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Empleados</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {companies.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/company/${c.id}`} className="text-sm font-medium text-emerald-700 hover:underline">{c.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{c.cif}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.city}{c.provincia ? `, ${c.provincia}` : ''}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{c.cnaeDescription || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.employees || "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        {c.email && <span className="text-gray-600">{c.email}</span>}
                        {c.phone && <span className="text-gray-400 ml-2">{c.phone}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {result!.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => search(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                {Array.from({ length: Math.min(result!.pages, 7) }, (_, i) => {
                  let p: number;
                  if (result!.pages <= 7) {
                    p = i + 1;
                  } else if (page <= 4) {
                    p = i + 1;
                  } else if (page >= result!.pages - 3) {
                    p = result!.pages - 6 + i;
                  } else {
                    p = page - 3 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => search(p)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        p === page ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => search(page + 1)}
                  disabled={page >= result!.pages}
                  className="px-3 py-1.5 text-sm rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
