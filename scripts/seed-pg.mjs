#!/usr/bin/env node
/**
 * Seed PostgreSQL with 555 Spanish companies via Prisma Client
 * Run: node scripts/seed-pg.mjs
 */
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const cnaes = [
  ["6201","Actividades de programación informática"],["6202","Actividades de consultoría informática"],
  ["6209","Otros servicios de tecnología de la información"],["6311","Proceso de datos, hosting"],
  ["6312","Portales web"],["7022","Consultoría de gestión empresarial"],
  ["7111","Servicios técnicos de arquitectura"],["7112","Servicios técnicos de ingeniería"],
  ["4321","Instalaciones eléctricas"],["4511","Venta de automóviles"],
  ["4631","Comercio al por mayor de frutas"],["4690","Comercio al por mayor no especializado"],
  ["4711","Comercio al por menor no especializado"],["4741","Comercio de ordenadores y software"],
  ["4771","Comercio de prendas de vestir"],["5510","Hoteles y alojamientos"],
  ["5610","Restaurantes y puestos de comidas"],["5630","Establecimientos de bebidas"],
  ["6810","Compraventa de bienes inmobiliarios"],["6831","Agentes inmobiliarios"],
  ["6910","Actividades jurídicas"],["6920","Contabilidad y auditoría"],
  ["7311","Agencias de publicidad"],["7410","Actividades de diseño"],
  ["8010","Actividades de seguridad privada"],["8110","Servicios integrales a edificios"],
  ["8211","Servicios administrativos"],["8559","Otra educación"],
  ["8610","Actividades hospitalarias"],["8690","Otras actividades sanitarias"],
  ["9311","Gestión de instalaciones deportivas"],["1071","Fabricación de pan"],
  ["1102","Elaboración de vinos"],["2511","Fabricación de estructuras metálicas"],
  ["4941","Transporte de mercancías por carretera"],["5210","Depósito y almacenamiento"],
];

const cityData = [
  { city: "Barcelona", provincia: "Barcelona", ccaa: "Cataluña", cp: "08", count: 160 },
  { city: "Madrid", provincia: "Madrid", ccaa: "Comunidad de Madrid", cp: "28", count: 160 },
  { city: "Valencia", provincia: "Valencia", ccaa: "Comunitat Valenciana", cp: "46", count: 55 },
  { city: "Sevilla", provincia: "Sevilla", ccaa: "Andalucía", cp: "41", count: 30 },
  { city: "Bilbao", provincia: "Bizkaia", ccaa: "País Vasco", cp: "48", count: 30 },
  { city: "Málaga", provincia: "Málaga", ccaa: "Andalucía", cp: "29", count: 30 },
  { city: "Zaragoza", provincia: "Zaragoza", ccaa: "Aragón", cp: "50", count: 25 },
  { city: "Alicante", provincia: "Alicante", ccaa: "Comunitat Valenciana", cp: "03", count: 15 },
  { city: "Murcia", provincia: "Murcia", ccaa: "Región de Murcia", cp: "30", count: 10 },
  { city: "Palma", provincia: "Illes Balears", ccaa: "Illes Balears", cp: "07", count: 10 },
  { city: "A Coruña", provincia: "A Coruña", ccaa: "Galicia", cp: "15", count: 10 },
  { city: "Valladolid", provincia: "Valladolid", ccaa: "Castilla y León", cp: "47", count: 10 },
  { city: "San Sebastián", provincia: "Gipuzkoa", ccaa: "País Vasco", cp: "20", count: 10 },
];

const streets = {
  Barcelona: ["Passeig de Gràcia","Carrer de Balmes","Avinguda Diagonal","Carrer d'Aragó","Rambla de Catalunya","Gran Via de les Corts Catalanes"],
  Madrid: ["Calle de Serrano","Paseo de la Castellana","Calle de Alcalá","Gran Vía","Calle de Velázquez","Calle de Goya"],
  Valencia: ["Calle de Colón","Gran Vía Marqués del Turia","Avenida del Puerto","Calle de la Paz"],
  Sevilla: ["Avenida de la Constitución","Calle Sierpes","Calle Betis","Calle Feria"],
  Bilbao: ["Gran Vía de Don Diego López de Haro","Alameda de Mazarredo","Calle Ercilla"],
  Málaga: ["Calle Marqués de Larios","Alameda Principal","Paseo del Parque"],
  Zaragoza: ["Paseo de la Independencia","Calle de Alfonso I","Gran Vía"],
  Alicante: ["Rambla de Méndez Núñez","Avenida de Alfonso X el Sabio"],
  Murcia: ["Gran Vía Escultor Salzillo","Avenida de la Constitución"],
  Palma: ["Passeig del Born","Avenida de Jaime III"],
  "A Coruña": ["Calle Real","Avenida de la Marina"],
  Valladolid: ["Calle de Santiago","Paseo de Zorrilla"],
  "San Sebastián": ["Avenida de la Libertad","Boulevard"],
};

