import { useState, useMemo } from 'react'
import { Activity, AlertTriangle, Clock, CreditCard, DollarSign, Download, Plus, Printer, Star, TrendingDown, TrendingUp, Users, X } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart as RPie, Pie, Cell,
  LineChart, Line,
} from 'recharts'
import { T } from '@/utils/theme'
import { Button, getInitials } from '@/components/ui'

/* ─── Mock Data (replace with Supabase aggregation views) ─── */
const MONTHS_DATA = [
  { month: 'Ago', receita: 22500, despesa: 8200, lucro: 14300, atendimentos: 142, novos: 8, cancelamentos: 6, noShow: 3 },
  { month: 'Set', receita: 19800, despesa: 7800, lucro: 12000, atendimentos: 128, novos: 5, cancelamentos: 8, noShow: 5 },
  { month: 'Out', receita: 25100, despesa: 9100, lucro: 16000, atendimentos: 158, novos: 12, cancelamentos: 5, noShow: 2 },
  { month: 'Nov', receita: 23400, despesa: 8600, lucro: 14800, atendimentos: 148, novos: 9, cancelamentos: 7, noShow: 4 },
  { month: 'Dez', receita: 28700, despesa: 10200, lucro: 18500, atendimentos: 172, novos: 14, cancelamentos: 4, noShow: 1 },
  { month: 'Jan', receita: 26200, despesa: 9400, lucro: 16800, atendimentos: 165, novos: 11, cancelamentos: 6, noShow: 3 },
]

const BY_PROFESSIONAL = [
  { name: 'Dra. Renata Oliveira', atendimentos: 68, receita: 12400, pacientes: 34, ocupacao: 85, color: T.primary500 },
  { name: 'Dr. Marcos Silva', atendimentos: 92, receita: 14800, pacientes: 28, ocupacao: 92, color: T.success },
  { name: 'Dra. Camila Santos', atendimentos: 55, receita: 8200, pacientes: 22, ocupacao: 72, color: T.warning },
  { name: 'Dr. André Costa', atendimentos: 42, receita: 6800, pacientes: 18, ocupacao: 65, color: '#9333EA' },
]

const BY_SERVICE = [
  { name: 'Psicoterapia Individual', qtd: 98, receita: 17640, color: T.primary500 },
  { name: 'Terapia de Casal', qtd: 72, receita: 10800, color: T.success },
  { name: 'Psicologia Infantil', qtd: 38, receita: 4940, color: T.warning },
  { name: 'Neuropsicologia', qtd: 28, receita: 4480, color: '#9333EA' },
  { name: 'Avaliação Psicológica', qtd: 12, receita: 5400, color: '#0D9488' },
]

const BY_PAYMENT = [
  { name: 'Pix', value: 35, color: '#0D9488' },
  { name: 'Cartão Crédito', value: 25, color: T.primary500 },
  { name: 'Convênio', value: 22, color: T.success },
  { name: 'Dinheiro', value: 10, color: T.warning },
  { name: 'Transferência', value: 8, color: '#9333EA' },
]

const BY_STATUS = [
  { name: 'Realizados', value: 165, color: T.success },
  { name: 'Cancelados', value: 6, color: T.error },
  { name: 'No-show', value: 3, color: T.warning },
  { name: 'Reagendados', value: 8, color: T.info },
]

const WEEKLY_HEATMAP = [
  { day: 'Seg', h7: 3, h8: 8, h9: 12, h10: 14, h11: 13, h14: 11, h15: 10, h16: 8, h17: 5 },
  { day: 'Ter', h7: 2, h8: 7, h9: 11, h10: 13, h11: 12, h14: 10, h15: 9, h16: 7, h17: 4 },
  { day: 'Qua', h7: 1, h8: 5, h9: 8, h10: 9, h11: 8, h14: 7, h15: 6, h16: 5, h17: 3 },
  { day: 'Qui', h7: 3, h8: 8, h9: 12, h10: 14, h11: 12, h14: 11, h15: 10, h16: 8, h17: 5 },
  { day: 'Sex', h7: 2, h8: 6, h9: 10, h10: 11, h11: 10, h14: 8, h15: 7, h16: 5, h17: 3 },
  { day: 'Sáb', h7: 0, h8: 4, h9: 7, h10: 8, h11: 6, h14: 0, h15: 0, h16: 0, h17: 0 },
]

