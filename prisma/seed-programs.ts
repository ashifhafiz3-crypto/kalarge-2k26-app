import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const programs = [
  // SJR — KGCAT01
  ["KGP001","SJR001","ചിത്ര രചന","KGCAT01","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP002","SJR002","ഗദ്യ വായന","KGCAT01","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP003","SJR003","മെമ്മറി ടെസ്റ്റ്","KGCAT01","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP004","SJR004","കയ്യെഴുത്ത് [മല]","KGCAT01","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP005","SJR005","കത്തെഴുത്ത്","KGCAT01","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP006","SJR006","ഇക്തിശാഫ്","KGCAT01","NON-STAGE","GROUP",1,"3"],
  ["KGP007","SJR007","ഖിറാ'അത്ത്","KGCAT01","STAGE","INDIVIDUAL",2,"6"],
  ["KGP008","SJR008","ഹിഫ്ള്","KGCAT01","STAGE","INDIVIDUAL",2,"6"],
  ["KGP009","SJR009","മദ്ഹ് ഗാനം","KGCAT01","STAGE","INDIVIDUAL",2,"6"],
  ["KGP010","SJR010","കഥ പറച്ചിൽ [മല]","KGCAT01","STAGE","INDIVIDUAL",2,"6"],
  ["KGP011","SJR011","പ്രസംഗം [മല]","KGCAT01","STAGE","INDIVIDUAL",2,"6"],
  ["KGP012","SJR012","സംഭാഷണം [മല]","KGCAT01","STAGE","GROUP",1,"3"],

  // JR — KGCAT02
  ["KGP013","JR013","കയ്യെഴുത്ത് [മല]","KGCAT02","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP014","JR014","കയ്യെഴുത്ത് [ARA]","KGCAT02","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP015","JR015","ചിത്ര രചന","KGCAT02","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP016","JR016","കഥാ രചന [മല]","KGCAT02","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP017","JR017","ക്വിസ്","KGCAT02","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP018","JR018","ഗദ്യ വായന [മല]","KGCAT02","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP019","JR019","ഖിറാ'അത്ത്","KGCAT02","STAGE","INDIVIDUAL",2,"6"],
  ["KGP020","JR020","ഹിഫ്ള്","KGCAT02","STAGE","INDIVIDUAL",2,"6"],
  ["KGP021","JR021","വാങ്ക്","KGCAT02","STAGE","INDIVIDUAL",2,"6"],
  ["KGP022","JR022","പ്രസംഗം [മല]","KGCAT02","STAGE","INDIVIDUAL",2,"6"],
  ["KGP023","JR023","ഗാനം [ARA]","KGCAT02","STAGE","INDIVIDUAL",2,"6"],
  ["KGP024","JR024","മദ്ഹ് ഗാനം","KGCAT02","STAGE","INDIVIDUAL",2,"6"],
  ["KGP025","JR025","വുസൂലുസ്സുവർ","KGCAT02","STAGE","GROUP",1,"3"],

  // SR — KGCAT03
  ["KGP026","SR026","കയ്യെഴുത്ത് [മല]","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP027","SR027","കയ്യെഴുത്ത് [ENG]","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP028","SR028","കയ്യെഴുത്ത് [ARA]","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP029","SR029","കയ്യെഴുത്ത് [URD]","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP030","SR030","മെമ്മറി ടെസ്റ്റ്","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP031","SR031","പദപ്പയറ്റ് [ARA]","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP032","SR032","പദപ്പയറ്റ് [ENG]","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP033","SR033","ഗദ്യ വായന [ENG]","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP034","SR034","ഗദ്യ വായന [URD]","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP035","SR035","സ്പെല്ലിങ് ബീ","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP036","SR036","ഖുർആൻ ക്വിസ്","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP037","SR037","ട്രാൻസ്ലേഷൻ [ARA-ENG]","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP038","SR038","ടൈപ്പിംഗ് [ENG]","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP039","SR039","തസ്‌രീഫ്","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP040","SR040","പെൻസിൽ ഡ്രോയിങ്","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP041","SR041","ഗണിത പ്രതിഭ","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP042","SR042","ചിത്രപൊരുൾ","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP043","SR043","വാട്ടർ പെയിന്റിംഗ്","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP044","SR044","പദപ്രതിഭ","KGCAT03","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP045","SR045","ഖിറാ'അത്ത്","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP046","SR046","ഹിഫ്ള്","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP047","SR047","പ്രസംഗം [മല]","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP048","SR048","പ്രസംഗം [URD]","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP049","SR049","ഗാനം [മല]","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP050","SR050","ഗാനം [ARA]","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP051","SR051","ഗാനം [URD]","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP052","SR052","കഥപറയൽ [മല]","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP053","SR053","കഥപറയൽ [ENG]","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP054","SR054","കഥപറയൽ [ARA]","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP055","SR055","മധുരം മലയാളം","KGCAT03","STAGE","INDIVIDUAL",2,"6"],
  ["KGP056","SR056","സംഭാഷണം [ENG]","KGCAT03","STAGE","GROUP",1,"3"],

  // SSR — KGCAT04
  ["KGP057","SSR057","പ്രബന്ധം [മല]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP058","SSR058","പ്രബന്ധം [ENG]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP059","SSR059","പ്രബന്ധം [ARA]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP060","SSR060","പ്രബന്ധം [URD]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP061","SSR061","കവിതാ രചന","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP062","SSR062","ഗ്രന്ഥ വായന","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP063","SSR063","ന്യൂസ് മേക്കിങ് [ENG]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP064","SSR064","വേർഡ് ഹണ്ടിങ് [ENG]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP065","SSR065","വിവർത്തനം [ENG-ARA]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP066","SSR066","വിവർത്തനം [മല-URD]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP067","SSR067","ക്യാപ്ഷൻ മേക്കിങ്","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP068","SSR068","വീഡിയോ ഗ്രാസ്‌പിങ് [ARA]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP069","SSR069","ബ്രെയിൻ മാട്രിക്സ്","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP070","SSR070","AI പോസ്റ്റർ മേക്കിങ്","KGCAT04","NON-STAGE","GROUP",1,"3"],
  ["KGP071","SSR071","ടൈപ്പിംഗ് [ENG]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP072","SSR072","ക്വിസ്","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP073","SSR073","തസ്‌രീഫ്","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP074","SSR074","കാലിഗ്രാഫി [ARA]","KGCAT04","NON-STAGE","INDIVIDUAL",2,"6"],
  ["KGP075","SSR075","ഖിറാ'അത്ത്","KGCAT04","STAGE","INDIVIDUAL",2,"6"],
  ["KGP076","SSR076","ഹിഫ്ള്","KGCAT04","STAGE","INDIVIDUAL",2,"6"],
  ["KGP077","SSR077","പ്രസംഗം [ARA]","KGCAT04","STAGE","INDIVIDUAL",2,"6"],
  ["KGP078","SSR078","പ്രസംഗം [URD]","KGCAT04","STAGE","INDIVIDUAL",2,"6"],
  ["KGP079","SSR079","നിമിഷ പ്രസംഗം","KGCAT04","STAGE","INDIVIDUAL",2,"6"],
  ["KGP080","SSR080","പിക്ക് & ടോക്ക്","KGCAT04","STAGE","INDIVIDUAL",2,"6"],
  ["KGP081","SSR081","ഗാനം [ARA]","KGCAT04","STAGE","INDIVIDUAL",2,"6"],
  ["KGP082","SSR082","ഗാനം [URD]","KGCAT04","STAGE","INDIVIDUAL",2,"6"],
  ["KGP083","SSR083","മാപ്പിളപ്പാട്ട്","KGCAT04","STAGE","INDIVIDUAL",2,"6"],
  ["KGP084","SSR084","ലൈവ് ട്രാൻസ്ലേഷൻ [ENG-മല]","KGCAT04","STAGE","GROUP",1,"3"],

  // GN — KGCAT05
  ["KGP085","GN085","പത്ര നിർമ്മാണം [മല]","KGCAT05","NON-STAGE","GROUP",1,"3"],
  ["KGP086","GN086","പത്ര നിർമ്മാണം [ENG]","KGCAT05","NON-STAGE","GROUP",1,"3"],
  ["KGP087","GN087","പത്ര നിർമ്മാണം [ARA]","KGCAT05","NON-STAGE","GROUP",1,"3"],
  ["KGP088","GN088","പത്ര നിർമ്മാണം [URD]","KGCAT05","NON-STAGE","GROUP",1,"3"],
  ["KGP089","GN089","പോഡ്കാസ്റ്റ്","KGCAT05","NON-STAGE","GROUP",1,"3"],
  ["KGP090","GN090","തീം ബ്രാൻഡിംഗ് ഡോക്യുമെന്ററി","KGCAT05","NON-STAGE","GROUP",1,"3"],
  ["KGP091","GN091","കൊളാഷ്","KGCAT05","NON-STAGE","GROUP",1,"3"],
  ["KGP092","GN092","പ്രോംപ്റ്റ് ഡിസൈനിങ് [ENG]","KGCAT05","NON-STAGE","INDIVIDUAL",1,"3"],
  ["KGP093","GN093","ബുർദ & ഖവ്വാലി","KGCAT05","STAGE","GROUP",1,"3"],
  ["KGP094","GN094","സംഘ ഗാനം [ARA]","KGCAT05","STAGE","GROUP",1,"3"],
  ["KGP095","GN095","കഥാ പ്രസംഗം","KGCAT05","STAGE","GROUP",1,"3"],
  ["KGP096","GN096","മാലപ്പാട്ട്","KGCAT05","STAGE","GROUP",1,"3"],
  ["KGP097","GN097","മാഷപ്പ്","KGCAT05","STAGE","GROUP",1,"3"],
  ["KGP098","GN098","ലൈവ് റിപ്പോർട്ടിങ് [ENG]","KGCAT05","STAGE","GROUP",1,"3"],
  ["KGP099","GN099","വഅ്ള്","KGCAT05","STAGE","INDIVIDUAL",1,"3"],
  ["KGP100","GN100","ഖുതുബ","KGCAT05","STAGE","INDIVIDUAL",1,"3"],
  ["KGP101","GN101","മുഹാളറ","KGCAT05","STAGE","GROUP",1,"3"],
  ["KGP102","GN102","മുശാറഅ","KGCAT05","STAGE","GROUP",1,"3"],
  ["KGP103","GN103","മുഖാറഅ","KGCAT05","STAGE","INDIVIDUAL",2,"6"],
  ["KGP104","GN104","ഡിബേറ്റ്","KGCAT05","STAGE","GROUP",1,"3"],
  ["KGP105","GN105","ഖുർആൻ വിസ്മയ വിരുന്ന്","KGCAT05","STAGE","GROUP",1,"3"],
  ["KGP106","GN106","ഇലൽ ഹബീബ്","KGCAT05","STAGE","GROUP",1,"3"],
] as const;

async function main() {
  for (const [
    id,
    code,
    name,
    categoryId,
    stageType,
    competitionType,
    chancesPerHouse,
    maxParticipants,
  ] of programs) {
    await prisma.program.upsert({
      where: { id },
      update: {
        code,
        name,
        categoryId,
        stageType,
        competitionType,
        chancesPerHouse,
        maxParticipants,
        maxMark: 100,
        status: "NOT_STARTED",
      },
      create: {
        id,
        code,
        name,
        categoryId,
        stageType,
        competitionType,
        chancesPerHouse,
        maxParticipants,
        maxMark: 100,
        status: "NOT_STARTED",
      },
    });
  }

  console.log(`${programs.length} programs seeded successfully.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });