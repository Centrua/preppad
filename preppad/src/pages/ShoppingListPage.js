import React, { useState } from 'react';
import Layout from '../components/Layout';

import { Box, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../dashboard/theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

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
    valueParser: (value) => {
      const parsed = Number(value);
      return isNaN(parsed) ? 0 : parsed;
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
    sortable: false,
    valueGetter: (params) => {
      if (!params || !params.row) return 0;
      const quantity = Number(params.row.quantity);
      const unitPrice = Number(params.row.unitPrice);
      if (isNaN(quantity) || isNaN(unitPrice)) return 0;
      return quantity * unitPrice;
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
    // Ensure unitPrice and quantity are numbers
    const cleanRow = {
      ...newRow,
      unitPrice:
        typeof newRow.unitPrice === 'string'
          ? parseFloat(newRow.unitPrice.replace(/[^0-9.]/g, '')) || 0
          : newRow.unitPrice,
      quantity: Number(newRow.quantity) || 0,
    };

    setRows((prev) =>
      prev.map((row) => (row.id === cleanRow.id ? cleanRow : row))
    );
    return cleanRow;
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
        </Paper>
      </Box>
    </Layout>
  );
}