const EXPENSE_CATS = [
  { name: 'Aluguel', value: 4500, color: T.primary500 },
  { name: 'Folha / Comissões', value: 2100, color: T.success },
  { name: 'Energia / Água', value: 860, color: T.warning },
  { name: 'Marketing', value: 600, color: T.error },
  { name: 'Software', value: 446, color: '#9333EA' },
  { name: 'Outros', value: 894, color: T.n400 },
]

const PATIENT_FLOW = [
  { month: 'Ago', novos: 8, ativos: 112, inativos: 5 },
  { month: 'Set', novos: 5, ativos: 115, inativos: 2 },
  { month: 'Out', novos: 12, ativos: 124, inativos: 3 },
  { month: 'Nov', novos: 9, ativos: 128, inativos: 5 },
  { month: 'Dez', novos: 14, ativos: 137, inativos: 5 },
  { month: 'Jan', novos: 11, ativos: 143, inativos: 5 },
]

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
function Heatmap() {
  const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
  const keys = ['h7', 'h8', 'h9', 'h10', 'h11', 'h14', 'h15', 'h16', 'h17']
  const maxVal = 14
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
        {WEEKLY_HEATMAP.map((row) => (
          <>{[null, ...keys].map((k, i) => {
            if (i === 0) return <div key={row.day} style={{ fontSize: 12, color: T.n700, fontWeight: 500, display: 'flex', alignItems: 'center' }}>{row.day}</div>
            const v = row[k]
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

  const totals = useMemo(() => {
    const r = MONTHS_DATA.reduce((a, m) => a + m.receita, 0)
    const d = MONTHS_DATA.reduce((a, m) => a + m.despesa, 0)
    const at = MONTHS_DATA.reduce((a, m) => a + m.atendimentos, 0)
    const nv = MONTHS_DATA.reduce((a, m) => a + m.novos, 0)
    const cn = MONTHS_DATA.reduce((a, m) => a + m.cancelamentos, 0)
    const ns = MONTHS_DATA.reduce((a, m) => a + m.noShow, 0)
    const last = MONTHS_DATA[MONTHS_DATA.length - 1]
    const prev = MONTHS_DATA[MONTHS_DATA.length - 2]
    const recTrend = prev.receita ? Math.round(((last.receita - prev.receita) / prev.receita) * 100) : 0
    const attTrend = prev.atendimentos ? Math.round(((last.atendimentos - prev.atendimentos) / prev.atendimentos) * 100) : 0
    return { receita: r, despesa: d, lucro: r - d, atendimentos: at, novos: nv, cancelamentos: cn, noShow: ns, recTrend, attTrend, ticketMedio: Math.round(r / at), ocupacaoMedia: Math.round(BY_PROFESSIONAL.reduce((a, p) => a + p.ocupacao, 0) / BY_PROFESSIONAL.length) }
  }, [])

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
              <Heatmap />
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
            <KPI icon={DollarSign} label="Lucro líquido" value={`R$ ${(totals.lucro / 1000).toFixed(1)}k`} trend={`+${Math.round(((totals.lucro / totals.receita) * 100))}% margem`} trendUp color={T.primary500} delay={0.15} />
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
                  const pct = Math.round((c.value / EXPENSE_CATS.reduce((a, x) => a + x.value, 0)) * 100)
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
                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.success }}>R$ {p.receita.toLocaleString('pt-BR')}</div>
                      <div style={{ fontSize: 11, color: T.n400 }}>receita</div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Mapa de calor" subtitle="Picos de atendimento por horário" delay={0.25}>
              <Heatmap />
            </ChartCard>
          </div>
        </div>
      )}

      {/* PATIENTS */}
      {tab === 'patients' && (
        <div style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
            <KPI icon={Users} label="Pacientes ativos" value={143} trend="+4.4%" trendUp color={T.primary500} delay={0.05} />
            <KPI icon={Plus} label="Novos no período" value={totals.novos} color={T.success} delay={0.1} />
            <KPI icon={TrendingDown} label="Inativos" value={25} color={T.n400} delay={0.15} />
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
                  const maxQtd = BY_SERVICE[0].qtd
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
