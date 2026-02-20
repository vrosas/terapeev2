-- ═══════════════════════════════════════════════════════
-- TERAPEE — Schema Completo Supabase
-- Plataforma SaaS para Clínicas de Psicologia
-- ═══════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- fuzzy search

-- ─────────────────────────────────────────────
-- 1. CLÍNICAS (multi-tenant)
-- ─────────────────────────────────────────────
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address JSONB DEFAULT '{}', -- {street, number, complement, neighborhood, city, state, zip}
  logo_url TEXT,
  plan TEXT NOT NULL DEFAULT 'standard' CHECK (plan IN ('standard', 'max')),
  whatsapp_config JSONB DEFAULT '{}', -- {channel, uazapi_instance, uazapi_token, uazapi_phone, meta_token}
  settings JSONB DEFAULT '{}', -- {timezone, currency, appointment_duration, reminder_hours, cancellation_policy}
  working_hours JSONB DEFAULT '{}', -- {mon: {start, end, lunch_start, lunch_end}, ...}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. PERFIS (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'professional', 'receptionist')),
  is_active BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}', -- {theme, notifications, language}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. PROFISSIONAIS
-- ─────────────────────────────────────────────
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  crp TEXT, -- Conselho Regional de Psicologia
  specialties TEXT[] DEFAULT '{}',
  color TEXT DEFAULT '#3F6BFF', -- calendar color
  avatar_url TEXT,
  bio TEXT,
  session_price DECIMAL(10,2) DEFAULT 0,
  session_duration INTEGER DEFAULT 50, -- minutes
  is_active BOOLEAN DEFAULT TRUE,
  working_hours JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. PACIENTES
-- ─────────────────────────────────────────────
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('M', 'F', 'NB', 'other', NULL)),
  address JSONB DEFAULT '{}',
  emergency_contact JSONB DEFAULT '{}', -- {name, phone, relationship}
  health_insurance TEXT, -- convênio
  health_insurance_number TEXT,
  assigned_professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged', 'waitlist')),
  therapy_type TEXT,
  session_frequency TEXT, -- semanal, quinzenal, mensal
  session_price DECIMAL(10,2),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  intake_date DATE DEFAULT CURRENT_DATE,
  discharge_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 5. AGENDAMENTOS
-- ─────────────────────────────────────────────
CREATE TYPE appointment_status AS ENUM (
  'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  type TEXT DEFAULT 'regular' CHECK (type IN ('regular', 'initial', 'follow_up', 'emergency', 'online', 'group')),
  modality TEXT DEFAULT 'in_person' CHECK (modality IN ('in_person', 'online')),
  room TEXT,
  price DECIMAL(10,2),
  notes TEXT,
  confirmation_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  recurrence_rule TEXT, -- iCal RRULE for recurring appointments
  recurrence_group_id UUID, -- group recurring appointments
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time CHECK (end_time > start_time)
);

-- ─────────────────────────────────────────────
-- 6. PRONTUÁRIOS (Medical Records)
-- ─────────────────────────────────────────────
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  session_number INTEGER DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT, -- rich text / markdown
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  techniques_used TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  homework TEXT,
  observations TEXT,
  is_signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]', -- [{name, url, type, size}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 7. FINANCEIRO — Cobranças
-- ─────────────────────────────────────────────
CREATE TYPE charge_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled', 'refunded');

CREATE TABLE charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status charge_status DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'cash', 'bank_transfer', 'health_insurance', NULL)),
  description TEXT,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  invoice_url TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 8. FINANCEIRO — Despesas
-- ─────────────────────────────────────────────
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  budget_limit DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recurrence TEXT CHECK (recurrence IN ('once', 'monthly', 'quarterly', 'yearly', NULL)),
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 9. MENSAGENS — WhatsApp
-- ─────────────────────────────────────────────
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  channel TEXT DEFAULT 'uazapi' CHECK (channel IN ('uazapi', 'meta')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  assigned_professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video', 'template', 'location')),
  template_name TEXT,
  media_url TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  external_id TEXT, -- WhatsApp message ID
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'utility' CHECK (category IN ('confirmation', 'reminder', 'follow_up', 'welcome', 'billing', 'custom', 'utility')),
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}', -- {{patient_name}}, {{date}}, etc.
  is_active BOOLEAN DEFAULT TRUE,
  approved BOOLEAN DEFAULT FALSE, -- Meta approval status
  language TEXT DEFAULT 'pt_BR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 10. NOTIFICAÇÕES
