import BugReportIcon from '@mui/icons-material/BugReport';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function CardAlert() {
  return (
    <Card variant="outlined" sx={{ m: 1.5, flexShrink: 0 }}>
      <CardContent>
        <BugReportIcon fontSize="small" />
        <Typography gutterBottom sx={{ fontWeight: 600 }}>
          Emergency Contact
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          If any issue arises, please contact us.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          (260) 445-8282
        </Typography>
      </CardContent>
    </Card>
  );
}
