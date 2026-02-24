import { useState, useMemo } from 'react'
import { Activity, AlertTriangle, Clock, CreditCard, DollarSign, Download, Plus, Printer, Star, TrendingDown, TrendingUp, Users, X } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart as RPie, Pie, Cell,
  LineChart, Line,
} from 'recharts'
import { T } from '@/utils/theme'
import { Button, getInitials } from '@/components/ui'
import { useAppointments, usePatients, useProfessionals, useServices, useCharges, useExpenses, useExpenseCategories } from '@/lib/hooks'

/* ─── Shared Components ─── */
function KPI({ label, value, sub, trend, trendUp, icon: Icon, color, delay = 0 }) {
  return (
    <div style={{
      background: T.n0, borderRadius: T.radiusLg, padding: '18px 20px',
      boxShadow: T.shadowSoft, border: `1px solid ${T.n200}`,
      display: 'flex', alignItems: 'center', gap: 14,
      animation: `fadeSlideUp 0.4s ease ${delay}s both`,
      transition: 'box-shadow 200ms, transform 200ms', cursor: 'default',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.shadowSoft; e.currentTarget.style.transform = 'none' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: 12, color: T.n400, marginTop: 1 }}>{label}</div>
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: trendUp ? T.success : T.error, padding: '3px 8px', borderRadius: 6, background: trendUp ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)' }}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{trend}
        </div>
      )}
    </div>
  )
}

