-- Grant service_role permissions to bypass RLS on coaches table
-- This allows administrative actions like creating a coach profile from a server-side process after auth signup.

CREATE POLICY "Allow service_role to manage coaches"
ON public.coaches
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);