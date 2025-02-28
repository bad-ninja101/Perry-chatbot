import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Typography, 
  Divider,
  Button,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

const ChatSidebar = ({ 
  chatSessions, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession, 
  activeChatId, 
  isDarkMode, 
  theme 
}) => {
  // Group chats by date for display
  const groupedChats = chatSessions.reduce((acc, chat) => {
    // Format date as YYYY-MM-DD
    const date = chat.created_at.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(chat);
    return acc;
  }, {});

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMMM dd, yyyy');
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme?.border || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
        }}
      >
        <Button
          fullWidth
          startIcon={<AddIcon />}
          onClick={onNewChat}
          sx={{
            color: theme?.text || (isDarkMode ? '#E5E7EB' : '#1F2937'),
            borderColor: theme?.border || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
            backgroundColor: theme?.hover || (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
            textTransform: 'none',
            '&:hover': {
              backgroundColor: theme?.hover || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
            },
          }}
        >
          New Chat
        </Button>
      </Box>

      <List
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme?.border || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme?.hover || (isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'),
          },
        }}
      >
        {Object.keys(groupedChats).length > 0 ? (
          Object.keys(groupedChats)
            .sort((a, b) => new Date(b) - new Date(a))
            .map((date) => (
              <Box key={date}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    padding: '8px 16px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {formatDate(date)}
                </Typography>
                {groupedChats[date].map((chat) => (
                  <ListItem
                    key={chat.id}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => onDeleteSession(chat.id)}
                        sx={{
                          color: theme?.textSecondary || (isDarkMode ? '#9CA3AF' : '#6B7280'),
                          '&:hover': {
                            color: theme?.text || (isDarkMode ? '#E5E7EB' : '#1F2937'),
                            backgroundColor: theme?.hover || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{
                      pr: 6, // Make room for the delete button
                    }}
                  >
                    <ListItemButton
                      selected={chat.id === activeChatId}
                      onClick={() => onSelectSession(chat.id)}
                      sx={{
                        borderRadius: 1,
                        mx: 1,
                        '&.Mui-selected': {
                          backgroundColor: theme?.hover || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                          '&:hover': {
                            backgroundColor: theme?.hover || (isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'),
                          },
                        },
                        '&:hover': {
                          backgroundColor: theme?.hover || (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme?.text || (isDarkMode ? '#E5E7EB' : '#1F2937'),
                              fontWeight: chat.id === activeChatId ? 'medium' : 'normal',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {chat.title || 'Conversation'}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: '12px',
                            }}
                          >
                            {format(new Date(chat.created_at), 'h:mm a')}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </Box>
            ))
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '16px',
              color: 'rgba(255, 255, 255, 0.5)',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">
              No chat history yet.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Start a new conversation!
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );
};

export default ChatSidebar;
