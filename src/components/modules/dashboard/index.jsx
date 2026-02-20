import { useState, useMemo } from 'react'
import {
  Calendar, Users, DollarSign, MessageSquare,
  TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, XCircle,
  ArrowUpRight, ArrowRight, MoreHorizontal, Video,
  CreditCard, RefreshCw, Timer, Check,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import { T } from '@/utils/theme'
import { StatCard } from '@/components/ui'
import { useDashboardStats, useAppointments, useCharges } from '@/lib/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/lib/store'

/* ─── Status Config ─── */
const STATUS_MAP = {
  pendente:     { label: 'Pendente',     color: T.warning,  bg: 'rgba(245,158,11,0.10)',  icon: Clock },
  confirmado:   { label: 'Confirmado',   color: T.success,  bg: 'rgba(22,163,74,0.10)',   icon: CheckCircle2 },
  cancelado:    { label: 'Cancelado',    color: T.error,    bg: 'rgba(220,38,38,0.10)',   icon: XCircle },
  reagendar:    { label: 'Reagendar',    color: '#F97316',  bg: 'rgba(249,115,22,0.10)',  icon: RefreshCw },
  sem_resposta: { label: 'Sem resposta', color: T.n400,     bg: 'rgba(201,205,216,0.15)', icon: Timer },
  realizado:    { label: 'Realizado',    color: T.info,     bg: 'rgba(37,99,235,0.10)',   icon: Check },
  completed:    { label: 'Realizado',    color: T.info,     bg: 'rgba(37,99,235,0.10)',   icon: Check },
  scheduled:    { label: 'Confirmado',   color: T.success,  bg: 'rgba(22,163,74,0.10)',   icon: CheckCircle2 },
  cancelled:    { label: 'Cancelado',    color: T.error,    bg: 'rgba(220,38,38,0.10)',   icon: XCircle },
  no_show:      { label: 'Faltou',       color: T.error,    bg: 'rgba(220,38,38,0.10)',   icon: XCircle },
}

/* ─── Demo Data (fallback) ─── */
const DEMO_APPOINTMENTS = [
  { id: 1, start_time: '2025-01-20T08:00', patient: { full_name: 'Maria Silva' }, professional: { full_name: 'Dra. Ana Costa' }, service_type: 'Psicoterapia', session_type: 'presencial', status: 'confirmado', duration_minutes: 50 },
  { id: 2, start_time: '2025-01-20T09:00', patient: { full_name: 'João Pereira' }, professional: { full_name: 'Dr. Carlos Lima' }, service_type: 'Fisioterapia', session_type: 'online', status: 'pendente', duration_minutes: 45 },
  { id: 3, start_time: '2025-01-20T09:30', patient: { full_name: 'Lucia Fernandes' }, professional: { full_name: 'Dra. Beatriz Rocha' }, service_type: 'Fonoaudiologia', session_type: 'presencial', status: 'confirmado', duration_minutes: 30 },
  { id: 4, start_time: '2025-01-20T10:00', patient: { full_name: 'Pedro Santos' }, professional: { full_name: 'Dra. Ana Costa' }, service_type: 'Psicoterapia', session_type: 'presencial', status: 'sem_resposta', duration_minutes: 50 },
  { id: 5, start_time: '2025-01-20T11:00', patient: { full_name: 'Ana Oliveira' }, professional: { full_name: 'Dr. Ricardo Alves' }, service_type: 'Terapia Ocupacional', session_type: 'presencial', status: 'confirmado', duration_minutes: 45 },
  { id: 6, start_time: '2025-01-20T14:00', patient: { full_name: 'Roberto Gomes' }, professional: { full_name: 'Dra. Ana Costa' }, service_type: 'Psicoterapia', session_type: 'online', status: 'pendente', duration_minutes: 50 },
  { id: 7, start_time: '2025-01-20T15:00', patient: { full_name: 'Fernanda Dias' }, professional: { full_name: 'Dr. Carlos Lima' }, service_type: 'Fisioterapia', session_type: 'presencial', status: 'cancelado', duration_minutes: 45 },
  { id: 8, start_time: '2025-01-20T16:00', patient: { full_name: 'Marcos Ribeiro' }, professional: { full_name: 'Dra. Beatriz Rocha' }, service_type: 'Fonoaudiologia', session_type: 'presencial', status: 'reagendar', duration_minutes: 30 },
]

const DEMO_REVENUE_CHART = [
  { month: 'Jul', receita: 18200, meta: 20000 },
  { month: 'Ago', receita: 22500, meta: 20000 },
  { month: 'Set', receita: 19800, meta: 22000 },
  { month: 'Out', receita: 25100, meta: 22000 },
  { month: 'Nov', receita: 23400, meta: 24000 },
  { month: 'Dez', receita: 28700, meta: 24000 },
  { month: 'Jan', receita: 26200, meta: 26000 },
]

const DEMO_WEEKLY = [
  { day: 'Seg', total: 18, confirmados: 14 },
  { day: 'Ter', total: 22, confirmados: 19 },
  { day: 'Qua', total: 16, confirmados: 12 },
  { day: 'Qui', total: 24, confirmados: 20 },
  { day: 'Sex', total: 20, confirmados: 17 },
  { day: 'Sáb', total: 8, confirmados: 7 },
]

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pendente
  const Icon = s.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px',
      borderRadius: 20, background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <Icon size={12} />
      {s.label}
    </span>
  )
}

