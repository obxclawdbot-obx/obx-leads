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

const SECTOR_COLORS: Record<string, string> = {
  "Tecnología": "#00ff88",
  "Comercio": "#00ccff",
  "Industria": "#f97316",
  "Servicios": "#c084fc",
  "Construcción": "#ffd700",
  "Hostelería": "#ff6b6b",
  "Transporte": "#22c55e",
  "Educación": "#3b82f6",
  "Sanidad": "#ef4444",
  "default": "#444444",
};

function getSectorColor(sector: string | null): string {
  if (!sector) return SECTOR_COLORS.default;
  for (const key of Object.keys(SECTOR_COLORS)) {
    if (sector.toLowerCase().includes(key.toLowerCase())) return SECTOR_COLORS[key];
  }
  // Hash-based color fallback
  let hash = 0;
  for (let i = 0; i < sector.length; i++) hash = sector.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#00ff88", "#00ccff", "#f97316", "#c084fc", "#ffd700", "#ff6b6b"];
  return colors[Math.abs(hash) % colors.length];
}

function SkeletonCompanyCards() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#181818] border border-[#222] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-2 flex-1">
              <div className="skeleton h-5 w-48" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton h-6 w-16 rounded-lg" />
          </div>
          <div className="flex gap-4 mt-3">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-[#0a0a0a]"><Sidebar /><main className="flex-1 p-8 bg-grid"><div className="skeleton h-7 w-40 mb-6" /><div className="flex gap-6"><div className="w-72"><div className="bg-[#181818] border border-[#222] rounded-2xl p-5 space-y-4"><div className="skeleton h-4 w-16 mb-2" /><div className="skeleton h-9 w-full rounded-xl" /><div className="skeleton h-9 w-full rounded-xl" /><div className="skeleton h-9 w-full rounded-xl" /></div></div><div className="flex-1"><SkeletonCompanyCards /></div></div></main></div>}>
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
  const [pageSize, setPageSize] = useState(12);
  const [showFilters, setShowFilters] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
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

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
    params.set("limit", String(pageSize));
    try {
      const r = await fetch(`/api/companies?${params}`);
      if (r.status === 401) { window.location.href = "/auth/login"; return; }
      const data = await r.json();
      setResult(data);
      setPage(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filters, hasAdvanced, pageSize]);

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

  const FilterSection = ({ title, id, children }: { title: string; id: string; children: React.ReactNode }) => (
    <div>
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center justify-between w-full text-xs font-semibold text-[#888] uppercase tracking-wider mb-2 hover:text-[#f0f0f0] transition-colors"
      >
        {title}
        <span className="text-[#555] transition-transform text-[10px]" style={{ transform: collapsedSections[id] ? "rotate(-90deg)" : "none" }}>▼</span>
      </button>
      {!collapsedSections[id] && children}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8 bg-grid">
        <div className="flex items-center justify-between mb-6 animate-in">
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Buscar empresas</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-3 py-1.5 text-sm border border-[#333] text-[#888] rounded-lg hover:text-white transition-colors"
          >
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters panel */}
          <div className={`w-72 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-[#181818] border border-[#222] rounded-2xl p-5 sticky top-4 space-y-5 animate-in">
              <h3 className="text-sm font-semibold text-[#f0f0f0]">Filtros</h3>

              <FilterSection title="Búsqueda" id="search">
                <input
                  value={filters.query}
                  onChange={e => setFilters({...filters, query: e.target.value})}
                  onKeyDown={e => e.key === "Enter" && search(1)}
                  placeholder="Nombre o CIF..."
                  className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88] placeholder:text-[#444] transition-colors"
                />
              </FilterSection>

              <FilterSection title="Ubicación" id="location">
                {hasAdvanced ? (
                  <select
                    value={filters.provincia}
                    onChange={e => setFilters({...filters, provincia: e.target.value})}
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88]"
                  >
                    <option value="">Todas las provincias</option>
                    {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : (
                  <LockedFilter label="Provincia" />
                )}
              </FilterSection>

              <FilterSection title="Sector" id="sector">
                {hasAdvanced ? (
                  <select
                    value={filters.cnae}
                    onChange={e => setFilters({...filters, cnae: e.target.value})}
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ff88]"
                  >
                    <option value="">Todos los sectores</option>
                    {CNAE_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <LockedFilter label="Sector CNAE" />
                )}
              </FilterSection>

              <FilterSection title="Tamaño" id="size">
                {hasAdvanced ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[#555] mb-1">Empleados</label>
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
                    <div>
                      <label className="block text-xs text-[#555] mb-1">Facturación (€)</label>
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
                  </div>
                ) : (
                  <div className="space-y-3">
                    <LockedFilter label="Empleados" />
                    <LockedFilter label="Facturación" />
                  </div>
                )}
              </FilterSection>

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
              <SkeletonCompanyCards />
            ) : companies.length === 0 ? (
              <div className="bg-[#181818] border border-[#222] rounded-2xl p-12 text-center animate-in">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-[#333] mx-auto mb-3">
                  <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10 10l4 4"/>
                </svg>
                <p className="text-[#888] mb-1">No se encontraron empresas.</p>
                <p className="text-xs text-[#555]">Prueba con otros criterios de búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 animate-in">
                  <span className="text-sm text-[#555]">
                    {result!.total.toLocaleString("es-ES")} empresas · Página {result!.page} de {result!.pages}
                  </span>
                  <div className="flex items-center gap-3">
                    <select
                      value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); }}
                      className="bg-[#111] border border-[#333] text-[#888] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#00ff88]"
                    >
                      <option value={12}>12 / página</option>
                      <option value={24}>24 / página</option>
                      <option value={48}>48 / página</option>
                    </select>
                    <button
                      onClick={exportCSV}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-[#00ff88] text-[#00ff88] rounded-xl hover:bg-[#00ff88]/10 transition-colors"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <path d="M8 1v10M4 7l4 4 4-4"/><path d="M2 12v2h12v-2"/>
                      </svg>
                      Exportar CSV
                    </button>
                  </div>
                </div>

                {/* Company cards */}
                <div className="space-y-3 animate-in-delay-1">
                  {companies.map(c => {
                    let techs: string[] = [];
                    try { techs = c.techStack ? JSON.parse(c.techStack) : []; } catch { /* ignore */ }
                    const sectorColor = getSectorColor(c.cnaeDescription);

                    return (
                      <Link
                        key={c.id}
                        href={`/company/${c.id}`}
                        className="block bg-[#181818] border border-[#222] rounded-2xl p-5 hover:border-[#333] hover:bg-[#1a1a1a] transition-all group card-hover"
                        style={{ borderLeftColor: sectorColor, borderLeftWidth: "3px" }}
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
                            <span className="flex items-center gap-1">
                              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                                <circle cx="8" cy="6" r="3"/><path d="M8 9c0 3-5 5-5 5h10s-5-2-5-5z"/>
                              </svg>
                              {c.city}{c.provincia ? `, ${c.provincia}` : ""}
                            </span>
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
