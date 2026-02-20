-- ═══════════════════════════════════════════════════════
-- TERAPEE — Seed Data (Development)
-- Run after schema migration
-- ═══════════════════════════════════════════════════════

-- NOTE: In production, the clinic and first user are created
-- via the signup flow. This seed is for development only.

-- 1. Create a demo clinic
INSERT INTO clinics (id, name, slug, cnpj, phone, email, plan, address, working_hours, whatsapp_config, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Espaço Mente & Vida',
  'mente-e-vida',
  '12.345.678/0001-01',
  '(11) 3456-7890',
  'contato@menteevida.com.br',
  'max',
  '{"street":"Rua Augusta","number":"1234","complement":"Sala 56","neighborhood":"Consolação","city":"São Paulo","state":"SP","zip":"01305-100"}',
  '{"mon":{"start":"08:00","end":"20:00"},"tue":{"start":"08:00","end":"20:00"},"wed":{"start":"08:00","end":"20:00"},"thu":{"start":"08:00","end":"20:00"},"fri":{"start":"08:00","end":"18:00"}}',
  '{"channel":"uazapi","uazapi_instance":"terapee-clinic-a1b2c3","uazapi_phone":"+5511987654321","uazapi_token":"tok_demo_xyz"}',
  '{"timezone":"America/Sao_Paulo","currency":"BRL","appointment_duration":50,"reminder_hours":24,"cancellation_policy":"24h"}'
);

-- 2. Professionals
INSERT INTO professionals (id, clinic_id, full_name, email, phone, crp, specialties, color, session_price, session_duration, bio) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Dra. Renata Oliveira', 'renata@menteevida.com.br', '(11) 99876-5432', 'CRP 06/123456', ARRAY['TCC', 'Ansiedade', 'Depressão'], '#3F6BFF', 280.00, 50, 'Psicóloga clínica com 12 anos de experiência em TCC.'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Dr. Marcos Silva', 'marcos@menteevida.com.br', '(11) 99765-4321', 'CRP 06/654321', ARRAY['Psicanálise', 'Terapia de Casal'], '#9333EA', 320.00, 50, 'Psicanalista com foco em dinâmica relacional.'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Dra. Camila Santos', 'camila@menteevida.com.br', '(11) 99654-3210', 'CRP 06/789012', ARRAY['Psicologia Infantil', 'Ludoterapia', 'TDAH'], '#EC4899', 250.00, 45, 'Especialista em psicologia infantil e do desenvolvimento.'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Dr. André Costa', 'andre@menteevida.com.br', '(11) 99543-2109', 'CRP 06/345678', ARRAY['Neuropsicologia', 'Avaliação Psicológica'], '#F97316', 350.00, 60, 'Neuropsicólogo com experiência em avaliação cognitiva.');

-- 3. Patients
INSERT INTO patients (id, clinic_id, full_name, email, phone, cpf, birth_date, gender, assigned_professional_id, status, therapy_type, session_frequency, session_price, health_insurance, intake_date, tags) VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Ana Beatriz Costa', 'ana.costa@email.com', '(11) 99111-2233', '123.456.789-00', '1992-03-15', 'F', '00000000-0000-0000-0000-000000000010', 'active', 'TCC', 'semanal', 280.00, NULL, '2024-06-10', ARRAY['ansiedade', 'regular']),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Carlos Eduardo Lima', 'carlos.lima@email.com', '(11) 99222-3344', '234.567.890-01', '1985-07-22', 'M', '00000000-0000-0000-0000-000000000011', 'active', 'Terapia de Casal', 'quinzenal', 400.00, 'Unimed', '2024-08-05', ARRAY['casal']),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Mariana Santos', 'mariana.santos@email.com', '(11) 99333-4455', '345.678.901-02', '2015-11-30', 'F', '00000000-0000-0000-0000-000000000012', 'active', 'Ludoterapia', 'semanal', 250.00, 'Bradesco Saúde', '2024-09-12', ARRAY['infantil', 'tdah']),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Pedro Henrique Alves', 'pedro.alves@email.com', '(11) 99444-5566', '456.789.012-03', '1998-01-08', 'M', '00000000-0000-0000-0000-000000000010', 'active', 'TCC', 'semanal', 280.00, NULL, '2024-10-20', ARRAY['depressão', 'jovem-adulto']),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Juliana Mendes', 'juliana.mendes@email.com', '(11) 99555-6677', '567.890.123-04', '1990-05-18', 'F', '00000000-0000-0000-0000-000000000011', 'active', 'Psicanálise', 'semanal', 320.00, 'Amil', '2024-04-15', ARRAY['psicanálise', 'regular']),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000001', 'Roberto Ferreira', 'roberto.f@email.com', '(11) 99666-7788', '678.901.234-05', '1978-09-03', 'M', '00000000-0000-0000-0000-000000000013', 'active', 'Neuropsicologia', 'mensal', 350.00, NULL, '2024-11-01', ARRAY['avaliação']),
  ('00000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000001', 'Fernanda Ribeiro', 'fernanda.r@email.com', '(11) 99777-8899', '789.012.345-06', '1988-12-25', 'F', '00000000-0000-0000-0000-000000000010', 'inactive', 'TCC', 'quinzenal', 280.00, 'SulAmérica', '2023-03-10', ARRAY['alta']),
  ('00000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000001', 'Lucas Oliveira', 'lucas.o@email.com', '(11) 99888-9900', '890.123.456-07', '2010-04-14', 'M', '00000000-0000-0000-0000-000000000012', 'waitlist', 'Psicologia Infantil', NULL, 250.00, NULL, NULL, ARRAY['fila-espera', 'infantil']);

