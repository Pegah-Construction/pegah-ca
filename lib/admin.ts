// Pegah Admin — data, types, roles & permissions (Next.js mirror of admin/data.js)

export type RoleKey = "admin" | "pm" | "foreman";

export const ROLES: Record<RoleKey, { key: RoleKey; label: string; blurb: string }> = {
  admin: { key: "admin", label: "Administrator", blurb: "Full access to every module, users and settings." },
  pm: { key: "pm", label: "Project Manager", blurb: "Manages assigned projects, clients, tasks and documents." },
  foreman: { key: "foreman", label: "Site Foreman", blurb: "Field access to assigned projects, tasks and safety." },
};

export type NavKey =
  | "dashboard" | "projects" | "board" | "schedule"
  | "tenders" | "news" | "clients" | "users"
  | "safety" | "documents" | "ai" | "settings";

export type Perms = {
  nav: NavKey[];
  projectScope: "all" | "managed" | "assigned";
  viewBudget: boolean;
  editProjects: boolean;
  manageUsers: boolean;
  manageClients: boolean;
  resolveIncidents: boolean;
  editSettings: boolean;
  manageTenders: boolean;
  manageNews: boolean;
  useAI: boolean;
  configureAI: boolean;
};

export const PERMS: Record<RoleKey, Perms> = {
  admin: {
    nav: ["dashboard","projects","board","schedule","tenders","news","clients","users","safety","documents","ai","settings"],
    projectScope: "all",
    viewBudget: true, editProjects: true, manageUsers: true, manageClients: true, resolveIncidents: true, editSettings: true,
    manageTenders: true, manageNews: true, useAI: true, configureAI: true,
  },
  pm: {
    nav: ["dashboard","projects","board","schedule","tenders","news","clients","safety","documents","ai"],
    projectScope: "managed",
    viewBudget: true, editProjects: true, manageUsers: false, manageClients: true, resolveIncidents: true, editSettings: false,
    manageTenders: true, manageNews: true, useAI: true, configureAI: false,
  },
  foreman: {
    nav: ["dashboard","projects","board","safety","documents"],
    projectScope: "assigned",
    viewBudget: false, editProjects: false, manageUsers: false, manageClients: false, resolveIncidents: false, editSettings: false,
    manageTenders: false, manageNews: false, useAI: false, configureAI: false,
  },
};

export type User = {
  id: string; name: string; role: RoleKey; title: string;
  email: string; phone: string; status: string; since: string;
};

export const USERS: User[] = [
  { id:"u1", name:"Sarah Chen",   role:"admin",   title:"Operations Director",    email:"s.chen@pegah.ca",   phone:"416 739 9301", status:"Active",   since:"2014" },
  { id:"u2", name:"Daniel Osei",  role:"pm",      title:"Senior Project Manager", email:"d.osei@pegah.ca",   phone:"416 739 9312", status:"Active",   since:"2017" },
  { id:"u3", name:"Mike Reyes",   role:"foreman", title:"Site Foreman",           email:"m.reyes@pegah.ca",  phone:"416 739 9333", status:"Active",   since:"2019" },
  { id:"u4", name:"Priya Sharma", role:"pm",      title:"Project Manager",        email:"p.sharma@pegah.ca", phone:"416 739 9314", status:"Active",   since:"2020" },
  { id:"u5", name:"Tom Becker",   role:"foreman", title:"Site Foreman",           email:"t.becker@pegah.ca", phone:"416 739 9335", status:"Active",   since:"2018" },
  { id:"u6", name:"Elena Rossi",  role:"pm",      title:"Project Coordinator",    email:"e.rossi@pegah.ca",  phone:"416 739 9316", status:"Active",   since:"2021" },
  { id:"u7", name:"James Wright", role:"foreman", title:"Site Foreman",           email:"j.wright@pegah.ca", phone:"416 739 9337", status:"On leave", since:"2016" },
  { id:"u8", name:"Aisha Khan",   role:"admin",   title:"Office Administrator",   email:"a.khan@pegah.ca",   phone:"416 739 9308", status:"Active",   since:"2022" },
];

