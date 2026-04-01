#!/usr/bin/env node
/**
 * Seed script - Inserts 500+ realistic Spanish companies into the SQLite database.
 * Run: node scripts/seed-companies.mjs
 */
import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("dev.db");

// Clear existing companies
db.exec("DELETE FROM Company");

const now = new Date().toISOString();

const insert = db.prepare(`
  INSERT INTO Company (id, cif, name, legalForm, foundedYear, address, postalCode, city, provincia, ccaa, cnaeCode, cnaeDescription, employees, revenue, phone, email, website, linkedinUrl, twitterUrl, techStack, description, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// CNAE codes
const cnaes = [
  ["6201", "Actividades de programación informática"],
  ["6202", "Actividades de consultoría informática"],
  ["6209", "Otros servicios de tecnología de la información"],
  ["6311", "Proceso de datos, hosting y actividades relacionadas"],
  ["6312", "Portales web"],
  ["6399", "Otros servicios de información"],
  ["7022", "Otras actividades de consultoría de gestión empresarial"],
  ["7111", "Servicios técnicos de arquitectura"],
  ["7112", "Servicios técnicos de ingeniería"],
  ["7120", "Ensayos y análisis técnicos"],
  ["4321", "Instalaciones eléctricas"],
  ["4322", "Fontanería, instalaciones de sistemas de calefacción"],
  ["4329", "Otras instalaciones en obras de construcción"],
  ["4511", "Venta de automóviles y vehículos de motor ligeros"],
  ["4520", "Mantenimiento y reparación de vehículos"],
  ["4631", "Comercio al por mayor de frutas y hortalizas"],
  ["4639", "Comercio al por mayor no especializado de productos alimenticios"],
  ["4641", "Comercio al por mayor de textiles"],
  ["4646", "Comercio al por mayor de productos farmacéuticos"],
  ["4690", "Comercio al por mayor no especializado"],
  ["4711", "Comercio al por menor en establecimientos no especializados"],
  ["4719", "Otro comercio al por menor en establecimientos no especializados"],
  ["4741", "Comercio al por menor de ordenadores y software"],
  ["4751", "Comercio al por menor de textiles"],
  ["4771", "Comercio al por menor de prendas de vestir"],
  ["4778", "Otro comercio al por menor de artículos nuevos"],
  ["5510", "Hoteles y alojamientos similares"],
  ["5520", "Alojamientos turísticos y otros de corta estancia"],
  ["5610", "Restaurantes y puestos de comidas"],
  ["5621", "Provisión de comidas preparadas para eventos"],
  ["5630", "Establecimientos de bebidas"],
  ["6810", "Compraventa de bienes inmobiliarios por cuenta propia"],
  ["6820", "Alquiler de bienes inmobiliarios por cuenta propia"],
  ["6831", "Agentes de la propiedad inmobiliaria"],
  ["6910", "Actividades jurídicas"],
  ["6920", "Actividades de contabilidad, teneduría de libros y auditoría"],
  ["7010", "Actividades de las sedes centrales"],
  ["7021", "Actividades de relaciones públicas y comunicación"],
  ["7311", "Agencias de publicidad"],
  ["7312", "Servicios de representación de medios de comunicación"],
  ["7410", "Actividades de diseño especializado"],
  ["7490", "Otras actividades profesionales, científicas y técnicas"],
  ["8010", "Actividades de seguridad privada"],
  ["8020", "Servicios de sistemas de seguridad"],
  ["8110", "Servicios integrales a edificios e instalaciones"],
  ["8121", "Limpieza general de edificios"],
  ["8211", "Servicios administrativos combinados"],
  ["8219", "Actividades de fotocopiado y otras actividades de apoyo"],
  ["8220", "Actividades de los centros de llamadas"],
  ["8291", "Actividades de agencias de cobros y de información comercial"],
  ["8299", "Otras actividades de apoyo a las empresas"],
  ["8551", "Educación deportiva y recreativa"],
  ["8559", "Otra educación"],
  ["8610", "Actividades hospitalarias"],
  ["8621", "Actividades de medicina general"],
  ["8622", "Actividades de medicina especializada"],
  ["8690", "Otras actividades sanitarias"],
  ["8710", "Asistencia en establecimientos residenciales con cuidados sanitarios"],
  ["9311", "Gestión de instalaciones deportivas"],
  ["9312", "Actividades de los clubes deportivos"],
  ["9321", "Actividades de los parques de atracciones y los parques temáticos"],
  ["9329", "Otras actividades recreativas y de entretenimiento"],
  ["1011", "Procesado y conservación de carne"],
  ["1039", "Otro procesado y conservación de frutas y hortalizas"],
  ["1071", "Fabricación de pan y de productos frescos de panadería"],
  ["1089", "Elaboración de otros productos alimenticios"],
  ["1102", "Elaboración de vinos"],
  ["2041", "Fabricación de jabones, detergentes y productos de limpieza"],
  ["2059", "Fabricación de otros productos químicos"],
  ["2211", "Fabricación de neumáticos y cámaras de caucho"],
  ["2511", "Fabricación de estructuras metálicas"],
  ["2561", "Tratamiento y revestimiento de metales"],
  ["2611", "Fabricación de componentes electrónicos"],
  ["2712", "Fabricación de aparatos de distribución y control eléctrico"],
  ["2811", "Fabricación de motores y turbinas"],
  ["2892", "Fabricación de maquinaria para las industrias extractivas y de la construcción"],
  ["2932", "Fabricación de otros componentes para vehículos de motor"],
  ["3011", "Construcción de barcos y estructuras flotantes"],
  ["3109", "Fabricación de otros muebles"],
  ["4910", "Transporte interurbano de pasajeros por ferrocarril"],
  ["4941", "Transporte de mercancías por carretera"],
  ["5010", "Transporte marítimo de pasajeros"],
  ["5110", "Transporte aéreo de pasajeros"],
  ["5210", "Depósito y almacenamiento"],
  ["5224", "Manipulación de mercancías"],
  ["5229", "Otras actividades anexas al transporte"],
];

// Cities data: [city, provincia, ccaa, postalCodePrefix, streetNames]
const cities = [
  // Barcelona area - 160 companies
  ...Array(160).fill(["Barcelona", "Barcelona", "Cataluña", "08", ["Passeig de Gràcia", "Carrer de Balmes", "Avinguda Diagonal", "Carrer d'Aragó", "Rambla de Catalunya", "Gran Via de les Corts Catalanes", "Carrer de Pau Claris", "Carrer del Consell de Cent", "Carrer de Mallorca", "Carrer de València", "Carrer de Provença", "Passeig de Sant Joan", "Carrer de Roger de Llúria", "Via Laietana", "Carrer de Casp", "Carrer d'Aribau", "Carrer de Muntaner", "Carrer del Rosselló", "Avinguda de Sarrià", "Carrer de Córsega"]]),
  // Madrid area - 160 companies
  ...Array(160).fill(["Madrid", "Madrid", "Comunidad de Madrid", "28", ["Calle de Serrano", "Paseo de la Castellana", "Calle de Alcalá", "Gran Vía", "Calle de Velázquez", "Calle de Goya", "Calle de Príncipe de Vergara", "Paseo de Recoletos", "Calle de Génova", "Calle de Fuencarral", "Calle de Hortaleza", "Calle de Alberto Aguilera", "Calle de Bravo Murillo", "Calle de Arturo Soria", "Calle de Orense", "Paseo de la Habana", "Calle de José Abascal", "Avenida de América", "Calle de O'Donnell", "Calle de Narváez"]]),
  // Valencia - 55 companies
  ...Array(55).fill(["Valencia", "Valencia", "Comunitat Valenciana", "46", ["Calle de Colón", "Avenida del Puerto", "Gran Vía Marqués del Turia", "Calle de Xàtiva", "Calle de la Paz", "Avenida de Aragón", "Calle de Sorní", "Calle del Doctor Manuel Candela", "Calle de Cirilo Amorós", "Avenida de Blasco Ibáñez"]]),
  // Sevilla - 30 companies
  ...Array(30).fill(["Sevilla", "Sevilla", "Andalucía", "41", ["Avenida de la Constitución", "Calle Sierpes", "Calle Betis", "Calle Feria", "Avenida de Kansas City", "Calle San Fernando", "Calle Imagen", "Calle Resolana"]]),
  // Bilbao - 30 companies
  ...Array(30).fill(["Bilbao", "Bizkaia", "País Vasco", "48", ["Gran Vía de Don Diego López de Haro", "Alameda de Mazarredo", "Calle Ercilla", "Calle Henao", "Calle Colón de Larreátegui", "Alameda de Recalde", "Calle Iparraguirre", "Calle Rodríguez Arias"]]),
  // Málaga - 30 companies
  ...Array(30).fill(["Málaga", "Málaga", "Andalucía", "29", ["Calle Marqués de Larios", "Alameda Principal", "Paseo del Parque", "Avenida de Andalucía", "Calle Alcazabilla", "Calle Granada", "Calle Nueva", "Calle Compañía"]]),
  // Zaragoza - 25 companies
  ...Array(25).fill(["Zaragoza", "Zaragoza", "Aragón", "50", ["Paseo de la Independencia", "Calle de Alfonso I", "Gran Vía", "Paseo de Sagasta", "Calle del Coso", "Avenida de Goya", "Calle de San Miguel", "Calle del Temple"]]),
  // Alicante - 15 companies
  ...Array(15).fill(["Alicante", "Alicante", "Comunitat Valenciana", "03", ["Rambla de Méndez Núñez", "Avenida de Alfonso X el Sabio", "Calle de San Fernando", "Avenida de Maisonnave"]]),
  // Murcia - 10 companies
  ...Array(10).fill(["Murcia", "Murcia", "Región de Murcia", "30", ["Gran Vía Escultor Salzillo", "Avenida de la Constitución", "Calle Trapería"]]),
  // Palma de Mallorca - 10 companies
  ...Array(10).fill(["Palma de Mallorca", "Illes Balears", "Illes Balears", "07", ["Passeig del Born", "Avenida de Jaime III", "Calle de San Miguel"]]),
  // A Coruña - 10 companies
  ...Array(10).fill(["A Coruña", "A Coruña", "Galicia", "15", ["Calle Real", "Avenida de la Marina", "Calle de San Andrés"]]),
  // Valladolid - 10 companies
  ...Array(10).fill(["Valladolid", "Valladolid", "Castilla y León", "47", ["Calle de Santiago", "Paseo de Zorrilla", "Calle de la Constitución"]]),
  // San Sebastián - 10 companies  
  ...Array(10).fill(["San Sebastián", "Gipuzkoa", "País Vasco", "20", ["Avenida de la Libertad", "Boulevard", "Calle de San Martín"]]),
];

const legalForms = ["S.L.", "S.A.", "S.L.U.", "S.A.U.", "S. Coop.", "S.L.P."];
const techStacks = [
  '["WordPress","PHP","MySQL","Google Analytics"]',
  '["React","Node.js","PostgreSQL","AWS"]',
  '["Angular","TypeScript",".NET","Azure"]',
  '["Vue.js","Python","Django","Google Cloud"]',
  '["WordPress","WooCommerce","PHP","MySQL"]',
  '["Shopify","JavaScript","Cloudflare"]',
  '["PrestaShop","PHP","MySQL","OVH"]',
  '["Next.js","React","Vercel","PostgreSQL"]',
  '["Laravel","PHP","MySQL","DigitalOcean"]',
  '["Magento","PHP","MySQL","AWS"]',
  '["Drupal","PHP","MySQL","Acquia"]',
  '["Joomla","PHP","MySQL","Hetzner"]',
  '["Wix","JavaScript"]',
  '["Squarespace","JavaScript"]',
  '["Custom HTML/CSS","jQuery","Apache"]',
  '["Java","Spring Boot","Oracle","AWS"]',
  '["Python","Flask","PostgreSQL","Heroku"]',
  '["Ruby on Rails","PostgreSQL","Heroku"]',
  '["ASP.NET","C#","SQL Server","Azure"]',
  '["Nuxt.js","Vue.js","Node.js","AWS"]',
  null, null, null, // some companies without detected tech
];

// Company name parts
const prefixes = ["Grupo", "Corporación", "Industrias", "Servicios", "Soluciones", "Proyectos", "Tecnología", "", "", "", "", "", "", "", ""];
const companyWords = [
  "Ibérica", "Mediterránea", "Atlántica", "Hispana", "Levantina", "Cantábrica", "Pirenaica",
  "Nexus", "Vertex", "Prisma", "Nova", "Ápex", "Sigma", "Delta", "Alfa", "Omega", "Zeta",
  "Global", "Digital", "Smart", "Prime", "First", "Net", "Tech", "Pro", "Max", "Plus",
  "Innova", "Avanza", "Impulsa", "Conecta", "Crea", "Transforma", "Gestiona", "Optimiza",
  "Sol", "Mar", "Luz", "Río", "Monte", "Valle", "Sierra", "Costa", "Tierra", "Cielo",
];
const suffixes = [
  "Solutions", "Consulting", "Services", "Systems", "Group", "Partners", "Labs", "Hub",
  "Ingeniería", "Tecnología", "Desarrollo", "Gestión", "Logística", "Comunicación",
  "Asesores", "Consultores", "Profesionales", "Expertos", "Especialistas",
  "", "", "", "", "", "", "", "", "", "",
];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateCIF() {
  const letters = "ABCDEFGHJKLMNPQRSUVW";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = String(randomInt(1000000, 99999999)).padStart(8, "0");
  return letter + num;
}

function generateCompanyName() {
  const prefix = pick(prefixes);
  const word1 = pick(companyWords);
  let word2 = pick(companyWords);
  while (word2 === word1) word2 = pick(companyWords);
  const suffix = pick(suffixes);
  
  const parts = [prefix, word1, word2, suffix].filter(Boolean);
  // Sometimes use shorter names
  if (Math.random() > 0.6) parts.splice(2, 1);
  return parts.join(" ");
}

function generatePhone(prefix) {
  return `9${prefix[0]}${randomInt(1, 9)} ${randomInt(100, 999)} ${randomInt(100, 999)}`;
}

function generateEmail(name, domain) {
  const clean = name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 2)
    .join("");
  return `info@${clean || "empresa"}.${domain}`;
}

function generateWebsite(name) {
  const clean = name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 2)
    .join("");
  const tlds = [".es", ".com", ".com.es", ".net"];
  return `https://www.${clean || "empresa"}${pick(tlds)}`;
}

