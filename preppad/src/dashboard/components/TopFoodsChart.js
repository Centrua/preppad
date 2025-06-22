import { Card, CardContent, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import * as React from 'react';

const topFoods = [
  { name: 'Sandwiches', amountUsed: 320 },
  { name: 'Croissants', amountUsed: 260 },
  { name: 'Bagels', amountUsed: 210 },
];

export default function TopFoodsChart() {
  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Top 3 Used Foods
        </Typography>
        <BarChart
          height={300}
          series={[{ data: topFoods.map((f) => f.amountUsed), label: 'Units Used' }]}
          xAxis={[{ scaleType: 'band', data: topFoods.map((f) => f.name) }]}
          yAxis={[{ label: 'Units' }]}
          colors={['#3f51b5']}
          margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
        />
      </CardContent>
    </Card>
  );
}
