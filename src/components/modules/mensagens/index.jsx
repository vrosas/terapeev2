import { useState, useEffect, useRef, useMemo } from 'react'
import { MessageSquare, Send, Search, Phone, Paperclip, Smile, Check, CheckCheck, Clock, FileText, Users, Zap, ArrowRight } from 'lucide-react'
import { T } from '@/utils/theme'
import { useAppStore } from '@/lib/store'
import { useConversations, useMessages, useMessageTemplates, usePatients } from '@/lib/hooks'
import { Card, Badge, Button, Modal, EmptyState, LoadingSpinner, Avatar, getInitials } from '@/components/ui'

const STATUS_ICONS = { queued: Clock, sent: Check, delivered: CheckCheck, read: CheckCheck, failed: null }

export default function MensagensContent() {
  const { clinicPlan } = useAppStore()
  const { data: conversations, loading } = useConversations()
  const { data: templates } = useMessageTemplates()
  const { data: patients } = usePatients()

  const [selectedConvId, setSelectedConvId] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [newMsg, setNewMsg] = useState('')
  const [templateModal, setTemplateModal] = useState(false)
  const [sending, setSending] = useState(false)

  const channel = clinicPlan === 'max' ? 'meta' : 'uazapi'

  const filteredConvs = useMemo(() => {
    if (!searchQ) return conversations
    const q = searchQ.toLowerCase()
    return conversations.filter(c => c.patient?.full_name?.toLowerCase().includes(q) || c.phone?.includes(q))
  }, [conversations, searchQ])

  const selectedConv = conversations.find(c => c.id === selectedConvId)

  // Auto-select first conversation
  useEffect(() => { if (conversations.length > 0 && !selectedConvId) setSelectedConvId(conversations[0].id) }, [conversations, selectedConvId])

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', animation: 'fadeSlideUp 0.25s ease both' }}>
      {/* Conversation List */}
      <div style={{ width: 340, borderRight: `1px solid ${T.n200}`, display: 'flex', flexDirection: 'column', background: T.n0 }}>
        {/* Channel banner */}
        <div style={{ padding: '12px 16px', background: channel === 'meta' ? `${T.primary500}08` : T.waBg, borderBottom: `1px solid ${T.n200}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} color={channel === 'meta' ? T.primary500 : T.wa} />
          <span style={{ fontSize: 12, fontWeight: 600, color: channel === 'meta' ? T.primary500 : T.waDark }}>
            {channel === 'meta' ? 'Meta Business API' : 'UAZAPI (livre)'}
          </span>
          <Badge color={T.success} bg={T.successBg} size="sm">Conectado</Badge>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color={T.n400} style={{ position: 'absolute', left: 10, top: 10 }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar conversa..."
              style={{ width: '100%', padding: '9px 10px 9px 34px', border: `1px solid ${T.n300}`, borderRadius: T.radiusMd, fontSize: 13, fontFamily: T.font, outline: 'none' }} />
          </div>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConvs.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: T.n400, fontSize: 13 }}>Nenhuma conversa</div>
          ) : filteredConvs.map(conv => {
            const isActive = conv.id === selectedConvId
            return (
              <button key={conv.id} onClick={() => setSelectedConvId(conv.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: 'none', background: isActive ? T.primary50 : 'transparent', cursor: 'pointer', fontFamily: T.font, textAlign: 'left', borderBottom: `1px solid ${T.n100}`, transition: 'background 100ms' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.n100 }}
                onMouseLeave={e => { e.currentTarget.style.background = isActive ? T.primary50 : 'transparent' }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={conv.patient?.full_name || conv.phone} size={44} color={T.wa} />
                  {conv.unread_count > 0 && <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: T.wa, color: T.n0, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${T.n0}` }}>{conv.unread_count}</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: conv.unread_count > 0 ? 600 : 400, color: T.n900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.patient?.full_name || conv.phone}</span>
                    <span style={{ fontSize: 11, color: conv.unread_count > 0 ? T.wa : T.n400, flexShrink: 0 }}>{conv.last_message_at ? getRelTime(conv.last_message_at) : ''}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.n400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.phone}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConv ? (
        <ChatView conv={selectedConv} channel={channel} templates={templates} />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.n100 }}>
          <EmptyState icon={MessageSquare} title="Selecione uma conversa" description="Escolha um contato para iniciar" />
        </div>
      )}
    </div>
  )
}

