-- Add username column to auth.users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Create a function to update username
CREATE OR REPLACE FUNCTION public.handle_username_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET username = NEW.username
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger for username updates
DROP TRIGGER IF EXISTS on_username_update ON auth.users;
CREATE TRIGGER on_username_update
  AFTER UPDATE OF username ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_username_update();
