import { useState, useMemo, useCallback, useEffect } from 'react'
import { AlertCircle, Ban, Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, DollarSign, Edit3, FileBarChart, FileText, LayoutDashboard, Loader2, MapPin, MessageSquare, MoreHorizontal, Phone, Plus, RefreshCw, Repeat, Search, Timer, Trash2, User, Users, Video, X, XCircle } from 'lucide-react'
import { T } from '@/utils/theme'
import { Button, Modal, InputField, SelectField, Badge, Avatar, EmptyState, LoadingSpinner, getInitials } from '@/components/ui'
import { useAppointments, usePatients, useProfessionals, useServices } from '@/lib/hooks'

/* ─── Design Tokens ─── */

/* ─── Status ─── */
const STATUS = {
  pendente:      { label: "Pendente",      color: T.warning, bg: "rgba(245,158,11,0.10)", icon: Clock },
  confirmado:    { label: "Confirmado",    color: T.success, bg: "rgba(22,163,74,0.10)", icon: CheckCircle2 },
  cancelado:     { label: "Cancelado",     color: T.error,   bg: "rgba(220,38,38,0.10)", icon: XCircle },
  reagendar:     { label: "Reagendar",     color: T.orange,  bg: "rgba(249,115,22,0.10)", icon: RefreshCw },
  sem_resposta:  { label: "Sem resposta",  color: T.n400,    bg: "rgba(201,205,216,0.18)", icon: Timer },
  realizado:     { label: "Realizado",     color: T.info,    bg: "rgba(37,99,235,0.10)", icon: Check },
};

/* ─── Professionals ─── */
const PROFESSIONALS = [
  { id: 1, name: "Dra. Ana Costa",       short: "Ana",     specialty: "Psicologia",       color: "#3F6BFF" },
  { id: 2, name: "Dr. Carlos Lima",      short: "Carlos",  specialty: "Fisioterapia",     color: "#16A34A" },
  { id: 3, name: "Dra. Beatriz Rocha",   short: "Beatriz", specialty: "Fonoaudiologia",   color: "#F59E0B" },
  { id: 4, name: "Dr. Ricardo Alves",    short: "Ricardo", specialty: "Terapia Ocupacional", color: "#9333EA" },
];

const SERVICES = [
  { id: 1, name: "Psicoterapia", duration: 50, price: 180 },
  { id: 2, name: "Fisioterapia", duration: 45, price: 150 },
  { id: 3, name: "Fonoaudiologia", duration: 30, price: 130 },
  { id: 4, name: "Terapia Ocupacional", duration: 45, price: 160 },
  { id: 5, name: "Avaliação Neuropsicológica", duration: 90, price: 350 },
];

const PATIENTS = [
  "Maria Silva", "João Pereira", "Lucia Fernandes", "Pedro Santos",
  "Ana Oliveira", "Roberto Gomes", "Fernanda Dias", "Marcos Ribeiro",
  "Camila Souza", "Bruno Almeida", "Juliana Castro", "Diego Martins",
];

