import { useState, useMemo } from 'react'
import { FileText, Plus, Search, ChevronDown, ChevronUp, Edit3, Trash2, CheckCircle2, Smile, BookOpen, Save } from 'lucide-react'
import { T } from '@/utils/theme'
import { useMedicalRecords, usePatients, useProfessionals } from '@/lib/hooks'
import { Card, Badge, Button, InputField, SelectField, TextArea, Modal, ConfirmDialog, EmptyState, LoadingSpinner, Avatar } from '@/components/ui'

const INIT = { patient_id: '', professional_id: '', date: new Date().toISOString().split('T')[0], content: '', mood_score: '5', techniques_used: '', topics: '', homework: '', observations: '' }

export default function ProntuariosContent() {
  const { data: records, loading, create, update, remove } = useMedicalRecords()
  const { data: patients } = usePatients()
  const { data: professionals } = useProfessionals()
  const [search, setSearch] = useState('')
  const [patFilter, setPatFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(INIT)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => records.filter(r => {
    if (patFilter && r.patient_id !== patFilter) return false
    if (search) { const q = search.toLowerCase(); if (!r.content?.toLowerCase().includes(q) && !r.patient?.full_name?.toLowerCase().includes(q) && !r.topics?.some(t => t.toLowerCase().includes(q))) return false }
    return true
  }), [records, search, patFilter])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(r => { const pid = r.patient_id; if (!map[pid]) map[pid] = { patient: r.patient, records: [] }; map[pid].records.push(r) })
    return Object.values(map).sort((a, b) => (b.records[0]?.date || '').localeCompare(a.records[0]?.date || ''))
  }, [filtered])

  const openModal = (record = null) => {
    if (record) { setEditId(record.id); setForm({ patient_id: record.patient_id, professional_id: record.professional_id, date: record.date || '', content: record.content || '', mood_score: record.mood_score?.toString() || '5', techniques_used: record.techniques_used?.join(', ') || '', topics: record.topics?.join(', ') || '', homework: record.homework || '', observations: record.observations || '' }) }
    else { setEditId(null); setForm(INIT) }
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.patient_id || !form.professional_id || !form.content.trim()) return
    setSaving(true)
    const payload = { patient_id: form.patient_id, professional_id: form.professional_id, date: form.date, content: form.content, mood_score: form.mood_score ? parseInt(form.mood_score) : null, techniques_used: form.techniques_used ? form.techniques_used.split(',').map(s => s.trim()).filter(Boolean) : [], topics: form.topics ? form.topics.split(',').map(s => s.trim()).filter(Boolean) : [], homework: form.homework || null }
    if (!editId) { payload.session_number = records.filter(r => r.patient_id === form.patient_id).length + 1 }
    if (editId) await update(editId, payload); else await create(payload)
    setSaving(false); setModalOpen(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeSlideUp 0.25s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700 }}>Prontuários</h2><p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>Registros clínicos dos pacientes</p></div>
        <Button icon={Plus} onClick={() => openModal()}>Novo registro</Button>
      </div>

      <Card style={{ marginBottom: 20 }} padding="16px 20px">
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color={T.n400} style={{ position: 'absolute', left: 12, top: 11 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por conteúdo, paciente ou tópico..." style={{ width: '100%', padding: '10px 12px 10px 36px', border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, fontSize: 14, fontFamily: T.font, outline: 'none' }} />
          </div>
          <select value={patFilter} onChange={e => setPatFilter(e.target.value)} style={{ padding: '10px 12px', border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, fontSize: 13, fontFamily: T.font }}>
            <option value="">Todos os pacientes</option>
            {patients.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>
      </Card>

      {grouped.length === 0 ? <EmptyState icon={FileText} title="Nenhum prontuário" description="Registre a primeira sessão" action={<Button icon={Plus} onClick={() => openModal()}>Novo registro</Button>} /> : grouped.map(group => (
        <Card key={group.patient?.id} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Avatar name={group.patient?.full_name} size={40} />
            <div style={{ flex: 1 }}><h3 style={{ fontSize: 15, fontWeight: 600 }}>{group.patient?.full_name}</h3><span style={{ fontSize: 12, color: T.n400 }}>{group.records.length} registro(s)</span></div>
          </div>
          {group.records.map(rec => {
            const isExp = expandedId === rec.id
            return (<div key={rec.id} style={{ borderTop: `1px solid ${T.n100}`, padding: '12px 0' }}>
              <button onClick={() => setExpandedId(isExp ? null : rec.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font, textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: T.primary50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 14, fontWeight: 700, color: T.primary500 }}>#{rec.session_number || '?'}</span></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500 }}>Sessão {rec.session_number} — {new Date(rec.date + 'T12:00').toLocaleDateString('pt-BR')}</div><div style={{ fontSize: 12, color: T.n400 }}>{rec.professional?.full_name} {rec.mood_score ? `• Humor: ${rec.mood_score}/10` : ''}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {rec.is_signed && <Badge color={T.success} bg={T.successBg}>Assinado</Badge>}
                  {rec.topics?.slice(0, 2).map(t => <Badge key={t} color={T.primary500} bg={T.primary50}>{t}</Badge>)}
                  {isExp ? <ChevronUp size={16} color={T.n400} /> : <ChevronDown size={16} color={T.n400} />}
                </div>
              </button>
              {isExp && (<div style={{ marginTop: 12, padding: 16, background: T.n100, borderRadius: T.radiusMd, animation: 'fadeSlideUp 0.2s ease both' }}>
                <div style={{ fontSize: 14, color: T.n700, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 16 }}>{rec.content}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                  {rec.mood_score && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Smile size={14} color={T.warning} /><span style={{ fontSize: 13 }}>Humor: <strong>{rec.mood_score}/10</strong></span></div>}
                  {rec.techniques_used?.length > 0 && <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{rec.techniques_used.map(t => <Badge key={t} color={T.purple} bg={`${T.purple}14`}>{t}</Badge>)}</div>}
                </div>
                {rec.homework && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: T.n0, borderRadius: 8, marginBottom: 12 }}><BookOpen size={14} color={T.success} style={{ marginTop: 2, flexShrink: 0 }} /><div><div style={{ fontSize: 10, color: T.n400, textTransform: 'uppercase' }}>Tarefa de casa</div><div style={{ fontSize: 13 }}>{rec.homework}</div></div></div>}
                <div style={{ display: 'flex', gap: 6, borderTop: `1px solid ${T.n200}`, paddingTop: 12 }}>
                  <Button size="sm" variant="secondary" icon={Edit3} onClick={() => openModal(rec)}>Editar</Button>
                  {!rec.is_signed && <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => update(rec.id, { is_signed: true, signed_at: new Date().toISOString() })}>Assinar</Button>}
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteId(rec.id)}>Excluir</Button>
                </div>
              </div>)}
            </div>)
          })}
        </Card>
      ))}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar registro' : 'Novo registro'} width={640}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <SelectField label="Paciente" value={form.patient_id} onChange={v => setForm({ ...form, patient_id: v })} placeholder="Selecione" required options={patients.filter(p => p.status === 'active').map(p => ({ value: p.id, label: p.full_name }))} />
          <SelectField label="Profissional" value={form.professional_id} onChange={v => setForm({ ...form, professional_id: v })} placeholder="Selecione" required options={professionals.map(p => ({ value: p.id, label: p.full_name }))} />
          <InputField label="Data da sessão" type="date" value={form.date} onChange={v => setForm({ ...form, date: v })} required />
          <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 6 }}>Humor (1-10)</label><input type="range" min="1" max="10" value={form.mood_score || 5} onChange={e => setForm({ ...form, mood_score: e.target.value })} style={{ width: '100%', accentColor: T.primary500 }} /><div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: T.primary500 }}>{form.mood_score || 5}</div></div>
          <div style={{ gridColumn: '1 / -1' }}><TextArea label="Conteúdo da sessão" value={form.content} onChange={v => setForm({ ...form, content: v })} rows={6} placeholder="Descreva o que foi abordado..." required /></div>
          <InputField label="Técnicas utilizadas" value={form.techniques_used} onChange={v => setForm({ ...form, techniques_used: v })} placeholder="TCC, Mindfulness (vírgula)" />
          <InputField label="Tópicos" value={form.topics} onChange={v => setForm({ ...form, topics: v })} placeholder="Ansiedade, Trabalho (vírgula)" />
          <div style={{ gridColumn: '1 / -1' }}><InputField label="Tarefa de casa" value={form.homework} onChange={v => setForm({ ...form, homework: v })} placeholder="Tarefa para o paciente" /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button icon={Save} onClick={handleSave} loading={saving}>{editId ? 'Salvar' : 'Registrar'}</Button>
        </div>
      </Modal>
      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={async () => { await remove(deleteId); setDeleteId(null) }} title="Excluir registro" message="Tem certeza?" confirmText="Excluir" />
    </div>
  )
}
