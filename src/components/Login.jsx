import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Tab, 
  Tabs,
  InputAdornment,
  IconButton,
  Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { authOperations, supabase } from '../supabaseClient';

const Login = ({ onLogin, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (tab === 0) { // Login
        const { user, error } = await authOperations.signIn(email, password);
        if (error) throw error;
        if (user) {
          // Login the user with the display name in metadata
          const userData = {
            ...user,
            user_metadata: {
              ...user.user_metadata,
              username: displayName || user.email.split('@')[0]
            }
          };
          
          onLogin(userData);
          
          // Then update the metadata in Supabase
          try {
            await supabase.auth.updateUser({
              data: { username: displayName || user.email.split('@')[0] }
            });
          } catch (updateError) {
            console.error('Error updating username:', updateError);
          }
        }
      } else { // Sign up
        const { user, error } = await authOperations.signUp(email, password, {
          data: { username: displayName }
        });
        if (error) throw error;
        if (user) {
          setError('Success! Please check your email for verification link. After verifying, you can login.');
          setEmail('');
          setPassword('');
          setDisplayName('');
          setTab(0);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred during authentication');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode ? '#1A1A2E' : '#F3F4F6',
        padding: { xs: 2, sm: 4 },
        width: '100%',
        margin: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          maxWidth: '400px',
          backgroundColor: isDarkMode ? '#2A2F4F' : '#FFFFFF',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          margin: 'auto',
        }}
      >
        <Avatar sx={{ bgcolor: '#7C3AED', mb: 1 }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography 
          component="h1" 
          variant="h5"
          sx={{ 
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
            mb: 2 
          }}
        >
          {tab === 0 ? 'Login' : 'Sign Up'}
        </Typography>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          variant="fullWidth"
          sx={{
            mb: 3,
            width: '100%',
            '& .MuiTab-root': { 
              color: isDarkMode ? '#E5E7EB' : '#1F2937',
              fontSize: '16px',
              fontWeight: 'medium',
              textTransform: 'none',
              minHeight: '48px'
            },
            '& .Mui-selected': { 
              color: isDarkMode ? '#7C3AED' : '#1F2937',
              fontWeight: 'bold'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: isDarkMode ? '#7C3AED' : '#1F2937'
            }
          }}
        >
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="User Name "
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: isDarkMode ? '#E5E7EB' : '#1F2937',
                '& fieldset': { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)' },
                '&:hover fieldset': { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#7C3AED' : '#1F2937' },
              },
              '& .MuiInputLabel-root': { 
                color: isDarkMode ? '#E5E7EB' : '#1F2937' 
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: isDarkMode ? '#7C3AED' : '#1F2937' 
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: isDarkMode ? '#E5E7EB' : '#1F2937',
                '& fieldset': { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)' },
                '&:hover fieldset': { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#7C3AED' : '#1F2937' },
              },
              '& .MuiInputLabel-root': { 
                color: isDarkMode ? '#E5E7EB' : '#1F2937' 
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: isDarkMode ? '#7C3AED' : '#1F2937' 
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: isDarkMode ? '#E5E7EB' : '#1F2937' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: isDarkMode ? '#E5E7EB' : '#1F2937',
                '& fieldset': { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)' },
                '&:hover fieldset': { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#7C3AED' : '#1F2937' },
              },
              '& .MuiInputLabel-root': { 
                color: isDarkMode ? '#E5E7EB' : '#1F2937' 
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: isDarkMode ? '#7C3AED' : '#1F2937' 
              },
            }}
          />
          {error && (
            <Typography 
              color={error.includes('Success') ? '#68D391' : '#FC8181'} 
              sx={{ 
                mt: 2, 
                textAlign: 'center',
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: error.includes('Success') ? 'rgba(104, 211, 145, 0.1)' : 'rgba(252, 129, 129, 0.1)',
              }}
            >
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: isDarkMode ? '#7C3AED' : '#1F2937',
              color: isDarkMode ? '#E5E7EB' : '#FFFFFF',
              padding: '12px',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '16px',
              '&:hover': { backgroundColor: isDarkMode ? '#6D28D9' : '#2F4F7F' },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {tab === 0 ? 'Sign In' : 'Sign Up'}
          </Button>
          
          <Typography 
            variant="body2" 
            color={isDarkMode ? '#E5E7EB' : '#1F2937'} 
            align="center" 
            sx={{ mt: 2 }}
          >
            {tab === 0 ? 
              "Don't have an account? Switch to Sign Up tab." : 
              "Already have an account? Switch to Login tab."
            }
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
