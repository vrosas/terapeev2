import { useState, useMemo } from 'react'
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin,
  Video, User, Phone, CheckCircle2, XCircle, AlertCircle, Edit3, Trash2,
} from 'lucide-react'
import { T } from '@/utils/theme'
import { useAppointments, usePatients, useProfessionals } from '@/lib/hooks'
import {
  Card, Badge, Button, InputField, SelectField, TextArea,
  Modal, ConfirmDialog, LoadingSpinner, Avatar,
} from '@/components/ui'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7)
const DAYS_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const STATUS_COLORS = {
  scheduled: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', label: 'Agendado' },
  confirmed: { bg: '#D1FAE5', border: '#10B981', text: '#065F46', label: 'Confirmado' },
  in_progress: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', label: 'Em andamento' },
  completed: { bg: '#E0E7FF', border: '#6366F1', text: '#3730A3', label: 'Concluído' },
  cancelled: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', label: 'Cancelado' },
  no_show: { bg: '#F3F4F6', border: '#9CA3AF', text: '#374151', label: 'Faltou' },
}

const INIT = { patient_id: '', professional_id: '', date: '', start_time: '', end_time: '', type: 'regular', modality: 'in_person', room: '', price: '', notes: '' }

export default function AgendaContent() {
  const { data: appointments, loading, create, update, remove } = useAppointments()
  const { data: patients } = usePatients()
  const { data: professionals } = useProfessionals()
  const [weekOffset, setWeekOffset] = useState(0)
  const [profFilter, setProfFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [detailApt, setDetailApt] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(INIT)
  const [saving, setSaving] = useState(false)

  const weekDates = useMemo(() => {
    const today = new Date(); const start = new Date(today)
    start.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
  }, [weekOffset])

  const weekLabel = useMemo(() => {
    const s = weekDates[0], e = weekDates[6]
    const mS = s.toLocaleDateString('pt-BR', { month: 'short' }), mE = e.toLocaleDateString('pt-BR', { month: 'short' })
    return mS === mE ? `${s.getDate()} – ${e.getDate()} de ${mS} ${s.getFullYear()}` : `${s.getDate()} ${mS} – ${e.getDate()} ${mE} ${s.getFullYear()}`
  }, [weekDates])

  const weekAppts = useMemo(() => {
    const start = weekDates[0].toISOString().split('T')[0]
    const end = new Date(weekDates[6]); end.setDate(end.getDate() + 1); const endStr = end.toISOString().split('T')[0]
    return appointments.filter((a) => { const d = a.start_time?.split('T')[0]; if (d < start || d >= endStr) return false; if (profFilter && a.professional_id !== profFilter) return false; return true })
  }, [appointments, weekDates, profFilter])

  const getAptsForCell = (dayDate, hour) => {
    const dateStr = dayDate.toISOString().split('T')[0]
    return weekAppts.filter((a) => a.start_time?.split('T')[0] === dateStr && new Date(a.start_time).getHours() === hour)
  }
  const isToday = (d) => d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]

  const openCreate = (dayDate, hour) => {
    const dateStr = dayDate.toISOString().split('T')[0]
    setEditId(null); setForm({ ...INIT, date: dateStr, start_time: `${String(hour).padStart(2, '0')}:00`, end_time: `${String(hour).padStart(2, '0')}:50` }); setModalOpen(true)
  }
  const openEdit = (apt) => {
    setEditId(apt.id); const st = new Date(apt.start_time), et = new Date(apt.end_time)
    setForm({ patient_id: apt.patient_id || '', professional_id: apt.professional_id || '', date: apt.start_time?.split('T')[0] || '', start_time: `${String(st.getHours()).padStart(2, '0')}:${String(st.getMinutes()).padStart(2, '0')}`, end_time: `${String(et.getHours()).padStart(2, '0')}:${String(et.getMinutes()).padStart(2, '0')}`, type: apt.type || 'regular', modality: apt.modality || 'in_person', room: apt.room || '', price: apt.price?.toString() || '', notes: apt.notes || '' })
    setDetailApt(null); setModalOpen(true)
  }
  const handleSave = async () => {
    if (!form.patient_id || !form.professional_id || !form.date) return; setSaving(true)
    const payload = { patient_id: form.patient_id, professional_id: form.professional_id, start_time: `${form.date}T${form.start_time}:00`, end_time: `${form.date}T${form.end_time}:00`, type: form.type, modality: form.modality, room: form.room || null, price: form.price ? parseFloat(form.price) : null, notes: form.notes || null }
    if (editId) { await update(editId, payload) } else { payload.status = 'scheduled'; await create(payload) }
    setSaving(false); setModalOpen(false)
  }
  const updateStatus = async (id, status) => { await update(id, { status }); setDetailApt(null) }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeSlideUp 0.25s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setWeekOffset(w => w - 1)} style={navBtn}><ChevronLeft size={16} /></button>
            <button onClick={() => setWeekOffset(0)} style={{ padding: '6px 14px', borderRadius: T.radiusMd, border: `1px solid ${T.n300}`, background: weekOffset === 0 ? T.primary50 : T.n0, cursor: 'pointer', fontFamily: T.font, fontSize: 13, fontWeight: 500, color: weekOffset === 0 ? T.primary500 : T.n700 }}>Hoje</button>
            <button onClick={() => setWeekOffset(w => w + 1)} style={navBtn}><ChevronRight size={16} /></button>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{weekLabel}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={profFilter} onChange={(e) => setProfFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: T.radiusMd, border: `1px solid ${T.n300}`, fontSize: 13, fontFamily: T.font, background: T.n0 }}>
            <option value="">Todos profissionais</option>
            {professionals.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
          <Button icon={Plus} onClick={() => { setEditId(null); setForm(INIT); setModalOpen(true) }}>Nova consulta</Button>
        </div>
      </div>

      <Card padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: `1px solid ${T.n200}` }}>
          <div style={{ padding: 12 }} />
          {weekDates.map((d, i) => (
            <div key={i} style={{ padding: '12px 8px', textAlign: 'center', borderLeft: `1px solid ${T.n200}`, background: isToday(d) ? T.primary50 : 'transparent' }}>
              <div style={{ fontSize: 11, color: T.n400, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{DAYS_LABEL[d.getDay()]}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2, color: isToday(d) ? T.primary500 : T.n900 }}>{d.getDate()}</div>
            </div>
          ))}
        </div>
        <div style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
          {HOURS.map(hour => (
            <div key={hour} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minHeight: 70, borderBottom: `1px solid ${T.n100}` }}>
              <div style={{ padding: '6px 8px', fontSize: 11, color: T.n400, fontWeight: 500, textAlign: 'right', borderRight: `1px solid ${T.n200}` }}>{`${String(hour).padStart(2, '0')}:00`}</div>
              {weekDates.map((d, di) => {
                const cellApts = getAptsForCell(d, hour)
                return (
                  <div key={di} onClick={() => cellApts.length === 0 && openCreate(d, hour)}
                    style={{ borderLeft: `1px solid ${T.n100}`, padding: 3, cursor: cellApts.length === 0 ? 'pointer' : 'default', background: isToday(d) ? `${T.primary500}03` : 'transparent', transition: 'background 100ms' }}
                    onMouseEnter={e => { if (!cellApts.length) e.currentTarget.style.background = T.n100 }}
                    onMouseLeave={e => { e.currentTarget.style.background = isToday(d) ? `${T.primary500}03` : 'transparent' }}>
                    {cellApts.map(apt => {
                      const sc = STATUS_COLORS[apt.status] || STATUS_COLORS.scheduled
                      return (
                        <button key={apt.id} onClick={e => { e.stopPropagation(); setDetailApt(apt) }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: 6, marginBottom: 2, background: sc.bg, borderLeft: `3px solid ${sc.border}`, border: 'none', cursor: 'pointer', fontFamily: T.font }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: sc.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.patient?.full_name}</div>
                          <div style={{ fontSize: 10, color: sc.text, opacity: 0.7 }}>{new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal open={Boolean(detailApt)} onClose={() => setDetailApt(null)} title="Detalhes da consulta" width={480}>
        {detailApt && (() => {
          const sc = STATUS_COLORS[detailApt.status] || STATUS_COLORS.scheduled
          const st = new Date(detailApt.start_time), et = new Date(detailApt.end_time)
          return (<div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Avatar name={detailApt.patient?.full_name} size={48} color={detailApt.professional?.color} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{detailApt.patient?.full_name}</h3>
                <div style={{ fontSize: 13, color: T.n400 }}>com {detailApt.professional?.full_name}</div>
              </div>
              <Badge color={sc.text} bg={sc.bg} size="md">{sc.label}</Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[{ icon: Calendar, l: 'Data', v: st.toLocaleDateString('pt-BR') }, { icon: Clock, l: 'Horário', v: `${st.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} – ${et.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` }, { icon: detailApt.modality === 'online' ? Video : MapPin, l: 'Local', v: detailApt.modality === 'online' ? 'Online' : `Presencial${detailApt.room ? ' — ' + detailApt.room : ''}` }, { icon: Phone, l: 'Telefone', v: detailApt.patient?.phone || '—' }].map(item => (
                <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: T.n100, borderRadius: T.radiusMd }}>
                  <item.icon size={15} color={T.n400} /><div><div style={{ fontSize: 10, color: T.n400, textTransform: 'uppercase' }}>{item.l}</div><div style={{ fontSize: 13, fontWeight: 500 }}>{item.v}</div></div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {!['confirmed', 'completed', 'cancelled', 'no_show'].includes(detailApt.status) && <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => updateStatus(detailApt.id, 'confirmed')}>Confirmar</Button>}
              {detailApt.status === 'confirmed' && <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => updateStatus(detailApt.id, 'completed')}>Concluir</Button>}
              {!['completed', 'cancelled', 'no_show'].includes(detailApt.status) && <><Button size="sm" variant="danger" icon={XCircle} onClick={() => updateStatus(detailApt.id, 'cancelled')}>Cancelar</Button><Button size="sm" variant="ghost" icon={AlertCircle} onClick={() => updateStatus(detailApt.id, 'no_show')}>Faltou</Button></>}
            </div>
            <div style={{ display: 'flex', gap: 8, borderTop: `1px solid ${T.n200}`, paddingTop: 16 }}>
              <Button variant="secondary" icon={Edit3} onClick={() => openEdit(detailApt)}>Editar</Button>
              <Button variant="danger" icon={Trash2} onClick={() => { setDeleteId(detailApt.id); setDetailApt(null) }}>Excluir</Button>
            </div>
          </div>)
        })()}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar consulta' : 'Nova consulta'} width={540}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <SelectField label="Paciente" value={form.patient_id} onChange={v => setForm({ ...form, patient_id: v })} placeholder="Selecione" required options={patients.filter(p => p.status === 'active').map(p => ({ value: p.id, label: p.full_name }))} />
          </div>
          <SelectField label="Profissional" value={form.professional_id} onChange={v => { const pr = professionals.find(p => p.id === v); setForm({ ...form, professional_id: v, price: pr?.session_price?.toString() || form.price }) }} placeholder="Selecione" required options={professionals.filter(p => p.is_active).map(p => ({ value: p.id, label: p.full_name }))} />
          <InputField label="Data" type="date" value={form.date} onChange={v => setForm({ ...form, date: v })} required />
          <InputField label="Início" type="time" value={form.start_time} onChange={v => setForm({ ...form, start_time: v })} required />
          <InputField label="Término" type="time" value={form.end_time} onChange={v => setForm({ ...form, end_time: v })} required />
          <SelectField label="Tipo" value={form.type} onChange={v => setForm({ ...form, type: v })} options={[{ value: 'regular', label: 'Regular' }, { value: 'initial', label: 'Primeira consulta' }, { value: 'follow_up', label: 'Retorno' }, { value: 'emergency', label: 'Emergência' }, { value: 'online', label: 'Online' }, { value: 'group', label: 'Grupo' }]} />
          <SelectField label="Modalidade" value={form.modality} onChange={v => setForm({ ...form, modality: v })} options={[{ value: 'in_person', label: 'Presencial' }, { value: 'online', label: 'Online' }]} />
          <InputField label="Sala" value={form.room} onChange={v => setForm({ ...form, room: v })} placeholder="Ex: Sala 1" />
          <InputField label="Valor (R$)" type="number" value={form.price} onChange={v => setForm({ ...form, price: v })} placeholder="0.00" />
          <div style={{ gridColumn: '1 / -1' }}><TextArea label="Observações" value={form.notes} onChange={v => setForm({ ...form, notes: v })} rows={2} placeholder="Notas..." /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>{editId ? 'Salvar' : 'Agendar'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={async () => { await remove(deleteId); setDeleteId(null) }} title="Excluir consulta" message="Tem certeza?" confirmText="Excluir" />
    </div>
  )
}

const navBtn = { width: 32, height: 32, borderRadius: T.radiusMd, border: `1px solid ${T.n300}`, background: T.n0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
