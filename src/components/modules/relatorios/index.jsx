import { useMemo } from 'react'
import { Activity, Users, Calendar, DollarSign, TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { T } from '@/utils/theme'
import { useAppointments, useCharges, usePatients, useProfessionals, useExpenses } from '@/lib/hooks'
import { Card, StatCard, LoadingSpinner } from '@/components/ui'

export default function RelatoriosContent() {
  const { data: appointments, loading: lA } = useAppointments()
  const { data: charges, loading: lC } = useCharges()
  const { data: patients } = usePatients()
  const { data: professionals } = useProfessionals()
  const { data: expenses } = useExpenses()

  const stats = useMemo(() => {
    const completed = appointments.filter(a => a.status === 'completed').length
    const cancelled = appointments.filter(a => a.status === 'cancelled').length
    const noShow = appointments.filter(a => a.status === 'no_show').length
    const total = appointments.length
    const attendRate = total > 0 ? ((completed / Math.max(completed + cancelled + noShow, 1)) * 100).toFixed(0) : 0
    const revenue = charges.filter(c => c.status === 'paid').reduce((s, c) => s + (c.amount || 0), 0)
    const avgTicket = completed > 0 ? revenue / completed : 0
    return { completed, cancelled, noShow, total, attendRate, revenue, avgTicket, totalPatients: patients.filter(p => p.status === 'active').length }
  }, [appointments, charges, patients])

  // Appointments by professional
  const aptsByProf = useMemo(() => {
    const map = {}
    appointments.forEach(a => { const name = a.professional?.full_name || 'N/A'; map[name] = (map[name] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name: name.split(' ').slice(0, 2).join(' '), value }))
  }, [appointments])

  // Revenue by month
  const revenueByMonth = useMemo(() => {
    const map = {}
    charges.filter(c => c.status === 'paid' && c.paid_at).forEach(c => {
      const m = new Date(c.paid_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      map[m] = (map[m] || 0) + (c.amount || 0)
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).slice(-6)
  }, [charges])

  // Status distribution
  const statusDist = useMemo(() => [
    { name: 'Concluídas', value: stats.completed, color: T.success },
    { name: 'Canceladas', value: stats.cancelled, color: T.error },
    { name: 'Faltas', value: stats.noShow, color: T.n400 },
    { name: 'Agendadas', value: appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length, color: T.primary500 },
  ].filter(d => d.value > 0), [appointments, stats])

  // Patients by therapy type
  const byTherapy = useMemo(() => {
    const map = {}
    patients.filter(p => p.status === 'active').forEach(p => { const t = p.therapy_type || 'Outros'; map[t] = (map[t] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [patients])

  const COLORS = [T.primary500, T.purple, T.orange, T.pink, T.teal, T.warning]

  if (lA || lC) return <LoadingSpinner />

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeSlideUp 0.25s ease both' }}>
      <div style={{ marginBottom: 24 }}><h2 style={{ fontSize: 20, fontWeight: 700 }}>Relatórios</h2><p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>Métricas e indicadores da clínica</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Pacientes ativos" value={stats.totalPatients} icon={Users} color={T.primary500} />
        <StatCard label="Consultas realizadas" value={stats.completed} icon={Calendar} color={T.success} />
        <StatCard label="Taxa de presença" value={`${stats.attendRate}%`} icon={TrendingUp} color={parseInt(stats.attendRate) >= 80 ? T.success : T.warning} />
        <StatCard label="Ticket médio" value={`R$ ${stats.avgTicket.toFixed(0)}`} icon={DollarSign} color={T.primary500} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue chart */}
        <Card>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={16} color={T.primary500} /> Receita por mês</h4>
          {revenueByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByMonth}><CartesianGrid strokeDasharray="3 3" stroke={T.n200} /><XAxis dataKey="name" fontSize={11} tick={{ fill: T.n400 }} /><YAxis fontSize={11} tick={{ fill: T.n400 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} /><Tooltip formatter={v => `R$ ${v.toLocaleString('pt-BR')}`} contentStyle={{ borderRadius: 8, fontFamily: T.font }} /><Bar dataKey="value" fill={T.primary500} radius={[4, 4, 0, 0]} name="Receita" /></BarChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', padding: 40, color: T.n400 }}>Sem dados</div>}
        </Card>

        {/* Appointment status */}
        <Card>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><PieIcon size={16} color={T.purple} /> Status das consultas</h4>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={statusDist} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>{statusDist.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', padding: 40, color: T.n400 }}>Sem dados</div>}
        </Card>

        {/* Appointments by professional */}
        <Card>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Consultas por profissional</h4>
          {aptsByProf.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={aptsByProf} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={T.n200} /><XAxis type="number" fontSize={11} tick={{ fill: T.n400 }} /><YAxis type="category" dataKey="name" fontSize={11} tick={{ fill: T.n400 }} width={100} /><Tooltip contentStyle={{ borderRadius: 8, fontFamily: T.font }} /><Bar dataKey="value" fill={T.purple} radius={[0, 4, 4, 0]} name="Consultas" /></BarChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', padding: 40, color: T.n400 }}>Sem dados</div>}
        </Card>

        {/* Patients by therapy */}
        <Card>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Pacientes por tipo de terapia</h4>
          {byTherapy.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={byTherapy} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={11}>{byTherapy.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', padding: 40, color: T.n400 }}>Sem dados</div>}
        </Card>
      </div>
    </div>
  )
}
