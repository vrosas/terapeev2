import { useState, useEffect, useMemo } from 'react'
import {
  Users, Search, X, Plus, Clock, CheckCircle2, Edit3, User,
  Award, Briefcase, Activity, Heart, Star, Wrench, Zap, Check,
  Loader2, Calendar, Phone, Mail, ArrowLeft, MoreHorizontal,
} from 'lucide-react'
import { T } from '@/utils/theme'
import { Badge, Button, InputField, SelectField, TextArea, getInitials } from '@/components/ui'
import { useProfessionals } from '@/lib/hooks'
import { useAuth } from '@/contexts/AuthContext'

/* ─── Specialty Config ─── */
const SPECIALTIES = [
  { id: 'psicologia',   label: 'Psicologia',         icon: Heart,    color: T.primary500, reg: 'CRP' },
  { id: 'fisioterapia', label: 'Fisioterapia',        icon: Activity, color: T.success,    reg: 'CREFITO' },
  { id: 'fono',         label: 'Fonoaudiologia',      icon: Star,     color: T.warning,    reg: 'CRFa' },
  { id: 'to',           label: 'Terapia Ocupacional', icon: Wrench,   color: '#9333EA',    reg: 'CREFITO' },
  { id: 'neuro',        label: 'Neuropsicologia',     icon: Zap,      color: '#0D9488',    reg: 'CRP' },
  { id: 'pediatria',    label: 'Psicologia Infantil', icon: Heart,    color: '#EC4899',    reg: 'CRP' },
]

