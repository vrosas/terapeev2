import { useState, useMemo } from 'react'
import {
  Users, Search, Plus, Filter, ChevronLeft, ChevronRight,
  Phone, Mail, Calendar, Edit3, Trash2, Eye, Tag, UserCog,
  CheckCircle2, Clock, XCircle, AlertCircle, FileText, DollarSign,
} from 'lucide-react'
import { T } from '@/utils/theme'
import { useAppStore } from '@/lib/store'
import { usePatients, useProfessionals } from '@/lib/hooks'
import {
  Card, Badge, Button, InputField, SelectField, TextArea,
  Modal, ConfirmDialog, EmptyState, LoadingSpinner, Avatar, getInitials,
} from '@/components/ui'

const STATUS_MAP = {
  active: { label: 'Ativo', color: T.success, bg: T.successBg },
  inactive: { label: 'Inativo', color: T.n400, bg: `${T.n400}14` },
  discharged: { label: 'Alta', color: T.info, bg: `${T.info}14` },
  waitlist: { label: 'Fila de espera', color: T.warning, bg: T.warningBg },
}

const INITIAL_FORM = {
  full_name: '', email: '', phone: '', cpf: '', birth_date: '',
  gender: '', therapy_type: '', session_frequency: '', session_price: '',
  health_insurance: '', assigned_professional_id: '', status: 'active',
  notes: '', tags: [],
}

