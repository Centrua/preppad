import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function TotalCostCard() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCost, setTotalCost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTotalCost = async (start = startDate, end = endDate) => {
    try {
      if (!start || !end) {
        setError('Both start date and end date are required.');
        return;
      }

      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_BASE_URL;

      const response = await fetch(
        `${API_BASE}/pending-purchase/total-cost?startDate=${start}&endDate=${end}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTotalCost(data.totalCost);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch total cost.');
      }
    } catch (err) {
      console.error('Error fetching total cost:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const calculateDefaultDates = () => {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const formatDate = (date) => date.toISOString().split('T')[0];

      const defaultStartDate = formatDate(thirtyDaysAgo);
      const defaultEndDate = formatDate(today);

      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);

      // Ensure fetchTotalCost is called only after dates are set
      fetchTotalCost(defaultStartDate, defaultEndDate);
    };

    calculateDefaultDates();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchTotalCost(startDate, endDate);
    }
  }, [startDate, endDate]);

  return (
    <Card
      variant="outlined"
      sx={{
        minHeight: '25%',
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
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
          Total Cost
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        {loading && <Typography variant="body2" align="center">Loading...</Typography>}
        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}
        {totalCost !== null && !loading && !error && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Total Cost: ${totalCost}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
