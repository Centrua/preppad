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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
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
    itemName: '',
    unitCost: '',
    vendor: '',
    upc: '',
    expirationDate: '',
    unit: '',
    quantityInStock: '',
    isPerishable: 'N',
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const token = localStorage.getItem('token');

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
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
      ? `${API_BASE}/inventory/items/${editingItem.itemId}`
      : `${API_BASE}/inventory/items`;

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
        itemName: '',
        unitCost: '',
        vendor: '',
        upc: '',
        expirationDate: '',
        unit: '',
        quantityInStock: '',
        isPerishable: 'N',
      });
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      itemName: item.itemName,
      unitCost: item.unitCost,
      vendor: item.vendor,
      upc: item.upc || '',
      expirationDate: item.expirationDate?.slice(0, 10) || '',
      unit: item.unit,
      quantityInStock: item.quantityInStock,
      isPerishable: item.isPerishable,
    });
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`${API_BASE}/inventory/items/${itemToDelete.itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirmOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {editingItem ? 'Edit Item' : 'Add Item'}
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
          <form onSubmit={handleSubmit}>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={2}>
              <TextField name="itemName" label="Item Name" value={form.itemName} onChange={handleChange} required />
              <TextField name="unitCost" label="Unit Cost" value={form.unitCost} onChange={handleChange} required />
              <TextField name="vendor" label="Vendor" value={form.vendor} onChange={handleChange} required />
              <TextField name="upc" label="UPC" value={form.upc} onChange={handleChange} />
              <TextField
                name="expirationDate"
                label="Expiration Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.expirationDate}
                onChange={handleChange}
              />
              <TextField name="unit" label="Unit" value={form.unit} onChange={handleChange} required />
              <TextField
                name="quantityInStock"
                label="Quantity in Stock"
                value={form.quantityInStock}
                onChange={handleChange}
                required
              />
              <FormControl>
                <InputLabel>Is Perishable</InputLabel>
                <Select
                  name="isPerishable"
                  value={form.isPerishable}
                  label="Is Perishable"
                  onChange={handleChange}
                >
                  <MenuItem value="Y">Yes</MenuItem>
                  <MenuItem value="N">No</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box mt={3}>
              <Button variant="contained" color="primary" type="submit">
                {editingItem ? 'Update Item' : 'Add Item'}
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
          Inventory Items
        </Typography>
        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Perishable</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.itemId}>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.vendor}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>${item.unitCost}</TableCell>
                  <TableCell>{item.quantityInStock}</TableCell>
                  <TableCell>{item.isPerishable === 'Y' ? 'Yes' : 'No'}</TableCell>
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

        {/* Material UI Delete Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
        >
          <DialogTitle>Delete Item</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete <strong>{itemToDelete?.itemName}</strong>?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
