import { useState } from 'react'
import {
  AlertCircle, ArrowRight, Building2, CalendarDays, Check, ChevronLeft,
  ChevronRight, Eye, EyeOff, Key, Loader2, Lock, Mail, MessageSquare, Plus,
  Smartphone, Stethoscope, Trash2
} from 'lucide-react'
import { Area, Line } from 'recharts'
import { T } from '@/utils/theme'
import { Toggle } from '@/components/ui'

const s = {
  page: { minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: T.n100, color: T.n900, lineHeight: 1.5 },
  sidebar: {
    width: 420, background: `linear-gradient(165deg, ${T.primary500} 0%, ${T.primary600} 100%)`,
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: "48px 40px", color: T.n0, position: "relative", overflow: "hidden",
  },
  mainArea: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 },
  card: {
    width: "100%", maxWidth: 440, background: T.n0, borderRadius: T.radiusLg,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "40px 36px",
  },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 6 },
  inputWrap: {
    position: "relative", display: "flex", alignItems: "center",
    border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd,
    background: T.n0, transition: "all 200ms ease-in-out", overflow: "hidden",
  },
  inputWrapFocus: { borderColor: T.primary500, boxShadow: T.focusRing },
  inputWrapError: { borderColor: T.error, boxShadow: "0 0 0 3px rgba(220,38,38,0.12)" },
  input: {
    flex: 1, border: "none", outline: "none", padding: "12px 14px", fontSize: 14,
    fontFamily: "inherit", color: T.n900, background: "transparent",
  },
  inputIcon: { paddingLeft: 14, color: T.n400, display: "flex", flexShrink: 0 },
  btnPrimary: {
    width: "100%", padding: "13px 24px", border: "none", borderRadius: T.radiusMd,
    background: T.primary500, color: T.n0, fontSize: 15, fontWeight: 600,
    cursor: "pointer", transition: "all 200ms ease-in-out",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "inherit",
  },
  btnSecondary: {
    width: "100%", padding: "13px 24px", border: `1.5px solid ${T.n300}`,
    borderRadius: T.radiusMd, background: T.n0, color: T.n900, fontSize: 15,
    fontWeight: 600, cursor: "pointer", transition: "all 200ms ease-in-out",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "inherit",
  },
  errorText: { fontSize: 12, color: T.error, marginTop: 4, display: "flex", alignItems: "center", gap: 4 },
  link: { color: T.primary500, cursor: "pointer", fontWeight: 500, textDecoration: "none", fontSize: 14 },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "20px 0", color: T.n400, fontSize: 13 },
  dividerLine: { flex: 1, height: 1, background: T.n300 },
};

/* ─── Reusable Input Component ─── */
function InputField({ label, icon: Icon, type = "text", placeholder, value, onChange, error, right, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={s.label}>{label}</label>}
      <div style={{
        ...s.inputWrap,
        ...(focused && !error ? s.inputWrapFocus : {}),
        ...(error ? s.inputWrapError : {}),
        ...(disabled ? { background: T.n100, cursor: "not-allowed" } : {}),
      }}>
        {Icon && <span style={s.inputIcon}><Icon size={18} /></span>}
        <input
          style={{ ...s.input, ...(disabled ? { cursor: "not-allowed", color: T.n400 } : {}) }}
          type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          disabled={disabled}
        />
        {right}
      </div>
      {error && <div style={s.errorText}><AlertCircle size={12} />{error}</div>}
    </div>
  );
}

