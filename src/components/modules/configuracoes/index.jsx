import { useState, useMemo } from 'react'
import { AlertCircle, AlertTriangle, Award, Bell, Building2, Calendar, Check, CheckCircle2, ChevronDown, ChevronRight, Clock, Copy, CreditCard, Edit3, ExternalLink, Eye, EyeOff, FileText, Globe, Home, Image, Info, Key, Link, Loader2, Lock, Mail, MessageSquare, MoreHorizontal, Phone, Plus, RefreshCw, Save, Search, Settings, Shield, Smartphone, Star, Trash2, Upload, Users, Wifi, X, Zap } from 'lucide-react'
import { T } from '@/utils/theme'
import { Button, Modal, InputField, SelectField, Badge, Card, Toggle, Avatar, EmptyState, LoadingSpinner, getInitials } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useProfessionals } from '@/lib/hooks'

/* ─── Design Tokens ─── */

const IS={width:"100%",padding:"10px 12px",border:`1.5px solid ${T.n300}`,borderRadius:T.radiusMd,fontSize:14,fontFamily:T.font,color:T.n900,outline:"none",boxSizing:"border-box",background:T.n0};
const LS={display:"block",fontSize:13,fontWeight:500,color:T.n700,marginBottom:5};
const FW={marginBottom:18};


/* ─── Data ─── */
const WEEKDAYS=[{id:"seg",label:"Segunda-feira"},{id:"ter",label:"Terça-feira"},{id:"qua",label:"Quarta-feira"},{id:"qui",label:"Quinta-feira"},{id:"sex",label:"Sexta-feira"},{id:"sab",label:"Sábado"},{id:"dom",label:"Domingo"}];


const ROLES = {
  admin:        { label:"Administrador", color:T.primary500, desc:"Acesso total ao sistema" },
  professional: { label:"Profissional",  color:T.success,    desc:"Agenda, prontuários, pacientes próprios" },
  receptionist: { label:"Recepcionista", color:T.teal,       desc:"Agenda, pacientes, cobranças (leitura)" },
  financial:    { label:"Financeiro",    color:T.orange,     desc:"Cobranças, despesas, relatórios financeiros" },
};

const PERMISSIONS = [
  { id:"agenda",      label:"Agenda",          desc:"Visualizar e gerenciar agendamentos" },
  { id:"patients",    label:"Pacientes",       desc:"Cadastro e gestão de pacientes" },
  { id:"records",     label:"Prontuários",     desc:"Criar e visualizar evoluções" },
  { id:"billing",     label:"Cobranças",       desc:"Emitir e gerenciar cobranças" },
  { id:"expenses",    label:"Despesas",        desc:"Registrar e gerenciar despesas" },
  { id:"reports",     label:"Relatórios",      desc:"Acessar relatórios e dashboards" },
  { id:"settings",    label:"Configurações",   desc:"Alterar configurações da clínica" },
  { id:"team",        label:"Equipe",          desc:"Gerenciar membros da equipe" },
];

const ROLE_PERMS = {
  admin:        ["agenda","patients","records","billing","expenses","reports","settings","team"],
  professional: ["agenda","patients","records"],
  receptionist: ["agenda","patients","billing"],
  financial:    ["billing","expenses","reports"],
};

const INTEGRATIONS = [
  { id:"whatsapp", name:"WhatsApp Business", desc:"Envio automático de lembretes e confirmações via WhatsApp.", icon:Smartphone, color:"#25D366", status:"connected", config:{phone:"+55 11 98765-4321",autoReminder:true,confirmHours:24} },
  { id:"gcal", name:"Google Calendar", desc:"Sincronize sua agenda com o Google Calendar.", icon:Calendar, color:"#4285F4", status:"connected", config:{email:"clinica@gmail.com",sync:"bidirectional"} },
  { id:"pix", name:"Pix Automático", desc:"Gere QR codes Pix para cobranças instantâneas.", icon:Zap, color:T.teal, status:"connected", config:{key:"12.345.678/0001-01",bank:"Banco Inter"} },
  { id:"stripe", name:"Stripe", desc:"Aceite pagamentos com cartão de crédito e débito.", icon:CreditCard, color:"#635BFF", status:"disconnected", config:{} },
  { id:"nfse", name:"Nota Fiscal (NFS-e)", desc:"Emissão automática de notas fiscais de serviço.", icon:FileText, color:T.warning, status:"disconnected", config:{} },
  { id:"zoom", name:"Zoom / Telemedicina", desc:"Integração para sessões online com link automático.", icon:Globe, color:"#2D8CFF", status:"disconnected", config:{} },
];

/* ═══ Sidebar ═══ */