export type Client = {
  id: string; name: string; sector: string; contact: string;
  email: string; phone: string; since: string; projects: number;
};

export const CLIENTS: Client[] = [
  { id:"c1", name:"Harbourside Holdings",     sector:"Commercial",     contact:"R. Mensah",   email:"rm@harbourside.example", phone:"905 555 0148", since:"2019", projects:2 },
  { id:"c2", name:"Northfield Logistics",     sector:"Industrial",     contact:"K. Patel",    email:"kp@northfield.example",  phone:"905 555 0192", since:"2021", projects:1 },
  { id:"c3", name:"Maple Grove Developments", sector:"Residential",    contact:"L. Tremblay", email:"lt@maplegrove.example",  phone:"289 555 0110", since:"2020", projects:1 },
  { id:"c4", name:"Metrolinx Regional",       sector:"Transportation", contact:"D. Okonkwo",  email:"do@metro.example",       phone:"416 555 0177", since:"2018", projects:1 },
  { id:"c5", name:"City of Markham",          sector:"Recreational",   contact:"S. Nguyen",   email:"sn@markham.example",     phone:"905 555 0133", since:"2017", projects:1 },
  { id:"c6", name:"Queen West Retail Group",  sector:"Retail",         contact:"B. Cohen",    email:"bc@qwrg.example",        phone:"416 555 0159", since:"2022", projects:1 },
  { id:"c7", name:"Cambridge Heritage Trust", sector:"Historical",     contact:"M. Flores",   email:"mf@chtrust.example",     phone:"519 555 0124", since:"2019", projects:1 },
  { id:"c8", name:"Parkview Corporate",       sector:"Commercial",     contact:"H. Lee",      email:"hl@parkview.example",    phone:"905 555 0186", since:"2023", projects:1 },
];

export type Milestone = { n: string; d: string; done: boolean };
export type ProjectPhoto = { id: number; path: string; order: number };
export type Project = {
  id: string; name: string; location: string;
  category: string; type: string; dateCompleted: string; owner: string; architect: string;
  contractType: string; value: number; grossFloorArea: string; description: string;
  photos: ProjectPhoto[];
  // kept for board/tasks/incidents compatibility
  client: string; sector: string; status: string;
  progress: number; budget: number; spent: number; start: string; end: string;
  pm: string; foreman: string; team: string[]; milestones: Milestone[];
};

const NEW_FIELDS = { category:"", type:"", dateCompleted:"", owner:"", architect:"", contractType:"", value:0, grossFloorArea:"", description:"", photos:[] as ProjectPhoto[] };

