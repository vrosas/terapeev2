import { useState, useMemo, useEffect } from 'react'
import { Activity, AlertCircle, ArrowLeft, Award, Briefcase, Calendar, Camera, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, CreditCard, DollarSign, Download, Edit3, Eye, FileBarChart, FileText, Hash, Heart, Home, LayoutDashboard, Loader2, Mail, MapPin, MessageSquare, MoreHorizontal, Phone, Plus, Search, Shield, Star, Trash2, TrendingUp, Upload, User, Users, X, XCircle } from 'lucide-react'
import { T } from '@/utils/theme'
import { Button, Modal, InputField, SelectField, Badge, Card, Avatar, StatCard, EmptyState, LoadingSpinner, getInitials } from '@/components/ui'
import { usePatients, useProfessionals, useAppointments, useCharges } from '@/lib/hooks'

/* ─── Config ─── */
const CONVENIOS = ["Particular", "Unimed", "Bradesco Saúde", "Amil", "SulAmérica", "Porto Seguro"];

const STATUS_MAP = { active: "ativo", inactive: "arquivado", waitlist: "lista_espera" };
const STATUS_MAP_REV = { ativo: "active", arquivado: "inactive", lista_espera: "waitlist" };

/* ─── Adapter: hook data → UI shape ─── */
function adaptPatient(p, appointments = [], charges = []) {
  if (!p) return p;
  const patAppts = appointments.filter(a => a.patient_id === p.id);
  const patCharges = charges.filter(c => c.patient_id === p.id);
  const completedAppts = patAppts.filter(a => a.status === 'completed');
  const lastCompleted = completedAppts.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))[0];
  const pending = patCharges.filter(c => c.status === 'pending' || c.status === 'overdue').reduce((s, c) => s + c.amount, 0);
  return {
    ...p,
    name: p.full_name,
    dob: p.birth_date || "",
    convenio: p.health_insurance || "Particular",
    status: STATUS_MAP[p.status] || p.status,
    createdAt: p.intake_date || "",
    obs: (p.tags || []).join(", "),
    address: (typeof p.address === 'object' ? (p.address?.text || '') : p.address) || "",
    lastVisit: lastCompleted ? lastCompleted.start_time.split('T')[0] : "",
    totalVisits: completedAppts.length,
    pendingBills: pending,
  };
}

function adaptAppointment(a) {
  if (!a) return a;
  const STATUS_APT = { completed: "realizado", confirmed: "confirmado", scheduled: "pendente", cancelled: "cancelado", no_show: "falta" };
  return {
    id: a.id,
    date: a.start_time ? a.start_time.split('T')[0] : "",
    time: a.start_time ? new Date(a.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : "",
    service: a.type || "Sessão",
    professional: a.professional?.full_name || "",
    status: STATUS_APT[a.status] || a.status,
    type: a.modality === 'online' ? 'online' : 'presencial',
  };
}

function adaptCharge(c) {
  if (!c) return c;
  const STATUS_CHG = { paid: "pago", pending: "aberto", overdue: "atrasado" };
  return {
    id: c.id,
    date: c.due_date || "",
    description: c.description || "Sessão",
    amount: c.amount || 0,
    status: STATUS_CHG[c.status] || c.status,
  };
}

/* ─── Status configs ─── */
const APT_STATUS = {
  pendente: { label: "Pendente", color: T.warning, bg: "rgba(245,158,11,0.10)", icon: Clock },
  confirmado: { label: "Confirmado", color: T.success, bg: "rgba(22,163,74,0.10)", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: T.error, bg: "rgba(220,38,38,0.10)", icon: XCircle },
  realizado: { label: "Realizado", color: T.info, bg: "rgba(37,99,235,0.10)", icon: Check },
};

const MSG_STATUS = {
  enviado: { label: "Enviado", color: T.n400 }, entregue: { label: "Entregue", color: T.info },
  lido: { label: "Lido", color: T.success }, falhou: { label: "Falhou", color: T.error },
};

const INV_STATUS = {
  aberto: { label: "Aberto", color: T.warning, bg: "rgba(245,158,11,0.10)" },
  pago: { label: "Pago", color: T.success, bg: "rgba(22,163,74,0.10)" },
  atrasado: { label: "Atrasado", color: T.error, bg: "rgba(220,38,38,0.10)" },
  cancelado: { label: "Cancelado", color: T.n400, bg: "rgba(201,205,216,0.15)" },
};

/* ─── Sidebar ─── */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "pacientes", label: "Pacientes", icon: Users },
  { id: "prontuarios", label: "Prontuários", icon: FileText },
  { id: "mensagens", label: "Mensagens", icon: MessageSquare },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "relatorios", label: "Relatórios", icon: FileBarChart },
];