function SectionCard({title,desc,icon:Icon,children,delay=0}){
  return(
    <div style={{background:T.n0,borderRadius:T.radiusLg,border:`1px solid ${T.n200}`,boxShadow:T.shadowSoft,overflow:"hidden",animation:`fadeSlideUp 0.35s ease ${delay}s both`}}>
      <div style={{padding:"18px 24px",borderBottom:`1px solid ${T.n200}`,display:"flex",alignItems:"center",gap:12}}>
        {Icon&&<div style={{width:36,height:36,borderRadius:10,background:T.primary50,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={17} color={T.primary500}/></div>}
        <div><div style={{fontSize:15,fontWeight:600}}>{title}</div>{desc&&<div style={{fontSize:12,color:T.n400,marginTop:1}}>{desc}</div>}</div>
      </div>
      <div style={{padding:"20px 24px"}}>{children}</div>
    </div>
  );
}

function SaveBar({saving,onSave}){
  return(
    <div style={{position:"sticky",bottom:0,left:0,right:0,padding:"14px 28px",background:T.n0,borderTop:`1px solid ${T.n200}`,display:"flex",justifyContent:"flex-end",gap:8,zIndex:30,boxShadow:"0 -2px 8px rgba(0,0,0,0.04)"}}>
      <button style={{padding:"10px 18px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n700,fontFamily:T.font,fontSize:14,fontWeight:500,cursor:"pointer"}}>Descartar</button>
      <button onClick={onSave} disabled={saving} style={{padding:"10px 22px",borderRadius:T.radiusMd,border:"none",background:T.primary500,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,opacity:saving?0.7:1,transition:"all 200ms"}}
        onMouseEnter={e=>{if(!saving)e.currentTarget.style.background=T.primary600}}
        onMouseLeave={e=>e.currentTarget.style.background=T.primary500}>
        {saving?<Loader2 size={15} className="spin"/>:<Save size={15}/>} Salvar alterações
      </button>
    </div>
  );
}

/* ═══ Team Member Modal ═══ */
function TeamModal({open,onClose,member}){
  const isEdit=!!member;
  const[form,setForm]=useState({name:"",email:"",role:"professional",status:"active"});
  const[saving,setSaving]=useState(false);
  useEffect(()=>{
    if(open&&member) setForm({name:member.name,email:member.email,role:member.role,status:member.status});
    else if(open) setForm({name:"",email:"",role:"professional",status:"active"});
  },[open,member]);
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=()=>{setSaving(true);setTimeout(()=>{setSaving(false);onClose("saved")},1000)};
  if(!open) return null;
  const role=ROLES[form.role];
  const perms=ROLE_PERMS[form.role]||[];

  return(
    <div onClick={()=>onClose()} style={{position:"fixed",inset:0,background:"rgba(17,17,17,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",animation:"fadeIn 150ms ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:520,background:T.n0,borderRadius:T.radiusLg,boxShadow:T.shadowLg,overflow:"hidden",animation:"slideUp 250ms ease",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${T.n200}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h2 style={{fontSize:18,fontWeight:700}}>{isEdit?"Editar membro":"Convidar membro"}</h2>
          <button onClick={()=>onClose()} style={{width:32,height:32,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400}}><X size={18}/></button>
        </div>
        <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
          <div style={FW}><label style={LS}>Nome completo *</label><input value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="Nome do membro" style={IS}/></div>
          <div style={FW}><label style={LS}>E-mail *</label><input value={form.email} onChange={e=>upd("email",e.target.value)} placeholder="email@clinica.com" style={IS}/></div>
          <div style={FW}>
            <label style={LS}>Perfil de acesso *</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {Object.entries(ROLES).map(([id,r])=>(
                <button key={id} onClick={()=>upd("role",id)} style={{padding:"12px 14px",borderRadius:T.radiusMd,border:`1.5px solid ${form.role===id?r.color:T.n300}`,background:form.role===id?`${r.color}10`:T.n0,cursor:"pointer",textAlign:"left",transition:"all 200ms"}}>
                  <div style={{fontSize:13,fontWeight:600,color:form.role===id?r.color:T.n900,display:"flex",alignItems:"center",gap:6}}>
                    {form.role===id&&<CheckCircle2 size={13}/>}{r.label}
                  </div>
                  <div style={{fontSize:11,color:T.n400,marginTop:3}}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Permissions preview */}
          <div style={{padding:"14px 16px",background:T.n100,borderRadius:T.radiusMd,border:`1px solid ${T.n200}`}}>
            <div style={{fontSize:12,fontWeight:600,color:T.n700,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Shield size={13}/> Permissões do perfil "{role?.label}"</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {PERMISSIONS.map(p=>{
                const has=perms.includes(p.id);
                return(
                  <span key={p.id} style={{fontSize:11,padding:"4px 10px",borderRadius:12,background:has?T.successBg:"rgba(201,205,216,0.12)",color:has?T.success:T.n400,fontWeight:500,display:"flex",alignItems:"center",gap:4}}>
                    {has?<Check size={10}/>:<X size={10}/>}{p.label}
                  </span>
                );
              })}
            </div>
          </div>
          {isEdit&&(
            <div style={{marginTop:16}}>
              <label style={LS}>Status</label>
              <div style={{display:"flex",gap:8}}>
                {[{id:"active",label:"Ativo",color:T.success},{id:"inactive",label:"Inativo",color:T.n400}].map(s=>(
                  <button key={s.id} onClick={()=>upd("status",s.id)} style={{flex:1,padding:"9px 14px",borderRadius:T.radiusMd,cursor:"pointer",border:`1.5px solid ${form.status===s.id?s.color:T.n300}`,background:form.status===s.id?`${s.color}12`:T.n0,color:form.status===s.id?s.color:T.n400,fontFamily:T.font,fontSize:13,fontWeight:500,transition:"all 200ms",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                    {form.status===s.id&&<CheckCircle2 size={13}/>}{s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"16px 24px",borderTop:`1px solid ${T.n200}`,display:"flex",justifyContent:"space-between"}}>
          <button onClick={()=>onClose()} style={{padding:"11px 18px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n700,fontFamily:T.font,fontSize:14,fontWeight:500,cursor:"pointer"}}>Cancelar</button>
          <button onClick={save} disabled={saving} style={{padding:"11px 20px",borderRadius:T.radiusMd,border:"none",background:T.primary500,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,opacity:saving?0.7:1,transition:"all 200ms"}}
            onMouseEnter={e=>{if(!saving)e.currentTarget.style.background=T.primary600}}
            onMouseLeave={e=>e.currentTarget.style.background=T.primary500}>
            {saving?<Loader2 size={15} className="spin"/>:<Check size={15}/>} {isEdit?"Salvar":"Enviar convite"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ MAIN CONTENT ═══ */
export default function Configuracoes(){
  /* ─── Hooks ─── */
  const { data: rawProfessionals } = useProfessionals();

  /* ─── Adapt professionals → team members ─── */
  const ROLE_COLORS = { admin: T.primary500, professional: T.success, receptionist: T.teal, financial: T.orange, owner: T.purple };
  const team = useMemo(() => rawProfessionals.map(p => ({
    id: p.id,
    name: p.full_name,
    email: p.email || "",
    role: "professional",
    status: p.is_active ? "active" : "inactive",
    color: ROLE_COLORS["professional"],
    lastLogin: p.updated_at || p.created_at || "",
  })), [rawProfessionals]);
  const[section,setSection]=useState("clinic");
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const[teamModal,setTeamModal]=useState(false);
  const[editMember,setEditMember]=useState(null);

  // WhatsApp config
  const[clinicPlan,setClinicPlan]=useState("max"); // "standard" | "max"
  const[uazapiStep,setUazapiStep]=useState("idle"); // idle | creating | qr | connected
  const[uazapiInstance,setUazapiInstance]=useState("");
  const[uazapiPhone,setUazapiPhone]=useState("+55 11 98765-4321");
  const[qrCountdown,setQrCountdown]=useState(0);

  // Clinic form
  const[clinic,setClinic]=useState({
    name:"Clínica Terapee",cnpj:"12.345.678/0001-01",phone:"(11) 3333-4444",email:"contato@terapee.com.br",
    address:"Rua Augusta, 500 — Consolação, São Paulo — SP, 01304-000",website:"www.terapee.com.br",
  });

  // Business hours
  const[hours,setHours]=useState({
    seg:{active:true,open:"08:00",close:"18:00",break:true,breakStart:"12:00",breakEnd:"13:00"},
    ter:{active:true,open:"08:00",close:"18:00",break:true,breakStart:"12:00",breakEnd:"13:00"},
    qua:{active:true,open:"08:00",close:"18:00",break:true,breakStart:"12:00",breakEnd:"13:00"},
    qui:{active:true,open:"08:00",close:"18:00",break:true,breakStart:"12:00",breakEnd:"13:00"},
    sex:{active:true,open:"08:00",close:"17:00",break:true,breakStart:"12:00",breakEnd:"13:00"},
    sab:{active:true,open:"08:00",close:"12:00",break:false,breakStart:"",breakEnd:""},
    dom:{active:false,open:"",close:"",break:false,breakStart:"",breakEnd:""},
  });

  // Policies
  const[policies,setPolicies]=useState({
    slotDuration:50, intervalBetween:10, minAdvanceHours:2, maxAdvanceDays:60,
    cancelHours:24, cancelFee:50, noShowFee:100, autoConfirm:true,
    reminderWhatsapp:true, reminderEmail:false, reminderHoursBefore:24,
    allowOnlineBooking:true, requireApproval:false,
  });

  // Notifications
  const[notif,setNotif]=useState({
    newAppointment:true, cancelledAppointment:true, newPatient:true,
    overduePayment:true, dailySummary:true, weeklyReport:false,
  });

  const handleSave=()=>{setSaving(true);setTimeout(()=>{setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000)},1200)};

  const sections=[
    {id:"clinic",label:"Dados da clínica",icon:Home},
    {id:"hours",label:"Horário de funcionamento",icon:Clock},
    {id:"policies",label:"Políticas e regras",icon:Shield},
    {id:"whatsapp",label:"WhatsApp",icon:MessageSquare},
    {id:"team",label:"Equipe e acessos",icon:Users},
    {id:"integrations",label:"Integrações",icon:Link},
    {id:"notifications",label:"Notificações",icon:Bell},
  ];

  return(
    <div style={{display:"flex",minHeight:"calc(100vh - 64px)"}}>
      {/* Settings nav */}
      <div style={{width:240,borderRight:`1px solid ${T.n200}`,background:T.n0,padding:"20px 12px",flexShrink:0,position:"sticky",top:64,height:"calc(100vh - 64px)",overflowY:"auto"}}>
        <div style={{fontSize:11,fontWeight:600,color:T.n400,textTransform:"uppercase",letterSpacing:"0.06em",padding:"0 12px",marginBottom:8}}>Configurações</div>
        {sections.map(s=>{
          const active=section===s.id;
          const Icon=s.icon;
          return(
            <button key={s.id} onClick={()=>setSection(s.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",borderRadius:T.radiusMd,border:"none",cursor:"pointer",background:active?T.primary50:"transparent",color:active?T.primary500:T.n700,fontFamily:T.font,fontSize:13,fontWeight:active?600:400,transition:"all 150ms",marginBottom:2,textAlign:"left"}}
              onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.n100}}
              onMouseLeave={e=>{e.currentTarget.style.background=active?T.primary50:"transparent"}}>
              <Icon size={16} style={{flexShrink:0}}/>{s.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"24px 32px",flex:1}}>

          {/* ══════ CLINIC DATA ══════ */}
          {section==="clinic"&&(
            <div style={{maxWidth:700,animation:"fadeSlideUp 0.3s ease both"}}>
              <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Dados da clínica</h2>
              <p style={{fontSize:13,color:T.n400,marginBottom:24}}>Informações básicas que aparecem em cobranças, prontuários e comunicações.</p>

              <SectionCard title="Perfil da clínica" icon={Home} delay={0.05}>
                {/* Logo placeholder */}
                <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
                  <div style={{width:72,height:72,borderRadius:16,background:`linear-gradient(135deg, ${T.primary500}, ${T.primary600})`,display:"flex",alignItems:"center",justifyContent:"center",color:T.n0,fontWeight:700,fontSize:28,flexShrink:0}}>T</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>Logo da clínica</div>
                    <div style={{display:"flex",gap:8}}>
                      <button style={{padding:"7px 14px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n700,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><Image size={13}/> Alterar</button>
                      <button style={{padding:"7px 14px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n400,fontFamily:T.font,fontSize:12,cursor:"pointer"}}><Trash2 size={13}/></button>
                    </div>
                    <div style={{fontSize:11,color:T.n400,marginTop:4}}>PNG ou JPG, máx 2MB</div>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div style={{...FW,gridColumn:"1 / -1"}}><label style={LS}>Nome da clínica *</label><input value={clinic.name} onChange={e=>setClinic(c=>({...c,name:e.target.value}))} style={IS}/></div>
                  <div style={FW}><label style={LS}>CNPJ</label><input value={clinic.cnpj} onChange={e=>setClinic(c=>({...c,cnpj:e.target.value}))} placeholder="00.000.000/0000-00" style={IS}/></div>
                  <div style={FW}><label style={LS}>Telefone</label><input value={clinic.phone} onChange={e=>setClinic(c=>({...c,phone:e.target.value}))} style={IS}/></div>
                  <div style={FW}><label style={LS}>E-mail</label><input value={clinic.email} onChange={e=>setClinic(c=>({...c,email:e.target.value}))} style={IS}/></div>
                  <div style={FW}><label style={LS}>Website</label><input value={clinic.website} onChange={e=>setClinic(c=>({...c,website:e.target.value}))} style={IS}/></div>
                  <div style={{...FW,gridColumn:"1 / -1"}}><label style={LS}>Endereço completo</label><input value={clinic.address} onChange={e=>setClinic(c=>({...c,address:e.target.value}))} style={IS}/></div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══════ BUSINESS HOURS ══════ */}
          {section==="hours"&&(
            <div style={{maxWidth:700,animation:"fadeSlideUp 0.3s ease both"}}>
              <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Horário de funcionamento</h2>
              <p style={{fontSize:13,color:T.n400,marginBottom:24}}>Defina os dias e horários em que a clínica está aberta para atendimento.</p>

              <SectionCard title="Dias e horários" icon={Clock} delay={0.05}>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {WEEKDAYS.map(day=>{
                    const h=hours[day.id];
                    return(
                      <div key={day.id} style={{padding:"12px 16px",borderRadius:T.radiusMd,border:`1px solid ${h.active?T.n200:T.n200}`,background:h.active?T.n0:T.n100,transition:"all 200ms"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <Toggle value={h.active} onChange={v=>setHours(prev=>({...prev,[day.id]:{...prev[day.id],active:v}}))}/>
                          <span style={{fontSize:14,fontWeight:500,color:h.active?T.n900:T.n400,minWidth:120}}>{day.label}</span>
                          {h.active?(
                            <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                              <input type="time" value={h.open} onChange={e=>setHours(prev=>({...prev,[day.id]:{...prev[day.id],open:e.target.value}}))} style={{...IS,width:110,padding:"7px 10px",fontSize:13}}/>
                              <span style={{color:T.n400,fontSize:13}}>às</span>
                              <input type="time" value={h.close} onChange={e=>setHours(prev=>({...prev,[day.id]:{...prev[day.id],close:e.target.value}}))} style={{...IS,width:110,padding:"7px 10px",fontSize:13}}/>
                              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
                                <span style={{fontSize:11,color:T.n400}}>Intervalo</span>
                                <Toggle value={h.break} onChange={v=>setHours(prev=>({...prev,[day.id]:{...prev[day.id],break:v}}))}/>
                              </div>
                            </div>
                          ):(
                            <span style={{fontSize:13,color:T.n400,fontStyle:"italic"}}>Fechado</span>
                          )}
                        </div>
                        {h.active&&h.break&&(
                          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,paddingLeft:54}}>
                            <span style={{fontSize:12,color:T.n400,minWidth:60}}>Intervalo:</span>
                            <input type="time" value={h.breakStart} onChange={e=>setHours(prev=>({...prev,[day.id]:{...prev[day.id],breakStart:e.target.value}}))} style={{...IS,width:100,padding:"6px 8px",fontSize:12}}/>
                            <span style={{color:T.n400,fontSize:12}}>às</span>
                            <input type="time" value={h.breakEnd} onChange={e=>setHours(prev=>({...prev,[day.id]:{...prev[day.id],breakEnd:e.target.value}}))} style={{...IS,width:100,padding:"6px 8px",fontSize:12}}/>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══════ POLICIES ══════ */}
          {section==="policies"&&(
            <div style={{maxWidth:700,animation:"fadeSlideUp 0.3s ease both"}}>
              <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Políticas e regras</h2>
              <p style={{fontSize:13,color:T.n400,marginBottom:24}}>Configure as regras de agendamento, cancelamento e cobranças da clínica.</p>

              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                <SectionCard title="Agendamento" icon={Calendar} delay={0.05}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    <div style={FW}>
                      <label style={LS}>Duração padrão da sessão (min)</label>
                      <div style={{display:"flex",gap:6}}>{[30,40,45,50,60].map(d=>(
                        <button key={d} onClick={()=>setPolicies(p=>({...p,slotDuration:d}))} style={{padding:"8px 12px",borderRadius:T.radiusSm,cursor:"pointer",border:`1.5px solid ${policies.slotDuration===d?T.primary500:T.n300}`,background:policies.slotDuration===d?T.primary50:T.n0,color:policies.slotDuration===d?T.primary500:T.n400,fontFamily:T.font,fontSize:13,fontWeight:500,transition:"all 200ms"}}>{d}</button>
                      ))}</div>
                    </div>
                    <div style={FW}><label style={LS}>Intervalo entre sessões (min)</label><input type="number" value={policies.intervalBetween} onChange={e=>setPolicies(p=>({...p,intervalBetween:+e.target.value}))} style={IS}/></div>
                    <div style={FW}><label style={LS}>Antecedência mínima para agendar (h)</label><input type="number" value={policies.minAdvanceHours} onChange={e=>setPolicies(p=>({...p,minAdvanceHours:+e.target.value}))} style={IS}/></div>
                    <div style={FW}><label style={LS}>Antecedência máxima (dias)</label><input type="number" value={policies.maxAdvanceDays} onChange={e=>setPolicies(p=>({...p,maxAdvanceDays:+e.target.value}))} style={IS}/></div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:4}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:T.n100,borderRadius:T.radiusMd}}>
                      <div><div style={{fontSize:13,fontWeight:500}}>Confirmação automática</div><div style={{fontSize:12,color:T.n400}}>Confirmar agendamento automaticamente ao criar</div></div>
                      <Toggle value={policies.autoConfirm} onChange={v=>setPolicies(p=>({...p,autoConfirm:v}))}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:T.n100,borderRadius:T.radiusMd}}>
                      <div><div style={{fontSize:13,fontWeight:500}}>Agendamento online</div><div style={{fontSize:12,color:T.n400}}>Permitir que pacientes agendem pelo portal</div></div>
                      <Toggle value={policies.allowOnlineBooking} onChange={v=>setPolicies(p=>({...p,allowOnlineBooking:v}))}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:T.n100,borderRadius:T.radiusMd}}>
                      <div><div style={{fontSize:13,fontWeight:500}}>Requer aprovação</div><div style={{fontSize:12,color:T.n400}}>Agendamentos online precisam de aprovação manual</div></div>
                      <Toggle value={policies.requireApproval} onChange={v=>setPolicies(p=>({...p,requireApproval:v}))}/>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Cancelamento e faltas" icon={AlertTriangle} delay={0.1}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
                    <div style={FW}><label style={LS}>Prazo para cancelar (h)</label><input type="number" value={policies.cancelHours} onChange={e=>setPolicies(p=>({...p,cancelHours:+e.target.value}))} style={IS}/></div>
                    <div style={FW}><label style={LS}>Taxa de cancelamento (%)</label><div style={{position:"relative"}}><input type="number" value={policies.cancelFee} onChange={e=>setPolicies(p=>({...p,cancelFee:+e.target.value}))} style={{...IS,paddingRight:30}}/><span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T.n400}}>%</span></div></div>
                    <div style={FW}><label style={LS}>Taxa de no-show (%)</label><div style={{position:"relative"}}><input type="number" value={policies.noShowFee} onChange={e=>setPolicies(p=>({...p,noShowFee:+e.target.value}))} style={{...IS,paddingRight:30}}/><span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T.n400}}>%</span></div></div>
                  </div>
                  <div style={{padding:"12px 16px",background:T.warningBg,borderRadius:T.radiusMd,border:`1px solid rgba(245,158,11,0.15)`,display:"flex",alignItems:"flex-start",gap:10,marginTop:4}}>
                    <AlertTriangle size={16} color={T.warning} style={{flexShrink:0,marginTop:1}}/>
                    <div style={{fontSize:12,color:T.n700,lineHeight:1.5}}>Cancelamentos realizados com menos de <strong>{policies.cancelHours}h</strong> de antecedência serão cobrados em <strong>{policies.cancelFee}%</strong> do valor da sessão. Faltas sem aviso (no-show) serão cobradas em <strong>{policies.noShowFee}%</strong>.</div>
                  </div>
                </SectionCard>

                <SectionCard title="Lembretes automáticos" icon={Bell} delay={0.15}>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:T.n100,borderRadius:T.radiusMd}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}><Smartphone size={16} color="#25D366"/><div><div style={{fontSize:13,fontWeight:500}}>Lembrete via WhatsApp</div><div style={{fontSize:12,color:T.n400}}>Enviar mensagem automática antes da sessão</div></div></div>
                      <Toggle value={policies.reminderWhatsapp} onChange={v=>setPolicies(p=>({...p,reminderWhatsapp:v}))}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:T.n100,borderRadius:T.radiusMd}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}><Mail size={16} color={T.info}/><div><div style={{fontSize:13,fontWeight:500}}>Lembrete via E-mail</div><div style={{fontSize:12,color:T.n400}}>Enviar e-mail de lembrete antes da sessão</div></div></div>
                      <Toggle value={policies.reminderEmail} onChange={v=>setPolicies(p=>({...p,reminderEmail:v}))}/>
                    </div>
                    <div style={FW}><label style={LS}>Enviar lembrete com antecedência de (horas)</label><input type="number" value={policies.reminderHoursBefore} onChange={e=>setPolicies(p=>({...p,reminderHoursBefore:+e.target.value}))} style={{...IS,maxWidth:120}}/></div>
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {/* ══════ WHATSAPP ══════ */}
          {section==="whatsapp"&&(
            <div style={{maxWidth:700,animation:"fadeSlideUp 0.3s ease both"}}>
              <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Configuração WhatsApp</h2>
              <p style={{fontSize:13,color:T.n400,marginBottom:24}}>Configure o canal de envio de notificações e lembretes via WhatsApp.</p>

              {/* Plan selector */}
              <SectionCard title="Plano de envio" desc="Define como as mensagens são enviadas para os pacientes" icon={Smartphone} delay={0.05}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  {[
                    {id:"standard",label:"Plano Standard",desc:"Mensagens enviadas pela API oficial da Meta usando templates aprovados. O remetente é um número padrão da plataforma.",badge:"Meta API",color:T.info,features:["Templates pré-aprovados pela Meta","Número de envio compartilhado","Sem necessidade de configuração"]},
                    {id:"max",label:"Clínica Max",desc:"Mensagens enviadas com o número da própria clínica via UAZAPI. Mais personalização e confiança do paciente.",badge:"UAZAPI",color:T.wa,features:["Envio com número da clínica","Mensagens livres (sem template obrigatório)","Maior taxa de leitura","Requer conexão do WhatsApp"]},
                  ].map(p=>{
                    const sel=clinicPlan===p.id;
                    return(
                      <div key={p.id} onClick={()=>setClinicPlan(p.id)} style={{padding:"18px 20px",borderRadius:T.radiusMd,border:`2px solid ${sel?p.color:T.n300}`,background:sel?`${p.color}08`:T.n0,cursor:"pointer",transition:"all 200ms",position:"relative",overflow:"hidden"}}>
                        {sel&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:p.color}}/>}
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                          <div style={{fontSize:15,fontWeight:700,color:sel?p.color:T.n900}}>{p.label}</div>
                          <Badge color={sel?p.color:T.n400} bg={sel?`${p.color}15`:"rgba(201,205,216,0.12)"}>{p.badge}</Badge>
                        </div>
                        <div style={{fontSize:12,color:T.n400,marginBottom:12,lineHeight:1.5}}>{p.desc}</div>
                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                          {p.features.map((f,i)=>(
                            <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:sel?T.n700:T.n400}}>
                              <CheckCircle2 size={12} color={sel?p.color:T.n300}/>{f}
                            </div>
                          ))}
                        </div>
                        {sel&&<div style={{position:"absolute",top:12,right:12}}><CheckCircle2 size={18} color={p.color}/></div>}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* Meta API config (Standard) */}
              {clinicPlan==="standard"&&(
                <div style={{marginTop:16}}>
                  <SectionCard title="API Oficial da Meta" desc="Configuração da integração com WhatsApp Business API" icon={Globe} delay={0.1}>
                    <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px",background:T.successBg,borderRadius:T.radiusMd,border:`1px solid rgba(22,163,74,0.15)`,marginBottom:16}}>
                      <CheckCircle2 size={20} color={T.success}/>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:T.success}}>Integração ativa</div>
                        <div style={{fontSize:12,color:T.n700,marginTop:2}}>As notificações são enviadas automaticamente usando templates aprovados pela Meta.</div>
                      </div>
                    </div>
                    <div style={{padding:"14px 16px",background:T.n100,borderRadius:T.radiusMd}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Como funciona</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {[
                          "Os lembretes e confirmações usam templates pré-aprovados pela Meta",
                          "O número de envio é um número verificado da plataforma Terapee",
                          "O paciente recebe a mensagem como uma notificação oficial",
                          "Templates disponíveis: lembrete, confirmação, cancelamento, cobrança",
                        ].map((t,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,fontSize:12,color:T.n700}}>
                            <div style={{width:4,height:4,borderRadius:"50%",background:T.info,marginTop:5,flexShrink:0}}/>
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* UAZAPI config (Clínica Max) */}
              {clinicPlan==="max"&&(
                <div style={{marginTop:16}}>
                  <SectionCard title="Conexão UAZAPI" desc="Conecte o WhatsApp da clínica para enviar mensagens com seu próprio número" icon={Smartphone} delay={0.1}>

                    {/* Step indicator */}
                    <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:24}}>
                      {[
                        {n:1,label:"Criar instância",done:uazapiStep!=="idle"},
                        {n:2,label:"Escanear QR Code",done:uazapiStep==="connected"},
                        {n:3,label:"Conectado",done:uazapiStep==="connected"},
                      ].map((s,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",flex:i<2?1:"none"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:s.done?T.wa:uazapiStep!=="idle"&&i===1&&uazapiStep==="qr"?T.warning:T.n200,color:s.done||( uazapiStep==="qr"&&i===1)?T.n0:T.n400,transition:"all 300ms"}}>
                              {s.done?<Check size={14}/>:s.n}
                            </div>
                            <span style={{fontSize:12,fontWeight:s.done?600:400,color:s.done?T.wa:T.n400,whiteSpace:"nowrap"}}>{s.label}</span>
                          </div>
                          {i<2&&<div style={{flex:1,height:2,background:s.done?T.wa:T.n200,margin:"0 12px",borderRadius:1,transition:"background 300ms"}}/>}
                        </div>
                      ))}
                    </div>

                    {/* State: Idle - no instance */}
                    {uazapiStep==="idle"&&(
                      <div>
                        <div style={{padding:"20px",background:T.n100,borderRadius:T.radiusMd,textAlign:"center",marginBottom:16}}>
                          <Smartphone size={36} color={T.n300} style={{margin:"0 auto 12px"}}/>
                          <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>Nenhuma instância criada</div>
                          <div style={{fontSize:12,color:T.n400,maxWidth:360,margin:"0 auto",lineHeight:1.5}}>Crie uma instância UAZAPI para conectar o WhatsApp da clínica. Após a criação, você escaneará um QR Code com o celular da clínica.</div>
                        </div>
                        <button onClick={()=>{setUazapiStep("creating");setTimeout(()=>{setUazapiInstance("terapee-clinic-"+Math.random().toString(36).substring(2,8));setUazapiStep("qr")},2000)}} style={{width:"100%",padding:"13px 0",borderRadius:T.radiusMd,border:"none",background:T.wa,color:T.n0,fontFamily:T.font,fontSize:15,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 200ms"}}
                          onMouseEnter={e=>e.currentTarget.style.background=T.waDark}
                          onMouseLeave={e=>e.currentTarget.style.background=T.wa}>
                          <Plus size={18}/> Criar instância
                        </button>
                      </div>
                    )}

                    {/* State: Creating */}
                    {uazapiStep==="creating"&&(
                      <div style={{padding:"40px 20px",textAlign:"center"}}>
                        <Loader2 size={36} color={T.wa} className="spin" style={{margin:"0 auto 16px"}}/>
                        <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Criando instância...</div>
                        <div style={{fontSize:13,color:T.n400}}>Estamos configurando sua instância UAZAPI. Aguarde um momento.</div>
                      </div>
                    )}

                    {/* State: QR Code */}
                    {uazapiStep==="qr"&&(
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:T.successBg,borderRadius:T.radiusMd,marginBottom:16}}>
                          <CheckCircle2 size={15} color={T.success}/>
                          <span style={{fontSize:13,color:T.success,fontWeight:500}}>Instância criada: <code style={{background:"rgba(22,163,74,0.12)",padding:"2px 6px",borderRadius:4,fontSize:12}}>{uazapiInstance}</code></span>
                        </div>

                        <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
                          {/* QR placeholder */}
                          <div style={{flexShrink:0}}>
                            <div style={{width:200,height:200,borderRadius:T.radiusMd,border:`2px solid ${T.n200}`,background:T.n0,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                              {/* Simulated QR code pattern */}
                              <div style={{width:170,height:170,display:"grid",gridTemplateColumns:"repeat(17,1fr)",gap:1}}>
                                {Array.from({length:289}).map((_,i)=>{
                                  const isCorner=(i<3*17+3)||(i%17<3&&i<3*17)||(i%17>=14&&i<3*17)||(i>=14*17&&i%17<3)||(i>=14*17&&i%17>=14);
                                  const rand=Math.random()>0.5;
                                  return <div key={i} style={{background:isCorner||rand?"#303030":"transparent",borderRadius:0.5}}/>;
                                })}
                              </div>
                              <div style={{position:"absolute",width:40,height:40,borderRadius:6,background:T.wa,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <Smartphone size={20} color={T.n0}/>
                              </div>
                            </div>
                            <button onClick={()=>{setUazapiStep("qr")}} style={{width:"100%",marginTop:8,padding:"7px 0",borderRadius:T.radiusSm,border:`1px solid ${T.n300}`,background:T.n0,color:T.n400,fontFamily:T.font,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                              <RefreshCw size={11}/> Gerar novo QR
                            </button>
                          </div>

                          {/* Instructions */}
                          <div style={{flex:1}}>
                            <div style={{fontSize:15,fontWeight:600,marginBottom:12}}>Escaneie o QR Code</div>
                            <div style={{display:"flex",flexDirection:"column",gap:10}}>
                              {[
                                {n:1,text:"Abra o WhatsApp no celular da clínica"},
                                {n:2,text:"Toque em ⋮ Menu (Android) ou Configurações (iPhone)"},
                                {n:3,text:'Toque em "Aparelhos conectados" → "Conectar aparelho"'},
                                {n:4,text:"Aponte a câmera para o QR Code ao lado"},
                              ].map(s=>(
                                <div key={s.n} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                                  <div style={{width:22,height:22,borderRadius:"50%",background:T.wa,color:T.n0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{s.n}</div>
                                  <span style={{fontSize:13,color:T.n700,lineHeight:1.5}}>{s.text}</span>
                                </div>
                              ))}
                            </div>

                            <div style={{marginTop:16,padding:"12px 14px",background:T.warningBg,borderRadius:T.radiusMd,display:"flex",alignItems:"flex-start",gap:8,border:"1px solid rgba(245,158,11,0.15)"}}>
                              <AlertTriangle size={14} color={T.warning} style={{flexShrink:0,marginTop:1}}/>
                              <div style={{fontSize:12,color:T.n700,lineHeight:1.5}}>O QR Code expira em <strong>60 segundos</strong>. Caso expire, clique em "Gerar novo QR" para obter um novo código.</div>
                            </div>

                            <button onClick={()=>setUazapiStep("connected")} style={{marginTop:16,padding:"11px 20px",borderRadius:T.radiusMd,border:"none",background:T.wa,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}
                              onMouseEnter={e=>e.currentTarget.style.background=T.waDark}
                              onMouseLeave={e=>e.currentTarget.style.background=T.wa}>
                              <Check size={15}/> Simular conexão
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* State: Connected */}
                    {uazapiStep==="connected"&&(
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:14,padding:"18px 20px",background:T.waBg,borderRadius:T.radiusMd,border:`1px solid rgba(37,211,102,0.2)`,marginBottom:16}}>
                          <div style={{width:48,height:48,borderRadius:12,background:T.wa,display:"flex",alignItems:"center",justifyContent:"center"}}><Smartphone size={22} color={T.n0}/></div>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{fontSize:16,fontWeight:700,color:T.waDark}}>WhatsApp conectado</span>
                              <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:12,background:"rgba(37,211,102,0.15)"}}>
                                <div style={{width:6,height:6,borderRadius:"50%",background:T.wa}}/>
                                <span style={{fontSize:11,fontWeight:600,color:T.wa}}>Online</span>
                              </div>
                            </div>
                            <div style={{fontSize:13,color:T.n700,marginTop:3}}>{uazapiPhone} · Instância: {uazapiInstance}</div>
                          </div>
                        </div>

                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
                          {[
                            {label:"Mensagens enviadas",value:"1.247",color:T.wa},
                            {label:"Taxa de entrega",value:"98.5%",color:T.success},
                            {label:"Tempo de atividade",value:"15 dias",color:T.info},
                          ].map((s,i)=>(
                            <div key={i} style={{padding:"14px",background:T.n100,borderRadius:T.radiusMd,textAlign:"center"}}>
                              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
                              <div style={{fontSize:11,color:T.n400,marginTop:2}}>{s.label}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>{setUazapiStep("idle");setUazapiInstance("")}} style={{flex:1,padding:"10px 0",borderRadius:T.radiusMd,border:`1.5px solid ${T.error}`,background:T.n0,color:T.error,fontFamily:T.font,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                            <X size={14}/> Desconectar
                          </button>
                          <button style={{flex:1,padding:"10px 0",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n700,fontFamily:T.font,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                            <RefreshCw size={14}/> Reconectar
                          </button>
                        </div>
                      </div>
                    )}
                  </SectionCard>

                  {/* API Info */}
                  <div style={{marginTop:16}}>
                    <SectionCard title="Informações da API" desc="Detalhes técnicos da integração UAZAPI" icon={Key} delay={0.15}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                        <div style={{...FW}}>
                          <label style={LS}>URL da API</label>
                          <div style={{display:"flex",gap:6}}>
                            <input readOnly value="https://api.uazapi.com" style={{...IS,background:T.n100,flex:1}}/>
                            <button style={{padding:"0 12px",borderRadius:T.radiusMd,border:`1px solid ${T.n300}`,background:T.n0,cursor:"pointer",display:"flex",alignItems:"center",color:T.n400}}><Copy size={14}/></button>
                          </div>
                        </div>
                        <div style={{...FW}}>
                          <label style={LS}>Token da instância</label>
                          <div style={{display:"flex",gap:6}}>
                            <input readOnly value={uazapiInstance?"tk_"+uazapiInstance.replace(/-/g,"")+"_secret":"—"} type="password" style={{...IS,background:T.n100,flex:1}}/>
                            <button style={{padding:"0 12px",borderRadius:T.radiusMd,border:`1px solid ${T.n300}`,background:T.n0,cursor:"pointer",display:"flex",alignItems:"center",color:T.n400}}><Eye size={14}/></button>
                          </div>
                        </div>
                      </div>
                      <div style={{padding:"12px 14px",background:T.n100,borderRadius:T.radiusMd,display:"flex",alignItems:"center",gap:8}}>
                        <Info size={14} color={T.n400}/>
                        <span style={{fontSize:12,color:T.n700}}>Documentação da UAZAPI: <a href="https://docs.uazapi.com" target="_blank" rel="noreferrer" style={{color:T.primary500,textDecoration:"none",fontWeight:500}}>docs.uazapi.com</a></span>
                      </div>
                    </SectionCard>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════ TEAM ══════ */}
          {section==="team"&&(
            <div style={{maxWidth:800,animation:"fadeSlideUp 0.3s ease both"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
                <div><h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Equipe e acessos</h2><p style={{fontSize:13,color:T.n400}}>Gerencie os membros da equipe e seus perfis de acesso.</p></div>
                <button onClick={()=>{setEditMember(null);setTeamModal(true)}} style={{padding:"9px 18px",borderRadius:T.radiusMd,border:"none",background:T.primary500,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 200ms"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.primary600}
                  onMouseLeave={e=>e.currentTarget.style.background=T.primary500}>
                  <Plus size={16}/> Convidar membro
                </button>
              </div>

              {/* Roles summary */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
                {Object.entries(ROLES).map(([id,r],i)=>{
                  const count=team.filter(m=>m.role===id&&m.status==="active").length;
                  return(
                    <div key={id} style={{background:T.n0,borderRadius:T.radiusMd,border:`1px solid ${T.n200}`,padding:"14px 16px",animation:`fadeSlideUp 0.3s ease ${i*0.04}s both`}}>
                      <div style={{fontSize:22,fontWeight:700,color:r.color}}>{count}</div>
                      <div style={{fontSize:12,color:T.n400,marginTop:2}}>{r.label}{count!==1?"s":""}</div>
                    </div>
                  );
                })}
              </div>

              {/* Team list */}
              <div style={{background:T.n0,borderRadius:T.radiusLg,border:`1px solid ${T.n200}`,boxShadow:T.shadowSoft,overflow:"hidden"}}>
                {team.map((m,i)=>{
                  const role=ROLES[m.role];
                  const lastLogin=new Date(m.lastLogin);
                  return(
                    <div key={m.id} onClick={()=>{setEditMember(m);setTeamModal(true)}} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:`1px solid ${T.n100}`,cursor:"pointer",transition:"background 150ms",opacity:m.status==="inactive"?0.5:1,animation:`fadeSlideUp 0.3s ease ${i*0.03}s both`}}
                      onMouseEnter={e=>e.currentTarget.style.background=T.n100}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{width:40,height:40,borderRadius:10,background:`${m.color}14`,display:"flex",alignItems:"center",justifyContent:"center",color:m.color,fontWeight:600,fontSize:14,flexShrink:0}}>{getInitials(m.name)}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:14,fontWeight:500}}>{m.name}</span>
                          {m.status==="inactive"&&<Badge color={T.n400} bg="rgba(201,205,216,0.15)">Inativo</Badge>}
                        </div>
                        <div style={{fontSize:12,color:T.n400,marginTop:1}}>{m.email}</div>
                      </div>
                      <Badge color={role.color} bg={`${role.color}12`}>{role.label}</Badge>
                      <div style={{textAlign:"right",minWidth:90}}>
                        <div style={{fontSize:11,color:T.n400}}>Último acesso</div>
                        <div style={{fontSize:12,color:T.n700,marginTop:1}}>{lastLogin.toLocaleDateString("pt-BR")}</div>
                      </div>
                      <Edit3 size={14} color={T.n300}/>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════ INTEGRATIONS ══════ */}
          {section==="integrations"&&(
            <div style={{maxWidth:800,animation:"fadeSlideUp 0.3s ease both"}}>
              <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Integrações</h2>
              <p style={{fontSize:13,color:T.n400,marginBottom:24}}>Conecte ferramentas externas para automatizar processos da clínica.</p>

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))",gap:14}}>
                {INTEGRATIONS.map((intg,i)=>{
                  const Icon=intg.icon;
                  const connected=intg.status==="connected";
                  return(
                    <div key={intg.id} style={{background:T.n0,borderRadius:T.radiusLg,border:`1px solid ${connected?`${intg.color}30`:T.n200}`,boxShadow:T.shadowSoft,padding:20,transition:"all 200ms",animation:`fadeSlideUp 0.3s ease ${i*0.04}s both`,cursor:"pointer"}}
                      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.07)";e.currentTarget.style.transform="translateY(-1px)"}}
                      onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.shadowSoft;e.currentTarget.style.transform="none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                        <div style={{width:44,height:44,borderRadius:12,background:`${intg.color}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <Icon size={20} color={intg.color}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:15,fontWeight:600}}>{intg.name}</div>
                        </div>
                        <Badge color={connected?T.success:T.n400} bg={connected?T.successBg:"rgba(201,205,216,0.12)"}>
                          {connected?<><CheckCircle2 size={11}/> Conectado</>:"Desconectado"}
                        </Badge>
                      </div>
                      <p style={{fontSize:13,color:T.n400,lineHeight:1.5,marginBottom:14}}>{intg.desc}</p>
                      {connected&&intg.config&&Object.keys(intg.config).length>0&&(
                        <div style={{padding:"10px 12px",background:T.n100,borderRadius:T.radiusSm,marginBottom:12}}>
                          {Object.entries(intg.config).map(([k,v])=>(
                            <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 0"}}>
                              <span style={{color:T.n400,textTransform:"capitalize"}}>{k.replace(/([A-Z])/g," $1")}</span>
                              <span style={{color:T.n700,fontWeight:500}}>{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button style={{width:"100%",padding:"9px 0",borderRadius:T.radiusMd,border:connected?`1.5px solid ${T.n300}`:"none",background:connected?T.n0:intg.color,color:connected?T.n700:T.n0,fontFamily:T.font,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"all 200ms"}}>
                        {connected?<><Settings size={13}/> Configurar</>:<><Link size={13}/> Conectar</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════ NOTIFICATIONS ══════ */}
          {section==="notifications"&&(
            <div style={{maxWidth:700,animation:"fadeSlideUp 0.3s ease both"}}>
              <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Notificações</h2>
              <p style={{fontSize:13,color:T.n400,marginBottom:24}}>Configure quais notificações você deseja receber sobre a operação da clínica.</p>

              <SectionCard title="Notificações do sistema" icon={Bell} delay={0.05}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {[
                    {id:"newAppointment",label:"Novo agendamento",desc:"Quando um novo atendimento é marcado",icon:Calendar,color:T.primary500},
                    {id:"cancelledAppointment",label:"Cancelamento",desc:"Quando um atendimento é cancelado",icon:X,color:T.error},
                    {id:"newPatient",label:"Novo paciente",desc:"Quando um novo paciente é cadastrado",icon:Users,color:T.success},
                    {id:"overduePayment",label:"Cobrança atrasada",desc:"Quando uma cobrança passa do vencimento",icon:AlertCircle,color:T.warning},
                    {id:"dailySummary",label:"Resumo diário",desc:"Receba um resumo dos atendimentos do dia às 07:00",icon:Clock,color:T.info},
                    {id:"weeklyReport",label:"Relatório semanal",desc:"Receba relatório completo toda segunda-feira",icon:FileText,color:T.purple},
                  ].map(n=>{
                    const NIcon=n.icon;
                    return(
                      <div key={n.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderRadius:T.radiusMd,transition:"background 150ms"}}
                        onMouseEnter={e=>e.currentTarget.style.background=T.n100}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <div style={{width:34,height:34,borderRadius:8,background:`${n.color}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><NIcon size={15} color={n.color}/></div>
                          <div>
                            <div style={{fontSize:14,fontWeight:500}}>{n.label}</div>
                            <div style={{fontSize:12,color:T.n400,marginTop:1}}>{n.desc}</div>
                          </div>
                        </div>
                        <Toggle value={notif[n.id]} onChange={v=>setNotif(prev=>({...prev,[n.id]:v}))}/>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>
          )}
        </div>

        {/* Save bar */}
        {section!=="team"&&section!=="integrations"&&section!=="whatsapp"&&(
          <SaveBar saving={saving} onSave={handleSave}/>
        )}

        {/* Saved toast */}
        {saved&&(
          <div style={{position:"fixed",bottom:80,right:32,padding:"12px 20px",background:T.success,color:T.n0,borderRadius:T.radiusMd,fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:8,boxShadow:T.shadowMd,animation:"slideUp 250ms ease",zIndex:100}}>
            <CheckCircle2 size={16}/> Alterações salvas com sucesso
          </div>
        )}
      </div>

      <TeamModal open={teamModal} onClose={()=>{setTeamModal(false);setEditMember(null)}} member={editMember}/>
    </div>
  );
}

/* ═══ MAIN EXPORT ═══ */