export const PROJECTS = ([
  { ...NEW_FIELDS, id:"p1", name:"Harbourside Commercial Centre", client:"c1", sector:"Commercial", status:"In Progress", progress:68, budget:4200000, spent:2730000, start:"2023-03", end:"2025-09", pm:"u2", foreman:"u3", team:["u2","u3","u6"], location:"Toronto, ON",
    milestones:[{n:"Site mobilization",d:"2023-04",done:true},{n:"Foundation complete",d:"2023-09",done:true},{n:"Structure topped out",d:"2024-06",done:true},{n:"Envelope & glazing",d:"2025-02",done:false},{n:"Interior fit-out",d:"2025-07",done:false},{n:"Handover",d:"2025-09",done:false}] },
  { ...NEW_FIELDS, id:"p2", name:"Northfield Distribution Facility", client:"c2", sector:"Industrial", status:"In Progress", progress:42, budget:8500000, spent:3120000, start:"2024-01", end:"2025-12", pm:"u4", foreman:"u5", team:["u4","u5"], location:"Mississauga, ON",
    milestones:[{n:"Earthworks",d:"2024-02",done:true},{n:"Slab & foundations",d:"2024-07",done:true},{n:"Steel erection",d:"2025-01",done:false},{n:"Cladding",d:"2025-06",done:false},{n:"M&E fit-out",d:"2025-10",done:false},{n:"Commissioning",d:"2025-12",done:false}] },
  { ...NEW_FIELDS, id:"p3", name:"Maple Grove Residences", client:"c3", sector:"Residential", status:"Planning", progress:12, budget:12000000, spent:640000, start:"2024-09", end:"2026-08", pm:"u2", foreman:"u3", team:["u2","u3"], location:"Vaughan, ON",
    milestones:[{n:"Permits & approvals",d:"2024-11",done:true},{n:"Site prep",d:"2025-02",done:false},{n:"Phase 1 framing",d:"2025-08",done:false},{n:"Phase 2 framing",d:"2026-01",done:false},{n:"Occupancy",d:"2026-08",done:false}] },
  { ...NEW_FIELDS, id:"p4", name:"Lakeshore Transit Hub", client:"c4", sector:"Transportation", status:"On Hold", progress:55, budget:22000000, spent:11440000, start:"2022-06", end:"2025-04", pm:"u4", foreman:"u7", team:["u4","u7"], location:"Hamilton, ON",
    milestones:[{n:"Demolition",d:"2022-08",done:true},{n:"Substructure",d:"2023-03",done:true},{n:"Platform works",d:"2024-01",done:true},{n:"Concourse",d:"2024-09",done:false},{n:"Systems & testing",d:"2025-02",done:false}] },
  { ...NEW_FIELDS, id:"p5", name:"Riverbend Recreation Complex", client:"c5", sector:"Recreational", status:"In Progress", progress:80, budget:9800000, spent:7210000, start:"2023-01", end:"2025-02", pm:"u6", foreman:"u5", team:["u6","u5"], location:"Markham, ON",
    milestones:[{n:"Foundations",d:"2023-04",done:true},{n:"Pool tank",d:"2023-11",done:true},{n:"Superstructure",d:"2024-06",done:true},{n:"Interior finishes",d:"2024-12",done:false},{n:"Handover",d:"2025-02",done:false}] },
  { ...NEW_FIELDS, id:"p6", name:"Queen Street Retail Pavilion", client:"c6", sector:"Retail", status:"Complete", progress:100, budget:3400000, spent:3320000, start:"2022-05", end:"2023-08", pm:"u2", foreman:"u7", team:["u2","u7"], location:"Toronto, ON",
    milestones:[{n:"Fit-out start",d:"2022-06",done:true},{n:"Storefront",d:"2022-11",done:true},{n:"MEP",d:"2023-03",done:true},{n:"Handover",d:"2023-08",done:true}] },
  { ...NEW_FIELDS, id:"p7", name:"Heritage Mill Restoration", client:"c7", sector:"Historical", status:"In Progress", progress:35, budget:5100000, spent:1785000, start:"2024-03", end:"2025-11", pm:"u6", foreman:"u3", team:["u6","u3"], location:"Cambridge, ON",
    milestones:[{n:"Conservation survey",d:"2024-04",done:true},{n:"Structural stabilization",d:"2024-10",done:false},{n:"Masonry restoration",d:"2025-04",done:false},{n:"Adaptive fit-out",d:"2025-09",done:false},{n:"Handover",d:"2025-11",done:false}] },
  { ...NEW_FIELDS, id:"p8", name:"Parkview Corporate Campus", client:"c8", sector:"Commercial", status:"In Progress", progress:22, budget:18000000, spent:3960000, start:"2024-06", end:"2026-12", pm:"u4", foreman:"u5", team:["u4","u5"], location:"Oakville, ON",
    milestones:[{n:"Enabling works",d:"2024-08",done:true},{n:"Building A core",d:"2025-03",done:false},{n:"Building B core",d:"2025-10",done:false},{n:"Campus landscaping",d:"2026-06",done:false},{n:"Handover",d:"2026-12",done:false}] },
]) as Project[];

export type Task = {
  id: string; title: string; project: string; assignee: string;
  due: string; status: "To Do" | "In Progress" | "Blocked" | "Done"; priority: "High" | "Medium" | "Low";
};

