import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Drawer,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChatIcon from '@mui/icons-material/Chat';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MoodIcon from '@mui/icons-material/Mood';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Message from './components/Message';
import ChatInput from './components/ChatInput';
import Login from './components/Login';
import ChatSidebar from './components/ChatSidebar';
import { supabase, chatOperations, authOperations } from './supabaseClient';
import { format } from 'date-fns';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const chatContainerRef = useRef(null);

  // Initialize Google Generative AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  // Theme colors
  const theme = {
    dark: {
      background: '#1A1A2E',
      primary: '#2A2F4F',
      secondary: '#1F2937',
      text: '#E5E7EB',
      textSecondary: '#9CA3AF',
      accent: '#7C3AED',
      border: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    },
    light: {
      background: '#F3F4F6',
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      text: '#1F2937',
      textSecondary: '#4B5563',
      accent: '#7C3AED',
      border: 'rgba(0, 0, 0, 0.1)',
      hover: 'rgba(0, 0, 0, 0.05)',
      shadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const toggleTheme = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  const generateResponse = async (userMessage) => {
    try {
      console.log('Starting to generate response...');
      
      // Create the model instance
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log('Model initialized');

      // Get user's name from metadata
      const userName = user?.user_metadata?.username || 'User';

      // Simple prompt without chat history
      const prompt = `You are Perry, a compassionate mental health assistant talking to ${userName}.
      IMPORTANT: Always address the user as "${userName}". Never use their email address.

User message: ${userMessage}

Respond in a way that is:
1. Empathetic and understanding
2. Professional but warm
3. Focused on mental well-being
4. Ends with encouragement
5. When asked, always say that you were created by Ankit, a web developer. DONT Mention anyone other than Ankit.

IMPORTANT: If the user is seeking professional help or mentions serious mental health concerns, include this EXACT text when you see that the user mentions it or mentions anything related to self harm or suicide::
"I recommend consulting with a mental health professional. [Find a therapist near you](https://www.google.com/maps/search/mental+health+therapist+near+me)", Dont include it in every response but once in a few responses

Keep your response concise and helpful.`;

      console.log('Sending message to Gemini...');
      const result = await model.generateContent(prompt);
      console.log('Response received from Gemini');
      
      const response = await result.response;
      const text = response.text();
      console.log('Generated text:', text);
      
      return text;
    } catch (error) {
      console.error('Detailed error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        error
      });
      
      if (error.message?.includes('API key')) {
        throw new Error('API key configuration error');
      }
      
      throw error;
    }
  };

  const handleSendMessage = async (message) => {
    if (!activeChatId || !message.trim()) return;
    
    try {
      // Add user message immediately to UI
      const userMessage = { text: message, isBot: false };
      setMessages(prev => [...prev, userMessage]);
      
      // Start loading state
      setIsLoading(true);
      
      try {
        // Save user message to database
        await chatOperations.saveChat(user.id, message, false, activeChatId);
        
        // Generate AI response
        const response = await generateResponse(message);
        
        // Save and display AI response
        const botMessage = { text: response, isBot: true };
        setMessages(prev => [...prev, botMessage]);
        await chatOperations.saveChat(user.id, response, true, activeChatId);
      } catch (error) {
        console.error('Error in message handling:', error);
        
        // Handle specific error types
        let errorMessage = "I apologize, but I'm having trouble responding right now. Please try again.";
        
        if (error.message?.includes('API key')) {
          errorMessage = "I apologize, but there seems to be an issue with my configuration. Please check the API key.";
        } else if (error.message?.includes('Invalid session')) {
          errorMessage = "There seems to be an issue with your chat session. Please try starting a new chat.";
          // Create a new session
          const newSession = await chatOperations.createChatSession(user.id);
          if (newSession) {
            setActiveChatId(newSession.id);
            setChatSessions(prev => [newSession, ...prev]);
          }
        } else if (error.message?.includes('Database error')) {
          errorMessage = "There was an issue saving your message. Please try again.";
        }
        
        setMessages(prev => [...prev, { 
          text: errorMessage,
          isBot: true 
        }]);
      }
    } catch (error) {
      console.error('Critical error in chat flow:', error);
      setMessages(prev => [...prev, { 
        text: "I apologize, but I'm having trouble with the chat system. Please refresh the page and try again.", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing session on load
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const session = await authOperations.getCurrentSession();
      if (session?.user) {
        // Get user profile
        const { data: { user } } = await supabase.auth.getUser();
        setUser({
          ...session.user,
          display_name: user?.user_metadata?.display_name || session.user.email.split('@')[0]
        });
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);

  useEffect(() => {
    if (activeChatId) {
      loadSessionMessages(activeChatId);
    } else if (user && chatSessions.length === 0) {
      // Create a new chat session if the user has none
      handleNewChat();
    }
  }, [activeChatId, chatSessions]);

  const loadChatSessions = async () => {
    try {
      setIsLoading(true);
      const data = await chatOperations.getUserChatSessions(user.id);
      setChatSessions(data || []);
      if (data && data.length > 0) {
        setActiveChatId(data[0].id);
      } else {
        // Create a new chat if no existing chats
        handleNewChat();
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      setIsLoading(false);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      setIsLoading(true);
      const data = await chatOperations.getSessionChats(sessionId);
      if (data && data.length > 0) {
        setMessages(data.map(chat => ({ text: chat.message, isBot: chat.is_bot })));
      } else {
        // If it's a new session, show Perry's introduction
        const introMessage = {
          text: `Welcome to Perry - Your Mental Health Assistant! 

I'm here to:
• Listen without judgment
• Provide emotional support
• Help you process your thoughts and feelings
• Offer coping strategies and mindfulness techniques
• Guide you towards better mental well-being

Remember: While I'm here to support you, I'm not a substitute for professional mental health care. If you're experiencing a crisis, please reach out to professional services.

Hi ${userName}! How are you feeling today?`,
          isBot: true
        };
        setMessages([introMessage]);
        // Save the greeting to the database
        await chatOperations.saveChat(user.id, introMessage.text, true, sessionId);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading session messages:', error);
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await chatOperations.createChatSession(user.id);
      if (newChat) {
        setChatSessions(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSelectSession = (sessionId) => {
    setActiveChatId(sessionId);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      const success = await chatOperations.deleteChatSession(sessionId);
      if (success) {
        setChatSessions(prev => prev.filter(session => session.id !== sessionId));
        
        // If the deleted session was active, set active to the first remaining session or create a new one
        if (activeChatId === sessionId) {
          const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
          if (remainingSessions.length > 0) {
            setActiveChatId(remainingSessions[0].id);
          } else {
            handleNewChat();
          }
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authOperations.signOut();
      setUser(null);
      setMessages([]);
      setChatSessions([]);
      setActiveChatId(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleInfoClose = () => {
    setShowInfo(false);
  };

  const handleInfoOpen = () => {
    setShowInfo(true);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Info Dialog */}
      <Dialog
        open={showInfo}
        onClose={handleInfoClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: currentTheme.primary,
            color: currentTheme.text,
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${currentTheme.border}` }}>
          About Perry
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 3 
          }}>
            <img 
              src="/pe.png" 
              alt="Perry Logo" 
              style={{ 
                width: '150px',
                height: '150px',
                objectFit: 'contain'
              }} 
            />
          </Box>
          
          <Typography paragraph align="center">
            Hi there! I'm Perry - The Platypus, your friendly mental health assistant.
          </Typography>

          <Typography paragraph align="center" sx={{ color: currentTheme.textSecondary }}>
            Created by Ankit Kumar Singh and Bhawani Lal
          </Typography>

          <Typography paragraph>
            Perry-The Platypus is an AI-powered mental health chatbot designed to provide support and guidance. While not a replacement for professional help, <br/> Perry offers:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <ChatIcon sx={{ color: currentTheme.accent }} />
              </ListItemIcon>
              <ListItemText primary="24/7 emotional support and someone to talk to" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PsychologyIcon sx={{ color: currentTheme.accent }} />
              </ListItemIcon>
              <ListItemText primary="Coping strategies and mental health resources" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <MoodIcon sx={{ color: currentTheme.accent }} />
              </ListItemIcon>
              <ListItemText primary="Stress management and anxiety reduction techniques" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <WarningIcon sx={{ color: currentTheme.accent }} />
              </ListItemIcon>
              <ListItemText 
                primary="Important Note" 
                secondary="Perry is not a substitute for professional mental health treatment. If you're experiencing a crisis or need immediate help, please contact emergency services or a mental health professional."
              sx={{ 
                  '& .MuiListItemText-secondary': {
                    color: currentTheme.textSecondary,
                  }
                }}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${currentTheme.border}`, p: 2 }}>
          <Button 
            onClick={handleInfoClose}
            sx={{
              color: currentTheme.text,
              '&:hover': {
                backgroundColor: currentTheme.hover,
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${currentTheme.border}`,
          backgroundColor: currentTheme.primary,
          boxShadow: currentTheme.shadow,
          position: 'sticky',
          top: 0,
          zIndex: 1200,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              display: { sm: 'none' },
              color: currentTheme.text,
            }}
          >
            <MenuIcon />
          </IconButton>
          <img 
            src="/perr.png" 
            alt="Perry" 
            style={{ 
              width: '45px',
              height: '45px',
              objectFit: 'contain',
            }}
          />
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: currentTheme.text,
            }}
          >
            Perry-  A Mental Health Assitant
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Show/Hide Sidebar Button - Desktop only */}
          <Button
            onClick={toggleSidebar}
            startIcon={isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              textTransform: 'none',
              color: currentTheme.text,
              minWidth: 0,
              px: 1,
              '&:hover': {
                backgroundColor: currentTheme.hover,
              }
            }}
          >
            {isSidebarOpen ? "Hide" : "Show"}
          </Button>

          {/* Info Button */}
          <IconButton
            onClick={handleInfoOpen}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              color: currentTheme.text,
              '&:hover': {
                backgroundColor: currentTheme.hover,
              }
            }}
          >
            <InfoIcon />
          </IconButton>

          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: currentTheme.text,
              '&:hover': { 
                backgroundColor: currentTheme.hover 
              }
            }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          
          <Button
            onClick={handleLogout}
            color="inherit"
            sx={{
              textTransform: 'none',
              color: currentTheme.text,
              minWidth: 0,
              px: 2,
              '&:hover': {
                backgroundColor: currentTheme.hover,
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 64px)', // Subtract header height
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar - Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            width: isSidebarOpen ? 240 : 0,
            transition: 'width 0.2s',
            '& .MuiDrawer-paper': { 
              position: 'relative',
              width: 240,
              boxSizing: 'border-box',
              backgroundColor: currentTheme.primary,
              color: currentTheme.text,
              borderRight: `1px solid ${currentTheme.border}`,
              transition: 'transform 0.2s',
              transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            },
          }}
          open={isSidebarOpen}
        >
          <ChatSidebar
            chatSessions={chatSessions}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            activeChatId={activeChatId}
            isDarkMode={isDarkMode}
            theme={currentTheme}
          />
        </Drawer>

        {/* Mobile Sidebar */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              width: 240,
              backgroundColor: currentTheme.primary,
              color: currentTheme.text,
              borderRight: `1px solid ${currentTheme.border}`,
            },
          }}
        >
          <ChatSidebar
            chatSessions={chatSessions}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            activeChatId={activeChatId}
            isDarkMode={isDarkMode}
            theme={currentTheme}
          />
        </Drawer>

        {/* Chat Content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            position: 'relative',
          }}
        >
          <Box
            ref={chatContainerRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              backgroundColor: currentTheme.background,
              pb: '80px', // Make room for the fixed input
            }}
          >
            {messages.map((message, index) => (
              <Message 
                key={index} 
                text={message.text} 
                isBot={message.isBot} 
                isDarkMode={isDarkMode}
                theme={currentTheme}
              />
            ))}
          </Box>

          {/* Chat Input - Fixed at bottom */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderTop: `1px solid ${currentTheme.border}`,
              backgroundColor: currentTheme.primary,
              boxShadow: `0 -4px 6px ${currentTheme.shadow}`,
            }}
          >
            <ChatInput 
              onSendMessage={handleSendMessage} 
              isDarkMode={isDarkMode}
              theme={currentTheme}
              isLoading={isLoading}
            />
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          backgroundColor: currentTheme.primary,
          borderTop: `1px solid ${currentTheme.border}`,
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: currentTheme.textSecondary 
          }}
        >
          &copy; {new Date().getFullYear()} Ankit Singh. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
