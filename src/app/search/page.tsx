"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/hooks/useUser";
import { canUseAdvancedSearch } from "@/lib/plans";
import { PROVINCIAS, CNAE_SECTORS } from "@/lib/constants";

interface Company {
  id: string;
  cif: string;
  name: string;
  city: string | null;
  provincia: string | null;
  cnaeDescription: string | null;
  employees: number | null;
  revenue: number | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  techStack: string | null;
}

interface SearchResult {
  companies: Company[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-[#0a0a0a]"><Sidebar /><main className="flex-1 p-8"><div className="text-[#555] animate-pulse">Cargando...</div></main></div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    query: searchParams.get("q") || "",
    provincia: "",
    cnae: "",
    minEmployees: "",
    maxEmployees: "",
    minRevenue: "",
    maxRevenue: "",
  });

  const plan = user?.plan || "starter";
  const hasAdvanced = canUseAdvancedSearch(plan);

  const search = useCallback(async (p: number = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.provincia && hasAdvanced) params.set("provincia", filters.provincia);
    if (filters.cnae && hasAdvanced) params.set("cnae", filters.cnae);
    if (filters.minEmployees && hasAdvanced) params.set("minEmployees", filters.minEmployees);
    if (filters.maxEmployees && hasAdvanced) params.set("maxEmployees", filters.maxEmployees);
    if (filters.minRevenue && hasAdvanced) params.set("minRevenue", filters.minRevenue);
    if (filters.maxRevenue && hasAdvanced) params.set("maxRevenue", filters.maxRevenue);
    params.set("page", String(p));
    params.set("limit", "12");
    try {
      const r = await fetch(`/api/companies?${params}`);
      if (r.status === 401) { window.location.href = "/auth/login"; return; }
      const data = await r.json();
      setResult(data);
      setPage(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filters, hasAdvanced]);

  useEffect(() => { search(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exportCSV = async () => {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.provincia) params.set("provincia", filters.provincia);
    if (filters.cnae) params.set("cnae", filters.cnae);
    if (filters.minEmployees) params.set("minEmployees", filters.minEmployees);
    if (filters.maxEmployees) params.set("maxEmployees", filters.maxEmployees);
    const r = await fetch(`/api/export?${params}`);
    if (r.status === 401) { window.location.href = "/auth/login"; return; }
    if (r.status === 403) { alert("Has alcanzado el límite de exportaciones de tu plan."); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "empresas.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const companies = result?.companies || [];

  const LockedFilter = ({ label }: { label: string }) => (
    <div className="relative">
      <label className="block text-xs font-medium text-[#555] mb-1.5">{label}</label>
      <div className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 text-sm text-[#333] flex items-center justify-between">
        <span className="blur-[2px]">Seleccionar...</span>
        <span className="text-[10px] bg-[#00ff88]/10 text-[#00ff88] px-2 py-0.5 rounded-full font-medium shrink-0 ml-1">Growth</span>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Buscar empresas</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-3 py-1.5 text-sm border border-[#333] text-[#888] rounded-lg hover:text-white"
          >
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters panel */}
          <div className={`w-72 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-[#181818] border border-[#222] rounded-2xl p-5 sticky top-4 space-y-4">
              <h3 className="text-sm font-semibold text-[#f0f0f0] mb-2">Filtros</h3>

              {/* Text search - always available */}
              <div>
                <label className="block text-xs font-medium text-[#555] mb-1.5">Nombre o CIF</label>
                <input
                  value={filters.query}
                  onChange={e => setFilters({...filters, query: e.target.value})}
                  onKeyDown={e => e.key === "Enter" && search(1)}
                  placeholder="Buscar..."
                  className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88] placeholder:text-[#444] transition-colors"
                />
              </div>

              {/* Provincia - gated */}
              {hasAdvanced ? (
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-1.5">Provincia</label>
                  <select
                    value={filters.provincia}
                    onChange={e => setFilters({...filters, provincia: e.target.value})}
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88]"
                  >
                    <option value="">Todas</option>
                    {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              ) : (
                <LockedFilter label="Provincia" />
              )}

              {/* CNAE - gated */}
              {hasAdvanced ? (
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-1.5">Sector CNAE</label>
                  <select
                    value={filters.cnae}
                    onChange={e => setFilters({...filters, cnae: e.target.value})}
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88]"
                  >
                    <option value="">Todos</option>
                    {CNAE_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ) : (
                <LockedFilter label="Sector CNAE" />
              )}

              {/* Employees - gated */}
              {hasAdvanced ? (
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-1.5">Empleados</label>
                  <div className="flex gap-2">
                    <input
                      value={filters.minEmployees}
                      onChange={e => setFilters({...filters, minEmployees: e.target.value})}
                      placeholder="Min"
                      type="number"
                      className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88] placeholder:text-[#444]"
                    />
                    <input
                      value={filters.maxEmployees}
                      onChange={e => setFilters({...filters, maxEmployees: e.target.value})}
                      placeholder="Max"
                      type="number"
                      className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88] placeholder:text-[#444]"
                    />
                  </div>
                </div>
              ) : (
                <LockedFilter label="Empleados" />
              )}

              {/* Revenue - gated */}
              {hasAdvanced ? (
                <div>
                  <label className="block text-xs font-medium text-[#555] mb-1.5">Facturación (€)</label>
                  <div className="flex gap-2">
                    <input
                      value={filters.minRevenue}
                      onChange={e => setFilters({...filters, minRevenue: e.target.value})}
                      placeholder="Min"
                      type="number"
                      className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88] placeholder:text-[#444]"
                    />
                    <input
                      value={filters.maxRevenue}
                      onChange={e => setFilters({...filters, maxRevenue: e.target.value})}
                      placeholder="Max"
                      type="number"
                      className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88] placeholder:text-[#444]"
                    />
                  </div>
                </div>
              ) : (
                <LockedFilter label="Facturación" />
              )}

              <button
                onClick={() => search(1)}
                className="w-full px-4 py-2.5 bg-[#00ff88] text-[#0a0a0a] rounded-xl text-sm font-semibold hover:bg-[#00e07a] transition-colors"
              >
                Buscar
              </button>

              {!hasAdvanced && (
                <div className="bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-[#888] mb-2">Desbloquea filtros avanzados</p>
                  <button className="text-xs bg-[#00ff88] text-[#0a0a0a] px-4 py-1.5 rounded-lg font-semibold hover:bg-[#00e07a] transition-colors">
                    Upgrade a Growth →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-[#555] animate-pulse">Buscando empresas...</div>
            ) : companies.length === 0 ? (
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-12 text-center text-[#555]">
                No se encontraron empresas con esos criterios
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-[#555]">
                    {result!.total.toLocaleString("es-ES")} empresas · Página {result!.page} de {result!.pages}
                  </span>
                  <button
                    onClick={exportCSV}
                    className="px-4 py-2 text-sm border border-[#00ff88] text-[#00ff88] rounded-xl hover:bg-[#00ff88]/10 transition-colors"
                  >
                    📥 Exportar CSV
                  </button>
                </div>

                {/* Company cards */}
                <div className="space-y-3">
                  {companies.map(c => {
                    let techs: string[] = [];
                    try { techs = c.techStack ? JSON.parse(c.techStack) : []; } catch { /* ignore */ }

                    return (
                      <Link
                        key={c.id}
                        href={`/company/${c.id}`}
                        className="block bg-[#181818] border border-[#222] rounded-2xl p-5 hover:border-[#333] hover:bg-[#1a1a1a] transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[#f0f0f0] font-semibold group-hover:text-[#00ff88] transition-colors truncate">
                              {c.name}
                            </h3>
                            <p className="text-xs text-[#555] font-mono mt-0.5">{c.cif}</p>
                          </div>
                          {c.employees && (
                            <span className="text-xs bg-[#111] text-[#888] px-2 py-1 rounded-lg border border-[#222] shrink-0 ml-3">
                              {c.employees} emp.
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-[#888]">
                          {c.city && (
                            <span>📍 {c.city}{c.provincia ? `, ${c.provincia}` : ""}</span>
                          )}
                          {c.cnaeDescription && (
                            <span className="truncate max-w-[250px]">🏢 {c.cnaeDescription}</span>
                          )}
                          {c.revenue && (
                            <span>💰 {(c.revenue / 1e6).toFixed(1)}M €</span>
                          )}
                        </div>

                        {techs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {techs.slice(0, 5).map(t => (
                              <span key={t} className="text-[10px] bg-[#00ff88]/10 text-[#00ff88] px-2 py-0.5 rounded-full">
                                {t}
                              </span>
                            ))}
                            {techs.length > 5 && (
                              <span className="text-[10px] text-[#555] px-2 py-0.5">+{techs.length - 5}</span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {result!.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => search(page - 1)}
                      disabled={page <= 1}
                      className="px-3 py-1.5 text-sm rounded-lg border border-[#333] text-[#888] hover:bg-[#111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ←
                    </button>
                    {Array.from({ length: Math.min(result!.pages, 7) }, (_, i) => {
                      let p: number;
                      if (result!.pages <= 7) { p = i + 1; }
                      else if (page <= 4) { p = i + 1; }
                      else if (page >= result!.pages - 3) { p = result!.pages - 6 + i; }
                      else { p = page - 3 + i; }
                      return (
                        <button
                          key={p}
                          onClick={() => search(p)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            p === page
                              ? "bg-[#00ff88] text-[#0a0a0a] border-[#00ff88] font-semibold"
                              : "border-[#333] text-[#888] hover:bg-[#111]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => search(page + 1)}
                      disabled={page >= result!.pages}
                      className="px-3 py-1.5 text-sm rounded-lg border border-[#333] text-[#888] hover:bg-[#111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
