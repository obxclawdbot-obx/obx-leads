#!/usr/bin/env node
import "dotenv/config";
import pg from "pg";
const { Client } = pg;

const url = process.env.DIRECT_URL;
if (!url) { console.error("DIRECT_URL not set"); process.exit(1); }

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log("Connected to Supabase PostgreSQL");

// Clear
await client.query('DELETE FROM "Company"');
console.log("Cleared companies");

const cnaes = [
  ["6201","Programación informática"],["6202","Consultoría informática"],
  ["6209","Servicios de TI"],["6311","Hosting y datos"],["6312","Portales web"],
  ["7022","Consultoría empresarial"],["7111","Arquitectura"],["7112","Ingeniería"],
  ["4321","Instalaciones eléctricas"],["4511","Venta de automóviles"],
  ["4631","Comercio frutas"],["4690","Comercio al por mayor"],
  ["4711","Comercio al por menor"],["4741","Comercio de ordenadores"],
  ["5510","Hoteles"],["5610","Restaurantes"],["5630","Bares"],
  ["6810","Inmobiliaria"],["6910","Actividades jurídicas"],["6920","Contabilidad"],
  ["7311","Publicidad"],["7410","Diseño"],["8010","Seguridad privada"],
  ["8110","Servicios a edificios"],["8559","Educación"],["8610","Hospitales"],
  ["9311","Instalaciones deportivas"],["1071","Panadería"],["1102","Vinos"],
  ["2511","Estructuras metálicas"],["4941","Transporte mercancías"],["5210","Almacenamiento"],
];
const cityData = [
  {city:"Barcelona",prov:"Barcelona",ccaa:"Cataluña",cp:"08",n:160},
  {city:"Madrid",prov:"Madrid",ccaa:"Comunidad de Madrid",cp:"28",n:160},
  {city:"Valencia",prov:"Valencia",ccaa:"Comunitat Valenciana",cp:"46",n:55},
  {city:"Sevilla",prov:"Sevilla",ccaa:"Andalucía",cp:"41",n:30},
  {city:"Bilbao",prov:"Bizkaia",ccaa:"País Vasco",cp:"48",n:30},
  {city:"Málaga",prov:"Málaga",ccaa:"Andalucía",cp:"29",n:30},
  {city:"Zaragoza",prov:"Zaragoza",ccaa:"Aragón",cp:"50",n:25},
  {city:"Alicante",prov:"Alicante",ccaa:"Comunitat Valenciana",cp:"03",n:15},
  {city:"Murcia",prov:"Murcia",ccaa:"Región de Murcia",cp:"30",n:10},
  {city:"Palma",prov:"Illes Balears",ccaa:"Illes Balears",cp:"07",n:10},
  {city:"A Coruña",prov:"A Coruña",ccaa:"Galicia",cp:"15",n:10},
  {city:"Valladolid",prov:"Valladolid",ccaa:"Castilla y León",cp:"47",n:10},
  {city:"San Sebastián",prov:"Gipuzkoa",ccaa:"País Vasco",cp:"20",n:10},
];
const streetMap = {
  Barcelona:["Passeig de Gràcia","Carrer de Balmes","Avinguda Diagonal","Carrer d Aragó","Rambla de Catalunya","Gran Via"],
  Madrid:["Calle Serrano","Paseo de la Castellana","Calle Alcalá","Gran Vía","Calle Velázquez","Calle Goya"],
  Valencia:["Calle Colón","Gran Vía Marqués del Turia","Av del Puerto","Calle de la Paz"],
  Sevilla:["Av de la Constitución","Calle Sierpes","Calle Betis"],
  Bilbao:["Gran Vía","Alameda Mazarredo","Calle Ercilla"],
  Málaga:["Calle Marqués de Larios","Alameda Principal"],
  Zaragoza:["Paseo Independencia","Calle Alfonso I"],
  Alicante:["Rambla Méndez Núñez"],Murcia:["Gran Vía Salzillo"],
  Palma:["Passeig del Born"],"A Coruña":["Calle Real"],
  Valladolid:["Calle Santiago"],"San Sebastián":["Av de la Libertad"],
};
const legalForms = ["S.L.","S.A.","S.L.U.","S.A.U."];
const techStacks = ['["WordPress","PHP","MySQL"]','["React","Node.js","AWS"]','["Angular",".NET","Azure"]','["Vue.js","Python","GCP"]','["Shopify","Cloudflare"]','["Next.js","Vercel"]','["Laravel","PHP"]','["Wix"]',null,null,null];
const words = ["Nexus","Vertex","Nova","Apex","Sigma","Delta","Alfa","Omega","Iberica","Mediterranea","Global","Digital","Smart","Prime","Innova","Avanza","Conecta","Sol","Mar","Tech","Pro","Net","Hub","Labs","Crea","Impulsa","Costa","Monte","Valle"];
const suffixes = ["Solutions","Consulting","Services","Systems","Group","Ingenieria","Tecnologia","Desarrollo","Gestion","","",""];

