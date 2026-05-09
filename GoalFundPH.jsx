import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.4); border-radius: 99px; }
  button, input { font-family: inherit; }
  button:focus, input:focus { outline: none; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes ping { 0%,100%{transform:scale(1);opacity:1} 75%{transform:scale(2);opacity:0} }
  @keyframes drift0 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-50px) scale(1.1)} 66%{transform:translate(-20px,30px) scale(0.95)} }
  @keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-60px,40px) scale(1.08)} }
  @keyframes drift2 { 0%,100%{transform:translate(0,0)} 40%{transform:translate(30px,-60px) scale(1.05)} 80%{transform:translate(-10px,20px) scale(0.97)} }
  @keyframes drift3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(50px,30px)} }
  @keyframes drift4 { 0%,100%{transform:translate(0,0) scale(1)} 60%{transform:translate(-30px,-40px) scale(1.06)} }
  @keyframes drift5 { 0%,100%{transform:translate(0,0)} 45%{transform:translate(20px,50px)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
  @keyframes fadeScale { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes bounce-dot { 0%,80%,100%{transform:scale(0.4);opacity:0.4} 40%{transform:scale(1);opacity:1} }
  @keyframes glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
  @keyframes hero-float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
  @keyframes checkmark-draw { 0%{stroke-dashoffset:30} 100%{stroke-dashoffset:0} }
  @keyframes week-pop { 0%{transform:scale(1)} 30%{transform:scale(1.05)} 70%{transform:scale(0.98)} 100%{transform:scale(1)} }
  .glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:20px; backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); }
  .glass-strong { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.13); border-radius:20px; backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px); }
  .hover-lift { transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease; cursor:default; }
  .hover-lift:hover { transform:translateY(-3px); box-shadow:0 16px 50px rgba(0,0,0,0.3); }
  .btn-p { background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; cursor:pointer; font-weight:700; font-family:inherit; transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
  .btn-p:hover { transform:scale(1.04); box-shadow:0 0 40px rgba(16,185,129,0.45); }
  .btn-p:active { transform:scale(0.97); }
  .btn-g { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.12); cursor:pointer; font-family:inherit; transition:all 0.2s; }
  .btn-g:hover { background:rgba(255,255,255,0.12); color:#fff; }
  .lbl { font-size:0.67rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.32); font-weight:600; }
  .mono { font-family:'JetBrains Mono',monospace; }
  .chip { display:inline-flex; align-items:center; gap:4px; padding:2px 9px; border-radius:99px; font-size:0.7rem; font-weight:700; letter-spacing:0.03em; }