-- 4. Appointments (next 2 weeks + history)
INSERT INTO appointments (clinic_id, patient_id, professional_id, start_time, end_time, status, type, modality, price, room) VALUES
  -- Today
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', CURRENT_DATE + TIME '09:00', CURRENT_DATE + TIME '09:50', 'confirmed', 'regular', 'in_person', 280.00, 'Sala 1'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000010', CURRENT_DATE + TIME '10:00', CURRENT_DATE + TIME '10:50', 'scheduled', 'regular', 'in_person', 280.00, 'Sala 1'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000012', CURRENT_DATE + TIME '14:00', CURRENT_DATE + TIME '14:45', 'confirmed', 'regular', 'in_person', 250.00, 'Sala Kids'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000011', CURRENT_DATE + TIME '15:00', CURRENT_DATE + TIME '15:50', 'scheduled', 'regular', 'online', 320.00, NULL),
  -- Tomorrow
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000013', CURRENT_DATE + INTERVAL '1 day' + TIME '09:00', CURRENT_DATE + INTERVAL '1 day' + TIME '10:00', 'scheduled', 'follow_up', 'in_person', 350.00, 'Sala 2'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000011', CURRENT_DATE + INTERVAL '1 day' + TIME '11:00', CURRENT_DATE + INTERVAL '1 day' + TIME '11:50', 'confirmed', 'regular', 'in_person', 400.00, 'Sala 3'),
  -- Past completed
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', CURRENT_DATE - INTERVAL '7 days' + TIME '09:00', CURRENT_DATE - INTERVAL '7 days' + TIME '09:50', 'completed', 'regular', 'in_person', 280.00, 'Sala 1'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000010', CURRENT_DATE - INTERVAL '7 days' + TIME '10:00', CURRENT_DATE - INTERVAL '7 days' + TIME '10:50', 'completed', 'regular', 'in_person', 280.00, 'Sala 1'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000011', CURRENT_DATE - INTERVAL '3 days' + TIME '15:00', CURRENT_DATE - INTERVAL '3 days' + TIME '15:50', 'no_show', 'regular', 'online', 320.00, NULL);

