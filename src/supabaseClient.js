import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for chat operations
export const chatOperations = {
  // Get all chat sessions for a user
  getUserChatSessions: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return [];
    }
  },

  // Create a new chat session
  createChatSession: async (userId, title = null) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{
          user_id: userId,
          title: title || 'New Chat',
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
  },

  // Delete a chat session
  deleteChatSession: async (sessionId) => {
    try {
      // First delete all messages in this session
      await supabase
        .from('chats')
        .delete()
        .eq('session_id', sessionId);
      
      // Then delete the session itself
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }
  },

  // Get all chats for a specific session
  getSessionChats: async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting session chats:', error);
      return [];
    }
  },

  // Get all chats for a user
  getUserChats: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },

  // Save a new chat message
  saveChat: async (userId, message, isBot, sessionId) => {
    try {
      // Validate inputs
      if (!userId) throw new Error('User ID is required');
      if (!message) throw new Error('Message is required');
      if (!sessionId) throw new Error('Session ID is required');

      // First, verify the session exists
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        console.error('Session verification failed:', sessionError);
        throw new Error('Invalid session ID');
      }

      // Insert the chat message
      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: userId,
          message: message.trim(),
          is_bot: isBot,
          session_id: sessionId,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Database error:', error);
        if (error.code === '23503') { // Foreign key violation
          throw new Error('Invalid session or user ID');
        } else if (error.code === '23502') { // Not null violation
          throw new Error('Missing required fields');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      return data;
    } catch (error) {
      console.error('Error saving chat:', error);
      throw error; // Propagate the error with more context
    }
  },

  // Delete all chats for a user
  deleteUserChats: async (userId) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting chats:', error);
      throw new Error('Failed to delete chat messages');
    }
  }
};

// Auth helper functions
export const authOperations = {
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data?.user, error };
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: '',  // Will be updated after login
        },
      },
    });
    return { user: data?.user, error };
  },

  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
};