`;

const QUOTES = [
  { text:"Ang hindi marunong lumingon sa pinanggalingan ay hindi makararating sa paroroonan.", author:"Jose Rizal" },
  { text:"Do not save what is left after spending — spend what is left after saving.", author:"Warren Buffett" },
  { text:"Small daily improvements over time lead to stunning results.", author:"Robin Sharma" },
  { text:"Sipag at tiyaga — the Filipino formula for financial freedom.", author:"Filipino Proverb" },
  { text:"A goal without a plan is just a wish.", author:"Antoine de Saint-Exupéry" },
];
const TIPS = [
  { icon:"💸", title:"Pay Yourself First", body:"Transfer your savings the moment you receive income — treat it like a non-negotiable bill." },
  { icon:"🛒", title:"List Before You Shop", body:"Unplanned purchases are the enemy. A shopping list can cut impulse buying by up to 40%." },
  { icon:"📱", title:"Use GCash GSave", body:"Earn up to 3.1% interest per annum — far more than a regular savings account." },
  { icon:"🔁", title:"Automate Your Savings", body:"Set a recurring transfer on payday so you never forget and never spend what's meant to be saved." },
  { icon:"🍳", title:"Cook 4× a Week", body:"Eating out vs cooking at home can cost ₱3,000–₱8,000 more per month in Metro Manila." },
  { icon:"📦", title:"Sell the Clutter", body:"Sell unused items on Facebook Marketplace or Carousell. Extra cash goes straight to your goal." },
];
const BADGES = [
  { id:"starter",   icon:"🌱", label:"Planter",       desc:"Completed Week 1",   threshold:1,  color:"#10b981" },
  { id:"fire",      icon:"🔥", label:"On Fire",        desc:"3 weeks done",       threshold:3,  color:"#f59e0b" },
  { id:"halfway",   icon:"⚡", label:"Halfway Hero",   desc:"5 weeks done",       threshold:5,  color:"#3b82f6" },
  { id:"momentum",  icon:"🚀", label:"Momentum",       desc:"7 weeks done",       threshold:7,  color:"#8b5cf6" },
  { id:"diamond",   icon:"💎", label:"Diamond Hands",  desc:"9 weeks done",       threshold:9,  color:"#ec4899" },
  { id:"champion",  icon:"🏆", label:"Goal Champion",  desc:"All 10 weeks!",      threshold:10, color:"#f59e0b" },
];
const SAMPLES = [
  { name:"iPhone 16 Pro",   amount:75000,  emoji:"📱", color:"#3b82f6" },
  { name:"Gaming PC Setup", amount:120000, emoji:"🖥️", color:"#8b5cf6" },
  { name:"Motorcycle",      amount:85000,  emoji:"🏍️", color:"#f59e0b" },
  { name:"MacBook Pro",     amount:110000, emoji:"💻", color:"#10b981" },
  { name:"Dream Vacation",  amount:50000,  emoji:"✈️", color:"#ec4899" },
  { name:"Emergency Fund",  amount:30000,  emoji:"🛡️", color:"#06b6d4" },
];
const MOTIVATIONS = [
  "Every peso you save is a vote for your future self. 💪",
  "Sipag at tiyaga — the Filipino formula for financial freedom! 🇵🇭",
  "You're already further than you were when you started. Keep going! 🔥",
  "Discipline now = freedom later. You're already winning. ✨",
  "Ang tagumpay ay hindi basta-basta — you're earning it week by week. 🌟",
  "Real progress, real discipline. You should be proud! 🚀",
];

const fmtP = (n) => "₱" + new Intl.NumberFormat("fil-PH",{minimumFractionDigits:0}).format(n||0);
const loadS = () => { try { return JSON.parse(localStorage.getItem("gfph3"))||null; } catch { return null; } };
const saveS = (s) => { try { localStorage.setItem("gfph3",JSON.stringify(s)); } catch {} };

function useAnimNum(target, dur=700) {
  const [v,setV] = useState(0);
  const r = useRef({from:0,raf:null});
  useEffect(()=>{
    const from=r.current.from; cancelAnimationFrame(r.current.raf);
    const t0=performance.now();
    const tick=(now)=>{
      const p=Math.min((now-t0)/dur,1);
      const e=1-Math.pow(1-p,3);
      setV(Math.round(from+(target-from)*e));
      if(p<1) r.current.raf=requestAnimationFrame(tick); else r.current.from=target;
    };
    r.current.raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(r.current.raf);
  },[target,dur]);
  return v;
}

function Confetti({active}) {
  const ref=useRef(null), aRef=useRef(null);
  useEffect(()=>{
    if(!active||!ref.current)return;
    const c=ref.current,ctx=c.getContext("2d");
    c.width=window.innerWidth; c.height=window.innerHeight;
    const cols=["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#fbbf24"];
    const pts=Array.from({length:200},()=>({
      x:Math.random()*c.width, y:Math.random()*-500,
      vx:(Math.random()-0.5)*5, vy:Math.random()*5+2,
      r:Math.random()*7+3, color:cols[Math.floor(Math.random()*cols.length)],
      rot:0, rotV:(Math.random()-0.5)*0.18, shape:Math.floor(Math.random()*3),
    }));
    let frame=0;
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p=>{
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.color; ctx.globalAlpha=0.92;
        if(p.shape===0){ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();}
        else if(p.shape===1){ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);}
        else{ctx.beginPath();ctx.moveTo(0,-p.r);ctx.lineTo(p.r,p.r);ctx.lineTo(-p.r,p.r);ctx.closePath();ctx.fill();}
        ctx.restore();
        p.x+=p.vx+Math.sin(frame/25)*2; p.y+=p.vy; p.rot+=p.rotV;
        if(p.y>c.height+20){p.y=-20;p.x=Math.random()*c.width;}
      });
      frame++; aRef.current=requestAnimationFrame(draw);
    };
    draw();
    const t=setTimeout(()=>cancelAnimationFrame(aRef.current),6000);
    return()=>{cancelAnimationFrame(aRef.current);clearTimeout(t);};
  },[active]);
  if(!active)return null;
  return <canvas ref={ref} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}/>;
}

function ParticleBg() {
  const orbs=[
    {w:700,h:700,l:"-15%",t:"-5%", bg:"radial-gradient(ellipse,rgba(16,185,129,0.18),transparent 65%)",a:"drift0 28s ease-in-out infinite"},
    {w:500,h:500,l:"65%", t:"0%",  bg:"radial-gradient(ellipse,rgba(59,130,246,0.15),transparent 65%)", a:"drift1 22s ease-in-out infinite"},
    {w:600,h:600,l:"25%", t:"55%", bg:"radial-gradient(ellipse,rgba(139,92,246,0.12),transparent 65%)",a:"drift2 32s ease-in-out infinite"},
    {w:350,h:350,l:"75%", t:"55%", bg:"radial-gradient(ellipse,rgba(236,72,153,0.10),transparent 65%)", a:"drift3 19s ease-in-out infinite"},
    {w:400,h:400,l:"-5%", t:"65%", bg:"radial-gradient(ellipse,rgba(6,182,212,0.10),transparent 65%)",  a:"drift4 24s ease-in-out infinite"},
    {w:300,h:300,l:"45%", t:"-8%", bg:"radial-gradient(ellipse,rgba(245,158,11,0.08),transparent 65%)", a:"drift5 17s ease-in-out infinite"},
  ];
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"55px 55px",opacity:0.6}}/>
      {orbs.map((o,i)=>(
        <div key={i} style={{position:"absolute",width:o.w,height:o.h,left:o.l,top:o.t,background:o.bg,filter:"blur(55px)",animation:o.a}}/>
      ))}
    </div>
  );
}

function RingProgress({percent,size=160,strokeWidth=11,children}) {
  const r=(size-strokeWidth*2)/2, circ=2*Math.PI*r, offset=circ-(percent/100)*circ;
  return (
    <div style={{position:"relative",width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg width={size} height={size} style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
        <defs>
          <linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981"/><stop offset="50%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>
          <filter id="rglow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#rg1)" strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" filter="url(#rglow)"
          style={{transition:"stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)"}}/>
      </svg>
      <div style={{position:"relative",zIndex:1,textAlign:"center"}}>{children}</div>
    </div>
  );
}

function StatCard({label,value,sub,color="#10b981",icon,accent}) {
  return (
    <div className="glass hover-lift" style={{padding:"1.2rem 1.35rem",position:"relative",overflow:"hidden",border:accent?`1px solid ${color}35`:"1px solid rgba(255,255,255,0.09)"}}>
      {accent&&<div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${color},transparent)`}}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.65rem"}}>
        <span className="lbl">{label}</span>
        {icon&&<span style={{fontSize:"1rem",opacity:0.6}}>{icon}</span>}
      </div>
      <div style={{fontSize:"1.45rem",fontWeight:800,color,lineHeight:1,letterSpacing:"-0.02em"}}>{value}</div>
      {sub&&<div style={{fontSize:"0.71rem",color:"rgba(255,255,255,0.3)",marginTop:"0.35rem"}}>{sub}</div>}
    </div>
  );
}

