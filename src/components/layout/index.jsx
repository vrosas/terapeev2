import { useState, useEffect, useRef, useMemo } from 'react'
import {
  LayoutDashboard, Calendar, Users, FileText, DollarSign, Award,
  MessageSquare, Activity, Settings, ChevronLeft, ChevronRight,
  Search, Bell, ArrowLeft, ArrowRight, User, CalendarClock,
  UserPlus, CreditCard, Send, X, CheckCircle2, XCircle, AlertCircle,
  Wifi, LogOut,
} from 'lucide-react'
import { T, MODULE_LABELS } from '@/utils/theme'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/lib/hooks'
import { getInitials } from '@/components/ui'

// ═══ NAV CONFIG ═══
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'pacientes', label: 'Pacientes', icon: Users },
  { id: 'prontuarios', label: 'Prontuários', icon: FileText },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'profissionais', label: 'Profissionais', icon: Award },
  { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
  { id: 'relatorios', label: 'Relatórios', icon: Activity },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
]

// ═══ SIDEBAR ═══
export function AppSidebar() {
  const { currentPage, sidebarCollapsed, navigate, toggleSidebar } = useAppStore()
  const w = sidebarCollapsed ? 72 : 240

  return (
    <aside style={{
      width: w, height: '100vh', background: T.n0,
      borderRight: `1px solid ${T.n200}`, display: 'flex', flexDirection: 'column',
      transition: 'width 250ms cubic-bezier(0.4,0,0.2,1)',
      position: 'fixed', left: 0, top: 0, zIndex: 50, overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: sidebarCollapsed ? '20px 0' : '20px 20px',
        display: 'flex', alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        gap: 10, height: 64, borderBottom: `1px solid ${T.n200}`,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, background: T.primary500,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.n0, fontWeight: 700, fontSize: 16, flexShrink: 0,
        }}>T</div>
        {!sidebarCollapsed && <span style={{ fontWeight: 700, fontSize: 18, color: T.n900 }}>Terapee</span>}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((item) => {
          const isActive = item.id === currentPage
          const Icon = item.icon
          return (
            <button key={item.id} onClick={() => navigate(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: sidebarCollapsed ? '11px 0' : '11px 14px',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                borderRadius: T.radiusMd, border: 'none', cursor: 'pointer',
                background: isActive ? T.primary50 : 'transparent',
                color: isActive ? T.primary500 : T.n700,
                fontFamily: T.font, fontSize: 14,
                fontWeight: isActive ? 600 : 400, transition: 'all 150ms',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = T.n100 }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? T.primary50 : 'transparent' }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && item.label}
            </button>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: '8px 8px 12px', borderTop: `1px solid ${T.n200}` }}>
        <button onClick={toggleSidebar} style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: sidebarCollapsed ? '11px 0' : '11px 14px',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          borderRadius: T.radiusMd, border: 'none', cursor: 'pointer',
          background: 'transparent', color: T.n400, fontFamily: T.font, fontSize: 13,
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.n100}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> Recolher</>}
        </button>
      </div>
    </aside>
  )
}

// ═══ HEADER ═══
export function AppHeader() {
  const { currentPage, navHistory, goBack, setSearchOpen, notifOpen, setNotifOpen, navigate } = useAppStore()
  const { signOut, profile } = useAuth()
  const { data: notifications } = useNotifications()
  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <header style={{
      height: 64, background: T.n0, borderBottom: `1px solid ${T.n200}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {navHistory.length > 1 && currentPage !== 'dashboard' && (
          <button onClick={goBack} style={{
            width: 32, height: 32, borderRadius: T.radiusMd,
            border: `1px solid ${T.n200}`, background: T.n0,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.n700, transition: 'all 150ms',
          }}>
            <ArrowLeft size={16} />
          </button>
        )}
        <span style={{ fontSize: 15, fontWeight: 600 }}>{MODULE_LABELS[currentPage] || currentPage}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search trigger */}
        <button onClick={() => setSearchOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 14px', borderRadius: T.radiusMd,
          border: `1px solid ${T.n200}`, background: T.n100,
          cursor: 'pointer', fontFamily: T.font, fontSize: 13, color: T.n400,
          transition: 'all 150ms', minWidth: 200,
        }}>
          <Search size={15} /> Buscar...
          <kbd style={{
            marginLeft: 'auto', padding: '2px 6px', borderRadius: 3,
            background: T.n0, border: `1px solid ${T.n200}`,
            fontSize: 10, fontFamily: 'monospace',
          }}>⌘K</kbd>
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setNotifOpen(!notifOpen)} style={{
            width: 38, height: 38, borderRadius: T.radiusMd, border: 'none',
            background: notifOpen ? T.n100 : 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'background 150ms',
          }}>
            <Bell size={19} color={T.n700} />
            {unread > 0 && (
              <div style={{
                position: 'absolute', top: 7, right: 7, width: 8, height: 8,
                borderRadius: '50%', background: T.error, border: `2px solid ${T.n0}`,
              }} />
            )}
          </button>
          <NotificationCenter
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            notifications={notifications}
            onNavigate={(target) => { navigate(target); setNotifOpen(false) }}
          />
        </div>

        <div style={{ width: 1, height: 28, background: T.n200 }} />

        {/* User avatar / logout */}
        <button onClick={signOut} title="Sair" style={{
          width: 34, height: 34, borderRadius: '50%',
          background: `linear-gradient(135deg, ${T.primary500}, ${T.primary600})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.n0, fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none',
        }}>
          {getInitials(profile?.full_name || 'U')}
        </button>
      </div>
    </header>
  )
}