export const TASKS: Task[] = [
  { id:"t1",  title:"Submit envelope shop drawings",        project:"p1", assignee:"u3", due:"2025-01-18", status:"In Progress", priority:"High" },
  { id:"t2",  title:"Coordinate glazing subcontractor",      project:"p1", assignee:"u2", due:"2025-01-22", status:"To Do",       priority:"Medium" },
  { id:"t3",  title:"Steel delivery inspection",             project:"p2", assignee:"u5", due:"2025-01-15", status:"Blocked",     priority:"High" },
  { id:"t4",  title:"Finalize Phase 1 permit set",           project:"p3", assignee:"u2", due:"2025-01-30", status:"To Do",       priority:"High" },
  { id:"t5",  title:"Re-baseline schedule after hold",       project:"p4", assignee:"u4", due:"2025-01-20", status:"In Progress", priority:"High" },
  { id:"t6",  title:"Pool tank waterproofing sign-off",      project:"p5", assignee:"u5", due:"2025-01-14", status:"Done",        priority:"Medium" },
  { id:"t7",  title:"Masonry conservation method statement", project:"p7", assignee:"u3", due:"2025-01-25", status:"To Do",       priority:"Medium" },
  { id:"t8",  title:"Building A rebar inspection",           project:"p8", assignee:"u5", due:"2025-01-17", status:"In Progress", priority:"Low" },
  { id:"t9",  title:"Monthly cost report",                   project:"p1", assignee:"u2", due:"2025-01-28", status:"To Do",       priority:"Medium" },
  { id:"t10", title:"Site safety walk — week 3",             project:"p5", assignee:"u6", due:"2025-01-16", status:"Done",        priority:"High" },
];

export type Incident = {
  id: string; project: string; date: string;
  type: "Hazard" | "Near miss" | "First aid" | "Lost time";
  severity: "High" | "Medium" | "Low";
  status: "Open" | "Under review" | "Closed"; reportedBy: string; note: string;
};

export const INCIDENTS: Incident[] = [
  { id:"s1", project:"p1", date:"2025-01-09", type:"Near miss", severity:"Medium", status:"Under review", reportedBy:"u3", note:"Unsecured load near loading bay." },
  { id:"s2", project:"p2", date:"2025-01-07", type:"Hazard",    severity:"Low",    status:"Open",         reportedBy:"u5", note:"Trip hazard from trailing cables." },
  { id:"s3", project:"p4", date:"2024-12-20", type:"First aid", severity:"Low",    status:"Closed",       reportedBy:"u7", note:"Minor hand laceration, treated on site." },
  { id:"s4", project:"p5", date:"2025-01-11", type:"Hazard",    severity:"Medium", status:"Open",         reportedBy:"u6", note:"Guardrail missing on level 2 edge." },
  { id:"s5", project:"p8", date:"2025-01-05", type:"Lost time", severity:"High",   status:"Under review", reportedBy:"u5", note:"Slip on wet slab; 2 days lost." },
  { id:"s6", project:"p7", date:"2024-12-15", type:"Near miss", severity:"Low",    status:"Closed",       reportedBy:"u3", note:"Falling debris during demolition." },
];

export type Doc = { id: string; name: string; type: string; project: string | null; size: string; updated: string; owner: string; path?: string };

