-- Add theme column to profiles table
ALTER TABLE profiles 
ADD COLUMN theme VARCHAR(20) DEFAULT 'pink' CHECK (theme IN ('pink', 'blue', 'purple', 'green'));

-- Update existing profiles to have default theme
UPDATE profiles SET theme = 'pink' WHERE theme IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.theme IS 'User selected color theme: pink, blue, purple, or green';