const legalForms = ["S.L.","S.A.","S.L.U.","S.A.U.","S. Coop."];
const techStacks = [
  '["WordPress","PHP","MySQL","Google Analytics"]','["React","Node.js","PostgreSQL","AWS"]',
  '["Angular","TypeScript",".NET","Azure"]','["Vue.js","Python","Django","Google Cloud"]',
  '["Shopify","JavaScript","Cloudflare"]','["PrestaShop","PHP","MySQL","OVH"]',
  '["Next.js","React","Vercel"]','["Laravel","PHP","MySQL"]',
  '["Wix","JavaScript"]','["Custom HTML/CSS","jQuery","Apache"]',
  '["Java","Spring Boot","Oracle","AWS"]',null,null,null,
];
const words = ["Nexus","Vertex","Prisma","Nova","Ápex","Sigma","Delta","Alfa","Omega","Ibérica","Mediterránea","Global","Digital","Smart","Prime","Innova","Avanza","Conecta","Sol","Mar","Tech","Pro","Net","Hub","Labs"];
const suffixes = ["Solutions","Consulting","Services","Systems","Group","Ingeniería","Tecnología","Desarrollo","Gestión","","","",""];

const ri = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = a => a[Math.floor(Math.random()*a.length)];
const usedCifs = new Set();
const usedNames = new Set();

function genCIF() {
  const L = "ABCDEFGHJKLMNPQRSUVW";
  let c; do { c = L[ri(0,L.length-1)] + String(ri(10000000,99999999)); } while(usedCifs.has(c));
  usedCifs.add(c); return c;
}
function genName() {
  let n; do {
    const w1 = pick(words), w2 = pick(words.filter(w=>w!==w1)), s = pick(suffixes);
    n = [w1,w2,s].filter(Boolean).join(" ");
  } while(usedNames.has(n));
  usedNames.add(n); return n;
}

async function main() {
  await prisma.company.deleteMany();
  console.log("Cleared companies");

  const companies = [];
  for (const cd of cityData) {
    const cityStreets = streets[cd.city] || ["Calle Mayor"];
    for (let i = 0; i < cd.count; i++) {
      const name = genName();
      const lf = pick(legalForms);
      const [cnaeCode, cnaeDesc] = pick(cnaes);
      const sizeRoll = Math.random();
      let empl, rev;
      if (sizeRoll<0.5){empl=ri(1,15);rev=ri(50000,500000);}
      else if(sizeRoll<0.8){empl=ri(16,80);rev=ri(500000,3000000);}
      else if(sizeRoll<0.95){empl=ri(81,300);rev=ri(3000000,15000000);}
      else{empl=ri(301,2000);rev=ri(15000000,100000000);}
      
      const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"").slice(0,15);
      
      companies.push({
        cif: genCIF(),
        name: `${name}, ${lf}`,
        legalForm: lf,
        foundedYear: ri(1960,2024),
        address: `${pick(cityStreets)}, ${ri(1,200)}`,
        postalCode: `${cd.cp}${String(ri(1,99)).padStart(3,"0")}`,
        city: cd.city,
        provincia: cd.provincia,
        ccaa: cd.ccaa,
        cnaeCode, cnaeDescription: cnaeDesc,
        employees: empl, revenue: rev,
        phone: `9${cd.cp[0]}${ri(1,9)} ${ri(100,999)} ${ri(100,999)}`,
        email: `info@${slug}.es`,
        website: `https://www.${slug}.es`,
        linkedinUrl: Math.random()>0.3 ? `https://linkedin.com/company/${slug}` : null,
        twitterUrl: Math.random()>0.6 ? `https://twitter.com/${slug}` : null,
        techStack: pick(techStacks),
        description: `${name}, ${lf} es una empresa con sede en ${cd.city} dedicada a ${cnaeDesc.toLowerCase()}.`,
      });
    }
  }

  // Batch insert
  let inserted = 0;
  const batch = 50;
  for (let i = 0; i < companies.length; i += batch) {
    const chunk = companies.slice(i, i + batch);
    await prisma.company.createMany({ data: chunk });
    inserted += chunk.length;
    process.stdout.write(`\r  Inserted ${inserted}/${companies.length}`);
  }
  
  console.log(`\n✅ Total: ${inserted} companies`);
  
  const stats = await prisma.$queryRawUnsafe('SELECT provincia, COUNT(*)::int as count FROM "Company" GROUP BY provincia ORDER BY count DESC');
  console.log("\nBy province:");
  for (const s of stats) console.log(`  ${s.provincia}: ${s.count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
