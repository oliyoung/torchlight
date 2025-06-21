-- Allow NULL emails for athletes
-- Young athletes or those without email addresses don't need email validation

-- Drop the existing check constraint
ALTER TABLE public.athletes DROP CONSTRAINT IF EXISTS chk_athletes_email_format;

-- Make email column nullable
ALTER TABLE public.athletes ALTER COLUMN email DROP NOT NULL;

-- Add new constraint that allows NULL or valid email format
ALTER TABLE public.athletes ADD CONSTRAINT chk_athletes_email_format 
CHECK (email IS NULL OR email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');