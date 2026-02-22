import { useState, useMemo } from 'react'
import { Activity, AlertCircle, ArrowLeft, ArrowRight, BookOpen, Calendar, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, ClipboardList, Clock, DollarSign, Download, Edit3, Eye, File, FileBarChart, FileImage, FileText, FileType, LayoutDashboard, List, Loader2, Lock, MessageSquare, MoreHorizontal, Paperclip, PenLine, Plus, Printer, Search, ShieldCheck, Stethoscope, Trash2, Upload, User, Users, X } from 'lucide-react'
import { T } from '@/utils/theme'
import { Button, Modal, InputField, SelectField, Badge, Card, Avatar, EmptyState, LoadingSpinner, getInitials } from '@/components/ui'
import { useMedicalRecords, usePatients, useProfessionals } from '@/lib/hooks'

/* ─── Design Tokens ─── */

/* ─── Professionals ─── */
const PROFS = [
  { id: 1, name: "Dra. Ana Costa", specialty: "Psicologia", crp: "CRP 06/12345", color: "#3F6BFF" },
  { id: 2, name: "Dr. Carlos Lima", specialty: "Fisioterapia", crp: "CREFITO 12345", color: "#16A34A" },
  { id: 3, name: "Dra. Beatriz Rocha", specialty: "Fonoaudiologia", crp: "CRFa 2-1234", color: "#F59E0B" },
  { id: 4, name: "Dr. Ricardo Alves", specialty: "Terapia Ocupacional", crp: "CREFITO 67890", color: "#9333EA" },
];

/* ─── Mock Patients with Records ─── */
const PATIENTS_WITH_RECORDS = [
  { id: 1, name: "Maria Silva", cpf: "123.456.789-00", phone: "(11) 99876-5432", convenio: "Unimed", recordCount: 12, lastRecord: "2025-01-20", professional: PROFS[0] },
  { id: 2, name: "João Pereira", cpf: "987.654.321-00", phone: "(11) 98765-1234", convenio: "Particular", recordCount: 6, lastRecord: "2025-01-18", professional: PROFS[1] },
  { id: 3, name: "Lucia Fernandes", cpf: "456.789.123-00", phone: "(11) 97654-3210", convenio: "Bradesco Saúde", recordCount: 18, lastRecord: "2025-01-20", professional: PROFS[2] },
  { id: 4, name: "Pedro Santos", cpf: "789.123.456-00", phone: "(11) 96543-2109", convenio: "Particular", recordCount: 4, lastRecord: "2025-01-10", professional: PROFS[0] },
  { id: 5, name: "Ana Oliveira", cpf: "321.654.987-00", phone: "(11) 95432-1098", convenio: "Amil", recordCount: 24, lastRecord: "2025-01-19", professional: PROFS[0] },
  { id: 6, name: "Roberto Gomes", cpf: "654.987.321-00", phone: "(11) 94321-0987", convenio: "SulAmérica", recordCount: 8, lastRecord: "2025-01-05", professional: PROFS[3] },
  { id: 7, name: "Camila Souza", cpf: "369.147.258-00", phone: "(21) 99887-6655", convenio: "Porto Seguro", recordCount: 10, lastRecord: "2025-01-17", professional: PROFS[1] },
  { id: 8, name: "Bruno Almeida", cpf: "741.852.963-00", phone: "(11) 98877-6644", convenio: "Particular", recordCount: 3, lastRecord: "2025-01-12", professional: PROFS[3] },
];

