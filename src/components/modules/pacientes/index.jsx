import { useState, useEffect, useMemo } from 'react'
import {
  Users, Search, X, Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Phone, Mail, Calendar, DollarSign, MessageSquare, User, Clock,
  CheckCircle2, AlertCircle, XCircle, MoreHorizontal, Edit3, ArrowLeft,
  Download, Loader2, Check, CreditCard, Activity, Shield, Home, Hash, Video,
} from 'lucide-react'
import { T } from '@/utils/theme'
import { Badge, Button, Modal, InputField, SelectField, TextArea, Avatar, getInitials } from '@/components/ui'
import { usePatients, useAppointments, useCharges } from '@/lib/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/lib/store'

/* ─── Constants ─── */
const CONVENIOS = ['Particular', 'Unimed', 'Bradesco Saúde', 'Amil', 'SulAmérica', 'Porto Seguro']

const APT_STATUS = {
  pendente:   { label: 'Pendente',   color: T.warning, bg: 'rgba(245,158,11,0.10)', icon: Clock },
  confirmado: { label: 'Confirmado', color: T.success, bg: 'rgba(22,163,74,0.10)',  icon: CheckCircle2 },
  cancelado:  { label: 'Cancelado',  color: T.error,   bg: 'rgba(220,38,38,0.10)',  icon: XCircle },
  realizado:  { label: 'Realizado',  color: T.info,    bg: 'rgba(37,99,235,0.10)',  icon: Check },
  scheduled:  { label: 'Confirmado', color: T.success, bg: 'rgba(22,163,74,0.10)',  icon: CheckCircle2 },
  completed:  { label: 'Realizado',  color: T.info,    bg: 'rgba(37,99,235,0.10)',  icon: Check },
  cancelled:  { label: 'Cancelado',  color: T.error,   bg: 'rgba(220,38,38,0.10)',  icon: XCircle },
}

const INV_STATUS = {
  pending:  { label: 'Aberto',    color: T.warning, bg: 'rgba(245,158,11,0.10)' },
  paid:     { label: 'Pago',      color: T.success, bg: 'rgba(22,163,74,0.10)' },
  overdue:  { label: 'Atrasado',  color: T.error,   bg: 'rgba(220,38,38,0.10)' },
  aberto:   { label: 'Aberto',    color: T.warning, bg: 'rgba(245,158,11,0.10)' },
  pago:     { label: 'Pago',      color: T.success, bg: 'rgba(22,163,74,0.10)' },
  atrasado: { label: 'Atrasado',  color: T.error,   bg: 'rgba(220,38,38,0.10)' },
}

