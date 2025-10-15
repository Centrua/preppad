import { Box, Button, CircularProgress, Snackbar, Typography } from '@mui/material';
import heic2any from 'heic2any';
import { useState } from 'react';
import Tesseract from 'tesseract.js';

export default function RecipeImageImport({ onExtractedText, onRecipeInfo, fetchRecipes }) {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);
  const [success, setSuccess] = useState(false);

  // Fetch ingredients on mount
  useState(() => {
    const fetchIngredients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/ingredients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIngredientsList(Array.isArray(data) ? data : []);
        }
      } catch {}
    };
    fetchIngredients();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setOcrText('');
      setError('');
      // Create preview
      const reader = new window.FileReader();
      reader.readAsDataURL(file);
    } else {
      setImage(null);
    }
  };


  // Combined handler: extract text and send to OpenAI
  const handleExtractAndSend = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    let imgForOcr = image;
    try {
      // If HEIC, convert to JPEG
      if (image.type === 'image/heic' || image.name?.toLowerCase().endsWith('.heic')) {
        try {
          const converted = await heic2any({ blob: image, toType: 'image/jpeg', quality: 0.9 });
          imgForOcr = converted instanceof Blob ? converted : converted[0];
        } catch (convErr) {
          setError('Failed to convert HEIC image. Please use JPG or PNG.');
          setLoading(false);
          return;
        }
      }
      // Use FileReader to get data URL for Tesseract
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const { data: { text } } = await Tesseract.recognize(e.target.result, 'eng');
          setOcrText(text);
          if (onExtractedText) onExtractedText(text);
          await handleSendToOpenAIWithText(text);
        } catch (err) {
          setError('Failed to extract text from image.');
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file.');
        setLoading(false);
      };
      reader.readAsDataURL(imgForOcr);
    } catch (err) {
      setError('Failed to extract text from image.');
      setLoading(false);
    }
  };

  // Helper to allow sending arbitrary text to OpenAI (for combined flow)
  const handleSendToOpenAIWithText = async (text) => {
    setError('');
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: `Extract the recipe name, batch size (if any), and a list of ingredients with their measurements from the following text. For each ingredient, convert the unit to the closest match from this list: 'Count', 'Cups', 'Dry Ounces', 'Fluid Ounces', 'Gallons', 'Grams', 'Kilograms', 'Liters', 'Milligrams', 'Milliliters', 'Pints', 'Pounds', 'Quarts', 'Slices', 'Tablespoons', 'Teaspoons'. For each ingredient name, capitalize only the first letter and make the rest lowercase. For each ingredient quantity, provide a number with a maximum of 2 decimal places. Respond in JSON with keys: name, batchSize (optional), and ingredients (array of {name, quantity, unit}). Only include these keys. If a unit is missing, set it to 'Count'.` },
            { role: 'user', content: text },
          ],
          max_tokens: 1000,
        }),
      });
      if (!res.ok) throw new Error('OpenAI API error');
      const data = await res.json();
      let recipeInfo = data.choices?.[0]?.message?.content || '';
      if (onRecipeInfo) onRecipeInfo(recipeInfo);
      // ...existing code for parsing and saving...
      let parsed;
      try {
        parsed = JSON.parse(recipeInfo);
      } catch (e) {
        const match = recipeInfo.match(/```json([\s\S]*?)```/);
        if (match) {
          try {
            parsed = JSON.parse(match[1]);
          } catch {}
        }
      }
      if (!parsed || !parsed.name || !parsed.ingredients) {
        setError('Could not parse recipe info.');
        setLoading(false);
        return;
      }
      let batchSize = parsed.batchSize && !isNaN(Number(parsed.batchSize)) && Number(parsed.batchSize) > 0 ? Number(parsed.batchSize) : 1;
      const simplifyUnit = (qty, unit) => {
        let newQty = qty;
        let newUnit = unit;
        if (unit === 'g' && qty >= 1000) {
          newQty = qty / 1000;
          newUnit = 'kg';
        } else if (unit === 'ml' && qty >= 1000) {
          newQty = qty / 1000;
          newUnit = 'l';
        } else if (unit === 'mg' && qty >= 1000) {
          newQty = qty / 1000;
          newUnit = 'g';
        }
        // Always round to 2 decimals
        newQty = Math.round(newQty * 100) / 100;
        return { qty: newQty, unit: newUnit };
      };
      const createIngredient = async (name, unit) => {
        const token = localStorage.getItem('token');
        // Set baseUnit to 'Ounce' unless unit is 'Count', then use 'Count'
        let baseUnit = (unit && unit.toLowerCase() === 'count') ? 'Count' : 'Ounce';
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/ingredients`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemName: name, baseUnit, quantityInStock: 0, max: 0, conversionRate: 0 }),
        });
        if (!res.ok) return '';
        const data = await res.json();
        return data.id || '';
      };
      const ingredientPromises = parsed.ingredients.map(async (ing) => {
        let qty = Number(ing.quantity);
        if (isNaN(qty) || qty == null) qty = 0;
        if (batchSize > 1) qty = qty / batchSize;
        const { qty: simpleQty, unit: simpleUnit } = simplifyUnit(qty, ing.unit);
        let inventoryItem = ingredientsList.find(inv => {
          const invName = (inv.itemName || inv.title || '').toLowerCase().trim();
          const ingName = (ing.name || '').toLowerCase().trim();
          return invName === ingName;
        });
        let inventoryId = inventoryItem ? inventoryItem.id : '';
        if (!inventoryId && ing.name) {
          inventoryId = await createIngredient(ing.name, simpleUnit);
        }
        return {
          inventoryId,
          title: ing.name ?? '',
          quantity: isNaN(simpleQty) || simpleQty == null ? 0 : simpleQty,
          unit: simpleUnit ?? '',
        };
      });
      const ingredients = await Promise.all(ingredientPromises);
      const token = localStorage.getItem('token');
      const recipesRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/recipes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recipesData = await recipesRes.json();
      const existing = Array.isArray(recipesData) ? recipesData.find(r => (r.itemName || r.title || '').toLowerCase() === parsed.name.toLowerCase()) : null;
      const payload = {
        itemName: parsed.name || '',
        unitCost: 0,
        ingredients: ingredients.map(i => i.inventoryId ?? ''),
        ingredientsQuantity: ingredients.map(i => (i.quantity == null ? 0 : i.quantity)),
        ingredientsUnit: ingredients.map(i => i.unit ?? ''),
        categories: [],
      };
      let saveRes;
      if (existing && existing.id) {
        saveRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/recipes/${existing.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        saveRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/recipes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
      if (!saveRes.ok) {
        setError('Failed to save recipe.');
      } else {
        setSuccess(true);
        if (typeof fetchRecipes === 'function') fetchRecipes();
      }
    } catch (err) {
      setError('Failed to get recipe info from OpenAI.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3, border: '1px dashed #ccc', borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Import Recipe from Image</Typography>
      <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
        Disclaimer: For best results, please ensure the image is upright (not sideways or upside down).
      </Typography>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <Button variant="contained" sx={{ ml: 2 }} onClick={handleExtractAndSend} disabled={!image || loading}>
        Import Recipe
      </Button>
      {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        message="Recipe imported successfully!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
