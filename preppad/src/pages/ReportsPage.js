import React from 'react';
import Layout from '../components/Layout';
import { Box, Typography } from '@mui/material';

export default function ReportsPage() {
  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 'bold', fontSize: { xs: '2.5rem', md: '4rem' } }}>
          Coming Soon...
        </Typography>
      </Box>
    </Layout>
  );
}
