import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import AppNavbar from '../dashboard/components/AppNavbar';
import SideMenu from '../dashboard/components/SideMenu';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../dashboard/theme/customizations';
import AppTheme from '../shared-theme/AppTheme';

const squareLogo = 'https://upload.wikimedia.org/wikipedia/commons/2/27/Square%2C_Inc_-_Square_Logo.jpg';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const SquareOAuth = () => {
  const [connected, setConnected] = useState(null);
  const squareAppId = process.env.REACT_APP_SQUARE_APP_ID;
  const redirectUri = encodeURIComponent('http://localhost:3000/square-callback');
  const scopes = encodeURIComponent('MERCHANT_PROFILE_READ PAYMENTS_READ ITEMS_READ INVENTORY_READ ORDERS_READ');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setConnected(false);
      return;
    }

    try {
      jwtDecode(token);
    } catch (e) {
      console.error('Failed to decode token:', e);
      setConnected(false);
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/oauth/square-connection`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized or error');
        return res.json();
      })
      .then(data => setConnected(data.connected))
      .catch(() => setConnected(false));
  }, []);

  const connectToSquare = () => {
    const authUrl = `https://connect.squareupsandbox.com/oauth2/authorize?client_id=${squareAppId}&response_type=code&scope=${scopes}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            minHeight: '100vh',
            py: 8,
            px: { xs: 2, md: 6 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          })}
        >
          <Stack
            spacing={3}
            sx={{
              maxWidth: 500,
              width: '100%',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <img
              src={squareLogo}
              alt="Square Logo"
              style={{ height: 80, marginBottom: 16 }}
            />

            <Typography variant="h4" component="h1">
              Connect Your Square Account
            </Typography>

            <Typography variant="body1">
              {connected === null ? 'Checking connection status...' :
                connected
                  ? 'Your Square account is already connected.'
                  : 'Connect to Square to enable payment features.'}
            </Typography>

            {!connected && connected !== null && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={connectToSquare}
              >
                Connect with Square
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default SquareOAuth;
