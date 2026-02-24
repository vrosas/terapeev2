import { useState, useMemo, useEffect } from 'react'
import { Activity, AlertCircle, Award, BookOpen, Briefcase, Calendar, Check, CheckCircle2, ChevronDown, ChevronUp, Clock, DollarSign, Download, Edit3, Eye, EyeOff, Hash, Heart, Home, Loader2, Mail, MapPin, MoreHorizontal, Phone, Plus, Search, Shield, Star, Trash2, TrendingUp, User, Users, Wrench, X, Zap } from 'lucide-react'
import { T } from '@/utils/theme'
import { Button, Modal, InputField, SelectField, Badge, Card, Avatar, EmptyState, LoadingSpinner, getInitials } from '@/components/ui'
import { useProfessionals, useServices } from '@/lib/hooks'

/* ─── Design Tokens ─── */

/* ─── Specialty Config ─── */
const SPECIALTIES = [
  { id:"psicologia",   label:"Psicologia",           icon:Heart,    color:T.primary500, reg:"CRP" },
  { id:"fisioterapia", label:"Fisioterapia",          icon:Activity, color:T.success,    reg:"CREFITO" },
  { id:"fono",         label:"Fonoaudiologia",        icon:Star,     color:T.warning,    reg:"CRFa" },
  { id:"to",           label:"Terapia Ocupacional",   icon:Wrench,   color:T.purple,     reg:"CREFITO" },
  { id:"neuro",        label:"Neuropsicologia",       icon:Zap,      color:T.teal,       reg:"CRP" },
  { id:"pediatria",    label:"Psicologia Infantil",   icon:Heart,    color:T.pink,       reg:"CRP" },
  { id:"arteterapia",  label:"Arteterapia",           icon:Star,     color:T.orange,     reg:"CRP" },
];

/* ─── Mock Professionals ─── */
const professionals = [
  { id:1, name:"Dra. Ana Costa", email:"ana.costa@terapee.com", phone:"(11) 98765-4321", specialty:"psicologia", regNumber:"CRP 06/123456", color:T.primary500, status:"active", bio:"Especialista em TCC e terapia de casais. 12 anos de experiência clínica.", services:["Psicoterapia Individual","Terapia de Casal","Avaliação Psicológica"], patients:34, monthlyAppts:68, commission:60, availability:{seg:["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"],ter:["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"],qua:["08:00","09:00","10:00","11:00"],qui:["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"],sex:["08:00","09:00","10:00","11:00","14:00","15:00"],sab:[],dom:[]} },
  { id:2, name:"Dr. Carlos Lima", email:"carlos.lima@terapee.com", phone:"(11) 91234-5678", specialty:"fisioterapia", regNumber:"CREFITO 3/98765", color:T.success, status:"active", bio:"Fisioterapeuta esportivo com foco em reabilitação pós-cirúrgica.", services:["Fisioterapia Geral","Fisioterapia Esportiva","RPG"], patients:28, monthlyAppts:92, commission:55, availability:{seg:["07:00","08:00","09:00","10:00","11:00","14:00","15:00","16:00"],ter:["07:00","08:00","09:00","10:00","11:00","14:00","15:00","16:00"],qua:["07:00","08:00","09:00","10:00","11:00"],qui:["07:00","08:00","09:00","10:00","11:00","14:00","15:00","16:00"],sex:["07:00","08:00","09:00","10:00","11:00"],sab:["08:00","09:00","10:00","11:00"],dom:[]} },
  { id:3, name:"Dra. Beatriz Rocha", email:"beatriz.rocha@terapee.com", phone:"(11) 99876-5432", specialty:"fono", regNumber:"CRFa 2/54321", color:T.warning, status:"active", bio:"Fonoaudióloga com especialização em linguagem infantil e disfagia.", services:["Fonoaudiologia Infantil","Avaliação Audiológica","Terapia de Linguagem"], patients:22, monthlyAppts:55, commission:55, availability:{seg:["09:00","10:00","11:00","14:00","15:00","16:00"],ter:["09:00","10:00","11:00","14:00","15:00","16:00"],qua:[],qui:["09:00","10:00","11:00","14:00","15:00","16:00"],sex:["09:00","10:00","11:00"],sab:[],dom:[]} },
  { id:4, name:"Dr. Ricardo Alves", email:"ricardo.alves@terapee.com", phone:"(11) 92345-6789", specialty:"to", regNumber:"CREFITO 3/67890", color:T.purple, status:"active", bio:"Terapeuta ocupacional especializado em reabilitação neurológica e AVDs.", services:["Terapia Ocupacional","Reabilitação Neurológica","Estimulação Cognitiva"], patients:18, monthlyAppts:42, commission:55, availability:{seg:["08:00","09:00","10:00","11:00","14:00","15:00"],ter:[],qua:["08:00","09:00","10:00","11:00","14:00","15:00"],qui:["08:00","09:00","10:00","11:00","14:00","15:00"],sex:["08:00","09:00","10:00","11:00"],sab:[],dom:[]} },
  { id:5, name:"Dra. Marina Souza", email:"marina.souza@terapee.com", phone:"(11) 93456-7890", specialty:"neuro", regNumber:"CRP 06/234567", color:T.teal, status:"active", bio:"Neuropsicóloga com foco em avaliação e reabilitação cognitiva.", services:["Avaliação Neuropsicológica","Reabilitação Cognitiva"], patients:15, monthlyAppts:30, commission:65, availability:{seg:["09:00","10:00","11:00"],ter:["09:00","10:00","11:00","14:00","15:00"],qua:["09:00","10:00","11:00"],qui:[],sex:["09:00","10:00","11:00","14:00","15:00"],sab:[],dom:[]} },
  { id:6, name:"Dra. Patrícia Mendes", email:"patricia.mendes@terapee.com", phone:"(11) 94567-8901", specialty:"pediatria", regNumber:"CRP 06/345678", color:T.pink, status:"inactive", bio:"Psicóloga infantil. Atualmente em licença maternidade.", services:["Psicoterapia Infantil","Orientação de Pais","Avaliação Infantil"], patients:20, monthlyAppts:0, commission:60, availability:{seg:[],ter:[],qua:[],qui:[],sex:[],sab:[],dom:[]} },
];

