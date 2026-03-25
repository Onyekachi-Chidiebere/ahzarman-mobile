import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   AHZARMAN — COMPLETE APP v2  (All 20 fixes + 15 QA issues)
   ═══════════════════════════════════════════════════════════════
   QA Fixes in this version:
   1.  Onboarding illustrations — proper themed SVG art per slide
   2.  Share Points — real flow: search recipient → amount → PIN
   3.  Redeem Points — separate screen from Share
   4.  Marketing carousel taps — routed to real screens
   5.  Transaction icons — actual SVG icons not coloured circles
   6.  Betting companies — tappable → Fund Wallet flow
   7.  Airtime custom amount — text input added
   8.  Cable TV — multi-plan per provider (DStv/GOtv/Startimes)
   9.  Flights — results screen + children/infant passengers
   10. eSIM — internal catalog, not external screen
   11. Rewards — interactive tiers, redeem/share wired
   12. Personal Info — editable fields with save
   13. Security — change PIN flow (current→new→confirm)
   14. Notifications back → Profile (not Home)
   15. Tiers — clickable, show benefits, current tier highlighted
   ═══════════════════════════════════════════════════════════════ */

const C = {
  primary:"#A3B708", primLt:"#D9EF82", primXlt:"#EDF1CE", primFaint:"#F9FAEF",
  olive:"#919E2D", oliveD:"#B1C138",
  ink:"#020202", textColor:"#1A1A1A", body:"#323433", muted:"#747474",
  placeholder:"#C7C7C7", border:"#F0F0F0", borderMd:"#C0C4B8",
  white:"#FFFFFF", disabled:"#F5F5F5", disabledTxt:"#B0B0B0",
  error:"#C0392B", errorBg:"#FDF0EF", errorBorder:"#E8A09A",
  success:"#1E8449", successBg:"#EAFAF1",
};
const FB = "'Plus Jakarta Sans', sans-serif";
const FA = "'Switzer', 'Plus Jakarta Sans', sans-serif";
const grey = "#747474";
const NET_COL = { MTN:"#FFCC00", Airtel:"#FF0000", Glo:"#007B40", "9mobile":"#006633" };
const NET_TXT = { MTN:"#1A1A1A", Airtel:"#FFFFFF", Glo:"#FFFFFF", "9mobile":"#FFFFFF" };

const fmtNGN = n => `₦${Number(n).toLocaleString()}`;
const today = () => { const d=new Date(); d.setHours(0,0,0,0); return d; };
const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
const sameDay = (a,b) => a&&b&&a.toDateString()===b.toDateString();
const fmtDate = d => d?d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}):"";
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];

/* ══════════════════════════════════════════════════════════════
   FIX 5 QA — REAL SVG ICONS PER TX CATEGORY
   ══════════════════════════════════════════════════════════════ */
const TX_ICONS = {
  airtime: { bg:"#D9EAF1", el: (c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.37 1.05-.19 1.1.4 2.3.6 3.55.6.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C9.6 21 3 14.4 3 6c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.3.2 2.5.6 3.6-.17.33-.09.73.2.97z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" fill="none"/></svg>, col:"#1A6A8A" },
  data:    { bg:"#FAE0DB", el: (c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="19" r="2" fill={c}/><path d="M5 12a7 7 0 0 1 7 7" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none"/><path d="M5 6a13 13 0 0 1 13 13" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none"/></svg>, col:"#A93226" },
  electricity:{ bg:"#EDDAF0", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.09 12.6A1 1 0 0 0 5 14h7l-1 8 8.91-10.6A1 1 0 0 0 19 10h-7l1-8z" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>, col:"#7D3C98" },
  tv:      { bg:"#FFF8D6", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="14" rx="2" stroke={c} strokeWidth="1.6"/><path d="M8 20h8M12 18v2" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>, col:"#9A7D0A" },
  giftcard:{ bg:"#D9F1DB", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="2" y="9" width="20" height="13" rx="2" stroke={c} strokeWidth="1.6"/><path d="M16 9V7a4 4 0 0 0-8 0v2" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><line x1="2" y1="14" x2="22" y2="14" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><line x1="12" y1="9" x2="12" y2="22" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>, col:"#1E8449" },
  flights: { bg:"#FADBDB", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>, col:"#B03A2E" },
  betting: { bg:"#FAE0DB", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="1" y="6" width="22" height="13" rx="2" stroke={c} strokeWidth="1.6"/><circle cx="12" cy="12.5" r="3" stroke={c} strokeWidth="1.6"/><path d="M5 9.5v6M19 9.5v6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>, col:"#A04000" },
  esim:    { bg:"#D9E2F1", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l4 4v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/><rect x="8" y="10" width="3" height="3" rx=".5" stroke={c} strokeWidth="1.3"/><rect x="13" y="10" width="3" height="3" rx=".5" stroke={c} strokeWidth="1.3"/></svg>, col:"#1A3A8A" },
  refund:  { bg:"#E8F8ED", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 3v5h5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>, col:"#1E8449" },
  points:  { bg:C.primXlt, el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="5" stroke={c} strokeWidth="1.6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>, col:C.olive },
};

/* ── SHARED UI ──────────────────────────────────────────────── */
const StatusBar = ({ dark=true }) => {
  const [t,setT]=useState("");
  useEffect(()=>{ const f=()=>{ const n=new Date(); setT(`${n.getHours()}:${String(n.getMinutes()).padStart(2,"0")}`); }; f(); const id=setInterval(f,1000); return()=>clearInterval(id); },[]);
  const c=dark?"#000":C.white;
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 24px 8px", height:50, flexShrink:0, position:"relative", zIndex:200 }}>
      <span style={{ fontWeight:600, fontSize:17, letterSpacing:"-0.04em", color:c }}>{t}</span>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <svg width="18" height="12" viewBox="0 0 18 12">{[0,3,6,9].map((x,i)=><rect key={x} x={x} y={12-3.5*(i+1)} width="2.8" height={3.5*(i+1)} rx=".8" fill={c}/>)}</svg>
        <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 9a1.5 1.5 0 1 1 0 2.5A1.5 1.5 0 0 1 8 9z" fill={c}/><path d="M3.5 5.5a6.5 6.5 0 0 1 9 0" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/><path d="M.5 2.5a11 11 0 0 1 15 0" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
        <div style={{ position:"relative", width:25, height:12 }}><div style={{ position:"absolute", inset:0, border:`1.5px solid ${c}`, borderRadius:3, opacity:.4 }}/><div style={{ position:"absolute", left:1.5, top:1.5, width:18, height:9, background:c, borderRadius:1.5 }}/><div style={{ position:"absolute", right:-2, top:4, width:2, height:4, background:c, borderRadius:1, opacity:.4 }}/></div>
      </div>
    </div>
  );
};

const ScreenHeader = ({ title, onBack, rightSlot }) => (
  <div style={{ height:56, flexShrink:0, background:C.white, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", paddingLeft:4, paddingRight:12, position:"relative" }}>
    {onBack&&<button onClick={onBack} style={{ width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", background:"none", border:"none", cursor:"pointer", borderRadius:10 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
    {title&&<span style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", fontFamily:FB, fontWeight:600, fontSize:17, color:C.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"calc(100% - 100px)", pointerEvents:"none" }}>{title}</span>}
    {rightSlot&&<div style={{ marginLeft:"auto" }}>{rightSlot}</div>}
  </div>
);

const BottomNav = ({ active, goTo }) => {
  const tabs=[
    {key:"home",label:"Home",icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5z" stroke={a?C.primary:grey} strokeWidth="2" fill={a?C.primXlt:"none"} strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke={a?C.primary:grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>},
    {key:"services",label:"Services",icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke={a?C.primary:grey} strokeWidth="2" fill={a?C.primXlt:"none"}/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke={a?C.primary:grey} strokeWidth="2" fill={a?C.primXlt:"none"}/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke={a?C.primary:grey} strokeWidth="2" fill={a?C.primXlt:"none"}/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke={a?C.primary:grey} strokeWidth="2" fill={a?C.primXlt:"none"}/></svg>},
    {key:"rewards",label:"Rewards",icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="5" stroke={a?C.primary:grey} strokeWidth="2" fill={a?C.primXlt:"none"}/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke={a?C.primary:grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>},
    {key:"profile",label:"Profile",icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={a?C.primary:grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke={a?C.primary:grey} strokeWidth="2" fill={a?C.primXlt:"none"}/></svg>},
  ];
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:78, background:C.white, boxShadow:"0px -1px 0px rgba(0,0,0,0.06)", borderRadius:"12px 12px 0 0", display:"flex", alignItems:"center", zIndex:20 }}>
      {tabs.map(t=>{ const a=active===t.key; return (
        <button key={t.key} onClick={()=>goTo(t.key)} style={{ flex:1, height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, background:"none", border:"none", cursor:"pointer", position:"relative" }}>
          {a&&<div style={{ position:"absolute", top:0, width:32, height:3, background:C.primary, borderRadius:"0 0 4px 4px" }}/>}
          {t.icon(a)}
          <span style={{ fontFamily:FB, fontWeight:a?600:400, fontSize:11, color:a?C.primary:grey }}>{t.label}</span>
        </button>
      );})}
    </div>
  );
};

const Skeleton=({w="100%",h=16,r=8,dark=false})=><div style={{width:w,height:h,borderRadius:r,background:dark?"rgba(255,255,255,.1)":"linear-gradient(90deg,#F0F0F0 25%,#E8E8E8 50%,#F0F0F0 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite",flexShrink:0}}/>;
const Spinner=({size=20,color=C.primary,t=2})=><div style={{width:size,height:size,borderRadius:"50%",border:`${t}px solid ${color}30`,borderTopColor:color,animation:"spin .7s linear infinite",flexShrink:0}}/>;
const SpinnerBtn=({children,onClick,loading=false,disabled=false,style:extra={}})=>(
  <button onClick={onClick} disabled={disabled||loading} style={{width:"100%",height:50,background:disabled||loading?C.disabled:C.primary,border:"none",borderRadius:12,cursor:disabled||loading?"not-allowed":"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:disabled||loading?C.disabledTxt:C.ink,display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all .2s",...extra}}>
    {loading?<><Spinner size={18} color={C.disabledTxt}/><span style={{fontFamily:FB,fontWeight:600,fontSize:15}}>Processing…</span></>:children}
  </button>
);

const Toggle=({value,onChange})=>(
  <div onClick={()=>onChange(!value)} style={{width:44,height:26,borderRadius:13,background:value?C.primary:"#D0D0D0",position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
    <div style={{position:"absolute",top:3,left:value?21:3,width:20,height:20,borderRadius:10,background:C.white,boxShadow:"0 1px 4px rgba(0,0,0,.2)",transition:"left .2s"}}/>
  </div>
);

const Field=({label,value,onChange,type="text",inputMode,prefix,rightSlot,error,success,disabled=false,hint,multiline=false})=>{
  const [focused,setFocused]=useState(false);
  const ref=useRef(null);
  const hasVal=value!==""&&value!=null;
  const floated=focused||hasVal;
  let border=C.border,shadow="none",bg=C.white;
  if(disabled){bg=C.disabled;}
  else if(error){border=C.errorBorder;bg=C.errorBg;if(focused)shadow=`0 0 0 3px ${C.errorBorder}40`;}
  else if(success&&hasVal){border="#A9DFBF";bg=C.successBg;}
  else if(focused){border=C.primary;shadow=`0 0 0 3px ${C.primary}28`;}
  else if(hasVal){border="#C8D080";}
  if(multiline) return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <div style={{position:"relative",borderRadius:10,border:`1.5px solid ${border}`,background:bg,boxShadow:shadow,transition:"all .18s"}}>
        <span style={{position:"absolute",left:14,top:12,fontFamily:FB,fontWeight:400,fontSize:13,color:C.placeholder,pointerEvents:"none",display:value?"none":"block"}}>{label}</span>
        <textarea ref={ref} value={value} onChange={e=>!disabled&&onChange?.(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} rows={3} style={{width:"100%",border:"none",background:"transparent",outline:"none",padding:"12px 14px",fontFamily:FB,fontSize:15,color:C.ink,resize:"none",boxSizing:"border-box",borderRadius:10}}/>
      </div>
      {hint&&<div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:error?C.error:grey,marginTop:5,paddingLeft:4}}>{hint}</div>}
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <div onClick={()=>!disabled&&ref.current?.focus()} style={{position:"relative",height:56,borderRadius:10,border:`1.5px solid ${border}`,background:bg,cursor:disabled?"not-allowed":"text",transition:"all .18s",boxShadow:shadow,display:"flex",alignItems:"center"}}>
        <span style={{position:"absolute",left:prefix?38:14,top:floated?8:"50%",transform:floated?"none":"translateY(-50%)",fontFamily:FB,fontWeight:floated?500:400,fontSize:floated?10:15,color:error?C.error:focused?C.primary:hasVal?grey:C.placeholder,pointerEvents:"none",transition:"all .18s",lineHeight:1}}>{label}</span>
        {prefix&&<span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontFamily:FA,fontWeight:500,fontSize:16,color:hasVal?C.ink:C.placeholder,paddingTop:floated?10:0,transition:"padding-top .18s"}}>{prefix}</span>}
        <input ref={ref} type={type} inputMode={inputMode} value={value} onChange={e=>!disabled&&onChange?.(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} disabled={disabled} style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none",background:"transparent",outline:"none",paddingLeft:prefix?38:14,paddingRight:rightSlot?46:14,paddingTop:floated?18:0,fontFamily:prefix?FA:FB,fontWeight:500,fontSize:15,color:disabled?C.disabledTxt:C.ink,cursor:disabled?"not-allowed":"text",borderRadius:10,transition:"padding-top .18s"}} placeholder=""/>
        {rightSlot&&<div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",zIndex:2}}>{rightSlot}</div>}
      </div>
      {(error||hint)&&<div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:error?C.error:grey,marginTop:5,paddingLeft:4}}>{error||hint}</div>}
    </div>
  );
};

const EmptyState=({icon,title,subtitle,cta})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 40px",gap:20}}>
    <div style={{width:96,height:96,borderRadius:48,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</div>
    <div style={{textAlign:"center"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:18,color:C.ink,marginBottom:8}}>{title}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey,lineHeight:1.6}}>{subtitle}</div></div>
    {cta&&<button onClick={cta.onClick} style={{height:46,padding:"0 28px",background:C.primary,border:"none",borderRadius:10,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:15,color:C.ink}}>{cta.label}</button>}
  </div>
);

const TxAvatar=({type,failed=false})=>{
  const d=TX_ICONS[type]??TX_ICONS.airtime;
  return (
    <div style={{position:"relative",flexShrink:0}}>
      <div style={{width:42,height:42,borderRadius:21,background:d.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>{d.el(d.col)}</div>
      {failed&&<div style={{position:"absolute",bottom:-1,right:-1,width:16,height:16,borderRadius:8,background:"#E74C3C",border:`2px solid ${C.white}`,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke={C.white} strokeWidth="1.8" strokeLinecap="round"/></svg></div>}
    </div>
  );
};

const TxRow=({tx,isLast})=>{
  const isCredit=tx.amt?.startsWith("+"),isFailed=tx.status==="Failed";
  const amtColor=isFailed?"#E74C3C":isCredit?C.success:C.ink;
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,paddingBottom:isLast?0:14,marginBottom:isLast?0:14,borderBottom:isLast?"none":`1px solid ${C.border}`}}>
      <TxAvatar type={tx.type} failed={isFailed}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
          <span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:170}}>{tx.title}</span>
          <span style={{fontFamily:FA,fontWeight:600,fontSize:13,color:amtColor,flexShrink:0,marginLeft:8}}>{tx.amt}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:FB,fontWeight:400,fontSize:10,color:grey}}>{tx.date}</span>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            {tx.pts&&!isFailed&&<span style={{fontFamily:FB,fontWeight:600,fontSize:10,color:C.olive,background:C.primXlt,borderRadius:4,padding:"1px 6px"}}>{tx.pts}</span>}
            <div style={{padding:"1px 7px",background:isFailed?"#FDEDEC":tx.status==="Successful"?"#ECFDF3":"#FFFAEB",border:`1px solid ${isFailed?"#F1948A":tx.status==="Successful"?"#ABEFC6":"#FEDF89"}`,borderRadius:6}}>
              <span style={{fontFamily:FB,fontWeight:400,fontSize:10,color:isFailed?"#E74C3C":tx.status==="Successful"?"#067647":"#B54708"}}>{tx.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PAYMENT MODAL — OPay · Flutterwave · Bank Transfer
   ══════════════════════════════════════════════════════════════ */
const AHZARMAN_ACCT={bank:"Access Bank",name:"Ahzarman Technologies Ltd",number:"0814 7263 91",sort:"044"};

/* ── Provider sub-screens — at module scope to avoid remount on parent state change ── */
const PaymentProviderScreen=({id,amount,methods,providerStage,triggerWebhook})=>{
  const m=methods.find(x=>x.id===id);
  if(!m) return null;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <div style={{background:m.accent,borderRadius:"16px 16px 0 0",padding:"18px 20px",display:"flex",alignItems:"center",gap:12}}>
        {m.logo}
        <div>
          <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:700,fontSize:16,color:"white"}}>{m.label}</div>
          <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:400,fontSize:11,color:"rgba(255,255,255,.7)"}}>Secure checkout · SSL encrypted</div>
        </div>
        <div style={{marginLeft:"auto",background:"rgba(255,255,255,.18)",borderRadius:8,padding:"4px 12px"}}>
          <span style={{fontFamily:"'Switzer','Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:15,color:"white"}}>{amount}</span>
        </div>
      </div>
      <div style={{padding:"20px 20px 4px",display:"flex",flexDirection:"column",gap:16}}>
        {providerStage==="connecting"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"20px 0"}}>
            <div style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${m.accent}30`,borderTopColor:m.accent,animation:"spin .7s linear infinite"}}/>
            <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:500,fontSize:14,color:"#747474"}}>Connecting to {m.label}…</div>
          </div>
        )}
        {providerStage==="ready"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14,animation:"fadeIn .3s"}}>
            <div style={{background:"#F8F9F6",borderRadius:12,padding:"14px 16px",border:"1px solid #F0F0F0"}}>
              <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:500,fontSize:11,color:"#747474",marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Payment Summary</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:400,fontSize:14,color:"#020202"}}>Amount</span>
                <span style={{fontFamily:"'Switzer','Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:18,color:"#020202"}}>{amount}</span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {(id==="opay"?["OPay Wallet","Debit Card","Bank Transfer"]:["Card","Bank","USSD","QR Code"]).map((opt,i)=>(
                <div key={opt} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,border:`1.5px solid ${i===0?m.accent:"#F0F0F0"}`,background:i===0?"rgba(0,0,0,.02)":"#fff",cursor:"pointer"}}>
                  <div style={{width:8,height:8,borderRadius:4,background:i===0?m.accent:"#F0F0F0",flexShrink:0}}/>
                  <span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:i===0?600:400,fontSize:14,color:i===0?"#020202":"#747474"}}>{opt}</span>
                  {i===0&&<span style={{marginLeft:"auto",fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:600,fontSize:10,color:m.accent,background:`${m.accent}18`,padding:"2px 8px",borderRadius:4}}>DEFAULT</span>}
                </div>
              ))}
            </div>
            <button onClick={()=>triggerWebhook(id)} style={{width:"100%",height:52,background:m.accent,border:"none",borderRadius:12,cursor:"pointer",fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:700,fontSize:16,color:"white"}}>
              Confirm Payment — {amount}
            </button>
          </div>
        )}
        {providerStage==="processing"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"20px 0"}}>
            <div style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${m.accent}30`,borderTopColor:m.accent,animation:"spin .7s linear infinite"}}/>
            <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:600,fontSize:14,color:"#020202"}}>Processing payment…</div>
          </div>
        )}
        {providerStage==="done"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"20px 0"}}>
            <div style={{width:48,height:48,borderRadius:24,background:"#EAFAF1",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#1E8449" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:700,fontSize:16,color:"#020202"}}>Payment confirmed!</div>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentBankScreen=({amount,AHZARMAN_ACCT,bankProcessing,handleBankConfirm,methods})=>{
  const [copied,setCopied]=useState(false);
  const copyAcct=()=>{
    navigator.clipboard?.writeText(AHZARMAN_ACCT.number.replace(/\s/g,"")).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <div style={{background:"#1A4D8F",borderRadius:"16px 16px 0 0",padding:"18px 20px",display:"flex",alignItems:"center",gap:12}}>
        {methods[2].logo}
        <div><div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:700,fontSize:16,color:"white"}}>Bank Transfer</div><div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:400,fontSize:11,color:"rgba(255,255,255,.7)"}}>Transfer exactly {amount} to the account below</div></div>
      </div>
      <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:"linear-gradient(135deg,#1A4D8F,#0D3060)",borderRadius:14,padding:"20px",position:"relative",overflow:"hidden"}}>
          <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:400,fontSize:11,color:"rgba(255,255,255,.5)",letterSpacing:".06em",textTransform:"uppercase",marginBottom:4}}>Transfer to</div>
          <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:700,fontSize:15,color:"white",marginBottom:2}}>{AHZARMAN_ACCT.name}</div>
          <div style={{fontFamily:"'Switzer','Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:24,letterSpacing:".08em",color:"white",margin:"10px 0 6px"}}>{AHZARMAN_ACCT.number}</div>
          <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:500,fontSize:13,color:"rgba(255,255,255,.7)",marginBottom:14}}>{AHZARMAN_ACCT.bank}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{background:"rgba(255,255,255,.12)",borderRadius:8,padding:"6px 12px"}}>
              <span style={{fontFamily:"'Switzer','Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:14,color:"#A3B708"}}>Amount: {amount}</span>
            </div>
            <button onClick={copyAcct} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer"}}>
              {copied
                ?<span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:600,fontSize:12,color:"#A3B708"}}>✓ Copied!</span>
                :<span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:600,fontSize:12,color:"white"}}>Copy Acct</span>
              }
            </button>
          </div>
        </div>
        <div style={{background:"#FFF8E6",borderRadius:10,padding:"12px 14px",border:"1px solid #FFE4A0"}}>
          <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:400,fontSize:12,color:"#8B6000",lineHeight:1.6}}>⚠️ Transfer exactly <strong>{amount}</strong> — use your phone number as narration.</div>
        </div>
        {bankProcessing
          ?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"8px 0"}}>
              <div style={{width:28,height:28,borderRadius:14,border:"2px solid #1A4D8F30",borderTopColor:"#1A4D8F",animation:"spin .7s linear infinite"}}/>
              <div style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:500,fontSize:13,color:"#747474"}}>Waiting for transfer confirmation…</div>
            </div>
          :<button onClick={handleBankConfirm} style={{width:"100%",height:52,background:"#1A4D8F",border:"none",borderRadius:12,cursor:"pointer",fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:700,fontSize:15,color:"white"}}>
              I've Sent the Transfer ✓
            </button>
        }
      </div>
    </div>
  );
};

const PaymentModal=({amount,label,onSuccess,onDismiss})=>{
  /* step: "select" | "opay" | "flutterwave" | "bank" */
  const [step,setStep]=useState("select");
  const [providerStage,setProviderStage]=useState("connecting"); /* connecting | ready | processing | done */
  const [bankProcessing,setBankProcessing]=useState(false);
  const timerRef=useRef(null);

  /* simulate provider connection → ready */
  useEffect(()=>{
    if(step==="opay"||step==="flutterwave"){
      setProviderStage("connecting");
      timerRef.current=setTimeout(()=>setProviderStage("ready"),2000);
    }
    return()=>clearTimeout(timerRef.current);
  },[step]);

  const triggerWebhook=(provider)=>{
    setProviderStage("processing");
    /* Simulate API webhook callback completing the payment */
    timerRef.current=setTimeout(()=>{setProviderStage("done");setTimeout(()=>onSuccess(),700);},2200);
  };

  const handleBankConfirm=()=>{
    setBankProcessing(true);
    timerRef.current=setTimeout(()=>onSuccess(),2400);
  };

  const METHODS=[
    {id:"opay",     label:"OPay",        sub:"Pay via OPay wallet or card",         accent:"#1B8B4B", logo:(
      <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#1B8B4B"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="Arial">O</text></svg>
    )},
    {id:"flutterwave", label:"Flutterwave", sub:"Pay with card, bank or USSD",      accent:"#F5A623", logo:(
      <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#F5A623"/><path d="M14 26c2-4 4-8 8-12M18 26c2-3 3-6 6-10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
    )},
    {id:"bank",     label:"Bank Transfer", sub:"Transfer to Ahzarman account",      accent:"#1A4D8F", logo:(
      <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#1A4D8F"/><rect x="10" y="18" width="20" height="12" rx="2" fill="white" opacity=".9"/><polygon points="20,8 30,18 10,18" fill="white" opacity=".9"/></svg>
    )},
  ];

  return(
    <div onClick={e=>e.target===e.currentTarget&&step==="select"&&onDismiss()} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:"22px 22px 0 0",animation:"slideUp .28s cubic-bezier(.4,0,.2,1)",maxHeight:"90%",display:"flex",flexDirection:"column"}}>
        {/* Drag handle + back nav */}
        <div style={{display:"flex",alignItems:"center",padding:"12px 16px 0",flexShrink:0}}>
          {step!=="select"
            ?<button onClick={()=>{setStep("select");setProviderStage("connecting");setBankProcessing(false);}} style={{width:32,height:32,borderRadius:16,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
            :<div style={{width:32}}/>
          }
          <div style={{flex:1,display:"flex",justifyContent:"center"}}><div style={{width:40,height:4,borderRadius:2,background:"#E0E0E0"}}/></div>
          <button onClick={onDismiss} style={{width:32,height:32,borderRadius:16,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke={grey} strokeWidth="2" strokeLinecap="round"/></svg></button>
        </div>

        <div style={{flex:1,overflowY:"auto"}}>
          {step==="select"&&(
            <div style={{padding:"12px 20px 32px",display:"flex",flexDirection:"column",gap:16}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:FB,fontWeight:700,fontSize:18,color:C.ink,marginBottom:4}}>Choose Payment Method</div>
                <div style={{fontFamily:FB,fontWeight:400,fontSize:13,color:grey}}>Pay <span style={{fontFamily:FA,fontWeight:700,color:C.ink}}>{amount}</span>{label?` · ${label}`:""}</div>
              </div>
              {/* Secure badge */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={C.olive} strokeWidth="2" strokeLinejoin="round"/></svg>
                <span style={{fontFamily:FB,fontWeight:500,fontSize:11,color:C.olive}}>256-bit SSL secured · PCI DSS compliant</span>
              </div>
              {/* Payment method cards */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {METHODS.map(m=>(
                  <div key={m.id} onClick={()=>setStep(m.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"16px",borderRadius:14,border:`1.5px solid ${C.border}`,background:C.white,cursor:"pointer",transition:"all .18s",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                    {m.logo}
                    <div style={{flex:1}}>
                      <div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.ink}}>{m.label}</div>
                      <div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>{m.sub}</div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={C.placeholder} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                ))}
              </div>
              <div style={{textAlign:"center",paddingTop:4}}>
                <span style={{fontFamily:FB,fontWeight:400,fontSize:11,color:C.placeholder}}>Payments powered by OPay & Flutterwave</span>
              </div>
            </div>
          )}
          {(step==="opay"||step==="flutterwave")&&<PaymentProviderScreen id={step} amount={amount} methods={METHODS} providerStage={providerStage} triggerWebhook={triggerWebhook}/>}
          {step==="bank"&&<PaymentBankScreen amount={amount} AHZARMAN_ACCT={AHZARMAN_ACCT} bankProcessing={bankProcessing} handleBankConfirm={handleBankConfirm} methods={METHODS}/>}
        </div>
      </div>
    </div>
  );
};
/* alias — every service still calls PinSheet; wire it through PaymentModal */
const PinSheet=({amount,label,onSuccess,onDismiss})=><PaymentModal amount={amount} label={label} onSuccess={onSuccess} onDismiss={onDismiss}/>;

/* ── COUNTRY SHEET ──────────────────────────────────────────── */
const COUNTRIES=[
  {code:"NG",name:"Nigeria",flag:"🇳🇬",currency:"NGN",cards:["Netflix","Spotify","iTunes","Amazon","Google Play"]},
  {code:"US",name:"United States",flag:"🇺🇸",currency:"USD",cards:["Amazon","Apple","Google Play","Steam","Xbox","Netflix","Spotify"]},
  {code:"GB",name:"United Kingdom",flag:"🇬🇧",currency:"GBP",cards:["Amazon UK","iTunes UK","Google Play","Netflix","ASOS"]},
  {code:"CA",name:"Canada",flag:"🇨🇦",currency:"CAD",cards:["Amazon CA","iTunes CA","Google Play","Netflix","Steam"]},
  {code:"AU",name:"Australia",flag:"🇦🇺",currency:"AUD",cards:["iTunes AU","Google Play","Netflix","Steam"]},
  {code:"GH",name:"Ghana",flag:"🇬🇭",currency:"GHS",cards:["Netflix","Spotify","Google Play"]},
  {code:"ZA",name:"South Africa",flag:"🇿🇦",currency:"ZAR",cards:["Netflix","iTunes","Google Play","Steam"]},
  {code:"AE",name:"UAE",flag:"🇦🇪",currency:"AED",cards:["Amazon AE","iTunes","Google Play","Netflix","Xbox"]},
  {code:"DE",name:"Germany",flag:"🇩🇪",currency:"EUR",cards:["Amazon DE","iTunes","Google Play","Netflix","Steam"]},
  {code:"JP",name:"Japan",flag:"🇯🇵",currency:"JPY",cards:["Amazon JP","iTunes JP","Nintendo","PlayStation"]},
];
const CARD_COLORS={Netflix:"#E50914",Spotify:"#1DB954",iTunes:"#FC3C44",Apple:"#555",Amazon:"#FF9900","Amazon UK":"#FF9900","Amazon CA":"#FF9900","Amazon DE":"#FF9900","Amazon AE":"#FF9900","Amazon JP":"#FF9900","iTunes UK":"#FC3C44","iTunes CA":"#FC3C44","iTunes AU":"#FC3C44","iTunes JP":"#FC3C44",Steam:"#1B2838","Google Play":"#34A853",Xbox:"#107C10",ASOS:"#000",Nintendo:"#E60012",PlayStation:"#003087"};

const CountrySheet=({selected,onSelect,onClose})=>{
  const [q,setQ]=useState(""); const ref=useRef(null);
  useEffect(()=>{setTimeout(()=>ref.current?.focus(),220);},[]);
  const list=COUNTRIES.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.currency.toLowerCase().includes(q.toLowerCase()));
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.52)",zIndex:80,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:"20px 20px 0 0",height:"72%",display:"flex",flexDirection:"column",animation:"slideUp .28s"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 0"}}><div style={{width:40,height:4,borderRadius:2,background:"#E0E0E0"}}/></div>
        <div style={{padding:"12px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <span style={{fontFamily:FB,fontWeight:700,fontSize:17,color:C.ink}}>Select Country</span>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:15,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke={grey} strokeWidth="2" strokeLinecap="round"/></svg></button>
        </div>
        <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{height:42,borderRadius:10,background:"#F5F6F1",display:"flex",alignItems:"center",gap:8,padding:"0 12px"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={grey} strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke={grey} strokeWidth="2" strokeLinecap="round"/></svg>
            <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search countries…" style={{flex:1,border:"none",outline:"none",background:"transparent",fontFamily:FB,fontSize:14,color:C.ink}}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {list.map((c,i)=>{const s=selected?.code===c.code;return(
            <div key={c.code} onClick={()=>{onSelect(c);onClose();}} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<list.length-1?`1px solid ${C.border}`:"none",cursor:"pointer",background:s?C.primFaint:"transparent"}}>
              <span style={{fontSize:26,lineHeight:1,flexShrink:0}}>{c.flag}</span>
              <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:s?600:400,fontSize:15,color:C.ink}}>{c.name}</div><div style={{fontFamily:FB,fontSize:11,color:grey}}>{c.currency} · {c.cards.length} cards</div></div>
              {s&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={C.primary}/><path d="M8 12l3 3 5-5" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
          );})}
        </div>
      </div>
    </div>
  );
};

