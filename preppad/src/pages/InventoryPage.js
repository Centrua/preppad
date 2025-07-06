import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const unitOptions = [
  'Count',
  'Cups',
  'Dry Ounces',
  'Fluid Ounces',
  'Gallons',
  'Pints',
  'Quarts',
  'Slices',
  'Tablespoons',
  'Teaspoons',
].sort();

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    itemName: '',
    unit: '',
    baseUnit: '',
    quantityInStock: '',
    threshold: '',
    max: '',
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [ingredientInUseOpen, setIngredientInUseOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const token = localStorage.getItem('token');

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/ingredients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch inventory items:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (Number(form.quantityInStock) > Number(form.max)) {
      setFormError('Quantity in Stock cannot exceed Max.');
      return;
    }
    const method = editingItem ? 'PUT' : 'POST';
    const endpoint = editingItem
      ? `${API_BASE}/ingredients/${editingItem.id}`
      : `${API_BASE}/ingredients`; // <-- POST to /ingredients for new items

    try {
      await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemName: form.itemName,
          unit: form.unit,
          baseUnit: form.baseUnit,
          quantityInStock: form.quantityInStock,
          threshold: form.threshold,
          max: form.max,
        }),
      });

      setForm({
        itemName: '',
        unit: '',
        baseUnit: '',
        quantityInStock: '',
        threshold: '',
        max: '',
      });
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to save inventory:', err);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      itemName: item.itemName,
      unit: item.unit,
      baseUnit: item.baseUnit,
      quantityInStock: item.quantityInStock,
      threshold: item.threshold,
      max: item.max,
    });
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/ingredients/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 400 || res.status === 409) {
        setConfirmOpen(false);
        setIngredientInUseOpen(true);
        return;
      }
      setConfirmOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete inventory:', err);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setForm({
      itemName: '',
      unit: '',
      baseUnit: '',
      quantityInStock: '',
      threshold: '',
      max: '',
    });
  };

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        </Typography>
        {formError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {formError}
          </Typography>
        )}
        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
          <form onSubmit={handleSubmit}>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={2}>
              <FormControl fullWidth required>
                <TextField
                  name="itemName"
                  label="Item Name"
                  value={form.itemName}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel id="unit-label">Unit (for recipes)</InputLabel>
                <Select
                  labelId="unit-label"
                  name="unit"
                  value={form.unit}
                  label="Unit (for recipes)"
                  onChange={handleChange}
                >
                  {unitOptions.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel id="base-unit-label">Base Unit (for storage)</InputLabel>
                <Select
                  labelId="base-unit-label"
                  name="baseUnit"
                  value={form.baseUnit}
                  label="Base Unit (for storage)"
                  onChange={handleChange}
                >
                  {unitOptions.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="quantityInStock"
                label="Quantity in Stock"
                type="number"
                value={form.quantityInStock}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                name="threshold"
                label="Threshold"
                type="number"
                value={form.threshold}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
              <TextField
                name="max"
                label="Max"
                type="number"
                value={form.max}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Box>

            <Box mt={3}>
              <Button variant="contained" color="primary" type="submit">
                {editingItem ? 'Update Inventory' : 'Submit Inventory'}
              </Button>
              {editingItem && (
                <Button sx={{ ml: 2 }} onClick={handleCancel} color="secondary">
                  Cancel
                </Button>
              )}
            </Box>
          </form>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Inventory List
        </Typography>
        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Base Unit</TableCell>
                <TableCell>Qty In Stock</TableCell>
                <TableCell>Threshold</TableCell>
                <TableCell>Max</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.baseUnit}</TableCell>
                  <TableCell>{item.quantityInStock}</TableCell>
                  <TableCell>{item.threshold}</TableCell>
                  <TableCell>{item.max}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDeleteClick(item)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Delete Inventory</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this inventory item?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={ingredientInUseOpen} onClose={() => setIngredientInUseOpen(false)}>
          <DialogTitle>Cannot Delete Ingredient</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This ingredient is used in one or more recipes. Please remove it from all recipes before deleting.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIngredientInUseOpen(false)} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
