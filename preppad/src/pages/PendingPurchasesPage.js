import React, { useEffect, useState } from 'react';
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
  IconButton,
  Collapse,
  TableContainer,
  TextField,
  Button,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function Row({ purchase }) {
  const [open, setOpen] = useState(false);
  const [quantities, setQuantities] = useState([...purchase.quantities]);
  const [totalPrices, setTotalPrices] = useState(
    purchase.quantities.map((q, i) => q * purchase.cheapestUnitPrice[i])
  );

  const handleQuantityChange = (index, value) => {
    const newQuantities = [...quantities];
    const newValue = Number(value) || 0;
    newQuantities[index] = newValue;
    setQuantities(newQuantities);

    const newTotalPrices = [...totalPrices];
    newTotalPrices[index] = newValue * purchase.cheapestUnitPrice[index];
    setTotalPrices(newTotalPrices);
  };

  const handleConfirm = (index) => {
    console.log('Confirmed item:', {
      itemId: purchase.itemIds[index],
      quantity: quantities[index],
      vendor: purchase.vendor[index],
      totalPrice: totalPrices[index],
    });
    // You can implement actual backend update logic here
  };

  const renderFirst = (arr) => (arr && arr.length > 0 ? arr[0] : '');

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{purchase.id}</TableCell>
        <TableCell>{renderFirst(purchase.itemIds)}</TableCell>
        <TableCell>{renderFirst(purchase.quantities)}</TableCell>
        <TableCell>{renderFirst(purchase.cheapestUnitPrice)}</TableCell>
        <TableCell>{renderFirst(purchase.vendor)}</TableCell>
        <TableCell>{renderFirst(purchase.totalPrice)}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="subtitle1" gutterBottom>
                All Items
              </Typography>
              <Table size="small" aria-label="items">
                <TableHead>
                  <TableRow>
                    <TableCell>Item ID</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Cheapest Unit Price</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Total Price</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchase.itemIds.map((itemId, idx) => (
                    <TableRow key={`${purchase.id}-${idx}`}>
                      <TableCell>{itemId}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={quantities[idx]}
                          onChange={(e) =>
                            handleQuantityChange(idx, e.target.value)
                          }
                          inputProps={{ min: 0 }}
                        />
                      </TableCell>
                      <TableCell>{purchase.cheapestUnitPrice[idx]}</TableCell>
                      <TableCell>{purchase.vendor[idx]}</TableCell>
                      <TableCell>{totalPrices[idx].toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleConfirm(idx)}
                          sx={{
                            color: '#2e7d32',
                            borderColor: '#2e7d32',
                            '&:hover': {
                              backgroundColor: '#e8f5e9',
                              borderColor: '#1b5e20',
                            },
                          }}
                        >
                          Confirm
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function PendingPurchasesPage() {
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchPendingPurchases() {
      try {
        const res = await fetch(`${API_BASE}/inventory/pending-purchases`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setPendingPurchases(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPendingPurchases();
  }, [token]);

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
        <TableContainer component={Paper}>
          <Table aria-label="pending purchases table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Purchase ID</TableCell>
                <TableCell>Item ID</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Cheapest Unit Price</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Total Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingPurchases.map((purchase) => (
                <Row key={purchase.id} purchase={purchase} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Layout>
  );
}
