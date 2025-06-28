import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import ExpiringSoonList from './ExpiringSoonList';
import MiniCard from './InventoryValueCard';
import LowStockList from './LowStockList';
import StatCard from './StatCard';
import TopFoodsChart from './TopFoodsChart';
import UsageTrendCard from './UsageTrendCard';

const data = [
  {
    title: 'Ingredient Cost',
    value: '3.43k',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340, 380,
      360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
    ],
  },
  {
    title: 'Inventory Waste',
    value: '$325.79',
    interval: 'Last 30 days',
    trend: 'down',
    data: [
      1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600, 820,
      780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300, 220,
    ],
  },
];

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
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Top Products
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MiniCard title='Inventory Total Value' text='$4,365' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MiniCard title='Top Drink This Week' text='Iced Coffee (24 sold)' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MiniCard title='Top Food This Week' text='Breakfast Bowls (13 sold)' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MiniCard title='Top Product This Month' text='Iced Coffee (78 sold)' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <UsageTrendCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <TopFoodsChart />
        </Grid>
      </Grid>

      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Stock Alerts
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <LowStockList></LowStockList>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <ExpiringSoonList></ExpiringSoonList>
        </Grid>
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
