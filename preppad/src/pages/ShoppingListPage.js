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
  TextField,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { jwtDecode } from 'jwt-decode';

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
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');

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

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const decodedToken = jwtDecode(token);
        const businessId = decodedToken.businessId; // Extract businessId from the decoded token
        const API_BASE = process.env.REACT_APP_API_BASE_URL;

        const response = await fetch(`${API_BASE}/ingredients?businessId=${businessId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
            const formattedIngredients = data.map((ingredient) => ({
              id: ingredient.id,
              name: ingredient.itemName, // Use itemName for display
              baseUnit: ingredient.baseUnit, // Include base unit for context
              allowedUnits: ingredient.allowedUnits, // Include allowed units for context
            }));
            setIngredients(formattedIngredients);
        } else {
          console.error('Failed to fetch ingredients');
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };

    fetchIngredients();
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

  const handleAddItem = () => {
    if (!selectedIngredient) return;

    const ingredient = ingredients.find((ing) => ing.name === selectedIngredient);
    if (!ingredient) return;

    setRows((prev) => {
      const existingRow = prev.find((row) => row.id === ingredient.id);
      if (existingRow) {
        // Update the quantity of the existing row
        return prev.map((row) =>
          row.id === ingredient.id
            ? { ...row, quantity: row.quantity + newQuantity }
            : row
        );
      } else {
        // Add a new row
        return [
          ...prev,
          {
            id: ingredient.id, // Use the ingredient's ID
            item: ingredient.name, // Use the ingredient's name for display
            quantity: newQuantity,
          },
        ];
      }
    });

    setSelectedIngredient('');
    setNewQuantity(1);
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

          {/* Add Item Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, mt: 4 }}>
            <TextField
              select
              label="Select Ingredient"
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              variant="outlined"
              style={{ flex: 1, marginRight: '8px' }}
            >
              {ingredients.map((ingredient) => (
                <MenuItem key={ingredient.id} value={ingredient.name}>
                  {`${ingredient.name} (${ingredient.baseUnit})`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quantity"
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
              variant="outlined"
              style={{ width: '100px', marginRight: '8px' }}
            />
            <Button variant="contained" color="secondary" onClick={handleAddItem}>
              Add Item
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
