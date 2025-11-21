import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';


const lowInventoryColumns = [
  { field: 'item', headerName: 'Item', flex: 1, headerAlign: 'center', align: 'center' },
  { field: 'quantity', headerName: 'Packages Needed', flex: 1, headerAlign: 'center', align: 'center' },
  { field: 'packagesLeft', headerName: 'Packages Left', flex: 1, headerAlign: 'center', align: 'center' },
];

const shoppingListColumns = [
  { field: 'item', headerName: 'Item', flex: 1, headerAlign: 'center', align: 'center' },
  { field: 'quantity', headerName: 'Packages', flex: 1, headerAlign: 'center', align: 'center' },
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
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const [onLocationConfirm, setOnLocationConfirm] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [ingredientNote, setIngredientNote] = useState('');
  const [onNoteConfirm, setOnNoteConfirm] = useState(null);
  const [lowInventorySearchQuery, setLowInventorySearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [moveMode, setMoveMode] = useState(false);

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

  const openLocationDialog = (callback) => {
    setOnLocationConfirm(() => callback);
    setLocationDialogOpen(true);
  };

  const closeLocationDialog = () => {
    setLocationDialogOpen(false);
    setPurchaseLocation('');
    setOnLocationConfirm(null);
  };

  const openNoteDialog = (callback) => {
    setOnNoteConfirm(() => callback);
    setNoteDialogOpen(true);
  };

  const closeNoteDialog = () => {
    setNoteDialogOpen(false);
    setIngredientNote('');
    setOnNoteConfirm(null);
  };

  const handleQuantityConfirm = () => {
    if (quantityToMove > 0 && quantityToMove <= maxQuantity) {
      onQuantityConfirm(quantityToMove);
      closeQuantityDialog();
    } else {
      openInvalidQuantityDialog();
    }
  };

  const handleLocationConfirm = () => {
    if (onLocationConfirm) {
      onLocationConfirm(purchaseLocation);
    }
    closeLocationDialog();
  };

  const handleNoteConfirm = () => {
    if (onNoteConfirm) {
      onNoteConfirm(ingredientNote);
    }
    closeNoteDialog();
  };

  useEffect(() => {
    refreshLowInventory(); // Run the refresh once.

    // Interval runs, so no need for button for refresh
    const interval = setInterval(() => {
      refreshLowInventory();
    }, 45000);

    return () => clearInterval(interval);
  }, []);



  // Doing the same thing as first useEffect but just a callable funciton now.
  const refreshLowInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_BASE_URL;

      const response = await fetch(`${API_BASE}/ingredients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const inventoryData = await response.json();
        const lowInventoryItems = inventoryData
          .filter(item => item.quantityInStock < item.max)
          .map(item => ({
            id: item.id,
            item: item.itemName,
            quantity: Math.round(item.max - item.quantityInStock),
            packagesLeft: item.quantityInStock,
            note: '',
          }));

        setRows(lowInventoryItems);
      }
    } catch (err) {
      console.error('Error refreshing inventory data:', err);
    }
  };








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
    if (rows.length === 0) {
      openDialog('No items to submit');
      return;
    }

    openLocationDialog(async (purchaseLocation) => {
      try {
        const itemIds = rows.map((row) => row.id);
        const quantities = rows.map((row) => row.quantity);
        const notes = rows.map((row) => row.note || '');

        const payload = {
          itemIds,
          quantities,
          notes,
          purchaseLocation,
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
    });
  };


  // This function will now map added ingredients/items to the custom shopping list state. No more API call.
  const handleAddItem = () => {
    if (!selectedIngredient) {
      return;
    }

    openNoteDialog(async (note) => {
      const ingredient = ingredients.find((ing) => ing.name === selectedIngredient);

      if (!ingredient) {
        return;
      }

      setCustomList((prev) => {
        const existingItem = prev.find((item) => item.id === ingredient.id);
        if (existingItem) {
          return prev.map((item) =>
            item.id === ingredient.id
              ? { ...item, quantity: item.quantity + newQuantity }
              : item
          );
        }
        else {
          return [
            ...prev,
            {
              id: ingredient.id,
              item: ingredient.name,
              quantity: newQuantity,
              note,
            },
          ];
        }
      });


      setSelectedIngredient('');
      setNewQuantity(1);
    });
  }




  // ------------------------------------- SELECTABLE FEATURES --------------------------------------------------

  const LowInventoryRow = ({ row, isFromLowInventory = true }) => {
    const isSelected = selectedItems.includes(row.id);

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleItemSelect(row.id);
        }} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          borderBottom: '1px solid #ddd',
          cursor: 'pointer',
          backgroundColor: isSelected ? '#e3f2fd' : '#f0f8ff',
          border: isSelected ? '2px solid #2196f3' : '1px solid #ddd',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ flex: 1, textAlign: 'center' }}>{row.item}</span>
        <span style={{ flex: 1, textAlign: 'center' }}>{row.quantity}</span>

        <span style={{ flex: 1, textAlign: 'center' }}>
          {Number(row.packagesLeft) % 1 === 0
            ? Number(row.packagesLeft)
            : Number(row.packagesLeft).toFixed(2)}
        </span>

      </div>
    );
  };



  const ShoppingListRow = ({ row, isFromLowInventory = true }) => {
    const isSelected = selectedItems.includes(row.id);

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleItemSelect(row.id);
        }} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          borderBottom: '1px solid #ddd',
          cursor: 'pointer',
          backgroundColor: isSelected ? '#e3f2fd' : '#f0f8ff',
          border: isSelected ? '2px solid #2196f3' : '1px solid #ddd',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ flex: 1, textAlign: 'center' }}>{row.item}</span>
        <span style={{ flex: 1, textAlign: 'center' }}>{row.quantity}</span>
      </div>
    );
  };


  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId); // Deselect if already selected
      } else {
        return [...prev, itemId]; // Select if not selected
      }
    });
  };



  const handleContainerClick = (containerId) => {
    if (selectedItems.length === 0) return;

    if (containerId === 'customList') {
      moveItemsToShoppingList();
    } else if (containerId === 'shoppingList') {
      moveItemsToLowInventory();
    }
  };





  const moveItemsToLowInventory = () => {
    const itemsToMove = customList.filter(item => selectedItems.includes(item.id));

    itemsToMove.forEach(item => {
      openQuantityDialog(item.quantity, (quantity) => {
        setRows(prev => {
          const existingItem = prev.find(r => r.id === item.id);
          if (existingItem) {
            return prev.map(r => r.id === item.id
              ? { ...r, quantity: r.quantity + quantity }
              : r
            );
          } else {
            return [...prev, { ...item, quantity }];
          }
        });

        setCustomList(prev =>
          prev.map(item => item.id === selectedItems[0]
            ? { ...item, quantity: item.quantity - quantity }
            : item
          ).filter(item => item.quantity > 0)
        );
      });
    });

    setSelectedItems([]);
  };

  const moveItemsToShoppingList = () => {
    const itemsToMove = rows.filter(row => selectedItems.includes(row.id));

    itemsToMove.forEach(item => {
      openQuantityDialog(item.quantity, (quantity) => {
        setCustomList(prev => {
          const existingItem = prev.find(i => i.id === item.id);
          if (existingItem) {
            return prev.map(i => i.id === item.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
            );
          } else {
            return [...prev, { ...item, quantity }];
          }
        });

        setRows(prev =>
          prev.map(row => row.id === item.id
            ? { ...row, quantity: row.quantity - quantity }
            : row
          ).filter(row => row.quantity > 0)
        );
      });
    });

    setSelectedItems([]);
  };





  const ClickableContainer = ({ id, children, columns, onContainerClick, isTargetForSelected }) => {
    return (
      <div
        onClick={() => onContainerClick(id)}
        style={{
          padding: '16px',
          backgroundColor: isTargetForSelected ? '#e8f5e8' : '#f8f9fa', // Highlight when it can receive selected items
          borderRadius: '4px',
          marginBottom: '16px',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          cursor: isTargetForSelected ? 'pointer' : 'default',
          border: isTargetForSelected ? '2px dashed #4caf50' : '1px solid #ddd',
          transition: 'all 0.3s',
        }}
      >
        <div style={{ display: 'flex', padding: '8px', backgroundColor: '#e0e0e0', fontWeight: 'bold' }}>
          {columns.map((col) => (
            <span key={col.field} style={{ flex: 1, textAlign: 'center' }}>{col.headerName}</span>
          ))}
        </div>
        <div style={{ flex: 1 }}>{children}</div>
        {isTargetForSelected && (
          <div style={{ textAlign: 'center', color: '#4caf50', fontWeight: 'bold', marginTop: '8px' }}>
            Click here to move {selectedItems.length} item(s)
          </div>
        )}
      </div>
    );
  };



  // --------------------------------------------------------------------------------------------------------





  const handleSubmitCustomList = async () => {
    if (customList.length === 0) {
      openDialog('No items in the custom list to submit');
      return;
    }

    openLocationDialog(async (purchaseLocation) => {
      try {
        const API_BASE = process.env.REACT_APP_API_BASE_URL;
        const token = localStorage.getItem('token');

        const itemIds = customList.map((item) => item.id);
        const quantities = customList.map((item) => item.quantity);
        const notes = rows.map((row) => row.note || '');

        const payload = {
          itemIds,
          quantities,
          purchaseLocation,
          notes,
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
          for (let i = 0; i < itemIds.length; i++) {
            const itemId = itemIds[i];
            const quantity = quantities[i];
            await fetch(`${API_BASE}/shopping-list/${itemId}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ quantity }),
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
    });
  };



  // Filter rows based on search query for Low Inventory
  const filteredRows = rows.filter(row =>
    row.item.toLowerCase().includes(lowInventorySearchQuery.toLowerCase())
  );




  return (
    <Layout>
      <Box sx={{ width: '100%', px: 2, mt: 4 }}>
        {/* Add Item Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, mt: 4 }}>
          <TextField
            select
            label="Select Item"
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
            variant="outlined"
            style={{ flex: 1, marginRight: '8px' }}
          >
            {ingredients
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((ingredient) => (
                <MenuItem key={ingredient.id} value={ingredient.name}>
                  {`${ingredient.name}`}
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

        <DndContext>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
            {/* Low Inventory Box */}
            <Paper
              elevation={3}
              sx={{
                borderRadius: 2,
                p: 3,
                boxShadow: 3,
                flex: 1,
              }}
            >



              <Typography variant="h6" gutterBottom>
                Low Inventory
              </Typography>


              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The quantity shown is the number of packages to purchase, not individual items.
              </Typography>



              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: -1, mt: -1 }}>
                {/* Search bar */}
                <TextField
                  label="Search Item..."
                  value={lowInventorySearchQuery}
                  onChange={(e) => setLowInventorySearchQuery(e.target.value)}
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    width: '25%',
                    '& .MuiInputBase-input': {
                      color: 'grey.600', // Makes the input text grey
                    }
                  }} placeholder="Search by item name..."
                />
              </Box>



              <ClickableContainer
                id="shoppingList"
                columns={lowInventoryColumns}
                onContainerClick={handleContainerClick}
                isTargetForSelected={selectedItems.length > 0 && customList.some(item => selectedItems.includes(item.id))}
              >
                {filteredRows.map(row => (
                  <LowInventoryRow key={row.id} row={row} />
                ))}
              </ClickableContainer>



            </Paper>

            {/* Shopping List Box */}
            <Paper
              elevation={3}
              sx={{
                borderRadius: 2,
                p: 3,
                boxShadow: 3,
                flex: 1,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Shopping List
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The quantity shown is the number of packages to purchase, not individual items.
              </Typography>


              <ClickableContainer
                id="customList"
                columns={shoppingListColumns}
                onContainerClick={handleContainerClick}
                isTargetForSelected={selectedItems.length > 0 && rows.some(row => selectedItems.includes(row.id))}
              >
                {customList.map(item => (
                  <ShoppingListRow key={item.id} row={item} />
                ))}
              </ClickableContainer>



              <Button
                variant="contained"
                color="secondary"
                onClick={handleSubmitCustomList}
              >
                Submit Custom List
              </Button>
            </Paper>
          </Box>


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

      {/* Location Dialog */}
      <Dialog open={locationDialogOpen} onClose={closeLocationDialog}>
        <DialogTitle>Enter Location</DialogTitle>
        <DialogContent>
          <TextField
            label="Location"
            value={purchaseLocation}
            onChange={(e) => setPurchaseLocation(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLocationDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLocationConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={closeNoteDialog}>
        <DialogTitle>Add Note to Ingredient</DialogTitle>
        <DialogContent>
          <TextField
            label="Note"
            value={ingredientNote}
            onChange={(e) => setIngredientNote(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNoteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleNoteConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
