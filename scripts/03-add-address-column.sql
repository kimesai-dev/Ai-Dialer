-- Add address column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address TEXT;

-- Update existing contacts with sample addresses (optional)
UPDATE contacts SET address = CASE 
  WHEN name = 'John Smith' THEN '123 Main St, Apt 4B'
  WHEN name = 'Sarah Johnson' THEN '456 Oak Avenue'
  WHEN name = 'Mike Davis' THEN '789 Pine Street, Suite 200'
  WHEN name = 'Emily Wilson' THEN '321 Elm Drive'
  WHEN name = 'David Brown' THEN '654 Maple Lane, Unit 5'
  WHEN name = 'Lisa Garcia' THEN '987 Cedar Court'
  WHEN name = 'Robert Taylor' THEN '147 Birch Boulevard'
  WHEN name = 'Jennifer Martinez' THEN '258 Spruce Street'
  ELSE NULL
END
WHERE address IS NULL;
