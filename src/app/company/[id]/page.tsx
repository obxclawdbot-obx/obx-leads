"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/hooks/useUser";
import { canSeeFullInfo } from "@/lib/plans";
import { LockedField } from "@/components/UpgradeCTA";

interface Company {
  id: string;
  cif: string;
  name: string;
  legalForm: string | null;
  foundedYear: number | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  provincia: string | null;
  ccaa: string | null;
  cnaeCode: string | null;
  cnaeDescription: string | null;
  employees: number | null;
  revenue: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  techStack: string | null;
  description: string | null;
}

interface ListItem {
  id: string;
  name: string;
}

const TECH_COLORS = [
  "bg-[#00ff88]/10 text-[#00ff88]",
  "bg-[#00ccff]/10 text-[#00ccff]",
  "bg-[#c084fc]/10 text-[#c084fc]",
  "bg-[#ffd700]/10 text-[#ffd700]",
  "bg-[#ff6b6b]/10 text-[#ff6b6b]",
  "bg-[#34d399]/10 text-[#34d399]",
  "bg-[#60a5fa]/10 text-[#60a5fa]",
  "bg-[#fb923c]/10 text-[#fb923c]",
];

export default function CompanyPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [showListMenu, setShowListMenu] = useState(false);
  const [addedMsg, setAddedMsg] = useState<string | null>(null);

  const plan = user?.plan || "starter";
  const fullInfo = canSeeFullInfo(plan);

  useEffect(() => {
    fetch(`/api/companies/${id}`).then(r => {
      if (r.status === 401) { window.location.href = "/auth/login"; return null; }
      return r.json();
    }).then(data => { if (data) setCompany(data); }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const openListMenu = async () => {
    if (showListMenu) { setShowListMenu(false); return; }
    try {
      const r = await fetch("/api/lists");
      const data = await r.json();
      setLists(Array.isArray(data) ? data : []);
    } catch { setLists([]); }
    setShowListMenu(true);
  };

  const addToList = async (listId: string, listName: string) => {
    try {
      const r = await fetch(`/api/lists/${listId}/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: id }),
      });
      if (r.ok) {
        setAddedMsg(`Añadida a "${listName}"`);
      } else {
        const data = await r.json();
        setAddedMsg(data.error || "Error");
      }
    } catch {
      setAddedMsg("Error de conexión");
    }
    setShowListMenu(false);
    setTimeout(() => setAddedMsg(null), 3000);
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8"><div className="text-[#555] animate-pulse">Cargando...</div></main>
    </div>
  );

  if (!company) return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8"><p className="text-red-400">Empresa no encontrada</p></main>
    </div>
  );

  let techStack: string[] = [];
  try { techStack = company.techStack ? JSON.parse(company.techStack) : []; } catch { techStack = []; }

  const Field = ({ label, value }: { label: string; value: string | number | null | undefined }) => value ? (
    <div>
      <p className="text-xs font-medium text-[#555] uppercase tracking-wider">{label}</p>
      <p className="text-sm text-[#ccc] mt-0.5">{value}</p>
    </div>
  ) : null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8">
        <Link href="/search" className="text-sm text-[#00ff88] hover:underline mb-4 inline-flex items-center gap-1">
          ← Volver a búsqueda
        </Link>

        {/* Header card */}
        <div className="bg-[#181818] border border-[#222] rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#f0f0f0]">{company.name}</h1>
              <p className="text-sm text-[#555] mt-1">
                {company.legalForm && <span>{company.legalForm} · </span>}
                <span className="font-mono">CIF {company.cif}</span>
              </p>
            </div>
            <div className="flex gap-2 items-start shrink-0 ml-4">
              <div className="relative">
                <button
                  onClick={openListMenu}
                  className="px-4 py-2 text-sm bg-[#00ff88] text-[#0a0a0a] rounded-xl font-semibold hover:bg-[#00e07a] transition-colors"
                >
                  + Lista
                </button>
                {showListMenu && (
                  <div className="absolute right-0 mt-1 w-56 bg-[#181818] border border-[#333] rounded-xl shadow-2xl z-10 overflow-hidden">
                    {lists.length === 0 ? (
                      <div className="p-3 text-sm text-[#555]">
                        Sin listas. <Link href="/lists" className="text-[#00ff88] underline">Crear una</Link>
                      </div>
                    ) : (
                      lists.map(l => (
                        <button
                          key={l.id}
                          onClick={() => addToList(l.id, l.name)}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#ccc] hover:bg-[#222] border-b border-[#222] last:border-b-0 transition-colors"
                        >
                          {l.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {company.website && fullInfo && (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  className="px-4 py-2 text-sm border border-[#333] text-[#888] rounded-xl hover:text-white hover:border-[#555] transition-colors"
                >
                  🌐 Web
                </a>
              )}
            </div>
          </div>
          {addedMsg && (
            <div className="mt-3 px-3 py-2 bg-[#00ff88]/10 text-[#00ff88] text-sm rounded-lg">{addedMsg}</div>
          )}
          {company.description && <p className="text-sm text-[#888] mt-4 leading-relaxed">{company.description}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos generales - always visible */}
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Datos generales</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sector CNAE" value={company.cnaeCode ? `${company.cnaeCode} — ${company.cnaeDescription}` : company.cnaeDescription} />
              <Field label="Empleados" value={company.employees} />
              {fullInfo ? (
                <Field label="Facturación" value={company.revenue ? `${(company.revenue / 1e6).toFixed(1)}M €` : null} />
              ) : company.revenue ? (
                <LockedField label="Facturación" requiredPlan="Growth" />
              ) : null}
              <Field label="Fundada" value={company.foundedYear} />
            </div>
          </div>

          {/* Ubicación - always visible */}
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Ubicación</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ciudad" value={company.city} />
              <Field label="Provincia" value={company.provincia} />
              <Field label="CCAA" value={company.ccaa} />
              {fullInfo ? (
                <>
                  <Field label="Dirección" value={company.address} />
                  <Field label="Código postal" value={company.postalCode} />
                </>
              ) : (
                <>
                  {company.address && <LockedField label="Dirección" requiredPlan="Growth" />}
                  {company.postalCode && <LockedField label="Código postal" requiredPlan="Growth" />}
                </>
              )}
            </div>
          </div>

          {/* Contacto - gated */}
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Contacto</h2>
            {fullInfo ? (
              <div className="grid grid-cols-1 gap-4">
                <Field label="Email" value={company.email} />
                <Field label="Teléfono" value={company.phone} />
                {company.linkedinUrl && (
                  <div>
                    <p className="text-xs font-medium text-[#555] uppercase tracking-wider">LinkedIn</p>
                    <a href={company.linkedinUrl} target="_blank" className="text-sm text-[#00ff88] hover:underline mt-0.5 block truncate">{company.linkedinUrl}</a>
                  </div>
                )}
                {company.twitterUrl && (
                  <div>
                    <p className="text-xs font-medium text-[#555] uppercase tracking-wider">Twitter</p>
                    <a href={company.twitterUrl} target="_blank" className="text-sm text-[#00ff88] hover:underline mt-0.5 block truncate">{company.twitterUrl}</a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {company.email && <LockedField label="Email" requiredPlan="Growth" />}
                {company.phone && <LockedField label="Teléfono" requiredPlan="Growth" />}
                {company.linkedinUrl && <LockedField label="LinkedIn" requiredPlan="Growth" />}
                {!company.email && !company.phone && !company.linkedinUrl && (
                  <p className="text-sm text-[#555]">Sin datos de contacto</p>
                )}
                <div className="bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl p-3 text-center mt-4">
                  <p className="text-xs text-[#888] mb-2">Accede a email, teléfono y LinkedIn</p>
                  <button className="text-xs bg-[#00ff88] text-[#0a0a0a] px-4 py-1.5 rounded-lg font-semibold hover:bg-[#00e07a] transition-colors">
                    Upgrade a Growth →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tech Stack - gated */}
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Tech Stack detectado</h2>
            {fullInfo ? (
              techStack.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {techStack.map((t: string, i: number) => (
                    <span key={t} className={`px-3 py-1.5 rounded-full text-sm font-medium ${TECH_COLORS[i % TECH_COLORS.length]}`}>{t}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#555]">Sin datos de tech stack</p>
              )
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 blur-[4px] select-none pointer-events-none">
                  <span className="px-3 py-1.5 rounded-full text-sm bg-[#00ff88]/10 text-[#00ff88]">React</span>
                  <span className="px-3 py-1.5 rounded-full text-sm bg-[#00ccff]/10 text-[#00ccff]">Node.js</span>
                  <span className="px-3 py-1.5 rounded-full text-sm bg-[#c084fc]/10 text-[#c084fc]">AWS</span>
                </div>
                <div className="bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl p-3 text-center mt-4">
                  <p className="text-xs text-[#888] mb-2">Tech stack disponible en Growth</p>
                  <button className="text-xs bg-[#00ff88] text-[#0a0a0a] px-4 py-1.5 rounded-lg font-semibold hover:bg-[#00e07a] transition-colors">
                    Upgrade →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
