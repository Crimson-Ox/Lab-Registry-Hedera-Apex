-- Migration to add ipfs_cid to lab_audit
-- Run in Supabase SQL Editor

ALTER TABLE lab_audit ADD COLUMN IF NOT EXISTS ipfs_cid text;