/* ── CALENDAR ───────────────────────────────────────────────── */
const CalendarPicker=({selected,minDate,onSelect,onClose})=>{
  const min=minDate??today();
  const init=selected?new Date(selected.getFullYear(),selected.getMonth(),1):new Date(today().getFullYear(),today().getMonth(),1);
  const [vm,setVm]=useState(init);
  const prevM=()=>{const p=new Date(vm.getFullYear(),vm.getMonth()-1,1);if(p>=new Date(min.getFullYear(),min.getMonth(),1))setVm(p);};
  const nextM=()=>setVm(new Date(vm.getFullYear(),vm.getMonth()+1,1));
  const first=vm.getDay(),days=new Date(vm.getFullYear(),vm.getMonth()+1,0).getDate();
  const cells=[...Array(first).fill(null),...Array.from({length:days},(_,i)=>new Date(vm.getFullYear(),vm.getMonth(),i+1))];
  while(cells.length%7!==0)cells.push(null);
  const isDisabled=d=>d&&d<min,isSel=d=>d&&sameDay(d,selected),isTod=d=>d&&sameDay(d,today());
  return (
    <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",overflow:"hidden",marginTop:8}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 10px"}}>
        <button onClick={prevM} style={{width:36,height:36,borderRadius:8,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        <span style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.ink}}>{MONTHS[vm.getMonth()]} {vm.getFullYear()}</span>
        <button onClick={nextM} style={{width:36,height:36,borderRadius:8,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 10px"}}>
        {DAYS.map(d=><div key={d} style={{textAlign:"center",padding:"4px 0",fontFamily:FB,fontWeight:600,fontSize:11,color:grey}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"4px 10px 14px",gap:"2px 0"}}>
        {cells.map((d,i)=>{if(!d)return <div key={`cell-${i}`}/>;const dis=isDisabled(d),sel=isSel(d),tod=isTod(d);return(
          <div key={`cal-${i}`} onClick={()=>!dis&&(onSelect(d),onClose())} style={{height:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:dis?"not-allowed":"pointer",borderRadius:10,background:sel?C.primary:"transparent",position:"relative"}}>
            {tod&&!sel&&<div style={{position:"absolute",inset:4,borderRadius:8,border:`2px solid ${C.primary}`,opacity:.5}}/>}
            <span style={{fontFamily:FA,fontWeight:sel?700:tod?600:400,fontSize:13,color:sel?C.ink:dis?C.placeholder:tod?C.primary:C.ink,textDecoration:dis?"line-through":"none"}}>{d.getDate()}</span>
          </div>
        );})}
      </div>
      <div style={{display:"flex",gap:8,padding:"0 12px 14px"}}>
        {[{l:"Today",d:today()},{l:"Tomorrow",d:addDays(today(),1)},{l:"+1 week",d:addDays(today(),7)}].map(s=><button key={s.l} onClick={()=>{onSelect(s.d);onClose();}} disabled={isDisabled(s.d)} style={{flex:1,height:30,borderRadius:8,border:`1px solid ${C.primary}`,background:C.primFaint,cursor:"pointer",fontFamily:FB,fontWeight:500,fontSize:11,color:C.olive}}>{s.l}</button>)}
      </div>
    </div>
  );
};

/* ── MARKETING CAROUSEL ─────────────────────────────────────── */
const MarketingCarousel=({goTo})=>{
  const [idx,setIdx]=useState(0),ptrX=useRef(null),interacted=useRef(null),autoRef=useRef(null);
  const promos=[
    {id:"refer",bg:"#020202",titleCol:C.primLt,label:"REFERRAL BONUS",title:"Refer friends. They get light. You get points.",sub:"₦2,500 points per friend",cta:"Refer Now",screen:"refer"},
    {id:"electricity",bg:"#1C3A1C",titleCol:"#F8F9F6",label:"EARN ON EVERY PURCHASE",title:"Every ₦5,000 electricity token = 500 points",sub:"Redeemable as free electricity",cta:"Buy Electricity",screen:"electricity"},
    {id:"share",bg:"#1A1A3A",titleCol:"#F0F0FF",label:"POINTS GIFTING",title:"Share your points with a neighbour",sub:"Transfer to any Ahzarman user",cta:"Share Points",screen:"share_points"},
  ];
  useEffect(()=>{autoRef.current=setInterval(()=>{if(!interacted.current||Date.now()-interacted.current>4000)setIdx(p=>(p+1)%promos.length);},4000);return()=>clearInterval(autoRef.current);},[]);
  const p=promos[idx];
  return (
    <div style={{padding:"0 16px"}}>
      <div
        onPointerDown={e=>ptrX.current=e.clientX}
        onPointerUp={e=>{const dx=e.clientX-ptrX.current;interacted.current=Date.now();if(Math.abs(dx)>40){setIdx(prev=>dx<0?(prev+1)%promos.length:(prev-1+promos.length)%promos.length);}else{goTo(p.screen);}ptrX.current=null;}}
        style={{height:130,background:p.bg,borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden",cursor:"pointer",display:"flex",alignItems:"stretch",position:"relative",userSelect:"none"}}>
        <div style={{flex:1,padding:"14px 0 14px 16px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div>
            <span style={{fontFamily:FB,fontWeight:700,fontSize:9,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(255,255,255,.35)",display:"block",marginBottom:5}}>{p.label}</span>
            <span style={{fontFamily:FB,fontWeight:700,fontSize:14,letterSpacing:"-0.02em",lineHeight:"118%",color:p.titleCol,display:"block",marginBottom:5}}>{p.title}</span>
            <span style={{fontFamily:FB,fontWeight:300,fontSize:11,color:"rgba(255,255,255,.5)"}}>{p.sub}</span>
          </div>
          <div style={{background:C.white,borderRadius:6,padding:"5px 14px",alignSelf:"flex-start"}}><span style={{fontFamily:FB,fontWeight:600,fontSize:11,color:C.ink}}>{p.cta} →</span></div>
        </div>
        <div style={{width:96,flexShrink:0,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-28,top:"50%",transform:"translateY(-50%)",width:140,height:140,borderRadius:"50%",background:C.primary,opacity:.1}}/>
          <div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",width:68,height:68,borderRadius:"50%",background:C.primary,opacity:.16}}/>
        </div>
        <div style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",gap:4}}>
          {promos.map((_,i)=><div key={`promo-${i}`} onPointerUp={e=>{e.stopPropagation();interacted.current=Date.now();setIdx(i);}} style={{width:4,height:4,borderRadius:"50%",cursor:"pointer",background:i===idx?C.white:"rgba(255,255,255,.3)",transition:"background .3s"}}/>)}
        </div>
      </div>
    </div>
  );
};

/* ── TOKEN CARD ─────────────────────────────────────────────── */
const TokenCard=({token,meter,disco})=>{
  const [copied,setCopied]=useState(false),[open,setOpen]=useState(false);
  const copy=()=>{try{navigator.clipboard.writeText(token);}catch(_){}setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const fmtTok=r=>r.match(/.{1,4}/g)?.join(" - ")??r;
  return (
    <div style={{borderRadius:16,overflow:"hidden"}}>
      <div style={{background:"linear-gradient(135deg,#141414 0%,#1E1E1E 60%,#222810 100%)",padding:"20px 20px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.09 12.6A1 1 0 0 0 5 14h7l-1 8 8.91-10.6A1 1 0 0 0 19 10h-7l1-8z" stroke={C.primLt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontFamily:FB,fontWeight:600,fontSize:11,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(255,255,255,.45)"}}>Electricity Token</span></div>
        <div style={{fontFamily:FA,fontWeight:700,fontSize:21,letterSpacing:".06em",color:C.white,lineHeight:1.45,marginBottom:8,wordBreak:"break-all"}}>{fmtTok(token)}</div>
        <div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(255,255,255,.38)"}}>Meter: {meter} · {disco}</div>
      </div>
      <div style={{background:"#1A1A1A",display:"flex",borderTop:"1px solid rgba(255,255,255,.07)",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <button onClick={copy} style={{flex:1,height:48,background:copied?"rgba(163,183,8,.15)":"transparent",border:"none",borderRight:"1px solid rgba(255,255,255,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          {copied?<><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.primary}}>Copied!</span></>:<><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="rgba(255,255,255,.55)" strokeWidth="1.8"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="rgba(255,255,255,.55)" strokeWidth="1.8"/></svg><span style={{fontFamily:FB,fontWeight:600,fontSize:13,color:"rgba(255,255,255,.65)"}}>Copy Token</span></>}
        </button>
        <button onClick={copy} style={{flex:1,height:48,background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="rgba(255,255,255,.55)" strokeWidth="1.8"/><circle cx="6" cy="12" r="3" stroke="rgba(255,255,255,.55)" strokeWidth="1.8"/><circle cx="18" cy="19" r="3" stroke="rgba(255,255,255,.55)" strokeWidth="1.8"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span style={{fontFamily:FB,fontWeight:600,fontSize:13,color:"rgba(255,255,255,.65)"}}>Share</span>
        </button>
      </div>
      <div style={{background:"#181800",padding:"10px 18px",display:"flex",alignItems:"center",gap:8}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#FEDF89" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="#FEDF89" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="#FEDF89"/></svg>
        <span style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(254,223,137,.75)"}}>Single use · Valid for 1 year · Keep this token safe</span>
      </div>
      <div style={{background:"#161616"}}>
        <button onClick={()=>setOpen(v=>!v)} style={{width:"100%",padding:"12px 18px",background:"none",border:"none",borderTop:"1px solid rgba(255,255,255,.06)",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:"rgba(255,255,255,.45)"}}>How to load this token</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}><path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {open&&<div style={{padding:"0 18px 16px",display:"flex",flexDirection:"column",gap:10}}>
          {["Locate the keypad on your prepaid meter","Press # or * to wake the meter","Enter all 20 digits exactly as shown","Press Enter or # to confirm","Meter will show units added"].map((s,i)=>(
            <div key={`step-${i}`} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:20,height:20,borderRadius:10,background:"rgba(163,183,8,.2)",border:"1px solid rgba(163,183,8,.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FA,fontWeight:700,fontSize:10,color:C.primLt}}>{i+1}</span></div>
              <span style={{fontFamily:FB,fontWeight:400,fontSize:12,color:"rgba(255,255,255,.45)",lineHeight:1.6}}>{s}</span>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
};

/* ── SERVICE GRID ───────────────────────────────────────────── */
const SVC_COLORS={phone:"#D9EAF1",data:"#FAE0DB",light:"#EDDAF0",tv:"#FFF8D6",gift:"#D9F1DB",plane:"#FADBDB",bet:"#FAE0DB",sim:"#D9E2F1"};
const SvcIcon=({type,size=22})=>{
  const s={stroke:"#000",strokeWidth:"2",fill:"none",strokeLinecap:"round",strokeLinejoin:"round"};
  const v="0 0 24 24";
  const icons={
    phone:<svg width={size} height={size} viewBox={v} fill="none"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.28-.28.7-.37 1.05-.19 1.1.4 2.3.6 3.55.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6-.18.35-.09.73.5.2z" {...s}/></svg>,
    data:<svg width={size} height={size} viewBox={v} fill="none"><circle cx="5" cy="19" r="2" fill="#000"/><path d="M5 12a7 7 0 0 1 7 7" {...s}/><path d="M5 6a13 13 0 0 1 13 13" {...s}/></svg>,
    light:<svg width={size} height={size} viewBox={v} fill="none"><path d="M12 2a6 6 0 0 1 4.24 10.24C15.45 13.04 15 14 15 15H9c0-1-.45-1.96-1.24-2.76A6 6 0 0 1 12 2z" {...s}/><path d="M9 15h6M9 18h6M10 21h4" {...s}/></svg>,
    tv:<svg width={size} height={size} viewBox={v} fill="none"><rect x="2" y="4" width="20" height="13" rx="2" {...s}/><path d="M0 20.5h24" {...s}/></svg>,
    gift:<svg width={size} height={size} viewBox={v} fill="none"><rect x="2" y="9" width="20" height="12" rx="2" {...s}/><path d="M16 9V7a4 4 0 0 0-8 0v2" {...s}/><line x1="2" y1="14" x2="22" y2="14" {...s}/></svg>,
    plane:<svg width={size} height={size} viewBox={v} fill="none"><path d="M21 5C21 5 19 3 17 4L13.5 7.5L4 6L2.5 7.5L10 11L7 14L4.5 13.5L3.5 14.5L6.5 16.5L8.5 19.5L9.5 18.5L9 16L12 13L15.5 20.5L17 19L15.5 9.5L19 6C20 5.5 21 5 21 5Z" {...s}/></svg>,
    bet:<svg width={size} height={size} viewBox={v} fill="none"><rect x="1" y="6" width="22" height="13" rx="2" {...s}/><circle cx="12" cy="12.5" r="3" {...s}/><path d="M5 10v5M19 10v5" {...s}/></svg>,
    sim:<svg width={size} height={size} viewBox={v} fill="none"><path d="M6 2h9l4 4v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" {...s}/></svg>,
  };
  return icons[type]||null;
};
const SVC_LIST=[{key:"phone",label:"Airtime",screen:"airtime"},{key:"data",label:"Data",screen:"data"},{key:"light",label:"Electricity",screen:"electricity"},{key:"tv",label:"Cable TV",screen:"tv"},{key:"gift",label:"Gift Cards",screen:"giftcards"},{key:"plane",label:"Flights",screen:"flights"},{key:"bet",label:"Betting",screen:"betting"},{key:"sim",label:"eSIM",screen:"esim"}];
const SAMPLE_TXS=[
  {type:"airtime",title:"Airtime — MTN",amt:"-₦500",pts:"+30 pts",date:"Today, 10:23",status:"Successful"},
  {type:"electricity",title:"Electricity — AEDC",amt:"-₦5,050",pts:"+250 pts",date:"Today, 09:01",status:"Successful"},
  {type:"data",title:"Data — Airtel 1.5GB",amt:"-₦700",pts:"+40 pts",date:"Yesterday",status:"Pending"},
  {type:"tv",title:"DStv Compact",amt:"-₦9,600",pts:"+480 pts",date:"Yesterday",status:"Successful"},
  {type:"giftcard",title:"iTunes Gift Card",amt:"-₦40,000",pts:"+800 pts",date:"2 days ago",status:"Successful"},
  {type:"betting",title:"Bet9ja Wallet",amt:"-₦2,000",pts:"+100 pts",date:"2 days ago",status:"Failed"},
];

/* ════════════════════════════════════════════════════════════════
   SCREENS
   ════════════════════════════════════════════════════════════════ */

/* FIX 1 QA — ONBOARDING ILLUSTRATIONS */
const OnboardingIllos = {
  airtime: ()=>(
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
      <circle cx="110" cy="100" r="90" fill={C.primXlt}/>
      <rect x="70" y="40" width="80" height="130" rx="12" fill={C.white} stroke={C.primLt} strokeWidth="2"/>
      <rect x="80" y="55" width="60" height="8" rx="4" fill={C.primXlt}/>
      <circle cx="110" cy="155" r="6" fill={C.primXlt}/>
      <path d="M85 90c0-13.8 11.2-25 25-25s25 11.2 25 25" stroke={C.primary} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M93 90c0-9.4 7.6-17 17-17s17 7.6 17 17" stroke={C.olive} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="110" cy="90" r="5" fill={C.primary}/>
      <rect x="78" y="105" width="54" height="6" rx="3" fill={C.primXlt}/>
      <rect x="84" y="117" width="42" height="5" rx="2.5" fill={C.primXlt}/>
    </svg>
  ),
  electricity: ()=>(
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
      <circle cx="110" cy="100" r="90" fill={C.primXlt}/>
      <rect x="65" y="50" width="90" height="110" rx="10" fill={C.ink}/>
      <rect x="75" y="65" width="70" height="40" rx="6" fill="#1A1A1A"/>
      <path d="M105 50L90 85h15l-10 35 25-45h-15l10-25z" fill={C.primary}/>
      <rect x="80" y="115" width="25" height="8" rx="4" fill={C.primXlt}/>
      <rect x="115" y="115" width="15" height="8" rx="4" fill="#333"/>
      <rect x="80" y="130" width="60" height="6" rx="3" fill="#222"/>
      <rect x="80" y="142" width="45" height="6" rx="3" fill="#222"/>
    </svg>
  ),
  rewards: ()=>(
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
      <circle cx="110" cy="100" r="90" fill={C.primXlt}/>
      <path d="M80 70h60v35a30 30 0 0 1-60 0V70z" fill={C.primary} stroke={C.olive} strokeWidth="2"/>
      <path d="M65 80H80M140 80h15" stroke={C.olive} strokeWidth="2" strokeLinecap="round"/>
      <path d="M72 80a8 8 0 0 0 8 8M140 80a8 8 0 0 1-8 8" stroke={C.olive} strokeWidth="2" strokeLinecap="round"/>
      <path d="M110 125v20M95 145h30" stroke={C.olive} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="110" cy="90" r="14" fill={C.white} opacity=".3"/>
      <path d="M104 90l4 4 8-8" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {[{cx:85,cy:55},{cx:135,cy:55},{cx:110,cy:48}].map((p,i)=><circle key={`illo-${i}`} cx={p.cx} cy={p.cy} r="5" fill={C.primLt}/>)}
    </svg>
  ),
  giftcards: ()=>(
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
      <circle cx="110" cy="100" r="90" fill={C.primXlt}/>
      <rect x="55" y="65" width="110" height="75" rx="10" fill={C.primary}/>
      <rect x="55" y="85" width="110" height="15" fill={C.olive} opacity=".5"/>
      <rect x="65" y="110" width="40" height="8" rx="4" fill={C.white} opacity=".7"/>
      <circle cx="150" cy="75" r="12" fill={C.white} opacity=".2"/>
      <path d="M110 55V45M110 45c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10h-10" stroke={C.olive} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M110 55V45M110 45c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10h10" stroke={C.oliveD} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),
};

/* ── NUMPAD (reusable for auth PIN / OTP) ───────────────────── */
const NumPad=({onDigit,onDelete,disabled=false})=>{
  const rows=[["1","2","3"],["4","5","6"],["7","8","9"],[null,"0","del"]];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4,padding:"0 8px"}}>
      {rows.map((row,ri)=>(
        <div key={ri} style={{display:"flex",gap:4}}>
          {row.map((d,di)=>{
            if(d===null)return <div key={di} style={{flex:1,height:54}}/>;
            if(d==="del")return <button key={di} onClick={onDelete} disabled={disabled} style={{flex:1,height:54,background:"none",border:"none",cursor:disabled?"not-allowed":"pointer",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke={disabled?C.placeholder:C.ink} strokeWidth="1.8" strokeLinejoin="round"/><line x1="18" y1="9" x2="12" y2="15" stroke={disabled?C.placeholder:C.ink} strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="9" x2="18" y2="15" stroke={disabled?C.placeholder:C.ink} strokeWidth="1.8" strokeLinecap="round"/></svg></button>;
            return <button key={di} onClick={()=>onDigit(d)} disabled={disabled} style={{flex:1,height:54,background:disabled?C.disabled:"#F8F9F6",border:"none",borderRadius:10,cursor:disabled?"not-allowed":"pointer",fontFamily:FA,fontWeight:600,fontSize:22,color:disabled?C.disabledTxt:C.ink}}>{d}</button>;
          })}
        </div>
      ))}
    </div>
  );
};

const ScreenOnboarding=({goTo})=>{
  const [idx,setIdx]=useState(0);
  const slides=[
    {Illo:OnboardingIllos.airtime,title:"Airtime & Data",sub:"Buy airtime and data for any network instantly. Every purchase earns you Ahzarman points."},
    {Illo:OnboardingIllos.electricity,title:"Pay for Electricity",sub:"Your prepaid electricity token delivered to your phone within seconds of payment."},
    {Illo:OnboardingIllos.rewards,title:"Earn Points",sub:"Every purchase earns Ahzarman points. Share them with neighbours or redeem for free electricity."},
    {Illo:OnboardingIllos.giftcards,title:"Gift Cards & More",sub:"Flights, betting, gift cards, cable TV — all in one app, all earning you points."},
  ];
  const s=slides[idx];
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white}}>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}><s.Illo/></div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
        {slides.map((_,i)=><div key={`slidedot-${i}`} onClick={()=>setIdx(i)} style={{width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?C.primary:"#C8D080",cursor:"pointer",transition:"all .3s"}}/>)}
      </div>
      <div style={{padding:"0 28px",textAlign:"center",marginBottom:24}}>
        <h2 style={{fontFamily:FA,fontWeight:700,fontSize:22,letterSpacing:"-0.02em",color:C.textColor,margin:"0 0 8px",lineHeight:1.3}}>{s.title}</h2>
        <p style={{fontFamily:FB,fontWeight:400,fontSize:15,color:grey,margin:0,lineHeight:1.6}}>{s.sub}</p>
      </div>
      <div style={{padding:"0 16px 32px",display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={()=>idx===3?goTo("sign_up"):setIdx(idx+1)} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>{idx===3?"Create Account →":"Next"}</button>
        {idx===3
          ?<button onClick={()=>goTo("sign_in")} style={{width:"100%",height:44,background:"none",border:"none",cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:14,color:C.olive}}>I already have an account →</button>
          :<button onClick={()=>goTo("sign_up")} style={{width:"100%",height:44,background:"none",border:"none",cursor:"pointer",fontFamily:FB,fontWeight:500,fontSize:14,color:grey}}>Skip</button>
        }
      </div>
    </div>
  );
};

/* ── AUTH: SIGN UP ──────────────────────────────────────────── */
const ScreenSignUp=({goTo})=>{
  const [step,setStep]=useState(1);
  const [name,setName]=useState(""), [phone,setPhone]=useState("");
  const [otp,setOtp]=useState(""), [timer,setTimer]=useState(60), [canResend,setCanResend]=useState(false);
  const [pin,setPin]=useState(""), [confirmPin,setConfirmPin]=useState(""), [pinStage,setPinStage]=useState("create"), [pinErr,setPinErr]=useState("");

  useEffect(()=>{
    if(step!==2)return;
    setTimer(60);setCanResend(false);
    const iv=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(iv);setCanResend(true);return 0;}return t-1;}),1000);
    return()=>clearInterval(iv);
  },[step]);

  const canStep1=name.trim().length>=2&&phone.replace(/\D/g,"").length===11;

  const handlePinContinue=()=>{
    if(pinStage==="create"){if(pin.length<4)return;setPinStage("confirm");return;}
    if(pin!==confirmPin){setPinErr("PINs do not match. Try again.");setConfirmPin("");return;}
    goTo("home");
  };

  const PinDots=({val,n=4})=>(
    <div style={{display:"flex",gap:16,justifyContent:"center",margin:"8px 0"}}>
      {[...Array(n)].map((_,i)=><div key={`pindot-${i}`} style={{width:14,height:14,borderRadius:7,background:val.length>i?C.primary:C.border,transition:"background .15s"}}/>)}
    </div>
  );

  const Progress=()=>(
    <div style={{display:"flex",alignItems:"center",marginBottom:8}}>
      {[1,2,3].map((n,idx)=>(
        <React.Fragment key={n}>
          <div style={{width:28,height:28,borderRadius:14,background:n<=step?C.primary:C.disabled,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1}}>
            {n<step?<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>:<span style={{fontFamily:FA,fontWeight:700,fontSize:12,color:n<=step?C.ink:grey}}>{n}</span>}
          </div>
          {idx<2&&<div style={{flex:1,height:2,background:n<step?C.primary:C.border}}/>}
        </React.Fragment>
      ))}
    </div>
  );

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white,overflow:"hidden"}}>
      <ScreenHeader title="Create Account" onBack={()=>{if(step===3&&pinStage==="confirm"){setPinStage("create");setConfirmPin("");}else if(step>1)setStep(s=>s-1);else goTo("onboarding");}}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        <Progress/>
        {step===1&&<>
          <div><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:4}}>Welcome to Ahzarman 👋</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey,lineHeight:1.5}}>Your one-stop app for bills, airtime, and rewards.</div></div>
          <Field label="Full Name" value={name} onChange={setName} placeholder="e.g. Mercy Okafor"/>
          <Field label="Phone Number" value={phone} onChange={v=>setPhone(v.replace(/\D/g,"").slice(0,11))} inputMode="numeric" prefix="🇳🇬 +234" placeholder="080 xxx xxxx"/>
          <SpinnerBtn disabled={!canStep1} onClick={()=>canStep1&&setStep(2)}>Send Verification Code →</SpinnerBtn>
          <div style={{textAlign:"center",paddingTop:4}}>
            <span style={{fontFamily:FB,fontWeight:400,fontSize:13,color:grey}}>Already have an account? </span>
            <span onClick={()=>goTo("sign_in")} style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.olive,cursor:"pointer"}}>Sign in →</span>
          </div>
        </>}
        {step===2&&<>
          <div><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:4}}>Verify your number</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey,lineHeight:1.5}}>Enter the 6-digit code sent to <span style={{fontWeight:600,color:C.ink}}>+234{phone}</span></div></div>
          <div style={{display:"flex",gap:8,justifyContent:"center",padding:"4px 0"}}>
            {[...Array(6)].map((_,i)=>(
              <div key={`otpbox-${i}`} style={{width:46,height:52,borderRadius:10,border:`2px solid ${otp.length===i?C.primary:otp.length>i?"#C8D080":C.border}`,background:otp.length>i?C.primFaint:C.white,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                <span style={{fontFamily:FA,fontWeight:700,fontSize:20,color:C.ink}}>{otp[i]||""}</span>
              </div>
            ))}
          </div>
          <NumPad onDigit={d=>{if(otp.length<6)setOtp(v=>v+d);}} onDelete={()=>setOtp(v=>v.slice(0,-1))}/>
          <SpinnerBtn disabled={otp.length<6} onClick={()=>otp.length>=6&&setStep(3)}>Verify & Continue →</SpinnerBtn>
          <div style={{textAlign:"center"}}>
            {canResend
              ?<span onClick={()=>{setOtp("");setTimer(60);setCanResend(false);}} style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.olive,cursor:"pointer"}}>Resend code →</span>
              :<span style={{fontFamily:FB,fontWeight:400,fontSize:13,color:grey}}>Resend in <span style={{fontWeight:600}}>{`${Math.floor(timer/60)}:${String(timer%60).padStart(2,"0")}`}</span></span>}
          </div>
          <div style={{textAlign:"center"}}><span style={{fontFamily:FB,fontSize:11,color:C.placeholder}}>Demo: any 6-digit code works</span></div>
        </>}
        {step===3&&<>
          <div><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:4}}>{pinStage==="create"?"Create your PIN":"Confirm your PIN"}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey,lineHeight:1.5}}>{pinStage==="create"?"Set a 4-digit PIN to secure your account.":"Re-enter your PIN to confirm."}</div></div>
          <PinDots val={pinStage==="create"?pin:confirmPin}/>
          {pinErr&&<div style={{background:C.errorBg,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.errorBorder}`}}><span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.error}}>{pinErr}</span></div>}
          <NumPad
            onDigit={d=>{const cur=pinStage==="create"?pin:confirmPin;const setter=pinStage==="create"?setPin:setConfirmPin;if(cur.length<4)setter(v=>v+d);}}
            onDelete={()=>{if(pinStage==="create")setPin(v=>v.slice(0,-1));else setConfirmPin(v=>v.slice(0,-1));}}
          />
          <SpinnerBtn disabled={(pinStage==="create"?pin:confirmPin).length<4} onClick={handlePinContinue}>
            {pinStage==="create"?"Continue →":"Create Account & Sign In →"}
          </SpinnerBtn>
        </>}
      </div>
    </div>
  );
};


/* ── FORGOT PIN FLOW (inline in ScreenSignIn step 3) ────────── */
const ForgotPinFlow=({phone,onDone,onBack})=>{
  const [stage,setStage]=useState("otp"); // otp | newpin | confirm
  const [otp,setOtp]=useState(""), [newPin,setNewPin]=useState(""), [confirmPin,setConfirmPin]=useState(""), [err,setErr]=useState(""), [shake,setShake]=useState(false);
  const onOtpDigit=d=>{
    if(otp.length>=6) return;
    const next=otp+d; setOtp(next); setErr("");
    if(next.length===6){ if(next==="123456") setTimeout(()=>setStage("newpin"),300); else{setShake(true);setErr("Wrong OTP. Try again.");setTimeout(()=>{setShake(false);setOtp("");},700);} }
  };
  const onPinDigit=d=>{
    if(stage==="newpin"){
      if(newPin.length>=4) return;
      const next=newPin+d; setNewPin(next); if(next.length===4) setTimeout(()=>setStage("confirm"),300);
    } else {
      if(confirmPin.length>=4) return;
      const next=confirmPin+d; setConfirmPin(next); setErr("");
      if(next.length===4){ if(next===newPin) setTimeout(()=>onDone(),400); else{setShake(true);setErr("PINs don't match. Try again.");setTimeout(()=>{setShake(false);setConfirmPin("");},700);} }
    }
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {stage==="otp"&&<>
        <div><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:4}}>Verify your number</div><div style={{fontFamily:FB,fontSize:14,color:grey,lineHeight:1.5}}>Enter the 6-digit OTP sent to <strong>+234 {phone?.slice(-8)}</strong></div></div>
        <div style={{display:"flex",gap:10,justifyContent:"center",margin:"8px 0",animation:shake?"shake .5s":"none"}}>
          {[0,1,2,3,4,5].map(i=><div key={`otp-${i}`} style={{width:12,height:12,borderRadius:6,background:otp.length>i?(err?C.error:C.primary):C.border,transition:"background .15s"}}/>)}
        </div>
        {err&&<div style={{background:C.errorBg,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.errorBorder}`}}><span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.error}}>{err}</span></div>}
        <NumPad onDigit={onOtpDigit} onDelete={()=>{setOtp(v=>v.slice(0,-1));setErr("");}}/>
        <div style={{textAlign:"center"}}><span style={{fontFamily:FB,fontSize:11,color:C.placeholder}}>Demo OTP: <strong style={{color:C.ink}}>123456</strong></span></div>
      </>}
      {stage==="newpin"&&<>
        <div><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:4}}>Set new PIN</div><div style={{fontFamily:FB,fontSize:14,color:grey}}>Choose a new 4-digit PIN</div></div>
        <div style={{display:"flex",gap:16,justifyContent:"center",margin:"8px 0"}}>
          {[0,1,2,3].map(i=><div key={`dot-${i}`} style={{width:14,height:14,borderRadius:7,background:newPin.length>i?C.primary:C.border,transition:"background .15s"}}/>)}
        </div>
        <NumPad onDigit={onPinDigit} onDelete={()=>setNewPin(v=>v.slice(0,-1))}/>
      </>}
      {stage==="confirm"&&<>
        <div><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:4}}>Confirm PIN</div><div style={{fontFamily:FB,fontSize:14,color:grey}}>Enter your new PIN again</div></div>
        <div style={{display:"flex",gap:16,justifyContent:"center",margin:"8px 0",animation:shake?"shake .5s":"none"}}>
          {[0,1,2,3].map(i=><div key={`dot-${i}`} style={{width:14,height:14,borderRadius:7,background:confirmPin.length>i?(err?C.error:C.primary):C.border,transition:"background .15s"}}/>)}
        </div>
        {err&&<div style={{background:C.errorBg,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.errorBorder}`}}><span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.error}}>{err}</span></div>}
        <NumPad onDigit={onPinDigit} onDelete={()=>{setConfirmPin(v=>v.slice(0,-1));setErr("");}}/>
      </>}
    </div>
  );
};

/* ── AUTH: SIGN IN ──────────────────────────────────────────── */
const ScreenSignIn=({goTo})=>{
  const [step,setStep]=useState(1);
  const [phone,setPhone]=useState(""), [pin,setPin]=useState(""), [err,setErr]=useState(""), [shake,setShake]=useState(false);
  const validPhone=phone.replace(/\D/g,"").length===11;

  const onDigit=(d)=>{
    if(pin.length>=4)return;
    const next=pin+d; setPin(next); setErr("");
    if(next.length===4){
      if(next==="1234")setTimeout(()=>goTo("home"),400);
      else{setShake(true);setErr("Incorrect PIN. Try again.");setTimeout(()=>{setShake(false);setPin("");},700);}
    }
  };

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white,overflow:"hidden"}}>
      <ScreenHeader title="Sign In" onBack={()=>{if(step>1){setStep(1);setPin("");setErr("");}else goTo("onboarding");}}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        {step===1&&<>
          <div><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:4}}>Welcome back 👋</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey,lineHeight:1.5}}>Sign in to your Ahzarman account.</div></div>
          <Field label="Phone Number" value={phone} onChange={v=>setPhone(v.replace(/\D/g,"").slice(0,11))} inputMode="numeric" prefix="🇳🇬 +234" placeholder="080 xxx xxxx"/>
          <SpinnerBtn disabled={!validPhone} onClick={()=>validPhone&&setStep(2)}>Continue →</SpinnerBtn>
          <div style={{textAlign:"center",paddingTop:4}}>
            <span style={{fontFamily:FB,fontWeight:400,fontSize:13,color:grey}}>New to Ahzarman? </span>
            <span onClick={()=>goTo("sign_up")} style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.olive,cursor:"pointer"}}>Create account →</span>
          </div>
        </>}
        {step===2&&<>
          <div><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:4}}>Enter your PIN</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey,lineHeight:1.5}}>Use your 4-digit PIN to access your account.</div></div>
          <div style={{display:"flex",gap:16,justifyContent:"center",margin:"8px 0",animation:shake?"shake .5s":"none"}}>
            {[0,1,2,3].map(i=><div key={`dot-${i}`} style={{width:14,height:14,borderRadius:7,background:pin.length>i?(err?C.error:C.primary):C.border,transition:"background .15s"}}/>)}
          </div>
          {err&&<div style={{background:C.errorBg,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.errorBorder}`}}><span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.error}}>{err}</span></div>}
          <NumPad onDigit={onDigit} onDelete={()=>{setPin(v=>v.slice(0,-1));setErr("");}}/>
          <div style={{textAlign:"center"}}><span style={{fontFamily:FB,fontSize:11,color:C.placeholder}}>Demo PIN: <strong style={{color:C.ink}}>1234</strong></span></div>
          <div style={{textAlign:"center"}}>
            <span style={{fontFamily:FB,fontWeight:400,fontSize:13,color:grey}}>Forgot PIN? </span>
            <span onClick={()=>setStep(3)} style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.olive,cursor:"pointer"}}>Reset PIN →</span>
          </div>
        </>}
        {step===3&&<ForgotPinFlow phone={phone} onDone={()=>goTo("home")} onBack={()=>setStep(2)}/>}
      </div>
    </div>
  );
};

