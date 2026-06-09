import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // ── Users ─────────────────────────────────────────────────────────────────
  const users = [
    { id:"u1", name:"Sarah Chen",   role:"admin",   title:"Operations Director",    email:"s.chen@pegah.ca",   phone:"416 739 9301", status:"Active",   since:"2014" },
    { id:"u2", name:"Daniel Osei",  role:"pm",      title:"Senior Project Manager", email:"d.osei@pegah.ca",   phone:"416 739 9312", status:"Active",   since:"2017" },
    { id:"u3", name:"Mike Reyes",   role:"foreman", title:"Site Foreman",           email:"m.reyes@pegah.ca",  phone:"416 739 9333", status:"Active",   since:"2019" },
    { id:"u4", name:"Priya Sharma", role:"pm",      title:"Project Manager",        email:"p.sharma@pegah.ca", phone:"416 739 9314", status:"Active",   since:"2020" },
    { id:"u5", name:"Tom Becker",   role:"foreman", title:"Site Foreman",           email:"t.becker@pegah.ca", phone:"416 739 9335", status:"Active",   since:"2018" },
    { id:"u6", name:"Elena Rossi",  role:"pm",      title:"Project Coordinator",    email:"e.rossi@pegah.ca",  phone:"416 739 9316", status:"Active",   since:"2021" },
    { id:"u7", name:"James Wright", role:"foreman", title:"Site Foreman",           email:"j.wright@pegah.ca", phone:"416 739 9337", status:"On leave", since:"2016" },
    { id:"u8", name:"Aisha Khan",   role:"admin",   title:"Office Administrator",   email:"a.khan@pegah.ca",   phone:"416 739 9308", status:"Active",   since:"2022" },
  ];
  for (const u of users) await db.user.upsert({ where: { id: u.id }, update: u, create: u });

  // ── Clients ───────────────────────────────────────────────────────────────
  const clients = [
    { id:"c1", name:"Harbourside Holdings",     sector:"Commercial",     contact:"R. Mensah",   email:"rm@harbourside.example", phone:"905 555 0148", since:"2019" },
    { id:"c2", name:"Northfield Logistics",     sector:"Industrial",     contact:"K. Patel",    email:"kp@northfield.example",  phone:"905 555 0192", since:"2021" },
    { id:"c3", name:"Maple Grove Developments", sector:"Residential",    contact:"L. Tremblay", email:"lt@maplegrove.example",  phone:"289 555 0110", since:"2020" },
    { id:"c4", name:"Metrolinx Regional",       sector:"Transportation", contact:"D. Okonkwo",  email:"do@metro.example",       phone:"416 555 0177", since:"2018" },
    { id:"c5", name:"City of Markham",          sector:"Recreational",   contact:"S. Nguyen",   email:"sn@markham.example",     phone:"905 555 0133", since:"2017" },
    { id:"c6", name:"Queen West Retail Group",  sector:"Retail",         contact:"B. Cohen",    email:"bc@qwrg.example",        phone:"416 555 0159", since:"2022" },
    { id:"c7", name:"Cambridge Heritage Trust", sector:"Historical",     contact:"M. Flores",   email:"mf@chtrust.example",     phone:"519 555 0124", since:"2019" },
    { id:"c8", name:"Parkview Corporate",       sector:"Commercial",     contact:"H. Lee",      email:"hl@parkview.example",    phone:"905 555 0186", since:"2023" },
  ];
  for (const c of clients) await db.client.upsert({ where: { id: c.id }, update: c, create: c });

  // ── Projects + milestones + team ──────────────────────────────────────────
  const projects = [
    { id:"p1", name:"Harbourside Commercial Centre",   clientId:"c1", sector:"Commercial",    status:"In Progress", progress:68,  budget:4200000,  spent:2730000,  start:"2023-03", end:"2025-09", pmId:"u2", foremanId:"u3", location:"Toronto, ON",    team:["u2","u3","u6"],
      milestones:[{n:"Site mobilization",d:"2023-04",done:true},{n:"Foundation complete",d:"2023-09",done:true},{n:"Structure topped out",d:"2024-06",done:true},{n:"Envelope & glazing",d:"2025-02",done:false},{n:"Interior fit-out",d:"2025-07",done:false},{n:"Handover",d:"2025-09",done:false}] },
    { id:"p2", name:"Northfield Distribution Facility",clientId:"c2", sector:"Industrial",    status:"In Progress", progress:42,  budget:8500000,  spent:3120000,  start:"2024-01", end:"2025-12", pmId:"u4", foremanId:"u5", location:"Mississauga, ON", team:["u4","u5"],
      milestones:[{n:"Earthworks",d:"2024-02",done:true},{n:"Slab & foundations",d:"2024-07",done:true},{n:"Steel erection",d:"2025-01",done:false},{n:"Cladding",d:"2025-06",done:false},{n:"M&E fit-out",d:"2025-10",done:false},{n:"Commissioning",d:"2025-12",done:false}] },
    { id:"p3", name:"Maple Grove Residences",          clientId:"c3", sector:"Residential",   status:"Planning",    progress:12,  budget:12000000, spent:640000,   start:"2024-09", end:"2026-08", pmId:"u2", foremanId:"u3", location:"Vaughan, ON",    team:["u2","u3"],
      milestones:[{n:"Permits & approvals",d:"2024-11",done:true},{n:"Site prep",d:"2025-02",done:false},{n:"Phase 1 framing",d:"2025-08",done:false},{n:"Phase 2 framing",d:"2026-01",done:false},{n:"Occupancy",d:"2026-08",done:false}] },
    { id:"p4", name:"Lakeshore Transit Hub",           clientId:"c4", sector:"Transportation",status:"On Hold",     progress:55,  budget:22000000, spent:11440000, start:"2022-06", end:"2025-04", pmId:"u4", foremanId:"u7", location:"Hamilton, ON",   team:["u4","u7"],
      milestones:[{n:"Demolition",d:"2022-08",done:true},{n:"Substructure",d:"2023-03",done:true},{n:"Platform works",d:"2024-01",done:true},{n:"Concourse",d:"2024-09",done:false},{n:"Systems & testing",d:"2025-02",done:false}] },
    { id:"p5", name:"Riverbend Recreation Complex",    clientId:"c5", sector:"Recreational",  status:"In Progress", progress:80,  budget:9800000,  spent:7210000,  start:"2023-01", end:"2025-02", pmId:"u6", foremanId:"u5", location:"Markham, ON",    team:["u6","u5"],
      milestones:[{n:"Foundations",d:"2023-04",done:true},{n:"Pool tank",d:"2023-11",done:true},{n:"Superstructure",d:"2024-06",done:true},{n:"Interior finishes",d:"2024-12",done:false},{n:"Handover",d:"2025-02",done:false}] },
    { id:"p6", name:"Queen Street Retail Pavilion",    clientId:"c6", sector:"Retail",        status:"Complete",    progress:100, budget:3400000,  spent:3320000,  start:"2022-05", end:"2023-08", pmId:"u2", foremanId:"u7", location:"Toronto, ON",    team:["u2","u7"],
      milestones:[{n:"Fit-out start",d:"2022-06",done:true},{n:"Storefront",d:"2022-11",done:true},{n:"MEP",d:"2023-03",done:true},{n:"Handover",d:"2023-08",done:true}] },
    { id:"p7", name:"Heritage Mill Restoration",       clientId:"c7", sector:"Historical",    status:"In Progress", progress:35,  budget:5100000,  spent:1785000,  start:"2024-03", end:"2025-11", pmId:"u6", foremanId:"u3", location:"Cambridge, ON",  team:["u6","u3"],
      milestones:[{n:"Conservation survey",d:"2024-04",done:true},{n:"Structural stabilization",d:"2024-10",done:false},{n:"Masonry restoration",d:"2025-04",done:false},{n:"Adaptive fit-out",d:"2025-09",done:false},{n:"Handover",d:"2025-11",done:false}] },
    { id:"p8", name:"Parkview Corporate Campus",       clientId:"c8", sector:"Commercial",    status:"In Progress", progress:22,  budget:18000000, spent:3960000,  start:"2024-06", end:"2026-12", pmId:"u4", foremanId:"u5", location:"Oakville, ON",   team:["u4","u5"],
      milestones:[{n:"Enabling works",d:"2024-08",done:true},{n:"Building A core",d:"2025-03",done:false},{n:"Building B core",d:"2025-10",done:false},{n:"Campus landscaping",d:"2026-06",done:false},{n:"Handover",d:"2026-12",done:false}] },
  ];
  for (const { milestones, team, ...p } of projects) {
    await db.project.upsert({ where: { id: p.id }, update: p, create: p });
    await db.milestone.deleteMany({ where: { projectId: p.id } });
    await db.milestone.createMany({ data: milestones.map((m) => ({ ...m, projectId: p.id })) });
    await db.projectTeam.deleteMany({ where: { projectId: p.id } });
    await db.projectTeam.createMany({ data: team.map((uid) => ({ projectId: p.id, userId: uid })) });
  }

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const tasks = [
    { id:"t1",  title:"Submit envelope shop drawings",        projectId:"p1", assigneeId:"u3", due:"2025-01-18", status:"In Progress", priority:"High" },
    { id:"t2",  title:"Coordinate glazing subcontractor",     projectId:"p1", assigneeId:"u2", due:"2025-01-22", status:"To Do",       priority:"Medium" },
    { id:"t3",  title:"Steel delivery inspection",            projectId:"p2", assigneeId:"u5", due:"2025-01-15", status:"Blocked",     priority:"High" },
    { id:"t4",  title:"Finalize Phase 1 permit set",          projectId:"p3", assigneeId:"u2", due:"2025-01-30", status:"To Do",       priority:"High" },
    { id:"t5",  title:"Re-baseline schedule after hold",      projectId:"p4", assigneeId:"u4", due:"2025-01-20", status:"In Progress", priority:"High" },
    { id:"t6",  title:"Pool tank waterproofing sign-off",     projectId:"p5", assigneeId:"u5", due:"2025-01-14", status:"Done",        priority:"Medium" },
    { id:"t7",  title:"Masonry conservation method statement",projectId:"p7", assigneeId:"u3", due:"2025-01-25", status:"To Do",       priority:"Medium" },
    { id:"t8",  title:"Building A rebar inspection",          projectId:"p8", assigneeId:"u5", due:"2025-01-17", status:"In Progress", priority:"Low" },
    { id:"t9",  title:"Monthly cost report",                  projectId:"p1", assigneeId:"u2", due:"2025-01-28", status:"To Do",       priority:"Medium" },
    { id:"t10", title:"Site safety walk — week 3",            projectId:"p5", assigneeId:"u6", due:"2025-01-16", status:"Done",        priority:"High" },
  ];
  for (const t of tasks) await db.task.upsert({ where: { id: t.id }, update: t, create: t });

  // ── Incidents ─────────────────────────────────────────────────────────────
  const incidents = [
    { id:"s1", projectId:"p1", date:"2025-01-09", type:"Near miss", severity:"Medium", status:"Under review", reportedById:"u3", note:"Unsecured load near loading bay." },
    { id:"s2", projectId:"p2", date:"2025-01-07", type:"Hazard",    severity:"Low",    status:"Open",         reportedById:"u5", note:"Trip hazard from trailing cables." },
    { id:"s3", projectId:"p4", date:"2024-12-20", type:"First aid", severity:"Low",    status:"Closed",       reportedById:"u7", note:"Minor hand laceration, treated on site." },
    { id:"s4", projectId:"p5", date:"2025-01-11", type:"Hazard",    severity:"Medium", status:"Open",         reportedById:"u6", note:"Guardrail missing on level 2 edge." },
    { id:"s5", projectId:"p8", date:"2025-01-05", type:"Lost time", severity:"High",   status:"Under review", reportedById:"u5", note:"Slip on wet slab; 2 days lost." },
    { id:"s6", projectId:"p7", date:"2024-12-15", type:"Near miss", severity:"Low",    status:"Closed",       reportedById:"u3", note:"Falling debris during demolition." },
  ];
  for (const s of incidents) await db.incident.upsert({ where: { id: s.id }, update: s, create: s });

  // ── Documents ─────────────────────────────────────────────────────────────
  const docs = [
    { id:"d1", name:"Harbourside — Tender Drawings Rev C", type:"DWG",  projectId:"p1", size:"42.1 MB", updated:"2025-01-08", ownerId:"u2" },
    { id:"d2", name:"Harbourside — Monthly Cost Report",   type:"XLSX", projectId:"p1", size:"1.2 MB",  updated:"2025-01-10", ownerId:"u2" },
    { id:"d3", name:"Northfield — Structural Steel Spec",  type:"PDF",  projectId:"p2", size:"3.8 MB",  updated:"2024-12-22", ownerId:"u4" },
    { id:"d4", name:"Maple Grove — Permit Package",        type:"PDF",  projectId:"p3", size:"18.6 MB", updated:"2024-11-30", ownerId:"u2" },
    { id:"d5", name:"Lakeshore — Schedule Rebaseline",     type:"XLSX", projectId:"p4", size:"2.4 MB",  updated:"2025-01-12", ownerId:"u4" },
    { id:"d6", name:"Riverbend — O&M Manual Draft",        type:"DOCX", projectId:"p5", size:"9.1 MB",  updated:"2025-01-06", ownerId:"u6" },
    { id:"d7", name:"Heritage Mill — Conservation Survey", type:"PDF",  projectId:"p7", size:"27.3 MB", updated:"2024-12-18", ownerId:"u6" },
    { id:"d8", name:"Parkview — Site Logistics Plan",      type:"DWG",  projectId:"p8", size:"15.0 MB", updated:"2025-01-09", ownerId:"u4" },
    { id:"d9", name:"Company — Health & Safety Policy",    type:"PDF",  projectId:null, size:"0.8 MB",  updated:"2024-10-01", ownerId:"u1" },
  ];
  for (const d of docs) await db.doc.upsert({ where: { id: d.id }, update: d, create: d });

  // ── Tenders ───────────────────────────────────────────────────────────────
  const tenders = [
    { id:"tn1",  ref:"CB-2025-0481", title:"General Contractor — Federal Building Envelope Renewal",       org:"Public Services and Procurement Canada", platform:"Canada Buys",      type:"RFP", category:"Commercial",     value:8200000,  province:"ON", city:"Ottawa",    published:"2025-01-04", closing:"2025-02-12", status:"Open",         tracked:true,  contactName:"Procurement Office", contactEmail:"bids@pwgsc.gc.ca",       contactPhone:"613 555 0100", note:"Strong fit — our envelope experience on Harbourside.", desc:"Construction services for the renewal of the building envelope including glazing, cladding and roofing across a 6-storey federal office." },
    { id:"tn2",  ref:"OT-44192",     title:"Construction Management — Regional Water Treatment Upgrade",   org:"Region of Peel",                          platform:"Ontario Tenders",  type:"RFQ", category:"Industrial",     value:14500000, province:"ON", city:"Brampton", published:"2025-01-06", closing:"2025-01-29", status:"Closing soon", tracked:true,  contactName:"K. Walsh",           contactEmail:"procurement@peelregion.ca",contactPhone:"905 555 0110", note:null,                                                              desc:"Construction management services for mechanical and process upgrades to an existing water treatment facility." },
    { id:"tn3",  ref:"TO-2025-118",  title:"Prime Contractor — Community Recreation Centre Fit-out",       org:"City of Toronto",                         platform:"City of Toronto",  type:"ITT", category:"Recreational",   value:6400000,  province:"ON", city:"Toronto",  published:"2025-01-08", closing:"2025-02-05", status:"Open",         tracked:false, contactName:"Bid Desk",           contactEmail:"bids@toronto.ca",        contactPhone:"416 555 0120", note:null,                                                              desc:"Interior fit-out and finishing of a new community recreation centre including pool mechanical." },
    { id:"tn4",  ref:"MERX-99812",   title:"Design-Build — Transit Maintenance Facility",                  org:"Metrolinx",                               platform:"Metrolinx",        type:"RFP", category:"Transportation", value:38000000, province:"ON", city:"Hamilton",  published:"2024-12-18", closing:"2025-02-28", status:"Open",         tracked:true,  contactName:"Capital Projects",   contactEmail:"tenders@metrolinx.com",  contactPhone:"416 555 0130", note:"Large — would need a JV partner.",                                desc:"Design and construction of a new transit vehicle maintenance and storage facility." },
    { id:"tn5",  ref:"BID-7740",     title:"General Contractor — Long-Term Care Renovation",               org:"Ontario Health",                          platform:"Biddingo",         type:"RFP", category:"Institutional",  value:5100000,  province:"ON", city:"London",   published:"2025-01-02", closing:"2025-01-24", status:"Closing soon", tracked:false, contactName:"Facilities",         contactEmail:"procure@ontariohealth.ca",contactPhone:"519 555 0140", note:null,                                                              desc:"Phased renovation of a 120-bed long-term care home while remaining partially occupied." },
    { id:"tn6",  ref:"BT-2025-220",  title:"Retail Pavilion Base Building",                                org:"Queen West BIA",                          platform:"Bids&Tenders",     type:"ITT", category:"Retail",         value:3300000,  province:"ON", city:"Toronto",  published:"2025-01-09", closing:"2025-02-09", status:"Open",         tracked:false, contactName:"D. Cohen",           contactEmail:"projects@qwbia.ca",      contactPhone:"416 555 0150", note:null,                                                              desc:"Base-building construction for a street-level retail pavilion." },
    { id:"tn7",  ref:"BON-5521",     title:"Heritage Masonry Restoration",                                 org:"Cambridge Heritage Trust",                platform:"Bonfire",          type:"RFQ", category:"Historical",     value:2700000,  province:"ON", city:"Cambridge",published:"2024-12-20", closing:"2025-01-20", status:"Closed",       tracked:false, contactName:"M. Flores",          contactEmail:"trust@cambridge.ca",     contactPhone:"519 555 0160", note:null,                                                              desc:"Restoration of heritage masonry façade and structural stabilization." },
    { id:"tn8",  ref:"CC-88210",     title:"Industrial Warehouse Expansion",                               org:"Northfield Logistics",                    platform:"ConstructConnect", type:"RFP", category:"Industrial",     value:9800000,  province:"ON", city:"Mississauga",published:"2025-01-07",closing:"2025-02-18", status:"Open",         tracked:true,  contactName:"K. Patel",           contactEmail:"kp@northfield.example",  contactPhone:"905 555 0170", note:"Existing client — warm lead.",                                    desc:"Expansion of an existing distribution facility including additional loading docks and mezzanine." },
    { id:"tn9",  ref:"PW-1043",      title:"Corporate Campus — Building B Core & Shell",                   org:"Parkview Corporate",                      platform:"PendingWorks",     type:"RFP", category:"Commercial",     value:21000000, province:"ON", city:"Oakville",  published:"2025-01-05", closing:"2025-03-01", status:"Open",         tracked:false, contactName:"H. Lee",             contactEmail:"hl@parkview.example",    contactPhone:"905 555 0180", note:null,                                                              desc:"Core-and-shell construction of the second building in a phased corporate campus." },
    { id:"tn10", ref:"CB-2025-0512", title:"School Board — Gymnasium Addition",                            org:"Halton District School Board",            platform:"Canada Buys",      type:"ITT", category:"Institutional",  value:4400000,  province:"ON", city:"Burlington",published:"2025-01-10", closing:"2025-02-14", status:"Open",         tracked:false, contactName:"Capital Planning",   contactEmail:"tenders@hdsb.ca",        contactPhone:"905 555 0190", note:null,                                                              desc:"Construction of a gymnasium addition and associated change rooms at an existing secondary school." },
  ];
  for (const t of tenders) await db.tender.upsert({ where: { id: t.id }, update: t, create: t });

  // ── Board cards ───────────────────────────────────────────────────────────
  const cards = [
    { id:"k1", title:"Draft prequalification for Metrolinx RFP",      col:"doing",     projectId:"p4", assigneeId:"u4", priority:"High",   due:"2025-01-22",
      subtasks:[{t:"Pull past transit experience",done:true},{t:"Safety record summary",done:true},{t:"Reference letters",done:false}],
      comments:[{who:"u1",when:"1d ago",text:"Loop in Sarah for the exec summary."},{who:"u4",when:"3h ago",text:"Draft is 60% there."}] },
    { id:"k2", title:"Upload Harbourside envelope shop drawings",       col:"review",    projectId:"p1", assigneeId:"u3", priority:"Medium", due:"2025-01-18",
      subtasks:[{t:"Collect Rev C set",done:true},{t:"QA against spec",done:true}],
      comments:[{who:"u2",when:"5h ago",text:"Looks good, approving today."}] },
    { id:"k3", title:"Steel delivery blocked — chase supplier",         col:"stuck",     projectId:"p2", assigneeId:"u5", priority:"High",   due:"2025-01-15",
      subtasks:[{t:"Confirm revised ETA",done:false},{t:"Notify PM",done:true}],
      comments:[{who:"u5",when:"2d ago",text:"Supplier says 2-week slip."}] },
    { id:"k4", title:"Publish Heritage Mill case study",                col:"completed", projectId:"p7", assigneeId:"u6", priority:"Low",    due:"2024-12-19",
      subtasks:[{t:"Write article",done:true},{t:"Select cover image",done:true},{t:"Publish",done:true}],
      comments:[] },
    { id:"k5", title:"Finalize Maple Grove Phase 1 permit set",         col:"new",       projectId:"p3", assigneeId:"u2", priority:"High",   due:"2025-01-30",
      subtasks:[{t:"Architectural set",done:false},{t:"Structural set",done:false}],
      comments:[] },
    { id:"k6", title:"Monthly cost report — Harbourside",               col:"new",       projectId:"p1", assigneeId:"u2", priority:"Medium", due:"2025-01-28",
      subtasks:[], comments:[] },
    { id:"k7", title:"Site safety walk — Riverbend week 3",             col:"doing",     projectId:"p5", assigneeId:"u6", priority:"High",   due:"2025-01-16",
      subtasks:[{t:"Inspect level 2 edge protection",done:false}],
      comments:[{who:"u6",when:"6h ago",text:"Guardrail issue logged as incident."}] },
    { id:"k8", title:"Track Northfield warehouse tender",                col:"review",    projectId:"p2", assigneeId:"u4", priority:"Medium", due:"2025-02-18",
      subtasks:[{t:"Confirm bid/no-bid",done:true}],
      comments:[] },
  ];
  for (const { subtasks, comments, ...card } of cards) {
    await db.card.upsert({ where: { id: card.id }, update: card, create: card });
    await db.cardSubtask.deleteMany({ where: { cardId: card.id } });
    await db.cardSubtask.createMany({ data: subtasks.map((s) => ({ ...s, cardId: card.id })) });
    await db.cardComment.deleteMany({ where: { cardId: card.id } });
    await db.cardComment.createMany({ data: comments.map((c) => ({ ...c, cardId: card.id })) });
  }

  // ── Activity feed ─────────────────────────────────────────────────────────
  await db.activity.deleteMany();
  await db.activity.createMany({
    data: [
      { who:"u3", what:"reported a near miss on", projectId:"p1", when:"2h ago" },
      { who:"u4", what:"rebaselined the schedule for", projectId:"p4", when:"5h ago" },
      { who:"u6", what:"uploaded O&M manual draft to", projectId:"p5", when:"1d ago" },
      { who:"u2", what:'closed task "Pool tank sign-off" on', projectId:"p5", when:"1d ago" },
      { who:"u5", what:"flagged steel delivery blocked on", projectId:"p2", when:"2d ago" },
      { who:"u1", what:"added a new client", projectId:null, when:"3d ago" },
    ],
  });

  // ── Articles ──────────────────────────────────────────────────────────────
  const articles = [
    { id:"n1", title:"Inside the Harbourside Commercial Centre Build",      slug:"harbourside-commercial-centre",    projectId:"p1", authorId:"u2", status:"Published", date:"2025-01-08", tags:JSON.stringify(["Commercial","Design-Build"]), featured:true,  excerpt:"How our team delivered a multi-tenant commercial centre on an accelerated design-build schedule.", words:740 },
    { id:"n2", title:"Northfield Distribution Facility: Building at Scale", slug:"northfield-distribution-facility", projectId:"p2", authorId:"u4", status:"Published", date:"2025-01-03", tags:JSON.stringify(["Industrial"]),                featured:false, excerpt:"A large-footprint distribution and warehousing facility built to operational spec.", words:680 },
    { id:"n3", title:"Restoring the Heritage Mill: Old Bones, New Life",    slug:"heritage-mill-restoration",        projectId:"p7", authorId:"u6", status:"Published", date:"2024-12-19", tags:JSON.stringify(["Historical","Restoration"]),  featured:true,  excerpt:"Careful conservation of a heritage structure for contemporary use.", words:820 },
    { id:"n4", title:"Riverbend Recreation Complex Nears Completion",       slug:"riverbend-recreation-complex",     projectId:"p5", authorId:"u6", status:"Published", date:"2024-12-11", tags:JSON.stringify(["Recreational"]),              featured:false, excerpt:"A community recreation complex delivered as a single accountable design-build.", words:610 },
    { id:"n5", title:"What Design-Build Means for Your Project Timeline",   slug:"design-build-timeline",            projectId:null, authorId:"u1", status:"Draft",     date:"2025-01-11", tags:JSON.stringify(["Insights","Design-Build"]),   featured:false, excerpt:"Why one accountable team from concept to handover can compress your schedule.", words:540 },
    { id:"n6", title:"Safety First: Our Approach on Every Site",            slug:"safety-first-approach",            projectId:null, authorId:"u1", status:"Draft",     date:"2025-01-09", tags:JSON.stringify(["Safety"]),                    featured:false, excerpt:"Quality construction delivered safely is an attainable goal — here's how we hold to it.", words:500 },
  ];
  for (const a of articles) await db.article.upsert({ where: { id: a.id }, update: a, create: a });

  console.log("✓ Database seeded");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
