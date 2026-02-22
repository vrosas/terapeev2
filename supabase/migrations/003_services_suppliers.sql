-- ═══════════════════════════════════════════════════════
-- TERAPEE — Migration 003: Services, Suppliers & Role Update
-- ═══════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. CATÁLOGO DE SERVIÇOS
-- ─────────────────────────────────────────────
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'psicologia', -- psicologia, fisioterapia, fono, to, neuro, pediatria, etc
  description TEXT,
  duration INTEGER DEFAULT 50, -- minutes
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: many-to-many between services and professionals
CREATE TABLE service_professionals (
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, professional_id)
);

-- ─────────────────────────────────────────────
-- 2. FORNECEDORES
-- ─────────────────────────────────────────────
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add supplier reference to expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────
-- 3. EXPAND PROFILE ROLES
-- ─────────────────────────────────────────────
-- Add 'financial' role to profiles check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('owner', 'admin', 'professional', 'receptionist', 'financial'));

-- ─────────────────────────────────────────────
-- 4. LINK APPOINTMENTS → SERVICES
-- ─────────────────────────────────────────────
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────
-- 5. INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_services_clinic ON services(clinic_id);
CREATE INDEX idx_services_active ON services(clinic_id, is_active);
CREATE INDEX idx_service_profs_service ON service_professionals(service_id);
CREATE INDEX idx_service_profs_prof ON service_professionals(professional_id);
CREATE INDEX idx_suppliers_clinic ON suppliers(clinic_id);
CREATE INDEX idx_expenses_supplier ON expenses(supplier_id);

-- ─────────────────────────────────────────────
-- 6. RLS POLICIES
-- ─────────────────────────────────────────────
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Clinic members can view services"
  ON services FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Clinic members can insert services"
  ON services FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Clinic members can update services"
  ON services FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Clinic admins can delete services"
  ON services FOR DELETE
  USING (clinic_id = get_user_clinic_id());

-- Service-professionals junction (access via service's clinic)
CREATE POLICY "Clinic members can view service_professionals"
  ON service_professionals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM services s WHERE s.id = service_id AND s.clinic_id = get_user_clinic_id()
  ));

CREATE POLICY "Clinic members can manage service_professionals"
  ON service_professionals FOR ALL
  USING (EXISTS (
    SELECT 1 FROM services s WHERE s.id = service_id AND s.clinic_id = get_user_clinic_id()
  ));

-- Suppliers policies
CREATE POLICY "Clinic members can view suppliers"
  ON suppliers FOR SELECT
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Clinic members can insert suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Clinic members can update suppliers"
  ON suppliers FOR UPDATE
  USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Clinic admins can delete suppliers"
  ON suppliers FOR DELETE
  USING (clinic_id = get_user_clinic_id());

-- ─────────────────────────────────────────────
-- 7. TRIGGERS
-- ─────────────────────────────────────────────
CREATE TRIGGER set_updated_at_services
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_suppliers
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