const WEEKDAYS = [
  { id: 'seg', label: 'Seg' }, { id: 'ter', label: 'Ter' }, { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' }, { id: 'sex', label: 'Sex' }, { id: 'sab', label: 'Sáb' }, { id: 'dom', label: 'Dom' },
]
const TIME_SLOTS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

/* ─── Demo Data ─── */
const DEMO_PROFESSIONALS = [
  { id: 1, full_name: 'Dra. Ana Costa', email: 'ana.costa@terapee.com', phone: '(11) 98765-4321', specialty: 'psicologia', registration_number: 'CRP 06/123456', color: T.primary500, status: 'active', bio: 'Especialista em TCC e terapia de casais. 12 anos de experiência.', services: ['Psicoterapia Individual','Terapia de Casal'], session_duration: 50, commission_rate: 60, availability: { seg:['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'], ter:['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'], qua:['08:00','09:00','10:00','11:00'], qui:['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'], sex:['08:00','09:00','10:00','11:00','14:00','15:00'], sab:[], dom:[] } },
  { id: 2, full_name: 'Dr. Carlos Lima', email: 'carlos.lima@terapee.com', phone: '(11) 91234-5678', specialty: 'fisioterapia', registration_number: 'CREFITO 3/98765', color: T.success, status: 'active', bio: 'Fisioterapeuta esportivo com foco em reabilitação.', services: ['Fisioterapia Geral','RPG'], session_duration: 50, commission_rate: 55, availability: { seg:['07:00','08:00','09:00','10:00','11:00','14:00','15:00','16:00'], ter:['07:00','08:00','09:00','10:00','11:00'], qua:['07:00','08:00','09:00','10:00','11:00'], qui:['07:00','08:00','09:00','10:00','11:00','14:00','15:00','16:00'], sex:['07:00','08:00','09:00','10:00','11:00'], sab:['08:00','09:00','10:00','11:00'], dom:[] } },
  { id: 3, full_name: 'Dra. Beatriz Rocha', email: 'beatriz.rocha@terapee.com', phone: '(11) 99876-5432', specialty: 'fono', registration_number: 'CRFa 2/54321', color: T.warning, status: 'active', bio: 'Fonoaudióloga com especialização em linguagem infantil.', services: ['Fonoaudiologia Infantil','Avaliação Audiológica'], session_duration: 40, commission_rate: 55, availability: { seg:['09:00','10:00','11:00','14:00','15:00','16:00'], ter:['09:00','10:00','11:00','14:00','15:00','16:00'], qua:[], qui:['09:00','10:00','11:00','14:00','15:00','16:00'], sex:['09:00','10:00','11:00'], sab:[], dom:[] } },
  { id: 4, full_name: 'Dr. Ricardo Alves', email: 'ricardo.alves@terapee.com', phone: '(11) 92345-6789', specialty: 'to', registration_number: 'CREFITO 3/67890', color: '#9333EA', status: 'active', bio: 'Terapeuta ocupacional especializado em reabilitação neurológica.', services: ['Terapia Ocupacional','Reabilitação Neurológica'], session_duration: 50, commission_rate: 55, availability: { seg:['08:00','09:00','10:00','11:00','14:00','15:00'], ter:[], qua:['08:00','09:00','10:00','11:00','14:00','15:00'], qui:['08:00','09:00','10:00','11:00','14:00','15:00'], sex:['08:00','09:00','10:00','11:00'], sab:[], dom:[] } },
  { id: 5, full_name: 'Dra. Marina Souza', email: 'marina.souza@terapee.com', phone: '(11) 93456-7890', specialty: 'neuro', registration_number: 'CRP 06/234567', color: '#0D9488', status: 'active', bio: 'Neuropsicóloga com foco em avaliação e reabilitação cognitiva.', services: ['Avaliação Neuropsicológica'], session_duration: 60, commission_rate: 65, availability: { seg:['09:00','10:00','11:00'], ter:['09:00','10:00','11:00','14:00','15:00'], qua:['09:00','10:00','11:00'], qui:[], sex:['09:00','10:00','11:00','14:00','15:00'], sab:[], dom:[] } },
  { id: 6, full_name: 'Dra. Patrícia Mendes', email: 'patricia.mendes@terapee.com', phone: '(11) 94567-8901', specialty: 'pediatria', registration_number: 'CRP 06/345678', color: '#EC4899', status: 'inactive', bio: 'Psicóloga infantil. Atualmente em licença maternidade.', services: ['Psicoterapia Infantil'], session_duration: 45, commission_rate: 60, availability: { seg:[], ter:[], qua:[], qui:[], sex:[], sab:[], dom:[] } },
]

/* ─── Availability Grid ─── */
function AvailabilityGrid({ value = {}, onChange, readOnly }) {
  const toggle = (day, time) => {
    if (readOnly) return
    const curr = value[day] || []
    const next = curr.includes(time) ? curr.filter((t) => t !== time) : [...curr, time].sort()
    onChange({ ...value, [day]: next })
  }
  const toggleDay = (day) => {
    if (readOnly) return
    const curr = value[day] || []
    if (curr.length > 0) onChange({ ...value, [day]: [] })
    else onChange({ ...value, [day]: [...TIME_SLOTS] })
  }

  const cells = []
  cells.push(<div key="corner" />)
  WEEKDAYS.forEach((d) => {
    cells.push(
      <div key={`h-${d.id}`} onClick={() => toggleDay(d.id)}
        style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: T.n700, padding: '6px 0', cursor: readOnly ? 'default' : 'pointer', userSelect: 'none', borderRadius: 4 }}>
        {d.label}
      </div>
    )
  })
  TIME_SLOTS.forEach((time) => {
    cells.push(
      <div key={`t-${time}`} style={{ fontSize: 11, color: T.n400, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, fontFamily: 'monospace' }}>
        {time}
      </div>
    )
    WEEKDAYS.forEach((d) => {
      const active = (value[d.id] || []).includes(time)
      cells.push(
        <div key={`${d.id}-${time}`} onClick={() => toggle(d.id, time)}
          style={{ height: 26, borderRadius: 4, background: active ? T.primary500 : 'transparent', border: `1px solid ${active ? T.primary500 : T.n200}`, cursor: readOnly ? 'default' : 'pointer', transition: 'all 150ms', opacity: active ? 1 : 0.5 }}
        />
      )
    })
  })

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', gap: 2, minWidth: 500 }}>
        {cells}
      </div>
      {!readOnly && <div style={{ fontSize: 11, color: T.n400, marginTop: 8 }}>Clique nos horários para ativar/desativar. Clique no dia para selecionar todos.</div>}
    </div>
  )
}

