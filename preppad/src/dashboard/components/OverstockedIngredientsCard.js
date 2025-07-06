import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function OverstockedIngredientsCard() {
    const [overstocked, setOverstocked] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStock = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const base = process.env.REACT_APP_API_BASE_URL;
                const overRes = await fetch(`${base}/ingredients/overstocked`, { headers: { Authorization: `Bearer ${token}` } });
                if (!overRes.ok) throw new Error('Failed to fetch overstocked ingredients');
                const overData = await overRes.json();
                setOverstocked(overData.overstocked || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStock();
    }, []);

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
                    Overstocked Ingredients
                </Typography>
                {loading && <Typography variant="body2" align="center">Loading...</Typography>}
                {error && <Typography color="error" variant="body2" align="center">{error}</Typography>}
                {!loading && !error && overstocked.length === 0 && (
                    <Typography variant="body2" align="center">None</Typography>
                )}
                {!loading && !error && overstocked.length > 0 && (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', textAlign: 'center' }}>
                        {overstocked.map((item) => (
                            <li key={item.id}>
                                <Typography variant="body2" align="center">
                                    {item.itemName} ({item.quantityInStock} / max {item.max})
                                </Typography>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}