/* ─── Password Toggle ─── */
function PasswordToggle({ show, onToggle }) {
  return (
    <button onClick={onToggle} type="button"
      style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 12px", color: T.n400, display: "flex" }}>
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

/* ─── Decorative Sidebar Pattern ─── */
function SidebarDecor() {
  return (
    <>
      <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ position: "absolute", bottom: -80, left: -40, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
      <div style={{ position: "absolute", top: "50%", right: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
    </>
  );
}

/* ─── Floating Feature Cards ─── */
function FeatureCard({ icon: Icon, title, desc, delay }) {
  return (
    <div style={{
      display: "flex", gap: 14, alignItems: "flex-start", background: "rgba(255,255,255,0.10)",
      borderRadius: 12, padding: "16px 18px", backdropFilter: "blur(8px)",
      animation: `fadeSlideUp 0.6s ease ${delay}s both`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12.5, opacity: 0.75, lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─── Auth Sidebar ─── */
function AuthSidebar({ variant }) {
  return (
    <div style={s.sidebar} className="auth-sidebar">
      <SidebarDecor />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18,
          }}>T</div>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Terapee</span>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25, marginBottom: 12, letterSpacing: "-0.01em" }}>
          {variant === "login" ? "Bem-vindo de volta" : variant === "signup" ? "Comece agora" : "Recupere o acesso"}
        </h2>
        <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.5, maxWidth: 300 }}>
          {variant === "login"
            ? "Gerencie sua clínica de forma simples e eficiente. Tudo o que você precisa em um só lugar."
            : variant === "signup"
              ? "Configure sua clínica em poucos minutos e tenha controle total da sua operação."
              : "Enviaremos um link seguro para você redefinir sua senha."}
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <FeatureCard icon={CalendarDays} title="Agenda inteligente" desc="Agendamentos com confirmação automática via WhatsApp" delay={0.2} />
        <FeatureCard icon={Stethoscope} title="Prontuário eletrônico" desc="Registros seguros com controle de acesso por perfil" delay={0.4} />
        <FeatureCard icon={Smartphone} title="WhatsApp integrado" desc="Lembretes e confirmações automáticas para pacientes" delay={0.6} />
      </div>
      <div style={{ position: "relative", zIndex: 1, fontSize: 12, opacity: 0.5, marginTop: 24 }}>
        © 2025 Terapee · Todos os direitos reservados
      </div>
    </div>
  );
}

/* ═══════════════════════ LOGIN SCREEN ═══════════════════════ */
function LoginScreen({ onNavigate, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = "E-mail é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "E-mail inválido";
    if (!password) e.password = "Senha é obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1500);
  };

  return (
    <div style={s.page}>
      <AuthSidebar variant="login" />
      <div style={s.mainArea}>
        <div style={s.card} className="auth-card">
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.01em" }}>Entrar na sua conta</h1>
          <p style={{ color: T.n700, fontSize: 14, marginBottom: 28 }}>
            Digite suas credenciais para acessar o sistema
          </p>

          <InputField label="E-mail" icon={Mail} type="email" placeholder="seu@email.com"
            value={email} onChange={setEmail} error={errors.email} />

          <InputField label="Senha" icon={Lock} type={showPass ? "text" : "password"}
            placeholder="••••••••" value={password} onChange={setPassword} error={errors.password}
            right={<PasswordToggle show={showPass} onToggle={() => setShowPass(!showPass)} />} />

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24, marginTop: -8 }}>
            <span style={s.link} onClick={() => onNavigate("forgot")}>Esqueci minha senha</span>
          </div>

          <button style={{ ...s.btnPrimary, ...(loading ? { opacity: 0.8 } : {}) }}
            onClick={handleSubmit} disabled={loading}
            onMouseEnter={e => { e.target.style.background = T.primary600; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.background = T.primary500; e.target.style.transform = "none"; }}>
            {loading ? <><Loader2 size={18} className="spin" /> Entrando...</> : <>Entrar <ArrowRight size={16} /></>}
          </button>

          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span>ou</span>
            <div style={s.dividerLine} />
          </div>

          <button style={s.btnSecondary}
            onMouseEnter={e => e.target.style.background = T.n100}
            onMouseLeave={e => e.target.style.background = T.n0}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Entrar com Google
          </button>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: T.n700 }}>
            Não tem uma conta?{" "}
            <span style={s.link} onClick={() => onNavigate("signup")}>Criar conta</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ FORGOT PASSWORD ═══════════════════════ */