function ChartCard({ title, subtitle, children, delay = 0, action }) {
  return (
    <div style={{ background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`, boxShadow: T.shadowSoft, overflow: 'hidden', animation: `fadeSlideUp 0.35s ease ${delay}s both` }}>
      <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: T.n400, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      <div style={{ padding: '16px 22px 20px' }}>{children}</div>
    </div>
  )
}

function CTT({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: T.n0, border: `1px solid ${T.n200}`, borderRadius: T.radiusMd, padding: '10px 14px', boxShadow: T.shadowMd, fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: T.n900 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.n700, marginTop: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.fill || p.stroke }} />
          {p.name}: <strong>{typeof p.value === 'number' && p.value > 999 ? `R$ ${p.value.toLocaleString('pt-BR')}` : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

/* ─── Heatmap ─── */
function Heatmap({ data = [] }) {
  const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
  const keys = ['h7', 'h8', 'h9', 'h10', 'h11', 'h14', 'h15', 'h16', 'h17']
  const maxVal = Math.max(1, ...data.flatMap(row => keys.map(k => row[k] || 0)))
  const getColor = (v) => {
    if (v === 0) return T.n200
    const pct = v / maxVal
    if (pct < 0.3) return 'rgba(63,107,255,0.15)'
    if (pct < 0.5) return 'rgba(63,107,255,0.30)'
    if (pct < 0.7) return 'rgba(63,107,255,0.50)'
    if (pct < 0.85) return 'rgba(63,107,255,0.70)'
    return T.primary500
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(9,1fr)', gap: 3, minWidth: 450 }}>
        <div />
        {hours.map((h) => <div key={h} style={{ textAlign: 'center', fontSize: 11, color: T.n400, padding: '4px 0', fontFamily: 'monospace' }}>{h}</div>)}
        {data.map((row) => (
          <>{[null, ...keys].map((k, i) => {
            if (i === 0) return <div key={row.day} style={{ fontSize: 12, color: T.n700, fontWeight: 500, display: 'flex', alignItems: 'center' }}>{row.day}</div>
            const v = row[k] || 0
            return <div key={`${row.day}-${k}`} title={`${v} atendimentos`} style={{ height: 32, borderRadius: 4, background: getColor(v), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: v > 7 ? T.n0 : v > 0 ? T.primary600 : 'transparent', cursor: 'default' }}>{v > 0 ? v : ''}</div>
          })}</>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: T.n400 }}>Menos</span>
        {[T.n200, 'rgba(63,107,255,0.15)', 'rgba(63,107,255,0.30)', 'rgba(63,107,255,0.50)', 'rgba(63,107,255,0.70)', T.primary500].map((c, i) => (
          <div key={i} style={{ width: 16, height: 12, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 10, color: T.n400 }}>Mais</span>
      </div>
    </div>
  )
}

/* ═══════════════ RELATÓRIOS MODULE ═══════════════ */
export default function Relatorios() {
  const [tab, setTab] = useState('overview')
  const [period, setPeriod] = useState('6m')

  const { data: appointments = [] } = useAppointments()
  const { data: patients = [] } = usePatients()
  const { data: professionals = [] } = useProfessionals()
  const { data: services = [] } = useServices()
  const { data: charges = [] } = useCharges()
  const { data: expenses = [] } = useExpenses()
  const { data: expenseCategories = [] } = useExpenseCategories()

  const MONTHS_DATA = useMemo(() => {
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' })
      const monthCharges = charges.filter(c => c.status === 'paid' && (c.due_date || '').startsWith(monthKey))
      const monthExpenses = expenses.filter(e => (e.date || '').startsWith(monthKey))
      const monthAppointments = appointments.filter(a => (a.start_time || '').startsWith(monthKey))
      const novos = patients.filter(p => (p.created_at || '').startsWith(monthKey)).length
      const receita = monthCharges.reduce((sum, c) => sum + (c.amount || 0), 0)
      const despesa = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
      months.push({
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        receita,
        despesa,
        lucro: receita - despesa,
        atendimentos: monthAppointments.length,
        novos,
        cancelamentos: monthAppointments.filter(a => a.status === 'cancelled').length,
        noShow: monthAppointments.filter(a => a.status === 'no_show').length,
      })
    }
    return months
  }, [appointments, patients, charges, expenses])

  const PROF_COLORS = [T.primary500, T.success, T.warning, '#9333EA', T.info, '#0D9488']

  const BY_PROFESSIONAL = useMemo(() => {
    const profMap = {}
    appointments.forEach(a => {
      if (!a.professional_id) return
      if (!profMap[a.professional_id]) profMap[a.professional_id] = { total: 0, completed: 0, patientIds: new Set() }
      profMap[a.professional_id].total++
      if (a.status === 'completed') profMap[a.professional_id].completed++
      if (a.patient_id) profMap[a.professional_id].patientIds.add(a.patient_id)
    })
    return Object.entries(profMap).map(([profId, d], idx) => {
      const prof = professionals.find(p => p.id === profId)
      return {
        name: prof?.full_name || 'Desconhecido',
        atendimentos: d.completed,
        receita: 0,
        pacientes: d.patientIds.size,
        ocupacao: d.total > 0 ? Math.min(100, Math.round((d.completed / d.total) * 100)) : 0,
        color: PROF_COLORS[idx % PROF_COLORS.length],
      }
    }).sort((a, b) => b.atendimentos - a.atendimentos)
  }, [appointments, professionals])

  const BY_SERVICE = useMemo(() => {
    const colors = [T.primary500, T.success, T.warning, '#9333EA', '#0D9488']
    const svcMap = {}
    appointments.forEach(a => {
      if (!a.service_id) return
      if (!svcMap[a.service_id]) svcMap[a.service_id] = 0
      svcMap[a.service_id]++
    })
    return Object.entries(svcMap).map(([svcId, qtd], idx) => {
      const svc = services.find(s => s.id === svcId)
      const pricePerSession = svc?.price_per_session || 0
      return {
        name: svc?.name || 'Serviço',
        qtd,
        receita: qtd * pricePerSession,
        color: colors[idx % colors.length],
      }
    }).sort((a, b) => b.qtd - a.qtd)
  }, [appointments, services])

  const BY_PAYMENT = useMemo(() => {
    const METHOD_LABELS = { pix: 'Pix', credit_card: 'Cartão Crédito', insurance: 'Convênio', cash: 'Dinheiro', bank_transfer: 'Transferência' }
    const METHOD_COLORS = { pix: '#0D9488', credit_card: T.primary500, insurance: T.success, cash: T.warning, bank_transfer: '#9333EA' }
    const paidCharges = charges.filter(c => c.status === 'paid')
    const total = paidCharges.length || 1
    const payMap = {}
    paidCharges.forEach(c => {
      const method = c.payment_method || 'other'
      payMap[method] = (payMap[method] || 0) + 1
    })
    return Object.entries(payMap).map(([method, count]) => ({
      name: METHOD_LABELS[method] || method,
      value: Math.round((count / total) * 100),
      color: METHOD_COLORS[method] || T.n400,
    })).sort((a, b) => b.value - a.value)
  }, [charges])

  const BY_STATUS = useMemo(() => {
    const STATUS_META = {
      completed: { name: 'Realizados', color: T.success },
      cancelled: { name: 'Cancelados', color: T.error },
      no_show: { name: 'No-show', color: T.warning },
      rescheduled: { name: 'Reagendados', color: T.info },
    }
    const counts = {}
    appointments.forEach(a => {
      if (STATUS_META[a.status]) counts[a.status] = (counts[a.status] || 0) + 1
    })
    return Object.entries(STATUS_META)
      .map(([key, meta]) => ({ name: meta.name, value: counts[key] || 0, color: meta.color }))
      .filter(s => s.value > 0)
  }, [appointments])

  const WEEKLY_HEATMAP = useMemo(() => {
    const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const HOUR_KEYS = [7, 8, 9, 10, 11, 14, 15, 16, 17]
    const heatmap = DAY_LABELS.map(day => ({ day, ...Object.fromEntries(HOUR_KEYS.map(h => [`h${h}`, 0])) }))
    appointments.forEach(a => {
      if (!a.start_time) return
      const dt = new Date(a.start_time)
      const dayIdx = dt.getDay()
      const hour = dt.getHours()
      const key = `h${hour}`
      if (heatmap[dayIdx] && key in heatmap[dayIdx]) heatmap[dayIdx][key]++
    })
    return [1, 2, 3, 4, 5, 6].map(d => heatmap[d])
  }, [appointments])

  const EXPENSE_CATS = useMemo(() => {
    const colors = [T.primary500, T.success, T.warning, T.error, '#9333EA', T.n400]
    const catMap = {}
    expenses.forEach(e => {
      const cat = expenseCategories.find(c => c.id === e.category_id)
      const catName = cat?.name || 'Outros'
      catMap[catName] = (catMap[catName] || 0) + (e.amount || 0)
    })
    return Object.entries(catMap)
      .map(([name, value], idx) => ({ name, value, color: colors[idx % colors.length] }))
      .sort((a, b) => b.value - a.value)
  }, [expenses, expenseCategories])

  const PATIENT_FLOW = useMemo(() => {
    const now = new Date()
    const activeCount = patients.filter(p => p.status === 'active' || !p.status).length
    const inactiveCount = patients.filter(p => p.status === 'inactive').length
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' })
      const novos = patients.filter(p => (p.created_at || '').startsWith(monthKey)).length
      months.push({
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        novos,
        ativos: activeCount,
        inativos: inactiveCount,
      })
    }
    return months
  }, [patients])

  const totals = useMemo(() => {
    const data = MONTHS_DATA
    const r = data.reduce((a, m) => a + m.receita, 0)
    const d = data.reduce((a, m) => a + m.despesa, 0)
    const at = data.reduce((a, m) => a + m.atendimentos, 0)
    const nv = data.reduce((a, m) => a + m.novos, 0)
    const cn = data.reduce((a, m) => a + m.cancelamentos, 0)
    const ns = data.reduce((a, m) => a + m.noShow, 0)
    const last = data[data.length - 1] || { receita: 0, atendimentos: 0 }
    const prev = data[data.length - 2] || { receita: 0, atendimentos: 0 }
    const recTrend = prev.receita ? Math.round(((last.receita - prev.receita) / prev.receita) * 100) : 0
    const attTrend = prev.atendimentos ? Math.round(((last.atendimentos - prev.atendimentos) / prev.atendimentos) * 100) : 0
    const ocupacaoMedia = BY_PROFESSIONAL.length ? Math.round(BY_PROFESSIONAL.reduce((a, p) => a + p.ocupacao, 0) / BY_PROFESSIONAL.length) : 0
    return { receita: r, despesa: d, lucro: r - d, atendimentos: at, novos: nv, cancelamentos: cn, noShow: ns, recTrend, attTrend, ticketMedio: at > 0 ? Math.round(r / at) : 0, ocupacaoMedia }
  }, [MONTHS_DATA, BY_PROFESSIONAL])

  const tabs = [
    { id: 'overview', label: 'Visão geral' },
    { id: 'financial', label: 'Financeiro' },
    { id: 'attendance', label: 'Atendimentos' },
    { id: 'patients', label: 'Pacientes' },
  ]

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, animation: 'fadeSlideUp 0.3s ease both' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Relatórios</h1>
          <p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>Análises de desempenho, faturamento e operação da clínica</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, overflow: 'hidden' }}>
            {[{ id: '1m', label: '1M' }, { id: '3m', label: '3M' }, { id: '6m', label: '6M' }, { id: '12m', label: '12M' }].map((p) => (
              <button key={p.id} onClick={() => setPeriod(p.id)} style={{
                padding: '8px 14px', border: 'none', cursor: 'pointer', fontFamily: T.font,
                fontSize: 12, fontWeight: period === p.id ? 600 : 400,
                color: period === p.id ? T.primary500 : T.n400,
                background: period === p.id ? T.primary50 : T.n0, transition: 'all 150ms',
              }}>{p.label}</button>
            ))}
          </div>
          <Button variant="secondary" size="sm" icon={Download}>Exportar PDF</Button>
          <Button variant="secondary" size="sm" icon={Printer}>Imprimir</Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `2px solid ${T.n200}`, marginBottom: 22 }}>
        {tabs.map((t) => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '12px 20px', border: 'none', cursor: 'pointer', fontFamily: T.font,
              fontSize: 14, fontWeight: active ? 600 : 400, color: active ? T.primary500 : T.n400,
              background: 'transparent', borderBottom: `2px solid ${active ? T.primary500 : 'transparent'}`,
              marginBottom: -2, transition: 'all 150ms',
            }}>{t.label}</button>
          )
        })}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 22 }}>
            <KPI icon={DollarSign} label="Receita total" value={`R$ ${(totals.receita / 1000).toFixed(1)}k`} trend={`${totals.recTrend > 0 ? '+' : ''}${totals.recTrend}%`} trendUp={totals.recTrend > 0} color={T.success} delay={0.05} />
            <KPI icon={Activity} label="Atendimentos" value={totals.atendimentos} trend={`${totals.attTrend > 0 ? '+' : ''}${totals.attTrend}%`} trendUp={totals.attTrend > 0} color={T.primary500} delay={0.1} />
            <KPI icon={Users} label="Novos pacientes" value={totals.novos} color={T.info} delay={0.15} />
            <KPI icon={CreditCard} label="Ticket médio" value={`R$ ${totals.ticketMedio}`} color={T.warning} delay={0.2} />
            <KPI icon={Clock} label="Ocupação média" value={`${totals.ocupacaoMedia}%`} color="#9333EA" delay={0.25} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <ChartCard title="Receita vs. Despesas" subtitle="Últimos 6 meses" delay={0.1}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={MONTHS_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.success} stopOpacity={0.12} /><stop offset="95%" stopColor={T.success} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.error} stopOpacity={0.08} /><stop offset="95%" stopColor={T.error} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.n200} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: T.n400 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.n400 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CTT />} />
                  <Area type="monotone" dataKey="receita" stroke={T.success} strokeWidth={2.5} fill="url(#gRev)" name="Receita" dot={{ fill: T.success, r: 3, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="despesa" stroke={T.error} strokeWidth={2} strokeDasharray="5 3" fill="url(#gExp)" name="Despesa" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n400 }}><div style={{ width: 12, height: 3, borderRadius: 2, background: T.success }} /> Receita</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n400 }}><div style={{ width: 12, height: 3, borderRadius: 2, background: T.error, opacity: 0.6 }} /> Despesas</div>
              </div>
            </ChartCard>

            <ChartCard title="Status dos atendimentos" subtitle="Mês atual" delay={0.15}>
              <ResponsiveContainer width="100%" height={200}>
                <RPie><Pie data={BY_STATUS} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                  {BY_STATUS.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie><Tooltip content={<CTT />} /></RPie>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {BY_STATUS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n700 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.name}</div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ChartCard title="Ocupação por profissional" subtitle="Mês atual" delay={0.2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {BY_PROFESSIONAL.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${p.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color, fontWeight: 600, fontSize: 11, flexShrink: 0 }}>{getInitials(p.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: p.ocupacao >= 80 ? T.success : p.ocupacao >= 60 ? T.warning : T.error }}>{p.ocupacao}%</span>
                      </div>
                      <div style={{ height: 6, background: T.n200, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p.ocupacao}%`, background: p.color, borderRadius: 3, transition: 'width 800ms ease' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Mapa de calor — Horários de pico" subtitle="Atendimentos por dia/hora" delay={0.25}>
              <Heatmap data={WEEKLY_HEATMAP} />
            </ChartCard>
          </div>
        </div>
      )}

      {/* FINANCIAL */}
      {tab === 'financial' && (
        <div style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
            <KPI icon={TrendingUp} label="Receita bruta" value={`R$ ${(totals.receita / 1000).toFixed(1)}k`} trend={`${totals.recTrend > 0 ? '+' : ''}${totals.recTrend}%`} trendUp={totals.recTrend > 0} color={T.success} delay={0.05} />
            <KPI icon={TrendingDown} label="Despesas totais" value={`R$ ${(totals.despesa / 1000).toFixed(1)}k`} color={T.error} delay={0.1} />
            <KPI icon={DollarSign} label="Lucro líquido" value={`R$ ${(totals.lucro / 1000).toFixed(1)}k`} trend={`+${Math.round(((totals.lucro / Math.max(1, totals.receita)) * 100))}% margem`} trendUp color={T.primary500} delay={0.15} />
            <KPI icon={CreditCard} label="Ticket médio" value={`R$ ${totals.ticketMedio}`} color={T.warning} delay={0.2} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <ChartCard title="Evolução do lucro" subtitle="Últimos 6 meses" delay={0.1}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={MONTHS_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.n200} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: T.n400 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.n400 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CTT />} />
                  <Bar dataKey="receita" fill={T.success} radius={[4, 4, 0, 0]} barSize={18} name="Receita" />
                  <Bar dataKey="despesa" fill={T.error} radius={[4, 4, 0, 0]} barSize={18} name="Despesa" opacity={0.6} />
                  <Bar dataKey="lucro" fill={T.primary500} radius={[4, 4, 0, 0]} barSize={18} name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Despesas por categoria" subtitle="Mês atual" delay={0.15}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {EXPENSE_CATS.map((c, i) => {
                  const pct = Math.round((c.value / Math.max(1, EXPENSE_CATS.reduce((a, x) => a + x.value, 0))) * 100)
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 12, color: T.n700 }}>{c.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>R$ {c.value.toLocaleString('pt-BR')} <span style={{ color: T.n400, fontWeight: 400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 5, background: T.n200, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: c.color, borderRadius: 3, transition: 'width 600ms ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Receita por forma de pagamento" subtitle="Mês atual" delay={0.2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <ResponsiveContainer width="40%" height={200}>
                <RPie><Pie data={BY_PAYMENT} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {BY_PAYMENT.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie><Tooltip content={<CTT />} /></RPie>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {BY_PAYMENT.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: T.n700 }}>{p.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ATTENDANCE */}
      {tab === 'attendance' && (
        <div style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
            <KPI icon={Activity} label="Total de atendimentos" value={totals.atendimentos} trend={`${totals.attTrend > 0 ? '+' : ''}${totals.attTrend}%`} trendUp={totals.attTrend > 0} color={T.primary500} delay={0.05} />
            <KPI icon={X} label="Cancelamentos" value={totals.cancelamentos} color={T.error} delay={0.1} />
            <KPI icon={AlertTriangle} label="No-show" value={totals.noShow} color={T.warning} delay={0.15} />
            <KPI icon={Clock} label="Ocupação média" value={`${totals.ocupacaoMedia}%`} color={T.success} delay={0.2} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <ChartCard title="Atendimentos por mês" subtitle="Últimos 6 meses" delay={0.1}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={MONTHS_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.n200} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: T.n400 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.n400 }} />
                  <Tooltip content={<CTT />} />
                  <Line type="monotone" dataKey="atendimentos" stroke={T.primary500} strokeWidth={2.5} dot={{ fill: T.primary500, r: 4, strokeWidth: 0 }} name="Atendimentos" />
                  <Line type="monotone" dataKey="cancelamentos" stroke={T.error} strokeWidth={2} dot={{ fill: T.error, r: 3, strokeWidth: 0 }} name="Cancelamentos" />
                  <Line type="monotone" dataKey="noShow" stroke={T.warning} strokeWidth={2} strokeDasharray="4 3" dot={{ fill: T.warning, r: 3, strokeWidth: 0 }} name="No-show" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Receita por serviço" subtitle="Mês atual" delay={0.15}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={BY_SERVICE.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.n400 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.n700 }} width={140} />
                  <Tooltip content={<CTT />} />
                  <Bar dataKey="receita" radius={[0, 6, 6, 0]} barSize={20} name="Receita">
                    {BY_SERVICE.slice(0, 5).map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ChartCard title="Ranking de profissionais" subtitle="Por volume de atendimentos" delay={0.2}>
              <div>
                {[...BY_PROFESSIONAL].sort((a, b) => b.atendimentos - a.atendimentos).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < BY_PROFESSIONAL.length - 1 ? `1px solid ${T.n100}` : 'none' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: i === 0 ? T.warning : T.n200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? T.n0 : T.n400 }}>{i + 1}</div>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: `${p.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color, fontWeight: 600, fontSize: 12, flexShrink: 0 }}>{getInitials(p.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: T.n400 }}>{p.pacientes} pacientes · {p.ocupacao}% ocupação</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{p.atendimentos}</div>
                      <div style={{ fontSize: 11, color: T.n400 }}>atend.</div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Mapa de calor" subtitle="Picos de atendimento por horário" delay={0.25}>
              <Heatmap data={WEEKLY_HEATMAP} />
            </ChartCard>
          </div>
        </div>
      )}

      {/* PATIENTS */}
      {tab === 'patients' && (
        <div style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
            <KPI icon={Users} label="Pacientes ativos" value={patients.filter(p => p.status === 'active' || !p.status).length} trend="+4.4%" trendUp color={T.primary500} delay={0.05} />
            <KPI icon={Plus} label="Novos no período" value={totals.novos} color={T.success} delay={0.1} />
            <KPI icon={TrendingDown} label="Inativos" value={patients.filter(p => p.status === 'inactive').length} color={T.n400} delay={0.15} />
            <KPI icon={Star} label="Taxa de retenção" value="92%" trend="+2%" trendUp color={T.warning} delay={0.2} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <ChartCard title="Evolução da base de pacientes" subtitle="Últimos 6 meses" delay={0.1}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={PATIENT_FLOW} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="gPat" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.primary500} stopOpacity={0.12} /><stop offset="95%" stopColor={T.primary500} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.n200} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: T.n400 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.n400 }} />
                  <Tooltip content={<CTT />} />
                  <Area type="monotone" dataKey="ativos" stroke={T.primary500} strokeWidth={2.5} fill="url(#gPat)" name="Ativos" dot={{ fill: T.primary500, r: 4, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="novos" stroke={T.success} strokeWidth={2} dot={{ fill: T.success, r: 3, strokeWidth: 0 }} name="Novos" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Novos pacientes por mês" subtitle="Aquisição mensal" delay={0.15}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={PATIENT_FLOW} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.n200} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: T.n400 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.n400 }} />
                  <Tooltip content={<CTT />} />
                  <Bar dataKey="novos" fill={T.success} radius={[4, 4, 0, 0]} barSize={24} name="Novos" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ChartCard title="Serviços mais procurados" subtitle="Por quantidade de atendimentos" delay={0.2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...BY_SERVICE].sort((a, b) => b.qtd - a.qtd).slice(0, 6).map((s, i) => {
                  const maxQtd = Math.max(1, BY_SERVICE[0]?.qtd || 1)
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: 2, background: s.color }} />
                          <span style={{ fontSize: 13, color: T.n700 }}>{s.name}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.qtd} <span style={{ fontWeight: 400, color: T.n400 }}>atend.</span></span>
                      </div>
                      <div style={{ height: 5, background: T.n200, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(s.qtd / maxQtd) * 100}%`, background: s.color, borderRadius: 3, transition: 'width 600ms ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </ChartCard>

            <ChartCard title="Indicadores de retenção" subtitle="Últimos 6 meses" delay={0.25}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Retorno em 30 dias', value: '78%', desc: 'Pacientes que retornam dentro de 1 mês', color: T.success },
                  { label: 'Retorno em 60 dias', value: '89%', desc: 'Pacientes que retornam dentro de 2 meses', color: T.primary500 },
                  { label: 'Abandono', value: '8%', desc: 'Pacientes que não retornam há 90+ dias', color: T.error },
                  { label: 'Frequência média', value: '3.2x', desc: 'Sessões por paciente por mês', color: T.warning },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '16px', background: T.n100, borderRadius: T.radiusMd, textAlign: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.value}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.n900 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: T.n400, marginTop: 4, lineHeight: 1.4 }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  )
}
