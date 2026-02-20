import { useState, useEffect } from 'react'
import { Settings, Building2, Clock, Zap, Phone, Save, CheckCircle2, QrCode, Wifi, WifiOff, Shield, Globe } from 'lucide-react'
import { T } from '@/utils/theme'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Card, Badge, Button, InputField, SelectField, Toggle } from '@/components/ui'

const DAYS = [{ key: 'mon', label: 'Segunda' }, { key: 'tue', label: 'Terça' }, { key: 'wed', label: 'Quarta' }, { key: 'thu', label: 'Quinta' }, { key: 'fri', label: 'Sexta' }, { key: 'sat', label: 'Sábado' }]

export default function ConfiguracoesContent() {
  const { clinicPlan, setClinicPlan } = useAppStore()
  const { clinicId, isDemo } = useAuth()
  const [tab, setTab] = useState('clinic')
  const [saving, setSaving] = useState(false)

  // Clinic form
  const [clinic, setClinic] = useState({ name: 'Espaço Mente & Vida', phone: '(11) 3456-7890', email: 'contato@menteevida.com.br', cnpj: '12.345.678/0001-01' })
  const [hours, setHours] = useState(DAYS.reduce((acc, d) => ({ ...acc, [d.key]: { enabled: d.key !== 'sat', start: '08:00', end: '20:00' } }), {}))

  // WhatsApp config
  const [waChannel, setWaChannel] = useState(clinicPlan === 'max' ? 'meta' : 'uazapi')
  const [uazapiStep, setUazapiStep] = useState(0) // 0: config, 1: qr, 2: connected
  const [uazapiForm, setUazapiForm] = useState({ instance: '', token: '', phone: '' })
  const [metaForm, setMetaForm] = useState({ token: '', phone_id: '', business_id: '' })

  // Load clinic data
  useEffect(() => {
    if (isDemo || !supabase || !clinicId) return
    const load = async () => {
      const { data } = await supabase.from('clinics').select('*').eq('id', clinicId).single()
      if (data) {
        setClinic({ name: data.name || '', phone: data.phone || '', email: data.email || '', cnpj: data.cnpj || '' })
        if (data.working_hours) {
          const h = {}
          DAYS.forEach(d => { h[d.key] = data.working_hours[d.key] ? { enabled: true, ...data.working_hours[d.key] } : { enabled: false, start: '08:00', end: '18:00' } })
          setHours(h)
        }
        if (data.whatsapp_config) {
          setWaChannel(data.plan === 'max' ? 'meta' : 'uazapi')
          if (data.whatsapp_config.uazapi_instance) { setUazapiForm({ instance: data.whatsapp_config.uazapi_instance, token: data.whatsapp_config.uazapi_token || '', phone: data.whatsapp_config.uazapi_phone || '' }); setUazapiStep(2) }
        }
      }
    }
    load()
  }, [clinicId, isDemo])

  const saveClinic = async () => {
    setSaving(true)
    if (isDemo) { toast.success('Salvo (modo demo)'); setSaving(false); return }
    const workingHours = {}
    DAYS.forEach(d => { if (hours[d.key].enabled) workingHours[d.key] = { start: hours[d.key].start, end: hours[d.key].end } })
    await supabase.from('clinics').update({ name: clinic.name, phone: clinic.phone, email: clinic.email, cnpj: clinic.cnpj, working_hours: workingHours }).eq('id', clinicId)
    toast.success('Configurações salvas'); setSaving(false)
  }

  const saveWhatsApp = async () => {
    setSaving(true)
    const plan = waChannel === 'meta' ? 'max' : 'standard'
    setClinicPlan(plan)
    if (isDemo) { toast.success('WhatsApp configurado (demo)'); setSaving(false); return }
    const config = waChannel === 'uazapi' ? { channel: 'uazapi', uazapi_instance: uazapiForm.instance, uazapi_token: uazapiForm.token, uazapi_phone: uazapiForm.phone } : { channel: 'meta', meta_token: metaForm.token, meta_phone_id: metaForm.phone_id, meta_business_id: metaForm.business_id }
    await supabase.from('clinics').update({ plan, whatsapp_config: config }).eq('id', clinicId)
    toast.success('WhatsApp configurado'); setSaving(false)
  }

  const simulateQR = () => { setUazapiStep(1); setTimeout(() => setUazapiStep(2), 3000) }

  return (
    <div style={{ padding: '24px 28px', animation: 'fadeSlideUp 0.25s ease both' }}>
      <div style={{ marginBottom: 24 }}><h2 style={{ fontSize: 20, fontWeight: 700 }}>Configurações</h2><p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>Ajustes da clínica e integrações</p></div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar tabs */}
        <div style={{ width: 220, flexShrink: 0 }}>
          {[{ id: 'clinic', label: 'Dados da clínica', icon: Building2 }, { id: 'hours', label: 'Horários', icon: Clock }, { id: 'whatsapp', label: 'WhatsApp', icon: Zap }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              border: 'none', borderRadius: T.radiusMd, cursor: 'pointer', fontFamily: T.font,
              fontSize: 14, fontWeight: tab === t.id ? 600 : 400, textAlign: 'left',
              background: tab === t.id ? T.primary50 : 'transparent', color: tab === t.id ? T.primary500 : T.n700,
              marginBottom: 4, transition: 'all 150ms',
            }}>
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {tab === 'clinic' && (
            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Dados da clínica</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div style={{ gridColumn: '1 / -1' }}><InputField label="Nome da clínica" value={clinic.name} onChange={v => setClinic({ ...clinic, name: v })} required /></div>
                <InputField label="Telefone" icon={Phone} value={clinic.phone} onChange={v => setClinic({ ...clinic, phone: v })} />
                <InputField label="Email" value={clinic.email} onChange={v => setClinic({ ...clinic, email: v })} />
                <InputField label="CNPJ" value={clinic.cnpj} onChange={v => setClinic({ ...clinic, cnpj: v })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <Button icon={Save} onClick={saveClinic} loading={saving}>Salvar</Button>
              </div>
            </Card>
          )}

          {tab === 'hours' && (
            <Card>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Horário de funcionamento</h3>
              {DAYS.map(d => (
                <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: `1px solid ${T.n100}` }}>
                  <div style={{ width: 100, fontSize: 14, fontWeight: 500 }}>{d.label}</div>
                  <Toggle value={hours[d.key].enabled} onChange={v => setHours({ ...hours, [d.key]: { ...hours[d.key], enabled: v } })} />
                  {hours[d.key].enabled ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="time" value={hours[d.key].start} onChange={e => setHours({ ...hours, [d.key]: { ...hours[d.key], start: e.target.value } })} style={timeInput} />
                      <span style={{ color: T.n400 }}>até</span>
                      <input type="time" value={hours[d.key].end} onChange={e => setHours({ ...hours, [d.key]: { ...hours[d.key], end: e.target.value } })} style={timeInput} />
                    </div>
                  ) : <span style={{ fontSize: 13, color: T.n400 }}>Fechado</span>}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <Button icon={Save} onClick={saveClinic} loading={saving}>Salvar horários</Button>
              </div>
            </Card>
          )}

          {tab === 'whatsapp' && (
            <div>
              {/* Plan selector */}
              <Card style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Canal WhatsApp</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { id: 'uazapi', label: 'UAZAPI (Standard)', desc: 'WhatsApp pessoal via QR Code. Mensagens livres.', icon: QrCode, plan: 'standard', color: T.wa },
                    { id: 'meta', label: 'Meta Business API (Max)', desc: 'API oficial. Apenas templates aprovados.', icon: Shield, plan: 'max', color: T.primary500 },
                  ].map(ch => (
                    <button key={ch.id} onClick={() => { setWaChannel(ch.id); setClinicPlan(ch.plan) }}
                      style={{
                        padding: 20, borderRadius: T.radiusLg, textAlign: 'left', cursor: 'pointer',
                        border: `2px solid ${waChannel === ch.id ? ch.color : T.n200}`, fontFamily: T.font,
                        background: waChannel === ch.id ? `${ch.color}08` : T.n0, transition: 'all 200ms',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <ch.icon size={20} color={ch.color} />
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{ch.label}</span>
                        {waChannel === ch.id && <CheckCircle2 size={16} color={ch.color} />}
                      </div>
                      <p style={{ fontSize: 13, color: T.n500, lineHeight: 1.4 }}>{ch.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Channel config */}
              <Card>
                {waChannel === 'uazapi' ? (
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Configuração UAZAPI</h4>
                    {uazapiStep === 0 && (
                      <div>
                        <InputField label="Nome da instância" value={uazapiForm.instance} onChange={v => setUazapiForm({ ...uazapiForm, instance: v })} placeholder="minha-clinica" />
                        <InputField label="Token de acesso" value={uazapiForm.token} onChange={v => setUazapiForm({ ...uazapiForm, token: v })} placeholder="tok_xxxx" />
                        <InputField label="Número WhatsApp" icon={Phone} value={uazapiForm.phone} onChange={v => setUazapiForm({ ...uazapiForm, phone: v })} placeholder="+5511999999999" />
                        <Button variant="wa" icon={QrCode} onClick={simulateQR}>Gerar QR Code</Button>
                      </div>
                    )}
                    {uazapiStep === 1 && (
                      <div style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ width: 200, height: 200, background: T.n100, borderRadius: T.radiusLg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                          <QrCode size={80} color={T.n300} />
                        </div>
                        <p style={{ fontSize: 14, color: T.n700, marginBottom: 4 }}>Escaneie o QR Code</p>
                        <p style={{ fontSize: 12, color: T.n400 }}>Abra o WhatsApp no celular → Configurações → Aparelhos conectados</p>
                        <div style={{ marginTop: 16 }} className="spin"><Clock size={20} color={T.wa} /></div>
                      </div>
                    )}
                    {uazapiStep === 2 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: T.waBg, borderRadius: T.radiusLg }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: T.wa, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wifi size={24} color={T.n0} /></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: T.waDark }}>WhatsApp conectado!</div>
                          <div style={{ fontSize: 13, color: T.waDark, opacity: 0.7 }}>{uazapiForm.phone || '+55 11 98765-4321'} via UAZAPI</div>
                        </div>
                        <Badge color={T.success} bg={T.successBg}>Online</Badge>
                        <Button variant="ghost" size="sm" onClick={() => setUazapiStep(0)}>Reconectar</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Meta Business API</h4>
                    <InputField label="Token de acesso permanente" value={metaForm.token} onChange={v => setMetaForm({ ...metaForm, token: v })} placeholder="EAAxxxxxxx..." />
                    <InputField label="Phone Number ID" value={metaForm.phone_id} onChange={v => setMetaForm({ ...metaForm, phone_id: v })} placeholder="123456789" />
                    <InputField label="Business Account ID" value={metaForm.business_id} onChange={v => setMetaForm({ ...metaForm, business_id: v })} placeholder="987654321" />
                    <div style={{ padding: 16, background: `${T.primary500}08`, borderRadius: T.radiusMd, fontSize: 13, color: T.n700, lineHeight: 1.5, marginTop: 8 }}>
                      <strong>Nota:</strong> O canal Meta API permite enviar apenas templates de mensagem pré-aprovados pelo Facebook. Mensagens livres não são permitidas neste modo.
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <Button icon={Save} variant="wa" onClick={saveWhatsApp} loading={saving}>Salvar configuração</Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const timeInput = { padding: '6px 10px', border: `1.5px solid ${T.n300}`, borderRadius: 6, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }
