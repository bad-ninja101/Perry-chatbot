import { Box, Paper, Typography } from '@mui/material';
import { FaUser } from 'react-icons/fa';

const Message = ({ text, isBot, isDarkMode, theme }) => {
  // Function to convert markdown links to clickable links
  const renderText = (text) => {
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = text.split(/((?:\[[^\]]*\]\([^)]*\)))/g);
    
    return parts.map((part, index) => {
      const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const [_, text, url] = linkMatch;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme?.accent || '#7C3AED',
              textDecoration: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.target.style.textDecoration = 'underline';
              e.target.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.target.style.textDecoration = 'none';
              e.target.style.opacity = '1';
            }}
          >
            {text}
          </a>
        );
      }
      return part;
    });
  };

  const messageBgColor = isBot 
    ? (theme?.primary || (isDarkMode ? '#2A2F4F' : '#F3F4F6'))
    : (theme?.accent || '#7C3AED');

  const messageTextColor = isBot
    ? (theme?.text || (isDarkMode ? '#E5E7EB' : '#1F2937'))
    : '#FFFFFF';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        mb: 2,
        maxWidth: '100%',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          backgroundColor: messageBgColor,
          color: messageTextColor,
          maxWidth: { xs: '85%', sm: '70%', md: '60%' },
          minWidth: { xs: '50%', sm: 'auto' },
          borderRadius: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          boxShadow: theme?.shadow || '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme?.shadow || '0 6px 16px rgba(0, 0, 0, 0.2)',
          }
        }}
      >
        {isBot ? (
          <img 
            src="/pe.png" 
            alt="Perry" 
            style={{ 
              width: '50px', 
              height: '50px', 
              marginTop: '4px', 
              flexShrink: 0,
              objectFit: 'contain'
            }} 
          />
        ) : (
          <FaUser style={{ 
            fontSize: '20px', 
            marginTop: '4px', 
            flexShrink: 0, 
            color: messageTextColor 
          }} />
        )}
        <Typography
          component="div"
          sx={{
            fontSize: '0.9rem',
            lineHeight: 1.6,
            flex: 1,
            '& p': { margin: '0.5em 0' },
            '& ul, & ol': {
              margin: '0.5em 0',
              paddingLeft: '1.5em',
            },
            '& li': {
              margin: '0.25em 0',
            },
            '& a': {
              color: `${theme?.accent || '#7C3AED'} !important`,
              textDecoration: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                textDecoration: 'underline !important',
                opacity: '0.9'
              }
            }
          }}
        >
          {renderText(text)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Message;
