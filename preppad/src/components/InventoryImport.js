import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@mui/material';


export default function InventoryImport({ API_BASE, token, fetchItems }) {
  const fileInputRef = useRef();

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'item name',
      'base unit',
      'units per package',
      'packages in stock',
      'max packages desired',
    ];
    const sampleRow = ['Coffee Beans', 'Ounce', '16', '2.5', '10'];
    const csvContent = `${headers.join(',')}` + '\n' + `${sampleRow.join(',')}` + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            // Check if ingredient exists (case-insensitive match)
            const getRes = await fetch(`${API_BASE}/ingredients?name=${encodeURIComponent(itemName)}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            let existing = null;
            if (getRes.ok) {
              const data = await getRes.json();
              if (Array.isArray(data)) {
                existing = data.find(i => (i.itemName || '').trim().toLowerCase() === itemName.toLowerCase());
              }
            }
            const payload = {
              itemName,
              baseUnit: baseUnit.charAt(0).toUpperCase() + baseUnit.slice(1).toLowerCase(),
              conversionRate: Number(conversionRate),
              quantityInStock: Number(quantityInStock),
              max: Number(max),
            };
            if (existing && existing.id) {
              // Update existing ingredient
              await fetch(`${API_BASE}/ingredients/${existing.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              });
            } else {
              // Create new ingredient
              await fetch(`${API_BASE}/ingredients`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              });
            }
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
      <Button variant="outlined" onClick={handleImportClick} sx={{ mb: 2, mr: 2 }}>
        Import CSV
      </Button>
      <Button variant="outlined" color="primary" onClick={handleDownloadTemplate} sx={{ mb: 2 }}>
        Download Template
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
