"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

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

const BADGE_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-emerald-100 text-emerald-800",
  "bg-purple-100 text-purple-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-cyan-100 text-cyan-800",
  "bg-indigo-100 text-indigo-800",
  "bg-orange-100 text-orange-800",
  "bg-teal-100 text-teal-800",
  "bg-pink-100 text-pink-800",
];

export default function CompanyPage() {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [showListMenu, setShowListMenu] = useState(false);
  const [addedMsg, setAddedMsg] = useState<string | null>(null);

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

  if (loading) return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 bg-gray-50"><div className="animate-pulse text-gray-500">Cargando...</div></main></div>;
  if (!company) return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 bg-gray-50"><p className="text-red-500">Empresa no encontrada</p></main></div>;

  let techStack: string[] = [];
  try { techStack = company.techStack ? JSON.parse(company.techStack) : []; } catch { techStack = []; }

  const Field = ({ label, value }: { label: string; value: string | number | null | undefined }) => value ? (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value}</p>
    </div>
  ) : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <Link href="/search" className="text-sm text-emerald-600 hover:underline mb-4 inline-block">← Volver a búsqueda</Link>
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{company.legalForm} · CIF {company.cif}</p>
            </div>
            <div className="flex gap-2 items-start">
              {/* Añadir a lista dropdown */}
              <div className="relative">
                <button onClick={openListMenu} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  📋 Añadir a lista
                </button>
                {showListMenu && (
                  <div className="absolute right-0 mt-1 w-56 bg-white border rounded-lg shadow-lg z-10">
                    {lists.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">
                        No tienes listas. <Link href="/lists" className="text-emerald-600 underline">Crear una</Link>
                      </div>
                    ) : (
                      lists.map(l => (
                        <button
                          key={l.id}
                          onClick={() => addToList(l.id, l.name)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          {l.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {company.website && (
                <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900">🌐 Web</a>
              )}
            </div>
          </div>
          {addedMsg && (
            <div className="mt-3 px-3 py-2 bg-emerald-50 text-emerald-700 text-sm rounded-lg">{addedMsg}</div>
          )}
          {company.description && <p className="text-sm text-gray-700 mt-4">{company.description}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos generales</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sector CNAE" value={company.cnaeCode ? `${company.cnaeCode} — ${company.cnaeDescription}` : company.cnaeDescription} />
              <Field label="Empleados" value={company.employees} />
              <Field label="Facturación" value={company.revenue ? `${(company.revenue / 1e6).toFixed(1)}M €` : null} />
              <Field label="Fundada" value={company.foundedYear} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Dirección" value={company.address} />
              <Field label="Código postal" value={company.postalCode} />
              <Field label="Ciudad" value={company.city} />
              <Field label="Provincia" value={company.provincia} />
              <Field label="CCAA" value={company.ccaa} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h2>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Email" value={company.email} />
              <Field label="Teléfono" value={company.phone} />
              {company.linkedinUrl && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">LinkedIn</p>
                  <a href={company.linkedinUrl} target="_blank" className="text-sm text-blue-600 hover:underline mt-0.5 block">{company.linkedinUrl}</a>
                </div>
              )}
              {company.twitterUrl && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Twitter</p>
                  <a href={company.twitterUrl} target="_blank" className="text-sm text-blue-600 hover:underline mt-0.5 block">{company.twitterUrl}</a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tech Stack detectado</h2>
            {techStack.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {techStack.map((t: string, i: number) => (
                  <span key={t} className={`px-3 py-1 rounded-full text-sm font-medium ${BADGE_COLORS[i % BADGE_COLORS.length]}`}>{t}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sin datos de tech stack</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