/* ─── Generate weekly appointments ─── */
function generateAppointments(weekStart) {
  const appts = [];
  const statuses = ["confirmado", "pendente", "sem_resposta", "confirmado", "confirmado", "pendente", "reagendar", "cancelado"];
  const types = ["presencial", "presencial", "presencial", "online", "presencial"];
  let id = 1;

  for (let d = 0; d < 6; d++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    const numAppts = d === 5 ? 4 : 6 + Math.floor(Math.random() * 4);

    for (let a = 0; a < numAppts; a++) {
      const prof = PROFESSIONALS[a % PROFESSIONALS.length];
      const service = SERVICES[a % SERVICES.length];
      const hour = 8 + Math.floor(a * 1.5);
      if (hour >= 18) continue;
      const minutes = a % 2 === 0 ? 0 : 30;

      appts.push({
        id: id++,
        date: dateStr,
        time: `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
        hour, minutes,
        patient: PATIENTS[a % PATIENTS.length],
        professional: prof,
        service: service,
        type: types[a % types.length],
        status: statuses[a % statuses.length],
        duration: service.duration,
      });
    }
  }
  return appts;
}

/* ─── Date Helpers ─── */
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateBR(d) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatDateFull(d) {
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function dayName(d) {
  return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

function isSameDay(d1, d2) {
  return d1.toISOString().split("T")[0] === d2.toISOString().split("T")[0];
}

function isToday(d) {
  return isSameDay(d, new Date());
}

/* ─── Hours array ─── */
const HOURS = [];
for (let h = 7; h <= 19; h++) {
  HOURS.push({ hour: h, label: `${String(h).padStart(2, "0")}:00` });
}

/* ═══════════════ SIDEBAR (same shell) ═══════════════ */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "pacientes", label: "Pacientes", icon: Users },
  { id: "prontuarios", label: "Prontuários", icon: FileText },
  { id: "mensagens", label: "Mensagens", icon: MessageSquare },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "relatorios", label: "Relatórios", icon: FileBarChart },
];


/* ═══════════════ APPOINTMENT CARD (Day view) ═══════════════ */
function AppointmentBlock({ apt, onClick, slotHeight }) {
  const durationSlots = apt.duration / 15;
  const height = durationSlots * slotHeight - 4;
  const prof = apt.professional;
  const statusConf = STATUS[apt.status];

  return (
    <div onClick={() => onClick(apt)} style={{
      position: "absolute",
      top: (apt.minutes / 15) * slotHeight + 2,
      left: 4, right: 4, height,
      background: T.n0,
      borderLeft: `3px solid ${prof.color}`,
      borderRadius: T.radiusMd,
      padding: "8px 10px",
      cursor: "pointer",
      boxShadow: T.shadowSoft,
      border: `1px solid ${T.n200}`,
      overflow: "hidden",
      transition: "box-shadow 200ms, transform 150ms",
      opacity: apt.status === "cancelado" ? 0.5 : 1,
      zIndex: 2,
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "scale(1.01)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadowSoft; e.currentTarget.style.transform = "none"; }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.n900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {apt.patient}
        </span>
        {apt.type === "online" && <Video size={12} color={T.info} style={{ flexShrink: 0 }} />}
      </div>
      {height > 44 && (
        <div style={{ fontSize: 11, color: T.n400, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
          <span>{apt.service.name}</span>
          <span>·</span>
          <span>{apt.duration}min</span>
        </div>
      )}
      {height > 64 && (
        <div style={{ marginTop: 6 }}>
          <StatusBadge status={apt.status} small />
        </div>
      )}
    </div>
  );
}

/* ═══════════════ APPOINTMENT CREATION / DETAIL MODAL ═══════════════ */
function AppointmentModal({ open, onClose, appointment, selectedSlot, appointments, patients=[], professionals=[], services=[], onCreate, onUpdate }) {
  const [form, setForm] = useState({
    patient: "", patient_id: "", professional: "", service: "", type: "presencial",
    date: "", time: "", recurrence: "none", recurrenceEnd: "",
  });
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(null);

  const isNew = !appointment;

  useEffect(() => {
    if (appointment) {
      setForm({
        patient: appointment.patient,
        professional: String(appointment.professional.id),
        service: String(appointment.service.id),
        type: appointment.type,
        date: appointment.date,
        time: appointment.time,
        recurrence: "none", recurrenceEnd: "",
      });
      setPatientSearch(appointment.patient);
    } else if (selectedSlot) {
      setForm(f => ({
        ...f, patient: "", professional: selectedSlot.professionalId ? String(selectedSlot.professionalId) : "",
        service: "", date: selectedSlot.date, time: selectedSlot.time,
        recurrence: "none", recurrenceEnd: "",
      }));
      setPatientSearch("");
    } else {
      setForm({ patient: "", professional: "", service: "", type: "presencial", date: "", time: "", recurrence: "none", recurrenceEnd: "" });
      setPatientSearch("");
    }
    setConflict(null);
  }, [appointment, selectedSlot, open]);

  const filteredPatients = patientSearch.length > 0
    ? patients.filter(p => p.full_name.toLowerCase().includes(patientSearch.toLowerCase()))
    : patients;

  const handleSave = async () => {
    // Check conflict
    if (form.professional && form.date && form.time) {
      const existing = appointments?.find(a =>
        a.date === form.date && a.time === form.time &&
        String(a.professional.id) === form.professional &&
        a.status !== "cancelado" &&
        (!appointment || a.id !== appointment.id)
      );
      if (existing) {
        setConflict(existing);
        return;
      }
    }
    setSaving(true);
    const selectedService = services.find(s => String(s.id) === form.service);
    const durationMin = selectedService?.duration || 50;
    const startTime = form.date && form.time ? new Date(`${form.date}T${form.time}`).toISOString() : null;
    const endTime = startTime ? new Date(new Date(startTime).getTime() + durationMin * 60000).toISOString() : null;
    const payload = {
      patient_id: form.patient_id || null,
      professional_id: form.professional || null,
      service_id: form.service || null,
      start_time: startTime,
      end_time: endTime,
      modality: form.type === "online" ? "online" : "in_person",
      status: "scheduled",
    };
    const { error } = isNew
      ? await (onCreate?.(payload) ?? Promise.resolve({}))
      : await (onUpdate?.(appointment.id, payload) ?? Promise.resolve({}));
    setSaving(false);
    if (!error) onClose("saved");
  };

  if (!open) return null;

  const inputStyle = {
    width: "100%", padding: "10px 12px", border: `1.5px solid ${T.n300}`,
    borderRadius: T.radiusMd, fontSize: 14, fontFamily: T.font, color: T.n900,
    outline: "none", transition: "border 200ms", boxSizing: "border-box",
    background: T.n0,
  };
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 5 };
  const fieldWrap = { marginBottom: 16 };

  return (
    <div onClick={() => onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(17,17,17,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)", animation: "fadeIn 150ms ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 520, background: T.n0, borderRadius: T.radiusLg,
        boxShadow: T.shadowLg, overflow: "hidden", animation: "slideUp 250ms ease",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${T.n200}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            {isNew ? "Novo agendamento" : `Agendamento — ${appointment.patient}`}
          </h2>
          <button onClick={() => onClose()} style={{
            width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
            background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
            color: T.n400, transition: "all 150ms",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.n100; e.currentTarget.style.color = T.n700; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.n400; }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Conflict warning */}
          {conflict && (
            <div style={{
              background: "rgba(220,38,38,0.06)", border: `1px solid rgba(220,38,38,0.2)`,
              borderRadius: T.radiusMd, padding: "14px 16px", marginBottom: 18,
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <AlertCircle size={18} color={T.error} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.error, marginBottom: 4 }}>Conflito de horário</div>
                <div style={{ fontSize: 13, color: T.n700, lineHeight: 1.5 }}>
                  {conflict.professional.name} já possui um agendamento com <strong>{conflict.patient}</strong> neste horário ({conflict.time} — {conflict.service.name}).
                </div>
                <button onClick={() => setConflict(null)} style={{
                  marginTop: 8, fontSize: 12, fontWeight: 500, color: T.primary500,
                  background: "none", border: "none", cursor: "pointer", fontFamily: T.font, padding: 0,
                }}>Escolher outro horário</button>
              </div>
            </div>
          )}

          {/* Patient search */}
          <div style={{ ...fieldWrap, position: "relative" }}>
            <label style={labelStyle}>Paciente *</label>
            <div style={{ position: "relative" }}>
              <input
                style={inputStyle}
                placeholder="Buscar por nome..."
                value={patientSearch}
                onChange={e => { setPatientSearch(e.target.value); setShowPatientList(true); setForm(f => ({ ...f, patient: "" })); }}
                onFocus={() => setShowPatientList(true)}
                onBlur={() => setTimeout(() => setShowPatientList(false), 200)}
              />
              <Search size={16} color={T.n400} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} />
            </div>
            {showPatientList && patientSearch && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                background: T.n0, border: `1px solid ${T.n200}`, borderRadius: T.radiusMd,
                boxShadow: T.shadowMd, maxHeight: 180, overflowY: "auto", marginTop: 4,
              }}>
                {filteredPatients.length === 0 ? (
                  <div style={{ padding: "12px 14px", fontSize: 13, color: T.n400 }}>Nenhum paciente encontrado</div>
                ) : filteredPatients.slice(0, 6).map((p, i) => (
                  <button key={p.id ?? i} onMouseDown={() => { setPatientSearch(p.full_name); setForm(f => ({ ...f, patient: p.full_name, patient_id: p.id })); setShowPatientList(false); }}
                    style={{
                      width: "100%", padding: "10px 14px", border: "none", background: "transparent",
                      cursor: "pointer", fontFamily: T.font, fontSize: 13, color: T.n900, textAlign: "left",
                      display: "flex", alignItems: "center", gap: 8, transition: "background 100ms",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = T.n100}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Users size={14} color={T.n400} /> {p.full_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Professional + Service */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Profissional *</label>
              <select value={form.professional} onChange={e => setForm(f => ({ ...f, professional: e.target.value }))}
                style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}>
                <option value="">Selecionar...</option>
                {professionals.map(p => <option key={p.id} value={p.id}>{p.name||p.full_name}</option>)}
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Serviço *</label>
              <select value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}>
                <option value="">Selecionar...</option>
                {services.map(sv => <option key={sv.id} value={sv.id}>{sv.name} ({sv.duration||sv.duration_minutes||50}min)</option>)}
              </select>
            </div>
          </div>

          {/* Date + Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Data *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={inputStyle} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Horário *</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                style={inputStyle} />
            </div>
          </div>

          {/* Type */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Tipo</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { id: "presencial", label: "Presencial", icon: MapPin },
                { id: "online", label: "Online", icon: Video },
              ].map(t => (
                <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                  style={{
                    flex: 1, padding: "11px 14px", borderRadius: T.radiusMd, cursor: "pointer",
                    border: `2px solid ${form.type === t.id ? T.primary500 : T.n300}`,
                    background: form.type === t.id ? T.primary50 : T.n0,
                    color: form.type === t.id ? T.primary500 : T.n700,
                    fontFamily: T.font, fontSize: 13, fontWeight: 500,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "all 200ms",
                  }}>
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Recorrência</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { id: "none", label: "Nenhuma" },
                { id: "weekly", label: "Semanal" },
                { id: "biweekly", label: "Quinzenal" },
                { id: "monthly", label: "Mensal" },
              ].map(r => (
                <button key={r.id} onClick={() => setForm(f => ({ ...f, recurrence: r.id }))}
                  style={{
                    padding: "7px 14px", borderRadius: 20, cursor: "pointer",
                    border: `1.5px solid ${form.recurrence === r.id ? T.primary500 : T.n300}`,
                    background: form.recurrence === r.id ? T.primary50 : T.n0,
                    color: form.recurrence === r.id ? T.primary500 : T.n700,
                    fontFamily: T.font, fontSize: 12, fontWeight: 500,
                    transition: "all 200ms",
                  }}>
                  {r.id !== "none" && <Repeat size={11} style={{ marginRight: 4, verticalAlign: -1 }} />}
                  {r.label}
                </button>
              ))}
            </div>
            {form.recurrence !== "none" && (
              <div style={{ marginTop: 10 }}>
                <label style={{ ...labelStyle, fontSize: 12 }}>Data de término da recorrência</label>
                <input type="date" value={form.recurrenceEnd} onChange={e => setForm(f => ({ ...f, recurrenceEnd: e.target.value }))}
                  style={{ ...inputStyle, maxWidth: 200 }} />
              </div>
            )}
          </div>

          {/* Status selector (only for existing) */}
          {!isNew && (
            <div style={fieldWrap}>
              <label style={labelStyle}>Status</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Object.entries(STATUS).map(([key, s]) => {
                  const Icon = s.icon;
                  const isActive = appointment.status === key;
                  return (
                    <button key={key} style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                      borderRadius: 20, border: `1.5px solid ${isActive ? s.color : T.n300}`,
                      background: isActive ? s.bg : T.n0, color: isActive ? s.color : T.n400,
                      fontSize: 12, fontWeight: 500, cursor: "pointer",
                      fontFamily: T.font, transition: "all 200ms",
                    }}>
                      <Icon size={12} /> {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${T.n200}`,
          display: "flex", justifyContent: "space-between", gap: 10,
        }}>
          <button onClick={() => onClose()} style={{
            padding: "11px 20px", borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`,
            background: T.n0, color: T.n700, fontFamily: T.font, fontSize: 14, fontWeight: 500,
            cursor: "pointer", transition: "all 150ms",
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.n100}
            onMouseLeave={e => e.currentTarget.style.background = T.n0}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "11px 24px", borderRadius: T.radiusMd, border: "none",
            background: T.primary500, color: T.n0, fontFamily: T.font, fontSize: 14, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            transition: "all 200ms", opacity: saving ? 0.7 : 1,
          }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = T.primary600; }}
            onMouseLeave={e => e.currentTarget.style.background = T.primary500}>
            {saving ? <><Loader2 size={16} className="spin" /> Salvando...</>
              : isNew ? <><Check size={16} /> Agendar</> : <><Check size={16} /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ DAY VIEW ═══════════════ */
function DayView({ date, appointments, profFilter, onSlotClick, onAptClick }) {
  const SLOT_H = 60;
  const filtered = appointments.filter(a => {
    const d = a.date === date.toISOString().split("T")[0];
    const p = profFilter === "all" || a.professional.id === Number(profFilter);
    return d && p;
  });

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = isToday(date) && currentMinutes >= 7 * 60 && currentMinutes <= 19 * 60;
  const nowTop = ((currentMinutes - 7 * 60) / 60) * SLOT_H;

  const groupedByHour = {};
  filtered.forEach(a => {
    if (!groupedByHour[a.hour]) groupedByHour[a.hour] = [];
    groupedByHour[a.hour].push(a);
  });

  return (
    <div style={{ position: "relative", minHeight: HOURS.length * SLOT_H }}>
      {/* Now line */}
      {showNowLine && (
        <div style={{
          position: "absolute", top: nowTop, left: 58, right: 0, zIndex: 5,
          display: "flex", alignItems: "center",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, flexShrink: 0 }} />
          <div style={{ flex: 1, height: 2, background: T.error }} />
        </div>
      )}

      {HOURS.map(({ hour, label }) => (
        <div key={hour} style={{
          display: "flex", height: SLOT_H, borderBottom: `1px solid ${T.n200}`,
        }}>
          {/* Time label */}
          <div style={{
            width: 60, flexShrink: 0, padding: "0 8px", textAlign: "right",
            fontSize: 12, color: T.n400, fontWeight: 500, paddingTop: 4,
          }}>
            {label}
          </div>

          {/* Slot area */}
          <div style={{
            flex: 1, position: "relative", cursor: "pointer",
            transition: "background 100ms",
          }}
            onClick={() => onSlotClick({ date: date.toISOString().split("T")[0], time: label })}
            onMouseEnter={e => e.currentTarget.style.background = T.n100}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {/* Half hour line */}
            <div style={{
              position: "absolute", top: "50%", left: 0, right: 0,
              height: 1, background: T.n200, opacity: 0.5,
            }} />

            {/* Appointments in this hour */}
            {(groupedByHour[hour] || []).map(apt => (
              <AppointmentBlock key={apt.id} apt={apt} onClick={onAptClick} slotHeight={SLOT_H / 4} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════ WEEK VIEW ═══════════════ */
function WeekView({ weekStart, appointments, profFilter, onSlotClick, onAptClick }) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const SLOT_H = 52;

  return (
    <div style={{ display: "flex", overflow: "hidden" }}>
      {/* Time column */}
      <div style={{ width: 56, flexShrink: 0 }}>
        <div style={{ height: 48 }} />
        {HOURS.map(({ hour, label }) => (
          <div key={hour} style={{
            height: SLOT_H, display: "flex", alignItems: "flex-start",
            justifyContent: "flex-end", padding: "2px 6px 0 0",
            fontSize: 11, color: T.n400, fontWeight: 500,
          }}>{label}</div>
        ))}
      </div>

      {/* Day columns */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", minWidth: 0 }}>
        {days.map((day, di) => {
          const dateStr = day.toISOString().split("T")[0];
          const dayAppts = appointments.filter(a => {
            const d = a.date === dateStr;
            const p = profFilter === "all" || a.professional.id === Number(profFilter);
            return d && p;
          });

          const groupedByHour = {};
          dayAppts.forEach(a => {
            if (!groupedByHour[a.hour]) groupedByHour[a.hour] = [];
            groupedByHour[a.hour].push(a);
          });

          const today = isToday(day);
          const isSun = day.getDay() === 0;

          return (
            <div key={di} style={{
              borderLeft: di > 0 ? `1px solid ${T.n200}` : "none",
              opacity: isSun ? 0.4 : 1,
            }}>
              {/* Day header */}
              <div style={{
                height: 48, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                borderBottom: `1px solid ${T.n200}`,
                background: today ? T.primary50 : "transparent",
              }}>
                <span style={{ fontSize: 11, color: T.n400, textTransform: "capitalize", fontWeight: 500 }}>
                  {dayName(day)}
                </span>
                <span style={{
                  fontSize: 16, fontWeight: 700, lineHeight: 1.2,
                  color: today ? T.primary500 : T.n900,
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: today ? T.primary500 : "transparent",
                  ...(today ? { color: T.n0 } : {}),
                }}>
                  {day.getDate()}
                </span>
              </div>

              {/* Hour slots */}
              {HOURS.map(({ hour, label }) => (
                <div key={hour} style={{
                  height: SLOT_H, borderBottom: `1px solid ${T.n200}`,
                  position: "relative", cursor: isSun ? "default" : "pointer",
                  transition: "background 100ms",
                }}
                  onClick={() => !isSun && onSlotClick({ date: dateStr, time: label })}
                  onMouseEnter={e => { if (!isSun) e.currentTarget.style.background = T.n100; }}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {(groupedByHour[hour] || []).map(apt => (
                    <div key={apt.id}
                      onClick={(e) => { e.stopPropagation(); onAptClick(apt); }}
                      style={{
                        position: "absolute",
                        top: (apt.minutes / 60) * SLOT_H + 2,
                        left: 2, right: 2,
                        height: Math.max((apt.duration / 60) * SLOT_H - 4, 20),
                        background: `${apt.professional.color}16`,
                        borderLeft: `3px solid ${apt.professional.color}`,
                        borderRadius: 4, padding: "3px 6px", overflow: "hidden",
                        cursor: "pointer", zIndex: 2,
                        fontSize: 11, lineHeight: 1.3,
                        transition: "opacity 150ms",
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                      <div style={{ fontWeight: 600, color: T.n900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {apt.patient}
                      </div>
                      {(apt.duration / 60) * SLOT_H > 30 && (
                        <div style={{ color: T.n400, fontSize: 10, whiteSpace: "nowrap", overflow: "hidden" }}>
                          {apt.time} · {apt.service.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Status mapping from DB enum to UI keys ─── */
const DB_STATUS_MAP = {
  scheduled: "pendente", confirmed: "confirmado", in_progress: "confirmado",
  completed: "realizado", cancelled: "cancelado", no_show: "sem_resposta", rescheduled: "reagendar",
};

/* ═══════════════ AGENDA CONTENT ═══════════════ */
export default function Agenda() {
  /* ─── Hooks ─── */
  const { data: rawAppointments, create: createAppointment, update: updateAppointment } = useAppointments();
  const { data: rawPatients } = usePatients();
  const { data: rawProfessionals } = useProfessionals();
  const { data: rawServices } = useServices();

  /* ─── Adapt hook data → UI shape ─── */
  const appointments = useMemo(() => rawAppointments.map(a => {
    const start = a.start_time ? new Date(a.start_time) : null;
    return {
      id: a.id,
      date: start ? start.toISOString().split("T")[0] : "",
      time: start ? `${String(start.getHours()).padStart(2,"0")}:${String(start.getMinutes()).padStart(2,"0")}` : "",
      hour: start ? start.getHours() : 0,
      minutes: start ? start.getMinutes() : 0,
      patient: a.patient?.full_name ?? "",
      patient_id: a.patient_id,
      professional: {
        id: a.professional_id,
        name: a.professional?.full_name ?? "",
        short: (a.professional?.full_name ?? "").split(" ")[0],
        color: a.professional?.color ?? T.primary500,
      },
      service: { id: a.service_id ?? "", name: "", duration: a.professional?.session_duration ?? 50 },
      type: a.modality === "online" ? "online" : "presencial",
      status: DB_STATUS_MAP[a.status] ?? "pendente",
      duration: a.professional?.session_duration ?? 50,
    };
  }), [rawAppointments]);

  const profList = useMemo(() => rawProfessionals.map(p => ({
    id: p.id, name: p.full_name, short: (p.full_name||"").split(" ")[0], color: p.color || T.primary500,
  })), [rawProfessionals]);

  const svcList = useMemo(() => rawServices.map(s => ({
    id: s.id, name: s.name, duration: s.duration_minutes || 50, price: s.price || 0,
  })), [rawServices]);

  const patientList = useMemo(() => rawPatients, [rawPatients]);

  const [view, setView] = useState("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [profFilter, setProfFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setWeekStart(getMonday(today));
  };

  const navigate = (dir) => {
    if (view === "day") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + dir);
      setCurrentDate(d);
      setWeekStart(getMonday(d));
    } else {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + 7 * dir);
      setWeekStart(d);
      setCurrentDate(d);
    }
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const todayAppts = appointments.filter(a => a.date === currentDate.toISOString().split("T")[0]);
  const todayStats = {
    total: todayAppts.length,
    confirmed: todayAppts.filter(a => a.status === "confirmado").length,
    pending: todayAppts.filter(a => a.status === "pendente" || a.status === "sem_resposta").length,
  };

  const openNewModal = (slot) => { setSelectedApt(null); setSelectedSlot(slot); setModalOpen(true); };
  const openAptModal = (apt) => { setSelectedApt(apt); setSelectedSlot(null); setModalOpen(true); };

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, flexWrap: "wrap", gap: 12,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.n900, letterSpacing: "-0.01em" }}>Agenda</h1>

          {/* View toggle */}
          <div style={{
            display: "flex", background: T.n100, borderRadius: T.radiusMd, padding: 3,
            border: `1px solid ${T.n200}`,
          }}>
            {[{ id: "day", label: "Dia" }, { id: "week", label: "Semana" }].map(v => (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                fontFamily: T.font, fontSize: 13, fontWeight: view === v.id ? 600 : 400,
                background: view === v.id ? T.n0 : "transparent",
                color: view === v.id ? T.n900 : T.n400,
                boxShadow: view === v.id ? T.shadowSoft : "none",
                transition: "all 200ms",
              }}>{v.label}</button>
            ))}
          </div>

          {/* Date nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => navigate(-1)} style={{
              width: 32, height: 32, borderRadius: 6, border: `1px solid ${T.n300}`,
              background: T.n0, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: T.n700,
              transition: "all 150ms",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.n100}
              onMouseLeave={e => e.currentTarget.style.background = T.n0}>
              <ChevronLeft size={16} />
            </button>

            <button onClick={goToday} style={{
              padding: "7px 14px", borderRadius: 6, border: `1px solid ${T.n300}`,
              background: T.n0, cursor: "pointer", fontFamily: T.font,
              fontSize: 13, fontWeight: 500, color: T.n700, transition: "all 150ms",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.n100}
              onMouseLeave={e => e.currentTarget.style.background = T.n0}>
              Hoje
            </button>

            <button onClick={() => navigate(1)} style={{
              width: 32, height: 32, borderRadius: 6, border: `1px solid ${T.n300}`,
              background: T.n0, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: T.n700,
              transition: "all 150ms",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.n100}
              onMouseLeave={e => e.currentTarget.style.background = T.n0}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Date label */}
          <span style={{ fontSize: 15, fontWeight: 600, color: T.n900 }}>
            {view === "day"
              ? formatDateFull(currentDate)
              : `${formatDateBR(weekStart)} — ${formatDateBR(weekEnd)}`}
          </span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Professional filter */}
          <div style={{ position: "relative" }}>
            <select value={profFilter} onChange={e => setProfFilter(e.target.value)}
              style={{
                padding: "8px 32px 8px 12px", borderRadius: T.radiusMd,
                border: `1.5px solid ${T.n300}`, background: T.n0,
                fontFamily: T.font, fontSize: 13, color: T.n700,
                cursor: "pointer", appearance: "auto", outline: "none",
              }}>
              <option value="all">Todos os profissionais</option>
              {profList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* New appointment button */}
          <button onClick={() => openNewModal(null)} style={{
            padding: "9px 18px", borderRadius: T.radiusMd, border: "none",
            background: T.primary500, color: T.n0, fontFamily: T.font,
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, transition: "all 200ms",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.primary600; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.primary500; e.currentTarget.style.transform = "none"; }}>
            <Plus size={16} /> Novo agendamento
          </button>
        </div>
      </div>

      {/* Stats bar (day view) */}
      {view === "day" && (
        <div style={{
          display: "flex", gap: 16, marginBottom: 16,
          animation: "fadeSlideUp 0.3s ease both",
        }}>
          {[
            { label: "Total", value: todayStats.total, color: T.n700, bg: T.n100 },
            { label: "Confirmados", value: todayStats.confirmed, color: T.success, bg: "rgba(22,163,74,0.08)" },
            { label: "Pendentes", value: todayStats.pending, color: T.warning, bg: "rgba(245,158,11,0.08)" },
          ].map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
              borderRadius: T.radiusMd, background: s.bg, fontSize: 13, fontWeight: 500,
            }}>
              <span style={{ color: s.color, fontWeight: 700, fontSize: 18 }}>{s.value}</span>
              <span style={{ color: T.n400 }}>{s.label}</span>
            </div>
          ))}

          {/* Legend */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            {profList.filter(p => profFilter === "all" || String(p.id) === String(profFilter)).map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.n400 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
                {p.short}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar body */}
      <div style={{
        background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`,
        boxShadow: T.shadowSoft, overflow: "auto",
        maxHeight: "calc(100vh - 220px)",
        animation: "fadeSlideUp 0.35s ease 0.05s both",
      }}>
        {view === "day" ? (
          <DayView
            date={currentDate}
            appointments={appointments}
            profFilter={profFilter}
            onSlotClick={openNewModal}
            onAptClick={openAptModal}
          />
        ) : (
          <WeekView
            weekStart={weekStart}
            appointments={appointments}
            profFilter={profFilter}
            onSlotClick={openNewModal}
            onAptClick={openAptModal}
          />
        )}
      </div>

      {/* Modal */}
      <AppointmentModal
        open={modalOpen}
        onClose={(action) => { setModalOpen(false); setSelectedApt(null); setSelectedSlot(null); }}
        appointment={selectedApt}
        selectedSlot={selectedSlot}
        appointments={appointments}
        patients={patientList}
        professionals={profList}
        services={svcList}
        onCreate={createAppointment}
        onUpdate={updateAppointment}
      />
    </div>
  );
}

/* ═══════════════ MAIN EXPORT ═══════════════ */
