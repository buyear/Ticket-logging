import { useState, useEffect, useRef } from "react";

/* ─── Google Font ─── */
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#080b10;font-family:'Syne',sans-serif;}
    ::-webkit-scrollbar{width:6px;height:6px;}
    ::-webkit-scrollbar-track{background:#0d1117;}
    ::-webkit-scrollbar-thumb{background:#2a3040;border-radius:3px;}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes scanline{0%{transform:translateY(-100%);}100%{transform:translateY(100vh);}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    @keyframes blink{0%,100%{opacity:1;}49%{opacity:1;}50%{opacity:0;}99%{opacity:0;}}
    @keyframes barGrow{from{width:0;}to{width:var(--w);}}
    .fade-up{animation:fadeUp .4s ease forwards;}
    .stagger-1{animation-delay:.05s;opacity:0;}
    .stagger-2{animation-delay:.1s;opacity:0;}
    .stagger-3{animation-delay:.15s;opacity:0;}
    .stagger-4{animation-delay:.2s;opacity:0;}
    .stagger-5{animation-delay:.25s;opacity:0;}
  `}</style>
);

/* ─── DATA ─── */
const INCIDENTS = [
  {id:"INC-2201",title:"VPN drops during peak hours",service:"VPN Gateway",cat:"Network",pri:"High",date:"2026-01-03",days:4,status:"Closed",user:"A.Torres"},
  {id:"INC-2208",title:"VPN disconnects after 10 min",service:"VPN Gateway",cat:"Network",pri:"High",date:"2026-01-09",days:3,status:"Closed",user:"A.Torres"},
  {id:"INC-2219",title:"Unable to connect VPN from home",service:"VPN Gateway",cat:"Network",pri:"Medium",date:"2026-01-15",days:5,status:"Closed",user:"S.Reed"},
  {id:"INC-2231",title:"VPN keeps dropping connection",service:"VPN Gateway",cat:"Network",pri:"High",date:"2026-01-22",days:4,status:"Closed",user:"A.Torres"},
  {id:"INC-2244",title:"VPN auth failures intermittent",service:"VPN Gateway",cat:"Network",pri:"Critical",date:"2026-01-28",days:2,status:"Closed",user:"S.Reed"},
  {id:"INC-2258",title:"VPN not reconnecting after sleep",service:"VPN Gateway",cat:"Network",pri:"Medium",date:"2026-02-04",days:3,status:"Open",user:"A.Torres"},
  {id:"INC-2212",title:"Outlook not syncing emails",service:"Microsoft 365",cat:"Email",pri:"High",date:"2026-01-05",days:6,status:"Closed",user:"J.Lin"},
  {id:"INC-2225",title:"Email sync delay >30 min",service:"Microsoft 365",cat:"Email",pri:"High",date:"2026-01-18",days:7,status:"Closed",user:"J.Lin"},
  {id:"INC-2239",title:"Outlook calendar not updating",service:"Microsoft 365",cat:"Email",pri:"Medium",date:"2026-01-25",days:5,status:"Closed",user:"C.Walsh"},
  {id:"INC-2252",title:"Emails missing from inbox",service:"Microsoft 365",cat:"Email",pri:"High",date:"2026-02-02",days:null,status:"Open",user:"J.Lin"},
  {id:"INC-2263",title:"Outlook crashes on attach open",service:"Microsoft 365",cat:"Email",pri:"Medium",date:"2026-02-10",days:null,status:"Open",user:"C.Walsh"},
  {id:"INC-2205",title:"SAP login page not loading",service:"SAP ERP",cat:"Application",pri:"Critical",date:"2026-01-04",days:1,status:"Closed",user:"M.Park"},
  {id:"INC-2217",title:"SAP reports timing out",service:"SAP ERP",cat:"Application",pri:"High",date:"2026-01-12",days:8,status:"Closed",user:"M.Park"},
  {id:"INC-2230",title:"SAP module unavailable",service:"SAP ERP",cat:"Application",pri:"Critical",date:"2026-01-20",days:2,status:"Closed",user:"M.Park"},
  {id:"INC-2243",title:"SAP transaction SE38 error",service:"SAP ERP",cat:"Application",pri:"High",date:"2026-01-30",days:5,status:"Closed",user:"T.Vance"},
  {id:"INC-2254",title:"SAP batch job failures",service:"SAP ERP",cat:"Application",pri:"Critical",date:"2026-02-08",days:null,status:"Open",user:"M.Park"},
  {id:"INC-2209",title:"Printer offline Floor 3",service:"Print Services",cat:"Hardware",pri:"Low",date:"2026-01-05",days:2,status:"Closed",user:"D.Mills"},
  {id:"INC-2222",title:"Network printer not responding",service:"Print Services",cat:"Hardware",pri:"Low",date:"2026-01-14",days:3,status:"Closed",user:"D.Mills"},
  {id:"INC-2238",title:"Print queue stuck – Finance",service:"Print Services",cat:"Hardware",pri:"Low",date:"2026-01-25",days:1,status:"Closed",user:"D.Mills"},
  {id:"INC-2249",title:"Driver conflict after Win update",service:"Print Services",cat:"Hardware",pri:"Medium",date:"2026-02-01",days:null,status:"Open",user:"D.Mills"},
  {id:"INC-2203",title:"Slow internet 2nd floor",service:"LAN / WiFi",cat:"Network",pri:"Medium",date:"2026-01-03",days:6,status:"Closed",user:"S.Reed"},
  {id:"INC-2216",title:"WiFi drops in conference rooms",service:"LAN / WiFi",cat:"Network",pri:"High",date:"2026-01-11",days:4,status:"Closed",user:"S.Reed"},
  {id:"INC-2229",title:"Network degraded – Building B",service:"LAN / WiFi",cat:"Network",pri:"High",date:"2026-01-19",days:null,status:"Open",user:"A.Torres"},
];

const PROBLEM_TEMPLATES = {
  "VPN Gateway":    { rc:"Possible load-balancer misconfiguration or certificate expiry under concurrent session load.", wa:"Restart VPN client; reconnect manually. Limit sessions per user as interim measure." },
  "Microsoft 365":  { rc:"Exchange Online throttling policies triggered by high mailbox activity; potential OAuth token refresh failure.", wa:"Re-launch Outlook; clear credential cache. Use OWA as fallback." },
  "SAP ERP":        { rc:"Database connection pool exhaustion during scheduled batch windows; ABAP job overlaps.", wa:"Restart SAP GUI session; defer non-critical batch jobs to off-peak." },
  "Print Services": { rc:"Stale print spooler state after cumulative Windows updates; driver version mismatch.", wa:"Restart Print Spooler service on server; delete stuck jobs manually." },
  "LAN / WiFi":     { rc:"AP channel saturation and DHCP lease exhaustion in high-density zones.", wa:"Switch to 5GHz band; reboot AP; use wired connection where possible." },
};

function cluster(incidents) {
  const map = {};
  incidents.forEach(i => {
    if (!map[i.service]) map[i.service] = [];
    map[i.service].push(i);
  });
  return Object.entries(map).filter(([,v]) => v.length >= 3).map(([svc, incs]) => {
    const closedDays = incs.filter(i=>i.days).map(i=>i.days);
    const avgDays = closedDays.length ? (closedDays.reduce((a,b)=>a+b,0)/closedDays.length).toFixed(1) : "N/A";
    const critHigh = incs.filter(i=>i.pri==="Critical"||i.pri==="High").length;
    const open = incs.filter(i=>i.status==="Open").length;
    const risk = Math.min(10, +(incs.length*1.1 + critHigh*1.6 + open*2.2).toFixed(1));
    const dates = incs.map(i=>i.date).sort();
    const tpl = PROBLEM_TEMPLATES[svc] || {rc:"Under investigation.",wa:"Apply per-incident workaround."};
    return { svc, incs, count:incs.length, avgDays, critHigh, open, risk, firstDate:dates[0], lastDate:dates[dates.length-1], cat:incs[0].cat, ...tpl };
  }).sort((a,b)=>b.risk-a.risk);
}

/* ─── COLOUR HELPERS ─── */
const PRI = { Critical:"#ff3b3b", High:"#ff7a00", Medium:"#f0c040", Low:"#3ecf8e" };
const riskColor = r => r>=8?"#ff3b3b":r>=6?"#ff7a00":r>=4?"#f0c040":"#3ecf8e";
const CAT_ICON = { Network:"◈", Email:"◉", Application:"▣", Hardware:"◆" };

/* ─── PROBLEM RECORDS store ─── */
let _pid = 1;
const makeProblem = (pattern) => ({
  id: `PRB-${String(1000 + _pid++).padStart(4,"0")}`,
  title: `Recurring ${pattern.svc} Failures — Root Cause Analysis`,
  service: pattern.svc,
  category: pattern.cat,
  priority: pattern.risk>=8?"Critical":pattern.risk>=6?"High":"Medium",
  status: "Logged",
  raisedDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now()+14*864e5).toISOString().split("T")[0],
  owner: pattern.incs[0].user,
  relatedIncs: pattern.incs.map(i=>i.id),
  rootCause: pattern.rc,
  workaround: pattern.wa,
  impact: `${pattern.count} incidents; ${pattern.critHigh} Critical/High; ${pattern.open} still open.`,
  risk: pattern.risk,
  notes: "",
});

/* ══════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════ */
export default function App() {
  const patterns = cluster(INCIDENTS);
  const [tab, setTab] = useState("dashboard");
  const [problems, setProblems] = useState([]);
  const [modal, setModal] = useState(null);      // pattern → create problem
  const [detail, setDetail] = useState(null);    // problem detail
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");

  const alreadyLogged = svc => problems.some(p=>p.service===svc);

  const createProblem = (pattern) => {
    const p = makeProblem(pattern);
    setProblems(prev=>[p,...prev]);
    setModal(null);
  };

  const cats = ["All", ...Array.from(new Set(patterns.map(p=>p.cat)))];
  const filtered = patterns.filter(p =>
    (filterCat==="All"||p.cat===filterCat) &&
    (search===""||p.svc.toLowerCase().includes(search.toLowerCase()))
  );

  /* KPI */
  const totalIncs = INCIDENTS.length;
  const openIncs  = INCIDENTS.filter(i=>i.status==="Open").length;
  const avgRisk   = patterns.length ? (patterns.reduce((s,p)=>s+p.risk,0)/patterns.length).toFixed(1) : 0;

  return (
    <>
      <FontLink />
      <div style={{minHeight:"100vh",background:"#080b10",color:"#c8cdd8",fontFamily:"'Syne',sans-serif",position:"relative",overflow:"hidden"}}>
        {/* scanline overlay */}
        <div style={{pointerEvents:"none",position:"fixed",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,180,.012) 2px,rgba(0,255,180,.012) 4px)",zIndex:0}}/>

        {/* HEADER */}
        <header style={{borderBottom:"1px solid #1e2535",padding:"0 32px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"rgba(8,11,16,.96)",backdropFilter:"blur(12px)",zIndex:100}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:32,height:32,background:"linear-gradient(135deg,#00e5a0,#00bcd4)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#080b10"}}>P</div>
            <div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#3ecf8e",letterSpacing:3,textTransform:"uppercase"}}>ServiceDesk Plus</div>
              <div style={{fontSize:17,fontWeight:800,color:"#eef0f5",lineHeight:1,letterSpacing:-.3}}>Proactive Problem Management</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {["dashboard","patterns","problems"].map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{background:tab===t?"rgba(62,207,142,.12)":"transparent",border:tab===t?"1px solid #3ecf8e55":"1px solid transparent",color:tab===t?"#3ecf8e":"#667",borderRadius:6,padding:"6px 16px",fontSize:12,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",cursor:"pointer",transition:"all .2s"}}>
                {t}
              </button>
            ))}
            <div style={{marginLeft:8,background:"#3ecf8e",color:"#080b10",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:800,letterSpacing:1}}>
              {problems.length} PRBs
            </div>
          </div>
        </header>

        <main style={{padding:"28px 32px",position:"relative",zIndex:1}}>
          {tab==="dashboard" && <Dashboard patterns={patterns} incidents={INCIDENTS} problems={problems} totalIncs={totalIncs} openIncs={openIncs} avgRisk={avgRisk} setTab={setTab}/>}
          {tab==="patterns" && <Patterns filtered={filtered} patterns={patterns} cats={cats} filterCat={filterCat} setFilterCat={setFilterCat} search={search} setSearch={setSearch} alreadyLogged={alreadyLogged} setModal={setModal}/>}
          {tab==="problems" && <Problems problems={problems} setDetail={setDetail}/>}
        </main>

        {/* CREATE PROBLEM MODAL */}
        {modal && <CreateModal pattern={modal} onClose={()=>setModal(null)} onCreate={createProblem}/>}
        {/* DETAIL MODAL */}
        {detail && <DetailModal problem={detail} onClose={()=>setDetail(null)} onUpdate={(p)=>{setProblems(prev=>prev.map(x=>x.id===p.id?p:x));setDetail(p);}}/>}
      </div>
    </>
  );
}

/* ══════ DASHBOARD ══════ */
function Dashboard({patterns,incidents,problems,totalIncs,openIncs,avgRisk,setTab}) {
  const kpis = [
    {label:"Total Incidents",val:totalIncs,sub:"Jan – Feb 2026",color:"#3ecf8e"},
    {label:"Open Incidents",val:openIncs,sub:"Requiring action",color:"#ff7a00"},
    {label:"Recurring Patterns",val:patterns.length,sub:"Identified clusters",color:"#00bcd4"},
    {label:"Problem Records",val:problems.length,sub:"Logged this period",color:"#c97bff"},
    {label:"Avg Risk Score",val:avgRisk,sub:"Across all patterns",color:riskColor(+avgRisk)},
    {label:"Critical/High",val:incidents.filter(i=>i.pri==="Critical"||i.pri==="High").length,sub:"High-severity tickets",color:"#ff3b3b"},
  ];

  /* bar chart data */
  const svcCount = {};
  incidents.forEach(i=>{svcCount[i.service]=(svcCount[i.service]||0)+1;});
  const barMax = Math.max(...Object.values(svcCount));
  const svcEntries = Object.entries(svcCount).sort((a,b)=>b[1]-a[1]);

  /* priority breakdown */
  const priCount = {};
  incidents.forEach(i=>{priCount[i.pri]=(priCount[i.pri]||0)+1;});

  return (
    <div className="fade-up">
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12,marginBottom:28}}>
        {kpis.map((k,i)=>(
          <div key={k.label} className={`fade-up stagger-${Math.min(i+1,5)}`}
            style={{background:"#0d1117",border:`1px solid ${k.color}28`,borderRadius:10,padding:"18px 16px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:k.color,opacity:.6}}/>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:28,fontWeight:600,color:k.color,lineHeight:1,marginBottom:4}}>{k.val}</div>
            <div style={{fontSize:11,fontWeight:700,color:"#eef0f5",letterSpacing:.5,marginBottom:2}}>{k.label}</div>
            <div style={{fontSize:10,color:"#445",fontFamily:"'IBM Plex Mono',monospace"}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        {/* Top Services Bar Chart */}
        <div style={{background:"#0d1117",border:"1px solid #1e2535",borderRadius:10,padding:22,gridColumn:"span 2"}}>
          <SectionLabel>Incident Volume by Service</SectionLabel>
          <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:10}}>
            {svcEntries.map(([svc,cnt])=>{
              const pct = (cnt/barMax*100).toFixed(0);
              const p = patterns.find(p=>p.svc===svc);
              const rc = p ? riskColor(p.risk) : "#445";
              return (
                <div key={svc}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:"#b0b8c8"}}>{svc}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:rc,fontWeight:600}}>{cnt} inc</span>
                  </div>
                  <div style={{height:8,background:"#151c28",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${rc}cc,${rc}55)`,borderRadius:4,transition:"width .8s ease"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div style={{background:"#0d1117",border:"1px solid #1e2535",borderRadius:10,padding:22}}>
          <SectionLabel>Priority Distribution</SectionLabel>
          <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:14}}>
            {["Critical","High","Medium","Low"].map(pri=>{
              const cnt = priCount[pri]||0;
              const pct = ((cnt/totalIncs)*100).toFixed(0);
              return (
                <div key={pri} style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:10,height:10,borderRadius:2,background:PRI[pri],flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,color:"#b0b8c8"}}>{pri}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:PRI[pri]}}>{cnt}</span>
                    </div>
                    <div style={{height:5,background:"#151c28",borderRadius:3}}>
                      <div style={{height:"100%",width:`${pct}%`,background:PRI[pri],borderRadius:3,opacity:.8}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Risk matrix snapshot */}
          <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid #1e2535"}}>
            <SectionLabel>Top Risk Patterns</SectionLabel>
            <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
              {patterns.slice(0,4).map(p=>(
                <div key={p.svc} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#8a95a8"}}>{p.svc}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:600,color:riskColor(p.risk)}}>{p.risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline strip */}
        <div style={{background:"#0d1117",border:"1px solid #1e2535",borderRadius:10,padding:22,gridColumn:"span 3"}}>
          <SectionLabel>Incident Timeline — Jan / Feb 2026</SectionLabel>
          <Timeline incidents={incidents}/>
        </div>
      </div>
    </div>
  );
}

/* ══════ TIMELINE ══════ */
function Timeline({incidents}) {
  const weeks = ["Jan W1","Jan W2","Jan W3","Jan W4","Feb W1","Feb W2"];
  const weekOf = d => {
    const day = parseInt(d.split("-")[2]);
    const mon = parseInt(d.split("-")[1]);
    if(mon===1){ return day<=7?0:day<=14?1:day<=21?2:3; }
    return day<=7?4:5;
  };
  const buckets = weeks.map((_,wi)=>incidents.filter(i=>weekOf(i.date)===wi));
  const maxB = Math.max(...buckets.map(b=>b.length));

  return (
    <div style={{marginTop:16,display:"flex",gap:10,alignItems:"flex-end",height:80}}>
      {buckets.map((b,wi)=>{
        const h = maxB>0?(b.length/maxB*64)+8:8;
        const hasOpen = b.some(i=>i.status==="Open");
        return (
          <div key={wi} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:"100%",height:h,background:hasOpen?"linear-gradient(180deg,#ff7a0088,#ff7a0033)":"linear-gradient(180deg,#3ecf8e66,#3ecf8e22)",borderRadius:"4px 4px 0 0",border:hasOpen?"1px solid #ff7a0055":"1px solid #3ecf8e44",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:hasOpen?"#ff7a00":"#3ecf8e",fontWeight:600}}>{b.length}</span>
            </div>
            <span style={{fontSize:9,color:"#445",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5}}>{weeks[wi]}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ══════ PATTERNS ══════ */
function Patterns({filtered,patterns,cats,filterCat,setFilterCat,search,setSearch,alreadyLogged,setModal}) {
  return (
    <div className="fade-up">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#3ecf8e",letterSpacing:3,textTransform:"uppercase",marginBottom:2}}>Pattern Analysis Engine</div>
          <h2 style={{fontSize:22,fontWeight:800,color:"#eef0f5",letterSpacing:-.4}}>{patterns.length} Recurring Incident Clusters Identified</h2>
        </div>
        <div style={{display:"flex",gap:10}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search service…"
            style={{background:"#0d1117",border:"1px solid #1e2535",borderRadius:8,color:"#c8cdd8",padding:"8px 14px",fontSize:12,fontFamily:"'IBM Plex Mono',monospace",width:180,outline:"none"}}/>
          <div style={{display:"flex",gap:6}}>
            {cats.map(c=>(
              <button key={c} onClick={()=>setFilterCat(c)}
                style={{background:filterCat===c?"rgba(62,207,142,.12)":"transparent",border:filterCat===c?"1px solid #3ecf8e55":"1px solid #1e2535",color:filterCat===c?"#3ecf8e":"#667",borderRadius:6,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:.6}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {filtered.map((p,i)=>(
          <PatternCard key={p.svc} pattern={p} idx={i} alreadyLogged={alreadyLogged(p.svc)} onLog={()=>setModal(p)}/>
        ))}
      </div>
    </div>
  );
}

function PatternCard({pattern:p,idx,alreadyLogged,onLog}) {
  const [open,setOpen] = useState(false);
  const rc = riskColor(p.risk);
  return (
    <div className={`fade-up stagger-${Math.min(idx+1,5)}`}
      style={{background:"#0d1117",border:`1px solid ${open?"#2a3a50":"#1a2030"}`,borderRadius:10,overflow:"hidden",transition:"border-color .2s"}}>
      {/* header row */}
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:16,cursor:"pointer"}} onClick={()=>setOpen(v=>!v)}>
        {/* risk gauge */}
        <div style={{width:48,height:48,borderRadius:8,background:rc+"18",border:`1px solid ${rc}44`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:rc,lineHeight:1}}>{p.risk}</span>
          <span style={{fontSize:8,color:rc+"99",letterSpacing:.5}}>RISK</span>
        </div>
        {/* title */}
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <span style={{fontSize:18,color:rc,marginRight:2}}>{CAT_ICON[p.cat]||"◈"}</span>
            <span style={{fontSize:15,fontWeight:700,color:"#eef0f5"}}>{p.svc}</span>
            <span style={{fontSize:10,color:rc,background:rc+"18",border:`1px solid ${rc}33`,borderRadius:4,padding:"1px 7px",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5}}>
              {p.risk>=8?"CRITICAL PATTERN":p.risk>=6?"HIGH RISK":p.risk>=4?"MODERATE":"LOW"}
            </span>
            {alreadyLogged && <span style={{fontSize:10,color:"#3ecf8e",background:"#3ecf8e18",border:"1px solid #3ecf8e33",borderRadius:4,padding:"1px 7px",letterSpacing:.5}}>✓ LOGGED</span>}
          </div>
          <div style={{display:"flex",gap:20}}>
            <Stat label="Incidents" val={p.count} color="#c8cdd8"/>
            <Stat label="Crit/High" val={p.critHigh} color={PRI.High}/>
            <Stat label="Open" val={p.open} color={p.open>0?"#ff7a00":"#445"}/>
            <Stat label="Avg Resolve" val={p.avgDays==="N/A"?p.avgDays:`${p.avgDays}h`} color="#c8cdd8"/>
            <Stat label="Period" val={`${p.firstDate} → ${p.lastDate}`} color="#667"/>
          </div>
        </div>
        {/* action */}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={e=>{e.stopPropagation();if(!alreadyLogged)onLog();}}
            style={{background:alreadyLogged?"transparent":"linear-gradient(135deg,#3ecf8e,#00bcd4)",border:alreadyLogged?"1px solid #2a3040":"none",color:alreadyLogged?"#445":"#080b10",borderRadius:7,padding:"8px 18px",fontSize:12,fontWeight:700,cursor:alreadyLogged?"default":"pointer",letterSpacing:.5}}>
            {alreadyLogged?"Problem Logged":"+ Create Problem"}
          </button>
          <span style={{color:"#445",fontSize:14,transform:open?"rotate(180deg)":"",transition:"transform .2s"}}>▼</span>
        </div>
      </div>

      {/* expandable details */}
      {open && (
        <div style={{borderTop:"1px solid #1a2030",padding:"16px 20px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,background:"#0a0e18"}}>
          <InfoBlock title="Related Incidents">
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
              {p.incs.map(i=>(
                <span key={i.id} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:i.status==="Open"?"#ff7a00":"#3ecf8e",background:i.status==="Open"?"#ff7a0014":"#3ecf8e14",border:`1px solid ${i.status==="Open"?"#ff7a0033":"#3ecf8e33"}`,borderRadius:4,padding:"2px 8px"}}>
                  {i.id}
                </span>
              ))}
            </div>
          </InfoBlock>
          <InfoBlock title="Probable Root Cause">
            <p style={{fontSize:12,color:"#8a95a8",lineHeight:1.7,marginTop:4}}>{p.rc}</p>
          </InfoBlock>
          <InfoBlock title="Interim Workaround">
            <p style={{fontSize:12,color:"#8a95a8",lineHeight:1.7,marginTop:4}}>{p.wa}</p>
          </InfoBlock>
        </div>
      )}
    </div>
  );
}

/* ══════ PROBLEMS ══════ */
function Problems({problems,setDetail}) {
  if(!problems.length) return (
    <div className="fade-up" style={{textAlign:"center",padding:"80px 0",color:"#2a3040"}}>
      <div style={{fontSize:48,marginBottom:16}}>◈</div>
      <div style={{fontSize:16,fontWeight:700,color:"#3a4255",marginBottom:6}}>No Problem Records Yet</div>
      <div style={{fontSize:12,color:"#2a3040",fontFamily:"'IBM Plex Mono',monospace"}}>Analyse patterns and create PRBs from the Patterns tab</div>
    </div>
  );

  const STATUS_COL = {Logged:"#3ecf8e","In Progress":"#00bcd4",Resolved:"#667",Closed:"#445"};
  return (
    <div className="fade-up">
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#3ecf8e",letterSpacing:3,textTransform:"uppercase",marginBottom:2}}>Problem Record Register</div>
        <h2 style={{fontSize:22,fontWeight:800,color:"#eef0f5",letterSpacing:-.4}}>{problems.length} Active Problem{problems.length!==1?"s":""}</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {problems.map((p,i)=>{
          const sc = STATUS_COL[p.status]||"#667";
          const rc = riskColor(p.risk);
          return (
            <div key={p.id} className={`fade-up stagger-${Math.min(i+1,5)}`}
              onClick={()=>setDetail(p)}
              style={{background:"#0d1117",border:"1px solid #1a2030",borderRadius:10,padding:"16px 20px",display:"flex",gap:16,alignItems:"center",cursor:"pointer",transition:"border-color .2s",borderLeft:`3px solid ${rc}`}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#3ecf8e",fontWeight:600,minWidth:90}}>{p.id}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"#eef0f5",marginBottom:4}}>{p.title}</div>
                <div style={{fontSize:11,color:"#667",fontFamily:"'IBM Plex Mono',monospace"}}>{p.impact}</div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <PriBadge pri={p.priority}/>
                <span style={{fontSize:11,color:sc,background:sc+"18",border:`1px solid ${sc}33`,borderRadius:4,padding:"3px 10px",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5}}>{p.status}</span>
                <span style={{fontSize:11,color:"#445",fontFamily:"'IBM Plex Mono',monospace"}}>{p.dueDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════ CREATE MODAL ══════ */
function CreateModal({pattern,onClose,onCreate}) {
  const [form,setForm] = useState({
    title:`Recurring ${pattern.svc} Failures — Root Cause Analysis`,
    priority: pattern.risk>=8?"Critical":pattern.risk>=6?"High":"Medium",
    owner: pattern.incs[0].user,
    dueDate: new Date(Date.now()+14*864e5).toISOString().split("T")[0],
    rootCause: pattern.rc,
    workaround: pattern.wa,
    impact:`${pattern.count} incidents over ${pattern.firstDate} to ${pattern.lastDate}; ${pattern.critHigh} Critical/High; ${pattern.open} open.`,
    notes:"",
  });
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",backdropFilter:"blur(6px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:"#0d1117",border:"1px solid #2a3a50",borderRadius:14,width:"100%",maxWidth:640,maxHeight:"90vh",overflow:"auto",padding:32,boxShadow:"0 24px 80px #000a"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#3ecf8e",letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>New Problem Record</div>
            <h2 style={{fontSize:20,fontWeight:800,color:"#eef0f5",letterSpacing:-.3}}>{pattern.svc}</h2>
            <div style={{fontSize:11,color:"#445",fontFamily:"'IBM Plex Mono',monospace",marginTop:2}}>{pattern.count} incidents · Risk {pattern.risk}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #1e2535",color:"#667",borderRadius:8,width:34,height:34,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        {[
          ["Problem Title","title","text"],
          ["Impact Statement","impact","text"],
          ["Root Cause (Current Assessment)","rootCause","textarea"],
          ["Workaround / Interim Fix","workaround","textarea"],
          ["Owner","owner","text"],
          ["Target Resolution Date","dueDate","date"],
          ["Notes","notes","textarea"],
        ].map(([label,key,type])=>(
          <div key={key} style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:10,fontWeight:700,color:"#667",letterSpacing:1.2,textTransform:"uppercase",marginBottom:5,fontFamily:"'IBM Plex Mono',monospace"}}>{label}</label>
            {type==="textarea"?(
              <textarea value={form[key]} onChange={e=>f(key,e.target.value)} rows={3}
                style={{width:"100%",background:"#080b10",border:"1px solid #1e2535",borderRadius:8,color:"#c8cdd8",padding:"10px 12px",fontSize:12,resize:"vertical",fontFamily:"'Syne',sans-serif",outline:"none",boxSizing:"border-box"}}/>
            ):(
              <input type={type} value={form[key]} onChange={e=>f(key,e.target.value)}
                style={{width:"100%",background:"#080b10",border:"1px solid #1e2535",borderRadius:8,color:"#c8cdd8",padding:"10px 12px",fontSize:12,fontFamily:"'Syne',sans-serif",outline:"none",boxSizing:"border-box"}}/>
            )}
          </div>
        ))}

        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:"#667",letterSpacing:1.2,textTransform:"uppercase",marginBottom:5,fontFamily:"'IBM Plex Mono',monospace"}}>Priority</label>
          <div style={{display:"flex",gap:8}}>
            {["Critical","High","Medium","Low"].map(pri=>(
              <button key={pri} onClick={()=>f("priority",pri)}
                style={{flex:1,background:form.priority===pri?PRI[pri]+"22":"transparent",border:`1px solid ${form.priority===pri?PRI[pri]:PRI[pri]+"33"}`,color:PRI[pri],borderRadius:7,padding:"8px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {pri}
              </button>
            ))}
          </div>
        </div>

        {/* Related incidents */}
        <div style={{marginBottom:24}}>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:"#667",letterSpacing:1.2,textTransform:"uppercase",marginBottom:8,fontFamily:"'IBM Plex Mono',monospace"}}>Linked Incidents ({pattern.incs.length})</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {pattern.incs.map(i=>(
              <span key={i.id} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:i.status==="Open"?"#ff7a00":"#3ecf8e",background:i.status==="Open"?"#ff7a0012":"#3ecf8e12",border:`1px solid ${i.status==="Open"?"#ff7a0033":"#3ecf8e33"}`,borderRadius:4,padding:"3px 8px"}}>
                {i.id}
              </span>
            ))}
          </div>
        </div>

        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid #1e2535",color:"#667",borderRadius:8,padding:"10px 22px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>onCreate({...pattern,formOverride:form})}
            style={{background:"linear-gradient(135deg,#3ecf8e,#00bcd4)",border:"none",color:"#080b10",borderRadius:8,padding:"10px 28px",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:.3}}>
            ✓ Log Problem Record
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════ DETAIL MODAL ══════ */
function DetailModal({problem,onClose,onUpdate}) {
  const [editing,setEditing] = useState(false);
  const [form,setForm] = useState({...problem});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const STATUSES = ["Logged","In Progress","Resolved","Closed"];
  const STATUS_COL = {Logged:"#3ecf8e","In Progress":"#00bcd4",Resolved:"#667",Closed:"#445"};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",backdropFilter:"blur(6px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:"#0d1117",border:"1px solid #2a3a50",borderRadius:14,width:"100%",maxWidth:700,maxHeight:"92vh",overflow:"auto",padding:32,boxShadow:"0 24px 80px #000a"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#3ecf8e",letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>{problem.id}</div>
            {editing ? (
              <input value={form.title} onChange={e=>f("title",e.target.value)}
                style={{background:"#080b10",border:"1px solid #2a3a50",borderRadius:8,color:"#eef0f5",padding:"8px 12px",fontSize:17,fontWeight:700,width:"100%",fontFamily:"'Syne',sans-serif",outline:"none"}}/>
            ) : (
              <h2 style={{fontSize:18,fontWeight:800,color:"#eef0f5",letterSpacing:-.3,maxWidth:500}}>{problem.title}</h2>
            )}
          </div>
          <div style={{display:"flex",gap:8}}>
            {editing?(
              <button onClick={()=>{onUpdate(form);setEditing(false);}} style={{background:"linear-gradient(135deg,#3ecf8e,#00bcd4)",border:"none",color:"#080b10",borderRadius:7,padding:"7px 18px",fontSize:12,fontWeight:800,cursor:"pointer"}}>Save</button>
            ):(
              <button onClick={()=>setEditing(true)} style={{background:"transparent",border:"1px solid #2a3a50",color:"#667",borderRadius:7,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Edit</button>
            )}
            <button onClick={onClose} style={{background:"none",border:"1px solid #1e2535",color:"#667",borderRadius:8,width:34,height:34,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
        </div>

        {/* Status bar */}
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {STATUSES.map(s=>{
            const sc = STATUS_COL[s]||"#667";
            const active = (editing?form.status:problem.status)===s;
            return (
              <button key={s} onClick={()=>{if(editing)f("status",s);}}
                style={{flex:1,background:active?sc+"22":"transparent",border:`1px solid ${active?sc:sc+"33"}`,color:active?sc:sc+"66",borderRadius:7,padding:"8px 0",fontSize:11,fontWeight:700,cursor:editing?"pointer":"default",letterSpacing:.5}}>
                {s}
              </button>
            );
          })}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          {[["Service",problem.service,""],["Category",problem.category,""],["Owner",editing?null:problem.owner,"owner"],["Due Date",editing?null:problem.dueDate,"dueDate"]].map(([label,val,key])=>(
            <div key={label} style={{background:"#080b10",border:"1px solid #1a2030",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontSize:10,color:"#445",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{label}</div>
              {editing && key?(
                <input value={form[key]} onChange={e=>f(key,e.target.value)}
                  style={{background:"transparent",border:"none",color:"#c8cdd8",fontSize:13,fontWeight:600,width:"100%",outline:"none",fontFamily:"'Syne',sans-serif"}}/>
              ):(
                <div style={{fontSize:13,fontWeight:600,color:"#c8cdd8"}}>{val||form[label.toLowerCase().replace(" ","")]}</div>
              )}
            </div>
          ))}
        </div>

        {[["Impact",editing,"impact"],["Root Cause Analysis",editing,"rootCause"],["Workaround",editing,"workaround"],["Notes",editing,"notes"]].map(([label,ed,key])=>(
          <div key={key} style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:10,fontWeight:700,color:"#445",letterSpacing:1.2,textTransform:"uppercase",marginBottom:5,fontFamily:"'IBM Plex Mono',monospace"}}>{label}</label>
            {ed?(
              <textarea value={form[key]} onChange={e=>f(key,e.target.value)} rows={3}
                style={{width:"100%",background:"#080b10",border:"1px solid #1e2535",borderRadius:8,color:"#c8cdd8",padding:"10px 12px",fontSize:12,resize:"vertical",fontFamily:"'Syne',sans-serif",outline:"none",boxSizing:"border-box"}}/>
            ):(
              <div style={{background:"#080b10",border:"1px solid #1a2030",borderRadius:8,padding:"12px 14px",fontSize:12,color:"#8a95a8",lineHeight:1.7}}>
                {problem[key]||<span style={{color:"#2a3040",fontStyle:"italic"}}>Not specified</span>}
              </div>
            )}
          </div>
        ))}

        <div>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:"#445",letterSpacing:1.2,textTransform:"uppercase",marginBottom:8,fontFamily:"'IBM Plex Mono',monospace"}}>Linked Incidents ({problem.relatedIncs.length})</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {problem.relatedIncs.map(id=>(
              <span key={id} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#3ecf8e",background:"#3ecf8e12",border:"1px solid #3ecf8e33",borderRadius:4,padding:"3px 8px"}}>{id}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════ SMALL UTILS ══════ */
function Stat({label,val,color}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:1}}>
      <span style={{fontSize:10,color:"#445",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5,textTransform:"uppercase"}}>{label}</span>
      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,color}}>{val}</span>
    </div>
  );
}
function InfoBlock({title,children}) {
  return (
    <div>
      <div style={{fontSize:10,fontWeight:700,color:"#445",letterSpacing:1.2,textTransform:"uppercase",marginBottom:4,fontFamily:"'IBM Plex Mono',monospace"}}>{title}</div>
      {children}
    </div>
  );
}
function SectionLabel({children}) {
  return <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#3ecf8e",letterSpacing:2.5,textTransform:"uppercase",fontWeight:600}}>{children}</div>;
}
function PriBadge({pri}) {
  return <span style={{fontSize:10,color:PRI[pri],background:PRI[pri]+"18",border:`1px solid ${PRI[pri]}33`,borderRadius:4,padding:"2px 8px",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:.5,fontWeight:700}}>{pri}</span>;
}
