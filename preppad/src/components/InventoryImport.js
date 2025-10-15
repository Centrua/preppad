import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@mui/material';

export default function InventoryImport({ API_BASE, token, fetchItems }) {
  const fileInputRef = useRef();

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        for (const row of rows) {
          const itemName = row['item name']?.trim();
          const baseUnit = row['base unit']?.trim();
          const conversionRate = row['units per package']?.trim();
          const quantityInStock = row['packages in stock']?.trim();
          const max = row['max packages desired']?.trim();
          if (!itemName || !baseUnit || !conversionRate || !quantityInStock || !max) continue;
          if (!['count', 'ounce'].includes(baseUnit.toLowerCase())) continue;
          try {
            await fetch(`${API_BASE}/ingredients`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                itemName,
                baseUnit: baseUnit.charAt(0).toUpperCase() + baseUnit.slice(1).toLowerCase(),
                conversionRate: Number(conversionRate),
                quantityInStock: Number(quantityInStock),
                max: Number(max),
              }),
            });
          } catch (err) {
            // Optionally handle error
          }
        }
        fetchItems();
      },
    });
  };

  return (
    <>
      <Button variant="outlined" onClick={handleImportClick} sx={{ mb: 2 }}>
        Import CSV
      </Button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