// ═══ NOTIFICATION CENTER ═══
function NotificationCenter({ open, onClose, notifications, onNavigate }) {
  if (!open) return null

  const iconMap = {
    appointment: { icon: CheckCircle2, color: T.success },
    financial: { icon: DollarSign, color: T.success },
    message: { icon: MessageSquare, color: T.wa },
    system: { icon: Wifi, color: T.wa },
    alert: { icon: AlertCircle, color: T.warning },
  }

  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 89 }} />
      <div style={{
        position: 'absolute', top: 52, right: 0, width: 380,
        background: T.n0, borderRadius: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
        border: `1px solid ${T.n200}`, zIndex: 90, overflow: 'hidden',
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${T.n200}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Notificações</span>
            {unread > 0 && (
              <span style={{
                padding: '2px 8px', borderRadius: 10,
                background: T.error, color: T.n0, fontSize: 11, fontWeight: 600,
              }}>{unread}</span>
            )}
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 6, border: 'none',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} color={T.n400} />
          </button>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {notifications.map((n) => {
            const cfg = iconMap[n.type] || iconMap.alert
            const Icon = cfg.icon
            const timeAgo = getRelativeTime(n.created_at)
            return (
              <button key={n.id}
                onClick={() => onNavigate(n.target_module)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 20px', border: 'none',
                  background: n.is_read ? 'transparent' : `${T.primary500}06`,
                  cursor: 'pointer', fontFamily: T.font, textAlign: 'left',
                  borderBottom: `1px solid ${T.n100}`, transition: 'background 100ms',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = T.n100}
                onMouseLeave={(e) => e.currentTarget.style.background = n.is_read ? 'transparent' : `${T.primary500}06`}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${cfg.color}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 2,
                }}>
                  <Icon size={16} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600, color: T.n900 }}>{n.title}</span>
                    {!n.is_read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.primary500, flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 12, color: T.n500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.description}
                  </div>
                  <div style={{ fontSize: 11, color: T.n400, marginTop: 4 }}>{timeAgo}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ═══ GLOBAL SEARCH ═══
export function GlobalSearch() {
  const { searchOpen, setSearchOpen, navigate } = useAppStore()
  const [q, setQ] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { if (searchOpen && inputRef.current) inputRef.current.focus() }, [searchOpen])
  useEffect(() => { if (!searchOpen) setQ('') }, [searchOpen])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape' && searchOpen) setSearchOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [searchOpen, setSearchOpen])

  if (!searchOpen) return null

  const ITEMS = [
    ...NAV.map((n) => ({ id: n.id, type: 'module', label: n.label, icon: n.icon, target: n.id, desc: MODULE_LABELS[n.id] })),
    { id: 'a1', type: 'action', label: 'Nova consulta', icon: CalendarClock, target: 'agenda', desc: 'Agendar nova consulta' },
    { id: 'a2', type: 'action', label: 'Novo paciente', icon: UserPlus, target: 'pacientes', desc: 'Cadastrar paciente' },
    { id: 'a3', type: 'action', label: 'Nova cobrança', icon: CreditCard, target: 'financeiro', desc: 'Registrar cobrança' },
    { id: 'a4', type: 'action', label: 'Enviar mensagem', icon: Send, target: 'mensagens', desc: 'WhatsApp para paciente' },
  ]

  const filtered = q.trim()
    ? ITEMS.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()) || i.desc.toLowerCase().includes(q.toLowerCase()))
    : ITEMS.slice(0, 8)

  const grouped = {}
  filtered.forEach((i) => {
    const k = i.type === 'module' ? 'Módulos' : 'Ações rápidas'
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(i)
  })

  return (
    <div onClick={() => setSearchOpen(false)} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)', zIndex: 999,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 560, background: T.n0, borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${T.n200}` }}>
          <Search size={20} color={T.n400} />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar módulos, pacientes, ações..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, fontFamily: T.font, color: T.n900, background: 'transparent' }}
          />
          <kbd style={{ padding: '3px 8px', borderRadius: 4, background: T.n100, border: `1px solid ${T.n200}`, fontSize: 11, color: T.n400, fontFamily: 'monospace' }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div style={{ padding: '8px 20px 4px', fontSize: 11, fontWeight: 600, color: T.n400, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group}</div>
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <button key={item.id}
                    onClick={() => { navigate(item.target); setSearchOpen(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 20px', border: 'none', background: 'transparent',
                      cursor: 'pointer', fontFamily: T.font, textAlign: 'left', transition: 'background 100ms',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = T.n100}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: item.type === 'module' ? T.primary50 : `${T.warning}14`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} color={item.type === 'module' ? T.primary500 : T.warning} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: T.n400 }}>{item.desc}</div>
                    </div>
                    <ArrowRight size={14} color={T.n300} />
                  </button>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: T.n400, fontSize: 14 }}>
              Nenhum resultado para "{q}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══ Helper: relative time ═══
function getRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  return `há ${days}d`
}