function ForgotPasswordScreen({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email) { setError("E-mail é obrigatório"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("E-mail inválido"); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  };

  return (
    <div style={s.page}>
      <AuthSidebar variant="forgot" />
      <div style={s.mainArea}>
        <div style={s.card} className="auth-card">
          {!sent ? (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Recuperar senha</h1>
              <p style={{ color: T.n700, fontSize: 14, marginBottom: 28 }}>
                Informe seu e-mail e enviaremos um link para redefinir sua senha. O link expira em 1 hora.
              </p>
              <InputField label="E-mail" icon={Mail} type="email" placeholder="seu@email.com"
                value={email} onChange={v => { setEmail(v); setError(""); }} error={error} />
              <button style={{ ...s.btnPrimary, marginTop: 8, ...(loading ? { opacity: 0.8 } : {}) }}
                onClick={handleSubmit} disabled={loading}
                onMouseEnter={e => { e.target.style.background = T.primary600; }}
                onMouseLeave={e => { e.target.style.background = T.primary500; }}>
                {loading ? <><Loader2 size={18} className="spin" /> Enviando...</> : "Enviar link de recuperação"}
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "rgba(22,163,74,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
              }}>
                <Mail size={28} color={T.success} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>E-mail enviado!</h2>
              <p style={{ color: T.n700, fontSize: 14, maxWidth: 320, margin: "0 auto 24px", lineHeight: 1.6 }}>
                Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
              </p>
              <button style={s.btnPrimary}
                onClick={() => onNavigate("login")}
                onMouseEnter={e => { e.target.style.background = T.primary600; }}
                onMouseLeave={e => { e.target.style.background = T.primary500; }}>
                Voltar para o login
              </button>
            </div>
          )}
          {!sent && (
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: T.n700 }}>
              Lembrou a senha?{" "}
              <span style={s.link} onClick={() => onNavigate("login")}>Voltar ao login</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ SIGNUP SCREEN ═══════════════════════ */
function SignupScreen({ onNavigate, onSignup }) {
  const [form, setForm] = useState({ clinicName: "", email: "", password: "", confirmPassword: "", cnpj: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const passChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  };

  const validate = () => {
    const e = {};
    if (!form.clinicName.trim()) e.clinicName = "Nome da clínica é obrigatório";
    if (!form.email) e.email = "E-mail é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "E-mail inválido";
    if (!form.password) e.password = "Senha é obrigatória";
    else if (!passChecks.length || !passChecks.upper || !passChecks.number) e.password = "Senha não atende aos requisitos";
    if (form.password !== form.confirmPassword) e.confirmPassword = "As senhas não coincidem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSignup(); }, 1500);
  };

  const PassCheck = ({ ok, text }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: ok ? T.success : T.n400, transition: "color 200ms" }}>
      <Check size={13} /> {text}
    </div>
  );

  return (
    <div style={s.page}>
      <AuthSidebar variant="signup" />
      <div style={s.mainArea}>
        <div style={{ ...s.card, maxWidth: 460, padding: "36px 36px" }} className="auth-card">
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Criar conta da clínica</h1>
          <p style={{ color: T.n700, fontSize: 14, marginBottom: 24 }}>
            Cadastre sua clínica e comece a gerenciar tudo em um só lugar
          </p>

          <InputField label="Nome da Clínica *" icon={Building2} placeholder="Ex: Clínica Bem Estar"
            value={form.clinicName} onChange={v => update("clinicName", v)} error={errors.clinicName} />

          <InputField label="CNPJ (opcional)" icon={Building2} placeholder="00.000.000/0000-00"
            value={form.cnpj} onChange={v => update("cnpj", v)} />

          <InputField label="E-mail do Administrador *" icon={Mail} type="email" placeholder="admin@clinica.com"
            value={form.email} onChange={v => update("email", v)} error={errors.email} />

          <InputField label="Senha *" icon={Lock} type={showPass ? "text" : "password"} placeholder="Mín. 8 caracteres"
            value={form.password} onChange={v => update("password", v)} error={errors.password}
            right={<PasswordToggle show={showPass} onToggle={() => setShowPass(!showPass)} />} />

          {form.password && (
            <div style={{ display: "flex", gap: 16, marginTop: -10, marginBottom: 14, flexWrap: "wrap" }}>
              <PassCheck ok={passChecks.length} text="8+ caracteres" />
              <PassCheck ok={passChecks.upper} text="1 maiúscula" />
              <PassCheck ok={passChecks.number} text="1 número" />
            </div>
          )}

          <InputField label="Confirmar Senha *" icon={Lock} type={showConfirm ? "text" : "password"} placeholder="Repita a senha"
            value={form.confirmPassword} onChange={v => update("confirmPassword", v)} error={errors.confirmPassword}
            right={<PasswordToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />} />

          <button style={{ ...s.btnPrimary, marginTop: 4, ...(loading ? { opacity: 0.8 } : {}) }}
            onClick={handleSubmit} disabled={loading}
            onMouseEnter={e => { e.target.style.background = T.primary600; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.background = T.primary500; e.target.style.transform = "none"; }}>
            {loading ? <><Loader2 size={18} className="spin" /> Criando conta...</> : <>Criar conta <ArrowRight size={16} /></>}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: T.n700, lineHeight: 1.6 }}>
            Ao criar sua conta, você concorda com os{" "}
            <span style={{ ...s.link, fontSize: 13 }}>Termos de Uso</span> e a{" "}
            <span style={{ ...s.link, fontSize: 13 }}>Política de Privacidade</span>
          </p>

          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span>ou</span>
            <div style={s.dividerLine} />
          </div>

          <p style={{ textAlign: "center", fontSize: 14, color: T.n700 }}>
            Já tem uma conta?{" "}
            <span style={s.link} onClick={() => onNavigate("login")}>Fazer login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ ONBOARDING WIZARD ═══════════════════════ */
