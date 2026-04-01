import Link from "next/link";
import FaqItem from "./components/FaqItem";

const features = [
  { icon: "🔍", title: "Búsqueda avanzada", desc: "Filtra por provincia, sector CNAE, tamaño, facturación y más." },
  { icon: "📊", title: "Datos enriquecidos", desc: "CIF, dirección, empleados, facturación, web, email, teléfono, redes sociales." },
  { icon: "💻", title: "Tech stack", desc: "Detectamos las tecnologías que usa cada empresa (frameworks, CMS, cloud)." },
  { icon: "📋", title: "Listas personalizadas", desc: "Organiza tus leads en listas para campañas de outreach." },
  { icon: "📥", title: "Exportación CSV", desc: "Descarga tus búsquedas y listas en CSV listo para tu CRM." },
  { icon: "🔄", title: "Datos actualizados", desc: "Fuentes públicas verificadas, actualización continua desde BORME y Registro Mercantil." },
];

const plans = [
  {
    name: "Starter",
    price: "79",
    features: ["100 exports/mes", "5 listas", "Búsqueda básica", "Soporte email"],
    recommended: false,
  },
  {
    name: "Growth",
    price: "149",
    features: ["1.000 exports/mes", "Listas ilimitadas", "Filtros avanzados", "API access", "Soporte prioritario"],
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "199",
    features: ["Exports ilimitados", "Datos exclusivos", "Integraciones CRM", "Soporte dedicado", "SLA"],
    recommended: false,
  },
];

const faqs = [
  {
    q: "¿De dónde vienen los datos?",
    a: "Recopilamos información de fuentes públicas oficiales: BORME, Registro Mercantil, webs corporativas y bases de datos abiertas. Todo verificado y actualizado periódicamente.",
  },
  {
    q: "¿Los datos cumplen con GDPR?",
    a: "Sí. Solo trabajamos con datos de empresas (personas jurídicas) de acceso público. No recopilamos datos personales de individuos sin base legal.",
  },
  {
    q: "¿Puedo integrar OBX Leads con mi CRM?",
    a: "Sí. Puedes exportar en CSV compatible con cualquier CRM. Los planes Growth y Enterprise incluyen acceso API para integraciones directas.",
  },
  {
    q: "¿Con qué frecuencia se actualizan los datos?",
    a: "Los datos se actualizan de forma continua. Las fuentes oficiales (BORME, Registro Mercantil) se procesan en cuanto publican nuevos registros.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-[#060606] text-[#f0f0f0] min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#060606]/[0.92] backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📇</span>
            <span className="text-lg font-semibold">OBX <span className="text-[#00ff88]">Leads</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-8">
            <a href="#funciones" className="text-sm text-[#bbbbbb] hover:text-[#00ff88] transition-colors">Funciones</a>
            <a href="#precios" className="text-sm text-[#bbbbbb] hover:text-[#00ff88] transition-colors">Precios</a>
            <a href="#faq" className="text-sm text-[#bbbbbb] hover:text-[#00ff88] transition-colors">FAQ</a>
          </div>
          <Link
            href="/auth/login"
            className="px-4 sm:px-5 py-2 border border-[#00ff88] text-[#00ff88] rounded-md text-sm font-medium hover:bg-[#00ff88] hover:text-[#060606] transition-colors"
          >
            Acceder
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-2xl sm:text-[30.4px] font-light leading-snug mb-5">
            La base de datos <span className="text-[#00ff88]">B2B de empresas españolas</span>
          </h1>
          <p className="text-base sm:text-[17px] text-[#bbbbbb] leading-relaxed mb-8 sm:mb-9 max-w-[640px] mx-auto">
            Busca, filtra y exporta información de miles de empresas en España. Datos enriquecidos con tecnología, contactos y sector. Tu equipo comercial, potenciado.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-8 sm:px-9 py-3.5 bg-[#00ff88] text-[#060606] rounded-xl text-base font-semibold hover:bg-[#00e07a] transition-colors"
          >
            Empieza gratis →
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-b border-[#1a1a1a] px-4 sm:px-8 py-8 sm:py-10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "30K+", label: "empresas" },
            { value: "50", label: "provincias" },
            { value: "200+", label: "sectores CNAE" },
            { value: "CSV", label: "export" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-[28px] font-semibold text-[#00ff88]">{s.value}</p>
              <p className="text-xs sm:text-[13px] text-[#666666] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="funciones" className="px-4 sm:px-8 py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-[28.8px] font-semibold mb-3">
              Todo para tu equipo <span className="text-[#00ff88]">comercial</span>
            </h2>
            <p className="text-[#bbbbbb] text-base">Datos enriquecidos y herramientas para generar leads B2B cualificados.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[#181818] rounded-2xl p-7 sm:p-9 border border-[#181818] hover:border-[#00ff88]/30 transition-colors"
              >
                <span className="text-3xl block mb-4">{f.icon}</span>
                <h3 className="text-[17px] font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[#bbbbbb] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="px-4 sm:px-8 py-16 sm:py-24 border-t border-[#1a1a1a]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-[28.8px] font-semibold mb-3">
              Planes <span className="text-[#00ff88]">transparentes</span>
            </h2>
            <p className="text-[#bbbbbb] text-base">Sin compromiso. Cancela cuando quieras.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[960px] mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-[#0c0c0c] rounded-2xl p-7 sm:p-9 relative ${
                  plan.recommended ? "border border-[#00ff88] sm:col-span-2 lg:col-span-1" : "border border-[#181818]"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ff88] text-[#060606] text-[11px] font-bold px-3.5 py-1 rounded-full tracking-wide">
                    RECOMENDADO
                  </div>
                )}
                <h3 className="text-[15px] font-medium text-[#666666] mb-3">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className="text-sm text-[#666666]">/mes</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-[#bbbbbb]">
                      <span className="text-[#00ff88]">✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/login"
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                    plan.recommended
                      ? "bg-[#00ff88] text-[#060606] hover:bg-[#00e07a]"
                      : "border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-[#060606]"
                  }`}
                >
                  Empezar ahora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 sm:px-8 py-16 sm:py-24 border-t border-[#1a1a1a]">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-2xl sm:text-[28.8px] font-semibold text-center mb-12">
            Preguntas <span className="text-[#00ff88]">frecuentes</span>
          </h2>
          {faqs.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-8 py-16 sm:py-20 border-t border-[#1a1a1a] text-center">
        <h2 className="text-2xl sm:text-[28.8px] font-semibold mb-6">
          ¿Listo para encontrar tus <span className="text-[#00ff88]">próximos clientes</span>?
        </h2>
        <Link
          href="/auth/login"
          className="inline-block px-8 sm:px-9 py-3.5 bg-[#00ff88] text-[#060606] rounded-xl text-base font-semibold hover:bg-[#00e07a] transition-colors"
        >
          Empieza gratis →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-4 sm:px-8 py-8 sm:py-10 text-center">
        <p className="text-[13px] text-[#666666]">
          Un producto de <span className="text-[#bbbbbb]">OBX AI Studio</span> · © 2026
        </p>
        <div className="flex justify-center gap-6 mt-3">
          <a href="#funciones" className="text-[13px] text-[#666666] hover:text-[#bbbbbb]">Funciones</a>
          <a href="#precios" className="text-[13px] text-[#666666] hover:text-[#bbbbbb]">Precios</a>
          <Link href="/auth/login" className="text-[13px] text-[#666666] hover:text-[#bbbbbb]">Acceder</Link>
        </div>
      </footer>
    </div>
  );
}