const ri = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = a => a[Math.floor(Math.random()*a.length)];
const usedC = new Set(), usedN = new Set();
function genCIF(){const L="ABCDEFGHJKLMNPQRSUVW";let c;do{c=L[ri(0,L.length-1)]+String(ri(10000000,99999999));}while(usedC.has(c));usedC.add(c);return c;}
function genName(){let n;do{const w1=pick(words),w2=pick(words.filter(x=>x!==w1)),s=pick(suffixes);n=[w1,w2,s].filter(Boolean).join(" ");}while(usedN.has(n));usedN.add(n);return n;}

const now = new Date().toISOString();
let inserted = 0;

for (const cd of cityData) {
  const st = streetMap[cd.city] || ["Calle Mayor"];
  for (let i = 0; i < cd.n; i++) {
    const name = genName(); const legal = pick(legalForms);
    const [code,desc] = pick(cnaes);
    const sr = Math.random();
    let emp,rev;
    if(sr<0.5){emp=ri(1,15);rev=ri(50000,500000);}
    else if(sr<0.8){emp=ri(16,80);rev=ri(500000,3000000);}
    else if(sr<0.95){emp=ri(81,300);rev=ri(3000000,15000000);}
    else{emp=ri(301,2000);rev=ri(15000000,100000000);}
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,15);
    
    await client.query(
      `INSERT INTO "Company" (id,cif,name,"legalForm","foundedYear",address,"postalCode",city,provincia,ccaa,"cnaeCode","cnaeDescription",employees,revenue,phone,email,website,"linkedinUrl","twitterUrl","techStack",description,"createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
      [
        crypto.randomUUID(), genCIF(), `${name}, ${legal}`, legal, ri(1960,2024),
        `${pick(st)}, ${ri(1,200)}`, `${cd.cp}${String(ri(1,99)).padStart(3,"0")}`,
        cd.city, cd.prov, cd.ccaa, code, desc, emp, rev,
        `9${cd.cp[0]}${ri(1,9)} ${ri(100,999)} ${ri(100,999)}`,
        `info@${slug}.es`, `https://www.${slug}.es`,
        Math.random()>0.3?`https://linkedin.com/company/${slug}`:null,
        Math.random()>0.6?`https://twitter.com/${slug}`:null,
        pick(techStacks),
        `${name}, ${legal} — empresa en ${cd.city}, ${desc.toLowerCase()}.`,
        now, now,
      ]
    );
    inserted++;
    if (inserted % 50 === 0) process.stdout.write(`\r  ${inserted}/555`);
  }
}

console.log(`\n✅ ${inserted} companies seeded in Supabase PostgreSQL`);

const res = await client.query('SELECT provincia, COUNT(*)::int as count FROM "Company" GROUP BY provincia ORDER BY count DESC');
console.log("\nBy province:");
for (const r of res.rows) console.log(`  ${r.provincia}: ${r.count}`);

await client.end();