// ── WEEK CARD — both weekly target AND saved amount are fully editable ────────
function WeekCard({week,idx,baseTarget,onToggle,onAmountChange,onTargetChange,runningTotal,totalTarget}) {
  const [edAmt,setEdAmt]=useState(false), [edTgt,setEdTgt]=useState(false);
  const [amtD,setAmtD]=useState(""),   [tgtD,setTgtD]=useState("");
  const [popped,setPopped]=useState(false);
  const amtRef=useRef(null), tgtRef=useRef(null);

  const n=idx+1;
  const saved  = week.saved  ?? baseTarget;
  const target = week.target ?? baseTarget;
  const pct=Math.min((saved/target)*100,100);
  const over=saved>target;
  const totalPct=Math.min((runningTotal/totalTarget)*100,100);

  useEffect(()=>{if(edAmt)setTimeout(()=>amtRef.current?.focus(),40);},[edAmt]);
  useEffect(()=>{if(edTgt)setTimeout(()=>tgtRef.current?.focus(),40);},[edTgt]);

  const commitAmt=()=>{const v=parseInt(amtD.replace(/\D/g,""),10);if(!isNaN(v)&&v>=0)onAmountChange(idx,v);setEdAmt(false);};
  const commitTgt=()=>{const v=parseInt(tgtD.replace(/\D/g,""),10);if(!isNaN(v)&&v>0)onTargetChange(idx,v);setEdTgt(false);};

  const handleToggle=()=>{
    if(!week.done){setPopped(true);setTimeout(()=>setPopped(false),550);}
    onToggle(idx);
  };

  const iSty={background:"rgba(0,0,0,0.4)",border:"1px solid rgba(16,185,129,0.45)",borderRadius:8,padding:"5px 9px",color:"#fff",fontSize:"0.82rem",width:110,fontFamily:"'JetBrains Mono',monospace"};

  const editBtn=(onClick,colorHover)=>(
    <button onClick={onClick}
      style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"2px 7px",color:"rgba(255,255,255,0.4)",fontSize:"0.65rem",cursor:"pointer",transition:"all 0.18s",lineHeight:"1.4"}}
      onMouseEnter={e=>{e.currentTarget.style.background=`${colorHover}20`;e.currentTarget.style.color=colorHover;e.currentTarget.style.borderColor=`${colorHover}40`;}}
      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.color="rgba(255,255,255,0.4)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
      ✏️ Edit
    </button>
  );
  const confirmBtns=(onSave,onCancel)=>(
    <div style={{display:"flex",gap:3}}>
      <button onClick={onSave}  style={{background:"#10b981",border:"none",borderRadius:6,padding:"4px 8px",color:"#fff",fontSize:"0.72rem",cursor:"pointer",fontWeight:700}}>✓</button>
      <button onClick={onCancel} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:6,padding:"4px 7px",color:"rgba(255,255,255,0.5)",fontSize:"0.72rem",cursor:"pointer"}}>✕</button>
    </div>
  );

  return (
    <div className="glass" style={{
      padding:"1rem 1.2rem",
      border:week.done?"1px solid rgba(16,185,129,0.28)":"1px solid rgba(255,255,255,0.08)",
      background:week.done?"rgba(16,185,129,0.06)":"rgba(255,255,255,0.025)",
      transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      transform:popped?"scale(1.025)":"scale(1)",
      position:"relative",overflow:"hidden",
    }}>
      {week.done&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(16,185,129,0.55),transparent)"}}/>}

      <div style={{display:"flex",alignItems:"center",gap:"0.8rem",flexWrap:"wrap"}}>
        {/* Toggle button */}
        <button onClick={handleToggle} style={{
          flexShrink:0,width:42,height:42,borderRadius:"50%",border:"none",cursor:"pointer",
          background:week.done?"linear-gradient(135deg,#10b981,#059669)":"rgba(255,255,255,0.08)",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:week.done?"0 0 22px rgba(16,185,129,0.5)":"none",
          transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          {week.done
            ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.5 9.5L7 13L14.5 5.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{strokeDasharray:30,strokeDashoffset:0,animation:"checkmark-draw 0.3s ease"}}/></svg>
            : <span style={{fontSize:"0.78rem",fontWeight:800,color:"rgba(255,255,255,0.4)"}}>{n}</span>
          }
        </button>

        {/* Content */}
        <div style={{flex:1,minWidth:180}}>
          {/* Top row */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.5rem",gap:"0.5rem",flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.42)",fontWeight:600}}>Week {n}</span>
              {over&&<span className="chip" style={{background:"rgba(245,158,11,0.15)",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.25)"}}>+Bonus</span>}
              {week.done&&<span className="chip" style={{background:"rgba(16,185,129,0.15)",color:"#10b981",border:"1px solid rgba(16,185,129,0.25)"}}>Done ✓</span>}
            </div>

            {/* Amounts */}
            <div style={{display:"flex",gap:"1.2rem",alignItems:"flex-end",flexWrap:"wrap"}}>
              {/* Weekly Target */}
              <div style={{textAlign:"right"}}>
                <div className="lbl" style={{marginBottom:3}}>Weekly Target</div>
                {edTgt
                  ? <div style={{display:"flex",gap:3,alignItems:"center"}}>
                      <input ref={tgtRef} value={tgtD} onChange={e=>setTgtD(e.target.value)} style={iSty} placeholder={String(target)} onKeyDown={e=>{if(e.key==="Enter")commitTgt();if(e.key==="Escape")setEdTgt(false);}}/>
                      {confirmBtns(commitTgt,()=>setEdTgt(false))}
                    </div>
                  : <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <span className="mono" style={{fontSize:"0.88rem",color:"rgba(255,255,255,0.55)",fontWeight:700}}>{fmtP(target)}</span>
                      {editBtn(()=>{setTgtD(String(target));setEdTgt(true);},"#8b5cf6")}
                    </div>
                }
              </div>
              {/* Amount Saved */}
              <div style={{textAlign:"right"}}>
                <div className="lbl" style={{marginBottom:3}}>Saved</div>
                {edAmt
                  ? <div style={{display:"flex",gap:3,alignItems:"center"}}>
                      <input ref={amtRef} value={amtD} onChange={e=>setAmtD(e.target.value)} style={iSty} placeholder={String(saved)} onKeyDown={e=>{if(e.key==="Enter")commitAmt();if(e.key==="Escape")setEdAmt(false);}}/>
                      {confirmBtns(commitAmt,()=>setEdAmt(false))}
                    </div>
                  : <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <span className="mono" style={{fontSize:"1rem",color:week.done?"#10b981":"rgba(255,255,255,0.88)",fontWeight:800}}>{fmtP(saved)}</span>
                      {editBtn(()=>{setAmtD(String(saved));setEdAmt(true);},"#10b981")}
                    </div>
                }
              </div>
            </div>
          </div>

          {/* Progress bars */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
              <div style={{flex:1,height:5,background:"rgba(255,255,255,0.07)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:over?"linear-gradient(90deg,#f59e0b,#fbbf24)":"linear-gradient(90deg,#10b981,#3b82f6)",borderRadius:99,transition:"width 0.7s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:week.done?"0 0 8px rgba(16,185,129,0.4)":"none"}}/>
              </div>
              <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.3)",minWidth:28,textAlign:"right",fontWeight:600}}>{Math.round(pct)}%</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
              <div style={{flex:1,height:2,background:"rgba(255,255,255,0.04)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${totalPct}%`,background:"rgba(139,92,246,0.5)",borderRadius:99,transition:"width 0.7s ease"}}/>
              </div>
              <span style={{fontSize:"0.63rem",color:"rgba(139,92,246,0.55)",minWidth:28,textAlign:"right"}}>{Math.round(totalPct)}%</span>
            </div>
          </div>
        </div>

        {/* Running total */}
        <div style={{textAlign:"right",flexShrink:0}}>
          <div className="lbl" style={{marginBottom:3}}>Running Total</div>
          <div className="mono" style={{fontSize:"0.85rem",fontWeight:700,color:"rgba(139,92,246,0.85)"}}>{fmtP(runningTotal)}</div>
        </div>
      </div>
    </div>
  );
}

const ChartTip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:"rgba(6,11,22,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"0.55rem 0.85rem",fontSize:12}}>
    <p style={{color:"rgba(255,255,255,0.45)",marginBottom:4}}>{label}</p>
    {payload.map(p=><p key={p.name} style={{color:p.color||p.stroke,fontWeight:700}}>{p.name}: {fmtP(p.value)}</p>)}
  </div>);
};

function Countdown({weeksLeft}) {
  const [t,setT]=useState({d:0,h:0,m:0,s:0});
  useEffect(()=>{
    const target=new Date();
    target.setDate(target.getDate()+weeksLeft*7);
    const calc=()=>{
      const diff=target-new Date();
      if(diff<=0)return setT({d:0,h:0,m:0,s:0});
      setT({d:Math.floor(diff/86400000),h:Math.floor((diff%86400000)/3600000),m:Math.floor((diff%3600000)/60000),s:Math.floor((diff%60000)/1000)});
    };
    calc();const id=setInterval(calc,1000);return()=>clearInterval(id);
  },[weeksLeft]);
  if(weeksLeft<=0)return null;
  return(
    <div className="glass" style={{padding:"1rem 1.25rem"}}>
      <div className="lbl" style={{marginBottom:"0.6rem"}}>⏱️ Estimated Completion In</div>
      <div style={{display:"flex",gap:"0.5rem"}}>
        {Object.entries(t).map(([k,v])=>(
          <div key={k} style={{flex:1,textAlign:"center",background:"rgba(0,0,0,0.25)",borderRadius:10,padding:"0.45rem 0.2rem"}}>
            <div className="mono" style={{fontSize:"1.15rem",fontWeight:800,color:"#10b981"}}>{String(v).padStart(2,"0")}</div>
            <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.28)",letterSpacing:"0.07em"}}>{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIChat({goal,weeks,baseTarget}) {
  const [msgs,setMsgs]=useState([{role:"assistant",text:`Hi! I'm GoalFund AI 🤖\n\nYou're saving for **${goal.itemName}** — ${fmtP(goal.amount)} in 10 weeks. Ask me for tips, motivation, or to help you save faster!`}]);
  const [inp,setInp]=useState(""); const [loading,setLoading]=useState(false);
  const [open,setOpen]=useState(false);
  const botRef=useRef(null);
  const saved=weeks.filter(w=>w.done).reduce((s,w)=>s+(w.saved??baseTarget),0);
  const done=weeks.filter(w=>w.done).length;
  useEffect(()=>{if(open)botRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,open]);

  const send=async()=>{
    if(!inp.trim()||loading)return;
    const u=inp.trim();setInp("");setLoading(true);
    setMsgs(m=>[...m,{role:"user",text:u}]);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:1000,
        system:`You are GoalFund AI — a warm, concise Filipino financial assistant. Goal: "${goal.itemName}", target ₱${goal.amount}, saved ₱${saved} (${done}/10 weeks done), weekly ₱${baseTarget}. Keep replies short (2-3 sentences), practical, occasionally use Filipino phrases.`,
        messages:[...msgs.filter((_,i)=>i>0).map(m=>({role:m.role,content:m.text})),{role:"user",content:u}]
      })});
      const d=await r.json();
      setMsgs(m=>[...m,{role:"assistant",text:d.content?.[0]?.text||"Try again!"}]);
    }catch{setMsgs(m=>[...m,{role:"assistant",text:"Network error. Try again!"}]);}
    setLoading(false);
  };

  const quickP=["Tip to save faster","Am I on track?","Motivate me! 🔥","How to cut expenses?"];

  if(!open) return(
    <button onClick={()=>setOpen(true)} className="glass" style={{width:"100%",padding:"1rem 1.5rem",border:"1px solid rgba(16,185,129,0.2)",borderRadius:18,cursor:"pointer",display:"flex",alignItems:"center",gap:"0.75rem",background:"rgba(16,185,129,0.05)",transition:"all 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(16,185,129,0.09)"}
      onMouseLeave={e=>e.currentTarget.style.background="rgba(16,185,129,0.05)"}>
      <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",position:"relative",flexShrink:0}}>
        🤖<span style={{position:"absolute",top:1,right:1,width:9,height:9,borderRadius:"50%",background:"#10b981",border:"2px solid #060b16",animation:"ping 2s infinite"}}/>
      </div>
      <div style={{flex:1,textAlign:"left"}}>
        <div style={{fontSize:"0.85rem",fontWeight:700,color:"#fff"}}>GoalFund AI Assistant</div>
        <div style={{fontSize:"0.73rem",color:"rgba(255,255,255,0.38)"}}>Ask me anything about your savings plan...</div>
      </div>
      <span style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.28)"}}>Open ↗</span>
    </button>
  );

  return(
    <div className="glass-strong" style={{borderRadius:20,overflow:"hidden",border:"1px solid rgba(16,185,129,0.2)"}}>
      <div style={{padding:"0.8rem 1.2rem",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(16,185,129,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
          <span style={{fontSize:"1.1rem"}}>🤖</span>
          <div>
            <div style={{fontSize:"0.84rem",fontWeight:700,color:"#fff"}}>GoalFund AI</div>
            <div style={{fontSize:"0.68rem",color:"#10b981",display:"flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:"#10b981",display:"inline-block"}}/>Online</div>
          </div>
        </div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:"1.1rem",padding:"0.2rem"}}>✕</button>
      </div>
      <div style={{height:240,overflowY:"auto",padding:"0.85rem",display:"flex",flexDirection:"column",gap:"0.55rem"}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"82%",padding:"0.6rem 0.9rem",borderRadius:m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:m.role==="user"?"linear-gradient(135deg,#10b981,#059669)":"rgba(255,255,255,0.08)",color:"#fff",fontSize:"0.81rem",lineHeight:1.55,whiteSpace:"pre-line"}}>
              {m.text}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex"}}><div style={{padding:"0.6rem 0.9rem",borderRadius:"14px 14px 14px 3px",background:"rgba(255,255,255,0.08)",display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.5)",animation:`bounce-dot 1.2s ease-in-out infinite`,animationDelay:`${i*0.18}s`}}/>)}</div></div>}
        <div ref={botRef}/>
      </div>
      <div style={{padding:"0.5rem 0.75rem",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:"0.35rem",flexWrap:"wrap"}}>
        {quickP.map(p=>(
          <button key={p} onClick={()=>setInp(p)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:99,padding:"3px 9px",color:"rgba(255,255,255,0.45)",fontSize:"0.68rem",cursor:"pointer",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(16,185,129,0.4)";e.currentTarget.style.color="#10b981";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(255,255,255,0.45)";}}>
            {p}
          </button>
        ))}
      </div>
      <div style={{padding:"0.7rem",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:"0.5rem"}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask GoalFund AI..."
          style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"0.58rem 0.85rem",color:"#fff",fontSize:"0.83rem"}}/>
        <button onClick={send} disabled={loading} className="btn-p" style={{borderRadius:10,padding:"0.58rem 1rem",fontSize:"0.83rem",opacity:loading?0.5:1}}>Send</button>
      </div>
    </div>
  );
}

