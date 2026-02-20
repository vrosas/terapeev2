import { useState, useMemo } from 'react'
import { DollarSign, Plus, TrendingUp, TrendingDown, CheckCircle2, Clock, AlertCircle, Edit3, Trash2, ArrowDownRight, Receipt } from 'lucide-react'
import { PieChart as RechartPie, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { T } from '@/utils/theme'
import { useCharges, useExpenses, useExpenseCategories, usePatients, useProfessionals } from '@/lib/hooks'
import { Card, Badge, Button, InputField, SelectField, Modal, ConfirmDialog, EmptyState, LoadingSpinner, Avatar, StatCard } from '@/components/ui'

const CH_STATUS = { paid: { label: 'Pago', color: T.success, bg: T.successBg }, pending: { label: 'Pendente', color: T.warning, bg: T.warningBg }, overdue: { label: 'Vencido', color: T.error, bg: T.errorBg }, cancelled: { label: 'Cancelado', color: T.n400, bg: `${T.n400}14` } }
const PAY_METHODS = [{ value: 'pix', label: 'PIX' }, { value: 'credit_card', label: 'Cartão crédito' }, { value: 'debit_card', label: 'Cartão débito' }, { value: 'cash', label: 'Dinheiro' }, { value: 'bank_transfer', label: 'Transferência' }, { value: 'health_insurance', label: 'Convênio' }]

export default function FinanceiroContent() {
  const { data: charges, loading: lC, create: createCh, update: updateCh, remove: removeCh } = useCharges()
  const { data: expenses, loading: lE, create: createExp, update: updateExp, remove: removeExp } = useExpenses()
  const { data: expCats } = useExpenseCategories()
  const { data: patients } = usePatients()
  const { data: professionals } = useProfessionals()

  const [tab, setTab] = useState('charges')
  const [chModal, setChModal] = useState(false)
  const [expModal, setExpModal] = useState(false)
  const [editChId, setEditChId] = useState(null)
  const [editExpId, setEditExpId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteType, setDeleteType] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [chForm, setChForm] = useState({ patient_id: '', professional_id: '', amount: '', due_date: '', description: '', payment_method: '' })
  const [expForm, setExpForm] = useState({ category_id: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], recurrence: 'once' })

  const stats = useMemo(() => {
    const paid = charges.filter(c => c.status === 'paid').reduce((s, c) => s + (c.amount || 0), 0)
    const pending = charges.filter(c => c.status === 'pending').reduce((s, c) => s + (c.amount || 0), 0)
    const overdue = charges.filter(c => c.status === 'overdue').reduce((s, c) => s + (c.amount || 0), 0)
    const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0)
    return { paid, pending, overdue, totalExp, profit: paid - totalExp }
  }, [charges, expenses])

  const filteredCharges = useMemo(() => statusFilter ? charges.filter(c => c.status === statusFilter) : charges, [charges, statusFilter])

  const expByCategory = useMemo(() => {
    const map = {}; expenses.forEach(e => { const cat = e.category?.name || 'Outros'; map[cat] = (map[cat] || 0) + (e.amount || 0) })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [expenses])
  const PIE_COLORS = [T.primary500, T.purple, T.orange, T.pink, T.teal, T.warning]

  const handleSaveCh = async () => {
    if (!chForm.patient_id || !chForm.amount || !chForm.due_date) return; setSaving(true)
    const p = { patient_id: chForm.patient_id, professional_id: chForm.professional_id || null, amount: parseFloat(chForm.amount), due_date: chForm.due_date, description: chForm.description || null, payment_method: chForm.payment_method || null }
    if (editChId) await updateCh(editChId, p); else { p.status = 'pending'; await createCh(p) }
    setSaving(false); setChModal(false); setEditChId(null)
  }
  const handleSaveExp = async () => {
    if (!expForm.description || !expForm.amount) return; setSaving(true)
    const p = { category_id: expForm.category_id || null, description: expForm.description, amount: parseFloat(expForm.amount), date: expForm.date, recurrence: expForm.recurrence }
    if (editExpId) await updateExp(editExpId, p); else await createExp(p)
    setSaving(false); setExpModal(false); setEditExpId(null)
  }
  const markPaid = async (id) => { await updateCh(id, { status: 'paid', payment_method: 'pix', paid_at: new Date().toISOString() }) }

  if (lC || lE) return <LoadingSpinner />

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeSlideUp 0.25s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700 }}>Financeiro</h2><p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>Cobranças, despesas e relatórios</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon={ArrowDownRight} onClick={() => { setEditExpId(null); setExpForm({ category_id: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], recurrence: 'once' }); setExpModal(true) }}>Nova despesa</Button>
          <Button icon={Plus} onClick={() => { setEditChId(null); setChForm({ patient_id: '', professional_id: '', amount: '', due_date: '', description: '', payment_method: '' }); setChModal(true) }}>Nova cobrança</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Recebido" value={`R$ ${(stats.paid/1000).toFixed(1)}k`} icon={CheckCircle2} color={T.success} />
        <StatCard label="Pendente" value={`R$ ${stats.pending.toFixed(0)}`} icon={Clock} color={T.warning} />
        <StatCard label="Vencido" value={`R$ ${stats.overdue.toFixed(0)}`} icon={AlertCircle} color={T.error} />
        <StatCard label="Despesas" value={`R$ ${(stats.totalExp/1000).toFixed(1)}k`} icon={ArrowDownRight} color={T.orange} />
        <StatCard label="Lucro" value={`R$ ${(stats.profit/1000).toFixed(1)}k`} icon={stats.profit >= 0 ? TrendingUp : TrendingDown} color={stats.profit >= 0 ? T.success : T.error} />
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: T.n100, borderRadius: T.radiusMd, padding: 4, width: 'fit-content' }}>
        {[{ id: 'charges', label: 'Cobranças' }, { id: 'expenses', label: 'Despesas' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: T.font, fontSize: 13, fontWeight: tab === t.id ? 600 : 400, background: tab === t.id ? T.n0 : 'transparent', color: tab === t.id ? T.n900 : T.n500, boxShadow: tab === t.id ? T.shadowSoft : 'none' }}>{t.label}</button>
        ))}
      </div>

      {tab === 'charges' && (<>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['', 'pending', 'paid', 'overdue'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${statusFilter === s ? T.primary500 : T.n300}`, background: statusFilter === s ? T.primary50 : T.n0, cursor: 'pointer', fontFamily: T.font, fontSize: 12, fontWeight: 500, color: statusFilter === s ? T.primary500 : T.n700 }}>{s === '' ? 'Todos' : CH_STATUS[s]?.label}</button>
          ))}
        </div>
        <Card padding="0">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: T.n100 }}>{['Paciente', 'Descrição', 'Valor', 'Vencimento', 'Status', 'Ações'].map(h => <th key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: T.n500, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}</tr></thead>
            <tbody>{filteredCharges.map(ch => {
              const st = CH_STATUS[ch.status] || CH_STATUS.pending
              return (<tr key={ch.id} style={{ borderBottom: `1px solid ${T.n100}` }}>
                <td style={{ padding: '14px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={ch.patient?.full_name} size={32} /><span style={{ fontSize: 13, fontWeight: 500 }}>{ch.patient?.full_name}</span></div></td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: T.n700 }}>{ch.description || '—'}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600 }}>R$ {ch.amount?.toFixed(2)}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: T.n700 }}>{ch.due_date ? new Date(ch.due_date + 'T12:00').toLocaleDateString('pt-BR') : '—'}</td>
                <td style={{ padding: '14px 16px' }}><Badge color={st.color} bg={st.bg}>{st.label}</Badge></td>
                <td style={{ padding: '14px 16px' }}><div style={{ display: 'flex', gap: 4 }}>
                  {(ch.status === 'pending' || ch.status === 'overdue') && <Button size="sm" variant="success" onClick={() => markPaid(ch.id)}>Pagar</Button>}
                  <button onClick={() => { setEditChId(ch.id); setChForm({ patient_id: ch.patient_id, professional_id: ch.professional_id || '', amount: ch.amount?.toString() || '', due_date: ch.due_date || '', description: ch.description || '', payment_method: ch.payment_method || '' }); setChModal(true) }} style={aBtn}><Edit3 size={14} color={T.n400} /></button>
                  <button onClick={() => { setDeleteId(ch.id); setDeleteType('ch') }} style={aBtn}><Trash2 size={14} color={T.error} /></button>
                </div></td>
              </tr>)
            })}</tbody>
          </table>
          {filteredCharges.length === 0 && <EmptyState icon={Receipt} title="Nenhuma cobrança" />}
        </Card>
      </>)}

      {tab === 'expenses' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <Card padding="0">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: T.n100 }}>{['Descrição', 'Categoria', 'Valor', 'Data', 'Ações'].map(h => <th key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: T.n500, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}</tr></thead>
              <tbody>{expenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: `1px solid ${T.n100}` }}>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500 }}>{exp.description}</td>
                  <td style={{ padding: '14px 16px' }}><Badge color={exp.category?.color || T.n500} bg={`${exp.category?.color || T.n500}14`}>{exp.category?.name || 'Outros'}</Badge></td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: T.error }}>-R$ {exp.amount?.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: T.n700 }}>{exp.date ? new Date(exp.date + 'T12:00').toLocaleDateString('pt-BR') : '—'}</td>
                  <td style={{ padding: '14px 16px' }}><div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => { setEditExpId(exp.id); setExpForm({ category_id: exp.category_id || '', description: exp.description, amount: exp.amount?.toString(), date: exp.date, recurrence: exp.recurrence || 'once' }); setExpModal(true) }} style={aBtn}><Edit3 size={14} color={T.n400} /></button>
                    <button onClick={() => { setDeleteId(exp.id); setDeleteType('exp') }} style={aBtn}><Trash2 size={14} color={T.error} /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
            {expenses.length === 0 && <EmptyState icon={Receipt} title="Nenhuma despesa" />}
          </Card>
          <Card>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Por categoria</h4>
            {expByCategory.length > 0 && <ResponsiveContainer width="100%" height={200}><RechartPie><Pie data={expByCategory} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>{expByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={v => `R$ ${v.toFixed(2)}`} /></RechartPie></ResponsiveContainer>}
          </Card>
        </div>
      )}

      <Modal open={chModal} onClose={() => setChModal(false)} title={editChId ? 'Editar cobrança' : 'Nova cobrança'} width={500}>
        <SelectField label="Paciente" value={chForm.patient_id} onChange={v => setChForm({ ...chForm, patient_id: v })} placeholder="Selecione" required options={patients.map(p => ({ value: p.id, label: p.full_name }))} />
        <SelectField label="Profissional" value={chForm.professional_id} onChange={v => setChForm({ ...chForm, professional_id: v })} placeholder="Opcional" options={professionals.map(p => ({ value: p.id, label: p.full_name }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <InputField label="Valor (R$)" type="number" value={chForm.amount} onChange={v => setChForm({ ...chForm, amount: v })} required />
          <InputField label="Vencimento" type="date" value={chForm.due_date} onChange={v => setChForm({ ...chForm, due_date: v })} required />
        </div>
        <InputField label="Descrição" value={chForm.description} onChange={v => setChForm({ ...chForm, description: v })} placeholder="Sessão, avaliação..." />
        <SelectField label="Pagamento" value={chForm.payment_method} onChange={v => setChForm({ ...chForm, payment_method: v })} placeholder="Opcional" options={PAY_METHODS} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}><Button variant="secondary" onClick={() => setChModal(false)}>Cancelar</Button><Button onClick={handleSaveCh} loading={saving}>{editChId ? 'Salvar' : 'Criar'}</Button></div>
      </Modal>

      <Modal open={expModal} onClose={() => setExpModal(false)} title={editExpId ? 'Editar despesa' : 'Nova despesa'} width={500}>
        <InputField label="Descrição" value={expForm.description} onChange={v => setExpForm({ ...expForm, description: v })} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <InputField label="Valor (R$)" type="number" value={expForm.amount} onChange={v => setExpForm({ ...expForm, amount: v })} required />
          <InputField label="Data" type="date" value={expForm.date} onChange={v => setExpForm({ ...expForm, date: v })} required />
        </div>
        <SelectField label="Categoria" value={expForm.category_id} onChange={v => setExpForm({ ...expForm, category_id: v })} placeholder="Selecione" options={expCats.map(c => ({ value: c.id, label: c.name }))} />
        <SelectField label="Recorrência" value={expForm.recurrence} onChange={v => setExpForm({ ...expForm, recurrence: v })} options={[{ value: 'once', label: 'Única' }, { value: 'monthly', label: 'Mensal' }, { value: 'quarterly', label: 'Trimestral' }, { value: 'yearly', label: 'Anual' }]} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}><Button variant="secondary" onClick={() => setExpModal(false)}>Cancelar</Button><Button onClick={handleSaveExp} loading={saving}>{editExpId ? 'Salvar' : 'Registrar'}</Button></div>
      </Modal>

      <ConfirmDialog open={Boolean(deleteId)} onClose={() => { setDeleteId(null); setDeleteType(null) }} onConfirm={async () => { if (deleteType === 'ch') await removeCh(deleteId); else await removeExp(deleteId); setDeleteId(null) }} title="Excluir" message="Tem certeza?" confirmText="Excluir" />
    </div>
  )
}
const aBtn = { width: 32, height: 32, borderRadius: 6, border: `1px solid ${T.n200}`, background: T.n0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
