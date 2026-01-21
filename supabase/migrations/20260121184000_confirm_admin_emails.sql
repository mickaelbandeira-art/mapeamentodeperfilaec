-- ==============================================================================
-- Auto-confirm Emails for Admin Users
-- ==============================================================================

-- This script manually confirms the email addresses for the admin users
-- so they can log in without needing to click a confirmation link (which might be disabled or not configured).

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email IN (
  'jonathan.silva@aec.com.br',
  'kelciane.lima@aec.com.br',
  'a.izaura.bezerrra@aec.com.br',
  'mickael.bandeira@aec.com.br'
);
