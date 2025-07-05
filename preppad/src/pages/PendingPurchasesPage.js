import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableContainer,
} from '@mui/material';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function PendingPurchasesPage() {
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [quantities, setQuantities] = useState([]);
  const [totalPrice, setTotalPrice] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchPendingPurchases() {
      try {
        const res = await fetch(`${API_BASE}/inventory/pending-purchases`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setPendingPurchases(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPendingPurchases();
  }, [token]);

  const handleOpenDialog = (purchase) => {
    setSelectedPurchase(purchase);
    setQuantities([...purchase.quantities]);
    setTotalPrice('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPurchase(null);
    setQuantities([]);
    setTotalPrice('');
  };

  const handleQuantityChange = (index, value) => {
    const newQuantities = [...quantities];
    const newValue = Number(value) || 0;
    newQuantities[index] = newValue;
    setQuantities(newQuantities);
  };

  const handleTotalPriceChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setTotalPrice(val);
    }
  };

  const handleConfirm = () => {
    console.log('Confirmed purchase:', {
      purchaseId: selectedPurchase.id,
      quantities,
      totalPrice,
    });
    // Implement backend update logic here if needed
    handleCloseDialog();
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box mt={4}>
          <Typography color="error" align="center">
            Error loading pending purchases: {error}
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={4}>
        <Typography variant="h5" gutterBottom>
          Pending Purchases
        </Typography>
        <Paper>
          <Table aria-label="pending purchases table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Purchase ID</TableCell>
                <TableCell>Item ID</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingPurchases.map((purchase) => (
                <TableRow key={purchase.id} hover>
                  <TableCell />
                  <TableCell>{purchase.id}</TableCell>
                  <TableCell>
                    {purchase.itemIds && purchase.itemIds.length > 0
                      ? purchase.itemIds[0]
                      : ''}
                  </TableCell>
                  <TableCell>
                    {purchase.quantities && purchase.quantities.length > 0
                      ? purchase.quantities[0]
                      : ''}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog(purchase)}
                    >
                      Confirm
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Confirm Purchase List</DialogTitle>
          <DialogContent dividers>
            {selectedPurchase && (
              <>
                <Typography
                  variant="h6"
                  align="center"
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  All Items
                </Typography>
                <TableContainer component={Paper}>
                  <Table
                    size="small"
                    aria-label="items table"
                    sx={{
                      width: '100%',
                      tableLayout: 'fixed',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align="left"
                          sx={{ minWidth: 120, fontWeight: 'bold' }}
                        >
                          Item ID
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ width: 150, fontWeight: 'bold' }}
                        >
                          Quantity Purchased
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPurchase.itemIds.map((itemId, idx) => (
                        <TableRow key={`${selectedPurchase.id}-${idx}`}>
                          <TableCell align="left" sx={{ px: 2 }}>
                            {itemId}
                          </TableCell>
                          <TableCell align="center" sx={{ px: 2 }}>
                            <TextField
                              type="number"
                              size="small"
                              value={quantities[idx]}
                              onChange={(e) =>
                                handleQuantityChange(idx, e.target.value)
                              }
                              inputProps={{ min: 0, style: { textAlign: 'center' } }}
                              sx={{ width: 80, mx: 'auto', display: 'block' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    marginTop: 3,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ minWidth: 130, textAlign: 'right' }}
                  >
                    Total Price ($):
                  </Typography>
                  <TextField
                    type="text"
                    size="small"
                    value={totalPrice}
                    onChange={handleTotalPriceChange}
                    placeholder="Enter total price"
                    inputProps={{ inputMode: 'decimal', pattern: '[0-9]*', style: { textAlign: 'center' } }}
                    sx={{ width: 140 }}
                  />
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="success"
              sx={{ fontWeight: 'bold', minWidth: 140 }}
            >
              Confirm List
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
