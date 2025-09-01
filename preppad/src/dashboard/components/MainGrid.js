import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import ComingSoonCard from './ComingSoonCard';
import OverstockedIngredientsCard from './OverstockedIngredientsCard';
import UnderstockedIngredientsCard from './UnderstockedIngredientsCard';
import TotalCostCard from './TotalCostCard';

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Stock Summary
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <ComingSoonCard />
      </Grid>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <TotalCostCard />
        </Grid>
      </Grid>

      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        General Data
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <OverstockedIngredientsCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <UnderstockedIngredientsCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <ComingSoonCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <ComingSoonCard />
        </Grid>
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