const usedCIFs = new Set();
const usedNames = new Set();

const insertMany = db.transaction((companies) => {
  for (const c of companies) {
    insert.run(
      c.id, c.cif, c.name, c.legalForm, c.foundedYear,
      c.address, c.postalCode, c.city, c.provincia, c.ccaa,
      c.cnaeCode, c.cnaeDescription, c.employees, c.revenue,
      c.phone, c.email, c.website, c.linkedinUrl, c.twitterUrl,
      c.techStack, c.description, now, now
    );
  }
});

const companies = [];

for (let i = 0; i < cities.length; i++) {
  const [city, provincia, ccaa, postalPrefix, streets] = cities[i];
  
  let cif;
  do { cif = generateCIF(); } while (usedCIFs.has(cif));
  usedCIFs.add(cif);
  
  let name;
  do { name = generateCompanyName(); } while (usedNames.has(name));
  usedNames.add(name);
  
  const legalForm = pick(legalForms);
  const fullName = `${name}, ${legalForm}`;
  const [cnaeCode, cnaeDescription] = pick(cnaes);
  
  const street = pick(streets);
  const num = randomInt(1, 200);
  const floor = Math.random() > 0.4 ? `, ${randomInt(1, 8)}º ${randomInt(1, 4)}ª` : "";
  const address = `${street}, ${num}${floor}`;
  const postalCode = `${postalPrefix}${String(randomInt(1, 99)).padStart(3, "0")}`;
  
  // Company size distribution: 50% small, 30% medium, 15% large, 5% very large
  const sizeRoll = Math.random();
  let employees, revenue;
  if (sizeRoll < 0.50) { employees = randomInt(1, 15); revenue = randomInt(50000, 500000); }
  else if (sizeRoll < 0.80) { employees = randomInt(16, 80); revenue = randomInt(500000, 3000000); }
  else if (sizeRoll < 0.95) { employees = randomInt(81, 300); revenue = randomInt(3000000, 15000000); }
  else { employees = randomInt(301, 2000); revenue = randomInt(15000000, 100000000); }
  
  const phone = generatePhone(postalPrefix);
  const website = generateWebsite(name);
  const email = generateEmail(name, website.replace("https://www.", ""));
  const foundedYear = randomInt(1960, 2024);
  
  const techStack = pick(techStacks);
  const linkedinUrl = Math.random() > 0.3 ? `https://linkedin.com/company/${name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}` : null;
  const twitterUrl = Math.random() > 0.6 ? `https://twitter.com/${name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15)}` : null;
  
  companies.push({
    id: randomUUID(),
    cif,
    name: fullName,
    legalForm,
    foundedYear,
    address,
    postalCode,
    city,
    provincia,
    ccaa,
    cnaeCode,
    cnaeDescription,
    employees,
    revenue,
    phone,
    email,
    website,
    linkedinUrl,
    twitterUrl,
    techStack,
    description: `${fullName} es una empresa con sede en ${city} dedicada a ${cnaeDescription.toLowerCase()}.`,
    createdAt: now,
    updatedAt: now,
  });
}

insertMany(companies);

console.log(`✅ Inserted ${companies.length} companies`);

// Stats
const stats = db.prepare("SELECT provincia, COUNT(*) as count FROM Company GROUP BY provincia ORDER BY count DESC").all();
console.log("\nDistribution by province:");
for (const s of stats) {
  console.log(`  ${s.provincia}: ${s.count}`);
}

const sectorStats = db.prepare("SELECT cnaeDescription, COUNT(*) as count FROM Company GROUP BY cnaeDescription ORDER BY count DESC LIMIT 10").all();
console.log("\nTop 10 sectors:");
for (const s of sectorStats) {
  console.log(`  ${s.cnaeDescription}: ${s.count}`);
}

db.close();
