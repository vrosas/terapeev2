-- ═══════════════════════════════════════════════════════
-- TERAPEE — Migration 006: Fix Registration Issues
-- ═══════════════════════════════════════════════════════
--
-- Fixes bugs introduced during mock→Supabase migration (commit 6ae90db):
--
-- 1. Add commission_percent column to professionals table
--    (frontend payload was sending this field but column didn't exist)
--
-- ═══════════════════════════════════════════════════════

ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS commission_percent DECIMAL(5,2) DEFAULT 60;
