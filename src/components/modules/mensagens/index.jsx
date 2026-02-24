import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { AlertCircle, AlertTriangle, Archive, ArrowLeft, Bot, Check, CheckCheck, ChevronDown, Clock, Copy, DollarSign, Download, Edit3, ExternalLink, Eye, FileText, Filter, Globe, Hash, Heart, Image, Loader2, MessageSquare, Mic, MoreVertical, Paperclip, Phone, Plus, RefreshCw, Search, Send, Settings, Smartphone, Smile, Star, Template, Trash2, User, Users, Video, X, Zap } from 'lucide-react'
import { T } from '@/utils/theme'
import { Button, Modal, InputField, Badge, Avatar, EmptyState, LoadingSpinner, getInitials } from '@/components/ui'
import { useConversations, useMessages, useMessageTemplates, usePatients, useProfessionals } from '@/lib/hooks'

/* ─── Design Tokens ─── */

function timeAgo(d){const now=Date.now(),diff=now-new Date(d).getTime(),m=Math.floor(diff/60000);if(m<1)return"agora";if(m<60)return`${m}min`;const h=Math.floor(m/60);if(h<24)return`${h}h`;const dy=Math.floor(h/24);return dy===1?"ontem":`${dy}d`;}
function fmtTime(d){return new Date(d).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});}
function fmtDate(d){return new Date(d).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});}

/* ─── Templates ─── */
const TEMPLATES = [
  {id:1,name:"Lembrete de consulta",category:"reminder",icon:Clock,color:T.primary500,body:"Olá {{nome}}! 😊\n\nLembramos que sua consulta de *{{servico}}* está agendada para *{{data}}* às *{{hora}}* com {{profissional}}.\n\nLocal: Clínica Terapee — Rua Augusta, 500.\n\nPor favor, confirme sua presença respondendo esta mensagem.\n\nAté lá! 💙",variables:["nome","servico","data","hora","profissional"],active:true},
  {id:2,name:"Confirmação de agendamento",category:"confirmation",icon:CheckCircle2,color:T.success,body:"Olá {{nome}}! ✅\n\nSeu agendamento foi confirmado com sucesso!\n\n📅 *{{data}}* às *{{hora}}*\n👩‍⚕️ {{profissional}}\n📋 {{servico}}\n\nCaso precise reagendar, entre em contato com pelo menos 24h de antecedência.\n\nClínica Terapee 💙",variables:["nome","servico","data","hora","profissional"],active:true},
  {id:3,name:"Cancelamento",category:"cancellation",icon:X,color:T.error,body:"Olá {{nome}},\n\nInformamos que sua consulta de *{{servico}}* agendada para *{{data}}* às *{{hora}}* foi cancelada.\n\nMotivo: {{motivo}}\n\nPara reagendar, entre em contato conosco.\n\nClínica Terapee",variables:["nome","servico","data","hora","motivo"],active:true},
  {id:4,name:"Aniversário",category:"birthday",icon:Heart,color:T.pink,body:"Olá {{nome}}! 🎂🎉\n\nA equipe da Clínica Terapee deseja um *Feliz Aniversário*!\n\nQue seu dia seja repleto de alegria, saúde e realizações.\n\nUm abraço carinhoso de toda a equipe! 💙✨",variables:["nome"],active:true},
  {id:5,name:"Retorno / Follow-up",category:"followup",icon:RefreshCw,color:T.teal,body:"Olá {{nome}}! 👋\n\nFaz um tempo desde sua última consulta conosco. Gostaríamos de saber como você está!\n\nLembramos que a continuidade do tratamento é importante para melhores resultados.\n\nDeseja agendar um retorno? Estamos à disposição!\n\nClínica Terapee 💙",variables:["nome"],active:true},
  {id:6,name:"Cobrança pendente",category:"billing",icon:DollarSign,color:T.warning,body:"Olá {{nome}},\n\nIdentificamos uma pendência financeira referente à consulta de *{{servico}}* realizada em *{{data}}*, no valor de *R$ {{valor}}*.\n\nPara sua comodidade, segue o link para pagamento via Pix:\n{{link_pagamento}}\n\nEm caso de dúvidas, estamos à disposição.\n\nClínica Terapee",variables:["nome","servico","data","valor","link_pagamento"],active:true},
];

const TEMPLATE_CATS = [
  {id:"all",label:"Todos"},
  {id:"reminder",label:"Lembretes",color:T.primary500},
  {id:"confirmation",label:"Confirmações",color:T.success},
  {id:"cancellation",label:"Cancelamentos",color:T.error},
  {id:"birthday",label:"Aniversários",color:T.pink},
  {id:"followup",label:"Follow-up",color:T.teal},
  {id:"billing",label:"Cobranças",color:T.warning},
];

/* ─── Mock Conversations ─── */
/* ─── Conversations loaded from hooks ─── */

