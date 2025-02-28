import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';

const ChatInput = ({ onSendMessage, isDarkMode, theme, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: 1,
        p: 2,
        width: '100%',
        backgroundColor: theme?.primary || (isDarkMode ? '#2A2F4F' : '#FFFFFF'),
        maxWidth: '100%',
        boxSizing: 'border-box',
        maxHeight: '120px', // Prevent excessive growth
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        onKeyDown={handleKeyDown}
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme?.secondary || (isDarkMode ? '#1A1A2E' : '#F9FAFB'),
            color: theme?.text || (isDarkMode ? '#E5E7EB' : '#1F2937'),
            maxHeight: '100px',
            overflowY: 'auto',
            '& fieldset': {
              borderColor: theme?.border || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
            },
            '&:hover fieldset': {
              borderColor: theme?.accent || '#7C3AED',
            },
            '&.Mui-focused fieldset': {
              borderColor: theme?.accent || '#7C3AED',
            },
            '& textarea': {
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme?.border || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                borderRadius: '4px',
              },
            },
          },
          '& .MuiOutlinedInput-input': {
            '&::placeholder': {
              color: theme?.textSecondary || (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'),
              opacity: 1,
            },
          },
        }}
      />
      <IconButton 
        type="submit" 
        disabled={!message.trim() || isLoading}
        sx={{
          backgroundColor: theme?.accent || '#7C3AED',
          color: '#FFFFFF',
          alignSelf: 'flex-end',
          flex: '0 0 auto',
          width: '40px',
          height: '40px',
          '&:hover': {
            backgroundColor: theme?.accent || '#6D28D9',
            opacity: 0.9,
          },
          '&.Mui-disabled': {
            backgroundColor: theme?.accent || '#7C3AED',
            opacity: 0.3,
            color: '#FFFFFF',
          },
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default ChatInput;
