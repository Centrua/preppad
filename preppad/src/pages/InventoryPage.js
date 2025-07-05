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
} from '@mui/material';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: '',
    unit: '',
    quantityInStock: '',
    threshold: '',
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const token = localStorage.getItem('token');

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory`, {
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
    const method = editingItem ? 'PUT' : 'POST';
    const endpoint = editingItem
      ? `${API_BASE}/inventory/${editingItem.id}`
      : `${API_BASE}/inventory`;

    try {
      await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      setForm({
        title: '',
        unit: '',
        quantityInStock: '',
        threshold: '',
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
      title: item.title,
      unit: item.unit,
      quantityInStock: item.quantityInStock,
      threshold: item.threshold,
    });
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`${API_BASE}/inventory/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirmOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete inventory:', err);
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
          <form onSubmit={handleSubmit}>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={2}>
              <TextField
                name="title"
                label="Item Title"
                value={form.title}
                onChange={handleChange}
                required
              />
              <TextField
                name="unit"
                label="Unit"
                value={form.unit}
                onChange={handleChange}
                required
              />
              <TextField
                name="quantityInStock"
                label="Quantity in Stock"
                type="number"
                value={form.quantityInStock}
                onChange={handleChange}
                required
              />
              <TextField
                name="threshold"
                label="Threshold"
                type="number"
                value={form.threshold}
                onChange={handleChange}
                required
              />
            </Box>

            <Box mt={3}>
              <Button variant="contained" color="primary" type="submit">
                {editingItem ? 'Update Inventory' : 'Add Inventory'}
              </Button>
              {editingItem && (
                <Button sx={{ ml: 2 }} onClick={() => setEditingItem(null)} color="secondary">
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
                <TableCell>Qty In Stock</TableCell>
                <TableCell>Threshold</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.quantityInStock}</TableCell>
                  <TableCell>{item.threshold}</TableCell>
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
      </Box>
    </Layout>
  );
}
