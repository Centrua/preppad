import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Real-Time Tracking',
    description:
      'Monitor your inventory levels in real-time with automatic updates as items are used in recipes or purchased.',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Cost Management',
    description:
      'Track ingredient costs, recipe profitability, and total spending to optimize your budget and reduce waste.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Easy to Use',
    description:
      'Intuitive interface designed for busy kitchen staff. Import recipes from images, export data to CSV, and more.',
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Smart Automation',
    description:
      'Automated shopping lists, low stock alerts, and inventory updates save you time and prevent stockouts.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Integration Ready',
    description:
      'Connect with Square and other platforms to sync your menu items and streamline operations.',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Detailed Analytics',
    description:
      'Generate comprehensive reports on inventory usage, purchase history, and expiring items to make data-driven decisions.',
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'grey.900',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Why Choose PrepPad?
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Discover the features that make PrepPad the ultimate kitchen management solution:
            real-time tracking, cost control, automation, and seamless integrations designed
            specifically for restaurant operations.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  borderColor: 'hsla(220, 25%, 25%, 0.3)',
                  backgroundColor: 'grey.800',
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
