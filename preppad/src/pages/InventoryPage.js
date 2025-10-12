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
  Divider,
} from '@mui/material';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const unitOptions = [
  'Count',
  'Cups',
  'Dry Ounces',
  'Fluid Ounces',
  'Gallons',
  'Whole/Package',
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
    allowedUnits: [],
    baseUnit: '',
    quantityInStock: '',
    max: '',
  });
  const [conversionRate, setConversionRate] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [ingredientInUseOpen, setIngredientInUseOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (e.target.name === 'allowedUnits') {
      setForm({ ...form, allowedUnits: e.target.value });
    } else if (e.target.name === 'conversionRate') {
      setConversionRate(e.target.value);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const nameExists = Array.isArray(items) && items.some(
      (item) =>
        item.itemName.trim().toLowerCase() === form.itemName.trim().toLowerCase() &&
        (!editingItem || item.id !== editingItem.id)
    );
    if (nameExists) {
      setDuplicateDialogOpen(true);
      return;
    }
    if (Number(form.quantityInStock) > Number(form.max)) {
      setFormError('Quantity in Stock cannot exceed Max.');
      return;
    }
    if (
      form.baseUnit === 'Whole/Package' &&
      (!conversionRate || isNaN(Number(conversionRate)) || Number(conversionRate) <= 0)
    ) {
      setFormError('Please specify how many of the tracked unit(s) are in a Whole/Package.');
      return;
    }
    //
    const method = editingItem ? 'PUT' : 'POST';
    const endpoint = editingItem
      ? `${API_BASE}/ingredients/${editingItem.id}`
      : `${API_BASE}/ingredients`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemName: form.itemName,
          allowedUnits: form.allowedUnits,
          baseUnit: form.baseUnit,
          quantityInStock: form.quantityInStock,
          max: form.max,
          conversionRate: form.baseUnit === 'Whole/Package' ? Number(conversionRate) : null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save inventory');
      }

      // 🔁 Trigger backend shopping list logic for updated items
      if (editingItem) {
        try {
          const updateListRes = await fetch(`${API_BASE}/shopping-list/${editingItem.id}/shopping-list`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (!updateListRes.ok) {
            const errorData = await updateListRes.json();
            console.warn('Failed to update shopping list:', errorData.error || 'Unknown error');
          }
        } catch (err) {
          console.error('❌ Error calling /shopping-list/:id:', err);
        }
      } else {
        try {
          const itemIdRes = await fetch(`${API_BASE}/ingredients/item-id?itemName=${form.itemName}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (itemIdRes.ok) {
            const { itemId } = await itemIdRes.json();

            const updateListRes = await fetch(`${API_BASE}/shopping-list/${itemId}/shopping-list`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });

            if (!updateListRes.ok) {
              const errorData = await updateListRes.json();
              console.warn('Failed to update shopping list:', errorData.error || 'Unknown error');
            }
          } else {
            const errorData = await itemIdRes.json();
            console.warn('Failed to get item ID:', errorData.error || 'Unknown error');
          }
        } catch (err) {
          console.error('❌ Error calling /shopping-list/:id:', err);
        }
      }

      setForm({
        itemName: '',
        allowedUnits: [],
        baseUnit: '',
        quantityInStock: '',
        max: '',
      });
      setConversionRate('');
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to save inventory:', err);
      setFormError(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      itemName: item.itemName,
      allowedUnits: item.allowedUnits || [],
      baseUnit: item.baseUnit,
      quantityInStock: item.quantityInStock,
      max: item.max,
    });
    setConversionRate(item.conversionRate || '');
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete the inventory item
      const res = await fetch(`${API_BASE}/ingredients/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 400 || res.status === 409) {
        setConfirmOpen(false);
        setIngredientInUseOpen(true);
        return;
      }

      // Delete the corresponding item from the shopping list
      await fetch(`${API_BASE}/shopping-list/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setConfirmOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete inventory or shopping list item:', err);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setForm({
      itemName: '',
      allowedUnits: [],
      baseUnit: '',
      quantityInStock: '',
      max: '',
    });
  };

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
          {/* Add Inventory Item Section */}
          <Box sx={{ width: '33%' }}>
            <Typography variant="h5" gutterBottom>
              {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
            </Typography>
            {formError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {formError}
              </Typography>
            )}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" gap={2}>
                  {/* Form fields */}
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
                    <InputLabel id="allowed-units-label">Tracked Units</InputLabel>
                    <Select
                      labelId="allowed-units-label"
                      name="allowedUnits"
                      multiple
                      value={form.allowedUnits}
                      label="Tracked Units"
                      onChange={handleChange}
                      renderValue={(selected) => selected.join(', ')}
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
                  {form.baseUnit === 'Whole/Package' && (
                    <TextField
                      name="conversionRate"
                      label={`How many slices are in a Whole/Package?`}
                      type="number"
                      value={conversionRate}
                      onChange={handleChange}
                      required
                      inputProps={{ min: 1 }}
                    />
                  )}
                  <TextField
                    name="quantityInStock"
                    label="Quantity in Stock"
                    type="number"
                    value={form.quantityInStock}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0, step: 'any' }}
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
          </Box>




          <Divider orientation="vertical" flexItem sx={{ width: '2px', bgcolor: 'divider' }} />





          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                Inventory List
              </Typography>
              <TextField
                label="Search Inventory"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                margin="normal"
                placeholder="Search by item name"
                sx={{ width: '33%' }}
              />
            </Box>
            <Paper elevation={3}>
              <Table sx={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow sx={{ borderBottom: '1px solid #ccc' }}>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>Allowed Units</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>Base Unit</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>Number in Whole/Package</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>Qty In Stock</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>Max</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map(item => (
                    <TableRow key={item.id} sx={{ borderBottom: '1px solid #ccc' }}>
                      <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>{item.itemName}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>{(item.allowedUnits || []).join(', ')}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>{item.baseUnit}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>
                        {item.baseUnit !== 'Whole/Package'
                          ? 'N/A'
                          : item.conversionRate || 'Not found'}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>{Math.ceil(Number(item.quantityInStock))}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>{item.max}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #ccc' }}>
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
          </Box>
        </Box>

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

        <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)}>
          <DialogTitle>Duplicate Item Name</DialogTitle>
          <DialogContent>
            <DialogContentText>
              An inventory item with this name already exists. Please use a unique name.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDuplicateDialogOpen(false)} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