const ScreenHome=({goTo,transactions})=>{
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const id=setTimeout(()=>setLoading(false),1600);return()=>clearTimeout(id);},[]);
  const recent=transactions.slice(0,3);
  if(loading) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:"18px 16px",paddingBottom:88,display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0"}}><Skeleton w={38} h={38} r={19}/><div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}><Skeleton w="45%" h={14} r={6}/><Skeleton w="60%" h={11} r={5}/></div></div>
        <div style={{background:"#1A1A1A",borderRadius:16,padding:"20px",display:"flex",flexDirection:"column",gap:12}}><Skeleton w="40%" h={11} r={5} dark/><Skeleton w="55%" h={38} r={8} dark/><Skeleton w="70%" h={10} r={5} dark/><div style={{display:"flex",gap:10}}><Skeleton w="50%" h={36} r={8} dark/><Skeleton w="50%" h={36} r={8} dark/></div></div>
        <div style={{background:C.white,borderRadius:10,padding:"10px"}}><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{[...Array(9)].map((_,i)=><Skeleton key={`sk9-${i}`} w="calc((100% - 16px) / 3)" h={88} r={9}/>)}</div></div>
        <Skeleton w="100%" h={120} r={12}/>
        <div style={{background:C.white,borderRadius:12,padding:"16px 14px",display:"flex",flexDirection:"column",gap:16}}>{[...Array(3)].map((_,i)=><div key={`sk3-${i}`} style={{display:"flex",alignItems:"center",gap:12}}><Skeleton w={42} h={42} r={21}/><div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}><div style={{display:"flex",justifyContent:"space-between"}}><Skeleton w="50%" h={13} r={5}/><Skeleton w="22%" h={13} r={5}/></div><div style={{display:"flex",justifyContent:"space-between"}}><Skeleton w="35%" h={10} r={4}/><Skeleton w="25%" h={10} r={4}/></div></div></div>)}</div>
      </div>
    </div>
  );
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",position:"relative",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
        <div style={{height:18}}/>
        <div style={{padding:"6px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:38,height:38,borderRadius:19,background:"#E0E7AD",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:FB,fontWeight:600,fontSize:18}}>M</span></div>
            <div><div style={{fontFamily:FB,fontWeight:500,fontSize:15,color:C.textColor}}>Hi, Mercy!</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>Welcome back</div></div>
          </div>
          <button onClick={()=>goTo("notifications")} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#000" strokeWidth="2" strokeLinecap="round"/></svg></button>
        </div>
        <div style={{height:14}}/>
        {/* Points card */}
        <div style={{margin:"0 16px",background:C.ink,borderRadius:16,padding:"20px 20px 18px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-50,right:-50,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${C.primary}28,transparent 70%)`,pointerEvents:"none"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,position:"relative",zIndex:2}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke={C.primLt} strokeWidth="2.2" strokeLinecap="round"/><path d="M12 15v4M9 22h6" stroke={C.primLt} strokeWidth="2.2" strokeLinecap="round"/></svg><span style={{fontFamily:FB,fontWeight:400,fontSize:12,letterSpacing:".06em",color:"rgba(255,255,255,.5)",textTransform:"uppercase"}}>Ahzarman Points</span></div>
          </div>
          <div style={{position:"relative",zIndex:2,marginBottom:4}}><span style={{fontFamily:FA,fontWeight:700,fontSize:42,letterSpacing:"-0.02em",color:C.white}}>1,850</span><span style={{fontFamily:FA,fontWeight:400,fontSize:18,color:"rgba(255,255,255,.45)",marginLeft:6}}>pts</span></div>
          <div style={{position:"relative",zIndex:2,marginBottom:18}}><span style={{fontFamily:FB,fontWeight:300,fontSize:11,color:"rgba(255,255,255,.4)"}}>= ₦1,850 electricity credit · shareable</span></div>
          <div style={{display:"flex",gap:10,position:"relative",zIndex:2}}>
            <button onClick={()=>goTo("share_points")} style={{flex:1,height:36,background:C.primary,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:12,color:C.ink}}>Share Points</button>
            <button onClick={()=>goTo("redeem_points")} style={{flex:1,height:36,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:12,color:C.white}}>Redeem</button>
          </div>
        </div>
        <div style={{height:14}}/>
        {/* Services grid */}
        <div style={{margin:"0 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontFamily:FB,fontWeight:600,fontSize:15,color:C.textColor}}>Services</span>
            <span onClick={()=>goTo("services")} style={{fontFamily:FB,fontWeight:400,fontSize:12,color:C.primary,cursor:"pointer"}}>See all →</span>
          </div>
          <div style={{background:C.white,borderRadius:10,padding:"8px 10px 12px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {SVC_LIST.map((svc)=>(
                <div key={svc.key} onClick={()=>goTo(svc.screen)} style={{width:"calc((100% - 16px) / 3)",height:88,background:SVC_COLORS[svc.key],borderRadius:9,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:7}}>
                  <SvcIcon type={svc.key}/><span style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>{svc.label}</span>
                </div>
              ))}
              <div onClick={()=>goTo("services")} style={{width:"calc((100% - 16px) / 3)",height:88,background:"transparent",border:`1.5px dashed ${C.borderMd}`,borderRadius:9,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke={C.olive} strokeWidth="1.8" fill={C.primXlt}/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke={C.olive} strokeWidth="1.8" fill={C.primXlt}/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke={C.olive} strokeWidth="1.8" fill={C.primXlt}/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke={C.olive} strokeWidth="1.8" fill={C.primXlt}/></svg>
                <span style={{fontFamily:FB,fontWeight:500,fontSize:12,color:C.olive}}>More →</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{height:14}}/>
        <MarketingCarousel goTo={goTo}/>
        <div style={{height:14}}/>
        <div style={{margin:"0 16px",background:C.white,borderRadius:12,padding:"16px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <span style={{fontFamily:FB,fontWeight:600,fontSize:15,color:C.textColor}}>Recent Transactions</span>
            <span onClick={()=>goTo("history")} style={{fontFamily:FB,fontWeight:400,fontSize:12,color:C.primary,cursor:"pointer"}}>See all →</span>
          </div>
          {recent.length>0?recent.map((tx,i)=><TxRow key={tx.title+tx.date} tx={tx} isLast={i===recent.length-1}/>):(
            <div style={{textAlign:"center",padding:"24px 0"}}><span style={{fontFamily:FB,fontWeight:500,fontSize:14,color:grey}}>No transactions yet</span></div>
          )}
        </div>
        <div style={{height:16}}/>
      </div>
      <BottomNav active="home" goTo={goTo}/>
    </div>
  );
};

/* FIX 2 QA — SHARE POINTS (real flow) */
const ScreenSharePoints=({goTo})=>{
  const [phone,setPhone]=useState(""), [name,setName]=useState(""), [note,setNote]=useState(""), [pts,setPts]=useState(""), [step,setStep]=useState(1), [showPin,setShowPin]=useState(false), [done,setDone]=useState(false);
  const contacts=[{name:"Mum",phone:"08034567890"},{name:"Office",phone:"09012345678"},{name:"Ahmed",phone:"07055443322"}];
  const maxPts=1850;
  const ptsNum=parseInt(pts)||0;
  const valid=phone.length===11&&ptsNum>=10&&ptsNum<=maxPts;
  const handleSuccess=()=>{setShowPin(false);setDone(true);};
  if(done) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.white,padding:"32px 24px",gap:16}}>
      <div style={{width:80,height:80,borderRadius:40,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:8}}>{pts} pts sent!</div>
        <div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey,lineHeight:1.6}}>Points transferred to<br/><strong style={{color:C.ink}}>{name||phone}</strong></div>
      </div>
      <div style={{background:C.primFaint,borderRadius:12,padding:"14px 24px",border:`1px solid ${C.primXlt}`,textAlign:"center",width:"100%"}}>
        <div style={{fontFamily:FA,fontWeight:700,fontSize:24,color:C.olive}}>{maxPts-ptsNum} pts</div>
        <div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:C.olive}}>Your remaining balance</div>
      </div>
      <button onClick={()=>goTo("home")} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Back to Home</button>
    </div>
  );
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Share Points" onBack={()=>goTo("home")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        {/* Balance */}
        <div style={{background:C.ink,borderRadius:14,padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:4}}>Available to share</div><div style={{fontFamily:FA,fontWeight:700,fontSize:28,color:C.white}}>1,850 <span style={{fontSize:16,opacity:.5,fontWeight:400}}>pts</span></div></div>
          <div style={{background:`${C.primary}22`,borderRadius:10,padding:"8px 12px"}}><div style={{fontFamily:FA,fontWeight:700,fontSize:14,color:C.primLt}}>= ₦1,850</div></div>
        </div>
        {/* Quick contacts */}
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:10,letterSpacing:".04em",textTransform:"uppercase"}}>Quick Select</div>
          <div style={{display:"flex",gap:12}}>
            {contacts.map((c,i)=>(
              <div key={c.phone} onClick={()=>{setPhone(c.phone);setName(c.name);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer"}}>
                <div style={{position:"relative"}}>
                  <div style={{width:50,height:50,borderRadius:25,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink}}>{c.name[0]}</span></div>
                  {phone===c.phone&&<div style={{position:"absolute",inset:-2,borderRadius:27,border:`2px solid ${C.primary}`}}/>}
                </div>
                <span style={{fontFamily:FB,fontWeight:phone===c.phone?600:400,fontSize:11,color:phone===c.phone?C.olive:grey}}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Phone */}
        <Field label="Recipient Phone Number" value={phone} onChange={setPhone} inputMode="tel" hint="11-digit Ahzarman registered number" success={phone.length===11} rightSlot={phone.length===11?<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={C.success}/><path d="M8 12l3 3 5-5" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>:null}/>
        {/* Points amount */}
        <div>
          <Field label="Points to Send" value={pts} onChange={v=>setPts(v.replace(/\D/g,""))} inputMode="numeric" hint={`Min 10 pts · Max ${maxPts.toLocaleString()} pts`} error={ptsNum>maxPts?"Not enough points":undefined}/>
          {pts&&ptsNum>=10&&ptsNum<=maxPts&&<div style={{marginTop:8,background:C.primFaint,borderRadius:8,padding:"8px 12px",border:`1px solid ${C.primXlt}`}}><span style={{fontFamily:FB,fontWeight:400,fontSize:12,color:C.olive}}>= ₦{ptsNum.toLocaleString()} electricity credit for recipient</span></div>}
        </div>
        {/* Note */}
        <Field label="Add a note (optional)" value={note} onChange={setNote} hint="e.g. For your light bill this month" multiline/>
        <SpinnerBtn disabled={!valid} onClick={()=>setShowPin(true)}>
          {valid?`Send ${ptsNum.toLocaleString()} pts →`:"Enter recipient and amount"}
        </SpinnerBtn>
      </div>
      {showPin&&<PinSheet amount={`${ptsNum.toLocaleString()} pts`} onSuccess={handleSuccess} onDismiss={()=>setShowPin(false)}/>}
    </div>
  );
};

/* FIX 3 QA — REDEEM POINTS (separate screen) */
const ScreenRedeemPoints=({goTo})=>{
  const [meter,setMeter]=useState(""), [pts,setPts]=useState(""), [showPin,setShowPin]=useState(false), [pin,setPin]=useState(""), [pinErr,setPinErr]=useState(""), [done,setDone]=useState(false);
  const ptsNum=parseInt(pts)||0;
  const nairaVal=ptsNum;
  const valid=meter.length>=11&&ptsNum>=100&&ptsNum<=1850;

  const handlePinDigit=d=>{
    if(pin.length>=4) return;
    const next=pin+d; setPin(next); setPinErr("");
    if(next.length===4){
      if(next==="1234") setTimeout(()=>{ setShowPin(false); setDone(true); },400);
      else { setTimeout(()=>{ setPinErr("Incorrect PIN. Try again."); setPin(""); },600); }
    }
  };

  if(done) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.white,padding:"32px 24px",gap:16}}>
      <div style={{width:80,height:80,borderRadius:40,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.09 12.6A1 1 0 0 0 5 14h7l-1 8 8.91-10.6A1 1 0 0 0 19 10h-7l1-8z" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{textAlign:"center"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:8}}>Redeemed!</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey,lineHeight:1.6}}>₦{nairaVal.toLocaleString()} electricity credit<br/>sent to meter <strong>{meter.slice(0,4)}****{meter.slice(-3)}</strong></div></div>
      <div style={{background:C.primFaint,borderRadius:12,padding:"14px 24px",border:`1px solid ${C.primXlt}`,textAlign:"center",width:"100%"}}>
        <div style={{fontFamily:FA,fontWeight:700,fontSize:24,color:C.olive}}>{1850-ptsNum} pts</div>
        <div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:C.olive}}>Your remaining balance</div>
      </div>
      <button onClick={()=>goTo("home")} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Back to Home</button>
    </div>
  );

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Redeem Points" onBack={()=>goTo("home")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:C.ink,borderRadius:14,padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:4}}>Points balance</div><div style={{fontFamily:FA,fontWeight:700,fontSize:28,color:C.white}}>1,850 <span style={{fontSize:16,opacity:.5,fontWeight:400}}>pts</span></div></div>
          <div style={{background:`${C.primary}22`,borderRadius:10,padding:"8px 12px"}}><div style={{fontFamily:FA,fontWeight:700,fontSize:14,color:C.primLt}}>= ₦1,850</div></div>
        </div>
        <div style={{background:C.white,borderRadius:12,padding:"14px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.ink,marginBottom:8}}>Conversion Rate</div>
          <div style={{fontFamily:FA,fontWeight:700,fontSize:22,color:C.primary}}>1 pt = ₦1 electricity</div>
          <div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey,marginTop:4}}>Min redemption: 100 pts</div>
        </div>
        <Field label="Meter Number" value={meter} onChange={setMeter} inputMode="numeric" hint="Enter your prepaid meter number" success={meter.length>=11}/>
        <Field label="Points to Redeem" value={pts} onChange={v=>setPts(v.replace(/\D/g,""))} inputMode="numeric" hint="Min 100 pts · Max 1,850 pts" error={ptsNum>1850?"Insufficient balance":undefined}/>
        {ptsNum>=100&&ptsNum<=1850&&<div style={{background:C.primFaint,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.primXlt}`}}><span style={{fontFamily:FB,fontWeight:400,fontSize:13,color:C.olive}}>You will receive <strong>₦{nairaVal.toLocaleString()}</strong> electricity credit on your meter</span></div>}
        <SpinnerBtn disabled={!valid} onClick={()=>{if(valid){setPin("");setPinErr("");setShowPin(true);}}}>
          {valid?`Redeem ${ptsNum.toLocaleString()} pts for ₦${nairaVal.toLocaleString()}`:"Complete fields to continue"}
        </SpinnerBtn>
        <div style={{textAlign:"center"}}><span style={{fontFamily:FB,fontSize:11,color:C.placeholder}}>Demo PIN: <strong style={{color:C.ink}}>1234</strong></span></div>
      </div>

      {/* Lightweight PIN confirmation sheet — no payment gateway needed */}
      {showPin&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:"22px 22px 0 0",padding:"20px 20px 36px",animation:"slideUp .28s cubic-bezier(.4,0,.2,1)"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><div style={{width:40,height:4,borderRadius:2,background:"#E0E0E0"}}/></div>
            <div style={{textAlign:"center",marginBottom:4}}>
              <div style={{fontFamily:FB,fontWeight:700,fontSize:17,color:C.ink}}>Confirm with PIN</div>
              <div style={{fontFamily:FB,fontSize:13,color:grey,marginTop:4}}>Redeem <strong style={{color:C.olive}}>{ptsNum.toLocaleString()} pts</strong> → ₦{nairaVal.toLocaleString()} electricity</div>
            </div>
            <div style={{display:"flex",gap:16,justifyContent:"center",margin:"20px 0 8px"}}>
              {[0,1,2,3].map(idx=><div key={`rpin-${idx}`} style={{width:14,height:14,borderRadius:7,background:pin.length>idx?(pinErr?C.error:C.primary):C.border,transition:"background .15s"}}/>)}
            </div>
            {pinErr&&<div style={{background:C.errorBg,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.errorBorder}`,marginBottom:8,textAlign:"center"}}><span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.error}}>{pinErr}</span></div>}
            <NumPad onDigit={handlePinDigit} onDelete={()=>{setPin(v=>v.slice(0,-1));setPinErr("");}}/>
            <button onClick={()=>{setShowPin(false);setPin("");setPinErr("");}} style={{width:"100%",height:44,background:"none",border:"none",cursor:"pointer",fontFamily:FB,fontWeight:500,fontSize:14,color:grey,marginTop:8}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* FIX 4 QA — REFERRAL SCREEN (from marketing carousel) */
const ScreenRefer=({goTo})=>{
  const [copied,setCopied]=useState(false);
  const code="AHZ-MERCY-2026";
  const copy=()=>{try{navigator.clipboard.writeText(code);}catch(_){}setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const friends=[{name:"Tunde A.",pts:500,date:"2 days ago"},{name:"Chioma B.",pts:500,date:"Last week"}];
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Refer & Earn" onBack={()=>goTo("home")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:C.ink,borderRadius:16,padding:"24px 20px",textAlign:"center"}}>
          <div style={{fontFamily:FA,fontWeight:700,fontSize:32,color:C.primary,letterSpacing:"-0.02em",marginBottom:4}}>₦2,500 pts</div>
          <div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:"rgba(255,255,255,.6)",marginBottom:20}}>per friend who joins and makes a purchase</div>
          <div style={{background:"rgba(255,255,255,.08)",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:FA,fontWeight:600,fontSize:16,color:C.white,letterSpacing:".04em"}}>{code}</span>
            <button onClick={copy} style={{background:copied?C.success:C.primary,border:"none",borderRadius:8,padding:"6px 16px",cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:13,color:C.ink}}>{copied?"Copied!":"Copy"}</button>
          </div>
        </div>
        <div style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:14}}>How it works</div>
          {["Share your code with friends","Friend signs up and makes first purchase","You both earn 2,500 pts instantly"].map((s,i)=>(
            <div key={`referstep-${i}`} style={{display:"flex",gap:12,marginBottom:i<2?12:0}}>
              <div style={{width:24,height:24,borderRadius:12,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FA,fontWeight:700,fontSize:12,color:C.ink}}>{i+1}</span></div>
              <span style={{fontFamily:FB,fontWeight:400,fontSize:14,color:C.body,lineHeight:1.5,paddingTop:2}}>{s}</span>
            </div>
          ))}
        </div>
        {friends.length>0&&<div style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:14}}>Friends Referred ({friends.length})</div>
          {friends.map((f,i)=>(
            <div key={`friend-${i}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:i<friends.length-1?12:0,marginBottom:i<friends.length-1?12:0,borderBottom:i<friends.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:18,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:16,color:C.olive}}>{f.name[0]}</span></div>
                <div><div style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.ink}}>{f.name}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{f.date}</div></div>
              </div>
              <span style={{fontFamily:FA,fontWeight:700,fontSize:14,color:C.olive}}>+{f.pts} pts</span>
            </div>
          ))}
        </div>}
        <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent("Join Ahzarman and earn points on every bill payment! Sign up with my referral link: https://ahzarman.app/ref/MERCY2025")}`, "_blank")} style={{width:"100%",height:50,background:"#25D366",border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.577 3.842 1.574 5.405L2 22l4.724-1.558A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18.167a8.154 8.154 0 0 1-4.16-1.138l-.299-.177-3.09 1.019 1.038-3.01-.196-.31A8.167 8.167 0 1 1 12 20.167z"/></svg>Share via WhatsApp</button>
      </div>
    </div>
  );
};

const ScreenServices=({goTo})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",position:"relative",overflow:"hidden"}}>
    <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
      <div style={{height:18}}/>
      <div style={{padding:"6px 16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:FB,fontWeight:700,fontSize:20,letterSpacing:"-0.02em",color:C.ink}}>Services</span>
        <div style={{background:C.primXlt,borderRadius:6,padding:"4px 10px"}}><span style={{fontFamily:FB,fontWeight:600,fontSize:11,color:C.olive}}>Every purchase earns pts</span></div>
      </div>
      <div style={{margin:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {SVC_LIST.map((svc)=>(
          <div key={svc.key} onClick={()=>goTo(svc.screen)} style={{background:C.white,borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",border:`1px solid ${C.border}`}}>
            <div style={{width:48,height:48,borderRadius:12,background:SVC_COLORS[svc.key],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><SvcIcon type={svc.key} size={24}/></div>
            <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:2}}>{svc.label}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>Earns points · instant delivery</div></div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ))}
      </div>
      <div style={{height:16}}/>
    </div>
    <BottomNav active="services" goTo={goTo}/>
  </div>
);

/* FIX 11+15 QA — REWARDS (interactive tiers, separate redeem/share) */
const ScreenRewards=({goTo})=>{
  const [selTier,setSelTier]=useState(null);
  const tiers=[
    {name:"Bronze",pts:"0–999",col:"#CD7F32",active:false,benefits:["5% points bonus","Access to basic services","Monthly statement"]},
    {name:"Silver",pts:"1,000–4,999",col:"#A8A9AD",active:true,benefits:["10% points bonus","Priority support","Electricity token in 5s","Points gifting enabled"]},
    {name:"Gold",pts:"5,000–14,999",col:"#D4AF37",active:false,benefits:["20% points bonus","Dedicated account manager","Zero service fees","Exclusive promo access"]},
    {name:"Platinum",pts:"15,000+",col:"#2E8B57",active:false,benefits:["30% points bonus","Free monthly airtime","Zero fees forever","VIP support line"]},
  ];
  const hist=[{type:"electricity",action:"Electricity payment",pts:"+250 pts",date:"Today"},{type:"airtime",action:"Referred Tunde",pts:"+500 pts",date:"Yesterday"},{type:"airtime",action:"Airtime purchase",pts:"+30 pts",date:"2 days ago"}];
  const displayed=selTier!==null?tiers[selTier]:null;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",position:"relative",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
        <div style={{height:18}}/>
        <div style={{padding:"6px 16px 18px"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink}}>Rewards</span></div>
        {/* Points summary */}
        <div style={{margin:"0 16px",background:C.ink,borderRadius:16,padding:"20px",marginBottom:14}}>
          <div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Your Points</div>
          <div style={{fontFamily:FA,fontWeight:700,fontSize:38,color:C.white,letterSpacing:"-0.02em",marginBottom:2}}>1,850 <span style={{fontSize:18,opacity:.45,fontWeight:400}}>pts</span></div>
          <div style={{fontFamily:FB,fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:14}}>Silver tier · 3,150 pts to Gold</div>
          <div style={{height:6,background:"rgba(255,255,255,.12)",borderRadius:3,marginBottom:16}}><div style={{height:"100%",width:"37%",background:C.primary,borderRadius:3}}/></div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>goTo("share_points")} style={{flex:1,height:38,background:C.primary,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:13,color:C.ink}}>Share Points</button>
            <button onClick={()=>goTo("redeem_points")} style={{flex:1,height:38,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:13,color:C.white}}>Redeem</button>
          </div>
        </div>
        {/* FIX 15 QA — Tiers (interactive) */}
        <div style={{margin:"0 16px",marginBottom:14}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.textColor,marginBottom:10}}>Tap a tier to see benefits</div>
          <div style={{display:"flex",gap:8}}>
            {tiers.map((t,i)=>(
              <div key={t.name} onClick={()=>setSelTier(selTier===i?null:i)} style={{flex:1,background:t.active?C.white:selTier===i?"#F5F8E8":"#F5F6F1",borderRadius:10,padding:"12px 6px",border:`1.5px solid ${selTier===i?C.primary:t.active?C.primary:"transparent"}`,textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
                <div style={{width:28,height:28,borderRadius:14,background:t.col,margin:"0 auto 6px",opacity:t.active||selTier===i?1:.5}}/>
                <div style={{fontFamily:FB,fontWeight:t.active||selTier===i?700:400,fontSize:11,color:t.active||selTier===i?C.ink:grey}}>{t.name}</div>
                <div style={{fontFamily:FB,fontWeight:300,fontSize:9,color:grey,marginTop:2}}>{t.pts}</div>
                {t.active&&<div style={{fontFamily:FB,fontWeight:700,fontSize:8,color:C.primary,marginTop:4,letterSpacing:".04em"}}>CURRENT</div>}
              </div>
            ))}
          </div>
          {/* Benefits panel */}
          {displayed&&(
            <div style={{marginTop:10,background:C.white,borderRadius:10,padding:"14px",border:`1px solid ${C.border}`,animation:"fadeIn .2s"}}>
              <div style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.ink,marginBottom:10}}>{displayed.name} Benefits</div>
              {displayed.benefits.map((b,i)=>(
                <div key={b} style={{display:"flex",gap:8,marginBottom:i<displayed.benefits.length-1?8:0}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={C.primary}/><path d="M8 12l3 3 5-5" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{fontFamily:FB,fontWeight:400,fontSize:13,color:C.body}}>{b}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Points history */}
        <div style={{margin:"0 16px",background:C.white,borderRadius:10,padding:"16px 14px"}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.textColor,marginBottom:14}}>Points History</div>
          {hist.map((h,i)=>(
            <div key={h.action+i} style={{display:"flex",alignItems:"center",gap:12,paddingBottom:i<hist.length-1?14:0,marginBottom:i<hist.length-1?14:0,borderBottom:i<hist.length-1?`1px solid ${C.border}`:"none"}}>
              <TxAvatar type={h.type}/>
              <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.ink}}>{h.action}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{h.date}</div></div>
              <span style={{fontFamily:FA,fontWeight:700,fontSize:14,color:C.olive}}>{h.pts}</span>
            </div>
          ))}
        </div>
        <div style={{height:16}}/>
      </div>
      <BottomNav active="rewards" goTo={goTo}/>
    </div>
  );
};

/* FIX 12+13+14 QA — PROFILE (editable, notifications back→profile, security) */
const ScreenProfile=({goTo,onLogout})=>{
  const rows=[
    {icon:"user",label:"Personal Info",sub:"Name, email, phone",screen:"personal_info"},
    {icon:"lock",label:"Security",sub:"Change PIN, password",screen:"security"},
    {icon:"bell",label:"Notifications",sub:"Alerts & prefs",screen:"notifications"},
    {icon:"card",label:"Payment Settings",sub:"Methods, limits, receipts",screen:"payment_settings"},
    {icon:"people",label:"Beneficiaries",sub:"Saved contacts",screen:"beneficiaries"},
    {icon:"chat",label:"Contact Us",sub:"WhatsApp, email, phone",screen:"contact_us"},
    {icon:"doc",label:"Terms & Privacy",sub:"Legal documents",screen:"terms"},
  ];
  const Ico=({type})=>{
    const s={stroke:C.olive,strokeWidth:"1.8",fill:"none",strokeLinecap:"round",strokeLinejoin:"round"};
    const icons={
      user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...s}/><circle cx="12" cy="7" r="4" {...s}/></svg>,
      lock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" {...s}/><path d="M7 11V7a5 5 0 0 1 10 0v4" {...s}/></svg>,
      bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" {...s}/><path d="M13.73 21a2 2 0 0 1-3.46 0" {...s}/></svg>,
      card: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="22" height="16" rx="2" {...s}/><line x1="1" y1="10" x2="23" y2="10" {...s}/></svg>,
      people: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...s}/><circle cx="9" cy="7" r="4" {...s}/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...s}/></svg>,
      chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...s}/></svg>,
      doc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...s}/><polyline points="14 2 14 8 20 8" {...s}/></svg>,
    };
    return icons[type] || icons.doc;
  };
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",position:"relative",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
        <div style={{height:18}}/>
        <div style={{padding:"6px 16px 20px"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink}}>Profile</span></div>
        <div style={{margin:"0 16px",background:C.white,borderRadius:12,padding:"18px 16px",display:"flex",alignItems:"center",gap:14,marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{width:54,height:54,borderRadius:27,background:"#E0E7AD",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FB,fontWeight:700,fontSize:22,color:C.ink}}>M</span></div>
          <div><div style={{fontFamily:FB,fontWeight:600,fontSize:16,color:C.ink}}>Mercy Okafor</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>mercy@example.com</div><div style={{marginTop:4,background:C.primXlt,borderRadius:4,padding:"2px 8px",display:"inline-block"}}><span style={{fontFamily:FB,fontWeight:600,fontSize:10,color:C.olive}}>Silver · 1,850 pts</span></div></div>
        </div>
        <div style={{margin:"0 16px",background:C.white,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
          {rows.map((row,i)=>(
            <div key={row.label} onClick={()=>row.screen&&goTo(row.screen)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<rows.length-1?`1px solid ${C.border}`:"none",cursor:row.screen?"pointer":"default"}}>
              <div style={{width:36,height:36,borderRadius:10,background:C.disabled,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico type={row.icon}/></div>
              <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:500,fontSize:14,color:C.ink}}>{row.label}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{row.sub}</div></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={row.screen?grey:C.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          ))}
        </div>
        <div style={{height:16}}/>
        <div style={{margin:"0 16px"}}><button onClick={()=>{ if(typeof onLogout==="function") onLogout(); goTo("onboarding"); }} style={{width:"100%",height:46,background:"#FFF1F1",border:"none",borderRadius:10,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:14,color:"#C0392B"}}>Log Out</button></div>
        <div style={{height:16}}/>
      </div>
      <BottomNav active="profile" goTo={goTo}/>
    </div>
  );
};

/* FIX 12 QA — PERSONAL INFO (editable) */
const ScreenPersonalInfo=({goTo})=>{
  const [editing,setEditing]=useState(null);
  const [fields,setFields]=useState([
    {key:"name",label:"Full Name",val:"Mercy Okafor",editable:true},
    {key:"email",label:"Email Address",val:"mercy@example.com",editable:true},
    {key:"phone",label:"Phone Number",val:"0801 234 5678",editable:false},
    {key:"dob",label:"Date of Birth",val:"15 March 1995",editable:true},
    {key:"state",label:"State",val:"FCT, Abuja",editable:true},
  ]);
  const [editVal,setEditVal]=useState("");
  const [saved,setSaved]=useState(false);
  const startEdit=(i)=>{setEditing(i);setEditVal(fields[i].val);};
  const saveEdit=()=>{if(editing===null)return;const upd=[...fields];upd[editing]={...upd[editing],val:editVal};setFields(upd);setEditing(null);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Personal Info" onBack={()=>goTo("profile")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px"}}>
        {saved&&<div style={{background:"#EAFAF1",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",gap:8,border:"1px solid #A9DFBF"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={C.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.success}}>Changes saved!</span></div>}
        <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:16}}>
          {fields.map((f,i)=>(
            <div key={`field-${i}`} style={{padding:"14px 16px",borderBottom:i<fields.length-1?`1px solid ${C.border}`:"none"}}>
              {editing===i ? (
                <div>
                  <div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:C.primary,marginBottom:6}}>{f.label}</div>
                  <input value={editVal} onChange={e=>setEditVal(e.target.value)} autoFocus style={{width:"100%",height:44,borderRadius:8,border:`1.5px solid ${C.primary}`,padding:"0 12px",fontFamily:FB,fontSize:15,color:C.ink,background:C.white,boxSizing:"border-box",outline:"none",boxShadow:`0 0 0 3px ${C.primary}28`}}/>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button onClick={saveEdit} style={{flex:1,height:36,background:C.primary,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:13,color:C.ink}}>Save</button>
                    <button onClick={()=>setEditing(null)} style={{flex:1,height:36,background:C.disabled,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:13,color:grey}}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey,marginBottom:2}}>{f.label}</div><div style={{fontFamily:FB,fontWeight:500,fontSize:15,color:C.ink}}>{f.val}</div></div>
                  {f.editable&&<button onClick={()=>startEdit(i)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* FIX 13 QA — SECURITY (change PIN flow) */
const ScreenSecurity=({goTo})=>{
  const [step,setStep]=useState(0);// 0=menu,1=current,2=new,3=confirm,4=done
  const [cur,setCur]=useState(""), [newPin,setNewPin]=useState(""), [conf,setConf]=useState("");
  const [err,setErr]=useState("");
  const resetFlow=()=>{setStep(0);setCur("");setNewPin("");setConf("");setErr("");};
  const PinInput=({label,value,onChange,hint})=>(
    <div style={{textAlign:"center"}}>
      <div style={{fontFamily:FB,fontWeight:600,fontSize:16,color:C.ink,marginBottom:6}}>{label}</div>
      {hint&&<div style={{fontFamily:FB,fontWeight:400,fontSize:13,color:grey,marginBottom:20}}>{hint}</div>}
      <div style={{display:"flex",gap:14,justifyContent:"center",marginBottom:16}}>
        {[0,1,2,3].map(i=><div key={`dot-${i}`} style={{width:16,height:16,borderRadius:8,background:i<value.length?C.primary:C.border,border:`2px solid ${i<value.length?C.primary:"#D0D0D0"}`,transition:"all .15s"}}/>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4,padding:"0 24px"}}>
        {[["1","2","3"],["4","5","6"],["7","8","9"],[null,"0","del"]].map((row,ri)=>(
          <div key={ri} style={{display:"flex",gap:4}}>
            {row.map((d,di)=>{
              if(d===null)return <div key={di} style={{flex:1,height:56}}/>;
              if(d==="del")return <button key={di} onClick={()=>onChange(v=>v.slice(0,-1))} style={{flex:1,height:56,background:"none",border:"none",cursor:"pointer",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke={C.ink} strokeWidth="1.8" strokeLinejoin="round"/><line x1="18" y1="9" x2="12" y2="15" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="9" x2="18" y2="15" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round"/></svg></button>;
              return <button key={di} onClick={()=>{if(value.length<4)onChange(v=>v+d);}} style={{flex:1,height:56,background:"#F8F9F6",border:"none",borderRadius:10,cursor:"pointer",fontFamily:FA,fontWeight:600,fontSize:22,color:C.ink}}>{d}</button>;
            })}
          </div>
        ))}
      </div>
      {err&&<div style={{fontFamily:FB,fontWeight:500,fontSize:12,color:C.error,marginTop:12}}>{err}</div>}
    </div>
  );
  if(step===4)return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white,overflow:"hidden"}}>
      <ScreenHeader title="Security" onBack={()=>goTo("profile")}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",gap:16}}>
        <div style={{width:72,height:72,borderRadius:36,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={C.olive} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <div style={{textAlign:"center"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:6}}>PIN Changed!</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey}}>Your transaction PIN has been updated successfully.</div></div>
        <button onClick={()=>{resetFlow();goTo("profile");}} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Done</button>
      </div>
    </div>
  );
  if(step>0)return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white,overflow:"hidden"}}>
      <ScreenHeader title="Change PIN" onBack={()=>{if(step===1)resetFlow();else setStep(s=>s-1);}}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"24px 16px"}}>
        {step===1&&<PinInput label="Current PIN" hint="Demo PIN: 1234" value={cur} onChange={setCur}/>}
        {step===2&&<PinInput label="New PIN" hint="Choose a 4-digit PIN" value={newPin} onChange={setNewPin}/>}
        {step===3&&<PinInput label="Confirm New PIN" hint="Re-enter your new PIN" value={conf} onChange={setConf}/>}
        {((step===1&&cur.length===4)||(step===2&&newPin.length===4)||(step===3&&conf.length===4))&&(
          <div style={{padding:"0 24px",marginTop:16}}>
            <button onClick={()=>{
              setErr("");
              if(step===1){if(cur==="1234"){setStep(2);setCur("");}else{setErr("Incorrect current PIN");setCur("");}}
              else if(step===2){if(newPin.length===4){setStep(3);setNewPin("");}else setErr("Enter 4 digits");}
              else if(step===3){if(conf===newPin){setStep(4);}else{setErr("PINs don't match");setConf("");}}
            }} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>
              {step===3?"Confirm New PIN":"Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Security" onBack={()=>goTo("profile")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px"}}>
        {[
          {icon:"🔑",label:"Change Transaction PIN",sub:"Update your 4-digit payment PIN",action:()=>setStep(1)},
          {icon:"🔐",label:"Change Password",sub:"Update your login password",action:null},
          {icon:"👁",label:"Biometric Login",sub:"Use fingerprint or face ID",action:null},
          {icon:"📱",label:"Two-Factor Auth",sub:"Extra security on login",action:null},
        ].map((item,i,arr)=>(
          <div key={`notif-${i}`} onClick={item.action||undefined} style={{background:C.white,borderRadius:i===0?"12px 12px 0 0":i===arr.length-1?"0 0 12px 12px":"0",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:item.action?"pointer":"default",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none",border:`1px solid ${C.border}`,borderTop:i===0?`1px solid ${C.border}`:"none",marginTop:i===0?0:-1}}>
            <div style={{width:36,height:36,borderRadius:10,background:C.primFaint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{item.icon}</div>
            <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:500,fontSize:14,color:C.ink}}>{item.label}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{item.sub}</div></div>
            {item.action&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        ))}
      </div>
    </div>
  );
};

/* FIX 14 QA — NOTIFICATIONS back→profile */
const ScreenNotifications=({goTo,fromProfile=false})=>{
  const [items,setItems]=useState([
    {id:1,title:"Airtime purchased",sub:"₦500 MTN sent to 0801 234 5678",time:"2m ago",read:false},
    {id:2,title:"Points earned!",sub:"250 pts on your electricity purchase",time:"1h ago",read:false},
    {id:3,title:"Welcome to Ahzarman",sub:"Start making purchases to earn points",time:"2d ago",read:true},
  ]);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      {/* FIX 14: onBack goes to profile when accessed from profile */}
      <ScreenHeader title="Notifications" onBack={()=>goTo(fromProfile?"profile":"home")} rightSlot={items.length>0&&<button onClick={()=>setItems([])} style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.primary,background:"none",border:"none",cursor:"pointer"}}>Clear all</button>}/>
      {items.length>0?(
        <div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
          {items.map(n=>(
            <div key={n.id} style={{background:n.read?C.white:"#F5F8E8",borderRadius:12,padding:"14px 14px 14px 16px",border:`1px solid ${n.read?C.border:C.primXlt}`,display:"flex",gap:12}}>
              <div style={{width:8,height:8,borderRadius:4,background:n.read?"transparent":C.primary,marginTop:5,flexShrink:0}}/>
              <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:n.read?400:600,fontSize:13,color:C.ink,marginBottom:3}}>{n.title}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey,marginBottom:4}}>{n.sub}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:10,color:C.placeholder}}>{n.time}</div></div>
              <button onClick={()=>setItems(p=>p.filter(x=>x.id!==n.id))} style={{background:"none",border:"none",cursor:"pointer",opacity:.5}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke={grey} strokeWidth="2" strokeLinecap="round"/></svg></button>
            </div>
          ))}
        </div>
      ):(
        <EmptyState icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={C.olive} strokeWidth="2" strokeLinecap="round"/></svg>} title="You're all caught up" subtitle="No new notifications."/>
      )}
    </div>
  );
};

