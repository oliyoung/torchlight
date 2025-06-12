-- Enable RLS on the coach_billing table
ALTER TABLE public.coach_billing ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to select their own billing records
CREATE POLICY select_own_billing ON public.coach_billing
FOR SELECT
USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

-- Create a policy to allow users to insert their own billing records
CREATE POLICY insert_own_billing ON public.coach_billing
FOR INSERT
WITH CHECK (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

-- Create a policy to allow users to update their own billing records
CREATE POLICY update_own_billing ON public.coach_billing
FOR UPDATE
USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));

-- Create a policy to allow users to delete their own billing records
CREATE POLICY delete_own_billing ON public.coach_billing
FOR DELETE
USING (coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()::text));