-- 5. Medical Records
INSERT INTO medical_records (clinic_id, patient_id, professional_id, session_number, date, content, mood_score, techniques_used, topics, homework) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 1, CURRENT_DATE - INTERVAL '28 days', 'Sessão inicial. Paciente relata quadro de ansiedade generalizada com início há 6 meses. Episódios de insônia e dificuldade de concentração no trabalho. Iniciamos psicoeducação sobre ansiedade.', 4, ARRAY['Psicoeducação', 'Escuta ativa'], ARRAY['Ansiedade', 'Trabalho', 'Sono'], 'Diário de pensamentos automáticos'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 2, CURRENT_DATE - INTERVAL '21 days', 'Paciente trouxe diário de pensamentos. Identificamos padrões de catastrofização relacionados ao ambiente de trabalho. Trabalhamos reestruturação cognitiva.', 5, ARRAY['Reestruturação cognitiva', 'Registro de pensamentos'], ARRAY['Cognições distorcidas', 'Trabalho'], 'Exercício de respiração diafragmática 2x ao dia'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 3, CURRENT_DATE - INTERVAL '14 days', 'Melhora na qualidade do sono após exercícios de respiração. Paciente relata menor frequência de pensamentos catastróficos. Introduzimos técnicas de mindfulness.', 6, ARRAY['Mindfulness', 'Respiração diafragmática'], ARRAY['Sono', 'Progresso'], 'Prática de mindfulness 10 min/dia'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 4, CURRENT_DATE - INTERVAL '7 days', 'Paciente relata episódio de ansiedade no trabalho, mas conseguiu aplicar técnicas aprendidas. Discussão sobre assertividade. Progresso consistente.', 7, ARRAY['Treino de assertividade', 'Role-playing'], ARRAY['Assertividade', 'Trabalho', 'Progresso'], 'Praticar comunicação assertiva em uma situação da semana'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000010', 1, CURRENT_DATE - INTERVAL '7 days', 'Primeira sessão com Pedro. Queixa principal: humor deprimido, isolamento social progressivo. Histórico de bullying escolar. Vínculo terapêutico em construção.', 3, ARRAY['Entrevista clínica', 'Escuta ativa'], ARRAY['Depressão', 'Isolamento', 'Bullying'], NULL);

-- 6. Charges
INSERT INTO charges (clinic_id, patient_id, professional_id, amount, status, payment_method, due_date, paid_at, description) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 280.00, 'paid', 'pix', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE - INTERVAL '20 days', 'Sessão 02 — TCC'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 280.00, 'paid', 'pix', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '13 days', 'Sessão 03 — TCC'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', 280.00, 'paid', 'credit_card', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '6 days', 'Sessão 04 — TCC'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000011', 400.00, 'paid', 'pix', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '9 days', 'Sessão — Terapia de Casal'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000012', 250.00, 'pending', NULL, CURRENT_DATE + INTERVAL '3 days', NULL, 'Sessão — Ludoterapia'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000011', 320.00, 'overdue', NULL, CURRENT_DATE - INTERVAL '5 days', NULL, 'Sessão — Psicanálise (falta)'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000013', 350.00, 'pending', NULL, CURRENT_DATE + INTERVAL '7 days', NULL, 'Avaliação Neuropsicológica');

-- 7. Expense categories
INSERT INTO expense_categories (id, clinic_id, name, icon, color, budget_limit) VALUES
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'Aluguel', 'Building2', '#3F6BFF', 5000.00),
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', 'Energia', 'Zap', '#F59E0B', 800.00),
  ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000001', 'Internet', 'Wifi', '#9333EA', 300.00),
  ('00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000001', 'Material de escritório', 'Package', '#F97316', 500.00),
  ('00000000-0000-0000-0000-000000000034', '00000000-0000-0000-0000-000000000001', 'Software/Licenças', 'Layers', '#0D9488', 400.00),
  ('00000000-0000-0000-0000-000000000035', '00000000-0000-0000-0000-000000000001', 'Marketing', 'Star', '#EC4899', 1000.00);

-- 8. Expenses
INSERT INTO expenses (clinic_id, category_id, description, amount, date, recurrence) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'Aluguel mensal — Sala 1234', 4500.00, CURRENT_DATE - INTERVAL '5 days', 'monthly'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', 'Conta de luz', 650.00, CURRENT_DATE - INTERVAL '10 days', 'monthly'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000032', 'Internet fibra', 250.00, CURRENT_DATE - INTERVAL '8 days', 'monthly'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000034', 'Assinatura Terapee', 197.00, CURRENT_DATE - INTERVAL '3 days', 'monthly'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000033', 'Resma de papel A4', 89.90, CURRENT_DATE - INTERVAL '15 days', 'once'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000035', 'Google Ads', 500.00, CURRENT_DATE - INTERVAL '2 days', 'monthly');

