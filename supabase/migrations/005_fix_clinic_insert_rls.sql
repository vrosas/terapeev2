-- Fix: add missing INSERT policy for clinics table
-- Without this policy, new users cannot create a clinic during signup
-- (Supabase blocks all operations that have no matching RLS policy)
CREATE POLICY "Authenticated users can create clinics"
  ON clinics FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
