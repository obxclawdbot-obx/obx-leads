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

interface SimilarCompany {
  id: string;
  name: string;
  city: string | null;
  provincia: string | null;
  cnaeDescription: string | null;
  employees: number | null;
}

const TECH_COLORS = [
  "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20",
  "bg-[#00ccff]/10 text-[#00ccff] border-[#00ccff]/20",
  "bg-[#c084fc]/10 text-[#c084fc] border-[#c084fc]/20",
  "bg-[#ffd700]/10 text-[#ffd700] border-[#ffd700]/20",
  "bg-[#ff6b6b]/10 text-[#ff6b6b] border-[#ff6b6b]/20",
  "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20",
  "bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/20",
  "bg-[#fb923c]/10 text-[#fb923c] border-[#fb923c]/20",
];

export default function CompanyPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [showListMenu, setShowListMenu] = useState(false);
  const [addedMsg, setAddedMsg] = useState<string | null>(null);
  const [similar, setSimilar] = useState<SimilarCompany[]>([]);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  const plan = user?.plan || "starter";
  const fullInfo = canSeeFullInfo(plan);

  useEffect(() => {
    fetch(`/api/companies/${id}`).then(r => {
      if (r.status === 401) { window.location.href = "/auth/login"; return null; }
      return r.json();
    }).then(data => {
      if (data) {
        setCompany(data);
        // Load similar companies
        const params = new URLSearchParams();
        if (data.cnaeDescription) params.set("cnae", data.cnaeDescription);
        else if (data.provincia) params.set("provincia", data.provincia);
        params.set("limit", "6");
        fetch(`/api/companies?${params}`).then(r => r.json()).then(res => {
          const filtered = (res.companies || []).filter((c: SimilarCompany) => c.id !== data.id).slice(0, 5);
          setSimilar(filtered);
        }).catch(() => {});
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  // Load notes from localStorage
  useEffect(() => {
    if (id) {
      const saved = localStorage.getItem(`obx-notes-${id}`);
      if (saved) setNotes(saved);
    }
  }, [id]);

  const saveNotes = () => {
    localStorage.setItem(`obx-notes-${id}`, notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

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

  const exportCompany = async () => {
    const r = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyIds: [id] }),
    });
    if (r.status === 403) { alert("Límite de exportaciones alcanzado."); return; }
    if (!r.ok) return;
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${company?.name || "empresa"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8 bg-grid">
        <div className="skeleton h-4 w-32 mb-6" />
        <div className="bg-[#181818] border border-[#222] rounded-2xl p-6 mb-6">
          <div className="skeleton h-8 w-64 mb-2" /><div className="skeleton h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#181818] border border-[#222] rounded-2xl p-6">
              <div className="skeleton h-5 w-32 mb-4" />
              <div className="space-y-3"><div className="skeleton h-3 w-full" /><div className="skeleton h-3 w-3/4" /></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  if (!company) return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-8 bg-grid"><p className="text-red-400">Empresa no encontrada</p></main>
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
      <main className="flex-1 p-8 bg-grid">
        <Link href="/search" className="text-sm text-[#00ff88] hover:underline mb-4 inline-flex items-center gap-1 animate-in">
          ← Volver a búsqueda
        </Link>

        {/* Header card */}
        <div className="bg-[#181818] border border-[#222] rounded-2xl p-6 mb-6 animate-in">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#f0f0f0]">{company.name}</h1>
              <p className="text-sm text-[#555] mt-1">
                {company.legalForm && <span>{company.legalForm} · </span>}
                <span className="font-mono">CIF {company.cif}</span>
              </p>
            </div>
          </div>
          {addedMsg && (
            <div className="mt-3 px-3 py-2 bg-[#00ff88]/10 text-[#00ff88] text-sm rounded-lg">{addedMsg}</div>
          )}
          {company.description && <p className="text-sm text-[#888] mt-4 leading-relaxed">{company.description}</p>}
        </div>

        {/* Quick actions bar */}
        <div className="flex flex-wrap gap-2 mb-6 animate-in">
          <div className="relative">
            <button
              onClick={openListMenu}
              className="px-4 py-2.5 text-sm bg-[#00ff88] text-[#0a0a0a] rounded-xl font-semibold hover:bg-[#00e07a] transition-colors"
            >
              + Añadir a lista
            </button>
            {showListMenu && (
              <div className="absolute left-0 mt-1 w-56 bg-[#181818] border border-[#333] rounded-xl shadow-2xl z-10 overflow-hidden">
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
          <button
            onClick={exportCompany}
            className="px-4 py-2.5 text-sm border border-[#00ff88] text-[#00ff88] rounded-xl font-semibold hover:bg-[#00ff88]/10 transition-colors"
          >
            📥 Exportar CSV
          </button>
          {company.website && fullInfo && (
            <a
              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-sm border border-[#333] text-[#888] rounded-xl hover:text-white hover:border-[#555] transition-colors"
            >
              🌐 Visitar web
            </a>
          )}
          {company.linkedinUrl && fullInfo && (
            <a
              href={company.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-sm border border-[#333] text-[#888] rounded-xl hover:text-white hover:border-[#555] transition-colors"
            >
              💼 LinkedIn
            </a>
          )}
        </div>

        {/* Contact info card (highlighted) */}
        {fullInfo && (company.email || company.phone || company.website || company.linkedinUrl) && (
          <div className="bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-2xl p-6 mb-6">
            <h2 className="text-base font-semibold text-[#00ff88] mb-4">📞 Información de contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {company.email && (
                <div>
                  <p className="text-xs font-medium text-[#00ff88]/60 uppercase tracking-wider">Email</p>
                  <a href={`mailto:${company.email}`} className="text-sm text-[#f0f0f0] hover:text-[#00ff88] mt-0.5 block truncate">{company.email}</a>
                </div>
              )}
              {company.phone && (
                <div>
                  <p className="text-xs font-medium text-[#00ff88]/60 uppercase tracking-wider">Teléfono</p>
                  <a href={`tel:${company.phone}`} className="text-sm text-[#f0f0f0] hover:text-[#00ff88] mt-0.5 block">{company.phone}</a>
                </div>
              )}
              {company.website && (
                <div>
                  <p className="text-xs font-medium text-[#00ff88]/60 uppercase tracking-wider">Web</p>
                  <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#f0f0f0] hover:text-[#00ff88] mt-0.5 block truncate">{company.website}</a>
                </div>
              )}
              {company.linkedinUrl && (
                <div>
                  <p className="text-xs font-medium text-[#00ff88]/60 uppercase tracking-wider">LinkedIn</p>
                  <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#f0f0f0] hover:text-[#00ff88] mt-0.5 block truncate">Ver perfil</a>
                </div>
              )}
            </div>
          </div>
        )}

        {!fullInfo && (company.email || company.phone || company.linkedinUrl) && (
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-6 mb-6">
            <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">📞 Información de contacto</h2>
            <div className="space-y-4">
              {company.email && <LockedField label="Email" requiredPlan="Growth" />}
              {company.phone && <LockedField label="Teléfono" requiredPlan="Growth" />}
              {company.linkedinUrl && <LockedField label="LinkedIn" requiredPlan="Growth" />}
              <div className="bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl p-3 text-center mt-4">
                <p className="text-xs text-[#888] mb-2">Accede a email, teléfono y LinkedIn</p>
                <button className="text-xs bg-[#00ff88] text-[#0a0a0a] px-4 py-1.5 rounded-lg font-semibold hover:bg-[#00e07a] transition-colors">
                  Upgrade a Growth →
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in">
          {/* Datos generales */}
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

          {/* Ubicación */}
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

          {/* Tech Stack */}
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">💻 Tech Stack detectado</h2>
            {fullInfo ? (
              techStack.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {techStack.map((t: string, i: number) => (
                    <span key={t} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${TECH_COLORS[i % TECH_COLORS.length]}`}>{t}</span>
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

          {/* Notes */}
          <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#f0f0f0]">📝 Notas privadas</h2>
              {notesSaved && <span className="text-xs text-[#00ff88]">✓ Guardado</span>}
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Escribe notas sobre esta empresa... (se guardan en tu navegador)"
              className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00ff88] placeholder:text-[#444] transition-colors resize-none min-h-[120px]"
            />
            <button
              onClick={saveNotes}
              className="mt-3 px-4 py-2 text-sm bg-[#00ff88] text-[#0a0a0a] rounded-xl font-semibold hover:bg-[#00e07a] transition-colors"
            >
              Guardar notas
            </button>
          </div>
        </div>

        {/* Similar companies */}
        {similar.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">🏢 Empresas similares</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {similar.map(s => (
                <Link
                  key={s.id}
                  href={`/company/${s.id}`}
                  className="bg-[#181818] border border-[#222] rounded-2xl p-4 hover:border-[#333] hover:bg-[#1a1a1a] transition-all group card-hover"
                >
                  <h3 className="text-sm font-semibold text-[#f0f0f0] group-hover:text-[#00ff88] transition-colors truncate">{s.name}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-[#888]">
                    {s.city && <span>📍 {s.city}{s.provincia ? `, ${s.provincia}` : ""}</span>}
                    {s.employees && <span>{s.employees} emp.</span>}
                  </div>
                  {s.cnaeDescription && (
                    <p className="text-xs text-[#555] mt-1 truncate">🏢 {s.cnaeDescription}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