/* ═══════════════ PATIENT CREATION / EDIT MODAL ═══════════════ */
function PatientModal({ open, onClose, patient, allPatients, onCreate, onUpdate }) {
  const isEdit = !!patient;
  const [form, setForm] = useState({
    name: "", phone: "", cpf: "", email: "", dob: "", convenio: "", address: "", obs: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dupeWarning, setDupeWarning] = useState(null);

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name, phone: patient.phone, cpf: patient.cpf,
        email: patient.email, dob: patient.dob, convenio: patient.convenio,
        address: patient.address || "", obs: patient.obs || "",
      });
    } else {
      setForm({ name: "", phone: "", cpf: "", email: "", dob: "", convenio: "", address: "", obs: "" });
    }
    setErrors({}); setDupeWarning(null);
  }, [patient, open]);

  const upd = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  // Deduplication check
  useEffect(() => {
    if (!open || isEdit) return;
    const dupe = allPatients?.find(p =>
      (form.cpf && form.cpf.length > 10 && p.cpf === form.cpf) ||
      (form.phone && form.phone.length > 10 && p.phone === form.phone)
    );
    setDupeWarning(dupe || null);
  }, [form.cpf, form.phone, open]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.phone.trim()) e.phone = "Telefone é obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const record = {
      full_name: form.name,
      phone: form.phone,
      cpf: form.cpf,
      email: form.email,
      birth_date: form.dob || null,
      health_insurance: form.convenio || null,
      address: form.address ? { text: form.address } : {},
      tags: form.obs ? form.obs.split(",").map(t => t.trim()).filter(Boolean) : [],
    };
    try {
      if (isEdit && onUpdate) await onUpdate(patient.id, record);
      else if (onCreate) await onCreate(record);
      onClose("saved");
    } finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <div onClick={() => onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(17,17,17,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)", animation: "fadeIn 150ms ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 580, background: T.n0, borderRadius: T.radiusLg,
        boxShadow: T.shadowLg, overflow: "hidden", animation: "slideUp 250ms ease",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${T.n200}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{isEdit ? "Editar paciente" : "Novo paciente"}</h2>
          <button onClick={() => onClose()} style={{
            width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
            background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: T.n400,
          }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Deduplication warning */}
          {dupeWarning && (
            <div style={{
              background: "rgba(245,158,11,0.08)", border: `1px solid rgba(245,158,11,0.25)`,
              borderRadius: T.radiusMd, padding: "12px 16px", marginBottom: 18,
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <AlertCircle size={18} color={T.warning} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.warning, marginBottom: 2 }}>Possível duplicidade</div>
                <div style={{ fontSize: 13, color: T.n700, lineHeight: 1.5 }}>
                  Já existe um paciente com dados semelhantes: <strong>{dupeWarning.name}</strong> ({dupeWarning.phone})
                </div>
              </div>
            </div>
          )}

          <InputField label="Nome completo *" icon={User} placeholder="Nome do paciente"
            value={form.name} onChange={v => upd("name", v)} error={errors.name} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="Telefone (WhatsApp) *" icon={Phone} placeholder="(11) 99999-9999"
              value={form.phone} onChange={v => upd("phone", v)} error={errors.phone} />
            <InputField label="CPF" icon={Hash} placeholder="000.000.000-00"
              value={form.cpf} onChange={v => upd("cpf", v)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="E-mail" icon={Mail} type="email" placeholder="paciente@email.com"
              value={form.email} onChange={v => upd("email", v)} />
            <InputField label="Data de Nascimento" icon={Calendar} type="date"
              value={form.dob} onChange={v => upd("dob", v)} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 5 }}>Convênio</label>
            <select value={form.convenio} onChange={e => upd("convenio", e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", border: `1.5px solid ${T.n300}`,
                borderRadius: T.radiusMd, fontSize: 14, fontFamily: T.font, color: T.n900,
                background: T.n0, cursor: "pointer", outline: "none", appearance: "auto",
              }}>
              <option value="">Selecionar convênio...</option>
              {CONVENIOS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <InputField label="Endereço" icon={Home} placeholder="Rua, número, bairro, cidade"
            value={form.address} onChange={v => upd("address", v)} />

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 5 }}>Observações</label>
            <textarea value={form.obs} onChange={e => upd("obs", e.target.value)}
              placeholder="Informações adicionais sobre o paciente..."
              style={{
                width: "100%", padding: "10px 12px", border: `1.5px solid ${T.n300}`,
                borderRadius: T.radiusMd, fontSize: 14, fontFamily: T.font, color: T.n900,
                minHeight: 80, resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = T.primary500; e.target.style.boxShadow = T.focusRing; }}
              onBlur={e => { e.target.style.borderColor = T.n300; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${T.n200}`,
          display: "flex", justifyContent: "space-between",
        }}>
          <button onClick={() => onClose()} style={{
            padding: "11px 20px", borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`,
            background: T.n0, color: T.n700, fontFamily: T.font, fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "11px 24px", borderRadius: T.radiusMd, border: "none",
            background: T.primary500, color: T.n0, fontFamily: T.font, fontSize: 14, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1,
            transition: "all 200ms",
          }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = T.primary600; }}
            onMouseLeave={e => e.currentTarget.style.background = T.primary500}>
            {saving ? <><Loader2 size={16} className="spin" /> Salvando...</> : <><Check size={16} /> {isEdit ? "Salvar" : "Cadastrar"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ PATIENT DETAIL VIEW (Ficha) ═══════════════ */
function PatientDetail({ patient, onBack, appointments = [], messages = [], invoices = [] }) {
  const [tab, setTab] = useState("info");
  const age = patient.dob ? Math.floor((new Date() - new Date(patient.dob)) / 31557600000) : null;

  const tabs = [
    { id: "info", label: "Informações", icon: User },
    { id: "appointments", label: "Agendamentos", icon: Calendar },
    { id: "messages", label: "Comunicações", icon: MessageSquare },
    { id: "billing", label: "Financeiro", icon: DollarSign },
  ];

  return (
    <div style={{ padding: "24px 28px", animation: "fadeSlideUp 0.35s ease both" }}>
      {/* Breadcrumb */}
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, border: "none", background: "none",
        cursor: "pointer", fontFamily: T.font, fontSize: 13, color: T.n400, padding: 0,
        marginBottom: 20, fontWeight: 500,
      }}
        onMouseEnter={e => e.currentTarget.style.color = T.primary500}
        onMouseLeave={e => e.currentTarget.style.color = T.n400}>
        <ArrowLeft size={15} /> Voltar para pacientes
      </button>

      {/* Patient header card */}
      <div style={{
        background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`,
        boxShadow: T.shadowSoft, padding: "24px 28px", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.primary500}, ${T.primary600})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.n0, fontSize: 22, fontWeight: 700, flexShrink: 0,
          }}>{patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: T.n900 }}>{patient.name}</h1>
              <Badge color={patient.status === "ativo" ? T.success : T.n400}
                bg={patient.status === "ativo" ? "rgba(22,163,74,0.10)" : "rgba(201,205,216,0.15)"}>
                {patient.status === "ativo" ? "Ativo" : "Arquivado"}
              </Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6, fontSize: 13, color: T.n400, flexWrap: "wrap" }}>
              {age && <span>{age} anos</span>}
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {patient.phone}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={12} /> {patient.email}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Shield size={12} /> {patient.convenio}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            padding: "9px 16px", borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`,
            background: T.n0, color: T.n700, fontFamily: T.font, fontSize: 13, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 150ms",
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.n100}
            onMouseLeave={e => e.currentTarget.style.background = T.n0}>
            <Edit3 size={14} /> Editar
          </button>
          <button style={{
            padding: "9px 16px", borderRadius: T.radiusMd, border: "none",
            background: T.primary500, color: T.n0, fontFamily: T.font, fontSize: 13, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 200ms",
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.primary600}
            onMouseLeave={e => e.currentTarget.style.background = T.primary500}>
            <Calendar size={14} /> Agendar
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total de consultas", value: patient.totalVisits, icon: Activity, color: T.primary500 },
          { label: "Última visita", value: new Date(patient.lastVisit).toLocaleDateString("pt-BR"), icon: Calendar, color: T.info },
          { label: "Paciente desde", value: new Date(patient.createdAt).toLocaleDateString("pt-BR"), icon: Clock, color: T.n700 },
          { label: "Pendente", value: patient.pendingBills > 0 ? `R$ ${patient.pendingBills}` : "—", icon: CreditCard, color: patient.pendingBills > 0 ? T.warning : T.success },
        ].map((s, i) => (
          <div key={i} style={{
            background: T.n0, borderRadius: T.radiusMd, border: `1px solid ${T.n200}`,
            padding: "16px 18px", boxShadow: T.shadowSoft,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.n400, marginBottom: 6 }}>
              <s.icon size={14} /> {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, borderBottom: `2px solid ${T.n200}`, marginBottom: 0,
      }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "12px 20px",
              border: "none", cursor: "pointer", fontFamily: T.font, fontSize: 14,
              fontWeight: active ? 600 : 400, color: active ? T.primary500 : T.n400,
              background: "transparent", borderBottom: `2px solid ${active ? T.primary500 : "transparent"}`,
              marginBottom: -2, transition: "all 150ms",
            }}>
              <t.icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{
        background: T.n0, borderRadius: `0 0 ${T.radiusLg}px ${T.radiusLg}px`,
        border: `1px solid ${T.n200}`, borderTop: "none",
        boxShadow: T.shadowSoft, minHeight: 300,
      }}>
        {tab === "info" && (
          <div style={{ padding: "24px 28px", animation: "fadeIn 200ms ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: T.n900, marginBottom: 16 }}>Dados Pessoais</h3>
                {[
                  { label: "Nome completo", value: patient.name },
                  { label: "CPF", value: patient.cpf },
                  { label: "Data de Nascimento", value: patient.dob ? `${new Date(patient.dob).toLocaleDateString("pt-BR")} (${age} anos)` : "—" },
                  { label: "Telefone", value: patient.phone },
                  { label: "E-mail", value: patient.email },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: T.n400, marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 14, color: T.n900, fontWeight: 500 }}>{f.value || "—"}</div>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: T.n900, marginBottom: 16 }}>Informações adicionais</h3>
                {[
                  { label: "Convênio", value: patient.convenio },
                  { label: "Endereço", value: patient.address },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: T.n400, marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 14, color: T.n900, fontWeight: 500 }}>{f.value || "—"}</div>
                  </div>
                ))}
                {patient.obs && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: T.n400, marginBottom: 3 }}>Observações</div>
                    <div style={{
                      fontSize: 13, color: T.n700, lineHeight: 1.6, padding: "12px 14px",
                      background: T.n100, borderRadius: T.radiusMd, border: `1px solid ${T.n200}`,
                    }}>{patient.obs}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "appointments" && (
          <div style={{ animation: "fadeIn 200ms ease" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.n200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: T.n400 }}>{appointments.length} agendamentos</span>
              <button style={{
                padding: "7px 14px", borderRadius: T.radiusMd, border: "none",
                background: T.primary500, color: T.n0, fontFamily: T.font, fontSize: 13,
                fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              }}><Plus size={14} /> Novo agendamento</button>
            </div>
            {appointments.map((a, i) => {
              const st = APT_STATUS[a.status] || APT_STATUS.pendente;
              const Icon = st.icon;
              const isFuture = new Date(a.date) >= new Date();
              return (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
                  borderBottom: `1px solid ${T.n100}`, transition: "background 150ms",
                  cursor: "pointer", opacity: a.status === "cancelado" ? 0.5 : 1,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = T.n100}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: isFuture ? T.primary50 : T.n100,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Calendar size={16} color={isFuture ? T.primary500 : T.n400} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>
                      {new Date(a.date).toLocaleDateString("pt-BR")} às {a.time}
                      {a.type === "online" && <span style={{ fontSize: 11, color: T.info, marginLeft: 6 }}>🖥 Online</span>}
                    </div>
                    <div style={{ fontSize: 12, color: T.n400, marginTop: 2 }}>{a.service} · {a.professional}</div>
                  </div>
                  <Badge color={st.color} bg={st.bg}><Icon size={11} /> {st.label}</Badge>
                </div>
              );
            })}
          </div>
        )}

        {tab === "messages" && (
          <div style={{ animation: "fadeIn 200ms ease" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.n200}`, fontSize: 13, color: T.n400 }}>
              {messages.length} mensagens enviadas
            </div>
            {messages.map(m => {
              const st = MSG_STATUS[m.status] || MSG_STATUS.enviado;
              return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
                  borderBottom: `1px solid ${T.n100}`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: "rgba(37,99,235,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <MessageSquare size={16} color={T.info} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>{m.type}</div>
                    <div style={{ fontSize: 12, color: T.n400, marginTop: 2 }}>{m.date} · {m.channel}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: st.color }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.color }} />
                    {st.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "billing" && (
          <div style={{ animation: "fadeIn 200ms ease" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.n200}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: T.n400 }}>{invoices.length} faturas</span>
              <button style={{
                padding: "7px 14px", borderRadius: T.radiusMd, border: "none",
                background: T.primary500, color: T.n0, fontFamily: T.font, fontSize: 13,
                fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              }}><Plus size={14} /> Nova fatura</button>
            </div>
            {invoices.map(inv => {
              const st = INV_STATUS[inv.status] || INV_STATUS.aberto;
              return (
                <div key={inv.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
                  borderBottom: `1px solid ${T.n100}`, cursor: "pointer", transition: "background 150ms",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = T.n100}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: st.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <DollarSign size={16} color={st.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>{inv.description}</div>
                    <div style={{ fontSize: 12, color: T.n400, marginTop: 2 }}>{new Date(inv.date).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.n900, marginRight: 12 }}>
                    R$ {inv.amount}
                  </div>
                  <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ PATIENT LIST ═══════════════ */
export default function Pacientes() {
  const { data: rawPatients, loading: patientsLoading, create: createPatient, update: updatePatient, remove: removePatient } = usePatients();
  const { data: rawAppointments } = useAppointments();
  const { data: rawCharges } = useCharges();

  const patients = useMemo(() => rawPatients.map(p => adaptPatient(p, rawAppointments, rawCharges)), [rawPatients, rawAppointments, rawCharges]);
  const patientAppointments = useMemo(() => rawAppointments.map(adaptAppointment), [rawAppointments]);
  const patientCharges = useMemo(() => rawCharges.map(adaptCharge), [rawCharges]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [convenioFilter, setConvenioFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    let list = patients.filter(p => {
      const matchSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase())
        || (p.cpf || "").includes(search) || (p.phone || "").includes(search);
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchConvenio = convenioFilter === "all" || p.convenio === convenioFilter;
      return matchSearch && matchStatus && matchConvenio;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "lastVisit") cmp = new Date(b.lastVisit) - new Date(a.lastVisit);
      else if (sortBy === "totalVisits") cmp = b.totalVisits - a.totalVisits;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [search, statusFilter, convenioFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (selectedPatient) {
    const selAppts = patientAppointments.filter(a => rawAppointments.some(ra => ra.id === a.id && ra.patient_id === selectedPatient.id));
    const selCharges = patientCharges.filter(c => rawCharges.some(rc => rc.id === c.id && rc.patient_id === selectedPatient.id));
    return <PatientDetail patient={selectedPatient} onBack={() => setSelectedPatient(null)} appointments={selAppts} invoices={selCharges} />;
  }

  const SortButton = ({ field, label }) => {
    const active = sortBy === field;
    return (
      <button onClick={() => { if (active) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortBy(field); setSortDir("asc"); } }}
        style={{
          display: "flex", alignItems: "center", gap: 3, border: "none", background: "none",
          cursor: "pointer", fontFamily: T.font, fontSize: 12, fontWeight: 600,
          color: active ? T.primary500 : T.n400, padding: 0, textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}>
        {label}
        {active && (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </button>
    );
  };

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, animation: "fadeSlideUp 0.3s ease both",
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.n900 }}>Pacientes</h1>
          <p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>{patients.filter(p => p.status === "ativo").length} pacientes ativos</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            padding: "9px 16px", borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`,
            background: T.n0, color: T.n700, fontFamily: T.font, fontSize: 13, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
          }}><Download size={14} /> Exportar</button>
          <button onClick={() => { setEditPatient(null); setModalOpen(true); }} style={{
            padding: "9px 18px", borderRadius: T.radiusMd, border: "none",
            background: T.primary500, color: T.n0, fontFamily: T.font, fontSize: 14,
            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            transition: "all 200ms",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.primary600; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.primary500; e.currentTarget.style.transform = "none"; }}>
            <Plus size={16} /> Novo paciente
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
        animation: "fadeSlideUp 0.35s ease 0.05s both",
      }}>
        {/* Search */}
        <div style={{
          flex: 1, maxWidth: 360, display: "flex", alignItems: "center",
          border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, background: T.n0,
          overflow: "hidden", transition: "border 200ms",
        }}>
          <span style={{ paddingLeft: 12, color: T.n400, display: "flex" }}><Search size={16} /></span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nome, CPF ou telefone..."
            style={{
              flex: 1, border: "none", outline: "none", padding: "10px 12px",
              fontSize: 13, fontFamily: T.font, color: T.n900, background: "transparent",
            }} />
          {search && (
            <button onClick={() => setSearch("")} style={{
              border: "none", background: "none", cursor: "pointer", padding: "0 10px",
              color: T.n400, display: "flex",
            }}><X size={14} /></button>
          )}
        </div>

        {/* Status filter */}
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            padding: "9px 12px", borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`,
            background: T.n0, fontFamily: T.font, fontSize: 13, color: T.n700,
            cursor: "pointer", outline: "none", appearance: "auto",
          }}>
          <option value="all">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="arquivado">Arquivados</option>
        </select>

        {/* Convenio filter */}
        <select value={convenioFilter} onChange={e => { setConvenioFilter(e.target.value); setPage(1); }}
          style={{
            padding: "9px 12px", borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`,
            background: T.n0, fontFamily: T.font, fontSize: 13, color: T.n700,
            cursor: "pointer", outline: "none", appearance: "auto",
          }}>
          <option value="all">Todos os convênios</option>
          {CONVENIOS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <span style={{ fontSize: 12, color: T.n400, marginLeft: "auto" }}>{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div style={{
        background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`,
        boxShadow: T.shadowSoft, overflow: "hidden",
        animation: "fadeSlideUp 0.4s ease 0.1s both",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 0.8fr 0.8fr 50px",
          padding: "12px 20px", background: T.n100, borderBottom: `1px solid ${T.n200}`,
          gap: 12, alignItems: "center",
        }}>
          <SortButton field="name" label="Paciente" />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.n400, textTransform: "uppercase", letterSpacing: "0.04em" }}>Contato</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.n400, textTransform: "uppercase", letterSpacing: "0.04em" }}>Convênio</span>
          <SortButton field="lastVisit" label="Última visita" />
          <SortButton field="totalVisits" label="Consultas" />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.n400, textTransform: "uppercase", letterSpacing: "0.04em" }}>Status</span>
          <span />
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: T.n400 }}>
            <Users size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <div style={{ fontSize: 14 }}>Nenhum paciente encontrado</div>
          </div>
        ) : paginated.map((p, i) => (
          <div key={p.id}
            onClick={() => setSelectedPatient(p)}
            style={{
              display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 0.8fr 0.8fr 50px",
              padding: "14px 20px", borderBottom: `1px solid ${T.n100}`,
              gap: 12, alignItems: "center", cursor: "pointer", transition: "background 150ms",
              animation: `fadeSlideUp 0.3s ease ${i * 0.03}s both`,
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.n100}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {/* Name + avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: p.status === "arquivado" ? T.n200 : `linear-gradient(135deg, ${T.primary500}, ${T.primary600})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: p.status === "arquivado" ? T.n400 : T.n0, fontSize: 13, fontWeight: 600, flexShrink: 0,
              }}>{p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: T.n400, marginTop: 1 }}>CPF: {p.cpf}</div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize: 13, color: T.n900, display: "flex", alignItems: "center", gap: 4 }}>
                <Phone size={12} color={T.n400} /> {p.phone}
              </div>
              <div style={{ fontSize: 12, color: T.n400, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.email}
              </div>
            </div>

            {/* Convenio */}
            <span style={{ fontSize: 13, color: T.n700 }}>{p.convenio}</span>

            {/* Last visit */}
            <span style={{ fontSize: 13, color: T.n700 }}>{new Date(p.lastVisit).toLocaleDateString("pt-BR")}</span>

            {/* Total visits */}
            <span style={{ fontSize: 14, fontWeight: 600, color: T.n900 }}>{p.totalVisits}</span>

            {/* Status */}
            <Badge
              color={p.status === "ativo" ? T.success : T.n400}
              bg={p.status === "ativo" ? "rgba(22,163,74,0.10)" : "rgba(201,205,216,0.15)"}>
              {p.status === "ativo" ? "Ativo" : "Arquivado"}
            </Badge>

            {/* Actions */}
            <button onClick={e => { e.stopPropagation(); }} style={{
              width: 32, height: 32, borderRadius: 6, border: "none",
              background: "transparent", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: T.n400,
              transition: "all 150ms",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = T.n200; e.currentTarget.style.color = T.n700; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.n400; }}>
              <MoreHorizontal size={16} />
            </button>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: "14px 20px", display: "flex", alignItems: "center",
            justifyContent: "space-between", borderTop: `1px solid ${T.n200}`,
          }}>
            <span style={{ fontSize: 13, color: T.n400 }}>
              Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{
                width: 32, height: 32, borderRadius: 6, border: `1px solid ${T.n300}`,
                background: T.n0, cursor: page === 1 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: page === 1 ? T.n300 : T.n700, transition: "all 150ms",
              }}><ChevronLeft size={15} /></button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{
                  width: 32, height: 32, borderRadius: 6,
                  border: page === i + 1 ? "none" : `1px solid ${T.n300}`,
                  background: page === i + 1 ? T.primary500 : T.n0,
                  color: page === i + 1 ? T.n0 : T.n700,
                  cursor: "pointer", fontFamily: T.font, fontSize: 13, fontWeight: 500,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 150ms",
                }}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{
                width: 32, height: 32, borderRadius: 6, border: `1px solid ${T.n300}`,
                background: T.n0, cursor: page === totalPages ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: page === totalPages ? T.n300 : T.n700, transition: "all 150ms",
              }}><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <PatientModal
        open={modalOpen}
        onClose={(action) => { setModalOpen(false); setEditPatient(null); }}
        patient={editPatient}
        allPatients={patients}
        onCreate={createPatient}
        onUpdate={updatePatient}
      />
    </div>
  );
}

/* ═══════════════ MAIN EXPORT ═══════════════ */


