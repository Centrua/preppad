import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@mui/material';

export default function RecipesImport({ API_BASE, token, fetchRecipes }) {
  const fileInputRef = useRef();

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'recipe title',
      'unit cost',
      'ingredient',
      'quantity',
      'unit',
    ];
    const sampleRow = ['Pancakes', '2.50', 'Flour', '1.5', 'Cups'];
    const csvContent = `${headers.join(',')}` + '\n' + `${sampleRow.join(',')}` + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipes_template.csv';
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
        let ingredientMap = {};
        try {
          const ingRes = await fetch(`${API_BASE}/ingredients`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (ingRes.ok) {
            const ingData = await ingRes.json();
            ingredientMap = Object.fromEntries(
              ingData.map(i => [i.itemName.trim().toLowerCase(), i.id])
            );
          } else {
            console.warn('Failed to fetch ingredients for mapping');
          }
        } catch (err) {
          console.error('Error fetching ingredients for mapping:', err);
        }
        // Group rows by recipe title
        const grouped = {};
        for (const row of rows) {
          const itemName = row['recipe title']?.trim();
          const unitCost = row['unit cost']?.trim();
          const ingredient = row['ingredient']?.trim();
          const quantity = row['quantity']?.trim();
          const unit = row['unit']?.trim();
          if (!itemName || !unitCost || !ingredient || !quantity || !unit) {
            return;
          }
          if (!grouped[itemName]) {
            grouped[itemName] = {
              title: itemName,
              unitCost: Number(unitCost),
              ingredients: [],
            };
          }
          grouped[itemName].ingredients.push({ title: ingredient, quantity: Number(quantity), unit });
        }
        for (const key in grouped) {
          const recipe = grouped[key];
          const itemName = recipe.title;
          const unitCost = recipe.unitCost;
          const ingredientsArr = recipe.ingredients.map(i => {
            const id = ingredientMap[i.title.trim().toLowerCase()];
            if (!id) {
              console.warn('No itemId found for ingredient:', i.title);
            }
            return id || null;
          });
          const ingredientsQuantity = recipe.ingredients.map(i => i.quantity);
          const ingredientsUnit = recipe.ingredients.map(i => i.unit);
          const categories = [];
          const variations = [];
          const payload = { itemName, unitCost, ingredients: ingredientsArr, ingredientsQuantity, ingredientsUnit, categories, variations };
          try {
            // Check if recipe exists (case-insensitive match by itemName)
            const getRes = await fetch(`${API_BASE}/recipes`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            let existing = null;
            if (getRes.ok) {
              const data = await getRes.json();
              if (Array.isArray(data)) {
                existing = data.find(r => (r.itemName || r.title || '').trim().toLowerCase() === itemName.toLowerCase());
              }
            }
            if (existing && existing.id) {
              // Update existing recipe
              await fetch(`${API_BASE}/recipes/${existing.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              });
            } else {
              // Create new recipe
              await fetch(`${API_BASE}/recipes`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              });
            }
          } catch (err) {
            console.error('Error sending recipe:', err);
          }
        }
        fetchRecipes();
      },
      error: (err) => {
        console.error('PapaParse error:', err);
      }
    });
  };

  return (
    <>
      <Button variant="outlined" onClick={handleImportClick} sx={{ mb: 2, mr: 2 }}>
        Import Recipes CSV
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
