-- Migration: Add steps field to entries table
-- Run this on your cPanel MySQL database
-- (diary, gym, supplements already exist from previous migration)

-- Add steps field (integer for daily step count)
ALTER TABLE entries ADD COLUMN steps INT DEFAULT NULL AFTER supplements;
