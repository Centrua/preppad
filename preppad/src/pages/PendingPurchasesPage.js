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
  const [allPurchases, setAllPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [quantities, setQuantities] = useState([]);
  const [totalPrice, setTotalPrice] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [formError, setFormError] = useState('');
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const printRef = useRef();
  const [printText, setPrintText] = useState('');
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmInventoryDialogOpen, setConfirmInventoryDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token');

  const fetchPendingPurchases = async () => {
    try {
      const res = await fetch(`${API_BASE}/pending-purchase`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setAllPurchases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPurchases();
  }, [token]);

  const handleOpenDialog = (purchase) => {
    setSelectedPurchase(purchase);
    setQuantities([...purchase.quantities]);
    setTotalPrice(
      purchase.status === 'completed' && purchase.totalPrice != null
        ? String(purchase.totalPrice)
        : ''
    ); 
    setPurchaseLocation(purchase.purchaseLocation);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPurchase(null);
    setQuantities([]);
    setTotalPrice('');
    setPurchaseLocation('');
    setFormError('');
  };

  const handleQuantityChange = (index, value) => {
    const newQuantities = [...quantities];
    newQuantities[index] = Number(value) || 0;
    setQuantities(newQuantities);
  };

  const handleTotalPriceChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setTotalPrice(val);
    }
  };

  const handleConfirm = () => {
    setConfirmInventoryDialogOpen(true);
  };

  const handleConfirmInventoryProceed = async () => {
    if (!selectedPurchase || !selectedPurchase.id) return;
    setFormError('');

    if (!purchaseLocation) {
      setFormError('Purchase location is required.');
      setConfirmInventoryDialogOpen(false);
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
          body: JSON.stringify({
            totalPrice: totalPrice ? Number(totalPrice) : null, // Make totalPrice optional
            purchaseLocation,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        setFormError(`Failed to confirm purchase: ${errData.error || res.statusText}`);
        setConfirmInventoryDialogOpen(false);
        return;
      }

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

      await fetchPendingPurchases();
      handleCloseDialog();
      setConfirmInventoryDialogOpen(false);
    } catch (err) {
      setFormError('Unexpected error occurred');
      setConfirmInventoryDialogOpen(false);
      console.error(err);
    }
  };

  const getPurchaseText = (purchase) => {
    const lines = purchase.itemNames.map((name, idx) => {
      const quantity = purchase.quantities[idx];
      const note = purchase.notes && purchase.notes[idx] ? `Note: ${purchase.notes[idx]}` : 'No note.';
      return `${name}: ${quantity} (${note})`;
    });
    return `Purchase ID: ${purchase.id}\n` + lines.join('\n');
  };

  const handleCopy = (purchase) => {
    const text = getPurchaseText(purchase);
    navigator.clipboard.writeText(text);
    alert('Copied purchase details to clipboard!');
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

  // Delete dialog handlers
  const openDeleteDialog = (purchaseId) => {
    setPurchaseToDelete(purchaseId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setPurchaseToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    try {
      // Add the pending purchase back to the shopping list
      const addToShoppingListRes = await fetch(
        `${API_BASE}/pending-purchase/add-to-shopping-list`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pendingPurchaseId: purchaseToDelete }),
        }
      );

      if (!addToShoppingListRes.ok) {
        const errorData = await addToShoppingListRes.json();
        throw new Error(
          `Failed to add purchase ${purchaseToDelete} to shopping list: ${errorData.error || addToShoppingListRes.statusText}`
        );
      }

      // Delete the pending purchase
      const res = await fetch(
        `${API_BASE}/pending-purchase/${purchaseToDelete}/update-pending-purchases`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let errMessage = `Failed to delete purchase ${purchaseToDelete}`;
      try {
        const errData = await res.json();
        if (errData.error) errMessage = errData.error;
      } catch (_) {}

      if (!res.ok) {
        throw new Error(errMessage);
      }

      setAllPurchases((prev) => prev.filter((p) => p.id !== purchaseToDelete));
      closeDeleteDialog();
    } catch (err) {
      console.error(err);
      alert(`Error deleting purchase: ${err.message}`);
    }
  };

  const sortedPurchases = allPurchases
    .filter((purchase) => purchase.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === 'desc' ? 'asc' : 'desc'));
  };

  // 
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

  const renderDeleteButton = (purchase) => {
    if (purchase.status === 'pending') {
      return (
        <Button
          variant="outlined"
          color="error"
          onClick={() => openDeleteDialog(purchase.id)}
        >
          Delete
        </Button>
      );
    }
    return null;
  };

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

        <Paper elevation={3}>
          <Table
            aria-label="pending purchases table"
            sx={{ border: '1px solid #ddd', borderCollapse: 'collapse' }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Purchase ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Item Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Location</TableCell>
                <TableCell
                  onClick={handleSortToggle}
                  style={{ cursor: 'pointer', fontWeight: 'bold', border: '1px solid #ddd' }}
                >
                  Date {sortOrder === 'desc' ? '↓' : '↑'}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPurchases.map((purchase) => (
                <TableRow key={purchase.id} hover sx={{ border: '1px solid #ddd' }}>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{purchase.id}</TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>
                    {purchase.itemNames && purchase.itemNames.length > 0
                      ? purchase.itemNames[0]
                      : ''}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>
                    {purchase.quantities && purchase.quantities.length > 0
                      ? purchase.quantities[0]
                      : ''}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{purchase.purchaseLocation || 'N/A'}</TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{new Date(purchase.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
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
                    {renderDeleteButton(purchase)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Confirm/View Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedPurchase && selectedPurchase.status === 'completed'
              ? 'View Purchase List'
              : 'Confirm Purchase List'}
          </DialogTitle>
          <DialogContent dividers>
            {formError && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {formError}
              </Typography>
            )}
            {selectedPurchase && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3}}>
                  <Typography
                    variant="h6"
                    align="center"
                    gutterBottom
                    sx={{ fontWeight: 'bold', ml: 5  }}
                  >
                    All Items
                  </Typography>
                  <TextField
                    label="Search Items"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    margin="normal"
                    placeholder="Search by item name"
                    sx={{ width: '300px', marginLeft: 'auto' }}
                  />
                </Box>

                <TableContainer component={Paper}>
                  <Table
                    aria-label="all items table"
                    sx={{ border: '1px solid #ddd', borderCollapse: 'collapse' }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Item Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', whiteSpace: 'normal', wordWrap: 'break-word' }}>Note</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>Quantity Purchased</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPurchase.itemNames
                        .filter((itemName) =>
                          itemName.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((itemName, idx) => (
                          <TableRow key={`${selectedPurchase.id}-${idx}`} sx={{ border: '1px solid #ddd' }}>
                            <TableCell sx={{ border: '1px solid #ddd' }}>{itemName}</TableCell>
                            <TableCell
                              sx={{
                                border: '1px solid #ddd',
                                width: '200px',
                                whiteSpace: 'pre-line',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                hyphens: 'auto',
                                textOverflow: 'clip',
                                display: 'table-cell',
                                verticalAlign: 'top',
                              }}
                            >
                              {selectedPurchase.notes && selectedPurchase.notes[idx]
                                ? selectedPurchase.notes[idx]
                                : 'No note.'}
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #ddd' }}>
                              <TextField
                                type="number"
                                size="small"
                                value={quantities[idx]}
                                onChange={(e) => handleQuantityChange(idx, e.target.value)}
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

                <TextField
                  label="Purchase Location"
                  value={purchaseLocation}
                  onChange={(e) => setPurchaseLocation(e.target.value)}
                  fullWidth
                  margin="normal"
                  disabled={selectedPurchase.status === 'completed'}
                >
                </TextField>


                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left', gap: 1, marginTop: 3, marginLeft: 1}}>
                  <Typography variant="subtitle1" sx={{ minWidth: 130, textAlign: 'left' }}>
                    Total Price ($):
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={totalPrice}
                    onChange={handleTotalPriceChange}
                    placeholder="Enter total price"
                    inputProps={{ min: 0, step: '0.01', style: { textAlign: 'center' }, readOnly: selectedPurchase.status === 'completed' }}
                    sx={{ width: 150 }}
                    disabled={selectedPurchase.status === 'completed'}
                  />
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit">Close</Button>
            {selectedPurchase && selectedPurchase.status !== 'completed' && (
              <Button onClick={handleConfirm} variant="contained" color="success" sx={{ fontWeight: 'bold', minWidth: 140 }}>
                Confirm List
              </Button>
            )}
        {/* Confirm Inventory Update Dialog */}
        <Dialog open={confirmInventoryDialogOpen} onClose={() => setConfirmInventoryDialogOpen(false)}>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>
            <Typography>
              This will update the inventory and is <b>irreversible</b>.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmInventoryDialogOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={handleConfirmInventoryProceed} color="error" variant="contained">Proceed</Button>
          </DialogActions>
        </Dialog>
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this purchase?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog} color="inherit">Cancel</Button>
            <Button onClick={handleDeletePurchase} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Layout>
  );
}