/* ─── Demo fallback ─── */
const DEMO_PATIENTS = [
  { id: 1, full_name: 'Maria Silva', phone: '(11) 99876-5432', cpf: '123.456.789-00', email: 'maria@email.com', date_of_birth: '1985-03-15', insurance: 'Unimed', address: 'Rua das Flores, 123 - São Paulo, SP', notes: 'Paciente com histórico de ansiedade.', status: 'active', created_at: '2024-06-10', last_visit: '2025-01-15', total_sessions: 24, pending_amount: 0 },
  { id: 2, full_name: 'João Pereira', phone: '(11) 98765-1234', cpf: '987.654.321-00', email: 'joao.p@email.com', date_of_birth: '1990-07-22', insurance: 'Particular', address: 'Av. Paulista, 1000', notes: '', status: 'active', created_at: '2024-08-20', last_visit: '2025-01-18', total_sessions: 12, pending_amount: 180 },
  { id: 3, full_name: 'Lucia Fernandes', phone: '(11) 97654-3210', cpf: '456.789.123-00', email: 'lucia.f@email.com', date_of_birth: '1978-11-03', insurance: 'Bradesco Saúde', address: 'Rua Augusta, 500', notes: 'Necessita sala térrea.', status: 'active', created_at: '2024-03-05', last_visit: '2025-01-20', total_sessions: 38, pending_amount: 0 },
  { id: 4, full_name: 'Pedro Santos', phone: '(11) 96543-2109', cpf: '789.123.456-00', email: 'pedro.s@email.com', date_of_birth: '1995-01-30', insurance: 'Particular', address: 'Rua Oscar Freire, 200', notes: '', status: 'active', created_at: '2024-09-12', last_visit: '2025-01-10', total_sessions: 8, pending_amount: 360 },
  { id: 5, full_name: 'Ana Oliveira', phone: '(11) 95432-1098', cpf: '321.654.987-00', email: 'ana.o@email.com', date_of_birth: '1988-05-18', insurance: 'Amil', address: 'Rua Haddock Lobo, 300', notes: 'Acompanhamento semanal.', status: 'active', created_at: '2024-01-15', last_visit: '2025-01-19', total_sessions: 52, pending_amount: 0 },
  { id: 6, full_name: 'Roberto Gomes', phone: '(11) 94321-0987', cpf: '654.987.321-00', email: 'roberto.g@email.com', date_of_birth: '1972-09-08', insurance: 'SulAmérica', address: 'Alameda Santos, 800', notes: '', status: 'active', created_at: '2024-07-01', last_visit: '2025-01-05', total_sessions: 15, pending_amount: 520 },
  { id: 7, full_name: 'Fernanda Dias', phone: '(11) 93210-9876', cpf: '147.258.369-00', email: 'fernanda.d@email.com', date_of_birth: '1993-12-25', insurance: 'Particular', address: 'Rua Bela Cintra, 400', notes: '', status: 'active', created_at: '2024-10-08', last_visit: '2024-12-20', total_sessions: 6, pending_amount: 0 },
  { id: 8, full_name: 'Marcos Ribeiro', phone: '(11) 92109-8765', cpf: '258.369.147-00', email: 'marcos.r@email.com', date_of_birth: '1982-04-12', insurance: 'Unimed', address: 'Rua Consolação, 600', notes: '', status: 'archived', created_at: '2023-11-20', last_visit: '2024-08-10', total_sessions: 18, pending_amount: 0 },
  { id: 9, full_name: 'Camila Souza', phone: '(21) 99887-6655', cpf: '369.147.258-00', email: 'camila.s@email.com', date_of_birth: '2000-08-05', insurance: 'Porto Seguro', address: 'Rua Frei Caneca, 150', notes: 'Menor acompanhada.', status: 'active', created_at: '2024-04-18', last_visit: '2025-01-17', total_sessions: 20, pending_amount: 130 },
  { id: 10, full_name: 'Bruno Almeida', phone: '(11) 98877-6644', cpf: '741.852.963-00', email: 'bruno.a@email.com', date_of_birth: '1998-02-28', insurance: 'Particular', address: 'Rua Peixoto Gomide, 700', notes: '', status: 'active', created_at: '2024-11-01', last_visit: '2025-01-12', total_sessions: 5, pending_amount: 0 },
]

