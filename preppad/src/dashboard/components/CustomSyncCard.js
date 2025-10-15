import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

export default function CustomSyncCard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSync = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/inventory/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Sync failed.');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Sync failed.');
    }
    setLoading(false);
  };

  return (
    <Card variant="outlined" sx={{ minHeight: '25%', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CardContent
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography component="h2" variant="subtitle2" gutterBottom align="center">
          Sync Business Data
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSync} disabled={loading} sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={24} /> : 'Sync Now'}
        </Button>
        {error && <Typography color="error" variant="body2" align="center" sx={{ mt: 1 }}>{error}</Typography>}
        <Snackbar
          open={success}
          autoHideDuration={4000}
          onClose={() => setSuccess(false)}
          message="Business sync successful!"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </CardContent>
    </Card>
  );
}
