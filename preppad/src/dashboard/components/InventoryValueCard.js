import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function MiniCard({title, text}) {
    return (
        <Card variant="outlined" sx={{ minheight: '25%', flexGrow: 1 }}>
            <CardContent
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" component="p">
                    {text}
                </Typography>
            </CardContent>
        </Card>
    );
}