const STATUS_CFG = {
  sent:      {label:"Enviado",     icon:Check,        color:T.n400},
  delivered: {label:"Entregue",    icon:CheckCircle2, color:T.info},
  read:      {label:"Lido",        icon:CheckCircle2, color:T.primary500},
  failed:    {label:"Falhou",      icon:AlertCircle,  color:T.error},
};

/* ═══ Sidebar ═══ */

const IS={width:"100%",padding:"10px 12px",border:`1.5px solid ${T.n300}`,borderRadius:T.radiusMd,fontSize:14,fontFamily:T.font,color:T.n900,outline:"none",boxSizing:"border-box",background:T.n0};
const LS={display:"block",fontSize:13,fontWeight:500,color:T.n700,marginBottom:5};

/* ═══ Status Ticks ═══ */
function MsgStatus({status}){
  const cfg=STATUS_CFG[status];
  if(!cfg) return null;
  const Icon=cfg.icon;
  return <Icon size={14} color={cfg.color} style={{flexShrink:0}}/>;
}

/* ═══ Template Modal ═══ */
function TemplateModal({open,onClose,template,onCreate,onUpdate}){
  const isEdit=!!template;
  const[form,setForm]=useState({name:"",category:"reminder",body:"",active:true});
  const[saving,setSaving]=useState(false);
  useEffect(()=>{
    if(open&&template) setForm({name:template.name,category:template.category,body:template.body||template.content,active:template.active??template.is_active??true});
    else if(open) setForm({name:"",category:"reminder",body:"Olá {{nome}}!\n\n",active:true});
  },[open,template]);
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=async()=>{
    if(!form.name.trim()||!form.body.trim()) return;
    setSaving(true);
    const vars=(form.body.match(/\{\{(\w+)\}\}/g)||[]).map(v=>v.replace(/[{}]/g,""));
    const payload={name:form.name,category:form.category,content:form.body,variables:[...new Set(vars)],is_active:form.active};
    const{error}=isEdit?await(onUpdate?.(template.id,payload)??Promise.resolve({})):await(onCreate?.(payload)??Promise.resolve({}));
    setSaving(false);
    if(!error) onClose("saved");
  };
  if(!open) return null;
  const vars=(form.body.match(/\{\{(\w+)\}\}/g)||[]).map(v=>v.replace(/[{}]/g,""));
  return(
    <div onClick={()=>onClose()} style={{position:"fixed",inset:0,background:"rgba(17,17,17,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",animation:"fadeIn 150ms ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:560,background:T.n0,borderRadius:T.radiusLg,boxShadow:T.shadowLg,overflow:"hidden",animation:"slideUp 250ms ease",maxHeight:"92vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${T.n200}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h2 style={{fontSize:18,fontWeight:700}}>{isEdit?"Editar template":"Novo template"}</h2>
          <button onClick={()=>onClose()} style={{width:32,height:32,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400}}><X size={18}/></button>
        </div>
        <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
          <div style={{marginBottom:16}}><label style={LS}>Nome do template *</label><input value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="Ex: Lembrete de consulta" style={IS}/></div>
          <div style={{marginBottom:16}}>
            <label style={LS}>Categoria *</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {TEMPLATE_CATS.filter(c=>c.id!=="all").map(c=>(
                <button key={c.id} onClick={()=>upd("category",c.id)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${form.category===c.id?c.color:T.n300}`,background:form.category===c.id?`${c.color}12`:T.n0,color:form.category===c.id?c.color:T.n400,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 200ms"}}>{c.label}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={LS}>Corpo da mensagem *</label>
            <textarea value={form.body} onChange={e=>upd("body",e.target.value)} placeholder="Digite a mensagem..." style={{...IS,minHeight:160,resize:"vertical",lineHeight:1.6}}/>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:T.n400}}>Variáveis disponíveis:</span>
              {["nome","servico","data","hora","profissional","valor","motivo"].map(v=>(
                <button key={v} onClick={()=>upd("body",form.body+`{{${v}}}`)} style={{padding:"2px 8px",borderRadius:4,border:`1px solid ${T.n300}`,background:T.n100,color:T.n700,fontFamily:"monospace",fontSize:11,cursor:"pointer"}}>{"{{"+v+"}}"}</button>
              ))}
            </div>
          </div>
          {vars.length>0&&(
            <div style={{padding:"12px 14px",background:T.n100,borderRadius:T.radiusMd,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:600,color:T.n700,marginBottom:6}}>Variáveis detectadas:</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[...new Set(vars)].map(v=>(
                  <span key={v} style={{padding:"3px 10px",borderRadius:4,background:T.primary50,color:T.primary500,fontSize:11,fontWeight:500}}>{"{{"+v+"}}"}</span>
                ))}
              </div>
            </div>
          )}
          {/* Preview */}
          <div>
            <label style={LS}>Pré-visualização</label>
            <div style={{background:"#E5DDD5",borderRadius:T.radiusMd,padding:16,minHeight:100}}>
              <div style={{maxWidth:"85%",marginLeft:"auto",background:T.waLight,borderRadius:"10px 0 10px 10px",padding:"10px 14px",position:"relative"}}>
                <div style={{fontSize:13,color:"#303030",whiteSpace:"pre-wrap",lineHeight:1.6}}>{form.body.replace(/\{\{(\w+)\}\}/g,(m,v)=>`[${v}]`).replace(/\*([^*]+)\*/g,"$1")}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginTop:4}}>
                  <span style={{fontSize:10,color:"#8A8A8A"}}>14:00</span>
                  <CheckCircle2 size={12} color={T.primary500}/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{padding:"16px 24px",borderTop:`1px solid ${T.n200}`,display:"flex",justifyContent:"space-between"}}>
          <button onClick={()=>onClose()} style={{padding:"11px 18px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n700,fontFamily:T.font,fontSize:14,fontWeight:500,cursor:"pointer"}}>Cancelar</button>
          <button onClick={save} disabled={saving} style={{padding:"11px 20px",borderRadius:T.radiusMd,border:"none",background:T.wa,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,opacity:saving?0.7:1,transition:"all 200ms"}}>
            {saving?<Loader2 size={15} className="spin"/>:<Check size={15}/>} {isEdit?"Salvar":"Criar template"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Broadcast Modal ═══ */
const COLORS = [T.primary500, T.success, T.warning, T.purple, T.teal, T.pink, T.info];
function BroadcastModal({open,onClose,channel="uazapi",patients=[],templates=[]}){
  const[step,setStep]=useState(1);
  const[selectedTemplate,setSelectedTemplate]=useState(null);
  const[selectedPatients,setSelectedPatients]=useState([]);
  const[sending,setSending]=useState(false);
  const allPatients=patients;

  useEffect(()=>{if(open){setStep(1);setSelectedTemplate(null);setSelectedPatients([]);}},[open]);
  const togglePatient=id=>setSelectedPatients(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const selectAll=()=>setSelectedPatients(prev=>prev.length===allPatients.length?[]:allPatients.map(p=>p.id));
  const doSend=()=>{setSending(true);setTimeout(()=>{setSending(false);onClose("sent")},1500)};

  if(!open) return null;
  return(
    <div onClick={()=>onClose()} style={{position:"fixed",inset:0,background:"rgba(17,17,17,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",animation:"fadeIn 150ms ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:520,background:T.n0,borderRadius:T.radiusLg,boxShadow:T.shadowLg,overflow:"hidden",animation:"slideUp 250ms ease",maxHeight:"88vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${T.n200}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><h2 style={{fontSize:18,fontWeight:700}}>Envio em massa</h2><div style={{fontSize:12,color:T.n400,marginTop:2}}>Etapa {step} de 3</div></div>
          <button onClick={()=>onClose()} style={{width:32,height:32,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400}}><X size={18}/></button>
        </div>
        {/* Progress */}
        <div style={{display:"flex",gap:4,padding:"12px 24px"}}>
          {[1,2,3].map(s=><div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=step?T.wa:T.n200,transition:"background 300ms"}}/>)}
        </div>
        <div style={{padding:"8px 24px 20px",overflowY:"auto",flex:1}}>
          {step===1&&(
            <div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>Selecione um template</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {(templates.length>0?templates:TEMPLATES).filter(t=>t.active||t.is_active).map(t=>{
                  const sel=selectedTemplate?.id===t.id;
                  const Icon=t.icon;
                  return(
                    <div key={t.id} onClick={()=>setSelectedTemplate(t)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:T.radiusMd,border:`1.5px solid ${sel?T.wa:T.n300}`,background:sel?T.waBg:T.n0,cursor:"pointer",transition:"all 200ms"}}>
                      <div style={{width:36,height:36,borderRadius:8,background:`${t.color}14`,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={16} color={t.color}/></div>
                      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{t.name}</div><div style={{fontSize:12,color:T.n400,marginTop:1}}>{t.body.substring(0,60)}...</div></div>
                      {sel&&<CheckCircle2 size={18} color={T.wa}/>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {step===2&&(
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:600}}>Selecione os destinatários</div>
                <button onClick={selectAll} style={{fontSize:12,color:T.primary500,border:"none",background:"none",cursor:"pointer",fontFamily:T.font,fontWeight:500}}>{selectedPatients.length===allPatients.length?"Desmarcar todos":"Selecionar todos"}</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {allPatients.map(p=>{
                  const sel=selectedPatients.includes(p.id);
                  return(
                    <div key={p.id} onClick={()=>togglePatient(p.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:T.radiusMd,border:`1.5px solid ${sel?T.wa:T.n300}`,background:sel?T.waBg:T.n0,cursor:"pointer",transition:"all 200ms"}}>
                      <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${sel?T.wa:T.n300}`,background:sel?T.wa:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 200ms",flexShrink:0}}>{sel&&<Check size={11} color={T.n0}/>}</div>
                      <div style={{width:32,height:32,borderRadius:8,background:`${p.color}14`,display:"flex",alignItems:"center",justifyContent:"center",color:p.color,fontWeight:600,fontSize:11,flexShrink:0}}>{getInitials(p.name)}</div>
                      <div><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:11,color:T.n400}}>{p.phone}</div></div>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:12,color:T.n400,marginTop:8}}>{selectedPatients.length} destinatário(s) selecionado(s)</div>
            </div>
          )}
          {step===3&&(
            <div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>Confirmar envio</div>
              <div style={{padding:"16px",background:T.n100,borderRadius:T.radiusMd,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,color:T.n400}}>Template</span><span style={{fontSize:13,fontWeight:600}}>{selectedTemplate?.name}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,color:T.n400}}>Destinatários</span><span style={{fontSize:13,fontWeight:600}}>{selectedPatients.length} paciente(s)</span></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:T.n400}}>Canal</span><span style={{fontSize:13,fontWeight:600,color:T.wa}}>WhatsApp {channel==="uazapi"?"(número da clínica)":"(Meta API)"}</span></div>
              </div>
              <div style={{background:"#E5DDD5",borderRadius:T.radiusMd,padding:14}}>
                <div style={{fontSize:11,color:"#8A8A8A",marginBottom:6}}>Pré-visualização:</div>
                <div style={{maxWidth:"85%",marginLeft:"auto",background:T.waLight,borderRadius:"10px 0 10px 10px",padding:"10px 14px"}}>
                  <div style={{fontSize:12,color:"#303030",whiteSpace:"pre-wrap",lineHeight:1.5}}>{selectedTemplate?.body.replace(/\{\{(\w+)\}\}/g,(m,v)=>`[${v}]`).replace(/\*([^*]+)\*/g,"$1")}</div>
                </div>
              </div>
              <div style={{padding:"12px 14px",background:T.warningBg,borderRadius:T.radiusMd,display:"flex",alignItems:"center",gap:8,marginTop:12}}>
                <AlertTriangle size={14} color={T.warning}/>
                <span style={{fontSize:12,color:T.n700}}>As mensagens serão enviadas imediatamente via WhatsApp Business API.</span>
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"16px 24px",borderTop:`1px solid ${T.n200}`,display:"flex",justifyContent:"space-between"}}>
          <button onClick={()=>step>1?setStep(step-1):onClose()} style={{padding:"11px 18px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n700,fontFamily:T.font,fontSize:14,fontWeight:500,cursor:"pointer"}}>{step>1?"Voltar":"Cancelar"}</button>
          {step<3?(
            <button onClick={()=>setStep(step+1)} disabled={(step===1&&!selectedTemplate)||(step===2&&selectedPatients.length===0)} style={{padding:"11px 20px",borderRadius:T.radiusMd,border:"none",background:T.wa,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,opacity:((step===1&&!selectedTemplate)||(step===2&&selectedPatients.length===0))?0.5:1,transition:"all 200ms"}}>Próximo <ChevRight size={15}/></button>
          ):(
            <button onClick={doSend} disabled={sending} style={{padding:"11px 20px",borderRadius:T.radiusMd,border:"none",background:T.wa,color:T.n0,fontFamily:T.font,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,opacity:sending?0.7:1,transition:"all 200ms"}}>
              {sending?<Loader2 size={15} className="spin"/>:<Send size={15}/>} Enviar {selectedPatients.length} mensagem(ns)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ MAIN CONTENT ═══ */
export default function Mensagens(){
  /* ─── Hooks ─── */
  const { data: rawConversations } = useConversations();
  const { data: rawPatients } = usePatients();
  const { data: rawTemplates, create: createTemplate, update: updateTemplate } = useMessageTemplates();

  /* ─── Map templates to UI shape (content → body, is_active → active) ─── */
  const TEMPLATES_DATA = useMemo(() => rawTemplates.map(t => ({
    ...t, body: t.content, active: t.is_active,
    icon: TEMPLATE_CATS.find(c=>c.id===t.category)?.icon ?? Clock,
    color: TEMPLATE_CATS.find(c=>c.id===t.category)?.color ?? T.primary500,
  })), [rawTemplates]);

  const[tab,setTab]=useState("conversations");
  const[search,setSearch]=useState("");
  const[activeConv,setActiveConv]=useState(null);
  const[newMsg,setNewMsg]=useState("");
  const[templateCat,setTemplateCat]=useState("all");
  const[templateModal,setTemplateModal]=useState(false);
  const[editTemplate,setEditTemplate]=useState(null);
  const[broadcastModal,setBroadcastModal]=useState(false);
  const chatEndRef=useRef(null);

  // Load messages for active conversation
  const { data: activeMessages } = useMessages(activeConv);

  /* ─── Adapt conversations from hooks ─── */
  const conversations = useMemo(() => rawConversations.map((c, idx) => ({
    id: c.id,
    patient: c.patient?.full_name || "Paciente",
    phone: c.phone || "",
    color: COLORS[idx % COLORS.length],
    unread: c.unread_count || 0,
    lastMsg: "",
    lastTime: c.last_message_at || "",
    status: "delivered",
    messages: [], // loaded separately via useMessages
  })), [rawConversations]);

  // Channel: simulates reading from clinic settings
  const[channel]=useState("uazapi");
  const isMax=channel==="uazapi";

  const filteredConvs=useMemo(()=>conversations.filter(c=>!search||c.patient.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search)),[search,conversations]);
  const filteredTemplates=useMemo(()=>TEMPLATES_DATA.filter(t=>templateCat==="all"||t.category===templateCat),[TEMPLATES_DATA,templateCat]);
  const totalUnread=useMemo(()=>conversations.reduce((a,c)=>a+c.unread,0),[conversations]);

  // Active conversation with adapted messages
  const conv=useMemo(()=>{
    if(!activeConv)return null;
    const base=conversations.find(c=>c.id===activeConv);
    if(!base)return null;
    return{...base, messages: activeMessages.map(m=>({
      id:m.id, from:m.direction==="outbound"?"clinic":"patient",
      text:m.content, time:m.created_at, status:m.status||"delivered",
      template:m.message_type==="template"?m.template_name:undefined
    }))};
  },[activeConv,conversations,activeMessages]);

  useEffect(()=>{if(chatEndRef.current)chatEndRef.current.scrollIntoView({behavior:"smooth"})},[activeConv,activeMessages]);

  const stats=useMemo(()=>{
    // Stats computed from active messages only (full stats need all messages loaded)
    const all=activeMessages.filter(m=>m.direction==="outbound");
    return{
      total:all.length,
      sent:all.filter(m=>m.status==="sent").length,
      delivered:all.filter(m=>m.status==="delivered").length,
      read:all.filter(m=>m.status==="read").length,
      failed:all.filter(m=>m.status==="failed").length,
    };
  },[activeMessages]);

  const tabs=[
    {id:"conversations",label:"Conversas",count:totalUnread},
    {id:"templates",label:"Templates",count:TEMPLATES_DATA.length},
    {id:"analytics",label:"Métricas"},
  ];

  return(
    <div style={{height:"calc(100vh - 64px)",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${T.n200}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:T.n0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {tabs.map(t=>{const active=tab===t.id;return(
            <button key={t.id} onClick={()=>{setTab(t.id);setActiveConv(null)}} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 16px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:T.font,fontSize:13,fontWeight:active?600:400,color:active?T.n0:T.n700,background:active?T.waDark:"transparent",transition:"all 200ms"}}>
              {t.label}
              {t.count>0&&<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:8,background:active?"rgba(255,255,255,0.25)":T.error,color:active?"rgba(255,255,255,0.9)":T.n0}}>{t.count}</span>}
            </button>
          )})}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setBroadcastModal(true)} style={{padding:"8px 16px",borderRadius:T.radiusMd,border:`1.5px solid ${T.n300}`,background:T.n0,color:T.n700,fontFamily:T.font,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
            <Send size={13}/> Envio em massa
          </button>
          {tab==="templates"&&(
            <button onClick={()=>{setEditTemplate(null);setTemplateModal(true)}} style={{padding:"8px 16px",borderRadius:T.radiusMd,border:"none",background:T.wa,color:T.n0,fontFamily:T.font,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              <Plus size={14}/> Novo template
            </button>
          )}
        </div>
      </div>

      {/* Channel info banner */}
      <div style={{padding:"10px 24px",background:isMax?T.waBg:`${T.info}08`,borderBottom:`1px solid ${isMax?"rgba(37,211,102,0.12)":"rgba(37,99,235,0.08)"}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:7,background:isMax?T.wa:T.info,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {isMax?<Smartphone size={14} color={T.n0}/>:<Globe size={14} color={T.n0}/>}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:isMax?T.waDark:T.info}}>
              {isMax?"Clínica Max — UAZAPI":"Plano Standard — Meta API"}
            </div>
            <div style={{fontSize:11,color:T.n400}}>
              {isMax?"Mensagens enviadas com o número da clínica (+55 11 98765-4321)":"Notificações enviadas via templates aprovados pela Meta"}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {isMax&&<div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:12,background:"rgba(37,211,102,0.12)"}}><div style={{width:6,height:6,borderRadius:"50%",background:T.wa}}/><span style={{fontSize:11,fontWeight:600,color:T.wa}}>Conectado</span></div>}
          <button style={{padding:"5px 12px",borderRadius:T.radiusSm,border:`1px solid ${T.n300}`,background:T.n0,color:T.n400,fontFamily:T.font,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            <Settings size={11}/> Configurar
          </button>
        </div>
      </div>

      {/* ══════ CONVERSATIONS ══════ */}
      {tab==="conversations"&&(
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {/* List */}
          <div style={{width:360,borderRight:`1px solid ${T.n200}`,background:T.n0,display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.n200}`}}>
              <div style={{display:"flex",alignItems:"center",border:`1.5px solid ${T.n300}`,borderRadius:T.radiusMd,background:T.n100,overflow:"hidden"}}>
                <span style={{paddingLeft:10,color:T.n400,display:"flex"}}><Search size={15}/></span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar conversa..." style={{flex:1,border:"none",outline:"none",padding:"9px 10px",fontSize:13,fontFamily:T.font,color:T.n900,background:"transparent"}}/>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto"}}>
              {filteredConvs.map(c=>{
                const active=activeConv===c.id;
                const stCfg=STATUS_CFG[c.status];
                return(
                  <div key={c.id} onClick={()=>setActiveConv(c.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:`1px solid ${T.n100}`,cursor:"pointer",background:active?T.primary50:"transparent",transition:"background 150ms"}}
                    onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.n100}}
                    onMouseLeave={e=>{e.currentTarget.style.background=active?T.primary50:"transparent"}}>
                    <div style={{position:"relative",flexShrink:0}}>
                      <div style={{width:42,height:42,borderRadius:12,background:`${c.color}14`,display:"flex",alignItems:"center",justifyContent:"center",color:c.color,fontWeight:600,fontSize:14}}>{getInitials(c.patient)}</div>
                      {c.unread>0&&<div style={{position:"absolute",top:-2,right:-2,width:18,height:18,borderRadius:"50%",background:T.wa,color:T.n0,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${T.n0}`}}>{c.unread}</div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:14,fontWeight:c.unread?700:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.patient}</span>
                        <span style={{fontSize:11,color:T.n400,flexShrink:0}}>{timeAgo(c.lastTime)}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:3}}>
                        {c.status&&<MsgStatus status={c.status}/>}
                        <span style={{fontSize:12,color:c.unread?T.n900:T.n400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:c.unread?500:400}}>{c.lastMsg}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat */}
          {conv?(
            <div style={{flex:1,display:"flex",flexDirection:"column",background:"#E5DDD5"}}>
              {/* Chat header */}
              <div style={{padding:"12px 20px",background:T.waDark,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",color:T.n0,fontWeight:600,fontSize:14}}>{getInitials(conv.patient)}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.n0}}>{conv.patient}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>{conv.phone}</div>
                </div>
                <div style={{padding:"4px 10px",borderRadius:10,background:"rgba(255,255,255,0.12)",fontSize:10,color:"rgba(255,255,255,0.7)",fontWeight:500,display:"flex",alignItems:"center",gap:4}}>
                  {isMax?<><Smartphone size={10}/> Número da clínica</>:<><Globe size={10}/> Meta API</>}
                </div>
                <button style={{padding:"6px 12px",borderRadius:T.radiusSm,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:T.n0,fontFamily:T.font,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                  <Phone size={12}/> Ligar
                </button>
              </div>

              {/* Messages */}
              <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:6}}>
                {conv.messages.map((msg,i)=>{
                  const isClinic=msg.from==="clinic";
                  const showDate=i===0||fmtDate(conv.messages[i-1].time)!==fmtDate(msg.time);
                  return(
                    <div key={msg.id}>
                      {showDate&&<div style={{textAlign:"center",margin:"8px 0"}}><span style={{fontSize:11,color:"#8A8A8A",background:"rgba(255,255,255,0.7)",padding:"3px 12px",borderRadius:8}}>{fmtDate(msg.time)}</span></div>}
                      <div style={{display:"flex",justifyContent:isClinic?"flex-end":"flex-start",marginBottom:2}}>
                        <div style={{maxWidth:"75%",background:isClinic?T.waLight:T.n0,borderRadius:isClinic?"10px 0 10px 10px":"0 10px 10px 10px",padding:"8px 12px",boxShadow:"0 1px 2px rgba(0,0,0,0.06)"}}>
                          {msg.template&&<div style={{fontSize:10,color:T.wa,fontWeight:600,marginBottom:4,display:"flex",alignItems:"center",gap:3}}><Zap size={10}/> {msg.template}</div>}
                          <div style={{fontSize:13,color:"#303030",whiteSpace:"pre-wrap",lineHeight:1.5}}>{msg.text.replace(/\*([^*]+)\*/g,"$1")}</div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginTop:4}}>
                            <span style={{fontSize:10,color:"#8A8A8A"}}>{fmtTime(msg.time)}</span>
                            {isClinic&&<MsgStatus status={msg.status}/>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef}/>
              </div>

              {/* Input */}
              {isMax?(
                /* UAZAPI: free text messaging */
                <div style={{padding:"10px 16px",background:T.n0,borderTop:`1px solid ${T.n200}`,display:"flex",alignItems:"center",gap:10}}>
                  <button style={{width:36,height:36,borderRadius:8,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400}}><Smile size={20}/></button>
                  <button style={{width:36,height:36,borderRadius:8,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400}}><Paperclip size={20}/></button>
                  <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Digite uma mensagem..." style={{flex:1,border:`1.5px solid ${T.n300}`,borderRadius:24,padding:"10px 16px",fontSize:14,fontFamily:T.font,color:T.n900,outline:"none",background:T.n100}} onKeyDown={e=>{if(e.key==="Enter"&&newMsg.trim()){setNewMsg("")}}}/>
                  <button disabled={!newMsg.trim()} style={{width:40,height:40,borderRadius:10,border:"none",background:newMsg.trim()?T.wa:T.n300,cursor:newMsg.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 200ms"}}>
                    <Send size={18} color={T.n0}/>
                  </button>
                </div>
              ):(
                /* Meta API: template-only sending */
                <div style={{padding:"12px 16px",background:T.n0,borderTop:`1px solid ${T.n200}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{flex:1,padding:"10px 16px",borderRadius:24,background:T.n100,border:`1.5px solid ${T.n200}`,fontSize:13,color:T.n400,display:"flex",alignItems:"center",gap:6}}>
                      <AlertCircle size={14}/>
                      Plano Standard: envie mensagens apenas via templates aprovados
                    </div>
                    <button style={{padding:"10px 18px",borderRadius:10,border:"none",background:T.info,color:T.n0,fontFamily:T.font,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
                      <Zap size={14}/> Enviar template
                    </button>
                  </div>
                </div>
              )}
            </div>
          ):(
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:T.n100}}>
              <div style={{textAlign:"center",color:T.n400}}>
                <MessageSquare size={48} style={{margin:"0 auto 12px",opacity:0.2}}/>
                <div style={{fontSize:16,fontWeight:500}}>Selecione uma conversa</div>
                <div style={{fontSize:13,marginTop:4}}>Escolha um paciente para visualizar as mensagens</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════ TEMPLATES ══════ */}
      {tab==="templates"&&(
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
            {TEMPLATE_CATS.map(c=>(
              <button key={c.id} onClick={()=>setTemplateCat(c.id)} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${templateCat===c.id?(c.color||T.waDark):T.n300}`,background:templateCat===c.id?(c.color?`${c.color}12`:T.waBg):T.n0,color:templateCat===c.id?(c.color||T.waDark):T.n400,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 200ms"}}>{c.label}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))",gap:14}}>
            {filteredTemplates.map((t,i)=>{
              const Icon=t.icon;
              const cat=TEMPLATE_CATS.find(c=>c.id===t.category);
              return(
                <div key={t.id} style={{background:T.n0,borderRadius:T.radiusLg,border:`1px solid ${T.n200}`,boxShadow:T.shadowSoft,overflow:"hidden",transition:"all 200ms",animation:`fadeSlideUp 0.3s ease ${i*0.04}s both`,cursor:"pointer"}}
                  onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.07)";e.currentTarget.style.transform="translateY(-1px)"}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.shadowSoft;e.currentTarget.style.transform="none"}}>
                  <div style={{height:3,background:t.color}}/>
                  <div style={{padding:"18px 20px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                      <div style={{width:38,height:38,borderRadius:10,background:`${t.color}14`,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={17} color={t.color}/></div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:600}}>{t.name}</div>
                        <Badge color={cat?.color||T.n400} bg={`${cat?.color||T.n400}12`}>{cat?.label}</Badge>
                      </div>
                      <button onClick={()=>{setEditTemplate(t);setTemplateModal(true)}} style={{width:30,height:30,borderRadius:6,border:`1px solid ${T.n200}`,background:T.n0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.n400}}><Edit3 size={13}/></button>
                    </div>

                    {/* Mini preview */}
                    <div style={{background:"#E5DDD5",borderRadius:T.radiusMd,padding:12,marginBottom:12}}>
                      <div style={{maxWidth:"90%",marginLeft:"auto",background:T.waLight,borderRadius:"8px 0 8px 8px",padding:"8px 10px"}}>
                        <div style={{fontSize:11,color:"#303030",whiteSpace:"pre-wrap",lineHeight:1.4,maxHeight:80,overflow:"hidden"}}>{t.body.replace(/\{\{(\w+)\}\}/g,(m,v)=>`[${v}]`).replace(/\*([^*]+)\*/g,"$1")}</div>
                      </div>
                    </div>

                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {t.variables.slice(0,3).map(v=>(
                          <span key={v} style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:T.n100,color:T.n400,fontFamily:"monospace"}}>{"{{"+v+"}}"}</span>
                        ))}
                        {t.variables.length>3&&<span style={{fontSize:10,color:T.n400}}>+{t.variables.length-3}</span>}
                      </div>
                      <button style={{padding:"6px 12px",borderRadius:T.radiusSm,border:"none",background:T.wa,color:T.n0,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:T.font,display:"flex",alignItems:"center",gap:4}}><Send size={11}/> Usar</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════ ANALYTICS ══════ */}
      {tab==="analytics"&&(
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:24}}>
            {[
              {label:"Enviadas",value:stats.total,icon:Send,color:T.waDark,delay:0.05},
              {label:"Entregues",value:stats.delivered,icon:CheckCircle2,color:T.info,delay:0.1},
              {label:"Lidas",value:stats.read,icon:Eye,color:T.success,delay:0.15},
              {label:"Pendentes",value:stats.sent,icon:Clock,color:T.warning,delay:0.2},
              {label:"Falhas",value:stats.failed,icon:AlertCircle,color:T.error,delay:0.25},
            ].map((s,i)=>{
              const SIcon=s.icon;
              return(
                <div key={i} style={{background:T.n0,borderRadius:T.radiusLg,padding:"18px 20px",boxShadow:T.shadowSoft,border:`1px solid ${T.n200}`,animation:`fadeSlideUp 0.35s ease ${s.delay}s both`,textAlign:"center"}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${s.color}14`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px"}}><SIcon size={18} color={s.color}/></div>
                  <div style={{fontSize:26,fontWeight:700}}>{s.value}</div>
                  <div style={{fontSize:12,color:T.n400,marginTop:2}}>{s.label}</div>
                </div>
              );
            })}
          </div>

          {/* Delivery funnel */}
          <div style={{background:T.n0,borderRadius:T.radiusLg,border:`1px solid ${T.n200}`,boxShadow:T.shadowSoft,padding:24,marginBottom:16,animation:"fadeSlideUp 0.35s ease 0.1s both"}}>
            <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Funil de entrega</div>
            <div style={{display:"flex",alignItems:"center",gap:0}}>
              {[
                {label:"Enviadas",value:stats.total,color:T.n700,pct:100},
                {label:"Entregues",value:stats.delivered+stats.read,color:T.info,pct:Math.round(((stats.delivered+stats.read)/stats.total)*100)},
                {label:"Lidas",value:stats.read,color:T.success,pct:Math.round((stats.read/stats.total)*100)},
              ].map((s,i)=>(
                <div key={i} style={{flex:1,textAlign:"center"}}>
                  <div style={{height:48,background:`${s.color}${i===0?"14":"20"}`,borderRadius:i===0?"8px 0 0 8px":i===2?"0 8px 8px 0":"0",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    <div style={{height:"100%",width:`${s.pct}%`,background:`${s.color}30`,borderRadius:"inherit",position:"absolute",left:0,top:0,transition:"width 800ms ease"}}/>
                    <span style={{fontSize:18,fontWeight:700,color:s.color,position:"relative",zIndex:1}}>{s.value}</span>
                  </div>
                  <div style={{fontSize:12,color:T.n400,marginTop:6}}>{s.label}</div>
                  <div style={{fontSize:16,fontWeight:700,color:s.color}}>{s.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:T.n0,borderRadius:T.radiusLg,border:`1px solid ${T.n200}`,boxShadow:T.shadowSoft,padding:24,animation:"fadeSlideUp 0.35s ease 0.15s both"}}>
              <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Templates mais usados</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[
                  {name:"Lembrete de consulta",count:245,pct:48,color:T.primary500},
                  {name:"Confirmação de agendamento",count:128,pct:25,color:T.success},
                  {name:"Retorno / Follow-up",count:62,pct:12,color:T.teal},
                  {name:"Aniversário",count:38,pct:7,color:T.pink},
                  {name:"Cobrança pendente",count:32,pct:6,color:T.warning},
                ].map((t,i)=>(
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:13,color:T.n700}}>{t.name}</span>
                      <span style={{fontSize:12,fontWeight:600}}>{t.count} <span style={{color:T.n400,fontWeight:400}}>({t.pct}%)</span></span>
                    </div>
                    <div style={{height:5,background:T.n200,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${t.pct}%`,background:t.color,borderRadius:3,transition:"width 600ms ease"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:T.n0,borderRadius:T.radiusLg,border:`1px solid ${T.n200}`,boxShadow:T.shadowSoft,padding:24,animation:"fadeSlideUp 0.35s ease 0.2s both"}}>
              <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Taxa de resposta</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
                <div style={{width:140,height:140,borderRadius:"50%",background:`conic-gradient(${T.wa} 0% 68%, ${T.n200} 68% 100%)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{width:108,height:108,borderRadius:"50%",background:T.n0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                    <span style={{fontSize:32,fontWeight:700,color:T.wa}}>68%</span>
                    <span style={{fontSize:11,color:T.n400}}>respondem</span>
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[
                  {label:"Tempo médio de resposta",value:"2h 15min",color:T.primary500},
                  {label:"Confirmações via WhatsApp",value:"82%",color:T.success},
                  {label:"Cancelamentos via chat",value:"12%",color:T.error},
                  {label:"Reagendamentos via chat",value:"6%",color:T.warning},
                ].map((m,i)=>(
                  <div key={i} style={{padding:"12px",background:T.n100,borderRadius:T.radiusMd,textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:700,color:m.color}}>{m.value}</div>
                    <div style={{fontSize:11,color:T.n400,marginTop:3}}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <TemplateModal open={templateModal} onClose={()=>{setTemplateModal(false);setEditTemplate(null)}} template={editTemplate} onCreate={createTemplate} onUpdate={updateTemplate}/>
      <BroadcastModal open={broadcastModal} onClose={()=>setBroadcastModal(false)} channel={channel} patients={rawPatients.map(p=>({id:p.id,name:p.full_name,phone:p.phone,color:COLORS[0]}))} templates={TEMPLATES_DATA}/>
    </div>
  );
}

/* ═══ MAIN EXPORT ═══ */
