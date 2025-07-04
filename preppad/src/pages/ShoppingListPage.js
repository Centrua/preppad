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
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    },
    valueFormatter: ({ value }) =>
      typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00',
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
    type: 'number',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    valueFormatter: ({ value }) =>
      typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00',
  },
];

export default function ShoppingListPage() {
  const [rows, setRows] = useState([
    {
      id: 1,
      item: 'Apples',
      quantity: 3,
      unitPrice: 0.5,
      vendor: 'Walmart',
      totalPrice: 1.5,
    },
    {
      id: 2,
      item: 'Milk',
      quantity: 2,
      unitPrice: 1.2,
      vendor: 'Target',
      totalPrice: 2.4,
    },
    {
      id: 3,
      item: 'Bread',
      quantity: 1,
      unitPrice: 2.0,
      vendor: 'Costco',
      totalPrice: 2.0,
    },
    {
      id: 4,
      item: 'Eggs',
      quantity: 12,
      unitPrice: 0.15,
      vendor: 'Kroger',
      totalPrice: 1.8,
    },
  ]);

  const handleProcessRowUpdate = (newRow) => {
    const quantity = Number(newRow.quantity);
    const unitPrice = Number(newRow.unitPrice);

    const cleanRow = {
      ...newRow,
      quantity: isNaN(quantity) ? 0 : quantity,
      unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
      totalPrice: isNaN(quantity * unitPrice) ? 0 : quantity * unitPrice,
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
