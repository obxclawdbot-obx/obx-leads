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

export default function CompanyPage() {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${id}`).then(r => r.json()).then(setCompany).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 bg-gray-50"><div className="animate-pulse text-gray-500">Cargando...</div></main></div>;
  if (!company) return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 bg-gray-50"><p className="text-red-500">Empresa no encontrada</p></main></div>;

  const techStack = company.techStack ? JSON.parse(company.techStack) : [];

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
            {company.website && (
              <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">🌐 Web</a>
            )}
          </div>
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
              <Field label="LinkedIn" value={company.linkedinUrl} />
              <Field label="Twitter" value={company.twitterUrl} />
            </div>
          </div>

          {techStack.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tech Stack detectado</h2>
              <div className="flex flex-wrap gap-2">
                {techStack.map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