export const DOCUMENTS: Doc[] = [
  { id:"d1", name:"Harbourside — Tender Drawings Rev C", type:"DWG",  project:"p1", size:"42.1 MB", updated:"2025-01-08", owner:"u2" },
  { id:"d2", name:"Harbourside — Monthly Cost Report",   type:"XLSX", project:"p1", size:"1.2 MB",  updated:"2025-01-10", owner:"u2" },
  { id:"d3", name:"Northfield — Structural Steel Spec",  type:"PDF",  project:"p2", size:"3.8 MB",  updated:"2024-12-22", owner:"u4" },
  { id:"d4", name:"Maple Grove — Permit Package",        type:"PDF",  project:"p3", size:"18.6 MB", updated:"2024-11-30", owner:"u2" },
  { id:"d5", name:"Lakeshore — Schedule Rebaseline",     type:"XLSX", project:"p4", size:"2.4 MB",  updated:"2025-01-12", owner:"u4" },
  { id:"d6", name:"Riverbend — O&M Manual Draft",        type:"DOCX", project:"p5", size:"9.1 MB",  updated:"2025-01-06", owner:"u6" },
  { id:"d7", name:"Heritage Mill — Conservation Survey", type:"PDF",  project:"p7", size:"27.3 MB", updated:"2024-12-18", owner:"u6" },
  { id:"d8", name:"Parkview — Site Logistics Plan",      type:"DWG",  project:"p8", size:"15.0 MB", updated:"2025-01-09", owner:"u4" },
  { id:"d9", name:"Company — Health & Safety Policy",    type:"PDF",  project:null, size:"0.8 MB",  updated:"2024-10-01", owner:"u1" },
];

export type Activity = { who: string; what: string; project: string | null; when: string };

export const ACTIVITY: Activity[] = [
  { who:"u3", what:"reported a near miss on", project:"p1", when:"2h ago" },
  { who:"u4", what:"rebaselined the schedule for", project:"p4", when:"5h ago" },
  { who:"u6", what:"uploaded O&M manual draft to", project:"p5", when:"1d ago" },
  { who:"u2", what:"closed task “Pool tank sign-off” on", project:"p5", when:"1d ago" },
  { who:"u5", what:"flagged steel delivery blocked on", project:"p2", when:"2d ago" },
  { who:"u1", what:"added a new client", project:null, when:"3d ago" },
];

export const DEMO_ACCOUNTS = ["u1", "u2", "u3"];

export const STATS = { projects: 97, commercial: 58, residential: 39, tenders: 220, articles: 58, lines: 24770 };

// ---- Tenders ----
export const TENDER_PLATFORMS = ["Canada Buys","Ontario Tenders","City of Toronto","MERX","Biddingo","Bids&Tenders","Bonfire","ConstructConnect","Metrolinx","PendingWorks"];

export type Tender = {
  id: string; ref: string; title: string; org: string; platform: string;
  type: string; category: string; value: number; province: string; city: string;
  published: string; closing: string; status: "Open" | "Closing soon" | "Closed";
  tracked: boolean; contact: { name: string; email: string; phone: string }; note?: string; desc: string;
};