function Hero({onStart}) {
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),80);return()=>clearTimeout(t);},[]);
  const q=QUOTES[Math.floor(Date.now()/86400000)%QUOTES.length];
  const delay=(d)=>({opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(24px)",transition:`all 0.65s ${d}s cubic-bezier(0.34,1.56,0.64,1)`});
  return(
    <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6rem 1.5rem 4rem",textAlign:"center",position:"relative",zIndex:1}}>
      <div style={delay(0.1)} >
        <span style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(16,185,129,0.11)",border:"1px solid rgba(16,185,129,0.24)",borderRadius:99,padding:"0.38rem 1.1rem",fontSize:"0.7rem",color:"#10b981",fontWeight:700,letterSpacing:"0.1em",marginBottom:"1.75rem"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#10b981",display:"inline-block",animation:"glow-pulse 2s infinite"}}/>
          MADE FOR FILIPINOS · FINTECH SAVINGS
        </span>
      </div>
      <h1 style={{...delay(0.2),fontSize:"clamp(2.8rem,8.5vw,6rem)",fontWeight:900,lineHeight:1.0,letterSpacing:"-0.04em",marginBottom:"1.4rem"}}>
        <span style={{display:"block",background:"linear-gradient(135deg,#fff 30%,rgba(255,255,255,0.6))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Save Smart.</span>
        <span style={{display:"block",background:"linear-gradient(135deg,#10b981 0%,#3b82f6 50%,#8b5cf6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"hero-float 4s ease-in-out infinite"}}>Dream Big.</span>
        <span style={{display:"block",background:"linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.4))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:"60%",letterSpacing:"-0.01em"}}>Win Always. 🇵🇭</span>
      </h1>
      <p style={{...delay(0.32),fontSize:"clamp(0.9rem,2.2vw,1.12rem)",color:"rgba(255,255,255,0.44)",maxWidth:540,lineHeight:1.8,marginBottom:"2.25rem"}}>
        Turn any dream purchase into a <strong style={{color:"rgba(255,255,255,0.72)"}}>10-week savings plan</strong>. Track every peso, unlock badges, and celebrate when you hit your goal.
      </p>
      <div style={{...delay(0.42),display:"flex",gap:"0.8rem",justifyContent:"center",flexWrap:"wrap",marginBottom:"3.5rem"}}>
        <button className="btn-p" onClick={onStart} style={{borderRadius:14,padding:"0.9rem 2.3rem",fontSize:"0.97rem",letterSpacing:"0.02em",display:"flex",alignItems:"center",gap:8}}>
          <span>🚀</span>Start Saving Now
        </button>
        <button className="btn-g" onClick={onStart} style={{borderRadius:14,padding:"0.9rem 1.8rem",fontSize:"0.97rem"}}>See Demo →</button>
      </div>
      <div style={{...delay(0.5),maxWidth:480,marginBottom:"3rem"}}>
        <div className="glass" style={{padding:"1.1rem 1.4rem",borderRadius:16}}>
          <p style={{fontStyle:"italic",color:"rgba(255,255,255,0.46)",fontSize:"0.83rem",lineHeight:1.7,marginBottom:"0.45rem"}}>"{q.text}"</p>
          <p style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.22)",fontWeight:600,letterSpacing:"0.06em"}}>— {q.author}</p>
        </div>
      </div>
      <div style={{...delay(0.6),display:"flex",gap:"2.5rem",justifyContent:"center",flexWrap:"wrap"}}>
        {[["₱2.4M+","Goals Achieved"],["12,000+","Filipino Savers"],["98.2%","Completion Rate"]].map(([v,l])=>(
          <div key={l} style={{textAlign:"center"}}>
            <div style={{fontSize:"1.6rem",fontWeight:900,background:"linear-gradient(135deg,#10b981,#3b82f6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{v}</div>
            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.28)",letterSpacing:"0.06em",marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GoalPlanner({onGenerate}) {
  const [name,setName]=useState(""),  [amount,setAmount]=useState("");
  const [emoji,setEmoji]=useState("🎯"), [loading,setLoading]=useState(false);
  const [error,setError]=useState(""), [sel,setSel]=useState(null);
  const num=parseInt(amount.replace(/\D/g,""),10)||0;
  const weekly=num?Math.ceil(num/10):0;

  const go=()=>{
    if(!name.trim()){setError("What are you saving for?");return;}
    if(num<500){setError("Minimum goal is ₱500.");return;}
    setError("");setLoading(true);
    setTimeout(()=>{onGenerate({itemName:name.trim(),amount:num,emoji});setLoading(false);},1300);
  };
  const is={width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"0.88rem 1.05rem",color:"#fff",fontSize:"1rem",transition:"border-color 0.2s, box-shadow 0.2s"};
  const fo=(e)=>{e.target.style.borderColor="rgba(16,185,129,0.5)";e.target.style.boxShadow="0 0 0 3px rgba(16,185,129,0.1)";};
  const bl=(e)=>{e.target.style.borderColor="rgba(255,255,255,0.1)";e.target.style.boxShadow="none";};

  return(
    <section style={{minHeight:"calc(100vh - 70px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem 1rem",position:"relative",zIndex:1}}>
      <div style={{width:"100%",maxWidth:540,animation:"fadeScale 0.5s ease"}}>
        <div style={{textAlign:"center",marginBottom:"2.25rem"}}>
          <h2 style={{fontSize:"2rem",fontWeight:900,color:"#fff",letterSpacing:"-0.03em",marginBottom:"0.45rem"}}>Create Your Goal</h2>
          <p style={{color:"rgba(255,255,255,0.38)",fontSize:"0.88rem"}}>Tell us what you're saving for and we'll build your plan.</p>
        </div>
        {/* Quick picks */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.45rem",marginBottom:"1.4rem"}}>
          {SAMPLES.map(g=>(
            <button key={g.name} onClick={()=>{setName(g.name);setAmount(String(g.amount));setEmoji(g.emoji);setSel(g.name);}}
              className="glass" style={{border:sel===g.name?`1px solid ${g.color}55`:"1px solid rgba(255,255,255,0.08)",background:sel===g.name?`${g.color}12`:"rgba(255,255,255,0.025)",padding:"0.65rem 0.4rem",cursor:"pointer",borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.2s"}}>
              <span style={{fontSize:"1.25rem"}}>{g.emoji}</span>
              <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)",fontWeight:600,textAlign:"center",lineHeight:1.25}}>{g.name}</span>
              <span className="mono" style={{fontSize:"0.64rem",color:g.color,fontWeight:700}}>{fmtP(g.amount)}</span>
            </button>
          ))}
        </div>
        <div className="glass-strong" style={{padding:"1.85rem"}}>
          <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
            <div style={{display:"flex",gap:"0.7rem"}}>
              <div style={{flexShrink:0}}>
                <label className="lbl" style={{display:"block",marginBottom:6}}>Emoji</label>
                <input value={emoji} onChange={e=>setEmoji(e.target.value)} maxLength={2} style={{...is,width:58,textAlign:"center",fontSize:"1.4rem",padding:"0.65rem"}} onFocus={fo} onBlur={bl}/>
              </div>
              <div style={{flex:1}}>
                <label className="lbl" style={{display:"block",marginBottom:6}}>What are you saving for?</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. iPhone 16 Pro..." style={is} onFocus={fo} onBlur={bl}/>
              </div>
            </div>
            <div>
              <label className="lbl" style={{display:"block",marginBottom:6}}>Target Amount (₱)</label>
              <input value={amount?Number(amount.replace(/\D/g,"")).toLocaleString("fil-PH"):""} onChange={e=>setAmount(e.target.value.replace(/[^0-9,]/g,""))} placeholder="e.g. 75,000" style={is} onFocus={fo} onBlur={bl}/>
            </div>
            {num>0&&(
              <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.18)",borderRadius:12,padding:"0.9rem 1.1rem"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.5rem",textAlign:"center"}}>
                  {[[fmtP(num),"Total Goal"],[fmtP(weekly),"Per Week"],[fmtP(Math.ceil(weekly/7)),"Per Day"]].map(([v,l])=>(
                    <div key={l}><div className="mono" style={{fontSize:"0.97rem",fontWeight:800,color:"#10b981"}}>{v}</div><div className="lbl" style={{marginTop:3}}>{l}</div></div>
                  ))}
                </div>
              </div>
            )}
            {error&&<p style={{color:"#ef4444",fontSize:"0.82rem",margin:0}}>⚠️ {error}</p>}
            <button className="btn-p" onClick={go} disabled={loading} style={{borderRadius:12,padding:"0.95rem",fontSize:"0.97rem",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading?<><span style={{width:17,height:17,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>Building Plan...</>:"✨ Generate My 10-Week Plan"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dashboard({goal,weeks,onToggle,onAmountChange,onTargetChange,onReset}) {
  const [tab,setTab]=useState("tracker"), [tipIdx,setTipIdx]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setTipIdx(i=>(i+1)%TIPS.length),7500);return()=>clearInterval(id);},[]);

  const baseTarget=Math.ceil(goal.amount/10);
  const totalSaved=weeks.reduce((s,w)=>s+(w.done?(w.saved??w.target??baseTarget):0),0);
  const weeksCompleted=weeks.filter(w=>w.done).length;
  const percent=Math.min((totalSaved/goal.amount)*100,100);
  const savedAnim=useAnimNum(totalSaved);
  const pctAnim=useAnimNum(Math.round(percent));
  const earned=BADGES.filter(b=>weeksCompleted>=b.threshold);
  const isComplete=weeksCompleted===10;
  const motivation=MOTIVATIONS[weeksCompleted%MOTIVATIONS.length];

  const runningTotals=useMemo(()=>{
    let acc=0;
    return weeks.map(w=>{if(w.done)acc+=w.saved??w.target??baseTarget;return acc;});
  },[weeks,baseTarget]);

  const chartData=weeks.map((w,i)=>({
    week:`W${i+1}`,
    target:w.target??baseTarget,
    saved:w.done?(w.saved??w.target??baseTarget):0,
    cumulative:runningTotals[i],
    goalLine:baseTarget*(i+1),
  }));

  const TABS=[
    {id:"tracker",  label:"📋 Tracker"},
    {id:"charts",   label:"📊 Charts"},
    {id:"badges",   label:`🏆 Badges (${earned.length})`},
    {id:"tips",     label:"💡 Tips"},
    {id:"ai",       label:"🤖 AI Chat"},
  ];

  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:"1rem 1rem 4rem",position:"relative",zIndex:1,animation:"slideUp 0.4s ease"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.4rem",gap:"1rem",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.9rem"}}>
          <div style={{width:54,height:54,borderRadius:15,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.7rem"}}>
            {goal.emoji}
          </div>
          <div>
            <h1 style={{fontSize:"clamp(1.1rem,3.5vw,1.55rem)",fontWeight:900,color:"#fff",letterSpacing:"-0.02em",marginBottom:3}}>{goal.itemName}</h1>
            <div style={{display:"flex",gap:"0.45rem",alignItems:"center",flexWrap:"wrap"}}>
              <span className="lbl">10-Week Plan</span>
              <span style={{color:"rgba(255,255,255,0.15)"}}>·</span>
              <span className="mono" style={{fontSize:"0.72rem",color:"#10b981",fontWeight:700}}>{fmtP(goal.amount)}</span>
              {isComplete&&<span className="chip" style={{background:"rgba(245,158,11,0.18)",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.28)"}}>🏆 GOAL COMPLETE!</span>}
            </div>
          </div>
        </div>
        <button onClick={onReset} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",borderRadius:10,padding:"0.48rem 0.9rem",fontSize:"0.8rem",cursor:"pointer",fontWeight:600,transition:"all 0.2s",fontFamily:"inherit"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.18)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
          🔄 New Goal
        </button>
      </div>

      {/* Hero progress */}
      <div className="glass-strong" style={{padding:"1.6rem 1.85rem",marginBottom:"0.85rem",background:"linear-gradient(135deg,rgba(16,185,129,0.07),rgba(59,130,246,0.04))",border:"1px solid rgba(16,185,129,0.18)",borderRadius:24,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#10b981,#3b82f6,#8b5cf6)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:"2rem",flexWrap:"wrap"}}>
          <RingProgress percent={percent} size={145} strokeWidth={10}>
            <div>
              <div className="mono" style={{fontSize:"1.5rem",fontWeight:900,color:"#10b981",lineHeight:1}}>{pctAnim}%</div>
              <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.32)",letterSpacing:"0.07em",marginTop:2}}>COMPLETE</div>
            </div>
          </RingProgress>
          <div style={{flex:1,minWidth:190}}>
            <div style={{marginBottom:"0.9rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.35rem"}}>
                <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.38)"}}>Overall progress</span>
                <span className="mono" style={{fontSize:"0.75rem",color:"#10b981",fontWeight:700}}>{fmtP(savedAnim)} / {fmtP(goal.amount)}</span>
              </div>
              <div style={{height:7,background:"rgba(255,255,255,0.07)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${percent}%`,background:"linear-gradient(90deg,#10b981,#3b82f6,#8b5cf6)",borderRadius:99,transition:"width 0.9s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 0 14px rgba(16,185,129,0.38)"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:"1.2rem",flexWrap:"wrap"}}>
              {[[`${weeksCompleted}/10`,"Weeks","#10b981"],[fmtP(Math.max(goal.amount-totalSaved,0)),"Left","#3b82f6"],[fmtP(baseTarget),"Weekly","#8b5cf6"]].map(([v,l,c])=>(
                <div key={l}><div className="mono" style={{fontSize:"1rem",fontWeight:800,color:c}}>{v}</div><div className="lbl">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
        <div style={{marginTop:"1.1rem",paddingTop:"1.1rem",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <p style={{fontSize:"0.83rem",color:"rgba(255,255,255,0.5)",fontStyle:"italic",lineHeight:1.65,margin:0}}>💬 {motivation}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"0.7rem",marginBottom:"0.85rem"}}>
        <StatCard label="Total Saved" value={fmtP(totalSaved)} icon="💰" color="#10b981" accent sub={`${weeksCompleted} weeks complete`}/>
        <StatCard label="Remaining" value={fmtP(Math.max(goal.amount-totalSaved,0))} icon="🎯" color="#3b82f6" sub={`${10-weeksCompleted} weeks left`}/>
        <StatCard label="Weekly Base" value={fmtP(baseTarget)} icon="📅" color="#8b5cf6" sub="Auto-calculated"/>
        <StatCard label="Daily Equiv." value={fmtP(Math.ceil(baseTarget/7))} icon="☀️" color="#f59e0b" sub="Per day to save"/>
      </div>

      {/* Countdown */}
      <div style={{marginBottom:"0.85rem"}}><Countdown weeksLeft={10-weeksCompleted}/></div>

      {/* Rotating tip */}
      <div className="glass" style={{padding:"0.85rem 1.2rem",marginBottom:"0.85rem",border:"1px solid rgba(59,130,246,0.18)",display:"flex",gap:"0.75rem",alignItems:"flex-start",transition:"all 0.5s"}}>
        <span style={{fontSize:"1.2rem",flexShrink:0}}>{TIPS[tipIdx].icon}</span>
        <div>
          <div style={{fontSize:"0.82rem",fontWeight:700,color:"#fff",marginBottom:2}}>{TIPS[tipIdx].title}</div>
          <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.4)",lineHeight:1.55}}>{TIPS[tipIdx].body}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:"0.35rem",marginBottom:"0.85rem",padding:"0.3rem",background:"rgba(0,0,0,0.22)",borderRadius:14,flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:"1 1 auto",padding:"0.52rem 0.65rem",borderRadius:10,border:"none",cursor:"pointer",fontSize:"0.76rem",fontWeight:700,transition:"all 0.2s",fontFamily:"inherit",
            background:tab===t.id?"rgba(16,185,129,0.18)":"transparent",
            color:tab===t.id?"#10b981":"rgba(255,255,255,0.38)",
            boxShadow:tab===t.id?"inset 0 0 0 1px rgba(16,185,129,0.28)":"none",
          }}>{t.label}</button>
        ))}
      </div>

      {/* TRACKER */}
      {tab==="tracker"&&(
        <div style={{animation:"slideIn 0.28s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.55rem",flexWrap:"wrap",gap:"0.4rem"}}>
            <span className="lbl">Weekly Savings Tracker</span>
            <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.25)"}}>Click number to mark done · ✏️ Edit target or saved amount</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.55rem"}}>
            {weeks.map((w,i)=>(
              <WeekCard key={i} week={w} idx={i} baseTarget={w.target??baseTarget}
                onToggle={onToggle} onAmountChange={onAmountChange} onTargetChange={onTargetChange}
                runningTotal={runningTotals[i]} totalTarget={goal.amount}/>
            ))}
          </div>
        </div>
      )}

      {/* CHARTS */}
      {tab==="charts"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"0.85rem",animation:"slideIn 0.28s ease"}}>
          <div className="glass" style={{padding:"1.2rem"}}>
            <div className="lbl" style={{marginBottom:"0.7rem"}}>Weekly Savings vs Target</div>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="week" tick={{fill:"rgba(255,255,255,0.28)",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip content={<ChartTip/>}/>
                <defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#059669"/></linearGradient></defs>
                <Bar dataKey="target" name="Target" fill="rgba(255,255,255,0.07)" radius={[5,5,0,0]}/>
                <Bar dataKey="saved"  name="Saved"  fill="url(#bg1)"               radius={[5,5,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass" style={{padding:"1.2rem"}}>
            <div className="lbl" style={{marginBottom:"0.7rem"}}>Cumulative Savings vs Goal Trajectory</div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.28}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="week" tick={{fill:"rgba(255,255,255,0.28)",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="goalLine"   name="Goal Line"        stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} strokeDasharray="5 5" fill="none"/>
                <Area type="monotone" dataKey="cumulative" name="Cumulative Saved" stroke="#10b981"                strokeWidth={2.5} fill="url(#ag1)" dot={{fill:"#10b981",strokeWidth:0,r:3}} activeDot={{r:5}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* BADGES */}
      {tab==="badges"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"0.7rem",animation:"slideIn 0.28s ease"}}>
          {BADGES.map(b=>{
            const e=weeksCompleted>=b.threshold;
            return(
              <div key={b.id} className={e?"glass hover-lift":"glass"} style={{padding:"1.2rem",textAlign:"center",border:e?`1px solid ${b.color}38`:"1px solid rgba(255,255,255,0.06)",background:e?`${b.color}0e`:"rgba(255,255,255,0.02)",opacity:e?1:0.42,transition:"all 0.3s"}}>
                <div style={{fontSize:"1.9rem",marginBottom:"0.45rem",filter:e?"none":"grayscale(1) brightness(0.35)"}}>{b.icon}</div>
                <div style={{fontWeight:800,color:e?b.color:"rgba(255,255,255,0.28)",marginBottom:"0.2rem",fontSize:"0.87rem"}}>{b.label}</div>
                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.28)",marginBottom:"0.6rem"}}>{b.desc}</div>
                {e?<span className="chip" style={{background:`${b.color}18`,color:b.color,border:`1px solid ${b.color}28`}}>Earned ✓</span>
                  :<span style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.18)"}}>Need {b.threshold} weeks</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* TIPS */}
      {tab==="tips"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"0.65rem",animation:"slideIn 0.28s ease"}}>
          {TIPS.map((t,i)=>(
            <div key={i} className="glass hover-lift" style={{padding:"1rem 1.2rem",display:"flex",gap:"0.85rem",alignItems:"flex-start"}}>
              <span style={{fontSize:"1.35rem",flexShrink:0,lineHeight:1}}>{t.icon}</span>
              <div><div style={{fontWeight:700,color:"#fff",marginBottom:"0.28rem",fontSize:"0.88rem"}}>{t.title}</div>
              <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.42)",lineHeight:1.6}}>{t.body}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* AI */}
      {tab==="ai"&&(
        <div style={{animation:"slideIn 0.28s ease"}}>
          <AIChat goal={goal} weeks={weeks} baseTarget={baseTarget}/>
        </div>
      )}

      {/* Completion */}
      {isComplete&&(
        <div style={{marginTop:"1.4rem",padding:"2.25rem",textAlign:"center",background:"linear-gradient(135deg,rgba(16,185,129,0.1),rgba(59,130,246,0.07))",border:"1px solid rgba(16,185,129,0.32)",borderRadius:22,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#10b981,#3b82f6,#8b5cf6,#10b981)"}}/>
          <div style={{fontSize:"3rem",marginBottom:"0.65rem"}}>🏆</div>
          <h2 style={{fontSize:"1.7rem",fontWeight:900,color:"#10b981",marginBottom:"0.5rem",letterSpacing:"-0.02em"}}>Goal Achieved!</h2>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.92rem",lineHeight:1.75}}>
            You saved <strong style={{color:"#10b981"}}>{fmtP(totalSaved)}</strong> in 10 weeks for your <strong style={{color:"#fff"}}>{goal.itemName}</strong>. Incredible discipline! 🇵🇭
          </p>
          <button className="btn-p" onClick={onReset} style={{marginTop:"1.1rem",borderRadius:12,padding:"0.8rem 1.9rem",fontSize:"0.92rem"}}>🎯 Set a New Goal</button>
        </div>
      )}
    </div>
  );
}

function Navbar({page,setPage,hasGoal}) {
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>25);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);
  return(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,padding:"0.72rem 1.4rem",display:"flex",justifyContent:"space-between",alignItems:"center",background:scrolled?"rgba(6,11,22,0.9)":"transparent",backdropFilter:scrolled?"blur(22px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,0.07)":"none",transition:"all 0.3s"}}>
      <button onClick={()=>setPage("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem",fontFamily:"inherit"}}>
        <div style={{width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.78rem",fontWeight:900,color:"#fff"}}>₱</div>
        <span style={{fontWeight:900,fontSize:"1rem",background:"linear-gradient(135deg,#fff,rgba(255,255,255,0.7))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-0.02em"}}>GoalFund <span style={{background:"linear-gradient(135deg,#10b981,#3b82f6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>PH</span></span>
      </button>
      <div style={{display:"flex",gap:"0.3rem",background:"rgba(0,0,0,0.28)",borderRadius:99,padding:"0.28rem"}}>
        {[["home","Home"],hasGoal&&["dashboard","Dashboard"],["planner","+ New Goal"]].filter(Boolean).map(([p,l])=>(
          <button key={p} onClick={()=>setPage(p)} style={{padding:"0.36rem 0.85rem",borderRadius:99,border:"none",cursor:"pointer",fontSize:"0.76rem",fontWeight:700,transition:"all 0.2s",fontFamily:"inherit",background:page===p?"rgba(16,185,129,0.22)":"transparent",color:page===p?"#10b981":"rgba(255,255,255,0.42)",boxShadow:page===p?"inset 0 0 0 1px rgba(16,185,129,0.28)":"none"}}>{l}</button>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const [page,setPage]=useState("home");
  const [goal,setGoal]=useState(null);
  const [weeks,setWeeks]=useState([]);
  const [confetti,setConfetti]=useState(false);

  useEffect(()=>{
    const s=loadS();
    if(s){setGoal(s.goal);setWeeks(s.weeks);setPage("dashboard");}
  },[]);
  useEffect(()=>{if(goal)saveS({goal,weeks});},[goal,weeks]);

  const handleGenerate=useCallback(({itemName,amount,emoji})=>{
    const wt=Math.ceil(amount/10);
    setGoal({itemName,amount,emoji});
    setWeeks(Array.from({length:10},()=>({done:false,saved:wt,target:wt})));
    setPage("dashboard");
  },[]);

  const handleToggle=useCallback((idx)=>{
    setWeeks(prev=>{
      const n=[...prev]; n[idx]={...n[idx],done:!n[idx].done};
      if(n.every(w=>w.done)){setTimeout(()=>{setConfetti(true);setTimeout(()=>setConfetti(false),6500);},350);}
      return n;
    });
  },[]);

  const handleAmount=useCallback((idx,val)=>{
    setWeeks(prev=>{const n=[...prev];n[idx]={...n[idx],saved:val};return n;});
  },[]);

  const handleTarget=useCallback((idx,val)=>{
    setWeeks(prev=>{const n=[...prev];n[idx]={...n[idx],target:val};return n;});
  },[]);

  return(
    <div style={{minHeight:"100vh",background:"#060b16",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif",overflowX:"hidden"}}>
      <style>{GLOBAL_CSS}</style>
      <ParticleBg/>
      <Confetti active={confetti}/>
      <Navbar page={page} setPage={setPage} hasGoal={!!goal}/>
      <div style={{paddingTop:65}}>
        {page==="home"&&<Hero onStart={()=>setPage(goal?"dashboard":"planner")}/>}
        {page==="planner"&&<GoalPlanner onGenerate={handleGenerate}/>}
        {page==="dashboard"&&goal&&<Dashboard goal={goal} weeks={weeks} onToggle={handleToggle} onAmountChange={handleAmount} onTargetChange={handleTarget} onReset={()=>setPage("planner")}/>}
        {page==="dashboard"&&!goal&&<GoalPlanner onGenerate={handleGenerate}/>}
      </div>
      <footer style={{textAlign:"center",padding:"2rem 1rem",borderTop:"1px solid rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.18)",fontSize:"0.72rem",position:"relative",zIndex:1,letterSpacing:"0.06em"}}>
        GOALFUND PH 🇵🇭 · SAVE SMART · DREAM BIG · WIN ALWAYS
      </footer>
    </div>
  );
}
