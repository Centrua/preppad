import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Box, Paper, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  {
    field: 'item',
    headerName: 'Item',
    flex: 1,
    editable: true,
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
  {
    field: 'unitPrice',
    headerName: 'Cheapest Unit Price',
    type: 'number',
    flex: 1,
    editable: true,
    headerAlign: 'center',
    align: 'center',
    valueFormatter: (value) => {
      return "$" + String(Number(value).toFixed(2))
    },
  },
  {
    field: 'vendor',
    headerName: 'Vendor/Store',
    flex: 1.2,
    editable: true,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'totalPrice',
    headerName: 'Total Price',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    type: 'number',
    sortable: false,
    valueGetter: (value, row) => {
      return row.quantity*row.unitPrice;
    },
        valueFormatter: (value, row) => {
      return "$" + String(Number(value).toFixed(2))
    },
  },
];

export default function ShoppingListPage() {
  const [rows, setRows] = useState([
    { id: 1, item: 'Apples', quantity: 3, unitPrice: 0.5, vendor: 'Walmart' },
    { id: 2, item: 'Milk', quantity: 2, unitPrice: 1.2, vendor: 'Target' },
    { id: 3, item: 'Bread', quantity: 1, unitPrice: 2.0, vendor: 'Costco' },
    { id: 4, item: 'Eggs', quantity: 12, unitPrice: 0.15, vendor: 'Kroger' },
  ]);

  const handleProcessRowUpdate = (newRow) => {
    const quantity = Number(newRow.quantity);
    const unitPrice = Number(newRow.unitPrice);

    const cleanRow = {
      ...newRow,
      quantity: isNaN(quantity) ? 0 : quantity,
      unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
    };

    setRows((prev) =>
      prev.map((row) => (row.id === cleanRow.id ? cleanRow : row))
    );

    return cleanRow;
  };

  const handleSubmitPurchase = async () => {
    try {
      if (rows.length === 0) {
        alert('No items to submit');
        return;
      }

      const itemIds = rows.map((row) => row.id);
      const quantities = rows.map((row) => row.quantity);
      const unitPrices = rows.map((row) => row.unitPrice);
      const vendors = rows.map((row) => row.vendor);
      const totalPrice = rows.map((row) => row.quantity*row.unitPrice);

      const payload = {
        itemIds,
        quantities,
        cheapestUnitPrice: unitPrices, // sending full array of unit prices
        vendor: vendors,
        totalPrice,
      };

      const API_BASE = process.env.REACT_APP_API_BASE_URL;

      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/inventory/pending-purchase`, {
        method: 'POST',
        headers: {
           Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Purchase submitted successfully!');
        console.log(result);
      } else {
        alert('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting purchase:', error);
      alert('Failed to submit purchase');
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitPurchase}
          >
            Submit To Pending Purchases
          </Button>
        </Box>
      </Paper>
    </Box>
  </Layout>
);
}