export const TENDERS: Tender[] = [
  { id:"tn1", ref:"CB-2025-0481", title:"General Contractor — Federal Building Envelope Renewal", org:"Public Services and Procurement Canada", platform:"Canada Buys", type:"RFP", category:"Commercial", value:8200000, province:"ON", city:"Ottawa", published:"2025-01-04", closing:"2025-02-12", status:"Open", tracked:true, contact:{name:"Procurement Office",email:"bids@pwgsc.gc.ca",phone:"613 555 0100"}, note:"Strong fit — our envelope experience on Harbourside.", desc:"Construction services for the renewal of the building envelope including glazing, cladding and roofing across a 6-storey federal office." },
  { id:"tn2", ref:"OT-44192", title:"Construction Management — Regional Water Treatment Upgrade", org:"Region of Peel", platform:"Ontario Tenders", type:"RFQ", category:"Industrial", value:14500000, province:"ON", city:"Brampton", published:"2025-01-06", closing:"2025-01-29", status:"Closing soon", tracked:true, contact:{name:"K. Walsh",email:"procurement@peelregion.ca",phone:"905 555 0110"}, desc:"Construction management services for mechanical and process upgrades to an existing water treatment facility." },
  { id:"tn3", ref:"TO-2025-118", title:"Prime Contractor — Community Recreation Centre Fit-out", org:"City of Toronto", platform:"City of Toronto", type:"ITT", category:"Recreational", value:6400000, province:"ON", city:"Toronto", published:"2025-01-08", closing:"2025-02-05", status:"Open", tracked:false, contact:{name:"Bid Desk",email:"bids@toronto.ca",phone:"416 555 0120"}, desc:"Interior fit-out and finishing of a new community recreation centre including pool mechanical." },
  { id:"tn4", ref:"MERX-99812", title:"Design-Build — Transit Maintenance Facility", org:"Metrolinx", platform:"Metrolinx", type:"RFP", category:"Transportation", value:38000000, province:"ON", city:"Hamilton", published:"2024-12-18", closing:"2025-02-28", status:"Open", tracked:true, contact:{name:"Capital Projects",email:"tenders@metrolinx.com",phone:"416 555 0130"}, note:"Large — would need a JV partner.", desc:"Design and construction of a new transit vehicle maintenance and storage facility." },
  { id:"tn5", ref:"BID-7740", title:"General Contractor — Long-Term Care Renovation", org:"Ontario Health", platform:"Biddingo", type:"RFP", category:"Institutional", value:5100000, province:"ON", city:"London", published:"2025-01-02", closing:"2025-01-24", status:"Closing soon", tracked:false, contact:{name:"Facilities",email:"procure@ontariohealth.ca",phone:"519 555 0140"}, desc:"Phased renovation of a 120-bed long-term care home while remaining partially occupied." },
  { id:"tn6", ref:"BT-2025-220", title:"Retail Pavilion Base Building", org:"Queen West BIA", platform:"Bids&Tenders", type:"ITT", category:"Retail", value:3300000, province:"ON", city:"Toronto", published:"2025-01-09", closing:"2025-02-09", status:"Open", tracked:false, contact:{name:"D. Cohen",email:"projects@qwbia.ca",phone:"416 555 0150"}, desc:"Base-building construction for a street-level retail pavilion." },
  { id:"tn7", ref:"BON-5521", title:"Heritage Masonry Restoration", org:"Cambridge Heritage Trust", platform:"Bonfire", type:"RFQ", category:"Historical", value:2700000, province:"ON", city:"Cambridge", published:"2024-12-20", closing:"2025-01-20", status:"Closed", tracked:false, contact:{name:"M. Flores",email:"trust@cambridge.ca",phone:"519 555 0160"}, desc:"Restoration of heritage masonry façade and structural stabilization." },
  { id:"tn8", ref:"CC-88210", title:"Industrial Warehouse Expansion", org:"Northfield Logistics", platform:"ConstructConnect", type:"RFP", category:"Industrial", value:9800000, province:"ON", city:"Mississauga", published:"2025-01-07", closing:"2025-02-18", status:"Open", tracked:true, contact:{name:"K. Patel",email:"kp@northfield.example",phone:"905 555 0170"}, note:"Existing client — warm lead.", desc:"Expansion of an existing distribution facility including additional loading docks and mezzanine." },
  { id:"tn9", ref:"PW-1043", title:"Corporate Campus — Building B Core & Shell", org:"Parkview Corporate", platform:"PendingWorks", type:"RFP", category:"Commercial", value:21000000, province:"ON", city:"Oakville", published:"2025-01-05", closing:"2025-03-01", status:"Open", tracked:false, contact:{name:"H. Lee",email:"hl@parkview.example",phone:"905 555 0180"}, desc:"Core-and-shell construction of the second building in a phased corporate campus." },
  { id:"tn10", ref:"CB-2025-0512", title:"School Board — Gymnasium Addition", org:"Halton District School Board", platform:"Canada Buys", type:"ITT", category:"Institutional", value:4400000, province:"ON", city:"Burlington", published:"2025-01-10", closing:"2025-02-14", status:"Open", tracked:false, contact:{name:"Capital Planning",email:"tenders@hdsb.ca",phone:"905 555 0190"}, desc:"Construction of a gymnasium addition and associated change rooms at an existing secondary school." },
];

// ---- News / Blog ----
export type Article = {
  id: string; title: string; slug: string; project: string | null; author: string;
  status: "Published" | "Draft"; date: string; tags: string[]; featured: boolean; excerpt: string; words: number;
};

