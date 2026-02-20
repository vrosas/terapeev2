import { useMemo } from 'react'
import {
  Users, Calendar, DollarSign, TrendingUp, MessageSquare, AlertCircle,
  Clock, CheckCircle2, ArrowUpRight, ArrowDownRight, UserPlus, CalendarClock,
  CreditCard, Send,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import { T } from '@/utils/theme'
import { useAppStore } from '@/lib/store'
import { useDashboardStats, useAppointments, useCharges } from '@/lib/hooks'
import { Card, StatCard, Badge, Avatar, LoadingSpinner, getInitials } from '@/components/ui'

export default function DashboardContent() {
  const { navigate } = useAppStore()
  const { stats, loading } = useDashboardStats()
  const { data: appointments } = useAppointments()
  const { data: charges } = useCharges()

  // Today's appointments
  const todayAppts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments
      .filter((a) => a.start_time?.startsWith(today))
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [appointments])

  // Recent charges
  const recentCharges = useMemo(() => charges.slice(0, 5), [charges])

  // Revenue chart data (last 6 months mock)
  const revenueChart = useMemo(() => {
    const months = ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev']
    return months.map((m, i) => ({
      name: m,
      receita: Math.round(6000 + Math.random() * 4000),
      despesa: Math.round(4000 + Math.random() * 2000),
    }))
  }, [])

  if (loading) return <LoadingSpinner />

  const s = stats || {}
  const profit = (s.month_revenue || 0) - (s.month_expenses || 0)

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeSlideUp 0.25s ease both' }}>
      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { icon: CalendarClock, label: 'Nova consulta', target: 'agenda', color: T.primary500 },
          { icon: UserPlus, label: 'Novo paciente', target: 'pacientes', color: T.success },
          { icon: CreditCard, label: 'Nova cobrança', target: 'financeiro', color: T.orange },
          { icon: Send, label: 'Enviar mensagem', target: 'mensagens', color: T.wa },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.target)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: T.radiusMd,
            border: `1.5px solid ${T.n300}`, background: T.n0,
            cursor: 'pointer', fontFamily: T.font, fontSize: 13,
            fontWeight: 500, color: T.n700, transition: 'all 150ms',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.color = a.color }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.n300; e.currentTarget.style.color = T.n700 }}
          >
            <a.icon size={15} /> {a.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Pacientes ativos" value={s.active_patients || 0} icon={Users} color={T.primary500} trend="+3 este mês" trendUp />
        <StatCard label="Consultas hoje" value={s.today_appointments || 0} icon={Calendar} color={T.success} />
        <StatCard label="Receita do mês" value={`R$ ${((s.month_revenue || 0) / 1000).toFixed(1)}k`} icon={DollarSign} color={T.success} trend="+12% vs anterior" trendUp />
        <StatCard label="Lucro líquido" value={`R$ ${(profit / 1000).toFixed(1)}k`} icon={TrendingUp} color={profit >= 0 ? T.success : T.error} />
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Left: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Revenue Chart */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Receita vs Despesas</h3>
                <p style={{ fontSize: 13, color: T.n400 }}>Últimos 6 meses</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.primary500} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={T.primary500} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={T.n200} />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: T.n400 }} axisLine={false} tickLine={false} />
                <YAxis fontSize={12} tick={{ fill: T.n400 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: `1px solid ${T.n200}`, boxShadow: T.shadowMd, fontFamily: T.font }}
                  formatter={(v) => [`R$ ${v.toLocaleString('pt-BR')}`, '']}
                />
                <Area type="monotone" dataKey="receita" stroke={T.primary500} fillOpacity={1} fill="url(#colorReceita)" strokeWidth={2} name="Receita" />
                <Area type="monotone" dataKey="despesa" stroke={T.error} fillOpacity={0.05} fill={T.error} strokeWidth={2} strokeDasharray="4 4" name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Charges */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Cobranças recentes</h3>
              <button onClick={() => navigate('financeiro')} style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontFamily: T.font, fontSize: 13, color: T.primary500, fontWeight: 500,
              }}>Ver todas →</button>
            </div>
            {recentCharges.map((ch) => {
              const statusColors = {
                paid: { bg: T.successBg, color: T.success, label: 'Pago' },
                pending: { bg: T.warningBg, color: T.warning, label: 'Pendente' },
                overdue: { bg: T.errorBg, color: T.error, label: 'Vencido' },
              }
              const st = statusColors[ch.status] || statusColors.pending
              return (
                <div key={ch.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: `1px solid ${T.n100}`,
                }}>
                  <Avatar name={ch.patient?.full_name || 'P'} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ch.patient?.full_name}
                    </div>
                    <div style={{ fontSize: 12, color: T.n400 }}>{ch.description}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>R$ {ch.amount?.toFixed(2)}</div>
                    <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
                  </div>
                </div>
              )
            })}
          </Card>
        </div>

        {/* Right: Today's Appointments + Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Today's Appointments */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Hoje</h3>
              <button onClick={() => navigate('agenda')} style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontFamily: T.font, fontSize: 13, color: T.primary500, fontWeight: 500,
              }}>Ver agenda →</button>
            </div>
            {todayAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: T.n400, fontSize: 14 }}>
                Nenhuma consulta hoje
              </div>
            ) : todayAppts.map((apt) => {
              const time = new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              const statusColors = {
                confirmed: T.success, scheduled: T.warning, completed: T.primary500,
                cancelled: T.error, no_show: T.n400, in_progress: T.info,
              }
              return (
                <div key={apt.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: `1px solid ${T.n100}`,
                }}>
                  <div style={{
                    width: 4, height: 40, borderRadius: 2,
                    background: apt.professional?.color || T.primary500,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{apt.patient?.full_name}</div>
                    <div style={{ fontSize: 12, color: T.n400 }}>
                      {time} • {apt.professional?.full_name}
                    </div>
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: statusColors[apt.status] || T.n300,
                  }} />
                </div>
              )
            })}
          </Card>

          {/* Alerts */}
          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Alertas</h3>
            {[
              s.overdue_charges > 0 && {
                icon: AlertCircle, color: T.error,
                text: `${s.overdue_charges} cobrança(s) vencida(s)`,
                action: () => navigate('financeiro'),
              },
              s.unread_conversations > 0 && {
                icon: MessageSquare, color: T.wa,
                text: `${s.unread_conversations} mensagem(ns) não lida(s)`,
                action: () => navigate('mensagens'),
              },
            ].filter(Boolean).map((alert, i) => (
              <button key={i} onClick={alert.action} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px', marginBottom: 8, borderRadius: T.radiusMd,
                border: 'none', background: `${alert.color}08`,
                cursor: 'pointer', fontFamily: T.font, textAlign: 'left',
              }}>
                <alert.icon size={18} color={alert.color} />
                <span style={{ fontSize: 13, fontWeight: 500, color: T.n900 }}>{alert.text}</span>
              </button>
            ))}
            {(!s.overdue_charges && !s.unread_conversations) && (
              <div style={{ textAlign: 'center', padding: 16, color: T.n400, fontSize: 13 }}>
                <CheckCircle2 size={20} color={T.success} style={{ marginBottom: 8 }} /><br />
                Tudo em dia!
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
