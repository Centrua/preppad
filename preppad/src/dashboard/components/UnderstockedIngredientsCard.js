import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function UnderstockedIngredientsCard() {
    const [understocked, setUnderstocked] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStock = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const base = process.env.REACT_APP_API_BASE_URL;
                const underRes = await fetch(`${base}/ingredients/understocked`, { headers: { Authorization: `Bearer ${token}` } });
                if (!underRes.ok) throw new Error('Failed to fetch understocked ingredients');
                const underData = await underRes.json();
                setUnderstocked(underData.understocked || []);
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
                    Understocked Ingredients
                </Typography>
                {loading && <Typography variant="body2" align="center">Loading...</Typography>}
                {error && <Typography color="error" variant="body2" align="center">{error}</Typography>}
                {!loading && !error && understocked.length === 0 && (
                    <Typography variant="body2" align="center">None</Typography>
                )}
                {!loading && !error && understocked.length > 0 && (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', textAlign: 'center' }}>
                        {understocked.map((item) => (
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