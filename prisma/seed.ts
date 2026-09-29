import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // HOUSES
  await prisma.house.createMany({
    data: [
      { id: "KGH01", name: "Mubaraza", code: "A", color: "Blue" },
      { id: "KGH02", name: "Muqawama", code: "B", color: "Red" },
      { id: "KGH03", name: "Mukafaha", code: "C", color: "Green" },
    ],
   
  });

  // CATEGORIES
  await prisma.category.createMany({
    data: [
      { id: "KGCAT01", code: "SJR", name: "Sub Junior" },
      { id: "KGCAT02", code: "JR", name: "Junior" },
      { id: "KGCAT03", code: "SR", name: "Senior" },
      { id: "KGCAT04", code: "SSR", name: "Super Senior" },
      { id: "KGCAT05", code: "GN", name: "General" },
    ],
   
  });

  // CATEGORY ELIGIBILITY
  await prisma.categoryEligibility.createMany({
    data: [
      { id: "EL001", categoryId: "KGCAT01", faculty: "Hifz", className: "2" },
      { id: "EL002", categoryId: "KGCAT01", faculty: "Hifz", className: "3" },
      { id: "EL003", categoryId: "KGCAT01", faculty: "Hifz", className: "4" },
      { id: "EL004", categoryId: "KGCAT01", faculty: "Hifz", className: "5" },
      { id: "EL005", categoryId: "KGCAT02", faculty: "Hifz", className: "6" },
      { id: "EL006", categoryId: "KGCAT02", faculty: "Hifz", className: "7" },
      { id: "EL007", categoryId: "KGCAT02", faculty: "Hifz", className: "8" },
      { id: "EL008", categoryId: "KGCAT03", faculty: "Kulliya", className: "8" },
      { id: "EL009", categoryId: "KGCAT03", faculty: "Kulliya", className: "9" },
      { id: "EL010", categoryId: "KGCAT03", faculty: "Kulliya", className: "10" },
      { id: "EL011", categoryId: "KGCAT04", faculty: "Kulliya", className: "1" },
      { id: "EL012", categoryId: "KGCAT04", faculty: "Kulliya", className: "2" },
      { id: "EL013", categoryId: "KGCAT05", faculty: "All", className: "All" },
    ],
    
  });

  // POINT RULES
  const rules = [
    ["PR001", "SJR", "INDIVIDUAL", 1, 10],
    ["PR002", "SJR", "INDIVIDUAL", 2, 5],
    ["PR003", "SJR", "INDIVIDUAL", 3, 3],
    ["PR004", "JR", "INDIVIDUAL", 1, 10],
    ["PR005", "JR", "INDIVIDUAL", 2, 5],
    ["PR006", "JR", "INDIVIDUAL", 3, 3],
    ["PR007", "SR", "INDIVIDUAL", 1, 10],
    ["PR008", "SR", "INDIVIDUAL", 2, 5],
    ["PR009", "SR", "INDIVIDUAL", 3, 3],
    ["PR010", "SSR", "INDIVIDUAL", 1, 10],
    ["PR011", "SSR", "INDIVIDUAL", 2, 5],
    ["PR012", "SSR", "INDIVIDUAL", 3, 3],
    ["PR013", "GN", "INDIVIDUAL", 1, 15],
    ["PR014", "GN", "INDIVIDUAL", 2, 10],
    ["PR015", "GN", "INDIVIDUAL", 3, 5],
    ["PR016", "SJR", "GROUP", 1, 15],
    ["PR017", "SJR", "GROUP", 2, 10],
    ["PR018", "SJR", "GROUP", 3, 5],
    ["PR019", "JR", "GROUP", 1, 15],
    ["PR020", "JR", "GROUP", 2, 10],
    ["PR021", "JR", "GROUP", 3, 5],
    ["PR022", "SR", "GROUP", 1, 15],
    ["PR023", "SR", "GROUP", 2, 10],
    ["PR024", "SR", "GROUP", 3, 5],
    ["PR025", "SSR", "GROUP", 1, 15],
    ["PR026", "SSR", "GROUP", 2, 10],
    ["PR027", "SSR", "GROUP", 3, 5],
    ["PR028", "GN", "GROUP", 1, 15],
    ["PR029", "GN", "GROUP", 2, 10],
    ["PR030", "GN", "GROUP", 3, 5],
  ];

  await prisma.pointRule.createMany({
    data: rules.map(([id, categoryCode, competitionType, rank, points]) => ({
      id: id as string,
      categoryCode: categoryCode as string,
      competitionType: competitionType as string,
      rank: rank as number,
      points: points as number,
    })),
    
  });

  // JUDGES
  await prisma.judge.createMany({
    data: [
      {
        id: "KGJ001",
        code: "J01",
        name: "ashif",
        username: "ashif",
        passwordHash: "#0001",
        phone: "9876543321",
      },
      {
        id: "KGJ002",
        code: "J02",
        name: "nishmal",
        username: "nishmal",
        passwordHash: "#0002",
        phone: "9876543321",
      },
      {
        id: "KGJ003",
        code: "J03",
        name: "adil.t.t",
        username: "adil.t.t",
        passwordHash: "#0003",
        phone: "9876543321",
      },
    ],
    
  });

  // ADMIN
  await prisma.admin.upsert({
    where: { id: "AD001" },
    update: {},
    create: {
      id: "AD001",
      name: "Administrator",
      username: "admin",
      passwordHash: "CHANGE_ME",
      status: "ACTIVE",
    },
  });

  // DISPLAY CONFIG
  await prisma.displayConfig.createMany({
    data: [
      {
        id: "DC001",
        displayOrder: 1,
        displayName: "Overall",
        category: "OVERALL",
        durationSeconds: 30,
      },
      {
        id: "DC002",
        displayOrder: 2,
        displayName: "Super Senior",
        category: "SSR",
        durationSeconds: 30,
      },
      {
        id: "DC003",
        displayOrder: 3,
        displayName: "Senior",
        category: "SR",
        durationSeconds: 30,
      },
      {
        id: "DC004",
        displayOrder: 4,
        displayName: "Junior",
        category: "JR",
        durationSeconds: 30,
      },
      {
        id: "DC005",
        displayOrder: 5,
        displayName: "Sub Junior",
        category: "SJR",
        durationSeconds: 30,
      },
      {
        id: "DC006",
        displayOrder: 6,
        displayName: "General",
        category: "GN",
        durationSeconds: 30,
      },
    ],
 
  });

  // PROGRAMS
  await prisma.program.createMany({
    data: [
      { id: "KGP001", code: "SJR001", name: "ചിത്ര രചന", categoryId: "KGCAT01", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP002", code: "SJR002", name: "ഗദ്യ വായന", categoryId: "KGCAT01", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP003", code: "SJR003", name: "മെമ്മറി ടെസ്റ്റ്", categoryId: "KGCAT01", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP004", code: "SJR004", name: "കയ്യെഴുത്ത് [മല]", categoryId: "KGCAT01", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP005", code: "SJR005", name: "കത്തെഴുത്ത്", categoryId: "KGCAT01", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP006", code: "SJR006", name: "ഇക്തിശാഫ്", categoryId: "KGCAT01", stageType: "NON-STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP007", code: "SJR007", name: "ഖിറാ'അത്ത്", categoryId: "KGCAT01", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP008", code: "SJR008", name: "ഹിഫ്ള്", categoryId: "KGCAT01", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP009", code: "SJR009", name: "മദ്ഹ് ഗാനം", categoryId: "KGCAT01", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP010", code: "SJR010", name: "കഥ പറച്ചിൽ [മല]", categoryId: "KGCAT01", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP011", code: "SJR011", name: "പ്രസംഗം [മല]", categoryId: "KGCAT01", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP012", code: "SJR012", name: "സംഭാഷണം [മല]", categoryId: "KGCAT01", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP013", code: "JR013", name: "കയ്യെഴുത്ത് [മല]", categoryId: "KGCAT02", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP014", code: "JR014", name: "കയ്യെഴുത്ത് [ARA]", categoryId: "KGCAT02", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP015", code: "JR015", name: "ചിത്ര രചന", categoryId: "KGCAT02", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP016", code: "JR016", name: "കഥാ രചന [മല]", categoryId: "KGCAT02", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP017", code: "JR017", name: "ക്വിസ്", categoryId: "KGCAT02", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP018", code: "JR018", name: "ഗദ്യ വായന [മല]", categoryId: "KGCAT02", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP019", code: "JR019", name: "ഖിറാ'അത്ത്", categoryId: "KGCAT02", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP020", code: "JR020", name: "ഹിഫ്ള്", categoryId: "KGCAT02", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP021", code: "JR021", name: "വാങ്ക്", categoryId: "KGCAT02", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP022", code: "JR022", name: "പ്രസംഗം [മല]", categoryId: "KGCAT02", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP023", code: "JR023", name: "ഗാനം [ARA]", categoryId: "KGCAT02", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP024", code: "JR024", name: "മദ്ഹ് ഗാനം", categoryId: "KGCAT02", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP025", code: "JR025", name: "വുസൂലുസ്സുവർ", categoryId: "KGCAT02", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP026", code: "SR026", name: "കയ്യെഴുത്ത് [മല]", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP027", code: "SR027", name: "കയ്യെഴുത്ത് [ENG]", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP028", code: "SR028", name: "കയ്യെഴുത്ത് [ARA]", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP029", code: "SR029", name: "കയ്യെഴുത്ത് [URD]", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP030", code: "SR030", name: "മെമ്മറി ടെസ്റ്റ്", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP031", code: "SR031", name: "പദപ്പയറ്റ് [ARA]", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP032", code: "SR032", name: "പദപ്പയറ്റ് [ENG]", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP033", code: "SR033", name: "ഗദ്യ വായന [ENG]", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP034", code: "SR034", name: "ഗദ്യ വായന [URD]", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP035", code: "SR035", name: "സ്പെല്ലിങ് ബീ", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP036", code: "SR036", name: "ഖുർആൻ ക്വിസ്", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP037", code: "SR037", name: "ട്രാൻസ്ലേഷൻ [ARA-ENG]", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP038", code: "SR038", name: "ടൈപ്പിംഗ് [ENG]", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP039", code: "SR039", name: "തസ്‌രീഫ്", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP040", code: "SR040", name: "പെൻസിൽ ഡ്രോയിങ്", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP041", code: "SR041", name: "ഗണിത പ്രതിഭ", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP042", code: "SR042", name: "ചിത്രപൊരുൾ", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP043", code: "SR043", name: "വാട്ടർ പെയിന്റിംഗ്", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP044", code: "SR044", name: "പദപ്രതിഭ", categoryId: "KGCAT03", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP045", code: "SR045", name: "ഖിറാ'അത്ത്", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP046", code: "SR046", name: "ഹിഫ്ള്", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP047", code: "SR047", name: "പ്രസംഗം [മല]", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP048", code: "SR048", name: "പ്രസംഗം [URD]", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP049", code: "SR049", name: "ഗാനം [മല]", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP050", code: "SR050", name: "ഗാനം [ARA]", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP051", code: "SR051", name: "ഗാനം [URD]", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP052", code: "SR052", name: "കഥപറയൽ [മല]", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP053", code: "SR053", name: "കഥപറയൽ [ENG]", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP054", code: "SR054", name: "കഥപറയൽ [ARA]", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP055", code: "SR055", name: "മധുരം മലയാളം", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP056", code: "SR056", name: "സംഭാഷണം [ENG]", categoryId: "KGCAT03", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP057", code: "SSR057", name: "പ്രബന്ധം [മല]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP058", code: "SSR058", name: "പ്രബന്ധം [ENG]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP059", code: "SSR059", name: "പ്രബന്ധം [ARA]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP060", code: "SSR060", name: "പ്രബന്ധം [URD]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP061", code: "SSR061", name: "കവിതാ രചന", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP062", code: "SSR062", name: "ഗ്രന്ഥ വായന", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP063", code: "SSR063", name: "ന്യൂസ് മേക്കിങ് [ENG]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP064", code: "SSR064", name: "വേർഡ് ഹണ്ടിങ് [ENG]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP065", code: "SSR065", name: "വിവർത്തനം [ENG-ARA]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP066", code: "SSR066", name: "വിവർത്തനം [മല-URD]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP067", code: "SSR067", name: "ക്യാപ്ഷൻ മേക്കിങ്", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP068", code: "SSR068", name: "വീഡിയോ ഗ്രാസ്‌പിങ്   [ARA]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP069", code: "SSR069", name: "ബ്രെയിൻ മാട്രിക്സ്", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP070", code: "SSR070", name: "AI പോസ്റ്റർ മേക്കിങ്", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP071", code: "SSR071", name: "ടൈപ്പിംഗ് [ENG]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP072", code: "SSR072", name: "ക്വിസ്", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP073", code: "SSR073", name: "തസ്‌രീഫ്", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP074", code: "SSR074", name: "കാലിഗ്രാഫി [ARA]", categoryId: "KGCAT04", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP075", code: "SSR075", name: "ഖിറാ'അത്ത്", categoryId: "KGCAT04", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP076", code: "SSR076", name: "ഹിഫ്ള്", categoryId: "KGCAT04", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP077", code: "SSR077", name: "പ്രസംഗം [ARA]", categoryId: "KGCAT04", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP078", code: "SSR078", name: "പ്രസംഗം [URD]", categoryId: "KGCAT04", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP079", code: "SSR079", name: "നിമിഷ പ്രസംഗം", categoryId: "KGCAT04", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP080", code: "SSR080", name: "പിക്ക് & ടോക്ക്", categoryId: "KGCAT04", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP081", code: "SSR081", name: "ഗാനം [ARA]", categoryId: "KGCAT04", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP082", code: "SSR082", name: "ഗാനം [URD]", categoryId: "KGCAT04", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP083", code: "SSR083", name: "മാപ്പിളപ്പാട്ട്", categoryId: "KGCAT04", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP084", code: "SSR084", name: "ലൈവ് ട്രാൻസ്ലേഷൻ   [ENG-മല]", categoryId: "KGCAT04", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP085", code: "GN085", name: "പത്ര നിർമ്മാണം [മല]", categoryId: "KGCAT05", stageType: "NON-STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP086", code: "GN086", name: "പത്ര നിർമ്മാണം [ENG]", categoryId: "KGCAT05", stageType: "NON-STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP087", code: "GN087", name: "പത്ര നിർമ്മാണം [ARA]", categoryId: "KGCAT05", stageType: "NON-STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP088", code: "GN088", name: "പത്ര നിർമ്മാണം [URD]", categoryId: "KGCAT05", stageType: "NON-STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP089", code: "GN089", name: "പോഡ്കാസ്റ്റ്", categoryId: "KGCAT05", stageType: "NON-STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP090", code: "GN090", name: "തീം ബ്രാൻഡിംഗ്   ഡോക്യുമെന്ററി", categoryId: "KGCAT05", stageType: "NON-STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP091", code: "GN091", name: "കൊളാഷ്", categoryId: "KGCAT05", stageType: "NON-STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP092", code: "GN092", name: "പ്രോംപ്റ്റ് ഡിസൈനിങ്   [ENG]", categoryId: "KGCAT05", stageType: "NON-STAGE", competitionType: "INVIDUAL", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP093", code: "GN093", name: "ബുർദ & ഖവ്വാലി", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP094", code: "GN094", name: "സംഘ ഗാനം [ARA]", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP095", code: "GN095", name: "കഥാ പ്രസംഗം", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP096", code: "GN096", name: "മാലപ്പാട്ട്", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP097", code: "GN097", name: "മാഷപ്പ്", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP098", code: "GN098", name: "ലൈവ് റിപ്പോർട്ടിങ്   [ENG]", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP099", code: "GN099", name: "വഅ്ള്", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP100", code: "GN100", name: "ഖുതുബ", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP101", code: "GN101", name: "മുഹാളറ", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP102", code: "GN102", name: "മുശാറഅ", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP103", code: "GN103", name: "മുഖാറഅ", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "INVIDUAL", chancesPerHouse: 2, maxParticipants: "6", maxMark: 100, status: "not_started" },
      { id: "KGP104", code: "GN104", name: "ഡിബേറ്റ്", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP105", code: "GN105", name: "ഖുർആൻ വിസ്മയ വിരുന്ന്", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
      { id: "KGP106", code: "GN106", name: "ഇലൽ ഹബീബ്", categoryId: "KGCAT05", stageType: "STAGE", competitionType: "GROUP", chancesPerHouse: 1, maxParticipants: "3", maxMark: 100, status: "not_started" },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });