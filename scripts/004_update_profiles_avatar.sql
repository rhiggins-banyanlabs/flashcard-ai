-- Update profiles table to use avatar_path instead of avatar_url for file uploads
ALTER TABLE profiles 
DROP COLUMN IF EXISTS avatar_url,
ADD COLUMN avatar_path TEXT;

-- Update RLS policies to include avatar_path
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
