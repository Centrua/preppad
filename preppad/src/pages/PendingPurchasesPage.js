import React, { useEffect, useState, useRef } from 'react';
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function PendingPurchasesPage() {
  const [allPurchases, setAllPurchases] = useState([]); // Store all purchases
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [quantities, setQuantities] = useState([]);
  const [totalPrice, setTotalPrice] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [formError, setFormError] = useState('');
  const printRef = useRef();
  const [printText, setPrintText] = useState('');
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch all purchases, don't filter here
  const fetchPendingPurchases = async () => {
    try {
      const res = await fetch(`${API_BASE}/pending-purchase`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setAllPurchases(data); // Store all purchases
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPurchases();
  }, [token]); // Only run on mount or token change

  const handleOpenDialog = (purchase) => {
    setSelectedPurchase(purchase);
    setQuantities([...purchase.quantities]);
    // If completed, show the saved totalPrice; otherwise, clear for input
    setTotalPrice(purchase.status === 'completed' && purchase.totalPrice != null ? String(purchase.totalPrice) : '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPurchase(null);
    setQuantities([]);
    setTotalPrice('');
    setFormError('');
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

  const handleConfirm = async () => {
    if (!selectedPurchase || !selectedPurchase.id) return;
    setFormError('');
    if (!totalPrice || isNaN(Number(totalPrice)) || Number(totalPrice) < 0) {
      setFormError('Total price is required and must be a positive number.');
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/pending-purchase/${selectedPurchase.id}/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ totalPrice: Number(totalPrice) }),
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        setFormError(`Failed to confirm purchase: ${errData.error || res.statusText}`);
        return;
      }
      // Call the diff-to-shopping-list endpoint with confirmed quantities
      await fetch(
        `${API_BASE}/pending-purchase/${selectedPurchase.id}/diff-to-shopping-list`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ confirmedQuantities: quantities }),
        }
      );
      // Call the update-inventory endpoint with itemIds and their confirmed quantities
      await fetch(
        `${API_BASE}/pending-purchase/${selectedPurchase.id}/update-inventory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itemIds: selectedPurchase.itemIds, quantities }),
        }
      );
      // Update all purchases after confirming
      await fetchPendingPurchases();
      handleCloseDialog();
    } catch (err) {
      setFormError('Unexpected error occurred');
      console.error(err);
    }
  };

  // Helper to get printable/copyable text for a purchase
  const getPurchaseText = (purchase) => {
    const lines = purchase.itemNames.map((name, idx) =>
      `${name}: ${purchase.quantities[idx]}`
    );
    return `Purchase ID: ${purchase.id}\n` + lines.join('\n');
  };

  const handleCopy = (purchase) => {
    const text = getPurchaseText(purchase);
    navigator.clipboard.writeText(text);
  };

  const handlePrint = (purchase) => {
    setPrintText(getPurchaseText(purchase));
    setShowPrintDialog(true);
  };
  const handlePrintDialog = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerText;
      const printWindow = window.open('', '', 'height=600,width=400');
      printWindow.document.write('<pre>' + printContents + '</pre>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }
    setShowPrintDialog(false);
  };
  const handleClosePrintDialog = () => {
    setShowPrintDialog(false);
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
        <Box mb={2} display="flex" alignItems="center" gap={2}>
          <Typography>Status:</Typography>
          <Button
            variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter('pending')}
            size="small"
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
            onClick={() => setStatusFilter('completed')}
            size="small"
          >
            Completed
          </Button>
        </Box>
        <Paper>
          <Table aria-label="pending purchases table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Purchase ID</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allPurchases
                .filter((purchase) => purchase.status === statusFilter)
                .map((purchase) => (
                  <TableRow key={purchase.id} hover>
                    <TableCell />
                    <TableCell>{purchase.id}</TableCell>
                    <TableCell>
                      {purchase.itemNames && purchase.itemNames.length > 0
                        ? purchase.itemNames[0]
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
                        color={purchase.status === 'completed' ? 'info' : 'primary'}
                        onClick={() => handleOpenDialog(purchase)}
                      >
                        {purchase.status === 'completed' ? 'View' : 'Confirm'}
                      </Button>
                      <Button
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => handleCopy(purchase)}
                        title="Copy text"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </Button>
                      <Button
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => handlePrint(purchase)}
                        title="Print"
                      >
                        <PrintIcon fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedPurchase && selectedPurchase.status === 'completed' ? 'View Purchase List' : 'Confirm Purchase List'}</DialogTitle>
          <DialogContent dividers>
            {formError && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {formError}
              </Typography>
            )}
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
                          Item Name
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
                      {selectedPurchase.itemNames.map((itemName, idx) => (
                        <TableRow key={`${selectedPurchase.id}-${idx}`}>
                          <TableCell align="left" sx={{ px: 2 }}>
                            {itemName}
                          </TableCell>
                          <TableCell align="center" sx={{ px: 2 }}>
                            <TextField
                              type="number"
                              size="small"
                              value={quantities[idx]}
                              onChange={(e) =>
                                handleQuantityChange(idx, e.target.value)
                              }
                              inputProps={{ min: 0, style: { textAlign: 'center' }, readOnly: selectedPurchase.status === 'completed' }}
                              sx={{ width: 80, mx: 'auto', display: 'block' }}
                              disabled={selectedPurchase.status === 'completed'}
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
                    type="number"
                    size="small"
                    value={totalPrice}
                    onChange={handleTotalPriceChange}
                    placeholder="Enter total price"
                    inputProps={{
                      min: 0,
                      step: '0.01',
                      style: { textAlign: 'center' },
                      readOnly: selectedPurchase.status === 'completed',
                    }}
                    sx={{ width: 140 }}
                    disabled={selectedPurchase.status === 'completed'}
                  />
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Close
            </Button>
            {selectedPurchase && selectedPurchase.status !== 'completed' && (
              <Button
                onClick={handleConfirm}
                variant="contained"
                color="success"
                sx={{ fontWeight: 'bold', minWidth: 140 }}
              >
                Confirm List
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Print Dialog */}
        <Dialog open={showPrintDialog} onClose={handleClosePrintDialog} maxWidth="xs" fullWidth>
          <DialogTitle>Print Purchase</DialogTitle>
          <DialogContent dividers>
            <pre ref={printRef} style={{ fontFamily: 'inherit', fontSize: 16 }}>{printText}</pre>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePrintDialog} color="inherit">Cancel</Button>
            <Button onClick={handlePrintDialog} variant="contained" color="primary">Print</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