-- 9. Message templates
INSERT INTO message_templates (clinic_id, name, category, content, variables, is_active, approved) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Confirmação de consulta', 'confirmation', 'Olá {{patient_name}}! 😊 Sua consulta está agendada para {{date}} às {{time}} com {{professional_name}}. Por favor, confirme respondendo SIM. Caso precise remarcar, entre em contato.', ARRAY['patient_name', 'date', 'time', 'professional_name'], TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Lembrete 24h', 'reminder', 'Olá {{patient_name}}! Lembramos que sua sessão é amanhã, {{date}}, às {{time}}. Estamos te esperando! 🕐', ARRAY['patient_name', 'date', 'time'], TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Boas-vindas', 'welcome', 'Bem-vindo(a) ao {{clinic_name}}, {{patient_name}}! 🌟 Estamos felizes em te receber. Sua primeira sessão será em {{date}}. Qualquer dúvida, estamos à disposição.', ARRAY['patient_name', 'clinic_name', 'date'], TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Cobrança pendente', 'billing', 'Olá {{patient_name}}, identificamos que a cobrança no valor de R$ {{amount}} referente à sessão de {{date}} está pendente. Pode efetuar o pagamento via PIX: {{pix_key}}.', ARRAY['patient_name', 'amount', 'date', 'pix_key'], TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Follow-up pós sessão', 'follow_up', 'Olá {{patient_name}}! Como você está se sentindo após nossa sessão? Lembre-se da tarefa: {{homework}}. Nos vemos na próxima semana! 💚', ARRAY['patient_name', 'homework'], TRUE, FALSE);

-- 10. Conversations & messages
INSERT INTO conversations (id, clinic_id, patient_id, phone, channel, unread_count, last_message_at) VALUES
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', '(11) 99111-2233', 'uazapi', 1, NOW() - INTERVAL '5 minutes'),
  ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', '(11) 99222-3344', 'uazapi', 0, NOW() - INTERVAL '2 hours'),
  ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000022', '(11) 99333-4455', 'uazapi', 2, NOW() - INTERVAL '30 minutes');

INSERT INTO messages (conversation_id, clinic_id, direction, content, status, created_at) VALUES
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', 'outbound', 'Olá Ana! Sua consulta está confirmada para amanhã às 9h. 😊', 'read', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', 'inbound', 'Oi! Confirmado, estarei lá. Obrigada!', 'read', NOW() - INTERVAL '23 hours'),
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', 'inbound', 'Dra., posso chegar 10 min atrasada?', 'delivered', NOW() - INTERVAL '5 minutes'),
  ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000001', 'outbound', 'Carlos, lembrete: sua sessão de casal é quinta-feira às 11h.', 'delivered', NOW() - INTERVAL '2 hours'),
  ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000001', 'outbound', 'Olá! Lembrete da sessão da Mariana amanhã às 14h. 🕐', 'read', NOW() - INTERVAL '3 hours'),
  ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000001', 'inbound', 'Oi, a Mariana não está se sentindo bem. Podemos remarcar?', 'delivered', NOW() - INTERVAL '1 hour'),
  ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000001', 'inbound', 'Seria possível para sexta-feira no mesmo horário?', 'delivered', NOW() - INTERVAL '30 minutes');

-- 11. Notifications
INSERT INTO notifications (clinic_id, user_id, type, title, description, target_module, is_read, created_at)
SELECT
  '00000000-0000-0000-0000-000000000001',
  p.id,
  n.type, n.title, n.description, n.target_module, n.is_read, n.created_at
FROM profiles p
CROSS JOIN (VALUES
  ('appointment', 'Consulta confirmada', 'Ana Beatriz confirmou a consulta das 09:00', 'agenda', FALSE, NOW() - INTERVAL '5 minutes'),
  ('financial', 'Pagamento recebido', 'Ana Beatriz — R$ 280,00 via PIX', 'financeiro', FALSE, NOW() - INTERVAL '15 minutes'),
  ('message', 'Nova mensagem', 'Mariana Santos enviou mensagem no WhatsApp', 'mensagens', FALSE, NOW() - INTERVAL '30 minutes'),
  ('appointment', 'Consulta cancelada', 'Pedro Henrique cancelou sessão de amanhã', 'agenda', TRUE, NOW() - INTERVAL '1 hour'),
  ('financial', 'Cobrança vencida', 'Fatura de Juliana Mendes venceu há 5 dias', 'financeiro', TRUE, NOW() - INTERVAL '2 hours'),
  ('system', 'WhatsApp conectado', 'Instância UAZAPI reconectada com sucesso', 'configuracoes', TRUE, NOW() - INTERVAL '3 hours')
) AS n(type, title, description, target_module, is_read, created_at)
WHERE p.clinic_id = '00000000-0000-0000-0000-000000000001'
LIMIT 6;
