-- ========================================
-- FIX: Remove problematic unique constraint
-- ========================================
-- The unique_pending_request constraint is too restrictive
-- It should only prevent duplicate PENDING requests, not all statuses

-- Drop the old constraint
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS unique_pending_request;

-- Add a better constraint that only prevents duplicate pending requests
-- This allows the same pair to have multiple historical records (accepted/rejected)
CREATE UNIQUE INDEX unique_pending_request_idx 
ON pedidos (solicitante_id, destinatario_id) 
WHERE status = 'pendente';

-- Alternative: If you want to prevent ANY duplicate between two users (regardless of status),
-- use this instead (but only ONE can exist at a time):
-- CREATE UNIQUE INDEX unique_request_per_pair_idx 
-- ON pedidos (
--   LEAST(solicitante_id, destinatario_id),
--   GREATEST(solicitante_id, destinatario_id)
-- );

COMMENT ON INDEX unique_pending_request_idx IS 
'Ensures only one pending request can exist between two users at a time, but allows historical records';
