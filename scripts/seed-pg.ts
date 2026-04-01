import "dotenv/config";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connStr = process.env.DIRECT_URL;
if (!connStr) throw new Error("DIRECT_URL not set");
console.log("Connecting to:", connStr.substring(0, 40) + "...");
const pool = new Pool({ connectionString: connStr });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

const cnaes: [string,string][] = [
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

const streetMap: Record<string,string[]> = {
  Barcelona:["Passeig de Gràcia","Carrer de Balmes","Avinguda Diagonal","Carrer d'Aragó","Rambla de Catalunya","Gran Via"],
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
const words = ["Nexus","Vertex","Nova","Ápex","Sigma","Delta","Alfa","Omega","Ibérica","Mediterránea","Global","Digital","Smart","Prime","Innova","Avanza","Conecta","Sol","Mar","Tech","Pro","Net","Hub","Labs","Crea","Impulsa","Costa","Monte","Valle"];
const suffixes = ["Solutions","Consulting","Services","Systems","Group","Ingeniería","Tecnología","Desarrollo","Gestión","","",""];

const ri = (a:number,b:number) => Math.floor(Math.random()*(b-a+1))+a;
const pick = <T>(a:T[]):T => a[Math.floor(Math.random()*a.length)];
const usedC = new Set<string>(), usedN = new Set<string>();

function genCIF(){const L="ABCDEFGHJKLMNPQRSUVW";let c:string;do{c=L[ri(0,L.length-1)]+String(ri(10000000,99999999));}while(usedC.has(c));usedC.add(c);return c;}
function genName(){let n:string;do{const w1=pick(words),w2=pick(words.filter(x=>x!==w1)),s=pick(suffixes);n=[w1,w2,s].filter(Boolean).join(" ");}while(usedN.has(n));usedN.add(n);return n;}

async function main() {
  await prisma.company.deleteMany();
  console.log("Cleared companies");

  const companies: any[] = [];
  for (const cd of cityData) {
    const st = streetMap[cd.city] || ["Calle Mayor"];
    for (let i = 0; i < cd.n; i++) {
      const name = genName(); const legal = pick(legalForms);
      const [code,desc] = pick(cnaes);
      const sr = Math.random();
      let emp:number,rev:number;
      if(sr<0.5){emp=ri(1,15);rev=ri(50000,500000);}
      else if(sr<0.8){emp=ri(16,80);rev=ri(500000,3000000);}
      else if(sr<0.95){emp=ri(81,300);rev=ri(3000000,15000000);}
      else{emp=ri(301,2000);rev=ri(15000000,100000000);}
      const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"").slice(0,15);
      companies.push({
        cif:genCIF(),name:`${name}, ${legal}`,legalForm:legal,foundedYear:ri(1960,2024),
        address:`${pick(st)}, ${ri(1,200)}`,postalCode:`${cd.cp}${String(ri(1,99)).padStart(3,"0")}`,
        city:cd.city,provincia:cd.prov,ccaa:cd.ccaa,cnaeCode:code,cnaeDescription:desc,
        employees:emp,revenue:rev,phone:`9${cd.cp[0]}${ri(1,9)} ${ri(100,999)} ${ri(100,999)}`,
        email:`info@${slug}.es`,website:`https://www.${slug}.es`,
        linkedinUrl:Math.random()>0.3?`https://linkedin.com/company/${slug}`:null,
        twitterUrl:Math.random()>0.6?`https://twitter.com/${slug}`:null,
        techStack:pick(techStacks),
        description:`${name}, ${legal} — empresa en ${cd.city}, ${desc.toLowerCase()}.`,
      });
    }
  }
  let ins = 0;
  for (let i=0;i<companies.length;i+=50){
    await prisma.company.createMany({data:companies.slice(i,i+50)});
    ins+=Math.min(50,companies.length-i);
    process.stdout.write(`\r  ${ins}/${companies.length}`);
  }
  console.log(`\n✅ ${ins} companies seeded in PostgreSQL`);
}

main().catch(console.error).finally(()=>prisma.$disconnect());