const ScreenHistory=({goTo,transactions})=>{
  const filters=["All","Successful","Pending","Failed"];
  const [active,setActive]=useState("All");
  const filtered=transactions.filter(tx=>active==="All"||tx.status===active);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Transaction History" onBack={()=>goTo("home")}/>
      <div style={{background:C.white,padding:"10px 16px",display:"flex",gap:8,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {filters.map(f=><button key={f} onClick={()=>setActive(f)} style={{padding:"5px 14px",borderRadius:20,border:"none",cursor:"pointer",background:active===f?C.primary:C.disabled,fontFamily:FB,fontWeight:active===f?600:400,fontSize:12,color:active===f?C.ink:grey}}>{f}</button>)}
      </div>
      {filtered.length>0?(
        <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
          <div style={{background:C.white,borderRadius:12,padding:"16px 14px"}}>
            {filtered.map((tx,i)=><TxRow key={tx.date+tx.title+i} tx={tx} isLast={i===filtered.length-1}/>)}
          </div>
        </div>
      ):(
        <EmptyState icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>} title={active==="All"?"No transactions yet":`No ${active.toLowerCase()} transactions`} subtitle={active==="All"?"Make your first purchase":"Try a different filter"} cta={active!=="All"?{label:"View All",onClick:()=>setActive("All")}:{label:"Browse Services",onClick:()=>goTo("services")}}/>
      )}
    </div>
  );
};

