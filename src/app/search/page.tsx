"use client";
import { useState } from "react";
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

export default function SearchPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({ query: "", provincia: "", cnae: "", minEmployees: "", maxEmployees: "" });

  const search = async () => {
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.provincia) params.set("provincia", filters.provincia);
    if (filters.cnae) params.set("cnae", filters.cnae);
    if (filters.minEmployees) params.set("minEmployees", filters.minEmployees);
    if (filters.maxEmployees) params.set("maxEmployees", filters.maxEmployees);
    try {
      const r = await fetch(`/api/companies?${params}`);
      const data = await r.json();
      setCompanies(Array.isArray(data) ? data : data.companies || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const exportCSV = async () => {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.provincia) params.set("provincia", filters.provincia);
    const r = await fetch(`/api/export?${params}`);
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "empresas.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Buscar empresas</h1>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre o CIF</label>
              <input value={filters.query} onChange={e => setFilters({...filters, query: e.target.value})} placeholder="Buscar..." className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" onKeyDown={e => e.key === "Enter" && search()} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Provincia</label>
              <select value={filters.provincia} onChange={e => setFilters({...filters, provincia: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white">
                <option value="">Todas</option>
                <option value="Barcelona">Barcelona</option>
                <option value="Madrid">Madrid</option>
                <option value="Valencia">Valencia</option>
                <option value="Sevilla">Sevilla</option>
                <option value="Bilbao">Bilbao</option>
                <option value="Málaga">Málaga</option>
                <option value="Zaragoza">Zaragoza</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sector (CNAE)</label>
              <input value={filters.cnae} onChange={e => setFilters({...filters, cnae: e.target.value})} placeholder="ej: consultoría" className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Empleados (min-max)</label>
              <div className="flex gap-1">
                <input value={filters.minEmployees} onChange={e => setFilters({...filters, minEmployees: e.target.value})} placeholder="5" className="w-full border rounded-lg px-2 py-2 text-sm text-gray-900" type="number" />
                <input value={filters.maxEmployees} onChange={e => setFilters({...filters, maxEmployees: e.target.value})} placeholder="200" className="w-full border rounded-lg px-2 py-2 text-sm text-gray-900" type="number" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={search} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors flex-1">Buscar</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse text-gray-500">Buscando empresas...</div>
        ) : !searched ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
            Usa los filtros para buscar empresas en la base de datos
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
            No se encontraron empresas con esos criterios
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">{companies.length} empresas encontradas</span>
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
                      <td className="px-4 py-3 text-sm text-gray-600">{c.city}, {c.provincia}</td>
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
          </>
        )}
      </main>
    </div>
  );
}
