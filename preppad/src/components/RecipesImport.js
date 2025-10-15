import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@mui/material';

export default function RecipesImport({ API_BASE, token, fetchRecipes }) {
  const fileInputRef = useRef();

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log('Selected file:', file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log('Parsed CSV results:', results);
        const rows = results.data;
        // Fetch all ingredients for mapping
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
            console.log('Ingredient map:', ingredientMap);
          } else {
            console.warn('Failed to fetch ingredients for mapping');
          }
        } catch (err) {
          console.error('Error fetching ingredients for mapping:', err);
        }
        // Group rows by recipe title
        const grouped = {};
        for (const row of rows) {
          console.log('Processing row:', row);
          const itemName = row['recipe title']?.trim();
          const unitCost = row['unit cost']?.trim();
          const ingredient = row['ingredient']?.trim();
          const quantity = row['quantity']?.trim();
          const unit = row['unit']?.trim();
          if (!itemName || !unitCost || !ingredient || !quantity || !unit) {
            const missingFields = [];
            if (!itemName) missingFields.push('recipe title');
            if (!unitCost) missingFields.push('unit cost');
            if (!ingredient) missingFields.push('ingredient');
            if (!quantity) missingFields.push('quantity');
            if (!unit) missingFields.push('unit');
            console.warn('Skipping row due to missing field(s):', missingFields.join(', '), row);
            continue;
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
        console.log('Grouped recipes:', grouped);
        // Send each recipe to backend
        for (const key in grouped) {
          const recipe = grouped[key];
          // Transform to backend format
          const itemName = recipe.title;
          const unitCost = recipe.unitCost;
          // Map ingredient names to IDs
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
            console.log('Sending recipe to backend:', payload);
            const res = await fetch(`${API_BASE}/recipes`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });
            const resText = await res.text();
            console.log('API response:', res.status, resText);
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
      <Button variant="outlined" onClick={handleImportClick} sx={{ mb: 2 }}>
        Import Recipes CSV
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