function ChatView({ conv, channel, templates }) {
  const { data: messages, loading, create } = useMessages(conv.id)
  const [newMsg, setNewMsg] = useState('')
  const [templateModal, setTemplateModal] = useState(false)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages])

  const handleSend = async () => {
    if (!newMsg.trim()) return; setSending(true)
    await create({ conversation_id: conv.id, direction: 'outbound', content: newMsg, status: 'sent', message_type: 'text' })
    setNewMsg(''); setSending(false)
  }

  const sendTemplate = async (tpl) => {
    setSending(true)
    await create({ conversation_id: conv.id, direction: 'outbound', content: tpl.content, status: 'sent', message_type: 'template', template_name: tpl.name })
    setTemplateModal(false); setSending(false)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F0F2F5' }}>
      {/* Chat header */}
      <div style={{ padding: '12px 20px', background: T.n0, borderBottom: `1px solid ${T.n200}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={conv.patient?.full_name || conv.phone} size={40} color={T.wa} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{conv.patient?.full_name || conv.phone}</div>
          <div style={{ fontSize: 12, color: T.n400 }}>{conv.phone} • {channel === 'meta' ? 'Meta API' : 'UAZAPI'}</div>
        </div>
        <Button variant="ghost" size="sm" icon={Phone}>Ligar</Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 60px' }}>
        {loading ? <LoadingSpinner /> : messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
            <div style={{
              maxWidth: '65%', padding: '8px 12px', borderRadius: 10,
              background: msg.direction === 'outbound' ? '#DCF8C6' : T.n0,
              boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
              borderTopRightRadius: msg.direction === 'outbound' ? 4 : 10,
              borderTopLeftRadius: msg.direction === 'inbound' ? 4 : 10,
            }}>
              {msg.template_name && <div style={{ fontSize: 10, color: T.primary500, fontWeight: 600, marginBottom: 2 }}>📋 {msg.template_name}</div>}
              <div style={{ fontSize: 14, lineHeight: 1.5, color: T.n900 }}>{msg.content}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: T.n400 }}>{new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.direction === 'outbound' && (() => {
                  const Icon = STATUS_ICONS[msg.status]
                  return Icon ? <Icon size={14} color={msg.status === 'read' ? '#53BDEB' : T.n400} /> : null
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', background: T.n0, borderTop: `1px solid ${T.n200}` }}>
        {channel === 'meta' ? (
          // Meta: template only
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, padding: '10px 14px', background: T.n100, borderRadius: T.radiusMd, fontSize: 13, color: T.n400 }}>
              Canal Meta API — apenas templates aprovados
            </div>
            <Button icon={FileText} variant="wa" onClick={() => setTemplateModal(true)}>Enviar template</Button>
          </div>
        ) : (
          // UAZAPI: free text
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setTemplateModal(true)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: T.n100, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} color={T.n400} /></button>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Digite uma mensagem..." style={{ flex: 1, padding: '10px 14px', border: `1.5px solid ${T.n300}`, borderRadius: 24, fontSize: 14, fontFamily: T.font, outline: 'none' }} />
            <button onClick={handleSend} disabled={!newMsg.trim() || sending}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: T.wa, cursor: newMsg.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: newMsg.trim() ? 1 : 0.5 }}>
              <Send size={18} color={T.n0} />
            </button>
          </div>
        )}
      </div>

      {/* Template Modal */}
      <Modal open={templateModal} onClose={() => setTemplateModal(false)} title="Templates de mensagem" width={500}>
        {templates.length === 0 ? <EmptyState icon={FileText} title="Nenhum template" description="Crie templates em Configurações" /> :
          templates.filter(t => t.is_active).map(tpl => (
            <button key={tpl.id} onClick={() => sendTemplate(tpl)}
              style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', border: `1px solid ${T.n200}`, borderRadius: T.radiusMd, background: T.n0, cursor: 'pointer', fontFamily: T.font, textAlign: 'left', marginBottom: 8, transition: 'all 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.wa; e.currentTarget.style.background = T.waBg }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.n200; e.currentTarget.style.background = T.n0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{tpl.name}</span>
                  <Badge color={tpl.approved ? T.success : T.warning} bg={tpl.approved ? T.successBg : T.warningBg}>{tpl.approved ? 'Aprovado' : 'Pendente'}</Badge>
                </div>
                <div style={{ fontSize: 13, color: T.n500, lineHeight: 1.4 }}>{tpl.content?.slice(0, 120)}...</div>
              </div>
              <ArrowRight size={16} color={T.n300} style={{ marginTop: 4, flexShrink: 0 }} />
            </button>
          ))
        }
      </Modal>
    </div>
  )
}

function getRelTime(dateStr) {
  const d = Date.now() - new Date(dateStr).getTime(), m = Math.floor(d / 60000)
  if (m < 1) return 'agora'; if (m < 60) return `${m} min`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}