/* ─── Professional Modal ─── */
function ProfessionalModal({ open, onClose, professional, onCreate, onUpdate }) {
  const isEdit = !!professional
  const [tab, setTab] = useState('info')
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', specialty: '', registration_number: '', bio: '', commission_rate: '60', status: 'active' })
  const [availability, setAvailability] = useState({ seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && professional) {
      setForm({ full_name: professional.full_name || '', email: professional.email || '', phone: professional.phone || '', specialty: professional.specialty || '', registration_number: professional.registration_number || '', bio: professional.bio || '', commission_rate: String(professional.commission_rate || 60), status: professional.status || 'active' })
      setAvailability(professional.availability || { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] })
      setTab('info')
    } else if (open) {
      setForm({ full_name: '', email: '', phone: '', specialty: '', registration_number: '', bio: '', commission_rate: '60', status: 'active' })
      setAvailability({ seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] })
      setTab('info')
    }
  }, [open, professional])

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const handleSave = async () => {
    setSaving(true)
    try {
      const data = { ...form, commission_rate: Number(form.commission_rate), availability }
      if (isEdit) await onUpdate?.(professional.id, data)
      else await onCreate?.(data)
      onClose('saved')
    } finally { setSaving(false) }
  }

  if (!open) return null

  const spec = SPECIALTIES.find((s) => s.id === form.specialty)
  const modalTabs = [{ id: 'info', label: 'Dados pessoais' }, { id: 'availability', label: 'Disponibilidade' }]

  return (
    <div onClick={() => onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(17,17,17,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', animation: 'fadeIn 150ms ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, background: T.n0, borderRadius: T.radiusLg, boxShadow: T.shadowLg, overflow: 'hidden', animation: 'slideUp 250ms ease', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.n200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{isEdit ? 'Editar profissional' : 'Novo profissional'}</h2>
          <button onClick={() => onClose()} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.n400 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: `1px solid ${T.n200}`, padding: '0 24px' }}>
          {modalTabs.map((t) => { const active = tab === t.id; return <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '12px 16px', border: 'none', cursor: 'pointer', fontFamily: T.font, fontSize: 13, fontWeight: active ? 600 : 400, color: active ? T.primary500 : T.n400, background: 'transparent', borderBottom: `2px solid ${active ? T.primary500 : 'transparent'}`, marginBottom: -1, transition: 'all 150ms' }}>{t.label}</button> })}
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {tab === 'info' && (
            <div>
              <InputField label="Nome completo" placeholder="Dr(a). Nome Sobrenome" required value={form.full_name} onChange={(v) => upd('full_name', v)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <SelectField label="Especialidade" value={form.specialty} onChange={(v) => upd('specialty', v)} required placeholder="Selecionar..." options={SPECIALTIES.map((s) => ({ value: s.id, label: s.label }))} />
                <InputField label={`Nº de registro (${spec?.reg || 'CRP/CREFITO'})`} placeholder={`${spec?.reg || 'CRP'} 00/000000`} value={form.registration_number} onChange={(v) => upd('registration_number', v)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="E-mail" type="email" placeholder="email@clinica.com" value={form.email} onChange={(v) => upd('email', v)} required />
                <InputField label="Telefone" placeholder="(11) 99999-9999" value={form.phone} onChange={(v) => upd('phone', v)} />
              </div>
              <TextArea label="Biografia / Descrição" placeholder="Breve descrição da formação..." value={form.bio} onChange={(v) => upd('bio', v)} rows={3} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 6 }}>Comissão (%)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="range" min="0" max="100" value={form.commission_rate} onChange={(e) => upd('commission_rate', e.target.value)} style={{ flex: 1, accentColor: T.primary500 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.primary500, minWidth: 36, textAlign: 'right' }}>{form.commission_rate}%</span>
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 6 }}>Status</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ id: 'active', label: 'Ativo', color: T.success }, { id: 'inactive', label: 'Inativo', color: T.n400 }].map((s) => (
                      <button key={s.id} onClick={() => upd('status', s.id)} style={{ flex: 1, padding: '9px 14px', borderRadius: T.radiusMd, cursor: 'pointer', border: `1.5px solid ${form.status === s.id ? s.color : T.n300}`, background: form.status === s.id ? `${s.color}12` : T.n0, color: form.status === s.id ? s.color : T.n400, fontFamily: T.font, fontSize: 13, fontWeight: 500, transition: 'all 200ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        {form.status === s.id && <CheckCircle2 size={13} />}{s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'availability' && (
            <div>
              <div style={{ fontSize: 13, color: T.n400, marginBottom: 16 }}>Configure os horários disponíveis para atendimento:</div>
              <AvailabilityGrid value={availability} onChange={setAvailability} />
              <div style={{ marginTop: 16, padding: '12px 16px', background: T.n100, borderRadius: T.radiusMd, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={14} color={T.n400} />
                <span style={{ fontSize: 12, color: T.n700 }}>
                  {Object.values(availability).flat().length} horários por semana · {WEEKDAYS.filter((d) => (availability[d.id] || []).length > 0).length} dias ativos
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.n200}`, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="secondary" onClick={() => onClose()}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving} icon={Check}>{isEdit ? 'Salvar alterações' : 'Cadastrar profissional'}</Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Professional Detail ─── */
function ProfessionalDetail({ professional, onClose, onEdit }) {
  if (!professional) return null
  const spec = SPECIALTIES.find((s) => s.id === professional.specialty)
  const SpecIcon = spec?.icon || User
  const totalSlots = Object.values(professional.availability || {}).flat().length
  const name = professional.full_name || ''

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(17,17,17,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 580, background: T.n0, borderRadius: T.radiusLg, boxShadow: T.shadowLg, maxHeight: '90vh', overflow: 'auto', animation: 'slideUp 250ms ease' }}>
        <div style={{ height: 6, background: `linear-gradient(90deg, ${professional.color || T.primary500}, ${professional.color || T.primary500}80)` }} />
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: `${professional.color || T.primary500}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: professional.color || T.primary500, fontWeight: 700, fontSize: 20, border: `2px solid ${professional.color || T.primary500}20` }}>{getInitials(name)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <SpecIcon size={14} color={spec?.color} />
                <span style={{ fontSize: 13, color: T.n700 }}>{spec?.label}</span>
                <span style={{ color: T.n300 }}>·</span>
                <span style={{ fontSize: 13, color: T.n400 }}>{professional.registration_number}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button variant="secondary" size="sm" icon={Edit3} onClick={() => { onClose(); onEdit?.(professional) }}>Editar</Button>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.n400 }}><X size={18} /></button>
            </div>
          </div>

          {professional.bio && <p style={{ fontSize: 14, color: T.n700, lineHeight: 1.6, marginBottom: 20, padding: '12px 16px', background: T.n100, borderRadius: T.radiusMd }}>{professional.bio}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Comissão', value: `${professional.commission_rate || 0}%` },
              { label: 'Horários/sem', value: totalSlots },
              { label: 'Dias ativos', value: WEEKDAYS.filter((d) => (professional.availability?.[d.id] || []).length > 0).length },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '14px 0', background: T.n100, borderRadius: T.radiusMd }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.n900 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: T.n400, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {professional.services?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.n900, marginBottom: 8 }}>Serviços</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {professional.services.map((s, i) => (
                  <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: `${professional.color || T.primary500}10`, color: professional.color || T.primary500, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.n900, marginBottom: 8 }}>Disponibilidade</div>
            <AvailabilityGrid value={professional.availability || {}} readOnly />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
            <div><div style={{ fontSize: 12, color: T.n400, marginBottom: 2 }}>E-mail</div><div style={{ fontSize: 13, fontWeight: 500 }}>{professional.email}</div></div>
            <div><div style={{ fontSize: 12, color: T.n400, marginBottom: 2 }}>Telefone</div><div style={{ fontSize: 13, fontWeight: 500 }}>{professional.phone}</div></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══ Main Export ═══ */
export default function Profissionais() {
  const { isDemo } = useAuth()
  const { data: rawProfs, create, update } = useProfessionals()
  const professionals = rawProfs?.length ? rawProfs : (isDemo ? DEMO_PROFESSIONALS : [])

  const [search, setSearch] = useState('')
  const [specFilter, setSpecFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [profModal, setProfModal] = useState(false)
  const [editProf, setEditProf] = useState(null)
  const [detailProf, setDetailProf] = useState(null)

  const filtered = useMemo(() => professionals.filter((p) => {
    const ms = !search || (p.full_name || '').toLowerCase().includes(search.toLowerCase()) || (p.registration_number || '').toLowerCase().includes(search.toLowerCase())
    const msp = specFilter === 'all' || p.specialty === specFilter
    const mst = statusFilter === 'all' || p.status === statusFilter
    return ms && msp && mst
  }), [professionals, search, specFilter, statusFilter])

  const totalActive = professionals.filter((p) => p.status === 'active').length

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1320 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, animation: 'fadeSlideUp 0.3s ease both' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Profissionais</h1>
          <p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>Equipe clínica e disponibilidade</p>
        </div>
        <Button icon={Plus} onClick={() => { setEditProf(null); setProfModal(true) }}>Novo profissional</Button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: Award, label: 'Profissionais ativos', value: totalActive, color: T.primary500, delay: 0.05 },
          { icon: Briefcase, label: 'Especialidades', value: [...new Set(professionals.map((p) => p.specialty))].length, color: T.success, delay: 0.1 },
          { icon: Users, label: 'Total de profissionais', value: professionals.length, color: T.warning, delay: 0.15 },
          { icon: Calendar, label: 'Horários ativos', value: professionals.reduce((s, p) => s + Object.values(p.availability || {}).flat().length, 0), color: '#9333EA', delay: 0.2 },
        ].map((s, i) => {
          const SIcon = s.icon
          return (
            <div key={i} style={{ background: T.n0, borderRadius: T.radiusLg, padding: '20px 22px', boxShadow: T.shadowSoft, border: `1px solid ${T.n200}`, display: 'flex', alignItems: 'center', gap: 14, animation: `fadeSlideUp 0.4s ease ${s.delay}s both`, transition: 'box-shadow 200ms, transform 200ms', cursor: 'default' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.shadowSoft; e.currentTarget.style.transform = 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SIcon size={20} color={s.color} /></div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: T.n400 }}>{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, maxWidth: 320, display: 'flex', alignItems: 'center', border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, background: T.n0, overflow: 'hidden' }}>
          <span style={{ paddingLeft: 12, color: T.n400, display: 'flex' }}><Search size={16} /></span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar profissional..."
            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: 13, fontFamily: T.font, color: T.n900, background: 'transparent' }} />
          {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0 10px', color: T.n400, display: 'flex' }}><X size={14} /></button>}
        </div>
        <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`, background: T.n0, fontFamily: T.font, fontSize: 13, color: T.n700, cursor: 'pointer', outline: 'none' }}>
          <option value="all">Todas as especialidades</option>
          {SPECIALTIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ id: 'all', label: 'Todos' }, { id: 'active', label: 'Ativos', color: T.success }, { id: 'inactive', label: 'Inativos', color: T.n400 }].map((f) => (
            <button key={f.id} onClick={() => setStatusFilter(f.id)} style={{ padding: '7px 14px', borderRadius: 20, cursor: 'pointer', border: `1.5px solid ${statusFilter === f.id ? (f.color || T.primary500) : T.n300}`, background: statusFilter === f.id ? (f.color ? `${f.color}12` : T.primary50) : T.n0, color: statusFilter === f.id ? (f.color || T.primary500) : T.n400, fontFamily: T.font, fontSize: 12, fontWeight: 500, transition: 'all 200ms' }}>{f.label}</button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: T.n400, marginLeft: 'auto' }}>{filtered.length} resultado(s)</span>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14, animation: 'fadeSlideUp 0.3s ease both' }}>
        {filtered.map((p, i) => {
          const spec = SPECIALTIES.find((s) => s.id === p.specialty)
          const SpecIcon = spec?.icon || User
          const totalSlots = Object.values(p.availability || {}).flat().length
          const name = p.full_name || ''
          return (
            <div key={p.id} onClick={() => setDetailProf(p)} style={{ background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`, boxShadow: T.shadowSoft, overflow: 'hidden', cursor: 'pointer', transition: 'all 200ms', animation: `fadeSlideUp 0.3s ease ${i * 0.04}s both`, opacity: p.status === 'inactive' ? 0.6 : 1 }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.shadowSoft; e.currentTarget.style.transform = 'none' }}>
              <div style={{ height: 4, background: `linear-gradient(90deg, ${p.color || T.primary500}, ${p.color || T.primary500}80)` }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${p.color || T.primary500}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color || T.primary500, fontWeight: 700, fontSize: 17, border: `2px solid ${p.color || T.primary500}20`, flexShrink: 0 }}>{getInitials(name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                      {p.status === 'inactive' && <Badge color={T.n400} bg="rgba(201,205,216,0.15)">Inativo</Badge>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <SpecIcon size={13} color={spec?.color} />
                      <span style={{ fontSize: 12, color: T.n700 }}>{spec?.label}</span>
                      <span style={{ color: T.n300 }}>·</span>
                      <span style={{ fontSize: 12, color: T.n400 }}>{p.registration_number}</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setEditProf(p); setProfModal(true) }} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.n200}`, background: T.n0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.n400, flexShrink: 0 }}>
                    <Edit3 size={13} />
                  </button>
                </div>
                {p.services?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {p.services.slice(0, 3).map((s, j) => (
                      <span key={j} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: `${p.color || T.primary500}10`, color: p.color || T.primary500, fontWeight: 500 }}>{s}</span>
                    ))}
                    {p.services.length > 3 && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: T.n100, color: T.n400 }}>+{p.services.length - 3}</span>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${T.n200}`, paddingTop: 12 }}>
                  {[{ label: 'Comissão', value: `${p.commission_rate || 0}%` }, { label: 'Duração', value: `${p.session_duration || 50}min` }, { label: 'Horários/sem', value: totalSlots }].map((s, j) => (
                    <div key={j} style={{ flex: 1, textAlign: 'center', borderRight: j < 2 ? `1px solid ${T.n200}` : 'none' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: T.n900 }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: T.n400, marginTop: 1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: T.n400 }}>
          <Award size={40} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
          <div style={{ fontSize: 14 }}>Nenhum profissional encontrado</div>
        </div>
      )}

      <ProfessionalModal open={profModal} onClose={() => { setProfModal(false); setEditProf(null) }} professional={editProf} onCreate={create} onUpdate={update} />
      <ProfessionalDetail professional={detailProf} onClose={() => setDetailProf(null)} onEdit={(p) => { setDetailProf(null); setEditProf(p); setProfModal(true) }} />
    </div>
  )
}
