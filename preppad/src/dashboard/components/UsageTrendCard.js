import { Stack } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';

const margin = { right: 24 };

// Sample usage data for 7 days (you can replace this with real data)
const beansData = [120, 110, 105, 130, 125, 100, 95];
const milkData = [50, 45, 55, 52, 48, 49, 51];
const cupsData = [200, 190, 210, 205, 198, 195, 202];

const xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function UsageTrendCard() {
    return (
        <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    Recent Usage Trends
                </Typography>
                <Stack direction="column" sx={{ flexGrow: 1, gap: 1 }}>
                    <LineChart
                        height={300}
                        series={[
                            { data: beansData, label: 'Beans (g)' },
                            { data: milkData, label: 'Milk (oz)' },
                            { data: cupsData, label: 'Cups (qty)' },
                        ]}
                        xAxis={[{ scaleType: 'point', data: xLabels }]}
                        yAxis={[{ width: 50 }]}
                        margin={margin}
                    />
                </Stack>
            </CardContent>
        </Card>
    );
}