/* ═══ Patient Modal ═══ */
function PatientModal({ open, onClose, patient, onCreate, onUpdate, allPatients }) {
  const isEdit = !!patient
  const [form, setForm] = useState({ full_name: '', phone: '', cpf: '', email: '', date_of_birth: '', insurance: '', address: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [dupeWarning, setDupeWarning] = useState(null)

  useEffect(() => {
    if (patient) {
      setForm({
        full_name: patient.full_name || '', phone: patient.phone || '', cpf: patient.cpf || '',
        email: patient.email || '', date_of_birth: patient.date_of_birth || '',
        insurance: patient.insurance || '', address: patient.address || '', notes: patient.notes || '',
      })
    } else {
      setForm({ full_name: '', phone: '', cpf: '', email: '', date_of_birth: '', insurance: '', address: '', notes: '' })
    }
    setErrors({}); setDupeWarning(null)
  }, [patient, open])

  const upd = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })) }

  useEffect(() => {
    if (!open || isEdit) return
    const dupe = allPatients?.find((p) =>
      (form.cpf && form.cpf.length > 10 && p.cpf === form.cpf) ||
      (form.phone && form.phone.length > 10 && p.phone === form.phone)
    )
    setDupeWarning(dupe || null)
  }, [form.cpf, form.phone, open])

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Nome é obrigatório'
    if (!form.phone.trim()) e.phone = 'Telefone é obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) {
        await onUpdate?.(patient.id, form)
      } else {
        await onCreate?.(form)
      }
      onClose('saved')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div onClick={() => onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(17,17,17,0.4)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)', animation: 'fadeIn 150ms ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 580, background: T.n0, borderRadius: T.radiusLg,
        boxShadow: T.shadowLg, overflow: 'hidden', animation: 'slideUp 250ms ease',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${T.n200}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{isEdit ? 'Editar paciente' : 'Novo paciente'}</h2>
          <button onClick={() => onClose()} style={{
            width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.n400,
          }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {dupeWarning && (
            <div style={{
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: T.radiusMd, padding: '12px 16px', marginBottom: 18,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <AlertCircle size={18} color={T.warning} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.warning, marginBottom: 2 }}>Possível duplicidade</div>
                <div style={{ fontSize: 13, color: T.n700, lineHeight: 1.5 }}>
                  Já existe um paciente com dados semelhantes: <strong>{dupeWarning.full_name}</strong> ({dupeWarning.phone})
                </div>
              </div>
            </div>
          )}

          <InputField label="Nome completo" icon={User} placeholder="Nome do paciente" required
            value={form.full_name} onChange={(v) => upd('full_name', v)} error={errors.full_name} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Telefone (WhatsApp)" icon={Phone} placeholder="(11) 99999-9999" required
              value={form.phone} onChange={(v) => upd('phone', v)} error={errors.phone} />
            <InputField label="CPF" icon={Hash} placeholder="000.000.000-00"
              value={form.cpf} onChange={(v) => upd('cpf', v)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="E-mail" icon={Mail} type="email" placeholder="paciente@email.com"
              value={form.email} onChange={(v) => upd('email', v)} />
            <InputField label="Data de Nascimento" icon={Calendar} type="date"
              value={form.date_of_birth} onChange={(v) => upd('date_of_birth', v)} />
          </div>

          <SelectField label="Convênio" value={form.insurance} onChange={(v) => upd('insurance', v)}
            placeholder="Selecionar convênio..."
            options={CONVENIOS.map((c) => ({ value: c, label: c }))} />

          <InputField label="Endereço" icon={Home} placeholder="Rua, número, bairro, cidade"
            value={form.address} onChange={(v) => upd('address', v)} />

          <TextArea label="Observações" placeholder="Informações adicionais sobre o paciente..."
            value={form.notes} onChange={(v) => upd('notes', v)} rows={3} />
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.n200}`, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="secondary" onClick={() => onClose()}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving} icon={Check}>
            {isEdit ? 'Salvar' : 'Cadastrar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ═══ Patient Detail ═══ */
function PatientDetail({ patient, onBack, onEdit }) {
  const [tab, setTab] = useState('info')
  const { navigate } = useAppStore()
  const age = patient.date_of_birth ? Math.floor((new Date() - new Date(patient.date_of_birth)) / 31557600000) : null
  const name = patient.full_name || ''

  const { data: patientAppointments } = useAppointments({
    filters: [{ column: 'patient_id', value: patient.id }],
  })

  const { data: patientCharges } = useCharges({
    filters: [{ column: 'patient_id', value: patient.id }],
  })

  const tabs = [
    { id: 'info', label: 'Informações', icon: User },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'billing', label: 'Financeiro', icon: DollarSign },
  ]

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeSlideUp 0.35s ease both' }}>
      {/* Breadcrumb */}
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none',
        cursor: 'pointer', fontFamily: T.font, fontSize: 13, color: T.n400, padding: 0,
        marginBottom: 20, fontWeight: 500,
      }}
        onMouseEnter={(e) => { e.currentTarget.style.color = T.primary500 }}
        onMouseLeave={(e) => { e.currentTarget.style.color = T.n400 }}>
        <ArrowLeft size={15} /> Voltar para pacientes
      </button>

      {/* Header card */}
      <div style={{
        background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`,
        boxShadow: T.shadowSoft, padding: '24px 28px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: `linear-gradient(135deg, ${T.primary500}, ${T.primary600})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.n0, fontSize: 22, fontWeight: 700, flexShrink: 0,
          }}>{getInitials(name)}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: T.n900 }}>{name}</h1>
              <Badge color={patient.status === 'active' || patient.status === 'ativo' ? T.success : T.n400}
                bg={patient.status === 'active' || patient.status === 'ativo' ? 'rgba(22,163,74,0.10)' : 'rgba(201,205,216,0.15)'}>
                {patient.status === 'active' || patient.status === 'ativo' ? 'Ativo' : 'Arquivado'}
              </Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: 13, color: T.n400, flexWrap: 'wrap' }}>
              {age && <span>{age} anos</span>}
              {patient.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {patient.phone}</span>}
              {patient.email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {patient.email}</span>}
              {patient.insurance && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={12} /> {patient.insurance}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" icon={Edit3} onClick={() => onEdit?.(patient)}>Editar</Button>
          <Button size="sm" icon={Calendar} onClick={() => navigate('agenda')}>Agendar</Button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total de consultas', value: patient.total_sessions || patientAppointments?.length || 0, icon: Activity, color: T.primary500 },
          { label: 'Última visita', value: patient.last_visit ? new Date(patient.last_visit).toLocaleDateString('pt-BR') : '—', icon: Calendar, color: T.info },
          { label: 'Paciente desde', value: patient.created_at ? new Date(patient.created_at).toLocaleDateString('pt-BR') : '—', icon: Clock, color: T.n700 },
          { label: 'Pendente', value: (patient.pending_amount || 0) > 0 ? `R$ ${patient.pending_amount}` : '—', icon: CreditCard, color: (patient.pending_amount || 0) > 0 ? T.warning : T.success },
        ].map((s, i) => (
          <div key={i} style={{
            background: T.n0, borderRadius: T.radiusMd, border: `1px solid ${T.n200}`,
            padding: '16px 18px', boxShadow: T.shadowSoft,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n400, marginBottom: 6 }}>
              <s.icon size={14} /> {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.n200}` }}>
        {tabs.map((t) => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px',
              border: 'none', cursor: 'pointer', fontFamily: T.font, fontSize: 14,
              fontWeight: active ? 600 : 400, color: active ? T.primary500 : T.n400,
              background: 'transparent', borderBottom: `2px solid ${active ? T.primary500 : 'transparent'}`,
              marginBottom: -2, transition: 'all 150ms',
            }}>
              <t.icon size={16} /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div style={{
        background: T.n0, borderRadius: `0 0 ${T.radiusLg}px ${T.radiusLg}px`,
        border: `1px solid ${T.n200}`, borderTop: 'none', boxShadow: T.shadowSoft, minHeight: 300,
      }}>
        {tab === 'info' && (
          <div style={{ padding: '24px 28px', animation: 'fadeIn 200ms ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: T.n900, marginBottom: 16 }}>Dados Pessoais</h3>
                {[
                  { label: 'Nome completo', value: name },
                  { label: 'CPF', value: patient.cpf },
                  { label: 'Data de Nascimento', value: patient.date_of_birth ? `${new Date(patient.date_of_birth).toLocaleDateString('pt-BR')} (${age} anos)` : '—' },
                  { label: 'Telefone', value: patient.phone },
                  { label: 'E-mail', value: patient.email },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: T.n400, marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 14, color: T.n900, fontWeight: 500 }}>{f.value || '—'}</div>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: T.n900, marginBottom: 16 }}>Informações adicionais</h3>
                {[
                  { label: 'Convênio', value: patient.insurance },
                  { label: 'Endereço', value: patient.address },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: T.n400, marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 14, color: T.n900, fontWeight: 500 }}>{f.value || '—'}</div>
                  </div>
                ))}
                {patient.notes && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: T.n400, marginBottom: 3 }}>Observações</div>
                    <div style={{
                      fontSize: 13, color: T.n700, lineHeight: 1.6, padding: '12px 14px',
                      background: T.n100, borderRadius: T.radiusMd, border: `1px solid ${T.n200}`,
                    }}>{patient.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'appointments' && (
          <div style={{ animation: 'fadeIn 200ms ease' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.n200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: T.n400 }}>{patientAppointments?.length || 0} agendamentos</span>
              <Button size="sm" icon={Plus} onClick={() => navigate('agenda')}>Novo agendamento</Button>
            </div>
            {(patientAppointments || []).map((a) => {
              const st = APT_STATUS[a.status] || APT_STATUS.pendente
              const Icon = st.icon
              const isFuture = new Date(a.start_time) >= new Date()
              return (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderBottom: `1px solid ${T.n100}`, transition: 'background 150ms',
                  cursor: 'pointer', opacity: a.status === 'cancelado' || a.status === 'cancelled' ? 0.5 : 1,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.n100 }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: isFuture ? T.primary50 : T.n100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Calendar size={16} color={isFuture ? T.primary500 : T.n400} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>
                      {new Date(a.start_time).toLocaleDateString('pt-BR')} às {new Date(a.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: 12, color: T.n400, marginTop: 2 }}>{a.service_type || ''} · {a.professional?.full_name || ''}</div>
                  </div>
                  <Badge color={st.color} bg={st.bg}><Icon size={11} /> {st.label}</Badge>
                </div>
              )
            })}
            {(!patientAppointments || patientAppointments.length === 0) && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: T.n400, fontSize: 14 }}>Nenhum agendamento encontrado</div>
            )}
          </div>
        )}

        {tab === 'billing' && (
          <div style={{ animation: 'fadeIn 200ms ease' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.n200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: T.n400 }}>{patientCharges?.length || 0} faturas</span>
              <Button size="sm" icon={Plus} onClick={() => navigate('financeiro')}>Nova fatura</Button>
            </div>
            {(patientCharges || []).map((inv) => {
              const st = INV_STATUS[inv.status] || INV_STATUS.pending
              return (
                <div key={inv.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderBottom: `1px solid ${T.n100}`, cursor: 'pointer', transition: 'background 150ms',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.n100 }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: st.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <DollarSign size={16} color={st.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>{inv.description || 'Cobrança'}</div>
                    <div style={{ fontSize: 12, color: T.n400, marginTop: 2 }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('pt-BR') : ''}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.n900, marginRight: 12 }}>
                    R$ {(inv.amount || 0).toLocaleString('pt-BR')}
                  </div>
                  <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
                </div>
              )
            })}
            {(!patientCharges || patientCharges.length === 0) && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: T.n400, fontSize: 14 }}>Nenhuma fatura encontrada</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══ Main Export ═══ */
export default function Pacientes() {
  const { isDemo } = useAuth()
  const { data: rawPatients, create, update, remove } = usePatients()
  const patients = rawPatients?.length ? rawPatients : (isDemo ? DEMO_PATIENTS : [])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [convenioFilter, setConvenioFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editPatient, setEditPatient] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [page, setPage] = useState(1)
  const perPage = 8

  const filtered = useMemo(() => {
    let list = patients.filter((p) => {
      const name = (p.full_name || '').toLowerCase()
      const q = search.toLowerCase()
      const matchSearch = !search || name.includes(q) || (p.cpf || '').includes(search) || (p.phone || '').includes(search)
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'ativo' && (p.status === 'active' || p.status === 'ativo')) ||
        (statusFilter === 'arquivado' && (p.status === 'archived' || p.status === 'arquivado'))
      const matchConvenio = convenioFilter === 'all' || p.insurance === convenioFilter
      return matchSearch && matchStatus && matchConvenio
    })

    list.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name') cmp = (a.full_name || '').localeCompare(b.full_name || '')
      else if (sortBy === 'lastVisit') cmp = new Date(b.last_visit || 0) - new Date(a.last_visit || 0)
      else if (sortBy === 'totalVisits') cmp = (b.total_sessions || 0) - (a.total_sessions || 0)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [patients, search, statusFilter, convenioFilter, sortBy, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const activeCount = patients.filter((p) => p.status === 'active' || p.status === 'ativo').length

  if (selectedPatient) {
    return (
      <PatientDetail
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
        onEdit={(p) => { setEditPatient(p); setModalOpen(true); setSelectedPatient(null) }}
      />
    )
  }

  const SortButton = ({ field, label }) => {
    const active = sortBy === field
    return (
      <button onClick={() => { if (active) setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortDir('asc') } }}
        style={{
          display: 'flex', alignItems: 'center', gap: 3, border: 'none', background: 'none',
          cursor: 'pointer', fontFamily: T.font, fontSize: 12, fontWeight: 600,
          color: active ? T.primary500 : T.n400, padding: 0, textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
        {label}
        {active && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </button>
    )
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, animation: 'fadeSlideUp 0.3s ease both',
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.n900 }}>Pacientes</h1>
          <p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>{activeCount} pacientes ativos</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="sm" icon={Download}>Exportar</Button>
          <Button icon={Plus} onClick={() => { setEditPatient(null); setModalOpen(true) }}>Novo paciente</Button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, animation: 'fadeSlideUp 0.35s ease 0.05s both' }}>
        <div style={{
          flex: 1, maxWidth: 360, display: 'flex', alignItems: 'center',
          border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, background: T.n0, overflow: 'hidden',
        }}>
          <span style={{ paddingLeft: 12, color: T.n400, display: 'flex' }}><Search size={16} /></span>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nome, CPF ou telefone..."
            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: 13, fontFamily: T.font, color: T.n900, background: 'transparent' }} />
          {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0 10px', color: T.n400, display: 'flex' }}><X size={14} /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`, background: T.n0, fontFamily: T.font, fontSize: 13, color: T.n700, cursor: 'pointer', outline: 'none' }}>
          <option value="all">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="arquivado">Arquivados</option>
        </select>
        <select value={convenioFilter} onChange={(e) => { setConvenioFilter(e.target.value); setPage(1) }}
          style={{ padding: '9px 12px', borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`, background: T.n0, fontFamily: T.font, fontSize: 13, color: T.n700, cursor: 'pointer', outline: 'none' }}>
          <option value="all">Todos os convênios</option>
          {CONVENIOS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ fontSize: 12, color: T.n400, marginLeft: 'auto' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div style={{
        background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`,
        boxShadow: T.shadowSoft, overflow: 'hidden', animation: 'fadeSlideUp 0.4s ease 0.1s both',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 0.8fr 0.8fr 50px',
          padding: '12px 20px', background: T.n100, borderBottom: `1px solid ${T.n200}`, gap: 12, alignItems: 'center',
        }}>
          <SortButton field="name" label="Paciente" />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.n400, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contato</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.n400, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Convênio</span>
          <SortButton field="lastVisit" label="Última visita" />
          <SortButton field="totalVisits" label="Consultas" />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.n400, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</span>
          <span />
        </div>

        {paginated.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: T.n400 }}>
            <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div style={{ fontSize: 14 }}>Nenhum paciente encontrado</div>
          </div>
        ) : paginated.map((p, i) => {
          const isActive = p.status === 'active' || p.status === 'ativo'
          return (
            <div key={p.id} onClick={() => setSelectedPatient(p)} style={{
              display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 0.8fr 0.8fr 50px',
              padding: '14px 20px', borderBottom: `1px solid ${T.n100}`, gap: 12, alignItems: 'center',
              cursor: 'pointer', transition: 'background 150ms', animation: `fadeSlideUp 0.3s ease ${i * 0.03}s both`,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.n100 }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={p.full_name} url={p.avatar_url} size={38} color={isActive ? undefined : T.n400} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>{p.full_name}</div>
                  <div style={{ fontSize: 12, color: T.n400, marginTop: 1 }}>CPF: {p.cpf || '—'}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: T.n900, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={12} color={T.n400} /> {p.phone || '—'}
                </div>
                <div style={{ fontSize: 12, color: T.n400, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.email || '—'}
                </div>
              </div>
              <span style={{ fontSize: 13, color: T.n700 }}>{p.insurance || '—'}</span>
              <span style={{ fontSize: 13, color: T.n700 }}>{p.last_visit ? new Date(p.last_visit).toLocaleDateString('pt-BR') : '—'}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.n900 }}>{p.total_sessions || 0}</span>
              <Badge color={isActive ? T.success : T.n400} bg={isActive ? 'rgba(22,163,74,0.10)' : 'rgba(201,205,216,0.15)'}>
                {isActive ? 'Ativo' : 'Arquivado'}
              </Badge>
              <button onClick={(e) => e.stopPropagation()} style={{
                width: 32, height: 32, borderRadius: 6, border: 'none', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.n400,
              }}>
                <MoreHorizontal size={16} />
              </button>
            </div>
          )
        })}

        {totalPages > 1 && (
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${T.n200}` }}>
            <span style={{ fontSize: 13, color: T.n400 }}>
              Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} style={{
                width: 32, height: 32, borderRadius: 6, border: `1px solid ${T.n300}`, background: T.n0,
                cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: page === 1 ? T.n300 : T.n700,
              }}><ChevronLeft size={15} /></button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{
                  width: 32, height: 32, borderRadius: 6,
                  border: page === i + 1 ? 'none' : `1px solid ${T.n300}`,
                  background: page === i + 1 ? T.primary500 : T.n0,
                  color: page === i + 1 ? T.n0 : T.n700,
                  cursor: 'pointer', fontFamily: T.font, fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} style={{
                width: 32, height: 32, borderRadius: 6, border: `1px solid ${T.n300}`, background: T.n0,
                cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: page === totalPages ? T.n300 : T.n700,
              }}><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      <PatientModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditPatient(null) }}
        patient={editPatient}
        onCreate={create}
        onUpdate={update}
        allPatients={patients}
      />
    </div>
  )
}