/* ─── Mock Records for a patient ─── */
function generateRecords(patientName, profName) {
  const evolutions = [
    "Paciente apresentou melhora significativa nos sintomas de ansiedade relatados na sessão anterior. Reporta que as técnicas de respiração têm sido úteis no dia a dia. Mantém dificuldade para dormir, mas com redução na frequência de episódios de insônia.\n\nConduta: Manter técnicas de respiração diafragmática. Introduzir exercícios de higiene do sono. Reavaliar na próxima sessão.",
    "Sessão focada em reestruturação cognitiva. Trabalhamos os pensamentos automáticos negativos identificados no registro de pensamentos da semana. Paciente demonstra boa capacidade de identificar distorções cognitivas, porém ainda apresenta dificuldade em gerar pensamentos alternativos.\n\nConduta: Continuar registro de pensamentos. Praticar geração de pensamentos alternativos com exercícios dirigidos.",
    "Paciente relata episódio de crise de ansiedade no trabalho durante a semana. Conseguiu utilizar técnicas de grounding aprendidas em sessão. Discutimos gatilhos e estratégias de enfrentamento. Humor estável, sem ideação suicida.\n\nConduta: Reforçar técnicas de grounding. Elaborar plano de manejo de crises para contexto de trabalho.",
    "Revisão de progresso terapêutico. Paciente reconhece avanços em autoconhecimento e regulação emocional. Discutimos objetivos para a próxima fase do tratamento. Paciente demonstra interesse em trabalhar questões familiares.\n\nConduta: Iniciar abordagem de dinâmica familiar na próxima sessão. Solicitar que paciente traga genograma simplificado.",
    "Primeira sessão de abordagem familiar. Paciente trouxe genograma conforme solicitado. Identificamos padrões de comunicação disfuncionais e papéis rígidos no sistema familiar. Paciente demonstra insight sobre repetição de padrões.\n\nConduta: Aprofundar análise do genograma. Trabalhar diferenciação do self.",
    "Sessão de acompanhamento. Paciente relata estabilidade emocional e melhora na qualidade do sono. Apliquei escala BAI — pontuação 12 (ansiedade leve), comparado com 28 (ansiedade moderada) na avaliação inicial.\n\nConduta: Manter frequência semanal. Reavaliar com BAI em 4 semanas.",
  ];

  const dates = [
    "2025-01-20", "2025-01-13", "2025-01-06", "2024-12-16", "2024-12-09", "2024-12-02",
  ];

  const files = [
    [],
    [{ name: "registro-pensamentos-semana3.pdf", size: "245 KB", type: "pdf" }],
    [],
    [{ name: "plano-terapeutico-atualizado.pdf", size: "180 KB", type: "pdf" }],
    [
      { name: "genograma-familiar.png", size: "1.2 MB", type: "image" },
      { name: "anotacoes-familia.pdf", size: "95 KB", type: "pdf" },
    ],
    [{ name: "escala-bai-aplicacao2.pdf", size: "120 KB", type: "pdf" }],
  ];

  return dates.map((date, i) => ({
    id: i + 1,
    date,
    time: "09:00",
    patient: patientName,
    professional: PROFS[0],
    service: "Psicoterapia",
    evolution: evolutions[i],
    files: files[i],
    signed: i > 0,
    signedAt: i > 0 ? `${date} 09:55` : null,
  }));
}

/* ─── Sidebar ─── */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "pacientes", label: "Pacientes", icon: Users },
  { id: "prontuarios", label: "Prontuários", icon: FileText },
  { id: "mensagens", label: "Mensagens", icon: MessageSquare },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "relatorios", label: "Relatórios", icon: FileBarChart },
];


/* ─── File Icon Helper ─── */
function FileIcon({ type, size = 16 }) {
  if (type === "image") return <FileImage size={size} color={T.purple} />;
  if (type === "pdf") return <FileType size={size} color={T.error} />;
  return <File size={size} color={T.n400} />;
}

