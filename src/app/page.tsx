import Link from "next/link";

const features = [
  { icon: "📊", title: "Datos enriquecidos", desc: "Información completa de empresas: CIF, facturación, empleados, sector CNAE, tech stack, redes sociales y datos de contacto." },
  { icon: "🔍", title: "Filtros avanzados", desc: "Busca por provincia, sector, tamaño de empresa, facturación y más. Encuentra exactamente el perfil que necesitas." },
  { icon: "📋", title: "Listas personalizadas", desc: "Organiza tus leads en listas. Agrupa por campaña, territorio o cualquier criterio que necesites." },
  { icon: "📥", title: "Exportación CSV", desc: "Descarga tus resultados en CSV para importar en tu CRM, herramientas de email marketing o hojas de cálculo." },
];

const pricing = [
  { name: "Starter", price: "79", features: ["Hasta 500 empresas/mes", "Filtros básicos", "1 lista personalizada", "Exportación CSV", "Soporte email"] },
  { name: "Growth", price: "149", popular: true, features: ["Hasta 2.000 empresas/mes", "Todos los filtros", "Listas ilimitadas", "Exportación CSV", "Tech stack datos", "Soporte prioritario"] },
  { name: "Enterprise", price: "199", features: ["Empresas ilimitadas", "Todos los filtros", "Listas ilimitadas", "API access", "Datos enriquecidos premium", "Account manager dedicado"] },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📇</span>
            <span className="text-xl font-bold text-gray-900">OBX Leads</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">Funcionalidades</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">Precios</a>
            <Link href="/auth/login" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full mb-6">
            🇪🇸 Base de datos B2B de España
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            La base de datos B2B<br />de empresas españolas
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Accede a datos actualizados de miles de empresas españolas. Filtra por sector, ubicación, tamaño y más. Genera leads cualificados para tu equipo comercial.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login" className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
              Empieza gratis →
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">Sin tarjeta de crédito · Prueba gratuita de 14 días</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Todo lo que necesitas para generar leads B2B</h2>
            <p className="text-gray-600">Herramientas profesionales para equipos comerciales que quieren resultados.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Planes y precios</h2>
            <p className="text-gray-600">Elige el plan que se adapte a tu negocio.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map(p => (
              <div key={p.name} className={`rounded-xl border p-8 ${p.popular ? "border-emerald-500 ring-2 ring-emerald-100 relative bg-white shadow-lg" : "bg-white"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                    MÁS POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-gray-900">€{p.price}</span>
                  <span className="text-gray-500">/mes</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-500 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className={`block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${p.popular ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}>
                  Empezar ahora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📇</span>
              <span className="font-bold">OBX Leads</span>
            </div>
            <p className="text-sm text-gray-400">Un producto de <strong className="text-gray-300">OBX AI Studio</strong></p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white">Funcionalidades</a>
            <a href="#pricing" className="hover:text-white">Precios</a>
            <Link href="/auth/login" className="hover:text-white">Acceder</Link>
          </div>
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} OBX AI Studio. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
