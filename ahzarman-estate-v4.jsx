import { useState, useEffect, useRef } from "react";

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

const ESTATES = [
  { id:"sunrise", name:"Sunrise Estate", city:"Lekki Phase 1, Lagos", members:412, code:"SUN-2847", color:"#E8A020", colorLight:"#FEF5E7", emoji:"🌅", description:"A gated community of 412 households in Lekki Phase 1. Community points fund shared amenities and estate maintenance." },
  { id:"greenview", name:"Greenview Gardens", city:"Wuse 2, Abuja", members:287, code:"GRN-1193", color:"#27AE60", colorLight:"#EAFAF1", emoji:"🌿", description:"287 homes in the heart of Wuse 2. Pooled estate points subsidise communal electricity and water bills." },
  { id:"horizon", name:"Horizon Court", city:"GRA, Port Harcourt", members:165, code:"HRZ-5521", color:"#2980B9", colorLight:"#EBF5FB", emoji:"🏙️", description:"165-unit high-rise community in Port Harcourt GRA. Estate points vote on security upgrades and facility repairs." },
];

const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
const today = () => { const d=new Date(); d.setHours(0,0,0,0); return d; };
const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
const sameDay = (a,b) => a&&b&&a.toDateString()===b.toDateString();
const fmtDate = d => d?d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}):"";
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];

const TX_ICONS = {
  airtime:     { bg:"#D9EAF1", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.37 1.05-.19 1.1.4 2.3.6 3.55.6.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C9.6 21 3 14.4 3 6c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.3.2 2.5.6 3.6-.17.33-.09.73.2.97z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" fill="none"/></svg>, col:"#1A6A8A" },
  data:        { bg:"#FAE0DB", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="19" r="2" fill={c}/><path d="M5 12a7 7 0 0 1 7 7" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none"/><path d="M5 6a13 13 0 0 1 13 13" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none"/></svg>, col:"#A93226" },
  electricity: { bg:"#EDDAF0", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.09 12.6A1 1 0 0 0 5 14h7l-1 8 8.91-10.6A1 1 0 0 0 19 10h-7l1-8z" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>, col:"#7D3C98" },
  tv:          { bg:"#FFF8D6", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="14" rx="2" stroke={c} strokeWidth="1.6"/><path d="M8 20h8M12 18v2" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>, col:"#9A7D0A" },
  giftcard:    { bg:"#D9F1DB", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="2" y="9" width="20" height="13" rx="2" stroke={c} strokeWidth="1.6"/><path d="M16 9V7a4 4 0 0 0-8 0v2" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><line x1="2" y1="14" x2="22" y2="14" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><line x1="12" y1="9" x2="12" y2="22" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>, col:"#1E8449" },
  flights:     { bg:"#FADBDB", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>, col:"#B03A2E" },
  betting:     { bg:"#FAE0DB", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="1" y="6" width="22" height="13" rx="2" stroke={c} strokeWidth="1.6"/><circle cx="12" cy="12.5" r="3" stroke={c} strokeWidth="1.6"/><path d="M5 9.5v6M19 9.5v6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>, col:"#A04000" },
  esim:        { bg:"#D9E2F1", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l4 4v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/></svg>, col:"#1A3A8A" },
  points:      { bg:"#EDF1CE", el:(c)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="5" stroke={c} strokeWidth="1.6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>, col:"#919E2D" },
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
        <svg width="18" height="12" viewBox="0 0 18 12">{[0,3,6,9].map((x,i)=><rect key={i} x={x} y={12-3.5*(i+1)} width="2.8" height={3.5*(i+1)} rx=".8" fill={c}/>)}</svg>
        <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 9a1.5 1.5 0 1 1 0 2.5A1.5 1.5 0 0 1 8 9z" fill={c}/><path d="M3.5 5.5a6.5 6.5 0 0 1 9 0" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/><path d="M.5 2.5a11 11 0 0 1 15 0" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
        <div style={{ position:"relative", width:25, height:12 }}><div style={{ position:"absolute", inset:0, border:`1.5px solid ${c}`, borderRadius:3, opacity:.4 }}/><div style={{ position:"absolute", left:1.5, top:1.5, width:18, height:9, background:c, borderRadius:1.5 }}/><div style={{ position:"absolute", right:-2, top:4, width:2, height:4, background:c, borderRadius:1, opacity:.4 }}/></div>
      </div>
    </div>
  );
};

const ScreenHeader = ({ title, onBack, rightSlot }) => (
  <div style={{ height:56, flexShrink:0, background:C.white, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", paddingLeft:4, paddingRight:12, position:"relative" }}>
    {onBack&&<button onClick={onBack} style={{ width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", background:"none", border:"none", cursor:"pointer", borderRadius:10 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
    {title&&<span style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", fontFamily:FB, fontWeight:600, fontSize:17, color:C.ink, whiteSpace:"nowrap", pointerEvents:"none" }}>{title}</span>}
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

const Skeleton=({w="100%",h=16,r=8,dark=false})=><div style={{width:w,height:h,borderRadius:r,background:dark?"rgba(255,255,255,.1)":"#F0F0F0",flexShrink:0}}/>;
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
   PAYMENT MODAL
   ══════════════════════════════════════════════════════════════ */
const AHZARMAN_ACCT={bank:"Access Bank",name:"Ahzarman Technologies Ltd",number:"0814 7263 91",sort:"044"};

const PaymentModal=({amount,label,onSuccess,onDismiss})=>{
  const [step,setStep]=useState("select");
  const [providerStage,setProviderStage]=useState("connecting");
  const [copied,setCopied]=useState(false);
  const [bankProcessing,setBankProcessing]=useState(false);
  const timerRef=useRef(null);
  useEffect(()=>{
    if(step==="opay"||step==="flutterwave"){setProviderStage("connecting");timerRef.current=setTimeout(()=>setProviderStage("ready"),2000);}
    return()=>clearTimeout(timerRef.current);
  },[step]);
  const triggerWebhook=()=>{setProviderStage("processing");timerRef.current=setTimeout(()=>{setProviderStage("done");setTimeout(()=>onSuccess(),700);},2200);};
  const handleBankConfirm=()=>{setBankProcessing(true);setTimeout(()=>onSuccess(),2400);};
  const copyAcct=()=>{navigator.clipboard?.writeText(AHZARMAN_ACCT.number.replace(/\s/g,"")).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const METHODS=[
    {id:"opay",label:"OPay",sub:"Pay via OPay wallet or card",accent:"#1B8B4B",logo:<svg width="26" height="26" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#1B8B4B"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="Arial">O</text></svg>},
    {id:"flutterwave",label:"Flutterwave",sub:"Pay with card, bank or USSD",accent:"#F5A623",logo:<svg width="26" height="26" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#F5A623"/><path d="M14 26c2-4 4-8 8-12M18 26c2-3 3-6 6-10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>},
    {id:"bank",label:"Bank Transfer",sub:"Transfer to Ahzarman account",accent:"#1A4D8F",logo:<svg width="26" height="26" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#1A4D8F"/><rect x="10" y="18" width="20" height="12" rx="2" fill="white" opacity=".9"/><polygon points="20,8 30,18 10,18" fill="white" opacity=".9"/></svg>},
  ];
  const m=METHODS.find(x=>x.id===step);
  return(
    <div onClick={e=>e.target===e.currentTarget&&step==="select"&&onDismiss()} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:"22px 22px 0 0",animation:"slideUp .28s",maxHeight:"90%",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",padding:"12px 16px 0",flexShrink:0}}>
          {step!=="select"?<button onClick={()=>{setStep("select");setProviderStage("connecting");setBankProcessing(false);}} style={{width:32,height:32,borderRadius:16,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>:<div style={{width:32}}/>}
          <div style={{flex:1,display:"flex",justifyContent:"center"}}><div style={{width:40,height:4,borderRadius:2,background:"#E0E0E0"}}/></div>
          <button onClick={onDismiss} style={{width:32,height:32,borderRadius:16,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke={grey} strokeWidth="2" strokeLinecap="round"/></svg></button>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {step==="select"&&<div style={{padding:"12px 20px 32px",display:"flex",flexDirection:"column",gap:16}}>
            <div style={{textAlign:"center"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:18,color:C.ink,marginBottom:4}}>Choose Payment Method</div><div style={{fontFamily:FB,fontWeight:400,fontSize:13,color:grey}}>Pay <span style={{fontFamily:FA,fontWeight:700,color:C.ink}}>{amount}</span>{label?` · ${label}`:""}</div></div>
            {METHODS.map(m=><div key={m.id} onClick={()=>setStep(m.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"16px",borderRadius:14,border:`1.5px solid ${C.border}`,background:C.white,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              {m.logo}<div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.ink}}>{m.label}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>{m.sub}</div></div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={C.placeholder} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>)}
          </div>}
          {(step==="opay"||step==="flutterwave")&&m&&<div>
            <div style={{background:m.accent,borderRadius:"16px 16px 0 0",padding:"18px 20px",display:"flex",alignItems:"center",gap:12}}>
              {m.logo}<div><div style={{fontFamily:FB,fontWeight:700,fontSize:16,color:"white"}}>{m.label}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(255,255,255,.7)"}}>Secure checkout</div></div>
              <div style={{marginLeft:"auto",background:"rgba(255,255,255,.18)",borderRadius:8,padding:"4px 12px"}}><span style={{fontFamily:FA,fontWeight:700,fontSize:15,color:"white"}}>{amount}</span></div>
            </div>
            <div style={{padding:"20px"}}>
              {providerStage==="connecting"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"20px 0"}}><Spinner size={32} color={m.accent}/><div style={{fontFamily:FB,fontWeight:500,fontSize:14,color:grey}}>Connecting to {m.label}…</div></div>}
              {providerStage==="ready"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:"#F8F9F6",borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:FB,fontSize:14,color:C.ink}}>Amount</span><span style={{fontFamily:FA,fontWeight:700,fontSize:18,color:m.accent}}>{amount}</span></div>
                </div>
                <button onClick={()=>triggerWebhook(step)} style={{width:"100%",height:52,background:m.accent,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:"white"}}>Confirm Payment — {amount}</button>
              </div>}
              {providerStage==="processing"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"20px 0"}}><Spinner size={32} color={m.accent}/><div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>Processing…</div></div>}
              {providerStage==="done"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"16px 0"}}>
                <div style={{width:56,height:56,borderRadius:28,background:"#EAFAF1",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={C.success}/><path d="M7 12l4 4 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                <div style={{fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Payment confirmed!</div>
              </div>}
            </div>
          </div>}
          {step==="bank"&&<div>
            <div style={{background:"#1A4D8F",borderRadius:"16px 16px 0 0",padding:"18px 20px"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:16,color:"white"}}>Bank Transfer</div><div style={{fontFamily:FB,fontSize:11,color:"rgba(255,255,255,.7)"}}>Transfer exactly {amount}</div></div>
            <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:"linear-gradient(135deg,#1A4D8F,#0D3060)",borderRadius:14,padding:"20px"}}>
                <div style={{fontFamily:FB,fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:4}}>Transfer to</div>
                <div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:"white"}}>{AHZARMAN_ACCT.name}</div>
                <div style={{fontFamily:FA,fontWeight:700,fontSize:22,color:"white",margin:"10px 0 4px"}}>{AHZARMAN_ACCT.number}</div>
                <div style={{fontFamily:FB,fontSize:13,color:"rgba(255,255,255,.7)",marginBottom:12}}>{AHZARMAN_ACCT.bank}</div>
                <button onClick={copyAcct} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:12,color:"white"}}>{copied?"Copied! ✓":"Copy Account Number"}</button>
              </div>
              {bankProcessing?<div style={{display:"flex",justifyContent:"center",padding:"12px 0"}}><Spinner size={28} color="#1A4D8F"/></div>:<button onClick={handleBankConfirm} style={{width:"100%",height:52,background:"#1A4D8F",border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:15,color:"white"}}>I've Sent the Transfer ✓</button>}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
};
const PinSheet=({amount,label,onSuccess,onDismiss})=><PaymentModal amount={amount} label={label} onSuccess={onSuccess} onDismiss={onDismiss}/>;

/* ── COUNTRY SHEET ──────────────────────────────────────────── */
const COUNTRIES=[
  {code:"NG",name:"Nigeria",flag:"🇳🇬",currency:"NGN",cards:["Netflix","Spotify","iTunes","Amazon","Google Play"]},
  {code:"US",name:"United States",flag:"🇺🇸",currency:"USD",cards:["Amazon","Apple","Google Play","Steam","Xbox","Netflix"]},
  {code:"GB",name:"United Kingdom",flag:"🇬🇧",currency:"GBP",cards:["Amazon UK","iTunes UK","Google Play","Netflix"]},
  {code:"GH",name:"Ghana",flag:"🇬🇭",currency:"GHS",cards:["Netflix","Spotify","Google Play"]},
  {code:"ZA",name:"South Africa",flag:"🇿🇦",currency:"ZAR",cards:["Netflix","iTunes","Google Play"]},
];
const CARD_COLORS={Netflix:"#E50914",Spotify:"#1DB954",iTunes:"#FC3C44",Apple:"#555",Amazon:"#FF9900","Amazon UK":"#FF9900","iTunes UK":"#FC3C44","Google Play":"#34A853",Xbox:"#107C10",Steam:"#1B2838"};

/* ── CALENDAR ───────────────────────────────────────────────── */
const CalendarPicker=({selected,minDate,onSelect,onClose})=>{
  const min=minDate??today();
  const init=selected?new Date(selected.getFullYear(),selected.getMonth(),1):new Date(today().getFullYear(),today().getMonth(),1);
  const [vm,setVm]=useState(init);
  const first=vm.getDay(),days=new Date(vm.getFullYear(),vm.getMonth()+1,0).getDate();
  const cells=[...Array(first).fill(null),...Array.from({length:days},(_,i)=>new Date(vm.getFullYear(),vm.getMonth(),i+1))];
  while(cells.length%7!==0)cells.push(null);
  const isDisabled=d=>d&&d<min,isSel=d=>d&&sameDay(d,selected),isTod=d=>d&&sameDay(d,today());
  return (
    <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",overflow:"hidden",marginTop:8}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 10px"}}>
        <button onClick={()=>{const p=new Date(vm.getFullYear(),vm.getMonth()-1,1);if(p>=new Date(min.getFullYear(),min.getMonth(),1))setVm(p);}} style={{width:36,height:36,borderRadius:8,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        <span style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.ink}}>{MONTHS[vm.getMonth()]} {vm.getFullYear()}</span>
        <button onClick={()=>setVm(new Date(vm.getFullYear(),vm.getMonth()+1,1))} style={{width:36,height:36,borderRadius:8,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 10px"}}>
        {DAYS.map(d=><div key={d} style={{textAlign:"center",padding:"4px 0",fontFamily:FB,fontWeight:600,fontSize:11,color:grey}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"4px 10px 14px",gap:"2px 0"}}>
        {cells.map((d,i)=>{if(!d)return <div key={i}/>;const dis=isDisabled(d),sel=isSel(d),tod=isTod(d);return(
          <div key={i} onClick={()=>!dis&&(onSelect(d),onClose())} style={{height:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:dis?"not-allowed":"pointer",borderRadius:10,background:sel?C.primary:"transparent"}}>
            <span style={{fontFamily:FA,fontWeight:sel?700:400,fontSize:13,color:sel?C.ink:dis?C.placeholder:tod?C.primary:C.ink}}>{d.getDate()}</span>
          </div>
        );})}
      </div>
    </div>
  );
};

/* ── MARKETING CAROUSEL ─────────────────────────────────────── */
const MarketingCarousel=({goTo})=>{
  const [idx,setIdx]=useState(0),ptrX=useRef(null),interacted=useRef(null);
  const promos=[
    {bg:"#020202",titleCol:C.primLt,label:"REFERRAL BONUS",title:"Refer friends. They get light. You get points.",sub:"₦2,500 points per friend",cta:"Refer Now",screen:"refer"},
    {bg:"#1C3A1C",titleCol:"#F8F9F6",label:"EARN ON EVERY PURCHASE",title:"Every ₦5,000 electricity = 500 points",sub:"Redeemable as free electricity",cta:"Buy Electricity",screen:"electricity"},
    {bg:"#1A1A3A",titleCol:"#F0F0FF",label:"POINTS GIFTING",title:"Share your points with a neighbour",sub:"Transfer to any Ahzarman user",cta:"Share Points",screen:"share_points"},
  ];
  useEffect(()=>{const id=setInterval(()=>{if(!interacted.current||Date.now()-interacted.current>4000)setIdx(p=>(p+1)%promos.length);},4000);return()=>clearInterval(id);},[]);
  const p=promos[idx];
  return (
    <div style={{padding:"0 16px"}}>
      <div onPointerDown={e=>ptrX.current=e.clientX} onPointerUp={e=>{const dx=e.clientX-ptrX.current;interacted.current=Date.now();if(Math.abs(dx)>40){setIdx(prev=>dx<0?(prev+1)%promos.length:(prev-1+promos.length)%promos.length);}else{goTo(p.screen);}ptrX.current=null;}} style={{height:130,background:p.bg,borderRadius:12,overflow:"hidden",cursor:"pointer",display:"flex",alignItems:"stretch",position:"relative",userSelect:"none"}}>
        <div style={{flex:1,padding:"14px 0 14px 16px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div><span style={{fontFamily:FB,fontWeight:700,fontSize:9,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(255,255,255,.35)",display:"block",marginBottom:5}}>{p.label}</span><span style={{fontFamily:FB,fontWeight:700,fontSize:14,lineHeight:"118%",color:p.titleCol,display:"block",marginBottom:5}}>{p.title}</span><span style={{fontFamily:FB,fontWeight:300,fontSize:11,color:"rgba(255,255,255,.5)"}}>{p.sub}</span></div>
          <div style={{background:C.white,borderRadius:6,padding:"5px 14px",alignSelf:"flex-start"}}><span style={{fontFamily:FB,fontWeight:600,fontSize:11,color:C.ink}}>{p.cta} →</span></div>
        </div>
        <div style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",gap:4}}>
          {promos.map((_,i)=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:i===idx?C.white:"rgba(255,255,255,.3)",transition:"background .3s"}}/>)}
        </div>
      </div>
    </div>
  );
};

/* ── TOKEN CARD ─────────────────────────────────────────────── */
const TokenCard=({token,meter,disco})=>{
  const [copied,setCopied]=useState(false);
  const fmtTok=r=>r.match(/.{1,4}/g)?.join(" - ")??r;
  return (
    <div style={{borderRadius:16,overflow:"hidden"}}>
      <div style={{background:"linear-gradient(135deg,#141414,#1E1E1E 60%,#222810)",padding:"20px 20px 16px"}}>
        <div style={{fontFamily:FA,fontWeight:700,fontSize:21,letterSpacing:".06em",color:C.white,lineHeight:1.45,marginBottom:8,wordBreak:"break-all"}}>{fmtTok(token)}</div>
        <div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(255,255,255,.38)"}}>Meter: {meter} · {disco}</div>
      </div>
      <div style={{background:"#1A1A1A",display:"flex"}}>
        <button onClick={()=>{try{navigator.clipboard.writeText(token);}catch(_){}setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{flex:1,height:48,background:copied?"rgba(163,183,8,.15)":"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          <span style={{fontFamily:FB,fontWeight:600,fontSize:13,color:copied?C.primary:"rgba(255,255,255,.65)"}}>{copied?"Copied! ✓":"Copy Token"}</span>
        </button>
      </div>
      <div style={{background:"#181800",padding:"10px 18px"}}>
        <span style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(254,223,137,.75)"}}>Single use · Valid for 1 year · Keep this token safe</span>
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
    phone:<svg width={size} height={size} viewBox={v} fill="none"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.28-.28.7-.37 1.05-.19 1.1.4 2.3.6 3.55.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6z" {...s}/></svg>,
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

/* ── NUMPAD ─────────────────────────────────────────────────── */
const NumPad=({onDigit,onDelete,disabled=false})=>{
  const rows=[["1","2","3"],["4","5","6"],["7","8","9"],[null,"0","del"]];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4,padding:"0 8px"}}>
      {rows.map((row,ri)=>(
        <div key={ri} style={{display:"flex",gap:4}}>
          {row.map((d,di)=>{
            if(d===null)return <div key={di} style={{flex:1,height:54}}/>;
            if(d==="del")return <button key={di} onClick={onDelete} disabled={disabled} style={{flex:1,height:54,background:"none",border:"none",cursor:"pointer",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke={C.ink} strokeWidth="1.8" strokeLinejoin="round"/><line x1="18" y1="9" x2="12" y2="15" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="9" x2="18" y2="15" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round"/></svg></button>;
            return <button key={di} onClick={()=>onDigit(d)} disabled={disabled} style={{flex:1,height:54,background:disabled?C.disabled:"#F8F9F6",border:"none",borderRadius:10,cursor:"pointer",fontFamily:FA,fontWeight:600,fontSize:22,color:disabled?C.disabledTxt:C.ink}}>{d}</button>;
          })}
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   SCREENS
   ════════════════════════════════════════════════════════════════ */
const ScreenOnboarding=({goTo})=>{
  const [idx,setIdx]=useState(0);
  const slides=[
    {title:"Airtime & Data",sub:"Buy airtime and data for any network. Every purchase earns Ahzarman points."},
    {title:"Pay for Electricity",sub:"Your prepaid token delivered within seconds of payment."},
    {title:"Earn Points",sub:"Every purchase earns points. Share them with neighbours or redeem for free electricity."},
    {title:"Gift Cards & More",sub:"Flights, betting, gift cards, cable TV — all in one app, all earning you points."},
  ];
  const s=slides[idx];
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white}}>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}}>
        <div style={{width:200,height:200,borderRadius:100,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="30" r="22" fill={C.primary} opacity=".9"/>
            <path d="M28 48c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke={C.ink} strokeWidth="3" strokeLinecap="round" fill="none"/>
            <circle cx="40" cy="30" r="8" fill={C.ink} opacity=".4"/>
          </svg>
        </div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
        {slides.map((_,i)=><div key={i} onClick={()=>setIdx(i)} style={{width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?C.primary:"#C8D080",cursor:"pointer",transition:"all .3s"}}/>)}
      </div>
      <div style={{padding:"0 28px",textAlign:"center",marginBottom:24}}>
        <h2 style={{fontFamily:FA,fontWeight:700,fontSize:22,letterSpacing:"-0.02em",color:C.textColor,margin:"0 0 8px",lineHeight:1.3}}>{s.title}</h2>
        <p style={{fontFamily:FB,fontWeight:400,fontSize:15,color:grey,margin:0,lineHeight:1.6}}>{s.sub}</p>
      </div>
      <div style={{padding:"0 16px 32px",display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={()=>idx===3?goTo("sign_up"):setIdx(idx+1)} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>{idx===3?"Create Account →":"Next"}</button>
        {idx===3?<button onClick={()=>goTo("sign_in")} style={{width:"100%",height:44,background:"none",border:"none",cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:14,color:C.olive}}>I already have an account →</button>:<button onClick={()=>goTo("sign_up")} style={{width:"100%",height:44,background:"none",border:"none",cursor:"pointer",fontFamily:FB,fontWeight:500,fontSize:14,color:grey}}>Skip</button>}
      </div>
    </div>
  );
};

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
        {step===1&&<><div><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:4}}>Welcome back 👋</div></div>
          <Field label="Phone Number" value={phone} onChange={v=>setPhone(v.replace(/\D/g,"").slice(0,11))} inputMode="numeric" prefix="🇳🇬 +234"/>
          <SpinnerBtn disabled={!validPhone} onClick={()=>validPhone&&setStep(2)}>Continue →</SpinnerBtn>
          <div style={{textAlign:"center"}}><span style={{fontFamily:FB,fontSize:13,color:grey}}>New? </span><span onClick={()=>goTo("sign_up")} style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.olive,cursor:"pointer"}}>Create account →</span></div>
        </>}
        {step===2&&<><div><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:4}}>Enter your PIN</div></div>
          <div style={{display:"flex",gap:16,justifyContent:"center",margin:"8px 0",animation:shake?"shake .5s":"none"}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:7,background:pin.length>i?(err?C.error:C.primary):C.border,transition:"background .15s"}}/>)}
          </div>
          {err&&<div style={{background:C.errorBg,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.errorBorder}`}}><span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.error}}>{err}</span></div>}
          <NumPad onDigit={onDigit} onDelete={()=>{setPin(v=>v.slice(0,-1));setErr("");}}/>
          <div style={{textAlign:"center"}}><span style={{fontFamily:FB,fontSize:11,color:C.placeholder}}>Demo PIN: <strong style={{color:C.ink}}>1234</strong></span></div>
        </>}
      </div>
    </div>
  );
};

const ScreenHome=({goTo,transactions,userEstate})=>{
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const id=setTimeout(()=>setLoading(false),1200);return()=>clearTimeout(id);},[]);
  const recent=transactions.slice(0,3);
  if(loading) return <div style={{flex:1,background:"#F8F9F6",display:"flex",alignItems:"center",justifyContent:"center"}}><Spinner size={32}/></div>;
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
        <div style={{margin:"0 16px",background:C.ink,borderRadius:16,padding:"20px 20px 18px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-50,right:-50,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${C.primary}28,transparent 70%)`,pointerEvents:"none"}}/>
          <div style={{fontFamily:FB,fontWeight:400,fontSize:12,letterSpacing:".06em",color:"rgba(255,255,255,.5)",textTransform:"uppercase",position:"relative",zIndex:2}}>Ahzarman Points</div>
          <div style={{position:"relative",zIndex:2,marginBottom:4,marginTop:4}}><span style={{fontFamily:FA,fontWeight:700,fontSize:42,letterSpacing:"-0.02em",color:C.white}}>1,850</span><span style={{fontFamily:FA,fontWeight:400,fontSize:18,color:"rgba(255,255,255,.45)",marginLeft:6}}>pts</span></div>
          <div style={{position:"relative",zIndex:2,marginBottom:18}}><span style={{fontFamily:FB,fontWeight:300,fontSize:11,color:"rgba(255,255,255,.4)"}}>= ₦1,850 electricity credit · shareable</span></div>
          <div style={{display:"flex",gap:10,position:"relative",zIndex:2}}>
            <button onClick={()=>goTo("share_points")} style={{flex:1,height:36,background:C.primary,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:12,color:C.ink}}>Share Points</button>
            <button onClick={()=>goTo("redeem_points")} style={{flex:1,height:36,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:12,color:C.white}}>Redeem</button>
          </div>
        </div>
        <div style={{height:14}}/>
        {userEstate&&(
          <div onClick={()=>goTo("estate_account")} style={{margin:"0 16px",borderRadius:14,overflow:"hidden",cursor:"pointer",marginBottom:0}}>
            <div style={{background:`linear-gradient(120deg,${userEstate.color},${userEstate.color}CC)`,padding:"13px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>{userEstate.emoji}</span>
              <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:700,fontSize:13,color:C.white}}>{userEstate.name}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(255,255,255,.75)"}}>Community Pool · {userEstate.members} residents</div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:FA,fontWeight:700,fontSize:15,color:C.white}}>+10%</div><div style={{fontFamily:FB,fontWeight:400,fontSize:9,color:"rgba(255,255,255,.7)"}}>pts contributed</div></div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,.7)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        )}
        <div style={{height:14}}/>
        <div style={{margin:"0 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontFamily:FB,fontWeight:600,fontSize:15,color:C.textColor}}>Services</span>
            <span onClick={()=>goTo("services")} style={{fontFamily:FB,fontWeight:400,fontSize:12,color:C.primary,cursor:"pointer"}}>See all →</span>
          </div>
          <div style={{background:C.white,borderRadius:10,padding:"8px 10px 12px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {SVC_LIST.map((svc,i)=>(
                <div key={i} onClick={()=>goTo(svc.screen)} style={{width:"calc((100% - 16px) / 3)",height:88,background:SVC_COLORS[svc.key],borderRadius:9,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:7}}>
                  <SvcIcon type={svc.key}/><span style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>{svc.label}</span>
                </div>
              ))}
              <div onClick={()=>goTo("services")} style={{width:"calc((100% - 16px) / 3)",height:88,background:"transparent",border:`1.5px dashed ${C.borderMd}`,borderRadius:9,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
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
          {recent.map((tx,i)=><TxRow key={i} tx={tx} isLast={i===recent.length-1}/>)}
        </div>
        <div style={{height:16}}/>
      </div>
      <BottomNav active="home" goTo={goTo}/>
    </div>
  );
};

/* ── SHARE POINTS ─────────────────────────────────────────────── */
const ScreenSharePoints=({goTo})=>{
  const [phone,setPhone]=useState(""), [note,setNote]=useState(""), [pts,setPts]=useState(""), [showPin,setShowPin]=useState(false), [done,setDone]=useState(false);
  const maxPts=1850, ptsNum=parseInt(pts)||0;
  const valid=phone.length===11&&ptsNum>=10&&ptsNum<=maxPts;
  if(done) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.white,padding:"32px 24px",gap:16}}>
      <div style={{width:80,height:80,borderRadius:40,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{textAlign:"center"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:8}}>{pts} pts sent!</div></div>
      <button onClick={()=>goTo("home")} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Back to Home</button>
    </div>
  );
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Share Points" onBack={()=>goTo("home")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:C.ink,borderRadius:14,padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:4}}>Available</div><div style={{fontFamily:FA,fontWeight:700,fontSize:28,color:C.white}}>1,850 <span style={{fontSize:16,opacity:.5}}>pts</span></div></div>
          <div style={{background:`${C.primary}22`,borderRadius:10,padding:"8px 12px"}}><div style={{fontFamily:FA,fontWeight:700,fontSize:14,color:C.primLt}}>= ₦1,850</div></div>
        </div>
        <Field label="Recipient Phone" value={phone} onChange={setPhone} inputMode="tel" hint="11-digit Ahzarman number" success={phone.length===11}/>
        <Field label="Points to Send" value={pts} onChange={v=>setPts(v.replace(/\D/g,""))} inputMode="numeric" hint="Min 10 · Max 1,850" error={ptsNum>maxPts?"Not enough points":undefined}/>
        <Field label="Add a note (optional)" value={note} onChange={setNote} multiline/>
        <SpinnerBtn disabled={!valid} onClick={()=>setShowPin(true)}>{valid?`Send ${ptsNum.toLocaleString()} pts →`:"Enter recipient and amount"}</SpinnerBtn>
      </div>
      {showPin&&<PinSheet amount={`${ptsNum} pts`} onSuccess={()=>{setShowPin(false);setDone(true);}} onDismiss={()=>setShowPin(false)}/>}
    </div>
  );
};

/* ── REDEEM POINTS ─────────────────────────────────────────────── */
const ScreenRedeemPoints=({goTo})=>{
  const [meter,setMeter]=useState(""), [pts,setPts]=useState(""), [showPin,setShowPin]=useState(false), [done,setDone]=useState(false);
  const ptsNum=parseInt(pts)||0;
  const valid=meter.length>=11&&ptsNum>=100&&ptsNum<=1850;
  if(done) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.white,padding:"32px 24px",gap:16}}>
      <div style={{width:80,height:80,borderRadius:40,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.09 12.6A1 1 0 0 0 5 14h7l-1 8 8.91-10.6A1 1 0 0 0 19 10h-7l1-8z" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{textAlign:"center"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink,marginBottom:8}}>Redeemed!</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey}}>₦{ptsNum.toLocaleString()} electricity credit applied to your meter</div></div>
      <button onClick={()=>goTo("home")} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Back to Home</button>
    </div>
  );
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Redeem Points" onBack={()=>goTo("home")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:C.ink,borderRadius:14,padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:4}}>Balance</div><div style={{fontFamily:FA,fontWeight:700,fontSize:28,color:C.white}}>1,850 <span style={{fontSize:16,opacity:.5}}>pts</span></div></div>
          <div style={{background:`${C.primary}22`,borderRadius:10,padding:"8px 12px"}}><div style={{fontFamily:FA,fontWeight:700,fontSize:14,color:C.primLt}}>= ₦1,850</div></div>
        </div>
        <div style={{background:C.white,borderRadius:12,padding:"14px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FA,fontWeight:700,fontSize:22,color:C.primary}}>1 pt = ₦1 electricity</div>
          <div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey,marginTop:4}}>Min redemption: 100 pts</div>
        </div>
        <Field label="Meter Number" value={meter} onChange={setMeter} inputMode="numeric" success={meter.length>=11}/>
        <Field label="Points to Redeem" value={pts} onChange={v=>setPts(v.replace(/\D/g,""))} inputMode="numeric" hint="Min 100 pts" error={ptsNum>1850?"Insufficient balance":undefined}/>
        <SpinnerBtn disabled={!valid} onClick={()=>setShowPin(true)}>{valid?`Redeem ${ptsNum} pts → ₦${ptsNum}`:"Complete fields"}</SpinnerBtn>
      </div>
      {showPin&&<PinSheet amount={`${ptsNum} pts`} onSuccess={()=>{setShowPin(false);setDone(true);}} onDismiss={()=>setShowPin(false)}/>}
    </div>
  );
};

/* ── REFER [FIX 1: back→profile] ───────────────────────────── */
const ScreenRefer=({goTo})=>{
  const [copied,setCopied]=useState(false);
  const code="AHZ-MERCY-2026";
  const copy=()=>{try{navigator.clipboard.writeText(code);}catch(_){}setCopied(true);setTimeout(()=>setCopied(false),2000);};
  const friends=[{name:"Tunde A.",pts:500,date:"2 days ago"},{name:"Chioma B.",pts:500,date:"Last week"}];
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      {/* FIX 1: back goes to profile, not home */}
      <ScreenHeader title="Refer & Earn" onBack={()=>goTo("profile")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:C.ink,borderRadius:16,padding:"24px 20px",textAlign:"center"}}>
          <div style={{fontFamily:FA,fontWeight:700,fontSize:32,color:C.primary,letterSpacing:"-0.02em",marginBottom:4}}>₦2,500 pts</div>
          <div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:"rgba(255,255,255,.6)",marginBottom:20}}>per friend who joins and makes a purchase</div>
          <div style={{background:"rgba(255,255,255,.08)",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:FA,fontWeight:600,fontSize:15,color:C.white,letterSpacing:".04em"}}>{code}</span>
            <button onClick={copy} style={{background:copied?C.success:C.primary,border:"none",borderRadius:8,padding:"6px 16px",cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:13,color:C.ink}}>{copied?"Copied!":"Copy"}</button>
          </div>
        </div>
        <div style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:14}}>How it works</div>
          {["Share your code with friends","Friend signs up and makes first purchase","You both earn 2,500 pts instantly"].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,marginBottom:i<2?12:0}}>
              <div style={{width:24,height:24,borderRadius:12,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FA,fontWeight:700,fontSize:12,color:C.ink}}>{i+1}</span></div>
              <span style={{fontFamily:FB,fontWeight:400,fontSize:14,color:C.body,lineHeight:1.5,paddingTop:2}}>{s}</span>
            </div>
          ))}
        </div>
        {friends.length>0&&<div style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:14}}>Friends Referred ({friends.length})</div>
          {friends.map((f,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:i<friends.length-1?12:0,marginBottom:i<friends.length-1?12:0,borderBottom:i<friends.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:18,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:16,color:C.olive}}>{f.name[0]}</span></div>
                <div><div style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.ink}}>{f.name}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{f.date}</div></div>
              </div>
              <span style={{fontFamily:FA,fontWeight:700,fontSize:14,color:C.olive}}>+{f.pts} pts</span>
            </div>
          ))}
        </div>}
        <button style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Share via WhatsApp</button>
      </div>
    </div>
  );
};

const ScreenServices=({goTo})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",position:"relative",overflow:"hidden"}}>
    <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
      <div style={{height:18}}/>
      <div style={{padding:"6px 16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink}}>Services</span>
        <div style={{background:C.primXlt,borderRadius:6,padding:"4px 10px"}}><span style={{fontFamily:FB,fontWeight:600,fontSize:11,color:C.olive}}>Every purchase earns pts</span></div>
      </div>
      <div style={{margin:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {SVC_LIST.map((svc,i)=>(
          <div key={i} onClick={()=>goTo(svc.screen)} style={{background:C.white,borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",border:`1px solid ${C.border}`}}>
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

/* ── REWARDS [FIX 3: Refer banner added] ───────────────────── */
const ScreenRewards=({goTo,userEstate})=>{
  const [selTier,setSelTier]=useState(null);
  const tiers=[
    {name:"Bronze",pts:"0–999",col:"#CD7F32",active:false,benefits:["5% points bonus","Basic services","Monthly statement"]},
    {name:"Silver",pts:"1,000–4,999",col:"#A8A9AD",active:true,benefits:["10% points bonus","Priority support","Electricity token in 5s","Points gifting enabled"]},
    {name:"Gold",pts:"5,000–14,999",col:"#D4AF37",active:false,benefits:["20% points bonus","Account manager","Zero service fees","Exclusive promos"]},
    {name:"Platinum",pts:"15,000+",col:"#2E8B57",active:false,benefits:["30% points bonus","Free monthly airtime","Zero fees forever","VIP support"]},
  ];
  const hist=[{type:"electricity",action:"Electricity payment",pts:"+250 pts",date:"Today"},{type:"airtime",action:"Referred Tunde",pts:"+500 pts",date:"Yesterday"},{type:"airtime",action:"Airtime purchase",pts:"+30 pts",date:"2 days ago"}];
  const displayed=selTier!==null?tiers[selTier]:null;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",position:"relative",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
        <div style={{height:18}}/>
        <div style={{padding:"6px 16px 18px"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink}}>Rewards</span></div>

        {/* Points card */}
        <div style={{margin:"0 16px",background:C.ink,borderRadius:16,padding:"20px",marginBottom:14}}>
          <div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Your Points</div>
          <div style={{fontFamily:FA,fontWeight:700,fontSize:38,color:C.white,marginBottom:2}}>1,850 <span style={{fontSize:18,opacity:.45,fontWeight:400}}>pts</span></div>
          <div style={{fontFamily:FB,fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:14}}>Silver tier · 3,150 pts to Gold</div>
          <div style={{height:6,background:"rgba(255,255,255,.12)",borderRadius:3,marginBottom:16}}><div style={{height:"100%",width:"37%",background:C.primary,borderRadius:3}}/></div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>goTo("share_points")} style={{flex:1,height:38,background:C.primary,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:13,color:C.ink}}>Share Points</button>
            <button onClick={()=>goTo("redeem_points")} style={{flex:1,height:38,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:13,color:C.white}}>Redeem</button>
          </div>
        </div>

        {/* FIX 3: Refer & Earn banner */}
        <div onClick={()=>goTo("refer")} style={{margin:"0 16px",marginBottom:14,borderRadius:14,background:C.ink,overflow:"hidden",cursor:"pointer",border:"1px solid rgba(163,183,8,.2)"}}>
          <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:"rgba(163,183,8,.15)",border:"1px solid rgba(163,183,8,.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:FB,fontWeight:700,fontSize:14,color:C.white}}>Refer & Earn</div>
              <div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:"rgba(255,255,255,.5)"}}>Get <span style={{color:C.primary,fontWeight:600}}>₦2,500 pts</span> for every friend you invite</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{background:C.primary,borderRadius:6,padding:"4px 10px"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:10,color:C.ink}}>2 referred</span></div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        {/* Estate community card */}
        {userEstate&&(
          <div onClick={()=>goTo("estate_account")} style={{margin:"0 16px",marginBottom:14,borderRadius:14,overflow:"hidden",cursor:"pointer",border:`1.5px solid ${userEstate.color}28`}}>
            <div style={{background:userEstate.colorLight,padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:38,height:38,borderRadius:10,background:userEstate.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>{userEstate.emoji}</div>
                <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:700,fontSize:13,color:C.ink}}>{userEstate.name}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>Estate Community Pool</div></div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={grey} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1,background:"rgba(255,255,255,.7)",borderRadius:9,padding:"10px 12px",border:`1px solid ${userEstate.color}30`}}>
                  <div style={{fontFamily:FB,fontWeight:400,fontSize:10,color:grey,marginBottom:2,textTransform:"uppercase",letterSpacing:".04em"}}>Community Pool</div>
                  <div style={{fontFamily:FA,fontWeight:700,fontSize:18,color:userEstate.color}}>24,810 <span style={{fontSize:12,fontWeight:400,color:grey}}>pts</span></div>
                </div>
                <div style={{flex:1,background:"rgba(255,255,255,.7)",borderRadius:9,padding:"10px 12px",border:`1px solid ${userEstate.color}30`}}>
                  <div style={{fontFamily:FB,fontWeight:400,fontSize:10,color:grey,marginBottom:2,textTransform:"uppercase",letterSpacing:".04em"}}>Your Share</div>
                  <div style={{fontFamily:FA,fontWeight:700,fontSize:18,color:C.olive}}>185 <span style={{fontSize:12,fontWeight:400,color:grey}}>pts</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tiers */}
        <div style={{margin:"0 16px",marginBottom:14}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.textColor,marginBottom:10}}>Tap a tier to see benefits</div>
          <div style={{display:"flex",gap:8}}>
            {tiers.map((t,i)=>(
              <div key={i} onClick={()=>setSelTier(selTier===i?null:i)} style={{flex:1,background:t.active?C.white:selTier===i?"#F5F8E8":"#F5F6F1",borderRadius:10,padding:"12px 6px",border:`1.5px solid ${selTier===i?C.primary:t.active?C.primary:"transparent"}`,textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
                <div style={{width:28,height:28,borderRadius:14,background:t.col,margin:"0 auto 6px",opacity:t.active||selTier===i?1:.5}}/>
                <div style={{fontFamily:FB,fontWeight:t.active||selTier===i?700:400,fontSize:11,color:t.active||selTier===i?C.ink:grey}}>{t.name}</div>
                <div style={{fontFamily:FB,fontWeight:300,fontSize:9,color:grey,marginTop:2}}>{t.pts}</div>
                {t.active&&<div style={{fontFamily:FB,fontWeight:700,fontSize:8,color:C.primary,marginTop:4,letterSpacing:".04em"}}>CURRENT</div>}
              </div>
            ))}
          </div>
          {displayed&&(
            <div style={{marginTop:10,background:C.white,borderRadius:10,padding:"14px",border:`1px solid ${C.border}`,animation:"fadeIn .2s"}}>
              <div style={{fontFamily:FB,fontWeight:600,fontSize:13,color:C.ink,marginBottom:10}}>{displayed.name} Benefits</div>
              {displayed.benefits.map((b,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:i<displayed.benefits.length-1?8:0}}>
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
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,paddingBottom:i<hist.length-1?14:0,marginBottom:i<hist.length-1?14:0,borderBottom:i<hist.length-1?`1px solid ${C.border}`:"none"}}>
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

/* ── PROFILE [FIX 2: Refer row + estate fallback] ──────────── */
const ScreenProfile=({goTo,userEstate})=>{
  const rows=[
    {icon:"user",label:"Personal Info",sub:"Name, email, phone",screen:"personal_info"},
    {icon:"lock",label:"Security",sub:"Change PIN, password",screen:"security"},
    {icon:"bell",label:"Notifications",sub:"Alerts & prefs",screen:"notifications"},
    {icon:"card",label:"Payment Settings",sub:"Methods, limits, receipts",screen:"payment_settings"},
    {icon:"people",label:"Beneficiaries",sub:"Saved contacts",screen:"beneficiaries"},
    /* FIX 2A: Refer row added */
    {icon:"refer",label:"Refer & Earn",sub:"Invite friends · ₦2,500 pts each",screen:"refer"},
    /* FIX 2B: Show Join an Estate when no estate */
    ...(userEstate
      ?[{icon:"estate",label:userEstate.name,sub:`Estate account · ${userEstate.members} residents`,screen:"estate_account",estateEmoji:userEstate.emoji,estateColor:userEstate.color}]
      :[{icon:"estate",label:"Join an Estate",sub:"Link your home · earn community pts",screen:"estate_account"}]
    ),
    {icon:"chat",label:"Contact Us",sub:"WhatsApp, email, phone",screen:"contact_us"},
    {icon:"doc",label:"Terms & Privacy",sub:"Legal documents",screen:null},
  ];
  const Ico=({type})=>{
    const s={stroke:C.olive,strokeWidth:"1.8",fill:"none",strokeLinecap:"round",strokeLinejoin:"round"};
    const icons={
      user:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...s}/><circle cx="12" cy="7" r="4" {...s}/></svg>,
      lock:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" {...s}/><path d="M7 11V7a5 5 0 0 1 10 0v4" {...s}/></svg>,
      bell:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" {...s}/><path d="M13.73 21a2 2 0 0 1-3.46 0" {...s}/></svg>,
      card:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="22" height="16" rx="2" {...s}/><line x1="1" y1="10" x2="23" y2="10" {...s}/></svg>,
      people:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...s}/><circle cx="9" cy="7" r="4" {...s}/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...s}/></svg>,
      /* FIX 2C: refer icon added */
      refer:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" {...s}/></svg>,
      estate:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5z" {...s}/><path d="M9 22V12h6v10" {...s}/></svg>,
      chat:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...s}/></svg>,
      doc:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...s}/><polyline points="14 2 14 8 20 8" {...s}/></svg>,
    };
    return icons[type]||icons.doc;
  };
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",position:"relative",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
        <div style={{height:18}}/>
        <div style={{padding:"6px 16px 20px"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:20,color:C.ink}}>Profile</span></div>
        <div style={{margin:"0 16px",background:C.white,borderRadius:12,padding:"18px 16px",display:"flex",alignItems:"center",gap:14,marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{width:54,height:54,borderRadius:27,background:"#E0E7AD",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FB,fontWeight:700,fontSize:22,color:C.ink}}>M</span></div>
          <div>
            <div style={{fontFamily:FB,fontWeight:600,fontSize:16,color:C.ink}}>Mercy Okafor</div>
            <div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>mercy@example.com</div>
            <div style={{marginTop:4,background:C.primXlt,borderRadius:4,padding:"2px 8px",display:"inline-block"}}><span style={{fontFamily:FB,fontWeight:600,fontSize:10,color:C.olive}}>Silver · 1,850 pts</span></div>
          </div>
        </div>
        <div style={{margin:"0 16px",background:C.white,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
          {rows.map((row,i)=>(
            <div key={i} onClick={()=>row.screen&&goTo(row.screen)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<rows.length-1?`1px solid ${C.border}`:"none",cursor:row.screen?"pointer":"default"}}>
              <div style={{width:36,height:36,borderRadius:10,background:row.estateColor||C.disabled,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {row.estateEmoji?<span style={{fontSize:18}}>{row.estateEmoji}</span>:<Ico type={row.icon}/>}
              </div>
              <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:500,fontSize:14,color:C.ink}}>{row.label}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{row.sub}</div></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={row.screen?grey:C.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          ))}
        </div>
        <div style={{height:16}}/>
        <div style={{margin:"0 16px"}}><button onClick={()=>goTo("onboarding")} style={{width:"100%",height:46,background:"#FFF1F1",border:"none",borderRadius:10,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:14,color:"#C0392B"}}>Log Out</button></div>
        <div style={{height:16}}/>
      </div>
      <BottomNav active="profile" goTo={goTo}/>
    </div>
  );
};

/* ── NOTIFICATIONS ──────────────────────────────────────────── */
const ScreenNotifications=({goTo,fromProfile=false})=>{
  const [items,setItems]=useState([
    {id:1,title:"Airtime purchased",sub:"₦500 MTN sent to 0801 234 5678",time:"2m ago",read:false},
    {id:2,title:"Points earned!",sub:"250 pts on your electricity purchase",time:"1h ago",read:false},
    {id:3,title:"Welcome to Ahzarman",sub:"Start making purchases to earn points",time:"2d ago",read:true},
  ]);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
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
      ):<EmptyState icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={C.olive} strokeWidth="2" strokeLinecap="round"/></svg>} title="You're all caught up" subtitle="No new notifications."/>}
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
      {filtered.length>0?<div style={{flex:1,overflowY:"auto",padding:"16px"}}><div style={{background:C.white,borderRadius:12,padding:"16px 14px"}}>{filtered.map((tx,i)=><TxRow key={i} tx={tx} isLast={i===filtered.length-1}/>)}</div></div>
        :<EmptyState icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>} title={active==="All"?"No transactions yet":`No ${active.toLowerCase()} transactions`} subtitle="Try a different filter" cta={active!=="All"?{label:"View All",onClick:()=>setActive("All")}:undefined}/>}
    </div>
  );
};

/* ── AIRTIME ────────────────────────────────────────────────── */
const ScreenAirtime=({goTo,onAddTx})=>{
  const [network,setNetwork]=useState("MTN"), [phone,setPhone]=useState("0801 234 5678");
  const [selAmt,setSelAmt]=useState(null), [customAmt,setCustomAmt]=useState(""), [showPin,setShowPin]=useState(false);
  const presets=[50,100,200,500,1000,2000];
  const finalAmt=selAmt!==null?presets[selAmt]:parseInt(customAmt)||0;
  const canContinue=phone.length===11&&finalAmt>=50;
  const handleSuccess=()=>{onAddTx({type:"airtime",title:`Airtime — ${network}`,amt:`-₦${finalAmt.toLocaleString()}`,pts:"+30 pts",date:"Just now",status:"Successful"});setShowPin(false);goTo("success_simple");};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white,overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Airtime" onBack={()=>goTo("services")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 24px",display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Network</div>
          <div style={{display:"flex",gap:8}}>{["MTN","Airtel","Glo","9mobile"].map(n=><button key={n} onClick={()=>setNetwork(n)} style={{flex:1,height:40,borderRadius:8,border:"none",cursor:"pointer",background:network===n?NET_COL[n]:C.disabled,fontFamily:FB,fontWeight:network===n?700:400,fontSize:12,color:network===n?NET_TXT[n]:grey}}>{n}</button>)}</div>
        </div>
        <Field label="Phone Number" value={phone} onChange={setPhone} inputMode="tel" success={phone.length===11}/>
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Quick Amounts</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {presets.map((a,i)=><div key={i} onClick={()=>{setSelAmt(i);setCustomAmt("");}} style={{width:"calc((100% - 16px) / 3)",height:48,background:selAmt===i?C.primXlt:C.disabled,border:`1px solid ${selAmt===i?C.primary:"transparent"}`,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:FA,fontWeight:600,fontSize:15,color:C.ink}}>₦{a.toLocaleString()}</span></div>)}
          </div>
        </div>
        <Field label="Or enter custom amount" value={customAmt} onChange={v=>{setCustomAmt(v.replace(/\D/g,""));setSelAmt(null);}} inputMode="numeric" prefix="₦" hint="Min ₦50"/>
        <SpinnerBtn disabled={!canContinue} onClick={()=>setShowPin(true)}>{canContinue?`Continue — ₦${finalAmt.toLocaleString()}`:"Enter phone and amount"}</SpinnerBtn>
      </div>
      {showPin&&<PinSheet amount={`₦${finalAmt.toLocaleString()}`} onSuccess={handleSuccess} onDismiss={()=>setShowPin(false)}/>}
    </div>
  );
};