/* ═══════════════ RICH TEXT EDITOR (simplified) ═══════════════ */
function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState(new Set());

  const execCommand = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const formats = new Set();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("insertUnorderedList")) formats.add("ul");
    if (document.queryCommandState("insertOrderedList")) formats.add("ol");
    setActiveFormats(formats);
  };

  const ToolBtn = ({ cmd, icon: Icon, label }) => {
    const active = activeFormats.has(cmd);
    return (
      <button onClick={() => execCommand(cmd === "ul" ? "insertUnorderedList" : cmd === "ol" ? "insertOrderedList" : cmd)}
        title={label} type="button"
        style={{
          width: 32, height: 32, borderRadius: 6, border: "none",
          background: active ? T.primary50 : "transparent",
          color: active ? T.primary500 : T.n400,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 150ms",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.n100; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? T.primary50 : "transparent"; }}>
        <Icon size={16} />
      </button>
    );
  };

  return (
    <div style={{
      border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, overflow: "hidden",
      transition: "border 200ms",
    }}
      onFocus={() => {}}
    >
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 2, padding: "6px 8px",
        background: T.n100, borderBottom: `1px solid ${T.n200}`,
      }}>
        <ToolBtn cmd="bold" icon={Bold} label="Negrito" />
        <ToolBtn cmd="italic" icon={Italic} label="Itálico" />
        <ToolBtn cmd="underline" icon={Underline} label="Sublinhado" />
        <div style={{ width: 1, height: 20, background: T.n300, margin: "0 4px" }} />
        <ToolBtn cmd="ul" icon={List} label="Lista" />
        <ToolBtn cmd="ol" icon={ListOrdered} label="Lista numerada" />
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        style={{
          minHeight: 200, padding: "14px 16px", fontSize: 14, lineHeight: 1.7,
          fontFamily: T.font, color: T.n900, outline: "none",
          overflowY: "auto", maxHeight: 400,
        }}
        data-placeholder={placeholder}
      />

          </div>
  );
}

