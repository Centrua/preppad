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
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

function Row({ purchase }) {
  const [open, setOpen] = useState(false);

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
              <Typography variant="subtitle1" gutterBottom component="div">
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchase.itemIds.map((itemId, idx) => (
                    <TableRow key={`${purchase.id}-${idx}`}>
                      <TableCell>{itemId}</TableCell>
                      <TableCell>{purchase.quantities[idx]}</TableCell>
                      <TableCell>{purchase.cheapestUnitPrice[idx]}</TableCell>
                      <TableCell>{purchase.vendor[idx]}</TableCell>
                      <TableCell>{purchase.totalPrice[idx]}</TableCell>
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
