-- Migration: Convert weight column from DECIMAL to JSON
-- Run this on your cPanel database to fix weight storage

-- First, let's see what data exists (optional check)
-- SELECT id, user_id, date, weight FROM entries WHERE weight IS NOT NULL;

-- Step 1: Add a temporary JSON column
ALTER TABLE entries ADD COLUMN weight_json JSON AFTER weight;

-- Step 2: Migrate existing weight data to JSON format
-- This converts DECIMAL values like 75.5 to JSON objects like {"value":75.5}
UPDATE entries
SET weight_json = JSON_OBJECT('value', weight)
WHERE weight IS NOT NULL;

-- Step 3: Drop the old DECIMAL column
ALTER TABLE entries DROP COLUMN weight;

-- Step 4: Rename the JSON column to 'weight'
ALTER TABLE entries CHANGE COLUMN weight_json weight JSON;

-- Done! The weight column is now JSON type
