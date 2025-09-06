import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const [newQuantity, setNewQuantity] = useState(1);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState([]);
  const [customList, setCustomList] = useState([]);
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [quantityToMove, setQuantityToMove] = useState(0);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [onQuantityConfirm, setOnQuantityConfirm] = useState(null);
  const [invalidQuantityDialogOpen, setInvalidQuantityDialogOpen] = useState(false);

  const openDialog = (message) => {
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const openQuantityDialog = (maxQuantity, callback) => {
    setMaxQuantity(maxQuantity);
    setQuantityToMove(maxQuantity);
    setOnQuantityConfirm(() => callback);
    setQuantityDialogOpen(true);
  };

  const closeQuantityDialog = () => {
    setQuantityDialogOpen(false);
    setQuantityToMove(0);
    setMaxQuantity(0);
    setOnQuantityConfirm(null);
  };

  const openInvalidQuantityDialog = () => {
    setInvalidQuantityDialogOpen(true);
  };

  const closeInvalidQuantityDialog = () => {
    setInvalidQuantityDialogOpen(false);
  };

  const handleQuantityConfirm = () => {
    if (quantityToMove > 0 && quantityToMove <= maxQuantity) {
      onQuantityConfirm(quantityToMove);
      closeQuantityDialog();
    } else {
      openInvalidQuantityDialog();
    }
  };

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE = process.env.REACT_APP_API_BASE_URL;

        const response = await fetch(`${API_BASE}/shopping-list`, {
          headers:
          {
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

  const handleDeleteItem = async (itemId) => {
    try {
      const API_BASE = process.env.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/shopping-list/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRows((prev) => prev.filter((row) => row.id !== itemId));
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const DraggableRow = ({ row }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: row.id });

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          borderBottom: '1px solid #ddd',
          cursor: 'grab',
          backgroundColor: isDragging ? '#cce5ff' : '#f0f8ff',
          opacity: isDragging ? 0.8 : 1,
          transform: isDragging ? 'scale(1.05)' : 'none',
          transition: 'transform 0.2s, background-color 0.2s, opacity 0.2s',
        }}
      >
        <span style={{ flex: 1, textAlign: 'center' }}>{row.item}</span>
        <span style={{ flex: 1, textAlign: 'center' }}>{row.quantity}</span>
      </div>
    );
  };

  const DroppableContainer = ({ id, children, columns }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
      <div
        ref={setNodeRef}
        style={{
          padding: '16px',
          backgroundColor: isOver ? '#d4edda' : '#f8f9fa',
          borderRadius: '4px',
          transition: 'background-color 0.3s',
          marginBottom: '16px',
          minHeight: '300px', // Ensures consistent height
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', padding: '8px', backgroundColor: '#e0e0e0', fontWeight: 'bold' }}>
          {columns.map((col) => (
            <span key={col.field} style={{ flex: 1, textAlign: 'center' }}>{col.headerName}</span>
          ))}
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const draggedItem = rows.find((row) => row.id === active.id) || customList.find((item) => item.id === active.id);

    if (over.id === 'customList' && rows.some((row) => row.id === active.id)) {
      const existingItem = customList.find((item) => item.id === active.id);
      const maxQuantity = draggedItem.quantity;

      openQuantityDialog(maxQuantity, (quantity) => {
        setCustomList((prev) => {
          if (existingItem) {
            return prev.map((item) =>
              item.id === active.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            return [...prev, { ...draggedItem, quantity }];
          }
        });
        setRows((prev) =>
          prev.map((row) =>
            row.id === active.id
              ? { ...row, quantity: row.quantity - quantity }
              : row
          ).filter((row) => row.quantity > 0)
        );
      });
    } else if (over.id === 'shoppingList' && customList.some((item) => item.id === active.id)) {
      const existingItem = rows.find((row) => row.id === active.id);
      const maxQuantity = draggedItem.quantity;

      openQuantityDialog(maxQuantity, (quantity) => {
        setRows((prev) => {
          if (existingItem) {
            return prev.map((row) =>
              row.id === active.id
                ? { ...row, quantity: row.quantity + quantity }
                : row
            );
          } else {
            return [...prev, { ...draggedItem, quantity }];
          }
        });
        setCustomList((prev) =>
          prev.map((item) =>
            item.id === active.id
              ? { ...item, quantity: item.quantity - quantity }
              : item
          ).filter((item) => item.quantity > 0)
        );
      });
    } else if (over.id === 'trash') {
      handleDeleteItem(active.id);
    }
  };

  const TrashContainer = () => {
    const { setNodeRef, isOver } = useDroppable({ id: 'trash' });

    return (
      <div
        ref={setNodeRef}
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: isOver ? '#ffcccc' : '#f8d7da',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '16px auto',
          cursor: 'pointer',
        }}
      >
        <DeleteIcon style={{ color: '#721c24', fontSize: '48px' }} />
      </div>
    );
  };

  const handleSubmitCustomList = async () => {
    try {
      if (customList.length === 0) {
        openDialog('No items in the custom list to submit');
        return;
      }

      const API_BASE = process.env.REACT_APP_API_BASE_URL;
      const token = localStorage.getItem('token');

      const itemIds = customList.map((item) => item.id);
      const quantities = customList.map((item) => item.quantity);

      const payload = {
        itemIds,
        quantities,
      };

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
        // Delete items from the base shopping list
        for (const itemId of itemIds) {
          await fetch(`${API_BASE}/shopping-list/${itemId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        openDialog('Custom list submitted to pending purchases!');
        setCustomList([]);
      } else {
        openDialog('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting custom list:', error);
      openDialog('Failed to submit custom list');
    }
  };

  return (
    <Layout>
      <Box sx={{ width: '100%', px: 2, mt: 4 }}>
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

        {/* Drag and Drop Section */}
        <DndContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, mt: 4 }}>
            <Box sx={{ textAlign: 'center', width: '50%' }}>
              <Typography variant="h6" align="center" style={{ marginBottom: '8px' }}>
                Base Shopping List
              </Typography>
              <DroppableContainer id="shoppingList" columns={columns}>
                {rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </DroppableContainer>
              <Button variant="contained" color="primary" onClick={handleSubmitPurchase}>
                Submit To Pending Purchases
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', width: '50%' }}>
              <Typography variant="h6" align="center" style={{ marginBottom: '8px' }}>
                Custom Shopping List
              </Typography>
              <DroppableContainer id="customList" columns={columns}>
                {customList.map((item) => (
                  <DraggableRow key={item.id} row={item} />
                ))}
              </DroppableContainer>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSubmitCustomList}
              >
                Submit Custom List
              </Button>
            </Box>
          </Box>

          {/* Trash Container */}
          <TrashContainer />
        </DndContext>
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

      {/* Quantity Dialog */}
      <Dialog open={quantityDialogOpen} onClose={closeQuantityDialog}>
        <DialogTitle>Choose Quantity To Move</DialogTitle>
        <DialogContent>
          <TextField
            type="number"
            value={quantityToMove}
            onChange={(e) => setQuantityToMove(Number(e.target.value))}
            inputProps={{ min: 1, max: maxQuantity }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeQuantityDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleQuantityConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invalid Quantity Dialog */}
      <Dialog open={invalidQuantityDialogOpen} onClose={closeInvalidQuantityDialog}>
        <DialogTitle>Invalid Quantity</DialogTitle>
        <DialogContent>
          <Typography>Please enter a valid quantity within the allowed range.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInvalidQuantityDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