/* ─── Mock Services ─── */

const WEEKDAYS = [{id:"seg",label:"Seg"},{id:"ter",label:"Ter"},{id:"qua",label:"Qua"},{id:"qui",label:"Qui"},{id:"sex",label:"Sex"},{id:"sab",label:"Sáb"},{id:"dom",label:"Dom"}];
const TIME_SLOTS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

/* ═══ Sidebar ═══ */


const IS={width:"100%",padding:"10px 12px",border:`1.5px solid ${T.n300}`,borderRadius:T.radiusMd,fontSize:14,fontFamily:T.font,color:T.n900,outline:"none",boxSizing:"border-box",background:T.n0};
const LS={display:"block",fontSize:13,fontWeight:500,color:T.n700,marginBottom:5};
const FW={marginBottom:16};


/* ═══ Availability Grid ═══ */
function AvailabilityGrid({value,onChange,readOnly}){
  const toggle=(day,time)=>{
    if(readOnly) return;
    const curr=value[day]||[];
    const next=curr.includes(time)?curr.filter(t=>t!==time):[...curr,time].sort();
    onChange({...value,[day]:next});
  };
  const toggleDay=(day)=>{
    if(readOnly) return;
    const curr=value[day]||[];
    if(curr.length>0) onChange({...value,[day]:[]});
    else onChange({...value,[day]:[...TIME_SLOTS]});
  };

  const cells = [];
  // Header row
  cells.push(<div key="corner" />);
  WEEKDAYS.forEach(d => {
    cells.push(
      <div key={`h-${d.id}`} onClick={()=>toggleDay(d.id)}
        style={{textAlign:"center",fontSize:12,fontWeight:600,color:T.n700,padding:"6px 0",cursor:readOnly?"default":"pointer",userSelect:"none",borderRadius:4}}>
        {d.label}
      </div>
    );
  });
  // Time rows
  TIME_SLOTS.forEach(time => {
    cells.push(
      <div key={`t-${time}`} style={{fontSize:11,color:T.n400,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:6,fontFamily:"monospace"}}>
        {time}
      </div>
    );
    WEEKDAYS.forEach(d => {
      const active=(value[d.id]||[]).includes(time);
      cells.push(
        <div key={`${d.id}-${time}`} onClick={()=>toggle(d.id,time)}
          style={{height:26,borderRadius:4,background:active?T.primary500:"transparent",border:`1px solid ${active?T.primary500:T.n200}`,cursor:readOnly?"default":"pointer",transition:"all 150ms",opacity:active?1:0.5}}
        />
      );
    });
  });

  return(
    <div style={{overflowX:"auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"56px repeat(7,1fr)",gap:2,minWidth:500}}>
        {cells}
      </div>
      {!readOnly&&<div style={{fontSize:11,color:T.n400,marginTop:8}}>Clique nos horários para ativar/desativar. Clique no dia para selecionar todos.</div>}
    </div>
  );
}

/* ═══ Professional Modal ═══ */
function ProfessionalModal({open,onClose,professional,services=[],onCreate,onUpdate}){
  const isEdit=!!professional;
  const[tab,setTab]=useState("info");
  const[form,setForm]=useState({name:"",email:"",phone:"",specialty:"",regNumber:"",bio:"",commission:"60",status:"active"});
  const[availability,setAvailability]=useState({seg:[],ter:[],qua:[],qui:[],sex:[],sab:[],dom:[]});
  const[selectedServices,setSelectedServices]=useState([]);
  const[saving,setSaving]=useState(false);

  useEffect(()=>{
    if(open&&professional){
      setForm({name:professional.name,email:professional.email,phone:professional.phone,specialty:professional.specialty,regNumber:professional.regNumber,bio:professional.bio,commission:String(professional.commission),status:professional.status});
      setAvailability({...professional.availability});
      setSelectedServices([...(professional.services||[])]);
      setTab("info");
    } else if(open){
      setForm({name:"",email:"",phone:"",specialty:"",regNumber:"",bio:"",commission:"60",status:"active"});
      setAvailability({seg:[],ter:[],qua:[],qui:[],sex:[],sab:[],dom:[]});
      setSelectedServices([]);
      setTab("info");
    }
  },[open,professional]);

  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleService=s=>{setSelectedServices(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s])};
  const save=async()=>{
    if(!form.name.trim()) return;
    setSaving(true);
    const payload={full_name:form.name,email:form.email,phone:form.phone,specialties:form.specialty?[form.specialty]:[],crp:form.regNumber,bio:form.bio,commission_percent:parseFloat(form.commission)||60,is_active:form.status==="active",working_hours:availability};
    const{error}=isEdit?await(onUpdate?.(professional.id,payload)??Promise.resolve({})):await(onCreate?.(payload)??Promise.resolve({}));
    setSaving(false);
    if(!error) onClose("saved");
  };
  if(!open) return null;

  const spec=SPECIALTIES.find(s=>s.id===form.specialty);
  const modalTabs=[{id:"info",label:"Dados pessoais"},{id:"services",label:"Serviços"},{id:"availability",label:"Disponibilidade"}];

  return(
    <div onClick={()=>onClose()} style={{position:"fixed",inset:0,background:"rgba(17,17,17,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",animation:"fadeIn 150ms ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:640,background:T.n0,borderRadius:T.radiusLg,boxShadow:T.shadowLg,overflow:"hidden",animation:"slideUp 250ms ease",maxHeight:"92vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${T.n200}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {isEdit&&<div style={{width:40,height:40,borderRadius:10,background:`${professional.color}14`,display:"flex",alignItems:"center",justifyContent:"center",color:professional.color,fontWeight:700,fontSize:16}}>{getInitials(professional.name)}</div>}
            <div>
              <h2 style={{fontSize:18,fontWeight:700}}>{isEdit?"Editar profissional":"Novo profissional"}</h2>
              {isEdit&&<div style={{fontSize:12,color:T.n400,marginTop:1}}>{professional.regNumber}</div>}
            </div>
          </div>
          <button onClick={()=>onClose()} style={{width:32,height:32,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400}}><X size={18}/></button>
        </div>

        <div style={{display:"flex",borderBottom:`1px solid ${T.n200}`,padding:"0 24px"}}>
          {modalTabs.map(t=>{const active=tab===t.id;return<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"12px 16px",border:"none",cursor:"pointer",fontFamily:T.font,fontSize:13,fontWeight:active?600:400,color:active?T.primary500:T.n400,background:"transparent",borderBottom:`2px solid ${active?T.primary500:"transparent"}`,marginBottom:-1,transition:"all 150ms"}}>{t.label}</button>})}
        </div>

        <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
          {tab==="info"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{...FW,gridColumn:"1 / -1"}}><label style={LS}>Nome completo *</label><input value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="Dr(a). Nome Sobrenome" style={IS}/></div>
                <div style={FW}><label style={LS}>Especialidade *</label><select value={form.specialty} onChange={e=>upd("specialty",e.target.value)} style={{...IS,cursor:"pointer",appearance:"auto"}}><option value="">Selecionar...</option>{SPECIALTIES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
                <div style={FW}><label style={LS}>Nº de registro ({spec?.reg||"CRP/CREFITO"}) *</label><input value={form.regNumber} onChange={e=>upd("regNumber",e.target.value)} placeholder={`${spec?.reg||"CRP"} 00/000000`} style={IS}/></div>
                <div style={FW}><label style={LS}>E-mail *</label><input value={form.email} onChange={e=>upd("email",e.target.value)} placeholder="email@clinica.com" style={IS}/></div>
                <div style={FW}><label style={LS}>Telefone</label><input value={form.phone} onChange={e=>upd("phone",e.target.value)} placeholder="(11) 99999-9999" style={IS}/></div>
              </div>
              <div style={FW}><label style={LS}>Biografia / Descrição</label><textarea value={form.bio} onChange={e=>upd("bio",e.target.value)} placeholder="Breve descrição da formação e especialidades..." style={{...IS,minHeight:70,resize:"vertical"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={FW}>
                  <label style={LS}>Comissão (%)</label>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input type="range" min="0" max="100" value={form.commission} onChange={e=>upd("commission",e.target.value)} style={{flex:1,accentColor:T.primary500}}/>
                    <span style={{fontSize:14,fontWeight:600,color:T.primary500,minWidth:36,textAlign:"right"}}>{form.commission}%</span>
                  </div>
                </div>
                <div style={FW}>
                  <label style={LS}>Status</label>
                  <div style={{display:"flex",gap:8}}>
                    {[{id:"active",label:"Ativo",color:T.success},{id:"inactive",label:"Inativo",color:T.n400}].map(s=>(
                      <button key={s.id} onClick={()=>upd("status",s.id)} style={{flex:1,padding:"9px 14px",borderRadius:T.radiusMd,cursor:"pointer",border:`1.5px solid ${form.status===s.id?s.color:T.n300}`,background:form.status===s.id?`${s.color}12`:T.n0,color:form.status===s.id?s.color:T.n400,fontFamily:T.font,fontSize:13,fontWeight:500,transition:"all 200ms",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                        {form.status===s.id&&<CheckCircle2 size={13}/>}{s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==="services"&&(
            <div>
              <div style={{fontSize:13,color:T.n400,marginBottom:16}}>Selecione os serviços que este profissional pode realizar:</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {services.filter(s=>s.status==="active").map(svc=>{
                  const sel=selectedServices.includes(svc.name);
                  return(
                    <div key={svc.id} onClick={()=>toggleService(svc.name)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:T.radiusMd,border:`1.5px solid ${sel?T.primary500:T.n300}`,background:sel?T.primary50:T.n0,cursor:"pointer",transition:"all 200ms"}}>
                      <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${sel?T.primary500:T.n300}`,background:sel?T.primary500:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 200ms",flexShrink:0}}>{sel&&<Check size={13} color={T.n0}/>}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:500,color:sel?T.primary600:T.n900}}>{svc.name}</div>
                        <div style={{fontSize:12,color:T.n400,marginTop:1}}>{svc.duration}min · R$ {svc.price}</div>
                      </div>
                      <div style={{width:8,height:8,borderRadius:2,background:svc.color,flexShrink:0}}/>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:12,color:T.n400,marginTop:12}}>{selectedServices.length} serviço(s) selecionado(s)</div>
            </div>
          )}

          {tab==="availability"&&(
            <div>
              <div style={{fontSize:13,color:T.n400,marginBottom:16}}>Configure os horários disponíveis para atendimento:</div>
              <AvailabilityGrid value={availability} onChange={setAvailability}/>
              <div style={{marginTop:16,padding:"12px 16px",background:T.n100,borderRadius:T.radiusMd,display:"flex",alignItems:"center",gap:8}}>
                <Clock size={14} color={T.n400}/>
                <span style={{fontSize:12,color:T.n700}}>
                  {Object.values(availability).flat().length} horários por semana · {WEEKDAYS.filter(d=>(availability[d.id]||[]).length>0).length} dias ativos
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{padding:"16px 24px",borderTop:`1px solid ${T.n200}`,display:"flex",justifyContent:"space-between"}}>
          <button onClick={()=>onClose()} style={{padding:"11px 18px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n700,fontFamily:T.font,fontSize:14,fontWeight:500,cursor:"pointer"}}>Cancelar</button>
          <button onClick={save} disabled={saving} style={{padding:"11px 20px",borderRadius:T.radiusMd,border:"none",background:T.primary500,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,opacity:saving?0.7:1,transition:"all 200ms"}}
            onMouseEnter={e=>{if(!saving)e.currentTarget.style.background=T.primary600}}
            onMouseLeave={e=>e.currentTarget.style.background=T.primary500}>
            {saving?<Loader2 size={15} className="spin"/>:<Check size={15}/>} {isEdit?"Salvar alterações":"Cadastrar profissional"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Service Modal ═══ */
function ServiceModal({open,onClose,service,professionals=[],onCreate,onUpdate}){
  const isEdit=!!service;
  const[form,setForm]=useState({name:"",category:"",duration:"50",price:"",description:"",status:"active"});
  const[selectedProfs,setSelectedProfs]=useState([]);
  const[saving,setSaving]=useState(false);

  useEffect(()=>{
    if(open&&service){
      setForm({name:service.name,category:service.category,duration:String(service.duration),price:String(service.price),description:service.description,status:service.status});
      setSelectedProfs([...(service.professionals||[])]);
    } else if(open){
      setForm({name:"",category:"",duration:"50",price:"",description:"",status:"active"});
      setSelectedProfs([]);
    }
  },[open,service]);

  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleProf=id=>setSelectedProfs(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const save=async()=>{
    if(!form.name.trim()) return;
    setSaving(true);
    const payload={name:form.name,category:form.category,duration_minutes:parseInt(form.duration)||50,price:parseFloat(form.price)||0,description:form.description,is_active:form.status==="active"};
    const{error}=isEdit?await(onUpdate?.(service.id,payload)??Promise.resolve({})):await(onCreate?.(payload)??Promise.resolve({}));
    setSaving(false);
    if(!error) onClose("saved");
  };
  if(!open) return null;

  return(
    <div onClick={()=>onClose()} style={{position:"fixed",inset:0,background:"rgba(17,17,17,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",animation:"fadeIn 150ms ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:540,background:T.n0,borderRadius:T.radiusLg,boxShadow:T.shadowLg,overflow:"hidden",animation:"slideUp 250ms ease",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${T.n200}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h2 style={{fontSize:18,fontWeight:700}}>{isEdit?"Editar serviço":"Novo serviço"}</h2>
          <button onClick={()=>onClose()} style={{width:32,height:32,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400}}><X size={18}/></button>
        </div>
        <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
          <div style={FW}><label style={LS}>Nome do serviço *</label><input value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="Ex: Psicoterapia Individual" style={IS}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={FW}><label style={LS}>Categoria *</label><select value={form.category} onChange={e=>upd("category",e.target.value)} style={{...IS,cursor:"pointer",appearance:"auto"}}><option value="">Selecionar...</option>{SPECIALTIES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
            <div style={FW}>
              <label style={LS}>Status</label>
              <div style={{display:"flex",gap:8}}>
                {[{id:"active",label:"Ativo",color:T.success},{id:"inactive",label:"Inativo",color:T.n400}].map(s=>(
                  <button key={s.id} onClick={()=>upd("status",s.id)} style={{flex:1,padding:"9px 0",borderRadius:T.radiusMd,cursor:"pointer",border:`1.5px solid ${form.status===s.id?s.color:T.n300}`,background:form.status===s.id?`${s.color}12`:T.n0,color:form.status===s.id?s.color:T.n400,fontFamily:T.font,fontSize:13,fontWeight:500,transition:"all 200ms"}}>{s.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={FW}>
              <label style={LS}>Duração (min) *</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[30,40,45,50,60,80,90,120].map(d=>(
                  <button key={d} onClick={()=>upd("duration",String(d))} style={{padding:"7px 10px",borderRadius:T.radiusSm,cursor:"pointer",border:`1.5px solid ${form.duration===String(d)?T.primary500:T.n300}`,background:form.duration===String(d)?T.primary50:T.n0,color:form.duration===String(d)?T.primary500:T.n400,fontFamily:T.font,fontSize:12,fontWeight:500,transition:"all 200ms",minWidth:36,textAlign:"center"}}>{d}</button>
                ))}
              </div>
            </div>
            <div style={FW}>
              <label style={LS}>Valor (R$) *</label>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T.n400,fontWeight:500}}>R$</span>
                <input type="number" value={form.price} onChange={e=>upd("price",e.target.value)} placeholder="0,00" style={{...IS,paddingLeft:38}}/>
              </div>
            </div>
          </div>
          <div style={FW}><label style={LS}>Descrição</label><textarea value={form.description} onChange={e=>upd("description",e.target.value)} placeholder="Descreva o serviço..." style={{...IS,minHeight:60,resize:"vertical"}}/></div>
          <div style={FW}>
            <label style={LS}>Profissionais vinculados</label>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {professionals.filter(p=>p.status==="active").map(p=>{
                const sel=selectedProfs.includes(p.id);
                const spec=SPECIALTIES.find(s=>s.id===p.specialty);
                const SpecIcon=spec?.icon||User;
                return(
                  <div key={p.id} onClick={()=>toggleProf(p.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:T.radiusMd,border:`1.5px solid ${sel?T.primary500:T.n300}`,background:sel?T.primary50:T.n0,cursor:"pointer",transition:"all 200ms"}}>
                    <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${sel?T.primary500:T.n300}`,background:sel?T.primary500:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 200ms",flexShrink:0}}>{sel&&<Check size={11} color={T.n0}/>}</div>
                    <div style={{width:30,height:30,borderRadius:8,background:`${p.color}14`,display:"flex",alignItems:"center",justifyContent:"center",color:p.color,fontWeight:600,fontSize:11,flexShrink:0}}>{getInitials(p.name)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500}}>{p.name}</div>
                      <div style={{fontSize:11,color:T.n400}}>{spec?.label} · {p.regNumber}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{padding:"16px 24px",borderTop:`1px solid ${T.n200}`,display:"flex",justifyContent:"space-between"}}>
          <button onClick={()=>onClose()} style={{padding:"11px 18px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n700,fontFamily:T.font,fontSize:14,fontWeight:500,cursor:"pointer"}}>Cancelar</button>
          <button onClick={save} disabled={saving} style={{padding:"11px 20px",borderRadius:T.radiusMd,border:"none",background:T.primary500,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,opacity:saving?0.7:1,transition:"all 200ms"}}
            onMouseEnter={e=>{if(!saving)e.currentTarget.style.background=T.primary600}}
            onMouseLeave={e=>e.currentTarget.style.background=T.primary500}>
            {saving?<Loader2 size={15} className="spin"/>:<Check size={15}/>} {isEdit?"Salvar":"Criar serviço"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Professional Detail Modal ═══ */
function ProfessionalDetail({professional,onClose,onEdit,services=[]}){
  if(!professional) return null;
  const spec=SPECIALTIES.find(s=>s.id===professional.specialty);
  const SpecIcon=spec?.icon||User;
  const profServices=services.filter(s=>(s.professionals||[]).includes(professional.id));
  const totalSlots=Object.values(professional.availability).flat().length;
  const activeDays=WEEKDAYS.filter(d=>(professional.availability[d.id]||[]).length>0);

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(17,17,17,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",animation:"fadeIn 150ms ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:580,background:T.n0,borderRadius:T.radiusLg,boxShadow:T.shadowLg,overflow:"hidden",animation:"slideUp 250ms ease",maxHeight:"92vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"24px",background:`linear-gradient(135deg, ${professional.color}08, ${professional.color}14)`,borderBottom:`1px solid ${T.n200}`}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:56,height:56,borderRadius:14,background:`${professional.color}20`,display:"flex",alignItems:"center",justifyContent:"center",color:professional.color,fontWeight:700,fontSize:20,border:`2px solid ${professional.color}30`}}>{getInitials(professional.name)}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <h2 style={{fontSize:20,fontWeight:700}}>{professional.name}</h2>
                <Badge color={professional.status==="active"?T.success:T.n400} bg={professional.status==="active"?T.successBg:"rgba(201,205,216,0.15)"}>{professional.status==="active"?"Ativo":"Inativo"}</Badge>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                <div style={{display:"flex",alignItems:"center",gap:4,fontSize:13,color:T.n700}}>
                  <SpecIcon size={14} color={spec?.color}/> {spec?.label}
                </div>
                <span style={{color:T.n300}}>·</span>
                <span style={{fontSize:13,color:T.n400}}>{professional.regNumber}</span>
              </div>
            </div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:"none",cursor:"pointer",background:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400}}><X size={18}/></button>
          </div>
          {professional.bio&&<p style={{fontSize:13,color:T.n700,marginTop:14,lineHeight:1.5}}>{professional.bio}</p>}
        </div>

        <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
            {[
              {label:"Pacientes",value:professional.patients,icon:Users,color:T.primary500},
              {label:"Atend./mês",value:professional.monthlyAppts,icon:Calendar,color:T.success},
              {label:"Comissão",value:`${professional.commission}%`,icon:DollarSign,color:T.warning}
            ].map((s,i)=>{
              const SIcon=s.icon;
              return(
                <div key={i} style={{padding:"14px",background:T.n100,borderRadius:T.radiusMd,textAlign:"center"}}>
                  <SIcon size={16} color={s.color} style={{margin:"0 auto 6px",display:"block"}}/>
                  <div style={{fontSize:20,fontWeight:700,color:T.n900}}>{s.value}</div>
                  <div style={{fontSize:11,color:T.n400,marginTop:2}}>{s.label}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:T.n700,padding:"8px 12px",background:T.n100,borderRadius:T.radiusSm}}>
              <Mail size={13} color={T.n400}/>{professional.email}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:T.n700,padding:"8px 12px",background:T.n100,borderRadius:T.radiusSm}}>
              <Phone size={13} color={T.n400}/>{professional.phone}
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:8}}>Serviços ({profServices.length})</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {profServices.map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:T.radiusMd,border:`1px solid ${T.n200}`,background:T.n0,fontSize:13}}>
                  <div style={{width:6,height:6,borderRadius:2,background:s.color}}/>
                  <span style={{fontWeight:500}}>{s.name}</span>
                  <span style={{color:T.n400,fontSize:11}}>{s.duration}min · R$ {s.price}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:600}}>Disponibilidade</div>
              <span style={{fontSize:12,color:T.n400}}>{totalSlots} horários · {activeDays.length} dias</span>
            </div>
            <AvailabilityGrid value={professional.availability} readOnly={true}/>
          </div>
        </div>
        <div style={{padding:"16px 24px",borderTop:`1px solid ${T.n200}`,display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={()=>{onClose();setTimeout(()=>onEdit(professional),200)}} style={{padding:"10px 18px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n700,fontFamily:T.font,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
            <Edit3 size={14}/> Editar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ MAIN CONTENT ═══ */
export default function Profissionais(){
  /* ─── Hooks ─── */
  const { data: rawProfessionals, create: createProfessional, update: updateProfessional } = useProfessionals();
  const { data: rawServices, create: createService, update: updateService } = useServices();

  /* ─── Adapt hook data → UI shape ─── */
  const profList = useMemo(()=>rawProfessionals.map(p=>({
    id:p.id, name:p.full_name||'', email:p.email||'', phone:p.phone||'',
    specialty:(p.specialties||[])[0]||'', regNumber:p.crp||'',
    color:p.color||T.primary500, status:p.is_active?"active":"inactive",
    bio:p.bio||'', commission:p.commission_percent||60,
    patients:0, monthlyAppts:0,
    availability:p.working_hours||{seg:[],ter:[],qua:[],qui:[],sex:[],sab:[],dom:[]},
    services:[],
  })),[rawProfessionals]);

  const svcList = useMemo(()=>rawServices.map(s=>({
    id:s.id, name:s.name||'', category:s.category||'',
    duration:s.duration_minutes||50, price:s.price||0,
    description:s.description||'', status:s.is_active?"active":"inactive",
    color:s.color||T.primary500,
    professionals:(s.service_professionals||[]).map(sp=>sp.professional?.id).filter(Boolean),
  })),[rawServices]);

  const[tab,setTab]=useState("professionals");
  const[search,setSearch]=useState("");
  const[specFilter,setSpecFilter]=useState("all");
  const[statusFilter,setStatusFilter]=useState("all");
  const[profModal,setProfModal]=useState(false);
  const[editProf,setEditProf]=useState(null);
  const[detailProf,setDetailProf]=useState(null);
  const[svcModal,setSvcModal]=useState(false);
  const[editSvc,setEditSvc]=useState(null);

  const filteredProfs=useMemo(()=>profList.filter(p=>{
    const ms=!search||p.name.toLowerCase().includes(search.toLowerCase())||p.regNumber.toLowerCase().includes(search.toLowerCase());
    const msp=specFilter==="all"||p.specialty===specFilter;
    const mst=statusFilter==="all"||p.status===statusFilter;
    return ms&&msp&&mst;
  }),[profList,search,specFilter,statusFilter]);

  const filteredSvcs=useMemo(()=>svcList.filter(s=>{
    const ms=!search||s.name.toLowerCase().includes(search.toLowerCase());
    const msp=specFilter==="all"||s.category===specFilter;
    const mst=statusFilter==="all"||s.status===statusFilter;
    return ms&&msp&&mst;
  }),[svcList,search,specFilter,statusFilter]);

  const totalActive=profList.filter(p=>p.status==="active").length;
  const totalServices=svcList.filter(s=>s.status==="active").length;
  const totalPatients=profList.reduce((s,p)=>s+p.patients,0);
  const totalAppts=profList.reduce((s,p)=>s+p.monthlyAppts,0);

  const mainTabs=[{id:"professionals",label:"Profissionais",icon:Award,count:profList.length},{id:"services",label:"Catálogo de serviços",icon:Briefcase,count:svcList.length}];

  const handleEditProf=(p)=>{setEditProf(p);setProfModal(true)};

  return(
    <div style={{padding:"24px 28px",maxWidth:1320}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,animation:"fadeSlideUp 0.3s ease both"}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700}}>Profissionais e Serviços</h1>
          <p style={{fontSize:13,color:T.n400,marginTop:2}}>Equipe clínica, catálogo de serviços e disponibilidade</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          {tab==="professionals"&&(
            <button onClick={()=>{setEditProf(null);setProfModal(true)}} style={{padding:"9px 18px",borderRadius:T.radiusMd,border:"none",background:T.primary500,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 200ms"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.primary600}
              onMouseLeave={e=>e.currentTarget.style.background=T.primary500}>
              <Plus size={16}/> Novo profissional
            </button>
          )}
          {tab==="services"&&(
            <button onClick={()=>{setEditSvc(null);setSvcModal(true)}} style={{padding:"9px 18px",borderRadius:T.radiusMd,border:"none",background:T.primary500,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 200ms"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.primary600}
              onMouseLeave={e=>e.currentTarget.style.background=T.primary500}>
              <Plus size={16}/> Novo serviço
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {[
          {icon:Award,label:"Profissionais ativos",value:totalActive,color:T.primary500,delay:0.05},
          {icon:Briefcase,label:"Serviços ativos",value:totalServices,color:T.success,delay:0.1},
          {icon:Users,label:"Total de pacientes",value:totalPatients,color:T.warning,delay:0.15},
          {icon:Calendar,label:"Atendimentos/mês",value:totalAppts,color:T.purple,delay:0.2},
        ].map((s,i)=>{
          const SIcon=s.icon;
          return(
            <div key={i} style={{background:T.n0,borderRadius:T.radiusLg,padding:"20px 22px",boxShadow:T.shadowSoft,border:`1px solid ${T.n200}`,display:"flex",alignItems:"center",gap:14,animation:`fadeSlideUp 0.4s ease ${s.delay}s both`,transition:"box-shadow 200ms,transform 200ms",cursor:"default"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.06)";e.currentTarget.style.transform="translateY(-1px)"}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.shadowSoft;e.currentTarget.style.transform="none"}}>
              <div style={{width:44,height:44,borderRadius:12,background:`${s.color}14`,display:"flex",alignItems:"center",justifyContent:"center"}}><SIcon size={20} color={s.color}/></div>
              <div>
                <div style={{fontSize:24,fontWeight:700,letterSpacing:"-0.02em"}}>{s.value}</div>
                <div style={{fontSize:13,color:T.n400}}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`2px solid ${T.n200}`,marginBottom:20}}>
        {mainTabs.map(t=>{
          const active=tab===t.id;
          const TIcon=t.icon;
          return(
            <button key={t.id} onClick={()=>{setTab(t.id);setSearch("");setSpecFilter("all");setStatusFilter("all")}}
              style={{display:"flex",alignItems:"center",gap:6,padding:"12px 20px",border:"none",cursor:"pointer",fontFamily:T.font,fontSize:14,fontWeight:active?600:400,color:active?T.primary500:T.n400,background:"transparent",borderBottom:`2px solid ${active?T.primary500:"transparent"}`,marginBottom:-2,transition:"all 150ms"}}>
              <TIcon size={16}/> {t.label}
              <span style={{fontSize:11,fontWeight:600,padding:"1px 7px",borderRadius:10,background:active?T.primary50:T.n200,color:active?T.primary500:T.n400}}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{flex:1,maxWidth:320,display:"flex",alignItems:"center",border:`1.5px solid ${T.n300}`,borderRadius:T.radiusMd,background:T.n0,overflow:"hidden"}}>
          <span style={{paddingLeft:12,color:T.n400,display:"flex"}}><Search size={16}/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tab==="professionals"?"Buscar profissional...":"Buscar serviço..."} style={{flex:1,border:"none",outline:"none",padding:"10px 12px",fontSize:13,fontFamily:T.font,color:T.n900,background:"transparent"}}/>
          {search&&<button onClick={()=>setSearch("")} style={{border:"none",background:"none",cursor:"pointer",padding:"0 10px",color:T.n400,display:"flex"}}><X size={14}/></button>}
        </div>
        <select value={specFilter} onChange={e=>setSpecFilter(e.target.value)} style={{padding:"9px 12px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,fontFamily:T.font,fontSize:13,color:T.n700,cursor:"pointer",appearance:"auto",outline:"none"}}>
          <option value="all">Todas as especialidades</option>
          {SPECIALTIES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <div style={{display:"flex",gap:6}}>
          {[{id:"all",label:"Todos"},{id:"active",label:"Ativos",color:T.success},{id:"inactive",label:"Inativos",color:T.n400}].map(f=>(
            <button key={f.id} onClick={()=>setStatusFilter(f.id)} style={{padding:"7px 14px",borderRadius:20,cursor:"pointer",border:`1.5px solid ${statusFilter===f.id?(f.color||T.primary500):T.n300}`,background:statusFilter===f.id?(f.color?`${f.color}12`:T.primary50):T.n0,color:statusFilter===f.id?(f.color||T.primary500):T.n400,fontFamily:T.font,fontSize:12,fontWeight:500,transition:"all 200ms"}}>{f.label}</button>
          ))}
        </div>
        <span style={{fontSize:12,color:T.n400,marginLeft:"auto"}}>{tab==="professionals"?filteredProfs.length:filteredSvcs.length} resultado(s)</span>
      </div>

      {/* PROFESSIONALS GRID */}
      {tab==="professionals"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(360px, 1fr))",gap:14,animation:"fadeSlideUp 0.3s ease both"}}>
          {filteredProfs.map((p,i)=>{
            const spec=SPECIALTIES.find(s=>s.id===p.specialty);
            const SpecIcon=spec?.icon||User;
            const profServices=services.filter(s=>s.professionals.includes(p.id));
            const totalSlots=Object.values(p.availability).flat().length;
            return(
              <div key={p.id} onClick={()=>setDetailProf(p)} style={{background:T.n0,borderRadius:T.radiusLg,border:`1px solid ${T.n200}`,boxShadow:T.shadowSoft,overflow:"hidden",cursor:"pointer",transition:"all 200ms",animation:`fadeSlideUp 0.3s ease ${i*0.04}s both`,opacity:p.status==="inactive"?0.6:1}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,0.08)";e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.shadowSoft;e.currentTarget.style.transform="none"}}>
                <div style={{height:4,background:`linear-gradient(90deg, ${p.color}, ${p.color}80)`}}/>
                <div style={{padding:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                    <div style={{width:48,height:48,borderRadius:12,background:`${p.color}14`,display:"flex",alignItems:"center",justifyContent:"center",color:p.color,fontWeight:700,fontSize:17,border:`2px solid ${p.color}20`,flexShrink:0}}>{getInitials(p.name)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{fontSize:15,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                        {p.status==="inactive"&&<Badge color={T.n400} bg="rgba(201,205,216,0.15)">Inativo</Badge>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                        <SpecIcon size={13} color={spec?.color}/>
                        <span style={{fontSize:12,color:T.n700}}>{spec?.label}</span>
                        <span style={{color:T.n300}}>·</span>
                        <span style={{fontSize:12,color:T.n400}}>{p.regNumber}</span>
                      </div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();handleEditProf(p)}} style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.n200}`,background:T.n0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400,transition:"all 150ms",flexShrink:0}}>
                      <Edit3 size={13}/>
                    </button>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                    {profServices.slice(0,3).map(s=>(
                      <span key={s.id} style={{fontSize:11,padding:"3px 8px",borderRadius:4,background:`${s.color}10`,color:s.color,fontWeight:500}}>{s.name}</span>
                    ))}
                    {profServices.length>3&&<span style={{fontSize:11,padding:"3px 8px",borderRadius:4,background:T.n100,color:T.n400}}>+{profServices.length-3}</span>}
                  </div>
                  <div style={{display:"flex",gap:0,borderTop:`1px solid ${T.n200}`,paddingTop:12}}>
                    {[{label:"Pacientes",value:p.patients},{label:"Atend./mês",value:p.monthlyAppts},{label:"Horários/sem",value:totalSlots}].map((s,j)=>(
                      <div key={j} style={{flex:1,textAlign:"center",borderRight:j<2?`1px solid ${T.n200}`:"none"}}>
                        <div style={{fontSize:16,fontWeight:700,color:T.n900}}>{s.value}</div>
                        <div style={{fontSize:11,color:T.n400,marginTop:1}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SERVICES TABLE */}
      {tab==="services"&&(
        <div style={{background:T.n0,borderRadius:T.radiusLg,border:`1px solid ${T.n200}`,boxShadow:T.shadowSoft,overflow:"hidden",animation:"fadeSlideUp 0.3s ease both"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 0.6fr 0.7fr 1.2fr 0.6fr 44px",padding:"12px 20px",background:T.n100,borderBottom:`1px solid ${T.n200}`,gap:10,alignItems:"center"}}>
            {["Serviço","Categoria","Duração","Valor","Profissionais","Status",""].map((h,i)=>(
              <span key={i} style={{fontSize:12,fontWeight:600,color:T.n400,textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</span>
            ))}
          </div>
          {filteredSvcs.length===0?(
            <div style={{padding:"48px 20px",textAlign:"center",color:T.n400}}>
              <Briefcase size={32} style={{margin:"0 auto 12px",opacity:0.3,display:"block"}}/>
              <div style={{fontSize:14}}>Nenhum serviço encontrado</div>
            </div>
          ):filteredSvcs.map((svc,i)=>{
            const spec=SPECIALTIES.find(s=>s.id===svc.category);
            const SpecIcon=spec?.icon||User;
            const profs=professionals.filter(p=>svc.professionals.includes(p.id));
            return(
              <div key={svc.id} onClick={()=>{setEditSvc(svc);setSvcModal(true)}} style={{display:"grid",gridTemplateColumns:"2fr 1fr 0.6fr 0.7fr 1.2fr 0.6fr 44px",padding:"14px 20px",borderBottom:`1px solid ${T.n100}`,gap:10,alignItems:"center",cursor:"pointer",transition:"background 150ms",opacity:svc.status==="inactive"?0.5:1,animation:`fadeSlideUp 0.3s ease ${i*0.03}s both`}}
                onMouseEnter={e=>e.currentTarget.style.background=T.n100}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:8,height:32,borderRadius:4,background:svc.color,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:14,fontWeight:500}}>{svc.name}</div>
                    <div style={{fontSize:12,color:T.n400,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:240}}>{svc.description}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:T.n700}}>
                  <SpecIcon size={14} color={spec?.color}/> {spec?.label}
                </div>
                <span style={{fontSize:13,color:T.n700}}>{svc.duration}min</span>
                <span style={{fontSize:15,fontWeight:700}}>R$ {svc.price}</span>
                <div style={{display:"flex"}}>
                  {profs.slice(0,4).map((p,j)=>(
                    <div key={p.id} title={p.name} style={{width:28,height:28,borderRadius:8,background:`${p.color}20`,display:"flex",alignItems:"center",justifyContent:"center",color:p.color,fontWeight:600,fontSize:10,border:`2px solid ${T.n0}`,marginLeft:j>0?-6:0,position:"relative",zIndex:4-j}}>
                      {getInitials(p.name)}
                    </div>
                  ))}
                </div>
                <Badge color={svc.status==="active"?T.success:T.n400} bg={svc.status==="active"?T.successBg:"rgba(201,205,216,0.15)"}>
                  {svc.status==="active"?"Ativo":"Inativo"}
                </Badge>
                <button onClick={e=>{e.stopPropagation();setEditSvc(svc);setSvcModal(true)}} style={{width:32,height:32,borderRadius:6,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400}}>
                  <Edit3 size={14}/>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ProfessionalModal open={profModal} onClose={()=>{setProfModal(false);setEditProf(null)}} professional={editProf} services={svcList} onCreate={createProfessional} onUpdate={updateProfessional}/>
      <ServiceModal open={svcModal} onClose={()=>{setSvcModal(false);setEditSvc(null)}} service={editSvc} professionals={profList} onCreate={createService} onUpdate={updateService}/>
      <ProfessionalDetail professional={detailProf} onClose={()=>setDetailProf(null)} onEdit={handleEditProf} services={svcList}/>
    </div>
  );
}

/* ═══ MAIN EXPORT ═══ */
