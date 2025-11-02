import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const logoStyle = {
  maxWidth: '200px',
  height: 'auto',
  opacity: 0.8,
};

export default function LogoCollection() {
  return (
    <Box id="logoCollection" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography
        component="p"
        variant="subtitle2"
        align="center"
        sx={{ color: 'text.secondary', mb: 2 }}
      >
        Trusted by
      </Typography>
      <img
        src="/images/Well Grounded Cafe Logo.png"
        alt="Well Grounded"
        style={logoStyle}
      />
    </Box>
  );
}
