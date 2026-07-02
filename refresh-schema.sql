-- This tells the Supabase API to reload its schema cache
-- Run this in your Supabase SQL Editor to fix the "Could not find the column in the schema cache" errors.
NOTIFY pgrst, 'reload schema';