export default function PacientesContent() {
  const { navigate } = useAppStore()
  const { data: patients, loading, count, create, update, remove } = usePatients()
  const { data: professionals } = useProfessionals()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [profFilter, setProfFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [viewId, setViewId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)

  const PER_PAGE = 10

  // Filter & paginate
  const filtered = useMemo(() => {
    return patients.filter((p) => {
      if (search && !p.full_name.toLowerCase().includes(search.toLowerCase()) && !p.phone?.includes(search) && !p.email?.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter && p.status !== statusFilter) return false
      if (profFilter && p.assigned_professional_id !== profFilter) return false
      return true
    })
  }, [patients, search, statusFilter, profFilter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Open create/edit modal
  const openModal = (patient = null) => {
    if (patient) {
      setEditId(patient.id)
      setForm({
        full_name: patient.full_name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        cpf: patient.cpf || '',
        birth_date: patient.birth_date || '',
        gender: patient.gender || '',
        therapy_type: patient.therapy_type || '',
        session_frequency: patient.session_frequency || '',
        session_price: patient.session_price?.toString() || '',
        health_insurance: patient.health_insurance || '',
        assigned_professional_id: patient.assigned_professional_id || '',
        status: patient.status || 'active',
        notes: patient.notes || '',
        tags: patient.tags || [],
      })
    } else {
      setEditId(null)
      setForm(INITIAL_FORM)
    }
    setModalOpen(true)
  }

  // Save
  const handleSave = async () => {
    if (!form.full_name.trim()) return
    setSaving(true)

    const payload = {
      ...form,
      session_price: form.session_price ? parseFloat(form.session_price) : null,
      assigned_professional_id: form.assigned_professional_id || null,
      health_insurance: form.health_insurance || null,
    }

    if (editId) {
      await update(editId, payload)
    } else {
      payload.intake_date = new Date().toISOString().split('T')[0]
      await create(payload)
    }

    setSaving(false)
    setModalOpen(false)
  }

  // Delete
  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId)
      setDeleteId(null)
    }
  }

  // View patient detail
  const viewPatient = viewId ? patients.find((p) => p.id === viewId) : null

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeSlideUp 0.25s ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Pacientes</h2>
            <Badge color={T.primary500} bg={T.primary50}>{filtered.length} total</Badge>
          </div>
          <p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>Gerencie o cadastro dos seus pacientes</p>
        </div>
        <Button icon={Plus} onClick={() => openModal()}>Novo paciente</Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 20 }} padding="16px 20px">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color={T.n400} style={{ position: 'absolute', left: 12, top: 11 }} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Buscar por nome, email ou telefone..."
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd,
                fontSize: 14, fontFamily: T.font, color: T.n900, outline: 'none',
                background: T.n0,
              }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            style={{
              padding: '10px 12px', border: `1.5px solid ${T.n300}`,
              borderRadius: T.radiusMd, fontSize: 13, fontFamily: T.font, background: T.n0,
              color: statusFilter ? T.n900 : T.n400,
            }}>
            <option value="">Todos os status</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={profFilter} onChange={(e) => { setProfFilter(e.target.value); setPage(1) }}
            style={{
              padding: '10px 12px', border: `1.5px solid ${T.n300}`,
              borderRadius: T.radiusMd, fontSize: 13, fontFamily: T.font, background: T.n0,
              color: profFilter ? T.n900 : T.n400, maxWidth: 200,
            }}>
            <option value="">Todos os profissionais</option>
            {professionals.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>
      </Card>

      {/* Patient List */}
      {paginated.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum paciente encontrado"
          description={search ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando seu primeiro paciente'}
          action={!search && <Button icon={Plus} onClick={() => openModal()}>Novo paciente</Button>}
        />
      ) : (
        <Card padding="0">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.n100 }}>
                {['Paciente', 'Telefone', 'Profissional', 'Tipo', 'Status', 'Ações'].map((h) => (
                  <th key={h} style={{
                    padding: '12px 16px', fontSize: 12, fontWeight: 600,
                    color: T.n500, textAlign: 'left', textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => {
                const st = STATUS_MAP[p.status] || STATUS_MAP.active
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${T.n100}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = T.n100}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={p.full_name} size={36} color={p.assigned_professional?.color} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{p.full_name}</div>
                          <div style={{ fontSize: 12, color: T.n400 }}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: T.n700 }}>{p.phone}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: T.n700 }}>
                      {p.assigned_professional?.full_name || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: T.n700 }}>
                      {p.therapy_type || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setViewId(p.id)} title="Ver detalhes" style={actionBtnStyle}>
                          <Eye size={14} color={T.n400} />
                        </button>
                        <button onClick={() => openModal(p)} title="Editar" style={actionBtnStyle}>
                          <Edit3 size={14} color={T.n400} />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} title="Excluir" style={actionBtnStyle}>
                          <Trash2 size={14} color={T.error} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: '16px', borderTop: `1px solid ${T.n100}`,
            }}>
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                style={{ ...paginationBtnStyle, opacity: page === 1 ? 0.3 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{
                  ...paginationBtnStyle,
                  background: page === i + 1 ? T.primary500 : T.n0,
                  color: page === i + 1 ? T.n0 : T.n700,
                  border: page === i + 1 ? 'none' : `1px solid ${T.n300}`,
                }}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                style={{ ...paginationBtnStyle, opacity: page === totalPages ? 0.3 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </Card>
      )}

      {/* ═══ Create/Edit Modal ═══ */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editId ? 'Editar paciente' : 'Novo paciente'} width={600}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <InputField label="Nome completo" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} placeholder="Nome do paciente" required />
          </div>
          <InputField label="Email" icon={Mail} value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="email@exemplo.com" />
          <InputField label="Telefone (WhatsApp)" icon={Phone} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="(11) 99999-9999" required />
          <InputField label="CPF" value={form.cpf} onChange={(v) => setForm({ ...form, cpf: v })} placeholder="000.000.000-00" />
          <InputField label="Data de nascimento" type="date" value={form.birth_date} onChange={(v) => setForm({ ...form, birth_date: v })} />
          <SelectField label="Gênero" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })}
            placeholder="Selecione" options={[
              { value: 'F', label: 'Feminino' }, { value: 'M', label: 'Masculino' },
              { value: 'NB', label: 'Não-binário' }, { value: 'other', label: 'Outro' },
            ]} />
          <SelectField label="Profissional responsável" value={form.assigned_professional_id}
            onChange={(v) => setForm({ ...form, assigned_professional_id: v })}
            placeholder="Selecione" options={professionals.map((p) => ({ value: p.id, label: p.full_name }))} />
          <InputField label="Tipo de terapia" value={form.therapy_type} onChange={(v) => setForm({ ...form, therapy_type: v })} placeholder="Ex: TCC, Psicanálise" />
          <SelectField label="Frequência" value={form.session_frequency}
            onChange={(v) => setForm({ ...form, session_frequency: v })}
            placeholder="Selecione" options={[
              { value: 'semanal', label: 'Semanal' }, { value: 'quinzenal', label: 'Quinzenal' },
              { value: 'mensal', label: 'Mensal' },
            ]} />
          <InputField label="Valor da sessão (R$)" type="number" value={form.session_price}
            onChange={(v) => setForm({ ...form, session_price: v })} placeholder="0.00" />
          <InputField label="Convênio" value={form.health_insurance}
            onChange={(v) => setForm({ ...form, health_insurance: v })} placeholder="Nome do convênio" />
          <div style={{ gridColumn: '1 / -1' }}>
            <TextArea label="Observações" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Notas sobre o paciente..." rows={3} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>
            {editId ? 'Salvar alterações' : 'Cadastrar paciente'}
          </Button>
        </div>
      </Modal>

      {/* ═══ View Detail Modal ═══ */}
      <Modal open={Boolean(viewId)} onClose={() => setViewId(null)}
        title={viewPatient?.full_name || 'Detalhes'} width={640}>
        {viewPatient && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <Avatar name={viewPatient.full_name} size={56} color={viewPatient.assigned_professional?.color} />
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{viewPatient.full_name}</h3>
                <div style={{ fontSize: 13, color: T.n400 }}>
                  {viewPatient.therapy_type} • {viewPatient.session_frequency || 'Sem frequência definida'}
                </div>
                <Badge color={STATUS_MAP[viewPatient.status]?.color} bg={STATUS_MAP[viewPatient.status]?.bg}>
                  {STATUS_MAP[viewPatient.status]?.label}
                </Badge>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: Phone, label: 'Telefone', value: viewPatient.phone },
                { icon: Mail, label: 'Email', value: viewPatient.email },
                { icon: Calendar, label: 'Nascimento', value: viewPatient.birth_date },
                { icon: UserCog, label: 'Profissional', value: viewPatient.assigned_professional?.full_name },
                { icon: DollarSign, label: 'Valor/sessão', value: viewPatient.session_price ? `R$ ${viewPatient.session_price.toFixed(2)}` : '—' },
                { icon: Tag, label: 'Convênio', value: viewPatient.health_insurance || 'Particular' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                  <item.icon size={16} color={T.n400} />
                  <div>
                    <div style={{ fontSize: 11, color: T.n400, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
            {viewPatient.notes && (
              <div style={{ marginTop: 16, padding: 16, background: T.n100, borderRadius: T.radiusMd }}>
                <div style={{ fontSize: 12, color: T.n400, marginBottom: 4 }}>Observações</div>
                <div style={{ fontSize: 14, color: T.n700, lineHeight: 1.5 }}>{viewPatient.notes}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <Button variant="secondary" icon={Calendar} onClick={() => { setViewId(null); navigate('agenda') }}>
                Ver agenda
              </Button>
              <Button variant="secondary" icon={FileText} onClick={() => { setViewId(null); navigate('prontuarios') }}>
                Prontuário
              </Button>
              <Button icon={Edit3} onClick={() => { setViewId(null); openModal(viewPatient) }}>
                Editar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ Delete Confirm ═══ */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir paciente"
        message="Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita."
        confirmText="Excluir"
      />
    </div>
  )
}

const actionBtnStyle = {
  width: 32, height: 32, borderRadius: T.radiusMd, border: `1px solid ${T.n200}`,
  background: T.n0, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', transition: 'all 150ms',
}

const paginationBtnStyle = {
  width: 32, height: 32, borderRadius: T.radiusMd, border: `1px solid ${T.n300}`,
  background: T.n0, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontFamily: T.font,
  fontSize: 13, fontWeight: 500, transition: 'all 150ms',
}
