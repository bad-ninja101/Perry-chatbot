-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add foreign key reference to auth.users
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

-- Add Row Level Security (RLS) to chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for chat_sessions to only allow users to see their own chat sessions
CREATE POLICY chat_sessions_policy 
  ON chat_sessions 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Add session_id column to chats table if it doesn't exist
ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE;

-- Update existing messages without session_id
-- This is a placeholder, as you might want to create a default session for each user's existing chats
-- SELECT 'Run this manually for each user with existing messages without a session' as note;

-- Update index on chats table to include session_id
CREATE INDEX IF NOT EXISTS idx_chats_session_id ON chats(session_id);

-- Create policy for chats
DROP POLICY IF EXISTS chats_policy ON chats;
CREATE POLICY chats_policy 
  ON chats 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Note: Run this SQL in your Supabase SQL Editor to update your database schema
