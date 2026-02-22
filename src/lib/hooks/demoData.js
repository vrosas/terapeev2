// ═══ Demo Data — Used when Supabase is not configured ═══
// Mirrors the seed SQL data as JavaScript objects

const today = new Date()
const fmt = (d) => d.toISOString()
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const setTime = (d, h, m) => { const r = new Date(d); r.setHours(h, m, 0, 0); return r }

export const DEMO = {
  // ─── Professionals ───
  professionals: [
    { id: 'prof-1', full_name: 'Dra. Renata Oliveira', email: 'renata@menteevida.com.br', phone: '(11) 99876-5432', crp: 'CRP 06/123456', specialties: ['TCC', 'Ansiedade', 'Depressão'], color: '#3F6BFF', session_price: 280, session_duration: 50, is_active: true, bio: 'Psicóloga clínica com 12 anos de experiência em TCC.' },
    { id: 'prof-2', full_name: 'Dr. Marcos Silva', email: 'marcos@menteevida.com.br', phone: '(11) 99765-4321', crp: 'CRP 06/654321', specialties: ['Psicanálise', 'Terapia de Casal'], color: '#9333EA', session_price: 320, session_duration: 50, is_active: true, bio: 'Psicanalista com foco em dinâmica relacional.' },
    { id: 'prof-3', full_name: 'Dra. Camila Santos', email: 'camila@menteevida.com.br', phone: '(11) 99654-3210', crp: 'CRP 06/789012', specialties: ['Psicologia Infantil', 'Ludoterapia', 'TDAH'], color: '#EC4899', session_price: 250, session_duration: 45, is_active: true, bio: 'Especialista em psicologia infantil.' },
    { id: 'prof-4', full_name: 'Dr. André Costa', email: 'andre@menteevida.com.br', phone: '(11) 99543-2109', crp: 'CRP 06/345678', specialties: ['Neuropsicologia', 'Avaliação Psicológica'], color: '#F97316', session_price: 350, session_duration: 60, is_active: true, bio: 'Neuropsicólogo com experiência em avaliação cognitiva.' },
  ],

  // ─── Patients ───
  patients: [
    { id: 'pat-1', full_name: 'Ana Beatriz Costa', email: 'ana.costa@email.com', phone: '(11) 99111-2233', cpf: '123.456.789-00', birth_date: '1992-03-15', gender: 'F', assigned_professional_id: 'prof-1', assigned_professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira', color: '#3F6BFF' }, status: 'active', therapy_type: 'TCC', session_frequency: 'semanal', session_price: 280, health_insurance: null, intake_date: '2024-06-10', tags: ['ansiedade', 'regular'] },
    { id: 'pat-2', full_name: 'Carlos Eduardo Lima', email: 'carlos.lima@email.com', phone: '(11) 99222-3344', cpf: '234.567.890-01', birth_date: '1985-07-22', gender: 'M', assigned_professional_id: 'prof-2', assigned_professional: { id: 'prof-2', full_name: 'Dr. Marcos Silva', color: '#9333EA' }, status: 'active', therapy_type: 'Terapia de Casal', session_frequency: 'quinzenal', session_price: 400, health_insurance: 'Unimed', intake_date: '2024-08-05', tags: ['casal'] },
    { id: 'pat-3', full_name: 'Mariana Santos', email: 'mariana.santos@email.com', phone: '(11) 99333-4455', cpf: '345.678.901-02', birth_date: '2015-11-30', gender: 'F', assigned_professional_id: 'prof-3', assigned_professional: { id: 'prof-3', full_name: 'Dra. Camila Santos', color: '#EC4899' }, status: 'active', therapy_type: 'Ludoterapia', session_frequency: 'semanal', session_price: 250, health_insurance: 'Bradesco Saúde', intake_date: '2024-09-12', tags: ['infantil', 'tdah'] },
    { id: 'pat-4', full_name: 'Pedro Henrique Alves', email: 'pedro.alves@email.com', phone: '(11) 99444-5566', cpf: '456.789.012-03', birth_date: '1998-01-08', gender: 'M', assigned_professional_id: 'prof-1', assigned_professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira', color: '#3F6BFF' }, status: 'active', therapy_type: 'TCC', session_frequency: 'semanal', session_price: 280, health_insurance: null, intake_date: '2024-10-20', tags: ['depressão', 'jovem-adulto'] },
    { id: 'pat-5', full_name: 'Juliana Mendes', email: 'juliana.mendes@email.com', phone: '(11) 99555-6677', cpf: '567.890.123-04', birth_date: '1990-05-18', gender: 'F', assigned_professional_id: 'prof-2', assigned_professional: { id: 'prof-2', full_name: 'Dr. Marcos Silva', color: '#9333EA' }, status: 'active', therapy_type: 'Psicanálise', session_frequency: 'semanal', session_price: 320, health_insurance: 'Amil', intake_date: '2024-04-15', tags: ['psicanálise', 'regular'] },
    { id: 'pat-6', full_name: 'Roberto Ferreira', email: 'roberto.f@email.com', phone: '(11) 99666-7788', cpf: '678.901.234-05', birth_date: '1978-09-03', gender: 'M', assigned_professional_id: 'prof-4', assigned_professional: { id: 'prof-4', full_name: 'Dr. André Costa', color: '#F97316' }, status: 'active', therapy_type: 'Neuropsicologia', session_frequency: 'mensal', session_price: 350, health_insurance: null, intake_date: '2024-11-01', tags: ['avaliação'] },
    { id: 'pat-7', full_name: 'Fernanda Ribeiro', email: 'fernanda.r@email.com', phone: '(11) 99777-8899', cpf: '789.012.345-06', birth_date: '1988-12-25', gender: 'F', assigned_professional_id: 'prof-1', assigned_professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira', color: '#3F6BFF' }, status: 'inactive', therapy_type: 'TCC', session_frequency: 'quinzenal', session_price: 280, health_insurance: 'SulAmérica', intake_date: '2023-03-10', tags: ['alta'] },
    { id: 'pat-8', full_name: 'Lucas Oliveira', email: 'lucas.o@email.com', phone: '(11) 99888-9900', cpf: '890.123.456-07', birth_date: '2010-04-14', gender: 'M', assigned_professional_id: 'prof-3', assigned_professional: { id: 'prof-3', full_name: 'Dra. Camila Santos', color: '#EC4899' }, status: 'waitlist', therapy_type: 'Psicologia Infantil', session_frequency: null, session_price: 250, health_insurance: null, intake_date: null, tags: ['fila-espera', 'infantil'] },
  ],

  // ─── Appointments ───
  appointments: [
    { id: 'apt-1', patient_id: 'pat-1', professional_id: 'prof-1', patient: { id: 'pat-1', full_name: 'Ana Beatriz Costa', phone: '(11) 99111-2233' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira', color: '#3F6BFF', session_duration: 50 }, start_time: fmt(setTime(today, 9, 0)), end_time: fmt(setTime(today, 9, 50)), status: 'confirmed', type: 'regular', modality: 'in_person', price: 280, room: 'Sala 1' },
    { id: 'apt-2', patient_id: 'pat-4', professional_id: 'prof-1', patient: { id: 'pat-4', full_name: 'Pedro Henrique Alves', phone: '(11) 99444-5566' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira', color: '#3F6BFF', session_duration: 50 }, start_time: fmt(setTime(today, 10, 0)), end_time: fmt(setTime(today, 10, 50)), status: 'scheduled', type: 'regular', modality: 'in_person', price: 280, room: 'Sala 1' },
    { id: 'apt-3', patient_id: 'pat-3', professional_id: 'prof-3', patient: { id: 'pat-3', full_name: 'Mariana Santos', phone: '(11) 99333-4455' }, professional: { id: 'prof-3', full_name: 'Dra. Camila Santos', color: '#EC4899', session_duration: 45 }, start_time: fmt(setTime(today, 14, 0)), end_time: fmt(setTime(today, 14, 45)), status: 'confirmed', type: 'regular', modality: 'in_person', price: 250, room: 'Sala Kids' },
    { id: 'apt-4', patient_id: 'pat-5', professional_id: 'prof-2', patient: { id: 'pat-5', full_name: 'Juliana Mendes', phone: '(11) 99555-6677' }, professional: { id: 'prof-2', full_name: 'Dr. Marcos Silva', color: '#9333EA', session_duration: 50 }, start_time: fmt(setTime(today, 15, 0)), end_time: fmt(setTime(today, 15, 50)), status: 'scheduled', type: 'regular', modality: 'online', price: 320, room: null },
    { id: 'apt-5', patient_id: 'pat-6', professional_id: 'prof-4', patient: { id: 'pat-6', full_name: 'Roberto Ferreira', phone: '(11) 99666-7788' }, professional: { id: 'prof-4', full_name: 'Dr. André Costa', color: '#F97316', session_duration: 60 }, start_time: fmt(setTime(addDays(today, 1), 9, 0)), end_time: fmt(setTime(addDays(today, 1), 10, 0)), status: 'scheduled', type: 'follow_up', modality: 'in_person', price: 350, room: 'Sala 2' },
    { id: 'apt-6', patient_id: 'pat-2', professional_id: 'prof-2', patient: { id: 'pat-2', full_name: 'Carlos Eduardo Lima', phone: '(11) 99222-3344' }, professional: { id: 'prof-2', full_name: 'Dr. Marcos Silva', color: '#9333EA', session_duration: 50 }, start_time: fmt(setTime(addDays(today, 1), 11, 0)), end_time: fmt(setTime(addDays(today, 1), 11, 50)), status: 'confirmed', type: 'regular', modality: 'in_person', price: 400, room: 'Sala 3' },
    // Past
    { id: 'apt-7', patient_id: 'pat-1', professional_id: 'prof-1', patient: { id: 'pat-1', full_name: 'Ana Beatriz Costa', phone: '(11) 99111-2233' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira', color: '#3F6BFF', session_duration: 50 }, start_time: fmt(setTime(addDays(today, -7), 9, 0)), end_time: fmt(setTime(addDays(today, -7), 9, 50)), status: 'completed', type: 'regular', modality: 'in_person', price: 280, room: 'Sala 1' },
    { id: 'apt-8', patient_id: 'pat-4', professional_id: 'prof-1', patient: { id: 'pat-4', full_name: 'Pedro Henrique Alves', phone: '(11) 99444-5566' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira', color: '#3F6BFF', session_duration: 50 }, start_time: fmt(setTime(addDays(today, -7), 10, 0)), end_time: fmt(setTime(addDays(today, -7), 10, 50)), status: 'completed', type: 'regular', modality: 'in_person', price: 280, room: 'Sala 1' },
  ],

  // ─── Medical Records ───
  medicalRecords: [
    { id: 'rec-1', patient_id: 'pat-1', professional_id: 'prof-1', patient: { id: 'pat-1', full_name: 'Ana Beatriz Costa' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira' }, session_number: 4, date: addDays(today, -7).toISOString().split('T')[0], content: 'Paciente relata episódio de ansiedade no trabalho, mas conseguiu aplicar técnicas aprendidas. Discussão sobre assertividade. Progresso consistente.', mood_score: 7, techniques_used: ['Treino de assertividade', 'Role-playing'], topics: ['Assertividade', 'Trabalho', 'Progresso'], homework: 'Praticar comunicação assertiva em uma situação da semana', is_signed: true },
    { id: 'rec-2', patient_id: 'pat-1', professional_id: 'prof-1', patient: { id: 'pat-1', full_name: 'Ana Beatriz Costa' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira' }, session_number: 3, date: addDays(today, -14).toISOString().split('T')[0], content: 'Melhora na qualidade do sono após exercícios de respiração. Paciente relata menor frequência de pensamentos catastróficos. Introduzimos técnicas de mindfulness.', mood_score: 6, techniques_used: ['Mindfulness', 'Respiração diafragmática'], topics: ['Sono', 'Progresso'], homework: 'Prática de mindfulness 10 min/dia', is_signed: true },
    { id: 'rec-3', patient_id: 'pat-1', professional_id: 'prof-1', patient: { id: 'pat-1', full_name: 'Ana Beatriz Costa' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira' }, session_number: 2, date: addDays(today, -21).toISOString().split('T')[0], content: 'Paciente trouxe diário de pensamentos. Identificamos padrões de catastrofização relacionados ao trabalho. Trabalhamos reestruturação cognitiva.', mood_score: 5, techniques_used: ['Reestruturação cognitiva', 'Registro de pensamentos'], topics: ['Cognições distorcidas', 'Trabalho'], homework: 'Exercício de respiração diafragmática 2x ao dia', is_signed: true },
    { id: 'rec-4', patient_id: 'pat-4', professional_id: 'prof-1', patient: { id: 'pat-4', full_name: 'Pedro Henrique Alves' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira' }, session_number: 1, date: addDays(today, -7).toISOString().split('T')[0], content: 'Primeira sessão. Queixa principal: humor deprimido, isolamento social progressivo. Histórico de bullying escolar. Vínculo terapêutico em construção.', mood_score: 3, techniques_used: ['Entrevista clínica', 'Escuta ativa'], topics: ['Depressão', 'Isolamento', 'Bullying'], homework: null, is_signed: false },
  ],

  // ─── Charges ───
  charges: [
    { id: 'ch-1', patient_id: 'pat-1', professional_id: 'prof-1', patient: { id: 'pat-1', full_name: 'Ana Beatriz Costa', phone: '(11) 99111-2233' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira' }, amount: 280, status: 'paid', payment_method: 'pix', due_date: addDays(today, -21).toISOString().split('T')[0], paid_at: addDays(today, -20).toISOString(), description: 'Sessão 02 — TCC' },
    { id: 'ch-2', patient_id: 'pat-1', professional_id: 'prof-1', patient: { id: 'pat-1', full_name: 'Ana Beatriz Costa', phone: '(11) 99111-2233' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira' }, amount: 280, status: 'paid', payment_method: 'pix', due_date: addDays(today, -14).toISOString().split('T')[0], paid_at: addDays(today, -13).toISOString(), description: 'Sessão 03 — TCC' },
    { id: 'ch-3', patient_id: 'pat-1', professional_id: 'prof-1', patient: { id: 'pat-1', full_name: 'Ana Beatriz Costa', phone: '(11) 99111-2233' }, professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira' }, amount: 280, status: 'paid', payment_method: 'credit_card', due_date: addDays(today, -7).toISOString().split('T')[0], paid_at: addDays(today, -6).toISOString(), description: 'Sessão 04 — TCC' },
    { id: 'ch-4', patient_id: 'pat-2', professional_id: 'prof-2', patient: { id: 'pat-2', full_name: 'Carlos Eduardo Lima', phone: '(11) 99222-3344' }, professional: { id: 'prof-2', full_name: 'Dr. Marcos Silva' }, amount: 400, status: 'paid', payment_method: 'pix', due_date: addDays(today, -10).toISOString().split('T')[0], paid_at: addDays(today, -9).toISOString(), description: 'Sessão — Terapia de Casal' },
    { id: 'ch-5', patient_id: 'pat-3', professional_id: 'prof-3', patient: { id: 'pat-3', full_name: 'Mariana Santos', phone: '(11) 99333-4455' }, professional: { id: 'prof-3', full_name: 'Dra. Camila Santos' }, amount: 250, status: 'pending', payment_method: null, due_date: addDays(today, 3).toISOString().split('T')[0], paid_at: null, description: 'Sessão — Ludoterapia' },
    { id: 'ch-6', patient_id: 'pat-5', professional_id: 'prof-2', patient: { id: 'pat-5', full_name: 'Juliana Mendes', phone: '(11) 99555-6677' }, professional: { id: 'prof-2', full_name: 'Dr. Marcos Silva' }, amount: 320, status: 'overdue', payment_method: null, due_date: addDays(today, -5).toISOString().split('T')[0], paid_at: null, description: 'Sessão — Psicanálise (falta)' },
    { id: 'ch-7', patient_id: 'pat-6', professional_id: 'prof-4', patient: { id: 'pat-6', full_name: 'Roberto Ferreira', phone: '(11) 99666-7788' }, professional: { id: 'prof-4', full_name: 'Dr. André Costa' }, amount: 350, status: 'pending', payment_method: null, due_date: addDays(today, 7).toISOString().split('T')[0], paid_at: null, description: 'Avaliação Neuropsicológica' },
  ],

  // ─── Expense Categories ───
  expenseCategories: [
    { id: 'ecat-1', name: 'Aluguel', icon: 'Building2', color: '#3F6BFF', budget_limit: 5000 },
    { id: 'ecat-2', name: 'Energia', icon: 'Zap', color: '#F59E0B', budget_limit: 800 },
    { id: 'ecat-3', name: 'Internet', icon: 'Wifi', color: '#9333EA', budget_limit: 300 },
    { id: 'ecat-4', name: 'Material de escritório', icon: 'Package', color: '#F97316', budget_limit: 500 },
    { id: 'ecat-5', name: 'Software/Licenças', icon: 'Layers', color: '#0D9488', budget_limit: 400 },
    { id: 'ecat-6', name: 'Marketing', icon: 'Star', color: '#EC4899', budget_limit: 1000 },
  ],

  // ─── Expenses ───
  expenses: [
    { id: 'exp-1', category_id: 'ecat-1', category: { id: 'ecat-1', name: 'Aluguel', icon: 'Building2', color: '#3F6BFF' }, description: 'Aluguel mensal — Sala 1234', amount: 4500, date: addDays(today, -5).toISOString().split('T')[0], recurrence: 'monthly' },
    { id: 'exp-2', category_id: 'ecat-2', category: { id: 'ecat-2', name: 'Energia', icon: 'Zap', color: '#F59E0B' }, description: 'Conta de luz', amount: 650, date: addDays(today, -10).toISOString().split('T')[0], recurrence: 'monthly' },
    { id: 'exp-3', category_id: 'ecat-3', category: { id: 'ecat-3', name: 'Internet', icon: 'Wifi', color: '#9333EA' }, description: 'Internet fibra', amount: 250, date: addDays(today, -8).toISOString().split('T')[0], recurrence: 'monthly' },
    { id: 'exp-4', category_id: 'ecat-5', category: { id: 'ecat-5', name: 'Software/Licenças', icon: 'Layers', color: '#0D9488' }, description: 'Assinatura Terapee', amount: 197, date: addDays(today, -3).toISOString().split('T')[0], recurrence: 'monthly' },
    { id: 'exp-5', category_id: 'ecat-4', category: { id: 'ecat-4', name: 'Material de escritório', icon: 'Package', color: '#F97316' }, description: 'Resma de papel A4', amount: 89.9, date: addDays(today, -15).toISOString().split('T')[0], recurrence: 'once' },
    { id: 'exp-6', category_id: 'ecat-6', category: { id: 'ecat-6', name: 'Marketing', icon: 'Star', color: '#EC4899' }, description: 'Google Ads', amount: 500, date: addDays(today, -2).toISOString().split('T')[0], recurrence: 'monthly' },
  ],

  // ─── Conversations ───
  conversations: [
    { id: 'conv-1', patient_id: 'pat-1', patient: { id: 'pat-1', full_name: 'Ana Beatriz Costa', avatar_url: null }, phone: '(11) 99111-2233', channel: 'uazapi', unread_count: 1, last_message_at: new Date(Date.now() - 5 * 60000).toISOString(), status: 'active' },
    { id: 'conv-2', patient_id: 'pat-2', patient: { id: 'pat-2', full_name: 'Carlos Eduardo Lima', avatar_url: null }, phone: '(11) 99222-3344', channel: 'uazapi', unread_count: 0, last_message_at: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'active' },
    { id: 'conv-3', patient_id: 'pat-3', patient: { id: 'pat-3', full_name: 'Mariana Santos', avatar_url: null }, phone: '(11) 99333-4455', channel: 'uazapi', unread_count: 2, last_message_at: new Date(Date.now() - 30 * 60000).toISOString(), status: 'active' },
  ],

  // ─── Messages (keyed by conversation ID) ───
  messages: {
    'conv-1': [
      { id: 'msg-1', conversation_id: 'conv-1', direction: 'outbound', content: 'Olá Ana! Sua consulta está confirmada para amanhã às 9h. 😊', status: 'read', message_type: 'text', created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
      { id: 'msg-2', conversation_id: 'conv-1', direction: 'inbound', content: 'Oi! Confirmado, estarei lá. Obrigada!', status: 'read', message_type: 'text', created_at: new Date(Date.now() - 23 * 3600000).toISOString() },
      { id: 'msg-3', conversation_id: 'conv-1', direction: 'inbound', content: 'Dra., posso chegar 10 min atrasada?', status: 'delivered', message_type: 'text', created_at: new Date(Date.now() - 5 * 60000).toISOString() },
    ],
    'conv-2': [
      { id: 'msg-4', conversation_id: 'conv-2', direction: 'outbound', content: 'Carlos, lembrete: sua sessão de casal é quinta-feira às 11h.', status: 'delivered', message_type: 'text', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
    ],
    'conv-3': [
      { id: 'msg-5', conversation_id: 'conv-3', direction: 'outbound', content: 'Olá! Lembrete da sessão da Mariana amanhã às 14h. 🕐', status: 'read', message_type: 'text', created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
      { id: 'msg-6', conversation_id: 'conv-3', direction: 'inbound', content: 'Oi, a Mariana não está se sentindo bem. Podemos remarcar?', status: 'delivered', message_type: 'text', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 'msg-7', conversation_id: 'conv-3', direction: 'inbound', content: 'Seria possível para sexta-feira no mesmo horário?', status: 'delivered', message_type: 'text', created_at: new Date(Date.now() - 30 * 60000).toISOString() },
    ],
  },

  // ─── Templates ───
  templates: [
    { id: 'tpl-1', name: 'Confirmação de consulta', category: 'confirmation', content: 'Olá {{patient_name}}! 😊 Sua consulta está agendada para {{date}} às {{time}} com {{professional_name}}. Confirme respondendo SIM.', variables: ['patient_name', 'date', 'time', 'professional_name'], is_active: true, approved: true },
    { id: 'tpl-2', name: 'Lembrete 24h', category: 'reminder', content: 'Olá {{patient_name}}! Lembramos que sua sessão é amanhã, {{date}}, às {{time}}. Estamos te esperando! 🕐', variables: ['patient_name', 'date', 'time'], is_active: true, approved: true },
    { id: 'tpl-3', name: 'Boas-vindas', category: 'welcome', content: 'Bem-vindo(a) ao {{clinic_name}}, {{patient_name}}! 🌟 Sua primeira sessão será em {{date}}.', variables: ['patient_name', 'clinic_name', 'date'], is_active: true, approved: true },
    { id: 'tpl-4', name: 'Cobrança pendente', category: 'billing', content: 'Olá {{patient_name}}, a cobrança de R$ {{amount}} referente à sessão de {{date}} está pendente. PIX: {{pix_key}}.', variables: ['patient_name', 'amount', 'date', 'pix_key'], is_active: true, approved: true },
    { id: 'tpl-5', name: 'Follow-up pós sessão', category: 'follow_up', content: 'Olá {{patient_name}}! Como você está? Lembre-se da tarefa: {{homework}}. Nos vemos na próxima semana! 💚', variables: ['patient_name', 'homework'], is_active: true, approved: false },
  ],

  // ─── Notifications ───
  notifications: [
    { id: 'notif-1', type: 'appointment', title: 'Consulta confirmada', description: 'Ana Beatriz confirmou a consulta das 09:00', target_module: 'agenda', is_read: false, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 'notif-2', type: 'financial', title: 'Pagamento recebido', description: 'Ana Beatriz — R$ 280,00 via PIX', target_module: 'financeiro', is_read: false, created_at: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 'notif-3', type: 'message', title: 'Nova mensagem', description: 'Mariana Santos enviou mensagem no WhatsApp', target_module: 'mensagens', is_read: false, created_at: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: 'notif-4', type: 'appointment', title: 'Consulta cancelada', description: 'Pedro Henrique cancelou sessão de amanhã', target_module: 'agenda', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'notif-5', type: 'financial', title: 'Cobrança vencida', description: 'Fatura de Juliana Mendes venceu há 5 dias', target_module: 'financeiro', is_read: true, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'notif-6', type: 'system', title: 'WhatsApp conectado', description: 'Instância UAZAPI reconectada com sucesso', target_module: 'configuracoes', is_read: true, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  ],

  // ─── Services (Catálogo) ───
  services: [
    { id: 'svc-1', name: 'Psicoterapia Individual', category: 'psicologia', description: 'Sessão individual de psicoterapia com abordagem personalizada.', duration: 50, price: 280, color: '#3F6BFF', is_active: true, service_professionals: [{ professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira', color: '#3F6BFF' } }] },
    { id: 'svc-2', name: 'Terapia de Casal', category: 'psicologia', description: 'Sessão de terapia voltada para casais e dinâmicas relacionais.', duration: 80, price: 400, color: '#3F6BFF', is_active: true, service_professionals: [{ professional: { id: 'prof-2', full_name: 'Dr. Marcos Silva', color: '#9333EA' } }] },
    { id: 'svc-3', name: 'Avaliação Psicológica', category: 'psicologia', description: 'Avaliação psicológica completa com laudos e devolutiva.', duration: 90, price: 350, color: '#3F6BFF', is_active: true, service_professionals: [{ professional: { id: 'prof-1', full_name: 'Dra. Renata Oliveira', color: '#3F6BFF' } }] },
    { id: 'svc-4', name: 'Psicoterapia Infantil', category: 'pediatria', description: 'Psicoterapia lúdica especializada para crianças.', duration: 45, price: 250, color: '#EC4899', is_active: true, service_professionals: [{ professional: { id: 'prof-3', full_name: 'Dra. Camila Santos', color: '#EC4899' } }] },
    { id: 'svc-5', name: 'Ludoterapia', category: 'pediatria', description: 'Terapia através do brincar para crianças.', duration: 45, price: 250, color: '#EC4899', is_active: true, service_professionals: [{ professional: { id: 'prof-3', full_name: 'Dra. Camila Santos', color: '#EC4899' } }] },
    { id: 'svc-6', name: 'Psicanálise', category: 'psicologia', description: 'Sessão de psicanálise com escuta livre.', duration: 50, price: 320, color: '#9333EA', is_active: true, service_professionals: [{ professional: { id: 'prof-2', full_name: 'Dr. Marcos Silva', color: '#9333EA' } }] },
    { id: 'svc-7', name: 'Avaliação Neuropsicológica', category: 'neuropsicologia', description: 'Avaliação neuropsicológica com bateria de testes cognitivos.', duration: 120, price: 450, color: '#F97316', is_active: true, service_professionals: [{ professional: { id: 'prof-4', full_name: 'Dr. André Costa', color: '#F97316' } }] },
    { id: 'svc-8', name: 'Reabilitação Cognitiva', category: 'neuropsicologia', description: 'Programa de estimulação e reabilitação das funções cognitivas.', duration: 50, price: 200, color: '#F97316', is_active: true, service_professionals: [{ professional: { id: 'prof-4', full_name: 'Dr. André Costa', color: '#F97316' } }] },
    { id: 'svc-9', name: 'Orientação de Pais', category: 'pediatria', description: 'Sessão de orientação para pais sobre desenvolvimento infantil.', duration: 50, price: 180, color: '#EC4899', is_active: true, service_professionals: [{ professional: { id: 'prof-3', full_name: 'Dra. Camila Santos', color: '#EC4899' } }] },
  ],

  // ─── Suppliers (Fornecedores) ───
  suppliers: [
    { id: 'sup-1', name: 'Imobiliária Central SP', cnpj: '11.222.333/0001-44', phone: '(11) 3333-4444', email: 'contato@centralsp.com.br', category: { id: 'ecat-1', name: 'Aluguel', icon: 'Building2', color: '#3F6BFF' }, notes: 'Contrato de aluguel anual — sala 1234', is_active: true },
    { id: 'sup-2', name: 'Enel Distribuição SP', cnpj: '15.253.184/0001-50', phone: '0800-7272-120', email: null, category: { id: 'ecat-2', name: 'Energia', icon: 'Zap', color: '#F59E0B' }, notes: 'UC 0045672890', is_active: true },
    { id: 'sup-3', name: 'Vivo Fibra', cnpj: '02.558.157/0001-62', phone: '(11) 10315', email: 'empresas@vivo.com.br', category: { id: 'ecat-3', name: 'Internet', icon: 'Wifi', color: '#9333EA' }, notes: 'Plano 500Mbps empresarial', is_active: true },
    { id: 'sup-4', name: 'Kalunga', cnpj: '43.283.811/0001-50', phone: '(11) 3232-3232', email: 'vendas@kalunga.com.br', category: { id: 'ecat-4', name: 'Material de escritório', icon: 'Package', color: '#F97316' }, notes: null, is_active: true },
    { id: 'sup-5', name: 'Google Ads', cnpj: '06.990.590/0001-23', phone: null, email: 'ads-support@google.com', category: { id: 'ecat-6', name: 'Marketing', icon: 'Star', color: '#EC4899' }, notes: 'Campanha mensal "Psicólogo São Paulo"', is_active: true },
    { id: 'sup-6', name: 'Limpeza Express', cnpj: '22.333.444/0001-55', phone: '(11) 94444-5555', email: null, category: null, notes: 'Serviço de limpeza 3x por semana', is_active: true },
  ],
}
