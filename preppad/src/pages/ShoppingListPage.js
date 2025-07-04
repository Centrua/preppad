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
    field: 'unitPriceDisplay',
    headerName: 'Cheapest Unit Price',
    flex: 1,
    editable: false,
    headerAlign: 'center',
    align: 'center',
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
    field: 'totalPriceDisplay',
    headerName: 'Total Price',
    flex: 1,
    editable: false,
    headerAlign: 'center',
    align: 'center',
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
      unitPriceDisplay: '$0.50',
      totalPriceDisplay: '$1.50',
    },
    {
      id: 2,
      item: 'Milk',
      quantity: 2,
      unitPrice: 1.2,
      vendor: 'Target',
      unitPriceDisplay: '$1.20',
      totalPriceDisplay: '$2.40',
    },
    {
      id: 3,
      item: 'Bread',
      quantity: 1,
      unitPrice: 2.0,
      vendor: 'Costco',
      unitPriceDisplay: '$2.00',
      totalPriceDisplay: '$2.00',
    },
    {
      id: 4,
      item: 'Eggs',
      quantity: 12,
      unitPrice: 0.15,
      vendor: 'Kroger',
      unitPriceDisplay: '$0.15',
      totalPriceDisplay: '$1.80',
    },
  ]);

  const handleProcessRowUpdate = (newRow) => {
    const quantity = Number(newRow.quantity);
    const unitPrice = Number(newRow.unitPrice);

    const cleanRow = {
      ...newRow,
      quantity: isNaN(quantity) ? 0 : quantity,
      unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
    };

    cleanRow.unitPriceDisplay = `$${cleanRow.unitPrice.toFixed(2)}`;
    cleanRow.totalPriceDisplay = `$${(cleanRow.unitPrice * cleanRow.quantity).toFixed(2)}`;

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