export const NEWS: Article[] = [
  { id:"n1", title:"Inside the Harbourside Commercial Centre Build", slug:"harbourside-commercial-centre", project:"p1", author:"u2", status:"Published", date:"2025-01-08", tags:["Commercial","Design-Build"], featured:true, excerpt:"How our team delivered a multi-tenant commercial centre on an accelerated design-build schedule.", words:740 },
  { id:"n2", title:"Northfield Distribution Facility: Building at Scale", slug:"northfield-distribution-facility", project:"p2", author:"u4", status:"Published", date:"2025-01-03", tags:["Industrial"], featured:false, excerpt:"A large-footprint distribution and warehousing facility built to operational spec.", words:680 },
  { id:"n3", title:"Restoring the Heritage Mill: Old Bones, New Life", slug:"heritage-mill-restoration", project:"p7", author:"u6", status:"Published", date:"2024-12-19", tags:["Historical","Restoration"], featured:true, excerpt:"Careful conservation of a heritage structure for contemporary use.", words:820 },
  { id:"n4", title:"Riverbend Recreation Complex Nears Completion", slug:"riverbend-recreation-complex", project:"p5", author:"u6", status:"Published", date:"2024-12-11", tags:["Recreational"], featured:false, excerpt:"A community recreation complex delivered as a single accountable design-build.", words:610 },
  { id:"n5", title:"What Design-Build Means for Your Project Timeline", slug:"design-build-timeline", project:null, author:"u1", status:"Draft", date:"2025-01-11", tags:["Insights","Design-Build"], featured:false, excerpt:"Why one accountable team from concept to handover can compress your schedule.", words:540 },
  { id:"n6", title:"Safety First: Our Approach on Every Site", slug:"safety-first-approach", project:null, author:"u1", status:"Draft", date:"2025-01-09", tags:["Safety"], featured:false, excerpt:"Quality construction delivered safely is an attainable goal — here's how we hold to it.", words:500 },
];

// ---- Kanban board ----
export const BOARD_COLUMNS: { key: string; label: string; tone: string }[] = [
  { key:"new", label:"New", tone:"gray" },
  { key:"doing", label:"Doing", tone:"blue" },
  { key:"stuck", label:"Stuck", tone:"red" },
  { key:"review", label:"Review", tone:"amber" },
  { key:"completed", label:"Completed", tone:"green" },
];

export type Subtask = { t: string; done: boolean };
export type Comment = { who: string; when: string; text: string };
export type Card = {
  id: string; title: string; col: string; project: string; assignee: string;
  priority: "High" | "Medium" | "Low"; due: string; subtasks: Subtask[]; comments: Comment[];
};

