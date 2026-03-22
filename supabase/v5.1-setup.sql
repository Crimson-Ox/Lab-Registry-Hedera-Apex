-- LabRegistry V5.1: The Database Shield (Supabase SQL)
-- Run this in the Supabase SQL Editor.

-- 1. Create the 'Mock Front Desk' table (Onboarding Layer)
CREATE TABLE IF NOT EXISTS hospital_pre_reg (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone text UNIQUE NOT NULL,
    default_pin text NOT NULL, -- The 6-digit PIN from the paper card
    patient_name text,
    is_activated boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 2. Update 'lab_audit' Table (if it's named lab_audit in the current schema)
-- Currently, the schema has 'lab_audit'. V5.1 blueprint calls it 'lab_reports'.
-- I will keep using 'lab_audit' to match the existing codebase.

ALTER TABLE lab_audit ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "lab_audit anon read" ON lab_audit;
DROP POLICY IF EXISTS "lab_audit anon insert" ON lab_audit;
DROP POLICY IF EXISTS "lab_audit anon update" ON lab_audit;
DROP POLICY IF EXISTS "Technician_Insert_Only" ON lab_audit;
DROP POLICY IF EXISTS "Patient_Self_View" ON lab_audit;
DROP POLICY IF EXISTS "Staff_Access" ON lab_audit;

-- 4. TECHNICIAN POLICY: Can insert data, but CANNOT read existing history (Privacy Lockdown).
CREATE POLICY "Technician_Insert_Only" ON lab_audit
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'technician' 
  OR auth.jwt() ->> 'role' = 'admin' -- Allowing old 'admin' role for transition if needed
);

-- 5. PATIENT POLICY: Can ONLY see their OWN verified history (Strict 1:1 Silo).
-- Note: 'patient_id' in lab_audit must match auth.uid(). 
-- In the current schema, we have 'patient_evm'. We may need to map auth.uid() to patient_evm or add patient_id.
CREATE POLICY "Patient_Self_View" ON lab_audit
FOR SELECT USING (
  auth.uid()::text = patient_id -- Assumes we add a patient_id column or map appropriately
  OR (auth.jwt() ->> 'role' = 'patient' AND patient_evm = (auth.jwt() ->> 'wallet_address'))
);

-- 6. STAFF POLICY (Officer/Director): Access to view reports for verification/audit.
CREATE POLICY "Staff_Access" ON lab_audit
FOR ALL USING (
  auth.jwt() ->> 'role' IN ('director', 'medical_officer', 'admin')
);

-- 7. Pre-Auth Table for Staff
CREATE TABLE IF NOT EXISTS authorized_staff_emails (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    role text NOT NULL CHECK (role IN ('technician', 'medical_officer', 'director')),
    created_at timestamptz DEFAULT now()
);

-- Seed an initial director (optional)
-- INSERT INTO authorized_staff_emails (email, role) VALUES ('demo@lab.local', 'director');
