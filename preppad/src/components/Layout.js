import * as React from 'react';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import AppNavbar from '../dashboard/components/AppNavbar';
import SideMenu from '../dashboard/components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import Header from '../dashboard/components/Header';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../dashboard/theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Layout({ children, pageTitle }) {
  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <SideMenu />
        <AppNavbar />

        {/* Scrollable main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            height: '100vh',
            overflowY: 'auto',
            px: 3,
            pt: 3,
            pb: 5,
          })}
        >
          <Stack spacing={2}>
            {/* Optional Page Title Box */}
            {pageTitle && (
              <Box
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  alignSelf: 'flex-start',
                }}
              >
                {pageTitle}
              </Box>
            )}

            {/* Header and Page Content */}
            <Header />
            {children}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