/* ─── Appointment Row ─── */
function AppointmentRow({ apt, idx }) {
  const time = apt.start_time
    ? new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : apt.time || '--:--'
  const duration = apt.duration_minutes || apt.duration || 50
  const patientName = apt.patient?.full_name || apt.patient_name || 'Paciente'
  const profName = apt.professional?.full_name || apt.professional_name || ''
  const service = apt.service_type || apt.service || ''
  const isOnline = apt.session_type === 'online' || apt.type === 'online'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
      borderBottom: `1px solid ${T.n100}`, transition: 'background 150ms',
      opacity: apt.status === 'cancelado' || apt.status === 'cancelled' ? 0.5 : 1,
      animation: `fadeSlideUp 0.35s ease ${idx * 0.04}s both`,
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.n100 }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
      <div style={{ width: 52, flexShrink: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.n900 }}>{time}</div>
        <div style={{ fontSize: 11, color: T.n400 }}>{duration}min</div>
      </div>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
        background: STATUS_MAP[apt.status]?.color || T.n400,
        boxShadow: `0 0 0 3px ${STATUS_MAP[apt.status]?.bg || T.n200}`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: T.n900, display: 'flex', alignItems: 'center', gap: 8 }}>
          {patientName}
          {isOnline && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11,
              color: T.info, background: 'rgba(37,99,235,0.08)', padding: '2px 6px',
              borderRadius: 4, fontWeight: 500,
            }}><Video size={10} /> Online</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: T.n400, marginTop: 2 }}>
          {[service, profName].filter(Boolean).join(' · ')}
        </div>
      </div>
      <StatusBadge status={apt.status} />
      <button style={{
        width: 32, height: 32, borderRadius: 6, border: 'none',
        background: 'transparent', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: T.n400,
        transition: 'all 150ms',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = T.n200; e.currentTarget.style.color = T.n700 }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.n400 }}>
        <MoreHorizontal size={16} />
      </button>
    </div>
  )
}

/* ─── Chart Tooltip ─── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const LABELS = { receita: 'Receita', meta: 'Meta', confirmados: 'Confirmados', total: 'Total' }
  return (
    <div style={{
      background: T.n0, border: `1px solid ${T.n200}`, borderRadius: T.radiusMd,
      padding: '10px 14px', boxShadow: T.shadowMd, fontSize: 12,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: T.n900 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.n700, marginTop: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          {LABELS[p.name] || p.name}:
          <strong>{p.name === 'receita' || p.name === 'meta' ? `R$ ${p.value.toLocaleString('pt-BR')}` : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════ DASHBOARD ═══════════════ */