-- ─────────────────────────────────────────────
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('appointment', 'financial', 'message', 'system', 'alert')),
  title TEXT NOT NULL,
  description TEXT,
  target_module TEXT, -- which page to navigate to
  target_id UUID, -- specific record ID
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 11. AUDIT LOG
-- ─────────────────────────────────────────────
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════
CREATE INDEX idx_profiles_clinic ON profiles(clinic_id);
CREATE INDEX idx_professionals_clinic ON professionals(clinic_id);
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_name_trgm ON patients USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_patients_status ON patients(clinic_id, status);
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_time ON appointments(clinic_id, start_time, end_time);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_status ON appointments(clinic_id, status);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_professional ON medical_records(professional_id);
CREATE INDEX idx_charges_clinic ON charges(clinic_id);
CREATE INDEX idx_charges_patient ON charges(patient_id);
CREATE INDEX idx_charges_status ON charges(clinic_id, status);
CREATE INDEX idx_charges_due_date ON charges(clinic_id, due_date);
CREATE INDEX idx_expenses_clinic ON expenses(clinic_id);
CREATE INDEX idx_expenses_date ON expenses(clinic_id, date);
CREATE INDEX idx_conversations_clinic ON conversations(clinic_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(clinic_id, created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's clinic_id
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─── CLINIC POLICIES ───
CREATE POLICY "Users can view own clinic"
  ON clinics FOR SELECT
  USING (id = get_user_clinic_id());

CREATE POLICY "Owners can update own clinic"
  ON clinics FOR UPDATE
  USING (id = get_user_clinic_id());

-- ─── PROFILES POLICIES ───
CREATE POLICY "Users can view profiles in same clinic"
  ON profiles FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ─── GENERIC CLINIC-SCOPED POLICIES ───
-- Apply same pattern to all clinic-scoped tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'professionals', 'patients', 'appointments', 'medical_records',
    'charges', 'expense_categories', 'expenses', 'conversations',
    'messages', 'message_templates', 'notifications', 'audit_log'
  ]
  LOOP
    EXECUTE format('
      CREATE POLICY "Clinic members can view %I"
        ON %I FOR SELECT
        USING (clinic_id = get_user_clinic_id());
      
      CREATE POLICY "Clinic members can insert %I"
        ON %I FOR INSERT
        WITH CHECK (clinic_id = get_user_clinic_id());
      
      CREATE POLICY "Clinic members can update %I"
        ON %I FOR UPDATE
        USING (clinic_id = get_user_clinic_id());
      
      CREATE POLICY "Clinic admins can delete %I"
        ON %I FOR DELETE
        USING (clinic_id = get_user_clinic_id());
    ', tbl, tbl, tbl, tbl, tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'clinics', 'profiles', 'professionals', 'patients', 'appointments',
    'medical_records', 'charges', 'expenses', 'conversations', 'message_templates'
  ]
  LOOP
    EXECUTE format('
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    ', tbl);
  END LOOP;
END $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'owner'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    unread_count = CASE WHEN NEW.direction = 'inbound' THEN unread_count + 1 ELSE unread_count END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Auto-generate charge on completed appointment
CREATE OR REPLACE FUNCTION auto_charge_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.price IS NOT NULL AND NEW.price > 0 THEN
    INSERT INTO charges (clinic_id, patient_id, appointment_id, professional_id, amount, due_date, description)
    VALUES (
      NEW.clinic_id, NEW.patient_id, NEW.id, NEW.professional_id,
      NEW.price, CURRENT_DATE + INTERVAL '7 days',
      'Sessão ' || to_char(NEW.start_time, 'DD/MM/YYYY HH24:MI')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_appointment_completed
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION auto_charge_on_completion();

-- ═══════════════════════════════════════════════════════
-- VIEWS (for dashboard / reports)
-- ═══════════════════════════════════════════════════════

-- Dashboard summary
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  c.id AS clinic_id,
  (SELECT COUNT(*) FROM patients p WHERE p.clinic_id = c.id AND p.status = 'active') AS active_patients,
  (SELECT COUNT(*) FROM appointments a WHERE a.clinic_id = c.id AND a.start_time::date = CURRENT_DATE) AS today_appointments,
  (SELECT COUNT(*) FROM appointments a WHERE a.clinic_id = c.id AND a.start_time >= date_trunc('month', CURRENT_DATE) AND a.status = 'completed') AS month_completed,
  (SELECT COALESCE(SUM(ch.amount), 0) FROM charges ch WHERE ch.clinic_id = c.id AND ch.status = 'paid' AND ch.paid_at >= date_trunc('month', CURRENT_DATE)) AS month_revenue,
  (SELECT COALESCE(SUM(e.amount), 0) FROM expenses e WHERE e.clinic_id = c.id AND e.date >= date_trunc('month', CURRENT_DATE)) AS month_expenses,
  (SELECT COUNT(*) FROM charges ch WHERE ch.clinic_id = c.id AND ch.status = 'overdue') AS overdue_charges,
  (SELECT COUNT(*) FROM conversations cv WHERE cv.clinic_id = c.id AND cv.unread_count > 0) AS unread_conversations
FROM clinics c;

-- Financial monthly summary
CREATE OR REPLACE VIEW financial_monthly AS
SELECT
  clinic_id,
  date_trunc('month', due_date) AS month,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS received,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending,
  SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) AS overdue,
  COUNT(*) AS total_charges
FROM charges
GROUP BY clinic_id, date_trunc('month', due_date);