/* ── ELECTRICITY ────────────────────────────────────────────── */
const ScreenElectricity=({goTo,onAddTx})=>{
  const DISCOS=[{id:"AEDC",name:"Abuja Electricity",short:"FCT · Niger · Kogi"},{id:"IKEDC",name:"Ikeja Electric",short:"Lagos — Ikeja axis"},{id:"EKEDC",name:"Eko Electricity",short:"Lagos — Island"},{id:"PHED",name:"Port Harcourt Electric",short:"Rivers · Bayelsa"},{id:"EEDC",name:"Enugu Electricity",short:"Enugu · Anambra · Imo"},{id:"BEDC",name:"Benin Electricity",short:"Edo · Delta · Ondo"},{id:"KEDC",name:"Kaduna Electric",short:"Kaduna · Zamfara"},{id:"JED",name:"Jos Electricity",short:"Plateau · Benue"},{id:"KAEDCO",name:"Kano Electric",short:"Kano · Jigawa"}];
  const [disco,setDisco]=useState(null), [showDiscoSheet,setShowDiscoSheet]=useState(false);
  const [meter,setMeter]=useState(""), [verifying,setVerifying]=useState(false), [verified,setVerified]=useState(null);
  const [amount,setAmount]=useState(""), [showPin,setShowPin]=useState(false);
  const handleVerify=()=>{if(!disco||meter.length<11)return;setVerifying(true);setTimeout(()=>{setVerifying(false);setVerified({name:"MERCY OKAFOR",address:"Plot 3, Lugbe Extension, Abuja"});},2000);};
  const handleSuccess=()=>{onAddTx({type:"electricity",title:`Electricity — ${disco?.id}`,amt:`-₦${parseInt(amount||0).toLocaleString()}`,pts:"+250 pts",date:"Just now",status:"Successful"});setShowPin(false);goTo("elec_success");};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white,overflow:"hidden",position:"relative"}}>
      <ScreenHeader title="Buy Electricity" onBack={()=>goTo("services")}/>
      <div style={{flex:1,overflowY:"auto",padding:"24px 16px",display:"flex",flexDirection:"column",gap:20}}>
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Distribution Company</div>
          <div onClick={()=>setShowDiscoSheet(true)} style={{height:56,borderRadius:10,border:`1.5px solid ${disco?"#C8D080":C.border}`,background:C.white,display:"flex",alignItems:"center",gap:12,padding:"0 14px",cursor:"pointer"}}>
            {disco?<><div style={{width:36,height:36,borderRadius:9,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FA,fontWeight:700,fontSize:9,color:C.olive}}>{disco.id}</span></div><div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{disco.name}</div><div style={{fontFamily:FB,fontSize:11,color:grey}}>{disco.short}</div></div></>:<span style={{fontFamily:FB,fontSize:14,color:C.placeholder,flex:1}}>Select your distribution company</span>}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
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
          {verified&&<div style={{marginTop:8,background:"#EAFAF1",borderRadius:8,padding:"10px 14px",border:"1px solid #A9DFBF"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:13,color:C.success}}>{verified.name}</div><div style={{fontFamily:FB,fontSize:11,color:C.success,opacity:.8}}>{verified.address}</div></div>}
        </div>
        <Field label="Amount (₦500 minimum)" value={amount} onChange={setAmount} inputMode="numeric" prefix="₦" disabled={!verified}/>
        <SpinnerBtn disabled={!verified||!amount||parseInt(amount)<500} onClick={()=>setShowPin(true)}>{verified&&amount&&parseInt(amount)>=500?`Pay ₦${parseInt(amount).toLocaleString()}`:"Complete fields"}</SpinnerBtn>
      </div>
      {showDiscoSheet&&(
        <div onClick={()=>setShowDiscoSheet(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.52)",zIndex:80,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:"20px 20px 0 0",maxHeight:"78%",display:"flex",flexDirection:"column",animation:"slideUp .28s"}}>
            <div style={{display:"flex",justifyContent:"center",padding:"10px 0 0"}}><div style={{width:40,height:4,borderRadius:2,background:"#E0E0E0"}}/></div>
            <div style={{padding:"12px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`}}><span style={{fontFamily:FB,fontWeight:700,fontSize:17,color:C.ink}}>Select DisCo</span><button onClick={()=>setShowDiscoSheet(false)} style={{width:30,height:30,borderRadius:15,background:C.disabled,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke={grey} strokeWidth="2" strokeLinecap="round"/></svg></button></div>
            <div style={{overflowY:"auto",padding:"10px 16px 28px",display:"flex",flexDirection:"column",gap:8}}>
              {DISCOS.map(d=>{const sel=disco?.id===d.id;return(
                <div key={d.id} onClick={()=>{setDisco(d);setShowDiscoSheet(false);setMeter("");setVerified(null);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1.5px solid ${sel?C.primary:C.border}`,background:sel?C.primFaint:C.white,cursor:"pointer"}}>
                  <div style={{width:44,height:44,borderRadius:10,background:sel?C.primary:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FA,fontWeight:700,fontSize:9,color:sel?C.ink:C.olive}}>{d.id}</span></div>
                  <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>{d.name}</div><div style={{fontFamily:FB,fontSize:11,color:grey}}>{d.short}</div></div>
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
        <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.ink}}>Payment Successful</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:grey}}>₦5,050 · AEDC</div></div>
        <div style={{background:C.primFaint,borderRadius:8,padding:"4px 10px"}}><span style={{fontFamily:FA,fontWeight:700,fontSize:13,color:C.olive}}>+250 pts</span></div>
      </div>
      <TokenCard token="45821937640298571634" meter="45123678901" disco="AEDC"/>
      <button onClick={()=>goTo("home")} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Back to Home</button>
    </div>
  </div>
);

const ScreenSuccessSimple=({goTo})=>{
  const [count,setCount]=useState(4);
  useEffect(()=>{const id=setInterval(()=>setCount(c=>{if(c<=1){clearInterval(id);goTo("home");return 0;}return c-1;}),1000);return()=>clearInterval(id);},[]);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.white,padding:"32px 24px",gap:16}}>
      <div style={{position:"relative",width:88,height:88}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",background:C.primXlt,animation:"pulse 1.6s ease-out infinite"}}/>
        <div style={{position:"absolute",inset:10,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      </div>
      <div style={{textAlign:"center"}}><div style={{fontFamily:FB,fontWeight:700,fontSize:22,color:C.ink,marginBottom:6}}>Payment Successful!</div><div style={{fontFamily:FB,fontWeight:400,fontSize:14,color:grey}}>Your transaction was processed instantly.</div></div>
      <div style={{background:C.primFaint,borderRadius:12,padding:"14px 24px",border:`1px solid ${C.primXlt}`,textAlign:"center"}}><div style={{fontFamily:FA,fontWeight:700,fontSize:28,color:C.olive}}>+30 pts</div><div style={{fontFamily:FB,fontSize:12,color:C.olive}}>Points earned</div></div>
      <button onClick={()=>goTo("home")} style={{width:"100%",height:50,background:C.primary,border:"none",borderRadius:12,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:16,color:C.ink}}>Back to Home</button>
      <span style={{fontFamily:FB,fontSize:12,color:C.placeholder}}>Returning in {count}s…</span>
    </div>
  );
};

/* stub screens for other services */
const ScreenStub=({title,goTo})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white}}>
    <ScreenHeader title={title} onBack={()=>goTo("services")}/>
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,padding:32}}>
      <div style={{width:64,height:64,borderRadius:32,background:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:28}}>🚧</span></div>
      <div style={{fontFamily:FB,fontWeight:600,fontSize:16,color:C.ink}}>{title}</div>
      <div style={{fontFamily:FB,fontSize:13,color:grey,textAlign:"center"}}>This screen is in your v3 source. Paste it back in to restore full functionality.</div>
      <button onClick={()=>goTo("services")} style={{height:44,padding:"0 24px",background:C.primary,border:"none",borderRadius:10,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink}}>← Back to Services</button>
    </div>
  </div>
);

const ScreenPersonalInfo=({goTo})=>{
  const [fields,setFields]=useState([{key:"name",label:"Full Name",val:"Mercy Okafor",editable:true},{key:"email",label:"Email",val:"mercy@example.com",editable:true},{key:"phone",label:"Phone",val:"0801 234 5678",editable:false},{key:"dob",label:"Date of Birth",val:"15 March 1995",editable:true}]);
  const [editing,setEditing]=useState(null), [editVal,setEditVal]=useState(""), [saved,setSaved]=useState(false);
  const saveEdit=()=>{const upd=[...fields];upd[editing]={...upd[editing],val:editVal};setFields(upd);setEditing(null);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return(<div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6"}}>
    <ScreenHeader title="Personal Info" onBack={()=>goTo("profile")}/>
    <div style={{flex:1,overflowY:"auto",padding:"20px 16px"}}>
      {saved&&<div style={{background:"#EAFAF1",borderRadius:10,padding:"10px 14px",marginBottom:14,border:"1px solid #A9DFBF"}}><span style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.success}}>✓ Changes saved!</span></div>}
      <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
        {fields.map((f,i)=>(
          <div key={i} style={{padding:"14px 16px",borderBottom:i<fields.length-1?`1px solid ${C.border}`:"none"}}>
            {editing===i?<div>
              <div style={{fontFamily:FB,fontSize:12,color:C.primary,marginBottom:6}}>{f.label}</div>
              <input value={editVal} onChange={e=>setEditVal(e.target.value)} autoFocus style={{width:"100%",height:44,borderRadius:8,border:`1.5px solid ${C.primary}`,padding:"0 12px",fontFamily:FB,fontSize:15,color:C.ink,background:C.white,boxSizing:"border-box",outline:"none"}}/>
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button onClick={saveEdit} style={{flex:1,height:36,background:C.primary,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:13,color:C.ink}}>Save</button>
                <button onClick={()=>setEditing(null)} style={{flex:1,height:36,background:C.disabled,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:13,color:grey}}>Cancel</button>
              </div>
            </div>:<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontFamily:FB,fontSize:12,color:grey,marginBottom:2}}>{f.label}</div><div style={{fontFamily:FB,fontWeight:500,fontSize:15,color:C.ink}}>{f.val}</div></div>
              {f.editable&&<button onClick={()=>{setEditing(i);setEditVal(f.val);}} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
            </div>}
          </div>
        ))}
      </div>
    </div>
  </div>);
};

/* ══════════════════════════════════════════════════════════════
   ESTATE ACCOUNT [FIX 4+5: inline join flow when no estate]
   ══════════════════════════════════════════════════════════════ */
const ScreenEstateAccount=({goTo,userEstate,estatePoints,onSetEstate})=>{
  const [tab,setTab]=useState("overview");

  // ── FIX 4: inline join state ─────────────────────────────────
  const [joinCode,setJoinCode]=useState("");
  const [joinMatch,setJoinMatch]=useState(null);
  const [joinErr,setJoinErr]=useState("");
  const [joining,setJoining]=useState(false);

  const handleJoinCode=v=>{
    const up=v.toUpperCase();
    setJoinCode(up);setJoinErr("");
    setJoinMatch(ESTATES.find(e=>e.code===up.trim())||null);
  };
  const handleJoin=()=>{
    if(!joinMatch){setJoinErr("Estate code not found. Check the code and try again.");return;}
    setJoining(true);
    setTimeout(()=>{setJoining(false);if(onSetEstate)onSetEstate(joinMatch);},1600);
  };

  if(!userEstate) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Join an Estate" onBack={()=>goTo("profile")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 40px",display:"flex",flexDirection:"column",gap:16}}>

        {/* Hero */}
        <div style={{background:C.ink,borderRadius:16,padding:"22px 20px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:`${C.primary}14`,pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-30,left:-20,width:100,height:100,borderRadius:"50%",background:"rgba(0,0,0,.1)",pointerEvents:"none"}}/>
          <div style={{fontFamily:FA,fontWeight:700,fontSize:26,color:C.primary,letterSpacing:"-0.02em",marginBottom:6,position:"relative",zIndex:2}}>Your estate.<br/>Your community.</div>
          <div style={{fontFamily:FB,fontWeight:400,fontSize:13,color:"rgba(255,255,255,.55)",lineHeight:1.7,marginBottom:16,position:"relative",zIndex:2}}>Link your home and 10% of every points earn you make automatically goes to your community pool — funding shared electricity, security upgrades, and estate maintenance voted on by residents.</div>
          <div style={{display:"flex",gap:10,position:"relative",zIndex:2}}>
            {[{icon:"⚡",label:"Shared electricity"},{icon:"🔒",label:"Security fund"},{icon:"🗳️",label:"Community vote"}].map((b,i)=>(
              <div key={i} style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:4}}>{b.icon}</div>
                <div style={{fontFamily:FB,fontWeight:500,fontSize:10,color:"rgba(255,255,255,.55)",lineHeight:1.3}}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
          <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:12}}>How the Community Pool works</div>
          {[{n:"10%",label:"of every points earn goes to the pool automatically"},{n:"Vote",label:"residents vote on how pool points are spent"},{n:"All",label:"households benefit from the improvements"}].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<2?12:0}}>
              <div style={{width:36,height:36,borderRadius:10,background:C.primXlt,border:`1px solid ${C.primary}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FA,fontWeight:700,fontSize:11,color:C.olive}}>{s.n}</span></div>
              <span style={{fontFamily:FB,fontWeight:400,fontSize:13,color:C.body,lineHeight:1.5,paddingTop:2}}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Code entry */}
        <div>
          <div style={{fontFamily:FB,fontWeight:500,fontSize:11,color:grey,marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>Enter your estate code</div>
          <Field label="Estate Code (e.g. SUN-2847)" value={joinCode} onChange={handleJoinCode} error={joinErr||undefined} success={!!joinMatch}/>
        </div>

        {/* Live estate match */}
        {joinMatch&&(
          <div style={{borderRadius:14,overflow:"hidden",border:`1.5px solid ${joinMatch.color}`,animation:"fadeIn .2s"}}>
            <div style={{background:joinMatch.color,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24}}>{joinMatch.emoji}</span>
              <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:700,fontSize:15,color:C.white}}>{joinMatch.name}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:"rgba(255,255,255,.75)"}}>{joinMatch.city}</div></div>
              <div style={{background:"rgba(255,255,255,.2)",borderRadius:8,padding:"4px 10px"}}><span style={{fontFamily:FB,fontWeight:700,fontSize:11,color:C.white}}>{joinMatch.members} residents</span></div>
            </div>
            <div style={{background:joinMatch.colorLight,padding:"12px 16px"}}>
              <div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:C.body,lineHeight:1.6,marginBottom:8}}>{joinMatch.description}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={joinMatch.color} strokeWidth="2.2" strokeLinejoin="round"/></svg>
                <span style={{fontFamily:FB,fontWeight:600,fontSize:11,color:joinMatch.color}}>10% of your points will go to this estate's pool</span>
              </div>
            </div>
          </div>
        )}

        {/* Browse estates when no code typed */}
        {!joinMatch&&!joinCode&&(
          <div style={{background:C.primFaint,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.primXlt}`}}>
            <div style={{fontFamily:FB,fontWeight:600,fontSize:12,color:C.olive,marginBottom:8}}>Demo estates — tap to autofill</div>
            {ESTATES.map((e,i)=>(
              <div key={e.id} onClick={()=>handleJoinCode(e.code)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<ESTATES.length-1?`1px solid ${C.primXlt}`:"none",cursor:"pointer"}}>
                <span style={{fontSize:20}}>{e.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.ink}}>{e.name}</div>
                  <div style={{fontFamily:FB,fontWeight:400,fontSize:11,color:grey}}>{e.city} · {e.members} residents</div>
                </div>
                <div style={{background:C.primXlt,borderRadius:6,padding:"3px 8px"}}><span style={{fontFamily:FA,fontWeight:700,fontSize:10,color:C.olive}}>{e.code}</span></div>
              </div>
            ))}
          </div>
        )}

        <SpinnerBtn loading={joining} disabled={!joinMatch} onClick={handleJoin}>
          {joining?"Linking your estate…":joinMatch?`Join ${joinMatch.name} →`:"Enter code to continue"}
        </SpinnerBtn>

        <div style={{textAlign:"center"}}>
          <span onClick={()=>goTo("profile")} style={{fontFamily:FB,fontWeight:500,fontSize:13,color:grey,cursor:"pointer"}}>← Back to Profile</span>
        </div>

      </div>
    </div>
  );

  /* ── EXISTING ESTATE VIEW (unchanged from v3) ──────────────── */
  const e=userEstate;
  const myContrib=estatePoints||0;
  const poolTotal=24810+myContrib;
  const perMember=Math.round(poolTotal/e.members);
  const activity=[{name:"Mercy O.",pts:"+185",date:"Today",you:true},{name:"Tunde A.",pts:"+620",date:"Today"},{name:"Ngozi F.",pts:"+340",date:"Yesterday"},{name:"Emeka K.",pts:"+200",date:"Yesterday"}];
  const votes=[{id:1,title:"Install CCTV at main gate",yes:68,no:12,total:80,deadline:"3 days left",status:"active"},{id:2,title:"Buy backup generator for block C",yes:42,no:28,total:70,deadline:"1 week left",status:"active"},{id:3,title:"Repaint perimeter fence",yes:91,no:9,total:100,deadline:"Closed",status:"closed"}];
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6",overflow:"hidden"}}>
      <ScreenHeader title="Estate Account" onBack={()=>goTo("profile")}/>
      <div style={{flex:1,overflowY:"auto"}}>
        {/* Hero banner */}
        <div style={{background:`linear-gradient(135deg,${e.color},${e.color}CC)`,padding:"20px 20px 24px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,.08)",pointerEvents:"none"}}/>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,position:"relative",zIndex:2}}>
            <div style={{width:48,height:48,borderRadius:14,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{e.emoji}</div>
            <div><div style={{fontFamily:FB,fontWeight:700,fontSize:16,color:C.white}}>{e.name}</div><div style={{fontFamily:FB,fontWeight:400,fontSize:12,color:"rgba(255,255,255,.75)"}}>{e.city} · {e.members} residents</div></div>
            <div style={{marginLeft:"auto",background:"rgba(255,255,255,.18)",borderRadius:8,padding:"4px 10px"}}><div style={{fontFamily:FA,fontWeight:700,fontSize:11,color:C.white,textAlign:"center"}}>{e.code}</div></div>
          </div>
          <div style={{display:"flex",gap:10,position:"relative",zIndex:2}}>
            <div style={{flex:1,background:"rgba(0,0,0,.18)",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontFamily:FB,fontWeight:400,fontSize:9,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Community Pool</div>
              <div style={{fontFamily:FA,fontWeight:700,fontSize:20,color:C.white}}>{poolTotal.toLocaleString()} <span style={{fontSize:12,fontWeight:400,opacity:.6}}>pts</span></div>
            </div>
            <div style={{flex:1,background:"rgba(0,0,0,.18)",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontFamily:FB,fontWeight:400,fontSize:9,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Your Share</div>
              <div style={{fontFamily:FA,fontWeight:700,fontSize:20,color:C.white}}>{myContrib} <span style={{fontSize:12,fontWeight:400,opacity:.6}}>pts</span></div>
            </div>
            <div style={{flex:1,background:"rgba(0,0,0,.18)",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontFamily:FB,fontWeight:400,fontSize:9,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Per Resident</div>
              <div style={{fontFamily:FA,fontWeight:700,fontSize:20,color:C.white}}>{perMember} <span style={{fontSize:12,fontWeight:400,opacity:.6}}>pts</span></div>
            </div>
          </div>
        </div>
        <div style={{margin:"12px 16px 0",background:e.colorLight,borderRadius:10,padding:"10px 14px",border:`1px solid ${e.color}28`,display:"flex",alignItems:"center",gap:8}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={e.color} strokeWidth="2.2" strokeLinejoin="round"/></svg>
          <span style={{fontFamily:FB,fontWeight:500,fontSize:12,color:e.color,flex:1}}>10% of every points earn you make is auto-contributed to this estate's community pool.</span>
        </div>
        {/* Tab bar */}
        <div style={{display:"flex",margin:"14px 16px 0",background:C.disabled,borderRadius:10,padding:3}}>
          {[["overview","Overview"],["activity","Activity"],["vote","Vote"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,height:34,borderRadius:8,border:"none",cursor:"pointer",fontFamily:FB,fontWeight:tab===k?700:400,fontSize:12,color:tab===k?C.ink:grey,background:tab===k?C.white:"transparent",transition:"all .2s"}}>{l}</button>
          ))}
        </div>
        <div style={{padding:"14px 16px 32px",display:"flex",flexDirection:"column",gap:12}}>
          {tab==="overview"&&<>
            <div style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
              <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:12}}>About {e.name}</div>
              <div style={{fontFamily:FB,fontWeight:400,fontSize:13,color:C.body,lineHeight:1.7}}>{e.description}</div>
              <div style={{height:1,background:C.border,margin:"12px 0"}}/>
              <div style={{height:10,background:C.disabled,borderRadius:5,marginBottom:6}}><div style={{height:"100%",width:`${Math.min(poolTotal/500,100)}%`,background:`linear-gradient(90deg,${e.color},${e.color}BB)`,borderRadius:5}}/></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:FA,fontWeight:600,fontSize:12,color:e.color}}>{poolTotal.toLocaleString()} pts raised</span><span style={{fontFamily:FB,fontSize:11,color:grey}}>Goal: 50,000 pts</span></div>
            </div>
          </>}
          {tab==="activity"&&<div style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
            <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,marginBottom:14}}>Recent Contributions</div>
            {activity.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,paddingBottom:i<activity.length-1?14:0,marginBottom:i<activity.length-1?14:0,borderBottom:i<activity.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{width:38,height:38,borderRadius:19,background:a.you?e.color:C.primXlt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:FB,fontWeight:700,fontSize:15,color:a.you?C.white:C.olive}}>{a.name[0]}</span></div>
                <div style={{flex:1}}><div style={{fontFamily:FB,fontWeight:500,fontSize:13,color:C.ink}}>{a.you?"You (Mercy O.)":a.name}</div><div style={{fontFamily:FB,fontSize:11,color:grey}}>{a.date}</div></div>
                <span style={{fontFamily:FA,fontWeight:700,fontSize:14,color:e.color}}>{a.pts} pts</span>
              </div>
            ))}
          </div>}
          {tab==="vote"&&votes.map(v=>{
            const yPct=Math.round(v.yes/v.total*100);
            return(
              <div key={v.id} style={{background:C.white,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div style={{fontFamily:FB,fontWeight:600,fontSize:14,color:C.ink,flex:1,paddingRight:8}}>{v.title}</div>
                  <div style={{background:v.status==="active"?C.primXlt:C.disabled,borderRadius:5,padding:"3px 8px",flexShrink:0}}><span style={{fontFamily:FB,fontWeight:600,fontSize:10,color:v.status==="active"?C.olive:grey}}>{v.status==="active"?"LIVE":"CLOSED"}</span></div>
                </div>
                <div style={{height:8,background:C.disabled,borderRadius:4,marginBottom:6}}><div style={{height:"100%",width:`${yPct}%`,background:e.color,borderRadius:4}}/></div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:v.status==="active"?12:0}}>
                  <span style={{fontFamily:FA,fontWeight:700,fontSize:12,color:e.color}}>{yPct}% in favour</span>
                  <span style={{fontFamily:FB,fontSize:11,color:grey}}>{v.deadline}</span>
                </div>
                {v.status==="active"&&<div style={{display:"flex",gap:8}}>
                  <button style={{flex:1,height:34,background:e.color,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:700,fontSize:12,color:C.white}}>👍 Vote Yes</button>
                  <button style={{flex:1,height:34,background:C.disabled,border:"none",borderRadius:8,cursor:"pointer",fontFamily:FB,fontWeight:600,fontSize:12,color:grey}}>👎 Vote No</button>
                </div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── CONTACT / SECURITY / PAYMENT SETTINGS stubs ─────────── */
const ScreenContactUs=({goTo})=>(<div style={{flex:1,display:"flex",flexDirection:"column",background:"#F8F9F6"}}><ScreenHeader title="Contact Us" onBack={()=>goTo("profile")}/><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,padding:32}}><div style={{fontSize:32}}>💬</div><div style={{fontFamily:FB,fontWeight:600,fontSize:16,color:C.ink}}>Contact Us</div><div style={{fontFamily:FB,fontSize:13,color:grey,textAlign:"center"}}>WhatsApp: 08039930607{"\n"}Email: Ahzarmanltd@gmail.com</div></div></div>);
const ScreenSecurity=({goTo})=><ScreenStub title="Security" goTo={()=>goTo("profile")}/>;
const ScreenPaymentSettings=({goTo})=><ScreenStub title="Payment Settings" goTo={()=>goTo("profile")}/>;
const ScreenBeneficiaries=({goTo})=><ScreenStub title="Beneficiaries" goTo={()=>goTo("profile")}/>;

/* ── PHONE SHELL ────────────────────────────────────────────── */
const Phone=({screen,goTo,state})=>{
  const {transactions,onAddTx,userEstate,setUserEstate,estatePoints}=state;
  const screens={
    onboarding:     <ScreenOnboarding       goTo={goTo}/>,
    sign_in:        <ScreenSignIn           goTo={goTo}/>,
    home:           <ScreenHome             goTo={goTo} transactions={transactions} userEstate={userEstate}/>,
    services:       <ScreenServices         goTo={goTo}/>,
    rewards:        <ScreenRewards          goTo={goTo} userEstate={userEstate}/>,
    profile:        <ScreenProfile          goTo={goTo} userEstate={userEstate}/>,
    history:        <ScreenHistory          goTo={goTo} transactions={transactions}/>,
    notifications:  <ScreenNotifications    goTo={goTo} fromProfile={false}/>,
    notifications_from_profile: <ScreenNotifications goTo={goTo} fromProfile={true}/>,
    airtime:        <ScreenAirtime          goTo={goTo} onAddTx={onAddTx}/>,
    electricity:    <ScreenElectricity      goTo={goTo} onAddTx={onAddTx}/>,
    elec_success:   <ScreenElecSuccess      goTo={goTo}/>,
    success_simple: <ScreenSuccessSimple    goTo={goTo}/>,
    share_points:   <ScreenSharePoints      goTo={goTo}/>,
    redeem_points:  <ScreenRedeemPoints     goTo={goTo}/>,
    /* FIX 1: ScreenRefer now backs to profile */
    refer:          <ScreenRefer            goTo={goTo}/>,
    personal_info:  <ScreenPersonalInfo     goTo={goTo}/>,
    security:       <ScreenSecurity         goTo={goTo}/>,
    contact_us:     <ScreenContactUs        goTo={goTo}/>,
    payment_settings:<ScreenPaymentSettings goTo={goTo}/>,
    beneficiaries:  <ScreenBeneficiaries    goTo={goTo}/>,
    /* FIX 5: onSetEstate wired through */
    estate_account: <ScreenEstateAccount    goTo={goTo} userEstate={userEstate} estatePoints={estatePoints} onSetEstate={setUserEstate}/>,
    data:           <ScreenStub title="Buy Data" goTo={()=>goTo("services")}/>,
    tv:             <ScreenStub title="Cable TV" goTo={()=>goTo("services")}/>,
    giftcards:      <ScreenStub title="Gift Cards" goTo={()=>goTo("services")}/>,
    flights:        <ScreenStub title="Book Flights" goTo={()=>goTo("services")}/>,
    betting:        <ScreenStub title="Betting" goTo={()=>goTo("services")}/>,
    esim:           <ScreenStub title="eSIM" goTo={()=>goTo("services")}/>,
  };
  return(
    <div style={{width:390,height:844,background:C.white,borderRadius:52,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.28),0 0 0 1px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",position:"relative"}}>
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
  const [transactions,setTransactions]=useState(SAMPLE_TXS);
  const [userEstate,setUserEstate]=useState(null);
  const [estatePoints,setEstatePoints]=useState(0);

  const onAddTx=tx=>{
    setTransactions(p=>[tx,...p]);
    if(userEstate&&tx.pts){const n=parseInt((tx.pts||"").replace(/\D/g,""))||0;if(n>0)setEstatePoints(p=>p+Math.floor(n*0.1));}
  };

  const goTo=s=>{
    if(s==="notifications"&&screen==="profile")setScreen("notifications_from_profile");
    else setScreen(s);
  };

  const state={transactions,onAddTx,userEstate,setUserEstate,estatePoints};

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#f0f5e2,#e4efca 50%,#d6e8b4)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px",fontFamily:FB}}>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=switzer@300,400,500,600,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        input,textarea{caret-color:#A3B708;outline:none;}
        button:not(:disabled):active{transform:scale(0.97);}
        ::-webkit-scrollbar{display:none;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        @keyframes pulse{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.5);opacity:0}100%{transform:scale(1.5);opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{marginBottom:12,background:"#020202",borderRadius:10,padding:"8px 16px",maxWidth:390,textAlign:"center"}}>
        <span style={{fontFamily:FB,fontWeight:700,fontSize:12,color:C.primary,letterSpacing:".06em"}}>AHZARMAN v4 — REFER + ESTATE JOIN FIXED</span>
      </div>
      <Phone screen={screen} goTo={goTo} state={state}/>
      <div style={{marginTop:12,display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",maxWidth:390}}>
        {[["🚀","onboarding"],["🔐","sign_in"],["🏠","home"],["🛍","services"],["🏆","rewards"],["👤","profile"],["📱","airtime"],["⚡","electricity"],["🎯","share_points"],["💎","redeem_points"],["🤝","refer"],["🏘️","estate_account"],["📋","history"]].map(([e,s])=>(
          <button key={s} onClick={()=>setScreen(s)} style={{padding:"4px 10px",borderRadius:16,border:"none",cursor:"pointer",background:screen===s?C.primary:"rgba(255,255,255,.6)",fontFamily:FB,fontSize:10,fontWeight:screen===s?700:400,color:screen===s?C.ink:"#888"}}>{e}</button>
        ))}
      </div>
      <div style={{marginTop:8,fontFamily:FB,fontSize:11,color:"#888",textAlign:"center",maxWidth:390}}>
        💡 Test estate join: go <strong>Profile → Join an Estate</strong> · Refer accessible from <strong>Profile + Rewards</strong>
      </div>
    </div>
  );
}