/* ═══════════════ FILE UPLOAD AREA ═══════════════ */
function FileUploadArea({ files, onAdd, onRemove }) {
  const [dragOver, setDragOver] = useState(false);

  const handleAddFiles = () => {
    const mockFiles = [
      { name: `documento-${Date.now()}.pdf`, size: `${Math.floor(Math.random() * 500 + 50)} KB`, type: "pdf" },
    ];
    onAdd(mockFiles);
  };

  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 8 }}>
        Arquivos anexos
      </label>

      {/* Drop zone */}
      <div
        onClick={handleAddFiles}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleAddFiles(); }}
        style={{
          border: `2px dashed ${dragOver ? T.primary500 : T.n300}`,
          borderRadius: T.radiusMd, padding: "20px 16px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          cursor: "pointer", transition: "all 200ms",
          background: dragOver ? T.primary50 : T.n100,
        }}
      >
        <FileUp size={24} color={dragOver ? T.primary500 : T.n400} />
        <span style={{ fontSize: 13, color: dragOver ? T.primary500 : T.n400, fontWeight: 500 }}>
          Clique ou arraste arquivos aqui
        </span>
        <span style={{ fontSize: 11, color: T.n400 }}>PDF, JPEG, PNG — máx. 25MB por arquivo</span>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
              background: T.n0, border: `1px solid ${T.n200}`, borderRadius: T.radiusMd,
            }}>
              <FileIcon type={f.type} size={18} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.n900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <div style={{ fontSize: 11, color: T.n400 }}>{f.size}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onRemove(i); }} style={{
                width: 24, height: 24, borderRadius: 4, border: "none", background: "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: T.n400, transition: "all 150ms",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = T.error; e.currentTarget.style.background = "rgba(220,38,38,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = T.n400; e.currentTarget.style.background = "transparent"; }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ NEW RECORD MODAL ═══════════════ */
function NewRecordModal({ open, onClose, patient }) {
  const [evolution, setEvolution] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (open) { setEvolution(""); setFiles([]); setSaving(false); setSigning(false); }
  }, [open]);

  const handleSave = (sign = false) => {
    if (sign) setSigning(true); else setSaving(true);
    setTimeout(() => { setSaving(false); setSigning(false); onClose("saved"); }, 1200);
  };

  if (!open) return null;

  return (
    <div onClick={() => onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(17,17,17,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)", animation: "fadeIn 150ms ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 720, background: T.n0, borderRadius: T.radiusLg,
        boxShadow: T.shadowLg, overflow: "hidden", animation: "slideUp 250ms ease",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: `1px solid ${T.n200}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Nova evolução</h2>
            {patient && <div style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>{patient.name} · {patient.professional.name}</div>}
          </div>
          <button onClick={() => onClose()} style={{
            width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
            background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: T.n400,
          }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Session info */}
          <div style={{
            display: "flex", gap: 12, marginBottom: 20, padding: "14px 16px",
            background: T.n100, borderRadius: T.radiusMd, border: `1px solid ${T.n200}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: T.n400, marginBottom: 3 }}>Data da sessão</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>{new Date().toLocaleDateString("pt-BR")}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: T.n400, marginBottom: 3 }}>Serviço</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>Psicoterapia — 50min</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: T.n400, marginBottom: 3 }}>Profissional</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.n900 }}>{patient?.professional.name || "Dra. Ana Costa"}</div>
            </div>
          </div>

          {/* Evolution editor */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.n700, marginBottom: 8 }}>
              Nota de evolução *
            </label>
            <RichTextEditor
              value={evolution}
              onChange={setEvolution}
              placeholder="Descreva a evolução do paciente nesta sessão. Inclua observações clínicas, conduta e plano terapêutico..."
            />
          </div>

          {/* File upload */}
          <FileUploadArea
            files={files}
            onAdd={(newFiles) => setFiles(f => [...f, ...newFiles])}
            onRemove={(idx) => setFiles(f => f.filter((_, i) => i !== idx))}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${T.n200}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 12, color: T.n400, display: "flex", alignItems: "center", gap: 5 }}>
            <ShieldCheck size={14} />
            A assinatura digital vincula este registro ao profissional
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onClose()} style={{
              padding: "11px 18px", borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`,
              background: T.n0, color: T.n700, fontFamily: T.font, fontSize: 14, fontWeight: 500,
              cursor: "pointer",
            }}>Cancelar</button>
            <button onClick={() => handleSave(false)} disabled={saving || signing} style={{
              padding: "11px 18px", borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`,
              background: T.n0, color: T.n700, fontFamily: T.font, fontSize: 14, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? <Loader2 size={15} className="spin" /> : <Edit3 size={14} />}
              Salvar rascunho
            </button>
            <button onClick={() => handleSave(true)} disabled={saving || signing} style={{
              padding: "11px 20px", borderRadius: T.radiusMd, border: "none",
              background: T.primary500, color: T.n0, fontFamily: T.font, fontSize: 14, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
              opacity: signing ? 0.7 : 1, transition: "all 200ms",
            }}
              onMouseEnter={e => { if (!signing) e.currentTarget.style.background = T.primary600; }}
              onMouseLeave={e => e.currentTarget.style.background = T.primary500}>
              {signing ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
              Salvar e assinar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ RECORD DETAIL VIEW ═══════════════ */
function RecordDetailView({ record, onBack }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease both" }}>
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, border: "none", background: "none",
        cursor: "pointer", fontFamily: T.font, fontSize: 13, color: T.n400, padding: 0,
        marginBottom: 16, fontWeight: 500,
      }}
        onMouseEnter={e => e.currentTarget.style.color = T.primary500}
        onMouseLeave={e => e.currentTarget.style.color = T.n400}>
        <ArrowLeft size={15} /> Voltar ao histórico
      </button>

      <div style={{
        background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`,
        boxShadow: T.shadowSoft, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${T.n200}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.n900 }}>
                Sessão de {new Date(record.date).toLocaleDateString("pt-BR")}
              </h2>
              {record.signed ? (
                <Badge color={T.success} bg="rgba(22,163,74,0.10)"><Lock size={11} /> Assinado</Badge>
              ) : (
                <Badge color={T.warning} bg="rgba(245,158,11,0.10)"><Edit3 size={11} /> Rascunho</Badge>
              )}
            </div>
            <div style={{ fontSize: 13, color: T.n400, display: "flex", alignItems: "center", gap: 12 }}>
              <span>{record.service} · {record.time}</span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Stethoscope size={12} /> {record.professional.name}
              </span>
              {record.signedAt && <>
                <span>•</span>
                <span>Assinado em {record.signedAt}</span>
              </>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{
              width: 36, height: 36, borderRadius: T.radiusMd, border: `1px solid ${T.n300}`,
              background: T.n0, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: T.n400,
            }} title="Imprimir"><Printer size={16} /></button>
            <button style={{
              width: 36, height: 36, borderRadius: T.radiusMd, border: `1px solid ${T.n300}`,
              background: T.n0, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: T.n400,
            }} title="Exportar PDF"><Download size={16} /></button>
          </div>
        </div>

        {/* Evolution content */}
        <div style={{ padding: "24px 28px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.n900, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <PenLine size={15} /> Nota de evolução
          </h3>
          <div style={{
            fontSize: 14, lineHeight: 1.8, color: T.n700, whiteSpace: "pre-wrap",
            padding: "18px 20px", background: T.n100, borderRadius: T.radiusMd,
            border: `1px solid ${T.n200}`,
          }}>
            {record.evolution}
          </div>

          {/* Attached files */}
          {record.files.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: T.n900, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Paperclip size={15} /> Arquivos anexos ({record.files.length})
              </h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {record.files.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                    background: T.n0, border: `1px solid ${T.n200}`, borderRadius: T.radiusMd,
                    cursor: "pointer", transition: "all 150ms", minWidth: 200,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary500; e.currentTarget.style.background = T.primary50; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.n200; e.currentTarget.style.background = T.n0; }}>
                    <FileIcon type={f.type} size={20} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: T.n900 }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: T.n400 }}>{f.size}</div>
                    </div>
                    <Download size={14} color={T.n400} style={{ marginLeft: "auto" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature */}
          {record.signed && (
            <div style={{
              marginTop: 24, padding: "14px 18px", background: "rgba(22,163,74,0.04)",
              borderRadius: T.radiusMd, border: `1px solid rgba(22,163,74,0.15)`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <ShieldCheck size={20} color={T.success} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.success }}>Registro assinado digitalmente</div>
                <div style={{ fontSize: 12, color: T.n400, marginTop: 1 }}>
                  {record.professional.name} · {record.professional.crp} · {record.signedAt}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ PATIENT RECORDS TIMELINE ═══════════════ */
function PatientRecordsView({ patient, onBack }) {
  const records = useMemo(() => generateRecords(patient.name, patient.professional.name), [patient.id]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (selectedRecord) {
    return (
      <div style={{ padding: "24px 28px" }}>
        <RecordDetailView record={selectedRecord} onBack={() => setSelectedRecord(null)} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Breadcrumb */}
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 6, border: "none", background: "none",
        cursor: "pointer", fontFamily: T.font, fontSize: 13, color: T.n400, padding: 0,
        marginBottom: 20, fontWeight: 500,
      }}
        onMouseEnter={e => e.currentTarget.style.color = T.primary500}
        onMouseLeave={e => e.currentTarget.style.color = T.n400}>
        <ArrowLeft size={15} /> Voltar para prontuários
      </button>

      {/* Patient header */}
      <div style={{
        background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`,
        boxShadow: T.shadowSoft, padding: "20px 24px", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "fadeSlideUp 0.3s ease both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: `linear-gradient(135deg, ${patient.professional.color}cc, ${patient.professional.color})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.n0, fontSize: 18, fontWeight: 700, flexShrink: 0,
          }}>{patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: T.n900 }}>{patient.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 3, fontSize: 13, color: T.n400 }}>
              <span>{patient.convenio}</span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Stethoscope size={12} /> {patient.professional.name}</span>
              <span>•</span>
              <span>{patient.recordCount} registros</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            padding: "9px 16px", borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`,
            background: T.n0, color: T.n700, fontFamily: T.font, fontSize: 13, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
          }}><Download size={14} /> Exportar PDF</button>
          <button onClick={() => setModalOpen(true)} style={{
            padding: "9px 18px", borderRadius: T.radiusMd, border: "none",
            background: T.primary500, color: T.n0, fontFamily: T.font, fontSize: 13,
            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            transition: "all 200ms",
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.primary600}
            onMouseLeave={e => e.currentTarget.style.background = T.primary500}>
            <Plus size={15} /> Nova evolução
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: 10, top: 8, bottom: 8,
          width: 2, background: T.n200, borderRadius: 1,
        }} />

        {records.map((rec, i) => (
          <div key={rec.id} style={{
            position: "relative", marginBottom: 16,
            animation: `fadeSlideUp 0.35s ease ${i * 0.05}s both`,
          }}>
            {/* Timeline dot */}
            <div style={{
              position: "absolute", left: -22, top: 22,
              width: 12, height: 12, borderRadius: "50%",
              background: rec.signed ? T.success : T.warning,
              border: `3px solid ${T.n0}`,
              boxShadow: `0 0 0 2px ${rec.signed ? "rgba(22,163,74,0.2)" : "rgba(245,158,11,0.2)"}`,
            }} />

            {/* Record card */}
            <div
              onClick={() => setSelectedRecord(rec)}
              style={{
                background: T.n0, borderRadius: T.radiusMd, border: `1px solid ${T.n200}`,
                boxShadow: T.shadowSoft, overflow: "hidden", cursor: "pointer",
                transition: "all 200ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = T.n300; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadowSoft; e.currentTarget.style.borderColor = T.n200; }}>
              {/* Card header */}
              <div style={{
                padding: "14px 18px", display: "flex", alignItems: "center",
                justifyContent: "space-between", borderBottom: `1px solid ${T.n100}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CalendarDays size={15} color={T.n400} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.n900 }}>
                    {new Date(rec.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                  <span style={{ fontSize: 12, color: T.n400 }}>{rec.time}</span>
                  <span style={{ fontSize: 12, color: T.n400 }}>·</span>
                  <span style={{ fontSize: 12, color: T.n400 }}>{rec.service}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {rec.files.length > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: T.n400 }}>
                      <Paperclip size={12} /> {rec.files.length}
                    </span>
                  )}
                  {rec.signed ? (
                    <Badge color={T.success} bg="rgba(22,163,74,0.10)"><Lock size={10} /> Assinado</Badge>
                  ) : (
                    <Badge color={T.warning} bg="rgba(245,158,11,0.10)"><Edit3 size={10} /> Rascunho</Badge>
                  )}
                </div>
              </div>

              {/* Card body - evolution preview */}
              <div style={{
                padding: "14px 18px", fontSize: 13, color: T.n700, lineHeight: 1.6,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {rec.evolution}
              </div>

              {/* Card footer - files preview */}
              {rec.files.length > 0 && (
                <div style={{
                  padding: "10px 18px", borderTop: `1px solid ${T.n100}`,
                  display: "flex", gap: 8, flexWrap: "wrap",
                }}>
                  {rec.files.map((f, fi) => (
                    <span key={fi} style={{
                      display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
                      background: T.n100, borderRadius: 4, fontSize: 11, color: T.n400, fontWeight: 500,
                    }}>
                      <FileIcon type={f.type} size={12} /> {f.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <NewRecordModal open={modalOpen} onClose={() => setModalOpen(false)} patient={patient} />
    </div>
  );
}

/* ═══════════════ RECORDS LIST (main view) ═══════════════ */
export default function Prontuarios() {
  const [search, setSearch] = useState("");
  const [profFilter, setProfFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const filtered = useMemo(() => {
    return PATIENTS_WITH_RECORDS.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
        || p.cpf.includes(search);
      const matchProf = profFilter === "all" || p.professional.id === Number(profFilter);
      return matchSearch && matchProf;
    });
  }, [search, profFilter]);

  if (selectedPatient) {
    return <PatientRecordsView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, animation: "fadeSlideUp 0.3s ease both",
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.n900 }}>Prontuários</h1>
          <p style={{ fontSize: 13, color: T.n400, marginTop: 2 }}>Registros clínicos por paciente</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
        animation: "fadeSlideUp 0.35s ease 0.05s both",
      }}>
        <div style={{
          flex: 1, maxWidth: 360, display: "flex", alignItems: "center",
          border: `1.5px solid ${T.n300}`, borderRadius: T.radiusMd, background: T.n0, overflow: "hidden",
        }}>
          <span style={{ paddingLeft: 12, color: T.n400, display: "flex" }}><Search size={16} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar paciente por nome ou CPF..."
            style={{
              flex: 1, border: "none", outline: "none", padding: "10px 12px",
              fontSize: 13, fontFamily: T.font, color: T.n900, background: "transparent",
            }} />
          {search && <button onClick={() => setSearch("")} style={{
            border: "none", background: "none", cursor: "pointer", padding: "0 10px",
            color: T.n400, display: "flex",
          }}><X size={14} /></button>}
        </div>

        <select value={profFilter} onChange={e => setProfFilter(e.target.value)}
          style={{
            padding: "9px 12px", borderRadius: T.radiusMd, border: `1.5px solid ${T.n300}`,
            background: T.n0, fontFamily: T.font, fontSize: 13, color: T.n700,
            cursor: "pointer", outline: "none", appearance: "auto",
          }}>
          <option value="all">Todos os profissionais</option>
          {PROFS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <span style={{ fontSize: 12, color: T.n400, marginLeft: "auto" }}>{filtered.length} pacientes</span>
      </div>

      {/* Patients grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340, 1fr))", gap: 14,
        animation: "fadeSlideUp 0.4s ease 0.1s both",
      }}>
        {filtered.map((p, i) => (
          <div key={p.id}
            onClick={() => setSelectedPatient(p)}
            style={{
              background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`,
              boxShadow: T.shadowSoft, padding: "20px", cursor: "pointer",
              transition: "all 200ms",
              animation: `fadeSlideUp 0.3s ease ${i * 0.04}s both`,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = T.n300; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadowSoft; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = T.n200; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: `linear-gradient(135deg, ${p.professional.color}cc, ${p.professional.color})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.n0, fontSize: 15, fontWeight: 700, flexShrink: 0,
              }}>{p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.n900 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: T.n400, marginTop: 1 }}>CPF: {p.cpf}</div>
              </div>
              <ArrowRight size={16} color={T.n300} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, padding: "10px 12px", background: T.n100, borderRadius: T.radiusSm,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.n900 }}>{p.recordCount}</div>
                <div style={{ fontSize: 11, color: T.n400, marginTop: 1 }}>Registros</div>
              </div>
              <div style={{
                flex: 1, padding: "10px 12px", background: T.n100, borderRadius: T.radiusSm,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.n900 }}>
                  {new Date(p.lastRecord).toLocaleDateString("pt-BR")}
                </div>
                <div style={{ fontSize: 11, color: T.n400, marginTop: 1 }}>Último registro</div>
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 6, marginTop: 12,
              fontSize: 12, color: T.n400,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.professional.color }} />
              {p.professional.name} · {p.professional.specialty}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{
          padding: "64px 20px", textAlign: "center", color: T.n400,
          background: T.n0, borderRadius: T.radiusLg, border: `1px solid ${T.n200}`,
        }}>
          <BookOpen size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Nenhum prontuário encontrado</div>
          <div style={{ fontSize: 13 }}>Tente alterar os filtros de busca</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ MAIN EXPORT ═══════════════ */


