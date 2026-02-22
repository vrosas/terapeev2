-- ═══════════════════════════════════════════════════════
-- TERAPEE — Seed 003: Services, Suppliers & Team
-- Run after migration 003
-- ═══════════════════════════════════════════════════════

-- Clinic ID reference
-- '00000000-0000-0000-0000-000000000001' = Espaço Mente & Vida

-- Professional IDs:
-- prof-10 = Dra. Renata Oliveira (TCC)
-- prof-11 = Dr. Marcos Silva (Psicanálise)
-- prof-12 = Dra. Camila Santos (Infantil)
-- prof-13 = Dr. André Costa (Neuropsicologia)

-- ─────────────────────────────────────────────
-- 1. SERVIÇOS
-- ─────────────────────────────────────────────
INSERT INTO services (id, clinic_id, name, category, description, duration, price, color, is_active) VALUES
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000001', 'Psicoterapia Individual', 'psicologia', 'Sessão individual de psicoterapia com abordagem personalizada.', 50, 280.00, '#3F6BFF', TRUE),
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000001', 'Terapia de Casal', 'psicologia', 'Sessão de terapia voltada para casais e dinâmicas relacionais.', 80, 400.00, '#3F6BFF', TRUE),
  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000001', 'Avaliação Psicológica', 'psicologia', 'Avaliação psicológica completa com laudos e devolutiva.', 90, 350.00, '#3F6BFF', TRUE),
  ('00000000-0000-0000-0000-000000000053', '00000000-0000-0000-0000-000000000001', 'Psicoterapia Infantil', 'pediatria', 'Psicoterapia lúdica especializada para crianças.', 45, 250.00, '#EC4899', TRUE),
  ('00000000-0000-0000-0000-000000000054', '00000000-0000-0000-0000-000000000001', 'Ludoterapia', 'pediatria', 'Terapia através do brincar para crianças.', 45, 250.00, '#EC4899', TRUE),
  ('00000000-0000-0000-0000-000000000055', '00000000-0000-0000-0000-000000000001', 'Psicanálise', 'psicologia', 'Sessão de psicanálise com escuta livre.', 50, 320.00, '#9333EA', TRUE),
  ('00000000-0000-0000-0000-000000000056', '00000000-0000-0000-0000-000000000001', 'Avaliação Neuropsicológica', 'neuropsicologia', 'Avaliação neuropsicológica com bateria de testes cognitivos.', 120, 450.00, '#F97316', TRUE),
  ('00000000-0000-0000-0000-000000000057', '00000000-0000-0000-0000-000000000001', 'Reabilitação Cognitiva', 'neuropsicologia', 'Programa de estimulação e reabilitação das funções cognitivas.', 50, 200.00, '#F97316', TRUE),
  ('00000000-0000-0000-0000-000000000058', '00000000-0000-0000-0000-000000000001', 'Orientação de Pais', 'pediatria', 'Sessão de orientação para pais sobre desenvolvimento infantil.', 50, 180.00, '#EC4899', TRUE);

-- Service ↔ Professional associations
INSERT INTO service_professionals (service_id, professional_id) VALUES
  -- Dra. Renata (TCC)
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000010'), -- Psicoterapia Individual
  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000010'), -- Avaliação Psicológica
  -- Dr. Marcos (Psicanálise)
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000011'), -- Terapia de Casal
  ('00000000-0000-0000-0000-000000000055', '00000000-0000-0000-0000-000000000011'), -- Psicanálise
  -- Dra. Camila (Infantil)
  ('00000000-0000-0000-0000-000000000053', '00000000-0000-0000-0000-000000000012'), -- Psicoterapia Infantil
  ('00000000-0000-0000-0000-000000000054', '00000000-0000-0000-0000-000000000012'), -- Ludoterapia
  ('00000000-0000-0000-0000-000000000058', '00000000-0000-0000-0000-000000000012'), -- Orientação de Pais
  -- Dr. André (Neuropsicologia)
  ('00000000-0000-0000-0000-000000000056', '00000000-0000-0000-0000-000000000013'), -- Avaliação Neuropsicológica
  ('00000000-0000-0000-0000-000000000057', '00000000-0000-0000-0000-000000000013'); -- Reabilitação Cognitiva

-- ─────────────────────────────────────────────
-- 2. FORNECEDORES
-- ─────────────────────────────────────────────
INSERT INTO suppliers (id, clinic_id, name, cnpj, phone, email, category_id, notes, is_active) VALUES
  ('00000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000001', 'Imobiliária Central SP', '11.222.333/0001-44', '(11) 3333-4444', 'contato@centralsp.com.br', '00000000-0000-0000-0000-000000000030', 'Contrato de aluguel anual — sala 1234', TRUE),
  ('00000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000001', 'Enel Distribuição SP', '15.253.184/0001-50', '0800-7272-120', NULL, '00000000-0000-0000-0000-000000000031', 'Conta de energia elétrica — UC 0045672890', TRUE),
  ('00000000-0000-0000-0000-000000000062', '00000000-0000-0000-0000-000000000001', 'Vivo Fibra', '02.558.157/0001-62', '(11) 10315', 'empresas@vivo.com.br', '00000000-0000-0000-0000-000000000032', 'Plano 500Mbps empresarial', TRUE),
  ('00000000-0000-0000-0000-000000000063', '00000000-0000-0000-0000-000000000001', 'Kalunga', '43.283.811/0001-50', '(11) 3232-3232', 'vendas@kalunga.com.br', '00000000-0000-0000-0000-000000000033', NULL, TRUE),
  ('00000000-0000-0000-0000-000000000064', '00000000-0000-0000-0000-000000000001', 'Google Ads', '06.990.590/0001-23', NULL, 'ads-support@google.com', '00000000-0000-0000-0000-000000000035', 'Campanha mensal "Psicólogo São Paulo"', TRUE),
  ('00000000-0000-0000-0000-000000000065', '00000000-0000-0000-0000-000000000001', 'Limpeza Express', '22.333.444/0001-55', '(11) 94444-5555', NULL, NULL, 'Serviço de limpeza 3x por semana', TRUE);

-- Link existing expenses to suppliers
UPDATE expenses SET supplier_id = '00000000-0000-0000-0000-000000000060'
  WHERE clinic_id = '00000000-0000-0000-0000-000000000001' AND description ILIKE '%aluguel%';
UPDATE expenses SET supplier_id = '00000000-0000-0000-0000-000000000061'
  WHERE clinic_id = '00000000-0000-0000-0000-000000000001' AND description ILIKE '%luz%';
UPDATE expenses SET supplier_id = '00000000-0000-0000-0000-000000000062'
  WHERE clinic_id = '00000000-0000-0000-0000-000000000001' AND description ILIKE '%internet%';
UPDATE expenses SET supplier_id = '00000000-0000-0000-0000-000000000063'
  WHERE clinic_id = '00000000-0000-0000-0000-000000000001' AND description ILIKE '%papel%';
UPDATE expenses SET supplier_id = '00000000-0000-0000-0000-000000000064'
  WHERE clinic_id = '00000000-0000-0000-0000-000000000001' AND description ILIKE '%google%';