const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, transition: "all 300ms ease",
              background: i <= current ? T.primary500 : T.n200,
              color: i <= current ? T.n0 : T.n400,
              boxShadow: i === current ? "0 0 0 4px rgba(63,107,255,0.15)" : "none",
            }}>
              {i < current ? <Check size={16} /> : i + 1}
            </div>
            <span style={{
              fontSize: 13, fontWeight: i === current ? 600 : 400,
              color: i <= current ? T.n900 : T.n400, whiteSpace: "nowrap",
            }}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, marginLeft: 12, marginRight: 12, borderRadius: 1,
              background: i < current ? T.primary500 : T.n300, transition: "background 300ms",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);

  // Step 1: Schedule
  const [schedule, setSchedule] = useState(
    DAYS.map((d, i) => ({ day: d, enabled: i < 5, start: "08:00", end: "18:00" }))
  );

  // Step 2: Professional
  const [professionals, setProfessionals] = useState([{ name: "", specialty: "", email: "" }]);

  // Step 3: WhatsApp
  const [waConfig, setWaConfig] = useState({ provider: "evolution", apiKey: "", phone: "" });
  const [testSent, setTestSent] = useState(false);

  const toggleDay = i => {
    const s = [...schedule]; s[i].enabled = !s[i].enabled; setSchedule(s);
  };
  const updateTime = (i, k, v) => {
    const s = [...schedule]; s[i][k] = v; setSchedule(s);
  };
  const addProf = () => setProfessionals([...professionals, { name: "", specialty: "", email: "" }]);
  const removeProf = i => setProfessionals(professionals.filter((_, j) => j !== i));
  const updateProf = (i, k, v) => {
    const p = [...professionals]; p[i][k] = v; setProfessionals(p);
  };

  const stepContent = [
    /* ─── STEP 1: Schedule ─── */
    <div key="schedule">
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Horário de funcionamento</h2>
      <p style={{ color: T.n700, fontSize: 14, marginBottom: 24 }}>
        Configure os dias e horários em que sua clínica atende
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {schedule.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
            background: s.enabled ? T.primary50 : T.n100, borderRadius: T.radiusMd,
            border: `1.5px solid ${s.enabled ? "rgba(63,107,255,0.2)" : T.n200}`,
            transition: "all 200ms",
          }}>
            <button onClick={() => toggleDay(i)} style={{
              width: 22, height: 22, borderRadius: 6, border: `2px solid ${s.enabled ? T.primary500 : T.n400}`,
              background: s.enabled ? T.primary500 : "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 200ms", flexShrink: 0,
            }}>
              {s.enabled && <Check size={13} color="#fff" strokeWidth={3} />}
            </button>
            <span style={{ width: 80, fontSize: 14, fontWeight: 500, color: s.enabled ? T.n900 : T.n400 }}>{s.day}</span>
            {s.enabled ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                <input type="time" value={s.start} onChange={e => updateTime(i, "start", e.target.value)}
                  style={{ padding: "6px 10px", border: `1px solid ${T.n300}`, borderRadius: 6, fontSize: 13, fontFamily: "inherit", color: T.n900 }} />
                <span style={{ color: T.n400, fontSize: 13 }}>até</span>
                <input type="time" value={s.end} onChange={e => updateTime(i, "end", e.target.value)}
                  style={{ padding: "6px 10px", border: `1px solid ${T.n300}`, borderRadius: 6, fontSize: 13, fontFamily: "inherit", color: T.n900 }} />
              </div>
            ) : (
              <span style={{ marginLeft: "auto", fontSize: 13, color: T.n400 }}>Fechado</span>
            )}
          </div>
        ))}
      </div>
    </div>,

    /* ─── STEP 2: Professional ─── */
    <div key="prof">
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Adicionar profissionais</h2>
      <p style={{ color: T.n700, fontSize: 14, marginBottom: 24 }}>
        Convide os profissionais da sua clínica. Eles receberão um e-mail de convite.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {professionals.map((p, i) => (
          <div key={i} style={{
            padding: 20, background: T.n0, border: `1.5px solid ${T.n300}`,
            borderRadius: T.radiusMd, position: "relative",
          }}>
            {professionals.length > 1 && (
              <button onClick={() => removeProf(i)} style={{
                position: "absolute", top: 12, right: 12, background: "none", border: "none",
                cursor: "pointer", color: T.n400, padding: 4, borderRadius: 6,
              }}><Trash2 size={16} /></button>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={s.label}>Nome</label>
                <input placeholder="Nome completo" value={p.name} onChange={e => updateProf(i, "name", e.target.value)}
                  style={{ ...s.input, border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, width: "100%", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={s.label}>Especialidade</label>
                <input placeholder="Ex: Psicologia" value={p.specialty} onChange={e => updateProf(i, "specialty", e.target.value)}
                  style={{ ...s.input, border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, width: "100%", boxSizing: "border-box" }} />
              </div>
            </div>
            <div>
              <label style={s.label}>E-mail</label>
              <input placeholder="profissional@email.com" value={p.email} onChange={e => updateProf(i, "email", e.target.value)}
                style={{ ...s.input, border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, width: "100%", boxSizing: "border-box" }} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={addProf} style={{
        ...s.btnSecondary, width: "auto", marginTop: 14, padding: "10px 20px", fontSize: 13,
      }}
        onMouseEnter={e => e.target.style.background = T.n100}
        onMouseLeave={e => e.target.style.background = T.n0}>
        <Plus size={16} /> Adicionar profissional
      </button>
    </div>,

    /* ─── STEP 3: WhatsApp ─── */
    <div key="whatsapp">
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Configurar WhatsApp</h2>
      <p style={{ color: T.n700, fontSize: 14, marginBottom: 24 }}>
        Conecte o WhatsApp para enviar confirmações e lembretes automáticos aos pacientes
      </p>

      <label style={s.label}>Provedor</label>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[{ id: "evolution", name: "Evolution API" }, { id: "twilio", name: "Twilio WhatsApp" }].map(p => (
          <button key={p.id} onClick={() => setWaConfig(c => ({ ...c, provider: p.id }))}
            style={{
              flex: 1, padding: "14px 16px", borderRadius: T.radiusMd, cursor: "pointer",
              border: `2px solid ${waConfig.provider === p.id ? T.primary500 : T.n300}`,
              background: waConfig.provider === p.id ? T.primary50 : T.n0,
              fontFamily: "inherit", fontSize: 14, fontWeight: 500,
              color: waConfig.provider === p.id ? T.primary500 : T.n700,
              transition: "all 200ms",
            }}>
            {p.name}
          </button>
        ))}
      </div>

      <InputField label="Número do WhatsApp" icon={Smartphone} placeholder="+55 (11) 99999-9999"
        value={waConfig.phone} onChange={v => setWaConfig(c => ({ ...c, phone: v }))} />

      <InputField label="API Key / Token" icon={Lock} type="password" placeholder="Sua chave de API"
        value={waConfig.apiKey} onChange={v => setWaConfig(c => ({ ...c, apiKey: v }))} />

      <button onClick={() => { setTestSent(true); setTimeout(() => setTestSent(false), 3000); }}
        style={{
          ...s.btnSecondary, width: "auto", padding: "10px 20px", fontSize: 13,
          ...(testSent ? { borderColor: T.success, color: T.success } : {}),
        }}>
        {testSent ? <><Check size={16} /> Mensagem de teste enviada!</> : <><MessageSquare size={16} /> Enviar mensagem de teste</>}
      </button>

      <div style={{
        marginTop: 20, padding: "14px 18px", background: T.primary50, borderRadius: T.radiusMd,
        border: `1px solid rgba(63,107,255,0.15)`, fontSize: 13, color: T.n700, lineHeight: 1.6,
      }}>
        💡 <strong>Dica:</strong> Você pode pular esta etapa e configurar o WhatsApp depois nas configurações da clínica.
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.n100, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Top bar */}
      <div style={{
        padding: "16px 32px", background: T.n0, borderBottom: `1px solid ${T.n200}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: T.primary500,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.n0, fontWeight: 700, fontSize: 16,
          }}>T</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: T.n900 }}>Terapee</span>
        </div>
        <span style={{ fontSize: 13, color: T.n400 }}>Configuração inicial</span>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        <StepIndicator steps={["Horários", "Equipe", "WhatsApp"]} current={step} />

        <div style={{
          background: T.n0, borderRadius: T.radiusLg, boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          padding: "36px 32px",
        }}>
          {stepContent[step]}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} style={{ ...s.btnSecondary, width: "auto", padding: "12px 24px" }}
              onMouseEnter={e => e.target.style.background = T.n100}
              onMouseLeave={e => e.target.style.background = T.n0}>
              <ChevronLeft size={16} /> Anterior
            </button>
          ) : <div />}

          <div style={{ display: "flex", gap: 10 }}>
            {step === 2 && (
              <button onClick={onComplete} style={{ ...s.btnSecondary, width: "auto", padding: "12px 24px" }}
                onMouseEnter={e => e.target.style.background = T.n100}
                onMouseLeave={e => e.target.style.background = T.n0}>
                Pular por agora
              </button>
            )}
            <button onClick={() => step < 2 ? setStep(step + 1) : onComplete()}
              style={{ ...s.btnPrimary, width: "auto", padding: "12px 28px" }}
              onMouseEnter={e => { e.target.style.background = T.primary600; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.background = T.primary500; e.target.style.transform = "none"; }}>
              {step < 2 ? <>Próximo <ChevronRight size={16} /></> : <>Concluir configuração <Check size={16} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ SUCCESS / DASHBOARD REDIRECT ═══════════════════════ */
function SuccessScreen({ onReset }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: T.n100,
    }}>
      <div style={{ ...s.card, maxWidth: 480, textAlign: "center", padding: "48px 40px" }} className="auth-card">
        <div style={{
          width: 80, height: 80, borderRadius: "50%", background: "rgba(22,163,74,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
          animation: "scaleIn 0.5s ease both",
        }}>
          <Check size={36} color={T.success} strokeWidth={2.5} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: T.n900 }}>Tudo pronto! 🎉</h1>
        <p style={{ color: T.n700, fontSize: 15, lineHeight: 1.6, marginBottom: 32, maxWidth: 340, margin: "0 auto 32px" }}>
          Sua clínica está configurada e pronta para uso. Você será redirecionado ao painel principal.
        </p>
        <button style={s.btnPrimary} onClick={onReset}
          onMouseEnter={e => { e.target.style.background = T.primary600; }}
          onMouseLeave={e => { e.target.style.background = T.primary500; }}>
          Ir para o Dashboard <ArrowRight size={16} />
        </button>
        <p style={{ marginTop: 16, fontSize: 13, color: T.n400 }}>
          (Demo: clique para reiniciar o fluxo)
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN APP ═══════════════════════ */
export default function AuthPage() {
  const [screen, setScreen] = useState("login");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .auth-card {
          animation: fadeSlideUp 0.45s ease both;
        }

        .auth-sidebar {
          animation: fadeIn 0.4s ease both;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        input::placeholder {
          color: ${T.n400};
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.n300}; border-radius: 3px; }

        /* Responsive: hide sidebar on smaller screens */
        @media (max-width: 900px) {
          .auth-sidebar { display: none !important; }
        }
      `}</style>

      {screen === "login" && (
        <LoginScreen
          onNavigate={setScreen}
          onLogin={() => setScreen("success-login")}
        />
      )}
      {screen === "forgot" && <ForgotPasswordScreen onNavigate={setScreen} />}
      {screen === "signup" && (
        <SignupScreen
          onNavigate={setScreen}
          onSignup={() => setScreen("onboarding")}
        />
      )}
      {screen === "onboarding" && (
        <OnboardingScreen onComplete={() => setScreen("success")} />
      )}
      {screen === "success" && <SuccessScreen onReset={() => setScreen("login")} />}
      {screen === "success-login" && <SuccessScreen onReset={() => setScreen("login")} />}
    </>
  );
}