export const BOARD: Card[] = [
  { id:"k1", title:"Draft prequalification for Metrolinx RFP", col:"doing", project:"p4", assignee:"u4", priority:"High", due:"2025-01-22", subtasks:[{t:"Pull past transit experience",done:true},{t:"Safety record summary",done:true},{t:"Reference letters",done:false}], comments:[{who:"u1",when:"1d ago",text:"Loop in Sarah for the exec summary."},{who:"u4",when:"3h ago",text:"Draft is 60% there."}] },
  { id:"k2", title:"Upload Harbourside envelope shop drawings", col:"review", project:"p1", assignee:"u3", priority:"Medium", due:"2025-01-18", subtasks:[{t:"Collect Rev C set",done:true},{t:"QA against spec",done:true}], comments:[{who:"u2",when:"5h ago",text:"Looks good, approving today."}] },
  { id:"k3", title:"Steel delivery blocked — chase supplier", col:"stuck", project:"p2", assignee:"u5", priority:"High", due:"2025-01-15", subtasks:[{t:"Confirm revised ETA",done:false},{t:"Notify PM",done:true}], comments:[{who:"u5",when:"2d ago",text:"Supplier says 2-week slip."}] },
  { id:"k4", title:"Publish Heritage Mill case study", col:"completed", project:"p7", assignee:"u6", priority:"Low", due:"2024-12-19", subtasks:[{t:"Write article",done:true},{t:"Select cover image",done:true},{t:"Publish",done:true}], comments:[] },
  { id:"k5", title:"Finalize Maple Grove Phase 1 permit set", col:"new", project:"p3", assignee:"u2", priority:"High", due:"2025-01-30", subtasks:[{t:"Architectural set",done:false},{t:"Structural set",done:false}], comments:[] },
  { id:"k6", title:"Monthly cost report — Harbourside", col:"new", project:"p1", assignee:"u2", priority:"Medium", due:"2025-01-28", subtasks:[], comments:[] },
  { id:"k7", title:"Site safety walk — Riverbend week 3", col:"doing", project:"p5", assignee:"u6", priority:"High", due:"2025-01-16", subtasks:[{t:"Inspect level 2 edge protection",done:false}], comments:[{who:"u6",when:"6h ago",text:"Guardrail issue logged as incident."}] },
  { id:"k8", title:"Track Northfield warehouse tender", col:"review", project:"p2", assignee:"u4", priority:"Medium", due:"2025-02-18", subtasks:[{t:"Confirm bid/no-bid",done:true}], comments:[] },
];

// ---- AI assistant ----
export const AI_PROVIDERS = [
  { key:"claude", label:"Anthropic Claude", model:"claude-sonnet-4.5", active:true },
  { key:"openai", label:"OpenAI GPT", model:"gpt-4o", active:false },
  { key:"gemini", label:"Google Gemini", model:"gemini-1.5-pro", active:false },
  { key:"grok", label:"xAI Grok", model:"grok-2", active:false },
];
export const AI_TOOLS = [
  {name:"getProjects", desc:"Search and filter all 97 projects by category, name, owner, location"},
  {name:"getProjectDetails", desc:"Full details of any project — descriptions, photos, specifications"},
  {name:"getTasks", desc:"Query the kanban board by status or assignee"},
  {name:"getTaskDetails", desc:"Task details with subtasks and comments"},
  {name:"getTenders", desc:"Search tender opportunities by platform, status, location, closing date"},
  {name:"getTenderDetails", desc:"Full tender details with buyer contacts"},
  {name:"getTeamMembers", desc:"List team members with access"},
  {name:"getNews", desc:"Search and filter news articles"},
  {name:"getDocs", desc:"Access internal documentation"},
  {name:"getSOPs", desc:"Standard operating procedures and guides"},
  {name:"getCompanyInfo", desc:"Company background, certifications, contacts"},
  {name:"vision", desc:"Analyze images when shared"},
];
export const AI_PROMPTS = [
  "Show me all open tenders closing this month in Ontario",
  "Which projects are over 70% complete?",
  "Draft a prequalification response using our past institutional experience",
  "Summarize open safety incidents across active sites",
  "Write a blog post about the Riverbend Recreation Complex",
];

// ---- lookups & helpers ----
export const getUser = (id: string) => USERS.find((u) => u.id === id);
export const getClient = (id: string) => CLIENTS.find((c) => c.id === id);
export const getProject = (id: string) => PROJECTS.find((p) => p.id === id);

export function visibleProjects(u: User): Project[] {
  const p = PERMS[u.role];
  if (p.projectScope === "all") return PROJECTS.slice();
  if (p.projectScope === "managed") return PROJECTS.filter((x) => x.pm === u.id);
  return PROJECTS.filter((x) => x.foreman === u.id || x.team.includes(u.id));
}
export const visibleIds = (u: User) => visibleProjects(u).map((p) => p.id);
export const canSee = (u: User, key: NavKey) => PERMS[u.role].nav.includes(key);

export const money = (n: number) =>
  n >= 1e6 ? "$" + (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? "$" + Math.round(n / 1e3) + "K" : "$" + n;
export const moneyFull = (n: number) => "$" + n.toLocaleString("en-US");