export default function Dashboard() {
  const { profile, isDemo } = useAuth()
  const { navigate } = useAppStore()
  const { stats } = useDashboardStats()

  const today = new Date().toISOString().split('T')[0]
  const { data: rawAppointments } = useAppointments({
    filters: [
      { column: 'start_time', op: 'gte', value: `${today}T00:00:00` },
      { column: 'start_time', op: 'lte', value: `${today}T23:59:59` },
    ],
  })

  const { data: rawOverdue } = useCharges({
    filters: [{ column: 'status', value: 'overdue' }],
  })

  const appointments = rawAppointments?.length ? rawAppointments : (isDemo ? DEMO_APPOINTMENTS : [])
  const overdue = rawOverdue?.length ? rawOverdue : (isDemo ? [
    { id: 1, patient: { full_name: 'Carlos Mendes' }, amount: 350, due_date: '2025-01-10', description: 'Psicoterapia (4 sessões)' },
    { id: 2, patient: { full_name: 'Patrícia Lopes' }, amount: 180, due_date: '2025-01-08', description: 'Fisioterapia' },
    { id: 3, patient: { full_name: 'Ricardo Tavares' }, amount: 520, due_date: '2025-01-03', description: 'Plano mensal' },
  ] : [])

  const todayTotal = appointments.length
  const confirmed = appointments.filter((a) => a.status === 'confirmado' || a.status === 'scheduled').length
  const pending = appointments.filter((a) => a.status === 'pendente' || a.status === 'sem_resposta').length
  const overdueTotal = overdue.reduce((sum, c) => sum + (c.amount || 0), 0)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const userName = profile?.full_name || 'Dr. Rafael'

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1280 }}>
      {/* Page header */}
      <div style={{ marginBottom: 28, animation: 'fadeSlideUp 0.35s ease both' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.n900, letterSpacing: '-0.01em' }}>
          {greeting}, {userName} 👋
        </h1>
        <p style={{ fontSize: 14, color: T.n400, marginTop: 4 }}>
          Aqui está o resumo da sua clínica para hoje
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Calendar} label="Consultas hoje" value={todayTotal}
          subtext={`${confirmed} confirmadas · ${pending} pendentes`}
          color={T.primary500} delay={0.05} />
        <StatCard icon={CreditCard} label="Cobranças abertas" value={`R$ ${(stats?.month_revenue || 4280).toLocaleString('pt-BR')}`}
          subtext={`${stats?.overdue_charges || 12} faturas em aberto`} trend="+8%" trendUp
          color={T.warning} delay={0.1} />
        <StatCard icon={AlertCircle} label="Cobranças atrasadas" value={`R$ ${overdueTotal.toLocaleString('pt-BR')}`}
          subtext={`${overdue.length} faturas vencidas`}
          color={T.error} delay={0.15} />
        <StatCard icon={CheckCircle2} label="Taxa de confirmação"
          value={todayTotal > 0 ? `${Math.round((confirmed / todayTotal) * 100)}%` : '0%'}
          subtext="Últimos 30 dias" trend="+5%" trendUp
          color={T.success} delay={0.2} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Today's appointments */}
          <div style={{
            background: T.n0, borderRadius: T.radiusLg, boxShadow: T.shadowSoft,
            border: `1px solid ${T.n200}`, overflow: 'hidden',
            animation: 'fadeSlideUp 0.4s ease 0.15s both',
          }}>
            <div style={{
              padding: '18px 20px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', borderBottom: `1px solid ${T.n200}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>Consultas de hoje</h2>
                <span style={{
                  background: T.primary50, color: T.primary500, fontSize: 12,
                  fontWeight: 600, padding: '3px 9px', borderRadius: 10,
                }}>{todayTotal}</span>
              </div>
              <button onClick={() => navigate('agenda')} style={{
                display: 'flex', alignItems: 'center', gap: 5, border: 'none',
                background: 'transparent', cursor: 'pointer', fontFamily: T.font,
                fontSize: 13, fontWeight: 500, color: T.primary500, padding: '6px 10px',
                borderRadius: 6, transition: 'background 150ms',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.primary50 }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                Ver agenda <ArrowRight size={14} />
              </button>
            </div>
            <div>
              {appointments.map((apt, i) => (
                <AppointmentRow key={apt.id} apt={apt} idx={i} />
              ))}
              {appointments.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: T.n400, fontSize: 14 }}>
                  Nenhuma consulta agendada para hoje
                </div>
              )}
            </div>
          </div>

          {/* Revenue chart */}
          <div style={{
            background: T.n0, borderRadius: T.radiusLg, boxShadow: T.shadowSoft,
            border: `1px solid ${T.n200}`, padding: '20px 24px',
            animation: 'fadeSlideUp 0.4s ease 0.25s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>Receita mensal</h2>
                <div style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>Últimos 7 meses</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.n900, letterSpacing: '-0.01em' }}>
                  R$ {(stats?.month_revenue || 26200).toLocaleString('pt-BR')}
                </div>
                <div style={{ fontSize: 12, color: T.success, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                  <TrendingUp size={12} /> +12% vs mês anterior
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={DEMO_REVENUE_CHART} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="grad_receita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.primary500} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={T.primary500} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={T.n200} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: T.n400 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.n400 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="meta" stroke={T.n300} strokeWidth={2}
                  strokeDasharray="6 3" fill="none" dot={false} />
                <Area type="monotone" dataKey="receita" stroke={T.primary500} strokeWidth={2.5}
                  fill="url(#grad_receita)" dot={{ fill: T.primary500, r: 4, strokeWidth: 0 }}
                  activeDot={{ fill: T.primary500, r: 6, stroke: T.n0, strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n400 }}>
                <div style={{ width: 12, height: 3, borderRadius: 2, background: T.primary500 }} /> Receita
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n400 }}>
                <div style={{ width: 12, height: 3, borderRadius: 2, background: T.n300 }} /> Meta
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Weekly chart */}
          <div style={{
            background: T.n0, borderRadius: T.radiusLg, boxShadow: T.shadowSoft,
            border: `1px solid ${T.n200}`, padding: '20px 24px',
            animation: 'fadeSlideUp 0.4s ease 0.2s both',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Agenda da semana</h2>
            <div style={{ fontSize: 13, color: T.n400, marginBottom: 16 }}>Agendamentos por dia</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={DEMO_WEEKLY} barGap={4} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: T.n400 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.n400 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill={T.n200} radius={[4, 4, 0, 0]} barSize={22} />
                <Bar dataKey="confirmados" fill={T.primary500} radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n400 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: T.n200 }} /> Total
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.n400 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: T.primary500 }} /> Confirmados
              </div>
            </div>
          </div>

          {/* Overdue invoices */}
          <div style={{
            background: T.n0, borderRadius: T.radiusLg, boxShadow: T.shadowSoft,
            border: `1px solid ${T.n200}`, overflow: 'hidden',
            animation: 'fadeSlideUp 0.4s ease 0.3s both',
          }}>
            <div style={{
              padding: '18px 20px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', borderBottom: `1px solid ${T.n200}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>Cobranças atrasadas</h2>
                <span style={{
                  background: 'rgba(220,38,38,0.08)', color: T.error, fontSize: 12,
                  fontWeight: 600, padding: '3px 9px', borderRadius: 10,
                }}>{overdue.length}</span>
              </div>
            </div>
            {overdue.map((inv, i) => (
              <div key={inv.id || i} style={{
                padding: '14px 20px', borderBottom: `1px solid ${T.n100}`,
                display: 'flex', alignItems: 'center', gap: 12, transition: 'background 150ms',
                cursor: 'pointer',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.n100 }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: 'rgba(220,38,38,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <DollarSign size={16} color={T.error} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.n900 }}>
                    {inv.patient?.full_name || inv.patient_name || 'Paciente'}
                  </div>
                  <div style={{ fontSize: 12, color: T.n400, marginTop: 1 }}>
                    {inv.description || inv.service || ''} · Venc. {inv.due_date ? new Date(inv.due_date).toLocaleDateString('pt-BR') : ''}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.error, flexShrink: 0 }}>
                  R$ {(inv.amount || 0).toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
            {overdue.length === 0 && (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: T.n400, fontSize: 14 }}>
                Nenhuma cobrança atrasada 🎉
              </div>
            )}
            <div onClick={() => navigate('financeiro')} style={{
              padding: '12px 20px', textAlign: 'center', fontSize: 13,
              color: T.primary500, fontWeight: 500, cursor: 'pointer',
              transition: 'background 150ms',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.n100 }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
              Ver todas as cobranças →
            </div>
          </div>

          {/* Quick actions */}
          <div style={{
            background: T.n0, borderRadius: T.radiusLg, boxShadow: T.shadowSoft,
            border: `1px solid ${T.n200}`, padding: 20,
            animation: 'fadeSlideUp 0.4s ease 0.35s both',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Ações rápidas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: Calendar, label: 'Novo agendamento', color: T.primary500, page: 'agenda' },
                { icon: Users, label: 'Cadastrar paciente', color: T.success, page: 'pacientes' },
                { icon: DollarSign, label: 'Gerar fatura', color: T.warning, page: 'financeiro' },
                { icon: MessageSquare, label: 'Enviar mensagem', color: T.info, page: 'mensagens' },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(action.page)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: T.radiusMd, border: `1px solid ${T.n200}`,
                  background: T.n0, cursor: 'pointer', fontFamily: T.font,
                  fontSize: 13, fontWeight: 500, color: T.n900, transition: 'all 150ms',
                  width: '100%', textAlign: 'left',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.n100; e.currentTarget.style.borderColor = T.n300 }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = T.n0; e.currentTarget.style.borderColor = T.n200 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${action.color}12`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <action.icon size={15} color={action.color} />
                  </div>
                  {action.label}
                  <ArrowUpRight size={14} color={T.n400} style={{ marginLeft: 'auto' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
