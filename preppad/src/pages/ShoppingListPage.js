import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  {
    field: 'item',
    headerName: 'Item',
    flex: 1,
    editable: false, // Item name should not be editable
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'quantity',
    headerName: 'Item Quantity Needed',
    type: 'number',
    flex: 1,
    editable: true,
    headerAlign: 'center',
    align: 'center',
    valueParser: (value) => {
      const parsed = Number(value);
      return isNaN(parsed) ? 0 : parsed;
    },
  },
];

export default function ShoppingListPage() {
  const [rows, setRows] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const openDialog = (message) => {
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE = process.env.REACT_APP_API_BASE_URL;

        const response = await fetch(`${API_BASE}/shopping-list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && data) {
          const { itemIds, itemNames, quantities } = data;

          // Build rows from itemIds, itemNames, and quantities
          const newRows = (itemIds || []).map((itemId, index) => ({
            id: itemId,
            item: (itemNames && itemNames[index]) || 'Unnamed Item',
            quantity: (quantities && quantities[index]) || 0,
          }));
          setRows(newRows);
        } else {
          console.error('Failed to load shopping list:', data.error);
        }
      } catch (err) {
        console.error('Error fetching shopping list:', err);
      }
    };

    fetchShoppingList();
  }, []);

  const handleProcessRowUpdate = (newRow) => {
    const quantity = Number(newRow.quantity);
    const cleanRow = {
      ...newRow,
      quantity: isNaN(quantity) ? 0 : quantity,
    };
    setRows((prev) => prev.map((row) => (row.id === cleanRow.id ? cleanRow : row)));
    return cleanRow;
  };

  const handleSubmitPurchase = async () => {
    try {
      if (rows.length === 0) {
        openDialog('No items to submit');
        return;
      }

      const itemIds = rows.map((row) => row.id);
      const quantities = rows.map((row) => row.quantity);

      const payload = {
        itemIds,
        quantities,
      };

      const API_BASE = process.env.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem('token');

      const purchaseRes = await fetch(`${API_BASE}/pending-purchase`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await purchaseRes.json();

      if (purchaseRes.ok) {
        const clearRes = await fetch(`${API_BASE}/shopping-list/clear`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!clearRes.ok) {
          console.warn('Shopping list was submitted but not cleared.');
        }

        openDialog('Purchase submitted successfully!');
        setRows([]);
      } else {
        openDialog('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting purchase:', error);
      openDialog('Failed to submit purchase');
    }
  };

  return (
    <Layout>
      <Box sx={{ width: '100%', px: 2, mt: 4 }}>
        <Paper sx={{ width: '100%', p: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            processRowUpdate={handleProcessRowUpdate}
            experimentalFeatures={{ newEditingApi: true }}
            disableRowSelectionOnClick
            autoHeight
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSubmitPurchase}>
              Submit To Pending Purchases
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
