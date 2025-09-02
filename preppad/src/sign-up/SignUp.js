import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import AppTheme from '../shared-theme/AppTheme';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp(props) {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const businessNameFromUrl = queryParams.get('businessName') || '';

  const [errors, setErrors] = React.useState({
    username: false,
    businessName: false,
    email: false,
    password: false,
    name: false,
  });

  const [errorMessages, setErrorMessages] = React.useState({
    username: '',
    businessName: '',
    email: '',
    password: '',
    name: '',
  });

  const [formValues, setFormValues] = React.useState({
    businessName: businessNameFromUrl,
  });

  // Autofill fix style to remove dark blue autofill background
  const textFieldSx = {
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px white inset !important', // replace 'white' with background color if needed
      boxShadow: '0 0 0 1000px white inset !important',
      WebkitTextFillColor: '#000000 !important',
      transition: 'background-color 5000s ease-in-out 0s',
    },
  };

  const validateInputs = () => {
    const username = document.getElementById('username')?.value.trim();
    const businessName = document.getElementById('businessName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const name = document.getElementById('name')?.value.trim();

    let isValid = true;
    const newErrors = {};
    const newErrorMessages = {};

    if (!username) {
      newErrors.username = true;
      newErrorMessages.username = 'Username is required';
      isValid = false;
    } else {
      newErrors.username = false;
      newErrorMessages.username = '';
    }

    if (!businessName) {
      newErrors.businessName = true;
      newErrorMessages.businessName = 'Business Name is required';
      isValid = false;
    } else {
      newErrors.businessName = false;
      newErrorMessages.businessName = '';
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = true;
      newErrorMessages.email = 'Please enter a valid email address.';
      isValid = false;
    } else {
      newErrors.email = false;
      newErrorMessages.email = '';
    }

    if (!password || password.length < 6) {
      newErrors.password = true;
      newErrorMessages.password = 'Password must be at least 6 characters long.';
      isValid = false;
    } else {
      newErrors.password = false;
      newErrorMessages.password = '';
    }

    if (!name) {
      newErrors.name = true;
      newErrorMessages.name = 'Full name is required.';
      isValid = false;
    } else {
      newErrors.name = false;
      newErrorMessages.name = '';
    }

    setErrors(newErrors);
    setErrorMessages(newErrorMessages);

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateInputs()) return;

    const data = new FormData(event.currentTarget);

    const payload = {
      username: data.get('username'),
      businessName: data.get('businessName'),
      fullName: data.get('name'),
      email: data.get('email'),
      password: data.get('password'),
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Signup successful!');
        navigate('/dashboard');
      } else {
        console.error('Signup failed:', result.error);
        toast.error(result.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Network error:', err);
      toast.error('Network error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="businessName">Business Name</FormLabel>
              <TextField
                id="businessName"
                name="businessName"
                placeholder="Your Business Name"
                required
                fullWidth
                error={errors.businessName}
                helperText={errorMessages.businessName}
                color={errors.businessName ? 'error' : 'primary'}
                sx={textFieldSx}
                value={formValues.businessName}
                InputProps={{ readOnly: true }}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="username">Username</FormLabel>
              <TextField
                id="username"
                name="username"
                placeholder="yourusername"
                required
                fullWidth
                error={errors.username}
                helperText={errorMessages.username}
                color={errors.username ? 'error' : 'primary'}
                sx={textFieldSx}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="name">Full Name</FormLabel>
              <TextField
                id="name"
                name="name"
                placeholder="Jon Snow"
                required
                fullWidth
                error={errors.name}
                helperText={errorMessages.name}
                color={errors.name ? 'error' : 'primary'}
                sx={textFieldSx}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                name="email"
                placeholder="your@email.com"
                required
                fullWidth
                error={errors.email}
                helperText={errorMessages.email}
                color={errors.email ? 'error' : 'primary'}
                sx={textFieldSx}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                name="password"
                placeholder="••••••"
                type="password"
                required
                fullWidth
                error={errors.password}
                helperText={errorMessages.password}
                color={errors.password ? 'error' : 'primary'}
                sx={textFieldSx}
                onChange={handleInputChange}
              />
            </FormControl>
            <Button type="submit" fullWidth variant="contained">
              Sign up
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>or</Typography>
          </Divider>
          <Link
            component={RouterLink}
            to="/sign-in"
            underline="hover"
            sx={{ alignSelf: 'center' }}
            variant="body2"
          >
            Already have an account? Sign in!
          </Link>
        </Card>
        <ToastContainer />
      </SignUpContainer>
    </AppTheme>
  );
}