/* FIX 7 QA — AIRTIME with custom amount */
const ScreenAirtime=({goTo,beneficiaries,onSaveBenef,onAddTx})=>{
  const [network,setNetwork]=useState("MTN"), [phone,setPhone]=useState("");
  const [selAmt,setSelAmt]=useState(null), [customAmt,setCustomAmt]=useState("");
  const [save,setSave]=useState(false), [benName,setBenName]=useState("");
  const [showPin,setShowPin]=useState(false);
  const netBenefs=beneficiaries.filter(b=>b.network===network);
  const presets=[50,100,200,500,1000,2000];
  const finalAmt=selAmt!==null?presets[selAmt]:parseInt(customAmt)||0;
  const canContinue=phone.length===11&&finalAmt>=50;
  const handleSuccess=()=>{
    if(save&&benName.trim()&&phone.length===11)onSaveBenef({id:Date.now(),name:benName.trim(),phone,network});
    onAddTx({type:"airtime",title:`Airtime — ${network}`,amt:`-₦${finalAmt.toLocaleString()}`,pts:"+30 pts",date:"Just now",status:"Successful"});
    setShowPin(false);goTo("success_simple");
  };
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white,overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Airtime" onBack={()=>goTo("services")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 24px",display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Network</div>
          <div style={{display:"flex",gap:8}}>
            {["MTN","Airtel","Glo","9mobile"].map(n=><button key={n} onClick={()=>setNetwork(n)} style={{flex:1,height:40,borderRadius:8,border:"none",cursor:"pointer",background:network===n?NET_COL[n]:C.disabled,fontFamily:FB,fontWeight:network===n?700:400,fontSize:12,color:network===n?NET_TXT[n]:grey}}>{n}</button>)}
          </div>
        </div>
        {netBenefs.length>0&&(
          <div>
            <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Saved Contacts</div>
            <div style={{display:"flex",gap:12}}>
              {netBenefs.map(b=>(
                <div key={b.id} onClick={()=>setPhone(b.phone)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer"}}>
                  <div style={{position:"relative"}}>
                    <div style={{width:46,height:46,borderRadius:23,background:NET_COL[b.network]||C.primary,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:18,color:NET_TXT[b.network]||C.ink}}>{b.name[0]}</span></div>
                    {phone===b.phone&&<div style={{position:"absolute",inset:-2,borderRadius:25,border:`2px solid ${C.primary}`}}/>}
                  </div>
                  <span style={{fontFamily:FB,fontWeight:phone===b.phone?600:400,fontSize:11,color:phone===b.phone?C.olive:grey,maxWidth:52,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <Field label="Phone Number" value={phone} onChange={setPhone} inputMode="tel" success={phone.length===11} rightSlot={phone.length===11?<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={C.success}/><path d="M8 12l3 3 5-5" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>:null}/>
        {/* Preset amounts */}
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Quick Amounts</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {presets.map((a,i)=><div key={a} onClick={()=>{setSelAmt(i);setCustomAmt("");}} style={{width:"calc((100% - 16px) / 3)",height:48,background:selAmt===i?C.primXlt:C.disabled,border:`1px solid ${selAmt===i?C.primary:"transparent"}`,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:FA,fontWeight:600,fontSize:15,color:C.ink}}>₦{a.toLocaleString()}</span></div>)}
          </div>
        </div>
        {/* FIX 7 QA — custom amount input */}
        <Field label="Or enter custom amount" value={customAmt} onChange={v=>{setCustomAmt(v.replace(/\D/g,""));setSelAmt(null);}} inputMode="numeric" prefix="₦" hint="Min ₦50 · Max ₦50,000"/>
        {/* Save beneficiary */}
        <div style={{background:C.primFaint,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.primXlt}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontFamily:FB,fontWeight:500,fontSize:14,color:C.ink}}>Save as beneficiary</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:C.olive}}>Quick-select next time</div></div>
            <Toggle value={save} onChange={setSave}/>
          </div>
          {save&&<div style={{marginTop:10}}><input value={benName} onChange={e=>setBenName(e.target.value)} placeholder="Enter a name (e.g. Mum)" style={{width:"100%",height:44,borderRadius:8,border:`1.5px solid ${benName?C.primary:C.border}`,padding:"0 12px",fontFamily:FB,fontSize:14,color:C.ink,background:C.white,boxSizing:"border-box",outline:"none"}}/></div>}
        </div>
        <SpinnerBtn disabled={!canContinue} onClick={()=>canContinue&&setShowPin(true)}>
          {canContinue?`Continue — ₦${finalAmt.toLocaleString()}`:"Enter phone and amount"}
        </SpinnerBtn>
        <div style={{textAlign:"center"}}><span style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>🔒 PIN: 1234 (demo)</span></div>
      </div>
      {showPin&&<PinSheet amount={`₦${finalAmt.toLocaleString()}`} onSuccess={handleSuccess} onDismiss={()=>setShowPin(false)}/>}
    </div>
  );
};

const ScreenData=({goTo,dataState,setDataState,onAddTx})=>{
  const PLANS={"9mobile":{hot:[{id:"nm-h1",size:"1GB",price:290,validity:"1 day",pts:14}],daily:[{id:"nm-d1",size:"500MB",price:150,validity:"1 day",pts:7}],weekly:[{id:"nm-w1",size:"3GB",price:650,validity:"7 days",pts:32}],monthly:[{id:"nm-m1",size:"5GB",price:1500,validity:"30 days",pts:75},{id:"nm-m2",size:"10GB",price:2500,validity:"30 days",pts:125,tag:"Best"}]},MTN:{hot:[{id:"m-h1",size:"1GB",price:305,validity:"1 day",pts:15},{id:"m-h2",size:"2GB",price:550,validity:"2 days",pts:28}],daily:[{id:"m-d1",size:"100MB",price:100,validity:"1 day",pts:5},{id:"m-d2",size:"1GB",price:305,validity:"1 day",pts:15}],weekly:[{id:"m-w1",size:"1.5GB",price:350,validity:"7 days",pts:18},{id:"m-w2",size:"3GB",price:600,validity:"7 days",pts:30}],monthly:[{id:"m-m1",size:"3GB",price:1000,validity:"30 days",pts:50},{id:"m-m2",size:"10GB",price:2500,validity:"30 days",pts:125,tag:"Best"}]},Airtel:{hot:[{id:"a-h1",size:"1.5GB",price:320,validity:"1 day",pts:16}],daily:[{id:"a-d1",size:"1GB",price:300,validity:"1 day",pts:15}],weekly:[{id:"a-w1",size:"4GB",price:700,validity:"7 days",pts:35}],monthly:[{id:"a-m1",size:"6GB",price:1500,validity:"30 days",pts:75},{id:"a-m2",size:"12GB",price:2800,validity:"30 days",pts:140,tag:"Best"}]},Glo:{hot:[{id:"g-h1",size:"1GB",price:280,validity:"1 day",pts:14}],daily:[{id:"g-d1",size:"1GB",price:280,validity:"1 day",pts:14}],weekly:[{id:"g-w1",size:"5GB",price:900,validity:"7 days",pts:45}],monthly:[{id:"g-m1",size:"10GB",price:2000,validity:"30 days",pts:100,tag:"Best"}]}};
  const TABS=[{key:"hot",label:"🔥 Hot"},{key:"daily",label:"Daily"},{key:"weekly",label:"Weekly"},{key:"monthly",label:"Monthly"}];
  const {tab,network,plan,phone}=dataState;
  const plans=(PLANS[network]||PLANS.MTN)[tab]||[];
  const [showPin,setShowPin]=useState(false);
  const handleNetwork=n=>{if(n===network)return;setDataState(s=>({...s,network:n,plan:null}));};
  const handleTab=t=>{if(t===tab)return;setDataState(s=>({...s,tab:t,plan:null}));};
  const canContinue=plan&&phone.length===11;
  const handleSuccess=()=>{onAddTx({type:"data",title:`Data — ${network} ${plan.size}`,amt:`-₦${plan.price.toLocaleString()}`,pts:`+${plan.pts} pts`,date:"Just now",status:"Successful"});setShowPin(false);goTo("success_simple");};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Buy Data" onBack={()=>goTo("services")} rightSlot={plan&&<button onClick={()=>setDataState(s=>({...s,plan:null,tab:"hot"}))} style={{padding:"5px 10px",borderRadius:6,border:"none",cursor:"pointer",background:C.disabled,fontFamily:FB,fontSize:11,fontWeight:600,color:grey}}>Clear</button>}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 24px"}}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>{Object.keys(PLANS).map(n=><button key={n} onClick={()=>handleNetwork(n)} style={{flex:1,height:46,borderRadius:10,border:`1.5px solid ${network===n?NET_COL[n]:C.border}`,background:network===n?NET_COL[n]:C.white,cursor:"pointer",fontFamily:FB,fontWeight:network===n?700:400,fontSize:13,color:network===n?NET_TXT[n]:grey}}>{n}</button>)}</div>
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>Phone</div>
          <div style={{height:48,borderRadius:10,border:`1.5px solid ${phone.length===11?"#C8D080":C.border}`,background:C.white,display:"flex",alignItems:"center",padding:"0 12px"}}>
            <input value={phone} onChange={e=>setDataState(s=>({...s,phone:e.target.value.replace(/\D/g,"").slice(0,11)}))} inputMode="tel" style={{flex:1,border:"none",outline:"none",fontFamily:FA,fontWeight:500,fontSize:15,color:C.ink,background:"transparent"}}/>
          </div>
        </div>
        <div style={{background:C.white,borderRadius:10,padding:4,marginBottom:14,display:"flex",gap:2}}>{TABS.map(t=><button key={t.key} onClick={()=>handleTab(t.key)} style={{flex:1,height:34,borderRadius:7,border:"none",background:tab===t.key?C.primary:"transparent",cursor:"pointer",fontFamily:FB,fontWeight:tab===t.key?700:400,fontSize:12,color:tab===t.key?C.ink:grey}}>{t.label}</button>)}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
          {plans.map(p=>{const sel=plan?.id===p.id;return(
            <div key={p.id} onClick={()=>setDataState(s=>({...s,plan:p}))} style={{background:sel?C.primFaint:C.white,borderRadius:12,border:`1.5px solid ${sel?C.primary:C.border}`,padding:"14px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
              <div style={{minWidth:56}}><div style={{fontFamily:FA,fontWeight:700,fontSize:20,color:C.ink}}>{p.size}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{p.validity}</div></div>
              {p.tag&&<div style={{background:C.ink,borderRadius:6,padding:"2px 8px"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:10,color:C.primary}}>{p.tag.toUpperCase()}</span></div>}
              <div style={{marginLeft:"auto",textAlign:"right"}}><div style={{fontFamily:FA,fontWeight:700,fontSize:16,color:C.ink}}>₦{p.price.toLocaleString()}</div><span style={{fontFamily:FB,fontWeight:600,fontSize:10,color:C.olive,background:C.primXlt,borderRadius:4,padding:"1px 6px"}}>+{p.pts} pts</span></div>
              {sel&&<div style={{width:22,height:22,borderRadius:11,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
            </div>
          );})}
        </div>
        <SpinnerBtn disabled={!canContinue} onClick={()=>canContinue&&setShowPin(true)}>
          {canContinue?`Buy ${network} ${plan.size} — ₦${plan.price.toLocaleString()}`:"Select a plan to continue"}
        </SpinnerBtn>
      </div>
      {showPin&&<PinSheet amount={`₦${plan?.price?.toLocaleString()}`} onSuccess={handleSuccess} onDismiss={()=>setShowPin(false)}/>}
    </div>
  );
};

const ScreenElectricity=({goTo,onAddTx})=>{
  const DISCOS=[
    {id:"AEDC",   name:"Abuja Electricity",       short:"FCT · Niger · Kogi · Nasarawa"},
    {id:"IKEDC",  name:"Ikeja Electric",           short:"Lagos — Ikeja axis"},
    {id:"EKEDC",  name:"Eko Electricity",          short:"Lagos — Island & Eko axis"},
    {id:"PHED",   name:"Port Harcourt Electric",   short:"Rivers · Bayelsa · Cross River · Akwa Ibom"},
    {id:"EEDC",   name:"Enugu Electricity",        short:"Enugu · Anambra · Imo · Abia · Ebonyi"},
    {id:"BEDC",   name:"Benin Electricity",        short:"Edo · Delta · Ondo · Ekiti"},
    {id:"YEDC",   name:"Yola Electric",            short:"Adamawa · Taraba"},
    {id:"KEDC",   name:"Kaduna Electric",          short:"Kaduna · Zamfara · Kebbi · Sokoto"},
    {id:"JED",    name:"Jos Electricity",          short:"Plateau · Benue · Gombe · Bauchi"},
    {id:"KAEDCO", name:"Kano Electric (KAEDCO)",   short:"Kano · Jigawa · Katsina"},
    {id:"KEDCO",  name:"Kano Electricity (KEDCO)", short:"Kano · Jigawa (alt. network)"},
  ];
  const [disco,setDisco]=useState(null), [showDiscoSheet,setShowDiscoSheet]=useState(false);
  const [meter,setMeter]=useState(""), [verifying,setVerifying]=useState(false), [verified,setVerified]=useState(null);
  const [amount,setAmount]=useState(""), [showPin,setShowPin]=useState(false);
  const handleVerify=()=>{if(!disco||meter.length<11)return;setVerifying(true);setVerified(null);setTimeout(()=>{setVerifying(false);setVerified({name:"MERCY OKAFOR",address:"Plot 3, Lugbe Extension, Abuja"});},2000);};
  const handleSuccess=()=>{onAddTx({type:"electricity",title:`Electricity — ${disco?.id}`,amt:`-₦${parseInt(amount||0).toLocaleString()}`,pts:"+250 pts",date:"Just now",status:"Successful"});setShowPin(false);goTo("elec_success");};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white,overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Buy Electricity" onBack={()=>goTo("services")}/>
      <div style={{flex:1,overflowY:"auto",padding:"24px 16px",display:"flex",flexDirection:"column",gap:20}}>
        {/* DisCo selector */}
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Distribution Company (DisCo)</div>
          <div onClick={()=>setShowDiscoSheet(true)} style={{height:56,borderRadius:10,border:`1.5px solid ${disco?"#C8D080":C.border}`,background:C.white,display:"flex",alignItems:"center",gap:12,padding:"0 14px",cursor:"pointer"}}>
            {disco
              ?<><div style={{width:36,height:36,borderRadius:9,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FA,fontWeight:700,fontSize:9,color:C.olive,textAlign:"center"}}>{disco.id}</span></div><div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{disco.name}</div><div style={{fontFamily:FB,fontSize:11,color:grey}}>{disco.short}</div></div></>
              :<><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.09 12.6A1 1 0 0 0 5 14h7l-1 8 8.91-10.6A1 1 0 0 0 19 10h-7l1-8z" stroke={grey} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontFamily:FB,fontSize:14,color:C.placeholder,flex:1}}>Select your distribution company</span></>
            }
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        {/* Meter number */}
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Meter Number</div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1,height:52,borderRadius:10,border:`1.5px solid ${verified?"#A9DFBF":C.border}`,background:verified?"#EAFAF1":C.white,display:"flex",alignItems:"center",padding:"0 14px"}}>
              <input value={meter} onChange={e=>{setMeter(e.target.value.replace(/\D/g,"").slice(0,13));setVerified(null);}} placeholder="Enter meter number" inputMode="numeric" style={{flex:1,border:"none",outline:"none",fontFamily:FA,fontSize:15,fontWeight:500,color:C.ink,background:"transparent"}}/>
              {verified&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={C.success}/><path d="M8 12l3 3 5-5" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <button onClick={handleVerify} disabled={!disco||meter.length<11||verifying||!!verified} style={{width:80,height:52,borderRadius:10,border:"none",background:verified?"#EAFAF1":disco&&meter.length>=11&&!verifying?C.primary:C.disabled,cursor:disco&&meter.length>=11&&!verifying&&!verified?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {verifying?<Spinner size={18} color={grey}/>:verified?<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={C.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>:<span style={{fontFamily:FB,fontWeight:600,fontSize:13,color:disco&&meter.length>=11?C.ink:C.disabledTxt}}>Verify</span>}
            </button>
          </div>
          {verified&&<div style={{marginTop:8,background:"#EAFAF1",borderRadius:8,padding:"10px 14px",border:"1px solid #A9DFBF"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:13,color:C.success}}>{verified.name}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:C.success,opacity:.8}}>{verified.address}</div></div>}
          {verifying&&<div style={{marginTop:8,display:"flex",gap:8}}><Spinner size={14} color={grey} t={2}/><span style={{fontFamily:FB,fontSize:12,color:grey}}>Verifying meter…</span></div>}
          {!disco&&<div style={{marginTop:6}}><span style={{fontFamily:FB,fontSize:12,color:C.placeholder}}>Select a DisCo first before verifying meter</span></div>}
        </div>
        <Field label="Amount (₦500 minimum)" value={amount} onChange={setAmount} inputMode="numeric" prefix="₦" disabled={!verified} hint={!verified?"Verify meter number first":undefined}/>
        <SpinnerBtn disabled={!verified||!amount||parseInt(amount)<500} onClick={()=>setShowPin(true)}>
          {verified&&amount&&parseInt(amount)>=500?`Pay ₦${parseInt(amount).toLocaleString()}`:"Complete fields to continue"}
        </SpinnerBtn>
      </div>
      {/* DisCo Bottom Sheet */}
      {showDiscoSheet&&(
        <div onClick={()=>setShowDiscoSheet(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.52)",zIndex:80,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:"20px 20px 0 0",maxHeight:"78%",display:"flex",flexDirection:"column",animation:"slideUp .28s"}}>
            <div style={{display:"flex",justifyContent:"center",padding:"10px 0 0",flexShrink:0}}><div style={{width:40,height:4,borderRadius:2,background:"#E0E0E0"}}/></div>
            <div style={{padding:"12px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
              <div><span style={{fontFamily:FB,fontWeight:700,fontSize:17,color:C.ink}}>Select DisCo</span><div style={{fontFamily:FB,fontSize:11,color:grey,marginTop:2}}>11 distribution companies available</div></div>
              <button onClick={()=>setShowDiscoSheet(false)} style={{width:30,height:30,borderRadius:15,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke={grey} strokeWidth="2" strokeLinecap="round"/></svg></button>
            </div>
            <div style={{overflowY:"auto",padding:"10px 16px 28px",display:"flex",flexDirection:"column",gap:8}}>
              {DISCOS.map(d=>{const sel=disco?.id===d.id;return(
                <div key={d.id} onClick={()=>{setDisco(d);setShowDiscoSheet(false);setMeter("");setVerified(null);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1.5px solid ${sel?C.primary:C.border}`,background:sel?C.primFaint:C.white,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{width:44,height:44,borderRadius:10,background:sel?C.primary:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FA,fontWeight:700,fontSize:9,color:sel?C.ink:C.olive,textAlign:"center",lineHeight:1.2}}>{d.id}</span></div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{d.name}</div>
                    <div style={{fontFamily:FB,fontSize:11,color:grey}}>{d.short}</div>
                  </div>
                  {sel&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={C.primary}/><path d="M8 12l3 3 5-5" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              );})}
            </div>
          </div>
        </div>
      )}
      {showPin&&<PinSheet amount={`₦${parseInt(amount||0).toLocaleString()}`} onSuccess={handleSuccess} onDismiss={()=>setShowPin(false)}/>}
    </div>
  );
};

const ScreenElecSuccess=({goTo})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
    <ScreenHeader title="Payment Successful" onBack={()=>goTo("home")}/>
    <div style={{flex:1,overflowY:"auto",padding:"16px 16px 32px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:C.white,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:22,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={C.olive} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.ink}}>Payment Successful</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>₦5,050 · 49.5 kWh · AEDC</div></div>
        <div style={{background:C.primFaint,borderRadius:8,padding:"4px 10px"}}><span style={{fontFamily:FA,fontWeight:700,fontSize:13,color:C.olive}}>+250 pts</span></div>
      </div>
      <TokenCard token="45821937640298571634" meter="45123678901" disco="AEDC"/>
      <button onClick={()=>goTo("home")} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Back to Home</button>
    </div>
  </div>
);

/* FIX 8 QA — CABLE TV multi-plan per provider */
const ScreenTV=({goTo,onAddTx})=>{
  const PROVIDERS={
    DStv:{plans:[{name:"Premium",price:29500,pts:1475,desc:"All channels"},{name:"Compact+",price:16600,pts:830,desc:"Top sports & movies"},{name:"Compact",price:9600,pts:480,desc:"Great variety"},{name:"Access",price:3600,pts:180,desc:"Family essentials"},{name:"Yanga",price:2500,pts:125,desc:"Basic entertainment"}]},
    GOtv:{plans:[{name:"Max",price:4150,pts:207,desc:"Best of GOtv"},{name:"Jolli",price:3280,pts:164,desc:"Sports & movies"},{name:"Jinja",price:2460,pts:123,desc:"Family fun"},{name:"Smallie",price:900,pts:45,desc:"Starter pack"}]},
    Startimes:{plans:[{name:"Super",price:4900,pts:245,desc:"Premium content"},{name:"Classic",price:2750,pts:137,desc:"Great variety"},{name:"Basic",price:1850,pts:92,desc:"Family pack"},{name:"Nova",price:1300,pts:65,desc:"Starter"}]},
  };
  const [provider,setProvider]=useState("DStv"), [plan,setPlan]=useState(null), [decoder,setDecoder]=useState(""), [verifyingDec,setVerifyingDec]=useState(false), [verifiedDec,setVerifiedDec]=useState(null), [showPin,setShowPin]=useState(false);
  const plans=PROVIDERS[provider].plans;
  const handleVerifyDec=()=>{if(decoder.length<5)return;setVerifyingDec(true);setVerifiedDec(null);setTimeout(()=>{setVerifyingDec(false);setVerifiedDec({name:"MERCY OKAFOR"});},1800);};
  const handleSuccess=()=>{onAddTx({type:"tv",title:`${provider} ${plan.name}`,amt:`-₦${plan.price.toLocaleString()}`,pts:`+${plan.pts} pts`,date:"Just now",status:"Successful"});setShowPin(false);goTo("success_simple");};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Cable TV" onBack={()=>goTo("services")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 24px",display:"flex",flexDirection:"column",gap:14}}>
        {/* Provider selector */}
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Provider</div>
          <div style={{display:"flex",gap:8}}>
            {Object.keys(PROVIDERS).map(p=><button key={p} onClick={()=>{setProvider(p);setPlan(null);setDecoder("");setVerifiedDec(null);}} style={{flex:1,height:44,borderRadius:10,border:`1.5px solid ${provider===p?C.primary:C.border}`,background:provider===p?C.primFaint:C.white,cursor:"pointer",fontFamily:FB,fontWeight:provider===p?700:400,fontSize:13,color:provider===p?C.olive:grey}}>{p}</button>)}
          </div>
        </div>
        {/* Decoder number */}
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Decoder / Smart Card Number</div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1,height:52,borderRadius:10,border:`1.5px solid ${verifiedDec?"#A9DFBF":C.border}`,background:verifiedDec?"#EAFAF1":C.white,display:"flex",alignItems:"center",padding:"0 14px"}}>
              <input value={decoder} onChange={e=>{setDecoder(e.target.value.replace(/\D/g,"").slice(0,12));setVerifiedDec(null);}} placeholder="Enter decoder / smart card number" inputMode="numeric" style={{flex:1,border:"none",outline:"none",fontFamily:FA,fontSize:14,fontWeight:500,color:C.ink,background:"transparent"}}/>
              {verifiedDec&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={C.success}/><path d="M8 12l3 3 5-5" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <button onClick={handleVerifyDec} disabled={decoder.length<5||verifyingDec||!!verifiedDec} style={{width:80,height:52,borderRadius:10,border:"none",background:verifiedDec?"#EAFAF1":decoder.length>=5&&!verifyingDec?C.primary:C.disabled,cursor:decoder.length>=5&&!verifyingDec&&!verifiedDec?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {verifyingDec?<Spinner size={18} color={grey}/>:verifiedDec?<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={C.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>:<span style={{fontFamily:FB,fontWeight:600,fontSize:13,color:decoder.length>=5?C.ink:C.disabledTxt}}>Verify</span>}
            </button>
          </div>
          {verifiedDec&&<div style={{marginTop:8,background:"#EAFAF1",borderRadius:8,padding:"10px 14px",border:"1px solid #A9DFBF"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:13,color:C.success}}>{verifiedDec.name}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:C.success,opacity:.8}}>Verified {provider} subscriber</div></div>}
          {verifyingDec&&<div style={{marginTop:8,display:"flex",gap:8}}><Spinner size={14} color={grey} t={2}/><span style={{fontFamily:FB,fontSize:12,color:grey}}>Verifying decoder…</span></div>}
        </div>
        {/* Plans */}
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>{provider} Plans</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {plans.map((p,i)=>(
              <div key={p.name} onClick={()=>verifiedDec&&setPlan(p)} style={{background:plan?.name===p.name?C.primFaint:C.white,borderRadius:12,border:`1.5px solid ${plan?.name===p.name?C.primary:C.border}`,padding:"14px 16px",cursor:verifiedDec?"pointer":"not-allowed",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:verifiedDec?1:.55}}>
                <div><div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{p.name}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{p.desc} · Monthly</div></div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:FA,fontWeight:700,fontSize:15,color:C.ink}}>₦{p.price.toLocaleString()}</div>
                  <span style={{fontFamily:FB,fontWeight:600,fontSize:10,color:C.olive,background:C.primXlt,borderRadius:4,padding:"1px 6px"}}>+{p.pts} pts</span>
                </div>
              </div>
            ))}
          </div>
          {!verifiedDec&&<div style={{marginTop:8}}><span style={{fontFamily:FB,fontSize:12,color:C.placeholder}}>Verify your decoder number first to select a plan</span></div>}
        </div>
        <SpinnerBtn disabled={!plan||!verifiedDec} onClick={()=>plan&&verifiedDec&&setShowPin(true)}>
          {plan&&verifiedDec?`Subscribe ${provider} ${plan.name} — ₦${plan.price.toLocaleString()}`:"Verify decoder & select a plan"}
        </SpinnerBtn>
      </div>
      {showPin&&<PinSheet amount={plan?`₦${plan.price.toLocaleString()}`:"₦0"} onSuccess={handleSuccess} onDismiss={()=>setShowPin(false)}/>}
    </div>
  );
};

const ScreenGiftCards=({goTo,onAddTx})=>{
  const [country,setCountry]=useState(COUNTRIES[0]), [showSheet,setShowSheet]=useState(false), [card,setCard]=useState(null), [amount,setAmount]=useState(""), [email,setEmail]=useState(""), [showPin,setShowPin]=useState(false);
  const handleCountry=c=>{setCountry(c);setCard(null);};
  const canContinue=card&&amount&&email;
  const handleSuccess=()=>{onAddTx({type:"giftcard",title:`${card} Gift Card`,amt:`-₦${parseInt(amount||0).toLocaleString()}`,pts:"+400 pts",date:"Just now",status:"Successful"});setShowPin(false);goTo("success_simple");};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Gift Cards" onBack={()=>goTo("services")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Country</div>
          <div onClick={()=>setShowSheet(true)} style={{height:56,borderRadius:10,border:`1.5px solid #C8D080`,background:C.white,display:"flex",alignItems:"center",gap:12,padding:"0 14px",cursor:"pointer"}}>
            <span style={{fontSize:24,lineHeight:1}}>{country.flag}</span>
            <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:600,fontSize:15,color:C.ink}}>{country.name}</div><div style={{fontFamily:FB,fontSize:11,color:grey}}>{country.currency} · {country.cards.length} cards</div></div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>{country.name} Cards</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {country.cards.map((c,i)=>{const col=CARD_COLORS[c]||"#333",sel=card===c;return <div key={c} onClick={()=>setCard(c)} style={{width:"calc((100% - 16px) / 3)",height:64,borderRadius:10,background:sel?col:C.white,border:`1.5px solid ${sel?col:C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .18s",boxShadow:sel?`0 3px 12px ${col}44`:"none"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:11,color:sel?C.white:C.ink,textAlign:"center",padding:"0 6px",lineHeight:1.2}}>{c}</span></div>;})}
          </div>
        </div>
        <Field label="Amount" value={amount} onChange={setAmount} inputMode="numeric" prefix={country.currency}/>
        <Field label="Recipient Email" value={email} onChange={setEmail} inputMode="email"/>
        <SpinnerBtn disabled={!canContinue} onClick={()=>canContinue&&setShowPin(true)}>
          {canContinue?`Buy ${card} — ${country.currency} ${amount}`:"Complete all fields"}
        </SpinnerBtn>
      </div>
      {showSheet&&<CountrySheet selected={country} onSelect={handleCountry} onClose={()=>setShowSheet(false)}/>}
      {showPin&&<PinSheet amount={`${country.currency} ${amount}`} onSuccess={handleSuccess} onDismiss={()=>setShowPin(false)}/>}
    </div>
  );
};

/* FIX 9 QA — FLIGHTS with results + children/infant */
/* ── PASSENGER DETAILS FORM (flights) ────────────────────────── */
const FlightPaxField=({label,error,hint,children})=>(
  <div style={{marginBottom:14,flex:1,minWidth:0}}>
    <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:6,letterSpacing:".04em",textTransform:"uppercase"}}>{label}</div>
    {children}
    {error&&<div style={{fontFamily:FB,fontSize:11,color:C.error,marginTop:4,display:"flex",alignItems:"center",gap:3}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={C.error} strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/></svg>{error}</div>}
    {!error&&hint&&<div style={{fontFamily:FB,fontSize:11,color:C.placeholder,marginTop:4}}>{hint}</div>}
  </div>
);

const FlightPaxInput=({placeholder,value,onChange,error,type="text",icon})=>{
  const [focused,setFocused]=useState(false);
  const border=error?C.errorBorder:focused?C.primary:C.border;
  const bg=error?C.errorBg:focused?"#fff":"#F8F9F6";
  return(
    <div style={{height:48,borderRadius:10,border:`1.5px solid ${border}`,background:bg,display:"flex",alignItems:"center",padding:"0 12px",gap:8,transition:"border-color .15s,background .15s"}}>
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{border:"none",outline:"none",background:"transparent",width:"100%",fontFamily:FB,fontSize:14,color:C.ink,caretColor:C.primary}}/>
      {icon&&<span style={{fontSize:14,flexShrink:0}}>{icon}</span>}
    </div>
  );
};

const FlightPaxSelect=({placeholder,value,onChange,options,error})=>{
  const [focused,setFocused]=useState(false);
  const border=error?C.errorBorder:focused?C.primary:C.border;
  const bg=error?C.errorBg:focused?"#fff":"#F8F9F6";
  return(
    <div style={{height:48,borderRadius:10,border:`1.5px solid ${border}`,background:bg,display:"flex",alignItems:"center",padding:"0 12px",transition:"border-color .15s,background .15s"}}>
      <select value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{border:"none",outline:"none",background:"transparent",width:"100%",fontFamily:FB,fontSize:14,color:value?C.ink:C.placeholder,appearance:"none",cursor:"pointer",caretColor:C.primary}}>
        <option value="" disabled>{placeholder}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,pointerEvents:"none"}}><path d="M6 9l6 6 6-6" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
};

const validatePax=(f)=>{
  const errs={};
  if(!f.title) errs.title="Required";
  if(!f.gender) errs.gender="Required";
  if(!f.surname||f.surname.trim().length<2) errs.surname=f.surname?"Min 2 characters":"Required";
  if(!f.firstName||f.firstName.trim().length<2) errs.firstName=f.firstName?"Min 2 characters":"Required";
  if(!f.dob){
    errs.dob="Required";
  } else {
    const dobMatch=/^(\d{2})-(\d{2})-(\d{4})$/.exec(f.dob);
    if(!dobMatch){
      errs.dob="Use dd-mm-yyyy format";
    } else {
      const [,dd,mm,yyyy]=[...dobMatch].map((v,i)=>i===0?v:Number(v));
      const parsed=new Date(yyyy,mm-1,dd);
      if(parsed.getDate()!==dd||parsed.getMonth()!==mm-1||parsed.getFullYear()!==yyyy||yyyy<1900||yyyy>new Date().getFullYear()-2){
        errs.dob="Enter a valid date of birth";
      }
    }
  }
  if(!f.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email=f.email?"Invalid email address":"Required";
  if(!f.phone||!/^\+?[\d\s\-]{7,15}$/.test(f.phone)) errs.phone=f.phone?"Invalid phone number":"Required";
  return errs;
};

const ScreenPassengerDetails=({paxIndex,totalPax,paxType,flightInfo,onBack,onContinue})=>{
  const [fields,setFields]=useState({title:"",gender:"",surname:"",firstName:"",middleName:"",dob:"",email:"",phone:""});
  const [errors,setErrors]=useState({});
  const [agreed,setAgreed]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const set=k=>v=>{ setFields(f=>({...f,[k]:v})); if(errors[k]) setErrors(e=>({...e,[k]:undefined})); };
  const filled=["title","gender","surname","firstName","dob","email","phone"].filter(k=>fields[k].trim()).length;
  const progress=Math.round((filled/7)*100);
  const handleContinue=()=>{
    setSubmitted(true);
    const errs=validatePax(fields);
    if(!agreed) errs._terms="Please agree to continue";
    setErrors(errs);
    if(Object.keys(errs).length===0) onContinue(fields);
  };
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Passenger Details" onBack={onBack}
        rightSlot={<div style={{fontFamily:FB,fontSize:12,color:grey,background:C.primXlt,borderRadius:20,padding:"4px 10px",fontWeight:600,color:C.olive}}>{paxIndex}/{totalPax}</div>}/>

      {/* Progress strip */}
      <div style={{height:3,background:C.border,flexShrink:0}}>
        <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${C.primary},${C.oliveD})`,borderRadius:3,transition:"width .35s ease"}}/>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 100px",display:"flex",flexDirection:"column",gap:12}}>

        {/* Flight summary pill */}
        <div style={{background:C.white,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:32,height:32,borderRadius:8,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z" stroke={C.olive} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.ink}}>{flightInfo.from} → {flightInfo.to}</div>
              <div style={{fontFamily:FB,fontSize:11,color:grey}}>{flightInfo.airline} · {flightInfo.dep}–{flightInfo.arr}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:FA,fontWeight:700,fontSize:15,color:C.ink}}>₦{flightInfo.price?.toLocaleString()}</div>
            <div style={{fontFamily:FB,fontSize:10,color:C.olive,background:C.primXlt,borderRadius:4,padding:"1px 6px",fontWeight:600}}>+{flightInfo.pts} pts</div>
          </div>
        </div>

        {/* Passenger card */}
        <div style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
          {/* Card header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FA,fontWeight:700,fontSize:14,color:C.ink}}>{paxIndex}</div>
              <div>
                <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.ink}}>Passenger {paxIndex}</div>
                <div style={{fontFamily:FB,fontSize:11,color:grey}}>Enter details as on travel document</div>
              </div>
            </div>
            <div style={{background:C.primXlt,borderRadius:20,padding:"3px 10px",fontFamily:FB,fontSize:11,fontWeight:600,color:C.olive}}>{paxType}</div>
          </div>

          <div style={{height:1,background:C.border,margin:"14px 0"}}/>

          {/* Title + Gender */}
          <div style={{display:"flex",gap:12}}>
            <FlightPaxField label="Title" error={submitted&&errors.title}>
              <FlightPaxSelect value={fields.title} onChange={set("title")} placeholder="Select" options={["Mr","Mrs","Ms","Dr","Prof"]} error={submitted&&errors.title}/>
            </FlightPaxField>
            <FlightPaxField label="Gender" error={submitted&&errors.gender}>
              <FlightPaxSelect value={fields.gender} onChange={set("gender")} placeholder="Select" options={["Male","Female","Non-binary","Prefer not to say"]} error={submitted&&errors.gender}/>
            </FlightPaxField>
          </div>

          {/* Surname */}
          <FlightPaxField label="Surname" error={submitted&&errors.surname}>
            <FlightPaxInput value={fields.surname} onChange={set("surname")} placeholder="Enter surname" error={submitted&&errors.surname}/>
          </FlightPaxField>

          {/* First + Middle */}
          <div style={{display:"flex",gap:12}}>
            <FlightPaxField label="First Name" error={submitted&&errors.firstName}>
              <FlightPaxInput value={fields.firstName} onChange={set("firstName")} placeholder="e.g. James" error={submitted&&errors.firstName}/>
            </FlightPaxField>
            <FlightPaxField label="Middle Name" hint="Optional">
              <FlightPaxInput value={fields.middleName} onChange={set("middleName")} placeholder="e.g. John"/>
            </FlightPaxField>
          </div>

          {/* DOB */}
          <FlightPaxField label="Date of Birth" error={submitted&&errors.dob} hint={(!submitted||!errors.dob)?"Format: dd-mm-yyyy":undefined}>
            <FlightPaxInput value={fields.dob} onChange={set("dob")} placeholder="dd-mm-yyyy" icon="📅" error={submitted&&errors.dob}/>
          </FlightPaxField>

          {/* Email */}
          <FlightPaxField label="Email Address" error={submitted&&errors.email}>
            <FlightPaxInput value={fields.email} onChange={set("email")} placeholder="example@gmail.com" type="email" error={submitted&&errors.email}/>
          </FlightPaxField>

          {/* Email note */}
          <div style={{background:C.primFaint,border:`1px solid ${C.primXlt}`,borderRadius:10,padding:"10px 12px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke={C.olive} strokeWidth="1.8"/><path d="M2 8l10 7 10-7" stroke={C.olive} strokeWidth="1.8" strokeLinecap="round"/></svg>
            <span style={{fontFamily:FB,fontSize:12,color:C.olive,fontWeight:500}}>E-ticket will be sent to this email address</span>
          </div>

          {/* Phone */}
          <FlightPaxField label="Phone Number" error={submitted&&errors.phone}>
            <FlightPaxInput value={fields.phone} onChange={set("phone")} placeholder="+234 800 000 0000" type="tel" error={submitted&&errors.phone}/>
          </FlightPaxField>
        </div>

        {/* Terms */}
        <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"2px 0"}}>
          <div onClick={()=>setAgreed(!agreed)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${agreed?C.primary:(submitted&&errors._terms)?C.errorBorder:C.borderMd}`,background:agreed?C.primary:C.white,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:1,transition:"all .15s"}}>
            {agreed&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span style={{fontFamily:FB,fontSize:13,color:C.body,lineHeight:1.6}}>
            I understand and agree with the{" "}
            <span style={{color:C.primary,fontWeight:600}}>Terms of Service</span>{" "}and{" "}
            <span style={{color:C.primary,fontWeight:600}}>Privacy Policy</span>
          </span>
        </div>
        {submitted&&errors._terms&&<div style={{fontFamily:FB,fontSize:11,color:C.error,paddingLeft:32,marginTop:-6}}>{errors._terms}</div>}
      </div>

      {/* Sticky footer */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"12px 16px 24px",background:C.white,boxShadow:"0 -4px 20px rgba(0,0,0,0.06)"}}>
        <SpinnerBtn onClick={handleContinue}>Continue →</SpinnerBtn>
      </div>
    </div>
  );
};

/* ── FLIGHT BOOKING SUMMARY / PAYMENT SCREEN ─────────────────── */
/* ── FLIGHT PAYMENT SCREEN ───────────────────────────────────── */
const BANKS=[
  {id:"gtb",   name:"GTBank",          abbr:"GTB", col:"#F37021", bg:"#FEF0E7", acct:"****  ****  ****  4521"},
  {id:"access", name:"Access Bank",    abbr:"ACC", col:"#E2162A", bg:"#FDEAEA", acct:"****  ****  ****  8810"},
  {id:"zenith", name:"Zenith Bank",    abbr:"ZEN", col:"#C1272D", bg:"#FDEAEA", acct:"****  ****  ****  3302"},
  {id:"uba",    name:"UBA",            abbr:"UBA", col:"#B10C0E", bg:"#FDEAEA", acct:"****  ****  ****  7764"},
  {id:"first",  name:"First Bank",     abbr:"FBN", col:"#003087", bg:"#E7EDF8", acct:"****  ****  ****  1290"},
  {id:"sterling",name:"Sterling Bank", abbr:"STL", col:"#B80010", bg:"#FDEAEA", acct:"****  ****  ****  5533"},
];
const PAY_METHODS=[
  {id:"wallet",  icon:"💳", label:"Ahzarman Wallet",   sub:"Balance: ₦182,400.00"},
  {id:"card",    icon:"💳", label:"Debit / Credit Card",sub:"Visa, Mastercard, Verve"},
  {id:"transfer",icon:"🏦", label:"Bank Transfer",      sub:"Pay from your bank account"},
  {id:"ussd",    icon:"📲", label:"USSD",               sub:"*737#, *770#, *894# & more"},
];

const FlightPaymentScreen=({total,flight,from,to,onBack,onPay})=>{
  const [ref]=useState(()=>"AHZ-FLT-"+Math.random().toString(36).slice(2,8).toUpperCase());
  const [method,setMethod]=useState("transfer");
  const [selBank,setSelBank]=useState("gtb");
  // fmtNGN used from module scope

  /* Card state */
  const [cardNum,setCardNum]=useState(""), [expiry,setExpiry]=useState(""), [cvv,setCvv]=useState(""), [cardName,setCardName]=useState("");
  const fmtCard=v=>v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1  ").trim();
  const fmtExp=v=>{ const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };

  const WALLET_BAL=182400;
  const walletInsufficient=method==="wallet"&&total>WALLET_BAL;
  const canProceed=(!walletInsufficient&&method==="wallet")||(method==="transfer"&&selBank)||(method==="ussd"&&selBank)||(method==="card"&&cardNum.replace(/\s/g,"").length===16&&expiry.length===5&&cvv.length===3&&cardName.trim());

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Payment" onBack={onBack}/>

      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 110px",display:"flex",flexDirection:"column",gap:14}}>

        {/* Amount banner */}
        <div style={{background:`linear-gradient(135deg,${C.primary} 0%,${C.olive} 100%)`,borderRadius:16,padding:"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:FB,fontSize:12,color:"rgba(255,255,255,.7)",marginBottom:4}}>Total Amount Due</div>
            <div style={{fontFamily:FA,fontWeight:700,fontSize:26,color:"#fff"}}>{fmtNGN(total)}</div>
            <div style={{fontFamily:FB,fontSize:11,color:"rgba(255,255,255,.6)",marginTop:4}}>{flight?.airline} · {from} → {to}</div>
          </div>
          <div style={{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z" fill="rgba(255,255,255,.9)" stroke="rgba(255,255,255,.9)" strokeWidth=".4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        {/* Payment method tabs */}
        <div style={{background:C.white,borderRadius:16,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.ink,marginBottom:14}}>Select Payment Method</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {PAY_METHODS.map(m=>(
              <div key={m.id} onClick={()=>setMethod(m.id)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1.5px solid ${method===m.id?C.error:C.border}`,background:method===m.id?"#FDE8EC":"#F8F9F6",cursor:"pointer",transition:"all .15s"}}>
                <div style={{width:38,height:38,borderRadius:10,background:method===m.id?C.error:"#E8E8E8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {m.id==="wallet"&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="1" y="6" width="22" height="15" rx="2" stroke={method===m.id?"#fff":grey} strokeWidth="1.8"/><path d="M1 10h22" stroke={method===m.id?"#fff":grey} strokeWidth="1.8"/><circle cx="17" cy="16" r="1.5" fill={method===m.id?"#fff":grey}/></svg>}
                  {m.id==="card"&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="22" height="16" rx="2" stroke={method===m.id?"#fff":grey} strokeWidth="1.8"/><path d="M1 10h22M5 16h4" stroke={method===m.id?"#fff":grey} strokeWidth="1.8" strokeLinecap="round"/></svg>}
                  {m.id==="transfer"&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l4-4 4 4M7 5v14M21 15l-4 4-4-4M17 19V5" stroke={method===m.id?"#fff":grey} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  {m.id==="ussd"&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke={method===m.id?"#fff":grey} strokeWidth="1.8"/><path d="M9 7h6M9 11h6M9 15h4" stroke={method===m.id?"#fff":grey} strokeWidth="1.8" strokeLinecap="round"/></svg>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:method===m.id?C.error:C.ink}}>{m.label}</div>
                  <div style={{fontFamily:FB,fontSize:11,color:grey,marginTop:2}}>{m.sub}</div>
                </div>
                <div style={{width:20,height:20,borderRadius:10,border:`2px solid ${method===m.id?C.error:C.borderMd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {method===m.id&&<div style={{width:10,height:10,borderRadius:5,background:C.error}}/>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BANK TRANSFER: bank picker ── */}
        {(method==="transfer"||method==="ussd")&&(
          <div style={{background:C.white,borderRadius:16,padding:"16px",border:`1px solid ${C.border}`}}>
            <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.ink,marginBottom:14}}>
              {method==="transfer"?"Select Bank Account":"Select Bank"}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {BANKS.map(b=>(
                <div key={b.id} onClick={()=>setSelBank(b.id)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderRadius:12,border:`1.5px solid ${selBank===b.id?C.error:C.border}`,background:selBank===b.id?"#FDE8EC":"#F8F9F6",cursor:"pointer",transition:"all .15s"}}>
                  {/* Bank logo */}
                  <div style={{width:40,height:40,borderRadius:10,background:b.col,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontFamily:FA,fontWeight:700,fontSize:11,color:"#fff"}}>{b.abbr}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:selBank===b.id?C.error:C.ink}}>{b.name}</div>
                    {method==="transfer"&&<div style={{fontFamily:FB,fontSize:11,color:grey,marginTop:1,letterSpacing:".04em"}}>{b.acct}</div>}
                    {method==="ussd"&&<div style={{fontFamily:FB,fontSize:11,color:grey,marginTop:1}}>
                      {b.id==="gtb"?"*737#":b.id==="access"?"*901#":b.id==="zenith"?"*966#":b.id==="uba"?"*919#":b.id==="first"?"*894#":"*822#"}
                    </div>}
                  </div>
                  <div style={{width:20,height:20,borderRadius:10,border:`2px solid ${selBank===b.id?C.error:C.borderMd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {selBank===b.id&&<div style={{width:10,height:10,borderRadius:5,background:C.error}}/>}
                  </div>
                </div>
              ))}
            </div>

            {/* Transfer instructions */}
            {method==="transfer"&&selBank&&(()=>{
              const b=BANKS.find(x=>x.id===selBank);
              return(
                <div style={{marginTop:14,background:b.bg,borderRadius:12,padding:"14px",border:`1px solid ${b.col}22`}}>
                  <div style={{fontFamily:FB,fontWeight:600,fontSize:12,color:b.col,marginBottom:8}}>Transfer Details</div>
                  {[
                    {label:"Bank Name",val:b.name},
                    {label:"Account Number",val:"0123456789"},
                    {label:"Account Name",val:"AHZARMAN PAYMENTS LTD"},
                    {label:"Amount",val:fmtNGN(total)},
                    {label:"Reference",val:ref},
                  ].map((r,i)=>(
                    <div key={`bankrow-${i}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i<4?8:0}}>
                      <span style={{fontFamily:FB,fontSize:12,color:grey}}>{r.label}</span>
                      <span style={{fontFamily:FA,fontWeight:600,fontSize:12,color:C.ink}}>{r.val}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* USSD instructions */}
            {method==="ussd"&&selBank&&(()=>{
              const b=BANKS.find(x=>x.id===selBank);
              const code=b.id==="gtb"?"*737#":b.id==="access"?"*901#":b.id==="zenith"?"*966#":b.id==="uba"?"*919#":b.id==="first"?"*894#":"*822#";
              return(
                <div style={{marginTop:14,background:b.bg,borderRadius:12,padding:"14px",border:`1px solid ${b.col}22`}}>
                  <div style={{fontFamily:FB,fontWeight:600,fontSize:12,color:b.col,marginBottom:10}}>How to pay via USSD</div>
                  {[`1. Dial ${code} on your phone`,`2. Select "Transfer" or "Pay Bills"`,`3. Enter Merchant Code: 44210`,`4. Enter amount: ${fmtNGN(total)}`,`5. Enter your bank PIN to confirm`].map((s,i)=>(
                    <div key={`ussdstep-${i}`} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                      <div style={{width:20,height:20,borderRadius:10,background:b.col,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontFamily:FA,fontWeight:700,fontSize:10,color:"#fff"}}>{i+1}</span>
                      </div>
                      <span style={{fontFamily:FB,fontSize:12,color:C.ink,lineHeight:1.5}}>{s.replace(/^\d+\.\s/,"")}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── CARD: form ── */}
        {method==="card"&&(
          <div style={{background:C.white,borderRadius:16,padding:"16px",border:`1px solid ${C.border}`}}>
            <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.ink,marginBottom:14}}>Card Details</div>
            {/* Mini card preview */}
            <div style={{background:`linear-gradient(135deg,#1a1a2e,#16213e)`,borderRadius:14,padding:"16px 18px",marginBottom:16,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.05)"}}/>
              <div style={{position:"absolute",bottom:-30,right:20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,.04)"}}/>
              <div style={{fontFamily:FB,fontSize:10,color:"rgba(255,255,255,.5)",marginBottom:16,letterSpacing:".1em"}}>DEBIT CARD</div>
              <div style={{fontFamily:FA,fontWeight:600,fontSize:15,color:"rgba(255,255,255,.9)",letterSpacing:".15em",marginBottom:14}}>
                {cardNum?cardNum.padEnd(19,"•").replace(/(.{4})/g,"$1  ").trim():"••••  ••••  ••••  ••••"}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div>
                  <div style={{fontFamily:FB,fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:2}}>CARD HOLDER</div>
                  <div style={{fontFamily:FB,fontWeight:600,fontSize:12,color:"rgba(255,255,255,.85)"}}>{cardName||"YOUR NAME"}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:FB,fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:2}}>EXPIRES</div>
                  <div style={{fontFamily:FB,fontWeight:600,fontSize:12,color:"rgba(255,255,255,.85)"}}>{expiry||"MM/YY"}</div>
                </div>
              </div>
            </div>
            {/* Inputs */}
            {[
              {label:"Card Number",val:cardNum,set:v=>setCardNum(fmtCard(v)),placeholder:"0000  0000  0000  0000",type:"tel"},
              {label:"Cardholder Name",val:cardName,set:setCardName,placeholder:"As on card",type:"text"},
            ].map(f=>(
              <div key={f.label} style={{marginBottom:12}}>
                <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:5,textTransform:"uppercase",letterSpacing:".04em"}}>{f.label}</div>
                <div style={{height:48,borderRadius:10,background:"#F8F9F6",border:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 14px"}}>
                  <input type={f.type} placeholder={f.placeholder} value={f.val} onChange={e=>f.set(e.target.value)}
                    style={{border:"none",outline:"none",background:"transparent",width:"100%",fontFamily:FB,fontSize:14,color:C.ink,caretColor:C.error}}/>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:12}}>
              {[
                {label:"Expiry",val:expiry,set:v=>setExpiry(fmtExp(v)),placeholder:"MM/YY",type:"tel"},
                {label:"CVV",val:cvv,set:v=>setCvv(v.replace(/\D/g,"").slice(0,3)),placeholder:"•••",type:"tel"},
              ].map(f=>(
                <div key={f.label} style={{flex:1}}>
                  <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:5,textTransform:"uppercase",letterSpacing:".04em"}}>{f.label}</div>
                  <div style={{height:48,borderRadius:10,background:"#F8F9F6",border:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 14px"}}>
                    <input type={f.type} placeholder={f.placeholder} value={f.val} onChange={e=>f.set(e.target.value)}
                      style={{border:"none",outline:"none",background:"transparent",width:"100%",fontFamily:FB,fontSize:14,color:C.ink,caretColor:C.error}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,padding:"10px 12px",background:"#F0F9F4",borderRadius:8,border:"1px solid #B7DFC8"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#1E8449" strokeWidth="1.8"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#1E8449" strokeWidth="1.8" strokeLinecap="round"/></svg>
              <span style={{fontFamily:FB,fontSize:11,color:"#1E8449"}}>Your card details are encrypted and secure</span>
            </div>
          </div>
        )}

        {/* ── WALLET ── */}
        {walletInsufficient&&<div style={{background:"#FDF0EF",borderRadius:12,padding:"12px 14px",border:`1px solid ${C.errorBorder}`,display:"flex",alignItems:"center",gap:8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={C.error} strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke={C.error} strokeWidth="1.8" strokeLinecap="round"/></svg><span style={{fontFamily:FB,fontSize:13,color:C.error,fontWeight:500}}>Insufficient wallet balance. Please top up or choose another method.</span></div>}
        {method==="wallet"&&(
          <div style={{background:C.white,borderRadius:16,padding:"16px",border:`1px solid ${C.border}`}}>
            <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.ink,marginBottom:14}}>Ahzarman Wallet</div>
            <div style={{background:`linear-gradient(135deg,${C.primary},${C.olive})`,borderRadius:12,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontFamily:FB,fontSize:11,color:"rgba(255,255,255,.7)",marginBottom:4}}>Available Balance</div>
                <div style={{fontFamily:FA,fontWeight:700,fontSize:24,color:"#fff"}}>₦182,400.00</div>
              </div>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="1" y="6" width="22" height="15" rx="2" stroke="rgba(255,255,255,.7)" strokeWidth="1.8"/><path d="M1 10h22" stroke="rgba(255,255,255,.7)" strokeWidth="1.8"/><circle cx="17" cy="16" r="1.5" fill="rgba(255,255,255,.8)"/></svg>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:`1px solid ${C.border}`}}>
              <span style={{fontFamily:FB,fontSize:13,color:grey}}>Amount to deduct</span>
              <span style={{fontFamily:FA,fontWeight:700,fontSize:15,color:C.error}}>{fmtNGN(total)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderTop:`1px solid ${C.border}`}}>
              <span style={{fontFamily:FB,fontSize:13,color:grey}}>Balance after payment</span>
              <span style={{fontFamily:FA,fontWeight:700,fontSize:15,color:C.success}}>{fmtNGN(Math.max(0,182400-total))}</span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky pay button */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:C.white,padding:"14px 16px 28px",boxShadow:"0 -4px 24px rgba(0,0,0,0.08)"}}>
        {walletInsufficient&&<div style={{background:C.errorBg,borderRadius:10,padding:"10px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8,border:`1px solid ${C.errorBorder}`}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={C.error} strokeWidth="1.8"/><path d="M12 8v4M12 16h.01" stroke={C.error} strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span style={{fontFamily:FB,fontSize:12,color:C.error}}>Insufficient wallet balance — top up or choose another method</span>
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:grey}}>Total to pay</span>
          <span style={{fontFamily:FA,fontWeight:700,fontSize:18,color:C.olive}}>{fmtNGN(total)}</span>
        </div>
        <SpinnerBtn disabled={!canProceed} onClick={()=>{if(canProceed){onPay();}}}>
          {method==="transfer"?"I've Made the Transfer →":method==="ussd"?"I've Completed Payment →":"Pay Now →"}
        </SpinnerBtn>
      </div>
    </div>
  );
};

const FlightBookingSummary=({flight,from,to,dep,ret,tripType,cabinClass,paxData,adults,children,infants,onBack,onPay})=>{
  const [showPayment,setShowPayment]=useState(false);
  const [showPin,setShowPin]=useState(false);
  const CITIES={ABV:"Abuja",LOS:"Lagos",KAN:"Kano",PHC:"Port Harcourt",ENU:"Enugu",CBQ:"Calabar"};
  const baseFare=flight?.price||0;
  const taxes=Math.round(baseFare*0.075);
  const surcharge=Math.round(baseFare*0.02);
  const total=baseFare+taxes+surcharge;
  // fmtNGN used from module scope
  const paxTypeOf=(i)=>{ if(i<adults) return "Adult"; if(i<adults+children) return "Child"; return "Infant"; };

  // Route: Summary → FlightPaymentScreen (bank/card/wallet/ussd selector) → PinSheet → onPay
  if(showPayment) return(
    <FlightPaymentScreen
      total={total} flight={flight} from={from} to={to}
      onBack={()=>setShowPayment(false)}
      onPay={onPay}
    />
  );

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Booking Summary" onBack={onBack}/>

      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 110px",display:"flex",flexDirection:"column",gap:14}}>

        {/* ── Flight card ── */}
        <div style={{background:C.white,borderRadius:16,overflow:"hidden",border:`1px solid ${C.border}`}}>
          <div style={{background:`linear-gradient(135deg,${C.ink} 0%,#2d2d2d 100%)`,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:9,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z" fill="white" strokeWidth=".3" stroke="white"/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:"white"}}>{flight?.airline}</div>
              <div style={{fontFamily:FB,fontSize:11,color:"rgba(255,255,255,.7)"}}>{cabinClass} · {tripType==="return"?"Round Trip":"One Way"}</div>
            </div>
            <div style={{background:"rgba(255,255,255,.18)",borderRadius:8,padding:"4px 10px"}}>
              <div style={{fontFamily:FB,fontSize:11,color:"rgba(255,255,255,.8)"}}>{dep?fmtDate(dep):"—"}</div>
            </div>
          </div>
          <div style={{padding:"16px",display:"flex",alignItems:"center"}}>
            <div>
              <div style={{fontFamily:FA,fontWeight:700,fontSize:22,color:C.ink}}>{flight?.dep}</div>
              <div style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.ink}}>{from}</div>
              <div style={{fontFamily:FB,fontSize:11,color:grey}}>{CITIES[from]||from}</div>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 14px"}}>
              <div style={{fontFamily:FB,fontSize:11,color:grey,marginBottom:6}}>{flight?.dur}</div>
              <div style={{width:"100%",display:"flex",alignItems:"center",gap:2}}>
                <div style={{width:7,height:7,borderRadius:"50%",border:`2px solid ${C.error}`,flexShrink:0}}/>
                <div style={{flex:1,borderTop:`1.5px dashed ${C.borderMd}`}}/>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke={C.error} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{fontFamily:FB,fontSize:11,color:grey,marginTop:6}}>{flight?.stops}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:FA,fontWeight:700,fontSize:22,color:C.ink}}>{flight?.arr}</div>
              <div style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.ink}}>{to}</div>
              <div style={{fontFamily:FB,fontSize:11,color:grey}}>{CITIES[to]||to}</div>
            </div>
          </div>
          <div style={{borderTop:`1px dashed ${C.border}`,padding:"10px 16px",display:"flex",gap:16}}>
            {adults>0&&<div style={{display:"flex",alignItems:"center",gap:5}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke={grey} strokeWidth="1.8"/><path d="M4 21v-1a8 8 0 0 1 16 0v1" stroke={grey} strokeWidth="1.8" strokeLinecap="round"/></svg><span style={{fontFamily:FB,fontSize:12,color:grey}}>{adults} Adult{adults>1?"s":""}</span></div>}
            {children>0&&<div style={{display:"flex",alignItems:"center",gap:5}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke={grey} strokeWidth="1.8"/><path d="M4 21v-1a8 8 0 0 1 16 0v1" stroke={grey} strokeWidth="1.8" strokeLinecap="round"/></svg><span style={{fontFamily:FB,fontSize:12,color:grey}}>{children} Child{children>1?"ren":""}</span></div>}
            {infants>0&&<div style={{display:"flex",alignItems:"center",gap:5}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke={grey} strokeWidth="1.8"/><path d="M4 21v-1a8 8 0 0 1 16 0v1" stroke={grey} strokeWidth="1.8" strokeLinecap="round"/></svg><span style={{fontFamily:FB,fontSize:12,color:grey}}>{infants} Infant{infants>1?"s":""}</span></div>}
          </div>
        </div>

        {/* ── Passengers ── */}
        <div style={{background:C.white,borderRadius:16,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.ink,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={C.error} strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={C.error} strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={C.error} strokeWidth="2" strokeLinecap="round"/></svg>
            Passengers
          </div>
          {paxData.map((p,i)=>(
            <div key={i+p.firstName} style={{display:"flex",alignItems:"center",gap:12,paddingBottom:i<paxData.length-1?12:0,marginBottom:i<paxData.length-1?12:0,borderBottom:i<paxData.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{width:36,height:36,borderRadius:9,background:"#FDE8EC",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FA,fontWeight:700,fontSize:14,color:C.error,flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.ink}}>{p.title} {p.firstName} {p.middleName?p.middleName+" ":""}{p.surname}</div>
                <div style={{fontFamily:FB,fontSize:11,color:grey}}>{paxTypeOf(i)} · {p.gender} · DOB: {p.dob}</div>
              </div>
              <div style={{background:C.error+"14",borderRadius:20,padding:"3px 10px"}}>
                <span style={{fontFamily:FB,fontSize:11,fontWeight:600,color:C.error}}>{paxTypeOf(i)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Fare breakdown ── */}
        <div style={{background:C.white,borderRadius:16,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.ink,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="22" height="16" rx="2" stroke={C.error} strokeWidth="2"/><path d="M1 10h22" stroke={C.error} strokeWidth="2"/></svg>
            Fare Breakdown
          </div>
          {[
            {label:`Base Fare (${paxData.length} pax)`,val:fmtNGN(baseFare),muted:false},
            {label:"Airport Tax & Surcharges",val:fmtNGN(taxes),muted:true},
            {label:"Fuel Surcharge",val:fmtNGN(surcharge),muted:true},
          ].map((row,i)=>(
            <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontFamily:FB,fontSize:13,color:row.muted?grey:C.ink}}>{row.label}</span>
              <span style={{fontFamily:FA,fontWeight:row.muted?500:600,fontSize:13,color:row.muted?grey:C.ink}}>{row.val}</span>
            </div>
          ))}
          <div style={{height:1,background:C.border,margin:"12px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.ink}}>Total Amount</span>
            <span style={{fontFamily:FA,fontWeight:700,fontSize:20,color:C.error}}>{fmtNGN(total)}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={C.olive} strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke={C.olive} strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{fontFamily:FB,fontSize:11,color:C.olive}}>+{flight?.pts||0} Ahzarman points on this booking</span>
          </div>
        </div>

        {/* ── Policy note ── */}
        <div style={{background:"#FFF8E6",borderRadius:12,padding:"12px 14px",border:"1px solid #FFE4A0",display:"flex",gap:10}}>
          <span style={{fontSize:15,flexShrink:0}}>📋</span>
          <div style={{fontFamily:FB,fontSize:12,color:"#7A5800",lineHeight:1.6}}>
            <strong>Cancellation Policy:</strong> Free cancellation within 24 hours of booking. A fee applies thereafter. Tickets are non-transferable.
          </div>
        </div>
      </div>

      {/* ── Sticky pay button ── */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:C.white,padding:"14px 16px 28px",boxShadow:"0 -4px 24px rgba(0,0,0,0.08)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:grey}}>Total to pay</span>
          <span style={{fontFamily:FA,fontWeight:700,fontSize:20,color:C.error}}>{fmtNGN(total)}</span>
        </div>
        <SpinnerBtn onClick={()=>setShowPayment(true)}>
          Proceed to Payment →
        </SpinnerBtn>
      </div>
    </div>
  );
};

/* ── AIRPORT SEARCH BOTTOM SHEET ─────────────────────────────── */
const AIRPORTS=[
  {city:"Port Harcourt, Nigeria",name:"Port Harcourt International Airport",code:"PHC"},
  {city:"Lagos, Nigeria",name:"Murtala Muhammed International Airport",code:"LOS"},
  {city:"Abuja, Nigeria",name:"Nnamdi Azikwe International Airport",code:"ABV"},
  {city:"Kano, Nigeria",name:"Mallam Aminu Kano International Airport",code:"KAN"},
  {city:"Enugu, Nigeria",name:"Akanu Ibiam International Airport",code:"ENU"},
  {city:"Calabar, Nigeria",name:"Margaret Ekpo International Airport",code:"CBQ"},
];
const AirportSearchSheet=({onSelect,onClose,favourites,onToggleFav})=>{
  const [q,setQ]=useState("");
  const filtered=q.trim()?AIRPORTS.filter(a=>a.city.toLowerCase().includes(q.toLowerCase())||a.code.toLowerCase().includes(q.toLowerCase())||a.name.toLowerCase().includes(q.toLowerCase())):AIRPORTS;
  return(
    <div style={{position:"absolute",inset:0,zIndex:300,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{flex:1,background:"rgba(0,0,0,0.35)"}}/>
      <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"20px 16px 32px",maxHeight:"72%",display:"flex",flexDirection:"column",animation:"slideUp .28s ease"}}>
        {/* Search bar */}
        <div style={{display:"flex",alignItems:"center",gap:10,background:"#F3F4F6",borderRadius:30,padding:"10px 14px",marginBottom:20}}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={grey} strokeWidth="1.8"/><path d="M21 21l-4.35-4.35" stroke={grey} strokeWidth="1.8" strokeLinecap="round"/></svg>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Enter city, airport, or place"
            style={{flex:1,border:"none",outline:"none",background:"transparent",fontFamily:FB,fontSize:14,color:C.ink,caretColor:C.error}}/>
          {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#D1D5DB"/><path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>}
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:FB,fontWeight:600,fontSize:15,color:C.ink}}>✕</button>
        </div>
        {/* Airport list */}
        <div style={{overflowY:"auto",display:"flex",flexDirection:"column",gap:0}}>
          {filtered.map((a,i)=>(
            <div key={a.code} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 0",borderBottom:i<filtered.length-1?`1px solid ${C.border}`:"none",cursor:"pointer"}} onClick={()=>onSelect(a.code)}>
              <div style={{width:40,height:40,borderRadius:10,background:C.primFaint,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z" stroke={C.olive} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{a.city}</div>
                <div style={{fontFamily:FB,fontSize:11,color:grey,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.name}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span style={{fontFamily:FA,fontWeight:700,fontSize:14,color:C.ink}}>{a.code}</span>
                <button onClick={e=>{e.stopPropagation();onToggleFav(a.code);}} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke={C.olive} strokeWidth="1.6" fill={favourites.includes(a.code)?C.primary:"none"} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── FLIGHTS RESULTS SCREEN ───────────────────────────────────── */
const FlightResultsScreen=({from,to,dep,adults,children,infants,cabinClass,onBack,onSelectFlight})=>{
  const [activeFilter,setActiveFilter]=useState(null);
  const [expandedAirline,setExpandedAirline]=useState(null);
  const [selFlight,setSelFlight]=useState(null);
  const CITIES={ABV:"Abuja",LOS:"Lagos",KAN:"Kano",PHC:"Port Harcourt",ENU:"Enugu",CBQ:"Calabar"};
  const allFlights=[
    {airline:"United Nigeria",dep:"05:30 PM",arr:"06:30 PM",dur:"1hrs",stops:"Direct",price:497336,pts:990,cheapest:true,quickest:true},
    {airline:"Air Peace",dep:"07:45 PM",arr:"07:05 AM",dur:"11h 20m",stops:"1 Stop",price:814053,pts:1628,cheapest:false,quickest:false},
    {airline:"Air Peace",dep:"09:00 PM",arr:"10:15 PM",dur:"1h 15m",stops:"Direct",price:765000,pts:1530,cheapest:false,quickest:false},
    {airline:"Air Peace",dep:"11:30 PM",arr:"12:50 AM",dur:"1h 20m",stops:"Direct",price:720000,pts:1440,cheapest:false,quickest:false},
    {airline:"Arik Air",dep:"06:00 AM",arr:"07:20 AM",dur:"1h 20m",stops:"Direct",price:620000,pts:1240,cheapest:false,quickest:false},
  ];
  /* Group by airline, show first of each by default, expand to show more */
  const airlines=[...new Set(allFlights.map(f=>f.airline))];
  const grouped=airlines.map(a=>({airline:a,flights:allFlights.filter(f=>f.airline===a)}));
  const totalPax=adults+children+infants;
  const paxLabel=`${totalPax} Passenger${totalPax>1?"s":""}`;
  const filters=["Filter","Prices","Airlines","Times","Sort"];
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      {/* Header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{height:56,display:"flex",alignItems:"center",paddingLeft:4,paddingRight:12,gap:4}}>
          <button onClick={onBack} style={{width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",cursor:"pointer",borderRadius:10}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span style={{flex:1,textAlign:"center",fontFamily:FB,fontWeight:600,fontSize:17,color:C.ink}}>Search Result</span>
          <button style={{width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",cursor:"pointer"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 18c0-1.1.9-2 2-2h14a2 2 0 0 1 0 4H5a2 2 0 0 1-2-2zM3 12c0-1.1.9-2 2-2h14a2 2 0 0 1 0 4H5a2 2 0 0 1-2-2zM3 6c0-1.1.9-2 2-2h14a2 2 0 0 1 0 4H5a2 2 0 0 1-2-2z" stroke={C.ink} strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>
        {/* Route pill + edit */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 16px 14px"}}>
          <div style={{flex:1,border:`1.5px solid ${C.primary}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.primFaint}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:FA,fontWeight:700,fontSize:15,color:C.ink}}>{from}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z" fill={C.primary} stroke={C.primary} strokeWidth=".5"/></svg>
              <span style={{fontFamily:FA,fontWeight:700,fontSize:15,color:C.ink}}>{to}</span>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:C.ink}}>{dep?fmtDate(dep):"—"}</div>
              <div style={{fontFamily:FB,fontSize:11,color:grey,display:"flex",alignItems:"center",gap:4}}>
                {paxLabel}<span style={{width:6,height:6,borderRadius:3,background:C.primary,display:"inline-block"}}/>{cabinClass}
              </div>
            </div>
          </div>
          <button style={{width:40,height:40,border:`1px solid ${C.border}`,borderRadius:10,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onBack}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        {/* Filter chips */}
        <div style={{display:"flex",gap:8,padding:"0 16px 14px",overflowX:"auto",msOverflowStyle:"none",scrollbarWidth:"none"}}>
          {filters.map(f=>(
            <button key={f} onClick={()=>setActiveFilter(activeFilter===f?null:f)}
              style={{flexShrink:0,height:36,borderRadius:30,border:`1.5px solid ${activeFilter===f?C.primary:C.border}`,background:activeFilter===f?C.primXlt:C.white,fontFamily:FB,fontWeight:activeFilter===f?600:400,fontSize:13,color:activeFilter===f?C.olive:C.ink,cursor:"pointer",padding:"0 16px",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
              {f==="Filter"&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={activeFilter===f?C.error:C.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 24px",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{fontFamily:FB,fontWeight:400,fontSize:13,color:grey}}>{allFlights.length} Result(s)</div>
        {grouped.map(({airline,flights})=>{
          const main=flights[0];
          const extra=flights.slice(1);
          const isExpanded=expandedAirline===airline;
          const isSelected=selFlight?.airline===airline&&selFlight?.dep===main.dep;
          return(
            <div key={airline}>
              {/* Main flight card */}
              <div onClick={()=>setSelFlight(isSelected?null:main)}
                style={{background:C.white,borderRadius:14,border:`1.5px solid ${isSelected?C.primary:C.border}`,overflow:"hidden",cursor:"pointer"}}>
                {/* Airline row */}
                <div style={{padding:"14px 14px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:6,background:"#F0F4FF",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z" stroke="#4A6CF7" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{airline}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {main.cheapest&&<span style={{fontFamily:FB,fontWeight:600,fontSize:10,color:"#1E8449",background:"#EAFAF1",border:"1px solid #A9DFBF",borderRadius:20,padding:"2px 8px"}}>Cheapest</span>}
                    {main.quickest&&<span style={{fontFamily:FB,fontWeight:600,fontSize:10,color:"#1A6A8A",background:"#D6EEF8",border:"1px solid #A9D0E8",borderRadius:20,padding:"2px 8px"}}>Quickest</span>}
                  </div>
                </div>
                {/* Times row */}
                <div style={{padding:"12px 14px",display:"flex",alignItems:"center"}}>
                  <div>
                    <div style={{fontFamily:FA,fontWeight:700,fontSize:20,color:C.ink}}>{main.dep}</div>
                    <div style={{fontFamily:FB,fontSize:11,color:grey}}>{CITIES[from]||from} ({from})</div>
                  </div>
                  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 12px"}}>
                    <div style={{fontFamily:FB,fontSize:11,color:grey,marginBottom:5}}>{main.dur}</div>
                    <div style={{width:"100%",display:"flex",alignItems:"center",gap:0}}>
                      <div style={{flex:1,borderTop:`1.5px dashed ${C.borderMd}`}}/>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={{fontFamily:FB,fontSize:11,color:grey,marginTop:5}}>{main.stops}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:FA,fontWeight:700,fontSize:20,color:C.ink}}>{main.arr}</div>
                    <div style={{fontFamily:FB,fontSize:11,color:grey}}>{CITIES[to]||to} ({to})</div>
                  </div>
                </div>
                {/* Price row */}
                <div style={{background:C.primFaint,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontFamily:FB,fontWeight:400,fontSize:13,color:grey}}>Price</span>
                  <span style={{fontFamily:FA,fontWeight:700,fontSize:16,color:C.olive}}>₦{main.price.toLocaleString()}.00</span>
                </div>
              </div>
              {/* Expand more flights */}
              {extra.length>0&&(
                <>
                  {isExpanded&&extra.map((f,i)=>(
                    <div key={`xflight-${i}`} onClick={()=>setSelFlight(selFlight?.dep===f.dep?null:f)} style={{marginTop:8,background:C.white,borderRadius:14,border:`1.5px solid ${selFlight?.dep===f.dep?C.primary:C.border}`,overflow:"hidden",cursor:"pointer"}}>
                      <div style={{padding:"12px 14px",display:"flex",alignItems:"center"}}>
                        <div>
                          <div style={{fontFamily:FA,fontWeight:700,fontSize:18,color:C.ink}}>{f.dep}</div>
                          <div style={{fontFamily:FB,fontSize:11,color:grey}}>{CITIES[from]||from} ({from})</div>
                        </div>
                        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 12px"}}>
                          <div style={{fontFamily:FB,fontSize:11,color:grey,marginBottom:4}}>{f.dur}</div>
                          <div style={{width:"100%",display:"flex",alignItems:"center"}}><div style={{flex:1,borderTop:`1.5px dashed ${C.borderMd}`}}/><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                          <div style={{fontFamily:FB,fontSize:11,color:grey,marginTop:4}}>{f.stops}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:FA,fontWeight:700,fontSize:18,color:C.ink}}>{f.arr}</div>
                          <div style={{fontFamily:FB,fontSize:11,color:grey}}>{CITIES[to]||to} ({to})</div>
                        </div>
                      </div>
                      <div style={{background:C.primFaint,padding:"10px 14px",display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontFamily:FB,fontSize:13,color:grey}}>Price</span>
                        <span style={{fontFamily:FA,fontWeight:700,fontSize:15,color:C.olive}}>₦{f.price.toLocaleString()}.00</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>setExpandedAirline(isExpanded?null:airline)}
                    style={{width:"100%",marginTop:8,background:C.primary,border:"none",borderRadius:14,padding:"14px",fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    {isExpanded?`Hide extra flights`:`+${extra.length} ${airline} Flight${extra.length>1?"s":""}`}
                    <span style={{fontSize:16}}>{isExpanded?"↑":"»"}</span>
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky book button */}
      {selFlight&&(
        <div style={{padding:"12px 16px 24px",background:C.white,boxShadow:"0 -4px 20px rgba(0,0,0,0.06)",flexShrink:0}}>
          <SpinnerBtn onClick={()=>onSelectFlight(selFlight)}>
            Enter Passenger Details →
          </SpinnerBtn>
        </div>
      )}
    </div>
  );
};

const ScreenFlights=({goTo,onAddTx})=>{
  const [from,setFrom]=useState("ABV"), [to,setTo]=useState("PHC");
  const [dep,setDep]=useState(null), [ret,setRet]=useState(null);
  const [openCal,setOpenCal]=useState(null), [tripType,setTripType]=useState("one-way");
  const [cabinClass,setCabinClass]=useState("Business");
  const [adults,setAdults]=useState(2), [children,setChildren]=useState(0), [infants,setInfants]=useState(0);
  const [showResults,setShowResults]=useState(false);
  const [airportTarget,setAirportTarget]=useState(null); // "from"|"to"
  const [favourites,setFavourites]=useState(["PHC","LOS"]);
  const [showPaxDetails,setShowPaxDetails]=useState(false), [currentPax,setCurrentPax]=useState(1), [paxData,setPaxData]=useState([]);
  const [selFlight,setSelFlight]=useState(null), [showSummary,setShowSummary]=useState(false);

  const CITIES={ABV:"Abuja",LOS:"Lagos",KAN:"Kano",PHC:"Port Harcourt",ENU:"Enugu",CBQ:"Calabar"};
  const canSearch=dep&&(tripType==="one-way"||ret);
  const handleDep=d=>{setDep(d);if(ret&&ret<=d)setRet(null);setOpenCal(null);};
  const totalPax=adults+children+infants;
  const getPaxType=(idx)=>{ if(idx<=adults) return "Adult"; if(idx<=adults+children) return "Child"; return "Infant"; };
  const flightPts=selFlight?.pts||0;
  const handleSuccess=()=>{ onAddTx({type:"flights",title:`${from} → ${to}`,amt:`-₦${selFlight?.price?.toLocaleString()}`,pts:`+${flightPts} pts`,date:"Just now",status:"Successful"}); goTo("success_simple",{pts:flightPts}); };
  const toggleFav=code=>setFavourites(f=>f.includes(code)?f.filter(c=>c!==code):[...f,code]);

  /* Booking summary + payment screen */
  if(showSummary) return(
    <FlightBookingSummary
      flight={selFlight}
      from={from} to={to} dep={dep} ret={ret}
      tripType={tripType} cabinClass={cabinClass}
      paxData={paxData}
      adults={adults} children={children} infants={infants}
      onBack={()=>setShowSummary(false)}
      onPay={handleSuccess}
    />
  );

  /* Passenger details flow */
  if(showPaxDetails){
    const handlePaxContinue=(data)=>{
      const updated=[...paxData,data];
      setPaxData(updated);
      if(currentPax<totalPax){ setCurrentPax(p=>p+1); }
      else{ setShowPaxDetails(false); setShowSummary(true); }
    };
    return <ScreenPassengerDetails
      key={currentPax}
      paxIndex={currentPax}
      totalPax={totalPax}
      paxType={getPaxType(currentPax)}
      flightInfo={{from,to,airline:selFlight?.airline,dep:selFlight?.dep,arr:selFlight?.arr,price:selFlight?.price,pts:selFlight?.pts}}
      onBack={()=>{ if(currentPax>1){setCurrentPax(p=>p-1);setPaxData(d=>d.slice(0,-1));}else{setShowPaxDetails(false);} }}
      onContinue={handlePaxContinue}
    />;
  }

  /* Results screen */
  if(showResults) return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
      <FlightResultsScreen
        from={from} to={to} dep={dep} adults={adults} children={children} infants={infants}
        cabinClass={cabinClass}
        onBack={()=>setShowResults(false)}
        onSelectFlight={f=>{ setSelFlight(f); setCurrentPax(1); setPaxData([]); setShowResults(false); setShowPaxDetails(true); }}
      />
    </div>
  );

  /* ── Search form ── */
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Flight Tickets" onBack={()=>goTo("services")}
        rightSlot={<button style={{background:"none",border:"none",cursor:"pointer",padding:4}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke={C.ink} strokeWidth="2" strokeLinecap="round"/></svg></button>}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 32px",display:"flex",flexDirection:"column",gap:14}}>

        {/* Trip type tabs */}
        <div style={{display:"flex",background:C.white,borderRadius:12,padding:4,border:`1px solid ${C.border}`,gap:2}}>
          {[{k:"one-way",l:"One Way"},{k:"return",l:"Round Trip"},{k:"multi",l:"Multi-City",disabled:true}].map(t=>(
            <button key={t.k} onClick={()=>{setTripType(t.k);if(t.k==="one-way")setRet(null);}}
              disabled={t.disabled} style={{flex:1,height:38,borderRadius:9,border:"none",cursor:t.disabled?"not-allowed":"pointer",background:tripType===t.k?C.primary:t.disabled?"#f0f0f0":"transparent",fontFamily:FB,fontWeight:tripType===t.k?700:400,fontSize:12,color:t.disabled?C.disabledTxt:tripType===t.k?C.ink:grey,whiteSpace:"nowrap",position:"relative"}}>
              {t.l}
            </button>
          ))}
        </div>

        {/* From / To */}
        <div style={{background:C.white,borderRadius:14,padding:"16px",position:"relative",border:`1px solid ${C.border}`}}>
          {/* From */}
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:6,textTransform:"uppercase",letterSpacing:".04em"}}>From</div>
            <div onClick={()=>setAirportTarget("from")} style={{height:60,borderRadius:10,background:"#F8F9F6",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 14px",gap:10,cursor:"pointer"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z" stroke={C.olive} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div style={{flex:1}}>
                <div style={{fontFamily:FB,fontSize:11,color:grey}}>From</div>
                <div style={{fontFamily:FA,fontWeight:700,fontSize:16,color:C.ink}}>{CITIES[from]||from} - {from==="ABV"?"Nnamdi Azikwe International":from==="PHC"?"Port Harcourt International":from==="LOS"?"Murtala Muhammed International":"International Airport"}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={grey} strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </div>
          {/* Swap button */}
          <button onClick={()=>{setFrom(to);setTo(from);}} style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:36,height:36,borderRadius:18,background:C.primary,border:`3px solid ${C.white}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 16V4M7 4L3 8M7 4l4 4" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 8v12M17 20l4-4M17 20l-4-4" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {/* To */}
          <div>
            <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:6,textTransform:"uppercase",letterSpacing:".04em"}}>To</div>
            <div onClick={()=>setAirportTarget("to")} style={{height:60,borderRadius:10,background:"#F8F9F6",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 14px",gap:10,cursor:"pointer"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke={C.olive} strokeWidth="1.6"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke={C.olive} strokeWidth="1.6" strokeLinecap="round"/></svg>
              <div style={{flex:1}}>
                <div style={{fontFamily:FB,fontSize:11,color:grey}}>To</div>
                <div style={{fontFamily:FA,fontWeight:700,fontSize:16,color:C.ink}}>{CITIES[to]||to} - {to==="ABV"?"Nnamdi Azikwe International":to==="PHC"?"Port Harcourt International":to==="LOS"?"Murtala Muhammed International":"International Airport"}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={grey} strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div style={{background:C.white,borderRadius:14,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:6,textTransform:"uppercase",letterSpacing:".04em"}}>Departure</div>
              <div onClick={()=>setOpenCal(openCal==="dep"?null:"dep")} style={{height:52,borderRadius:10,border:`1.5px solid ${openCal==="dep"?C.primary:dep?C.primary+"66":C.border}`,background:"#F8F9F6",display:"flex",alignItems:"center",gap:8,padding:"0 12px",cursor:"pointer"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={dep?C.olive:grey} strokeWidth="1.8"/><path d="M8 2v4M16 2v4M3 10h18" stroke={dep?C.olive:grey} strokeWidth="1.8" strokeLinecap="round"/></svg>
                <span style={{fontFamily:FB,fontWeight:dep?600:400,fontSize:13,color:dep?C.ink:C.placeholder}}>{dep?fmtDate(dep):"Select date"}</span>
              </div>
            </div>
            {tripType==="return"&&<div style={{flex:1}}>
              <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:6,textTransform:"uppercase",letterSpacing:".04em"}}>Return</div>
              <div onClick={()=>dep&&setOpenCal(openCal==="ret"?null:"ret")} style={{height:52,borderRadius:10,border:`1.5px solid ${openCal==="ret"?C.primary:ret?C.primary+"66":C.border}`,background:dep?"#F8F9F6":C.disabled,display:"flex",alignItems:"center",gap:8,padding:"0 12px",cursor:dep?"pointer":"not-allowed"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={ret?C.olive:grey} strokeWidth="1.8"/><path d="M8 2v4M16 2v4M3 10h18" stroke={ret?C.olive:grey} strokeWidth="1.8" strokeLinecap="round"/></svg>
                <span style={{fontFamily:FB,fontWeight:ret?600:400,fontSize:13,color:ret?C.ink:C.placeholder}}>{ret?fmtDate(ret):"Select date"}</span>
              </div>
            </div>}
          </div>
          {openCal==="dep"&&<CalendarPicker selected={dep} minDate={today()} onSelect={handleDep} onClose={()=>setOpenCal(null)}/>}
          {openCal==="ret"&&tripType==="return"&&<CalendarPicker selected={ret} minDate={dep?addDays(dep,1):addDays(today(),1)} onSelect={d=>{setRet(d);setOpenCal(null);}} onClose={()=>setOpenCal(null)}/>}
        </div>

        {/* Passengers */}
        <div style={{background:C.white,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:14}}>Passengers</div>
          {[{label:"Adults",sub:"12+ years",val:adults,set:setAdults,min:1,max:9},{label:"Children",sub:"2–11 years",val:children,set:setChildren,min:0,max:8},{label:"Infants",sub:"Under 2",val:infants,set:setInfants,min:0,max:4}].map((p,i,arr)=>(
            <div key={`paxrow-${i}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:i<arr.length-1?14:0,marginBottom:i<arr.length-1?14:0,borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
              <div><div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{p.label}</div><div style={{fontFamily:FB,fontSize:11,color:grey}}>{p.sub}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <button onClick={()=>p.set(Math.max(p.min,p.val-1))} style={{width:34,height:34,borderRadius:8,background:p.val>p.min?C.primXlt:C.disabled,border:"none",cursor:p.val>p.min?"pointer":"not-allowed",fontFamily:FA,fontWeight:700,fontSize:20,color:p.val>p.min?C.olive:C.disabledTxt}}>−</button>
                <span style={{fontFamily:FA,fontWeight:700,fontSize:18,color:C.ink,minWidth:20,textAlign:"center"}}>{p.val}</span>
                <button onClick={()=>p.set(Math.min(p.max,p.val+1))} style={{width:34,height:34,borderRadius:8,background:p.val<p.max?C.primXlt:C.disabled,border:"none",cursor:p.val<p.max?"pointer":"not-allowed",fontFamily:FA,fontWeight:700,fontSize:20,color:p.val<p.max?C.olive:C.disabledTxt}}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Cabin class */}
        <div style={{background:C.white,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:12}}>Cabin Class</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {["Economy","Business","First Class"].map(c=>(
              <button key={c} onClick={()=>setCabinClass(c)} style={{flex:1,height:38,borderRadius:10,border:`1.5px solid ${cabinClass===c?C.primary:C.border}`,background:cabinClass===c?C.primXlt:C.white,fontFamily:FB,fontWeight:cabinClass===c?700:400,fontSize:13,color:cabinClass===c?C.olive:grey,cursor:"pointer",whiteSpace:"nowrap"}}>{c}</button>
            ))}
          </div>
        </div>

        <SpinnerBtn disabled={!canSearch} onClick={()=>canSearch&&setShowResults(true)}>
          {canSearch?`Search Flights — ${fmtDate(dep)}`:"Select departure date to search"}
        </SpinnerBtn>
      </div>

      {/* Airport search sheet — rendered as overlay so form stays visible behind */}
      {airportTarget&&(
        <AirportSearchSheet
          onSelect={code=>{ if(airportTarget==="from") setFrom(code); else setTo(code); setAirportTarget(null); }}
          onClose={()=>setAirportTarget(null)}
          favourites={favourites}
          onToggleFav={toggleFav}
        />
      )}
    </div>
  );
};

/* FIX 6 QA — BETTING with clickable companies + fund wallet */
const ScreenBetting=({goTo,onAddTx})=>{
  const [selSite,setSelSite]=useState(null), [betId,setBetId]=useState(""), [amount,setAmount]=useState(""), [showPin,setShowPin]=useState(false);
  const scrollRef=useRef(null);
  const [activeCard,setActiveCard]=useState(0);
  const matches=[
    {home:"Arsenal",away:"Chelsea",league:"Premier League",time:"20:00",odds:{h:"2.10",d:"3.40",a:"3.20"},live:true,score:"1 - 0"},
    {home:"Man City",away:"Liverpool",league:"Premier League",time:"21:00",odds:{h:"1.85",d:"3.60",a:"4.10"},live:false,score:null},
    {home:"Barcelona",away:"Real Madrid",league:"La Liga",time:"21:45",odds:{h:"2.40",d:"3.30",a:"2.80"},live:false,score:null},
  ];
  const sites=[
    {name:"Bet9ja",col:"#00A550",logo:"B9",minFund:100},
    {name:"Sportybet",col:"#F7941D",logo:"SP",minFund:100},
    {name:"1xBet",col:"#1C5FA8",logo:"1X",minFund:500},
    {name:"BetKing",col:"#8B0000",logo:"BK",minFund:200},
  ];
  const handleScroll=()=>{if(!scrollRef.current)return;const {scrollLeft,offsetWidth}=scrollRef.current;setActiveCard(Math.round(scrollLeft/(offsetWidth*.85+12)));};
  const handleSuccess=()=>{onAddTx({type:"betting",title:`${selSite.name} Wallet`,amt:`-₦${parseInt(amount).toLocaleString()}`,pts:"+100 pts",date:"Just now",status:"Successful"});setShowPin(false);setSelSite(null);setAmount("");goTo("success_simple");};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Betting" onBack={()=>goTo("services")}/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:24}}>
        <div style={{padding:"16px 16px 10px",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontFamily:FB,fontWeight:600,fontSize:15,color:C.ink}}>Featured Matches</span>
          <span style={{fontFamily:FB,fontSize:12,color:C.primary}}>See all →</span>
        </div>
        <div ref={scrollRef} onScroll={handleScroll} style={{display:"flex",overflowX:"auto",gap:12,paddingLeft:16,paddingRight:16,paddingBottom:4,scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",msOverflowStyle:"none",scrollbarWidth:"none"}}>
          {matches.map((m,i)=>(
            <div key={m.home+m.away} style={{flexShrink:0,width:"85%",scrollSnapAlign:"start",background:C.ink,borderRadius:14,padding:"14px 14px 12px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:`${C.primary}14`,pointerEvents:"none"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontFamily:FB,fontSize:10,color:"rgba(255,255,255,.45)",letterSpacing:".06em",textTransform:"uppercase"}}>{m.league}</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {m.live&&<div style={{width:6,height:6,borderRadius:3,background:"#E74C3C",animation:"pulse 1.2s infinite"}}/>}
                  <span style={{fontFamily:FB,fontWeight:600,fontSize:11,color:m.live?"#E74C3C":"rgba(255,255,255,.5)"}}>{m.live?"LIVE":m.time}</span>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.white,marginBottom:2}}>{m.home}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:"rgba(255,255,255,.4)"}}>Home</div></div>
                <div style={{padding:"6px 14px",background:"rgba(255,255,255,.08)",borderRadius:8}}><span style={{fontFamily:FA,fontWeight:700,fontSize:16,color:m.live?C.primary:C.white,letterSpacing:".04em"}}>{m.live?m.score:"VS"}</span></div>
                <div style={{flex:1,textAlign:"right"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.white,marginBottom:2}}>{m.away}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:"rgba(255,255,255,.4)"}}>Away</div></div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {[{k:"1",v:m.odds.h},{k:"X",v:m.odds.d},{k:"2",v:m.odds.a}].map(o=><div key={o.k} style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:8,padding:"8px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer"}}><span style={{fontFamily:FB,fontSize:10,color:"rgba(255,255,255,.4)"}}>{o.k}</span><span style={{fontFamily:FA,fontWeight:700,fontSize:14,color:C.primary}}>{o.v}</span></div>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:10}}>
          {matches.map((_,i)=><div key={`betdot-${i}`} style={{width:i===activeCard?20:6,height:6,borderRadius:3,background:i===activeCard?C.primary:"#C8D080",transition:"all .3s"}}/>)}
        </div>
        {/* FIX 6 QA — clickable betting sites with fund wallet flow */}
        <div style={{padding:"16px 16px 0"}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:15,color:C.ink,marginBottom:10}}>Fund Betting Wallet</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {sites.map((s,i)=>(
              <div key={s.name} onClick={()=>{setSelSite(s);setAmount("");setBetId("");}} style={{background:selSite?.name===s.name?C.primFaint:C.white,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,border:`1.5px solid ${selSite?.name===s.name?C.primary:C.border}`,cursor:"pointer",transition:"all .18s"}}>
                <div style={{width:44,height:44,borderRadius:12,background:s.col,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FA,fontWeight:700,fontSize:13,color:C.white}}>{s.logo}</span></div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{s.name}</div>
                  <div style={{fontFamily:FB,fontSize:11,color:grey}}>Min ₦{s.minFund.toLocaleString()} · Instant · earn pts</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={selSite?.name===s.name?C.primary:grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            ))}
          </div>
          {/* Fund wallet form */}
          {selSite&&(
            <div style={{background:C.white,borderRadius:12,padding:"16px",marginTop:14,border:`1px solid ${C.border}`,animation:"fadeIn .2s"}}>
              <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:14}}>Fund {selSite.name} Wallet</div>
              <Field label={`${selSite.name} User ID / Username`} value={betId} onChange={setBetId} placeholder={`Enter your ${selSite.name} account ID`}/>
              <div style={{height:12}}/>
              <Field label="Amount" value={amount} onChange={setAmount} inputMode="numeric" prefix="₦" hint={`Min ₦${selSite.minFund.toLocaleString()}`}/>
              <div style={{marginTop:14}}>
                <SpinnerBtn disabled={!betId.trim()||!amount||parseInt(amount)<selSite.minFund} onClick={()=>betId.trim()&&amount&&parseInt(amount)>=selSite.minFund&&setShowPin(true)}>
                  {betId.trim()&&amount&&parseInt(amount)>=selSite.minFund?`Fund ${selSite.name} — ₦${parseInt(amount).toLocaleString()}`:"Fill in account ID & amount"}
                </SpinnerBtn>
              </div>
            </div>
          )}
        </div>
        <div style={{height:24}}/>
      </div>
      {showPin&&<PinSheet amount={`₦${parseInt(amount).toLocaleString()}`} onSuccess={handleSuccess} onDismiss={()=>setShowPin(false)}/>}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
};

/* FIX 10 QA — eSIM internal catalog */
const ScreenESIM=({goTo,onAddTx})=>{
  const plans=[
    {region:"🌍 Africa",data:"1GB",validity:"7 days",price:3500,pts:175},
    {region:"🌍 Africa",data:"3GB",validity:"30 days",price:8500,pts:425,tag:"Popular"},
    {region:"🌎 Americas",data:"1GB",validity:"7 days",price:5000,pts:250},
    {region:"🌎 Americas",data:"5GB",validity:"30 days",price:18000,pts:900},
    {region:"🌏 Europe",data:"1GB",validity:"7 days",price:5500,pts:275},
    {region:"🌏 Europe",data:"5GB",validity:"30 days",price:20000,pts:1000,tag:"Best value"},
    {region:"🌏 Asia",data:"2GB",validity:"14 days",price:9000,pts:450},
    {region:"🌏 Asia",data:"10GB",validity:"30 days",price:30000,pts:1500},
  ];
  const [sel,setSel]=useState(null), [showPin,setShowPin]=useState(false);
  const handleSuccess=()=>{onAddTx({type:"esim",title:`eSIM — ${sel.region} ${sel.data}`,amt:`-₦${sel.price.toLocaleString()}`,pts:`+${sel.pts} pts`,date:"Just now",status:"Successful"});setShowPin(false);goTo("success_simple");};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="eSIM" onBack={()=>goTo("services")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:C.ink,borderRadius:14,padding:"16px 20px",display:"flex",gap:14,alignItems:"center"}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l4 4v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke={C.primary} strokeWidth="1.8" strokeLinejoin="round"/></svg>
          <div><div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.white,marginBottom:2}}>International eSIMs</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:"rgba(255,255,255,.5)"}}>No physical SIM needed · Activate instantly</div></div>
        </div>
        <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,letterSpacing:".04em",textTransform:"uppercase"}}>Select a Plan</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {plans.map((p,i)=>(
            <div key={p.name||i} onClick={()=>setSel(p)} style={{background:sel===p?C.primFaint:C.white,borderRadius:12,border:`1.5px solid ${sel===p?C.primary:C.border}`,padding:"14px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative"}}>
              {p.tag&&<div style={{position:"absolute",top:-1,right:10,background:p.tag==="Best value"?C.ink:C.primary,borderRadius:"0 0 6px 6px",padding:"2px 8px"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:9,color:p.tag==="Best value"?C.primary:C.ink,letterSpacing:".04em"}}>{p.tag.toUpperCase()}</span></div>}
              <div>
                <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{p.region} · {p.data}</div>
                <div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>Valid {p.validity}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:FA,fontWeight:700,fontSize:16,color:C.ink}}>₦{p.price.toLocaleString()}</div>
                <span style={{fontFamily:FB,fontWeight:600,fontSize:10,color:C.olive,background:C.primXlt,borderRadius:4,padding:"1px 6px"}}>+{p.pts} pts</span>
              </div>
            </div>
          ))}
        </div>
        <SpinnerBtn disabled={!sel} onClick={()=>sel&&setShowPin(true)}>
          {sel?`Buy eSIM — ₦${sel.price.toLocaleString()}`:"Select a plan to continue"}
        </SpinnerBtn>
      </div>
      {showPin&&<PinSheet amount={`₦${sel?.price?.toLocaleString()}`} onSuccess={handleSuccess} onDismiss={()=>setShowPin(false)}/>}
    </div>
  );
};

const ScreenSuccessSimple=({goTo,pts=30})=>{
  const [count,setCount]=useState(4);
  useEffect(()=>{const id=setInterval(()=>setCount(c=>{if(c<=1){clearInterval(id);goTo("home");return 0;}return c-1;}),1000);return()=>clearInterval(id);},[]);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.white,padding:"32px 24px",gap:16}}>
      <div style={{position:"relative",width:88,height:88}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",background:C.primXlt,animation:"pulse 1.6s ease-out infinite"}}/>
        <div style={{position:"absolute",inset:10,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      </div>
      <div style={{textAlign:"center"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:22,color:C.ink,marginBottom:6}}>Payment Successful!</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey}}>Your transaction was processed instantly.</div></div>
      <div style={{background:C.primFaint,borderRadius:12,padding:"14px 24px",border:`1px solid ${C.primXlt}`,textAlign:"center"}}><div style={{fontFamily:FA,fontWeight:700,fontSize:28,color:C.olive}}>+{pts} pts</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:C.olive}}>Points earned</div></div>
      <button onClick={()=>goTo("home")} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Back to Home</button>
      <span style={{fontFamily:FB,fontWeight:400,fontSize:12,color:C.placeholder}}>Returning in {count}s…</span>
    </div>
  );
};


const ScreenTerms=({goTo})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
    <ScreenHeader title="Terms & Privacy" onBack={()=>goTo("profile")}/>
    <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
      {[
        {heading:"Terms of Service",body:"By using Ahzarman, you agree to use the platform solely for lawful bill payments, airtime, data, and related services. Ahzarman reserves the right to suspend accounts engaged in fraudulent activity. All transactions are final unless a dispute is raised within 24 hours."},
        {heading:"Privacy Policy",body:"Ahzarman collects your phone number, email, and transaction data to deliver services and improve your experience. We do not sell your data to third parties. Data is encrypted at rest and in transit using AES-256 and TLS 1.3."},
        {heading:"Points & Rewards",body:"Points are earned on qualifying transactions and expire after 12 months of account inactivity. Ahzarman reserves the right to adjust point values with 30 days' notice."},
        {heading:"Contact",body:"For legal enquiries, contact legal@ahzarman.app or call 08039930607."},
      ].map((s,i)=>(
        <div key={s.heading} style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.ink,marginBottom:8}}>{s.heading}</div>
          <div style={{fontFamily:FB,fontWeight:400,fontSize:13,color:grey,lineHeight:1.7}}>{s.body}</div>
        </div>
      ))}
    </div>
  </div>
);
const ScreenContactUs=({goTo})=>{
  const [subject,setSubject]=useState(""), [message,setMessage]=useState(""), [sending,setSending]=useState(false), [sent,setSent]=useState(false);
  const handleSend=()=>{if(!subject||!message)return;setSending(true);setTimeout(()=>{setSending(false);setSent(true);setSubject("");setMessage("");setTimeout(()=>setSent(false),3000);},1600);};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Contact Us" onBack={()=>goTo("profile")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:C.ink,borderRadius:16,padding:"20px",display:"flex",gap:14,alignItems:"center"}}>
          <div style={{width:52,height:52,borderRadius:14,background:`${C.primary}22`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={C.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <div><div style={{fontFamily:FB,fontWeight:700,fontSize:16,color:C.white,marginBottom:4}}>We're here to help</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:"rgba(255,255,255,.5)"}}>Avg: 5 min WhatsApp · 2hr email</div></div>
        </div>
        <div style={{background:C.white,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
          {[{icon:"💬",label:"WhatsApp",sub:"Typically replies in 5 min",badge:"Fastest"},{icon:"✉️",label:"Email",sub:"Ahzarmanltd@gmail.com",badge:null},{icon:"📞",label:"Phone",sub:"08039930607 · Mon–Fri 8am–6pm",badge:null}].map((ch,i,arr)=>(
            <div key={ch.label} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none",cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:10,background:C.primFaint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{ch.icon}</div>
              <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{ch.label}</span>{ch.badge&&<div style={{background:"#25D36618",borderRadius:5,padding:"1px 7px"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:10,color:"#25D366"}}>{ch.badge}</span></div>}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>{ch.sub}</div></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          ))}
        </div>
        <div style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:14}}>Send a message</div>
          <Field label="Subject" value={subject} onChange={setSubject}/>
          <div style={{height:12}}/>
          <Field label="Message" value={message} onChange={setMessage} multiline/>
          <div style={{height:12}}/>
          {sent&&<div style={{background:"#EAFAF1",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",gap:8,border:"1px solid #A9DFBF"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={C.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.success}}>Sent!</span></div>}
          <SpinnerBtn loading={sending} disabled={!subject||!message} onClick={handleSend}>Send Message</SpinnerBtn>
        </div>
      </div>
    </div>
  );
};

const ScreenPaymentSettings=({goTo})=>{
  const [autoRetry,setAutoRetry]=useState(true), [emailRec,setEmailRec]=useState(true), [smsRec,setSmsRec]=useState(false), [saved,setSaved]=useState(false);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Payment Settings" onBack={()=>goTo("profile")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:C.white,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
          {[{label:"Bank Transfer",sub:"NUBAN payment",active:true},{label:"Card",sub:"Debit/credit",active:false}].map((m,i,arr)=>(
            <div key={`payrow-${i}`} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{width:20,height:20,borderRadius:10,border:`2px solid ${m.active?C.primary:C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{m.active&&<div style={{width:10,height:10,borderRadius:5,background:C.primary}}/>}</div>
              <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:m.active?600:400,fontSize:14,color:C.ink}}>{m.label}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{m.sub}</div></div>
              {m.active&&<div style={{background:C.primXlt,borderRadius:5,padding:"2px 8px"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:10,color:C.olive}}>DEFAULT</span></div>}
            </div>
          ))}
        </div>
        <div style={{background:C.white,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
          {[{icon:"🔄",label:"Auto-retry Failed",sub:"Retry once automatically",val:autoRetry,set:setAutoRetry},{icon:"📧",label:"Email Receipts",sub:"After each transaction",val:emailRec,set:setEmailRec},{icon:"📱",label:"SMS Receipts",sub:"Text after each transaction",val:smsRec,set:setSmsRec}].map((r,i,arr)=>(
            <div key={r.label} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{width:36,height:36,borderRadius:10,background:C.primFaint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{r.icon}</div>
              <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:500,fontSize:14,color:C.ink}}>{r.label}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{r.sub}</div></div>
              <Toggle value={r.val} onChange={r.set}/>
            </div>
          ))}
        </div>
        {saved&&<div style={{background:"#EAFAF1",borderRadius:10,padding:"10px 14px",display:"flex",gap:8,border:"1px solid #A9DFBF"}}><span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.success}}>✓ Settings saved!</span></div>}
        <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Save Settings</button>
      </div>
    </div>
  );
};

const ScreenBeneficiaries=({goTo,beneficiaries,onSave,onDelete})=>{
  const [showAdd,setShowAdd]=useState(false), [newNet,setNewNet]=useState("MTN"), [newName,setNewName]=useState(""), [newPhone,setNewPhone]=useState(""), [saving,setSaving]=useState(false);
  const handleAdd=()=>{if(!newName.trim()||newPhone.length!==11)return;setSaving(true);setTimeout(()=>{onSave({id:Date.now(),name:newName.trim(),phone:newPhone,network:newNet});setNewName("");setNewPhone("");setNewNet("MTN");setShowAdd(false);setSaving(false);},800);};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Beneficiaries" onBack={()=>goTo("profile")} rightSlot={<button onClick={()=>setShowAdd(v=>!v)} style={{width:36,height:36,borderRadius:10,background:showAdd?C.primXlt:C.primary,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d={showAdd?"M18 6L6 18M6 6l12 12":"M12 5v14M5 12h14"} stroke={showAdd?C.olive:C.ink} strokeWidth="2.5" strokeLinecap="round"/></svg></button>}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 32px",display:"flex",flexDirection:"column",gap:14}}>
        {showAdd&&(
          <div style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
            <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:14}}>Add Beneficiary</div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>{["MTN","Airtel","Glo","9mobile"].map(n=><button key={n} onClick={()=>setNewNet(n)} style={{flex:1,height:34,borderRadius:7,border:"none",cursor:"pointer",background:newNet===n?NET_COL[n]:C.disabled,fontFamily:FB,fontWeight:newNet===n?700:400,fontSize:11,color:newNet===n?NET_TXT[n]:grey}}>{n}</button>)}</div>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" style={{width:"100%",height:46,borderRadius:8,border:`1.5px solid ${newName?C.primary:C.border}`,padding:"0 12px",fontFamily:FB,fontSize:14,color:C.ink,background:C.white,boxSizing:"border-box",outline:"none",marginBottom:10}}/>
            <input value={newPhone} onChange={e=>setNewPhone(e.target.value.replace(/\D/g,"").slice(0,11))} inputMode="tel" placeholder="Phone (11 digits)" style={{width:"100%",height:46,borderRadius:8,border:`1.5px solid ${newPhone.length===11?"#C8D080":C.border}`,padding:"0 12px",fontFamily:FA,fontSize:15,color:C.ink,background:C.white,boxSizing:"border-box",outline:"none",marginBottom:14}}/>
            <button onClick={handleAdd} disabled={!newName.trim()||newPhone.length!==11||saving} style={{width:"100%",height:44,background:!newName.trim()||newPhone.length!==11?C.disabled:C.primary,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:14,color:!newName.trim()||newPhone.length!==11?C.disabledTxt:C.ink,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {saving?<><Spinner size={16} color={C.disabledTxt}/>Saving…</>:"Save Beneficiary"}
            </button>
          </div>
        )}
        {beneficiaries.length>0?(
          <div style={{background:C.white,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {beneficiaries.map((b,i)=>(
              <div key={b.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<beneficiaries.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{width:44,height:44,borderRadius:22,background:NET_COL[b.network]||C.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FB,fontWeight:700,fontSize:18,color:NET_TXT[b.network]||C.ink}}>{b.name[0]}</span></div>
                <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{b.name}</div><div style={{fontFamily:FA,fontWeight:400,fontSize:12,color:grey}}>{b.phone} · {b.network}</div></div>
                <button onClick={()=>onDelete(b.id)} style={{width:34,height:34,borderRadius:8,background:"#FDF0EF",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              </div>
            ))}
          </div>
        ):(
          <EmptyState icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke={C.olive} strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>} title="No saved beneficiaries" subtitle="Save a contact to quickly send airtime or data." cta={{label:"Add Beneficiary",onClick:()=>setShowAdd(true)}}/>
        )}
      </div>
    </div>
  );
};

/* ── PHONE SHELL ─────────────────────────────────────────────── */
const Phone=({screen,goTo,state})=>{
  const {beneficiaries,onSaveBenef,onDeleteBenef,dataState,setDataState,transactions,onAddTx,successPts}=state;
  const screens={
    onboarding:       <ScreenOnboarding       goTo={goTo}/>,
    sign_up:          <ScreenSignUp           goTo={goTo}/>,
    sign_in:          <ScreenSignIn           goTo={goTo}/>,
    home:             <ScreenHome             goTo={goTo} transactions={transactions}/>,
    services:         <ScreenServices         goTo={goTo}/>,
    rewards:          <ScreenRewards          goTo={goTo}/>,
    profile:          <ScreenProfile          goTo={goTo} onLogout={()=>{setTransactions(SAMPLE_TXS);setBeneficiaries([{id:1,name:'Mum',phone:'08034567890',network:'MTN'},{id:2,name:'Office',phone:'09012345678',network:'Airtel'}]);setDataState({tab:'hot',network:'MTN',plan:null,phone:''});}}/>,
    history:          <ScreenHistory          goTo={goTo} transactions={transactions}/>,
    notifications:    <ScreenNotifications    goTo={goTo} fromProfile={false}/>,
    notifications_from_profile: <ScreenNotifications goTo={goTo} fromProfile={true}/>,
    airtime:          <ScreenAirtime          goTo={goTo} beneficiaries={beneficiaries} onSaveBenef={onSaveBenef} onAddTx={onAddTx}/>,
    data:             <ScreenData             goTo={goTo} dataState={dataState} setDataState={setDataState} onAddTx={onAddTx}/>,
    electricity:      <ScreenElectricity      goTo={goTo} onAddTx={onAddTx}/>,
    elec_success:     <ScreenElecSuccess      goTo={goTo}/>,
    tv:               <ScreenTV               goTo={goTo} onAddTx={onAddTx}/>,
    giftcards:        <ScreenGiftCards        goTo={goTo} onAddTx={onAddTx}/>,
    flights:          <ScreenFlights          goTo={goTo} onAddTx={onAddTx}/>,
    betting:          <ScreenBetting          goTo={goTo} onAddTx={onAddTx}/>,
    esim:             <ScreenESIM             goTo={goTo} onAddTx={onAddTx}/>,
    success_simple:   <ScreenSuccessSimple    goTo={goTo} pts={successPts}/>,
    share_points:     <ScreenSharePoints      goTo={goTo}/>,
    redeem_points:    <ScreenRedeemPoints     goTo={goTo}/>,
    refer:            <ScreenRefer            goTo={goTo}/>,
    contact_us:       <ScreenContactUs        goTo={goTo}/>,
    payment_settings: <ScreenPaymentSettings  goTo={goTo}/>,
    beneficiaries:    <ScreenBeneficiaries    goTo={goTo} beneficiaries={beneficiaries} onSave={onSaveBenef} onDelete={onDeleteBenef}/>,
    personal_info:    <ScreenPersonalInfo     goTo={goTo}/>,
    security:         <ScreenSecurity         goTo={goTo}/>,
    terms:            <ScreenTerms            goTo={goTo}/>,
  };
  return(
    <div style={{width:390,height:844,background:C.white,borderRadius:52,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.28),0 0 0 1px rgba(0,0,0,0.06),inset 0 0 0 2px rgba(255,255,255,0.8)",display:"flex",flexDirection:"column",position:"relative"}}>
      <div style={{position:"relative",flexShrink:0}}>
        <StatusBar dark={true}/>
        <div style={{position:"absolute",top:8,left:"50%",transform:"translateX(-50%)",width:120,height:34,background:C.ink,borderRadius:20,zIndex:150,pointerEvents:"none"}}/>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {screens[screen]??screens.home}
      </div>
    </div>
  );
};

export default function App(){
  const [screen,setScreen]=useState("onboarding");
  const [beneficiaries,setBeneficiaries]=useState([{id:1,name:"Mum",phone:"08034567890",network:"MTN"},{id:2,name:"Office",phone:"09012345678",network:"Airtel"}]);
  const [dataState,setDataState]=useState({tab:"hot",network:"MTN",plan:null,phone:""});
  const [transactions,setTransactions]=useState(SAMPLE_TXS);
  const onSaveBenef=b=>setBeneficiaries(p=>[...p,b]);
  const onDeleteBenef=id=>setBeneficiaries(p=>p.filter(b=>b.id!==id));
  const onAddTx=tx=>setTransactions(p=>[tx,...p]);

  /* Route notifications from profile correctly */
  const [successPts,setSuccessPts]=useState(30);
  const goTo=(s,params={})=>{
    if(params?.pts) setSuccessPts(params.pts);
    if(s==="notifications"&&screen==="profile") setScreen("notifications_from_profile");
    else setScreen(s);
  };

  const state={beneficiaries,onSaveBenef,onDeleteBenef,dataState,setDataState,transactions,onAddTx,successPts};
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#f0f5e2 0%,#e4efca 50%,#d6e8b4 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px",fontFamily:FB}}>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=switzer@300,400,500,600,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        input,textarea{caret-color:#A3B708;outline:none;}
        button:not(:disabled):active{transform:scale(0.97);}
        ::-webkit-scrollbar{display:none;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        @keyframes pulse{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.5);opacity:0}100%{transform:scale(1.5);opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{marginBottom:12,background:"#020202",borderRadius:10,padding:"8px 16px",maxWidth:390,textAlign:"center"}}>
        <span style={{fontFamily:FB,fontWeight:700,fontSize:12,color:C.primary,letterSpacing:".06em"}}>AHZARMAN v2 — AUDIT FIXES APPLIED</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{width:32,height:32,borderRadius:9,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M3 9l5 5 7-8" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <span style={{fontFamily:FB,fontWeight:700,fontSize:18,color:C.textColor,letterSpacing:"-0.02em"}}>Ahzarman</span>
      </div>
      <Phone screen={screen} goTo={goTo} state={state}/>
      <div style={{marginTop:12,display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",maxWidth:390}}>
        {[["🚀","onboarding"],["📝","sign_up"],["🔐","sign_in"],["🏠","home"],["🛍","services"],["🏆","rewards"],["👤","profile"],["📱","airtime"],["📡","data"],["⚡","electricity"],["📺","tv"],["🎁","giftcards"],["✈️","flights"],["⚽","betting"],["📶","esim"],["🎯","share_points"],["💎","redeem_points"],["🤝","refer"],["📋","history"]].map(([e,s])=>(
          <button key={s} onClick={()=>setScreen(s)} style={{padding:"4px 10px",borderRadius:16,border:"none",cursor:"pointer",background:screen===s?C.primary:"rgba(255,255,255,.6)",fontFamily:FB,fontSize:10,fontWeight:screen===s?700:400,color:screen===s?C.ink:"#888"}}>{e}</button>
        ))}
      </div>
    </div>
  );
}
