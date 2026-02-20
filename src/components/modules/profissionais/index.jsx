import { useState } from 'react'
import { Award, Plus, Edit3, Trash2, Mail, Phone, Tag, Clock } from 'lucide-react'
import { T } from '@/utils/theme'
import { useProfessionals } from '@/lib/hooks'
import { Card, Badge, Button, InputField, SelectField, TextArea, Modal, ConfirmDialog, EmptyState, LoadingSpinner, Avatar } from '@/components/ui'

const INIT = { full_name: '', email: '', phone: '', crp: '', specialties: '', color: '#3F6BFF', session_price: '', session_duration: '50', bio: '', is_active: true }

export default function ProfissionaisContent() {
  const { data: professionals, loading, create, update, remove } = useProfessionals()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(INIT)
  const [saving, setSaving] = useState(false)

  const openModal = (prof = null) => {
    if (prof) {
      setEditId(prof.id)
      setForm({ full_name: prof.full_name || '', email: prof.email || '', phone: prof.phone || '', crp: prof.crp || '', specialties: prof.specialties?.join(', ') || '', color: prof.color || '#3F6BFF', session_price: prof.session_price?.toString() || '', session_duration: prof.session_duration?.toString() || '50', bio: prof.bio || '', is_active: prof.is_active !== false })
    } else { setEditId(null); setForm(INIT) }
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.full_name.trim()) return; setSaving(true)
    const payload = { full_name: form.full_name, email: form.email || null, phone: form.phone || null, crp: form.crp || null, specialties: form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : [], color: form.color, session_price: form.session_price ? parseFloat(form.session_price) : null, session_duration: form.session_duration ? parseInt(form.session_duration) : 50, bio: form.bio || null, is_active: form.is_active }
    if (editId) await update(editId, payload); else await create(payload)
    setSaving(false); setModalOpen(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeSlideUp 0.25s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700 }}>Profissionais</h2><p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>Equipe da clínica</p></div>
        <Button icon={Plus} onClick={() => openModal()}>Novo profissional</Button>
      </div>

      {professionals.length === 0 ? <EmptyState icon={Award} title="Nenhum profissional" action={<Button icon={Plus} onClick={() => openModal()}>Adicionar</Button>} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {professionals.map(prof => (
            <Card key={prof.id} hoverable>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <Avatar name={prof.full_name} size={52} color={prof.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{prof.full_name}</h3>
                    {!prof.is_active && <Badge color={T.n400} bg={`${T.n400}14`}>Inativo</Badge>}
                  </div>
                  <div style={{ fontSize: 13, color: T.primary500, fontWeight: 500 }}>{prof.crp || 'Sem CRP'}</div>
                </div>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: prof.color, flexShrink: 0, marginTop: 4 }} />
              </div>

              {prof.bio && <p style={{ fontSize: 13, color: T.n500, margin: '12px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prof.bio}</p>}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '12px 0' }}>
                {prof.specialties?.map(s => <Badge key={s} color={prof.color} bg={`${prof.color}14`}>{s}</Badge>)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 0', borderTop: `1px solid ${T.n100}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n500 }}><DollarSign size={13} /> R$ {prof.session_price?.toFixed(2) || '0.00'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n500 }}><Clock size={13} /> {prof.session_duration || 50} min</div>
                {prof.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n500 }}><Phone size={13} /> {prof.phone}</div>}
                {prof.email && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><Mail size={13} /> {prof.email}</div>}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button variant="secondary" size="sm" icon={Edit3} onClick={() => openModal(prof)} fullWidth>Editar</Button>
                <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteId(prof.id)}>Excluir</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar profissional' : 'Novo profissional'} width={560}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div style={{ gridColumn: '1 / -1' }}><InputField label="Nome completo" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} required /></div>
          <InputField label="Email" icon={Mail} value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <InputField label="Telefone" icon={Phone} value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <InputField label="CRP" value={form.crp} onChange={v => setForm({ ...form, crp: v })} placeholder="CRP 06/123456" />
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 6 }}>Cor da agenda</label>
            <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: '100%', height: 40, border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, cursor: 'pointer', padding: 2 }} />
          </div>
          <InputField label="Valor da sessão (R$)" type="number" value={form.session_price} onChange={v => setForm({ ...form, session_price: v })} />
          <InputField label="Duração (min)" type="number" value={form.session_duration} onChange={v => setForm({ ...form, session_duration: v })} />
          <div style={{ gridColumn: '1 / -1' }}><InputField label="Especialidades" value={form.specialties} onChange={v => setForm({ ...form, specialties: v })} placeholder="TCC, Ansiedade, Depressão (vírgula)" /></div>
          <div style={{ gridColumn: '1 / -1' }}><TextArea label="Bio" value={form.bio} onChange={v => setForm({ ...form, bio: v })} rows={3} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>{editId ? 'Salvar' : 'Cadastrar'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} onConfirm={async () => { await remove(deleteId); setDeleteId(null) }} title="Excluir profissional" message="Tem certeza?" confirmText="Excluir" />
    </div>
  )
}
