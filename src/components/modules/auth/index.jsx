import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'
import { T } from '@/utils/theme'
import { useAuth } from '@/contexts/AuthContext'
import { InputField, Button } from '@/components/ui'

export default function AuthPage() {
  const { signIn, signUp, loginDemo, resetPassword } = useAuth()
  const [mode, setMode] = useState('login') // login | register | forgot
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'Email obrigatório'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido'
    if (mode !== 'forgot') {
      if (!password) e.password = 'Senha obrigatória'
      else if (password.length < 6) e.password = 'Mínimo 6 caracteres'
    }
    if (mode === 'register' && !fullName.trim()) e.fullName = 'Nome obrigatório'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e?.preventDefault(); if (!validate()) return; setLoading(true)
    if (mode === 'login') await signIn({ email, password })
    else if (mode === 'register') await signUp({ email, password, fullName })
    else if (mode === 'forgot') await resetPassword(email)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(135deg, ${T.primary50} 0%, #F7F8FC 50%, ${T.n0} 100%)` }}>
      {/* Left: Branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, background: `linear-gradient(135deg, ${T.primary500} 0%, ${T.primary600} 100%)`, color: T.n0, minHeight: '100vh' }}>
        <div style={{ maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>T</div>
            <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Terapee</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
            Gestão completa para sua clínica de psicologia
          </h1>
          <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, marginBottom: 32 }}>
            Agenda, prontuários, financeiro, WhatsApp e muito mais em uma única plataforma. Simplifique sua rotina e foque no que importa: seus pacientes.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Agenda inteligente com confirmação automática', 'Prontuários eletrônicos seguros', 'Gestão financeira completa', 'WhatsApp integrado (UAZAPI + Meta API)'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, opacity: 0.9 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div style={{ width: 520, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 60px' }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            {mode === 'login' ? 'Bem-vindo de volta' : mode === 'register' ? 'Criar conta' : 'Recuperar senha'}
          </h2>
          <p style={{ fontSize: 14, color: T.n400, marginBottom: 28 }}>
            {mode === 'login' ? 'Entre na sua conta para continuar' : mode === 'register' ? 'Crie sua conta gratuita' : 'Informe seu email para receber o link de recuperação'}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <InputField label="Nome completo" icon={User} value={fullName} onChange={setFullName} placeholder="Dr. João Silva" error={errors.fullName} required />
            )}
            <InputField label="Email" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="seu@email.com" error={errors.email} required />
            {mode !== 'forgot' && (
              <InputField label="Senha" icon={Lock} type={showPw ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="••••••••" error={errors.password} required
                right={<button type="button" onClick={() => setShowPw(!showPw)} style={{ padding: '0 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: T.n400 }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
              />
            )}

            {mode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, marginTop: -10 }}>
                <button type="button" onClick={() => setMode('forgot')} style={{ border: 'none', background: 'transparent', color: T.primary500, fontSize: 13, cursor: 'pointer', fontFamily: T.font, fontWeight: 500 }}>Esqueci a senha</button>
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} icon={ArrowRight}>
              {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Enviar link'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: T.n200 }} />
              <span style={{ fontSize: 12, color: T.n400 }}>ou</span>
              <div style={{ flex: 1, height: 1, background: T.n200 }} />
            </div>
          </div>

          <Button variant="secondary" fullWidth icon={Zap} onClick={loginDemo}>
            Entrar em modo demonstração
          </Button>

          <p style={{ textAlign: 'center', fontSize: 13, color: T.n400, marginTop: 24 }}>
            {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ border: 'none', background: 'transparent', color: T.primary500, cursor: 'pointer', fontFamily: T.font, fontSize: 13, fontWeight: 600 }}>
              {mode === 'login' ? 'Criar conta grátis' : 'Fazer login'}
            </button>
          </p>
          {mode === 'forgot' && (
            <p style={{ textAlign: 'center', fontSize: 13, marginTop: 8 }}>
              <button onClick={() => setMode('login')} style={{ border: 'none', background: 'transparent', color: T.primary500, cursor: 'pointer', fontFamily: T.font, fontSize: 13, fontWeight: 500 }}>← Voltar ao login</button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
