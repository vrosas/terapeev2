import { useState } from 'react'
import { X, AlertCircle, Loader2 } from 'lucide-react'
import { T } from '@/utils/theme'

// ═══ Badge ═══
export function Badge({ children, color, bg, onClick, size = 'sm' }) {
  const sizes = {
    sm: { padding: '4px 10px', fontSize: 12 },
    md: { padding: '5px 12px', fontSize: 13 },
  }
  return (
    <span onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      ...sizes[size], borderRadius: 20, background: bg, color,
      fontWeight: 500, whiteSpace: 'nowrap',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      {children}
    </span>
  )
}

// ═══ Toggle ═══
export function Toggle({ value, onChange, disabled }) {
  return (
    <button onClick={() => !disabled && onChange(!value)} style={{
      width: 42, height: 24, borderRadius: 12, border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: value ? T.primary500 : T.n300,
      position: 'relative', transition: 'background 200ms',
      flexShrink: 0, opacity: disabled ? 0.5 : 1,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: T.n0,
        position: 'absolute', top: 2, left: value ? 20 : 2,
        transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  )
}

// ═══ Input Field ═══
export function InputField({ label, icon: Icon, type = 'text', placeholder, value, onChange, error, right, disabled, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 6 }}>
          {label} {required && <span style={{ color: T.error }}>*</span>}
        </label>
      )}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        border: `1.5px solid ${error ? T.error : focused ? T.primary500 : T.n300}`,
        borderRadius: T.radiusMd, background: disabled ? T.n100 : T.n0,
        transition: 'all 200ms', overflow: 'hidden',
        boxShadow: error ? '0 0 0 3px rgba(220,38,38,0.12)' : focused ? T.focusRing : 'none',
      }}>
        {Icon && <span style={{ paddingLeft: 14, color: T.n400, display: 'flex', flexShrink: 0 }}><Icon size={18} /></span>}
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          disabled={disabled}
          style={{
            flex: 1, border: 'none', outline: 'none', padding: '12px 14px',
            fontSize: 14, fontFamily: 'inherit', color: disabled ? T.n400 : T.n900,
            background: 'transparent', cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        {right}
      </div>
      {error && (
        <div style={{ fontSize: 12, color: T.error, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  )
}

// ═══ Select Field ═══
export function SelectField({ label, value, onChange, options, placeholder, disabled, required }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 6 }}>
          {label} {required && <span style={{ color: T.error }}>*</span>}
        </label>
      )}
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} style={{
        width: '100%', padding: '10px 12px',
        border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd,
        fontSize: 14, fontFamily: T.font, color: value ? T.n900 : T.n400,
        outline: 'none', background: disabled ? T.n100 : T.n0,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

// ═══ TextArea ═══
export function TextArea({ label, value, onChange, placeholder, rows = 4, disabled, required }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 6 }}>
          {label} {required && <span style={{ color: T.error }}>*</span>}
        </label>
      )}
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={rows} disabled={disabled}
        style={{
          width: '100%', padding: '10px 12px',
          border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd,
          fontSize: 14, fontFamily: T.font, color: T.n900,
          outline: 'none', resize: 'vertical', background: disabled ? T.n100 : T.n0,
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

// ═══ Button ═══
export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, loading, icon: Icon, fullWidth, type = 'button' }) {
  const variants = {
    primary: { background: T.primary500, color: T.n0, border: 'none', hoverBg: T.primary600 },
    secondary: { background: T.n0, color: T.n900, border: `1.5px solid ${T.n300}`, hoverBg: T.n100 },
    danger: { background: T.error, color: T.n0, border: 'none', hoverBg: '#B91C1C' },
    success: { background: T.success, color: T.n0, border: 'none', hoverBg: '#15803D' },
    ghost: { background: 'transparent', color: T.n700, border: 'none', hoverBg: T.n100 },
    wa: { background: T.wa, color: T.n0, border: 'none', hoverBg: T.waDark },
  }
  const sizes = {
    sm: { padding: '7px 14px', fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 14 },
    lg: { padding: '13px 24px', fontSize: 15 },
  }
  const v = variants[variant]
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{
        ...sizes[size], ...{ background: v.background, color: v.color, border: v.border },
        borderRadius: T.radiusMd, fontWeight: 600, fontFamily: T.font,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'all 200ms', opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = v.hoverBg }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = v.background }}
    >
      {loading ? <Loader2 size={16} className="spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

// ═══ Modal ═══
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)', zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto',
        background: T.n0, borderRadius: T.radiusLg,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.2s ease',
      }}>
        {title && (
          <div style={{
            padding: '20px 24px', borderBottom: `1px solid ${T.n200}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: T.radiusMd, border: 'none',
              background: 'transparent', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={18} color={T.n400} />
            </button>
          </div>
        )}
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ═══ Card ═══
export function Card({ children, style, padding = '20px', onClick, hoverable }) {
  return (
    <div onClick={onClick} style={{
      background: T.n0, borderRadius: T.radiusLg,
      border: `1px solid ${T.n200}`, padding,
      boxShadow: T.shadowSoft, transition: 'all 200ms',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
    onMouseEnter={(e) => {
      if (hoverable) { e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.borderColor = T.n300 }
    }}
    onMouseLeave={(e) => {
      if (hoverable) { e.currentTarget.style.boxShadow = T.shadowSoft; e.currentTarget.style.borderColor = T.n200 }
    }}>
      {children}
    </div>
  )
}

// ═══ Empty State ═══
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      {Icon && (
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: T.primary50,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <Icon size={28} color={T.primary500} />
        </div>
      )}
      <h3 style={{ fontSize: 16, fontWeight: 600, color: T.n900, marginBottom: 6 }}>{title}</h3>
      {description && <p style={{ fontSize: 14, color: T.n400, marginBottom: 20 }}>{description}</p>}
      {action}
    </div>
  )
}

// ═══ Loading Spinner ═══
export function LoadingSpinner({ size = 24 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <Loader2 size={size} color={T.primary500} className="spin" />
    </div>
  )
}

// ═══ Stat Card ═══
export function StatCard({ label, value, icon: Icon, color, trend, trendUp, subtext, delay = 0 }) {
  return (
    <div style={{
      background: T.n0, borderRadius: T.radiusLg, padding: '22px 24px',
      boxShadow: T.shadowSoft, border: `1px solid ${T.n200}`,
      display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'box-shadow 200ms, transform 200ms', cursor: 'default',
      animation: `fadeSlideUp 0.4s ease ${delay}s both`,
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = T.shadowSoft; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {Icon && (
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: color ? `${color}14` : T.primary50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color={color || T.primary500} />
          </div>
        )}
        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
            color: trendUp ? T.success : T.error, padding: '4px 8px',
            borderRadius: 6, background: trendUp ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
          }}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: T.n900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 13, color: T.n400, marginTop: 4 }}>{label}</div>
      </div>
      {subtext && <div style={{ fontSize: 12, color: T.n700, marginTop: -4 }}>{subtext}</div>}
    </div>
  )
}

// ═══ Confirm Dialog ═══
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Confirmar', variant = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={420}>
      <p style={{ fontSize: 14, color: T.n700, marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant={variant} onClick={() => { onConfirm(); onClose() }}>{confirmText}</Button>
      </div>
    </Modal>
  )
}

// ═══ Helper: get initials from name ═══
export function getInitials(name) {
  return name?.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'
}

// ═══ Avatar ═══
export function Avatar({ name, url, size = 40, color }) {
  if (url) {
    return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
  }
  const bg = color || T.primary500
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${bg}18`, color: bg, fontWeight: 600,
      fontSize: size * 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  )
}
