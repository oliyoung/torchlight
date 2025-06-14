-- Create a view that includes age calculation for athletes
CREATE OR REPLACE VIEW athletes_with_age AS
SELECT 
    *,
    CASE 
        WHEN birthday IS NOT NULL 
        THEN EXTRACT(YEAR FROM AGE(birthday))::integer 
        ELSE NULL 
    END as age
FROM athletes
WHERE deleted_at IS NULL;

-- Grant necessary permissions
GRANT SELECT ON athletes_with_age TO authenticated;
GRANT SELECT ON athletes_with_age TO anon;