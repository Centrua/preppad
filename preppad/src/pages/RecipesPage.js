import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function RecipePage() {
  const [form, setForm] = useState({
    title: '',
    unitCost: '',
    ingredients: [{ title: '', quantity: '', unit: '' }],
  });
  const [recipes, setRecipes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null); // keep track of backend id

  const API_BASE = process.env.REACT_APP_API_BASE_URL; // adjust to your backend

  // Fetch recipes on mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/inventory/recipes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Assuming data is array of recipes with id
          setRecipes(data);
        } else {
          console.error('Failed to fetch recipes');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecipes();
  }, [API_BASE]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...form.ingredients];
    updatedIngredients[index][field] = value;
    setForm({ ...form, ingredients: updatedIngredients });
  };

  const addIngredientRow = () => {
    setForm({
      ...form,
      ingredients: [...form.ingredients, { title: '', quantity: '', unit: '' }],
    });
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...form.ingredients];
    updatedIngredients.splice(index, 1);
    setForm({ ...form, ingredients: updatedIngredients });
  };

  function combineIngredients(recipe) {
    const titles = recipe.ingredients || [];
    const quantities = recipe.ingredientsQuantity || [];
    const units = recipe.ingredientsUnit || [];

    const ingredients = titles.map((title, idx) => ({
      title,
      quantity: quantities[idx] || '',
      unit: units[idx] || '',
    }));

    return { ...recipe, ingredients };
}


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.unitCost.toString().trim()) {
      alert('Please fill out the recipe title and unit cost.');
      return;
    }

    const invalidIngredient = form.ingredients.some(
      (ing) =>
        !ing.title.trim() || !ing.quantity.toString().trim() || !ing.unit.trim()
    );

    if (invalidIngredient) {
      alert('Please fill out all ingredient fields: title, quantity, and unit.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE}/inventory/recipes/${editingId}`
        : `${API_BASE}/inventory/recipes`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        title: form.title,
        unitCost: parseFloat(form.unitCost),
        ingredients: form.ingredients.map(i => i.title),
        ingredientsQuantity: form.ingredients.map(i => parseFloat(i.quantity)),
        ingredientsUnit: form.ingredients.map(i => i.unit),
      }),


      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`Failed to ${editingId ? 'update' : 'add'} recipe: ${errData.error || res.statusText}`);
        return;
      }

      const savedRecipe = await res.json();

        function combineIngredients(recipe) {
          if (!recipe.ingredients || !recipe.ingredientsQuantity || !recipe.ingredientsUnit) {
            return [];
          }
          return recipe.ingredients.map((title, idx) => ({
            title,
            quantity: recipe.ingredientsQuantity[idx],
            unit: recipe.ingredientsUnit[idx],
          }));
        }

        const normalizedRecipe = {
          ...savedRecipe,
          ingredients: combineIngredients(savedRecipe),
        };

        if (editingId) {
          setRecipes((prev) =>
            prev.map((r) => (r.id === editingId ? normalizedRecipe : r))
          );
        } else {
          setRecipes((prev) => [...prev, normalizedRecipe]);
        }

      setForm({
        title: '',
        unitCost: '',
        ingredients: [{ title: '', quantity: '', unit: '' }],
      });
      setEditingIndex(null);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Unexpected error occurred');
    }
  };

  const deleteRecipe = async (index) => {
    const recipeToDelete = recipes[index];
    if (!recipeToDelete?.id) {
      alert('Invalid recipe');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/inventory/recipes/${recipeToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        alert('Failed to delete recipe');
        return;
      }

      setRecipes((prev) => prev.filter((_, i) => i !== index));
      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingId(null);
        setForm({
          title: '',
          unitCost: '',
          ingredients: [{ title: '', quantity: '', unit: '' }],
        });
      }
    } catch (err) {
      console.error(err);
      alert('Unexpected error occurred');
    }
  };

  const editRecipe = (index) => {
    setEditingIndex(index);
    setForm({
    title: recipes[index].title,
    unitCost: recipes[index].unitCost,
    ingredients: recipes[index].ingredients || [{ title: '', quantity: '', unit: '' }],
    });
    setEditingId(recipes[index].id);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingId(null);
    setForm({
    title: '',
    unitCost: '',
    ingredients: [{ title: '', quantity: '', unit: '' }],
    });
  };

  const unitOptions = [
    'Count',
    'Cups',
    'Dry Ounces',
    'Fluid Ounces',
    'Pints',
    'Quarts',
    'Slices',
    'Tablespoons',
    'Teaspoons',
  ].sort();

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Recipe Management
        </Typography>

        {/* Form */}
        <Paper elevation={3} sx={{ p: 4, mb: 5 }}>
          <Typography variant="h6" gutterBottom>
            {editingIndex !== null ? 'Edit Recipe' : 'Add New Recipe'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="title"
                  label="Recipe Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="unitCost"
                  label="Unit Cost"
                  type="number"
                  value={form.unitCost}
                  onChange={handleChange}
                  required
                  inputProps={{ step: '0.01', min: 0 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              {form.ingredients.map((ingredient, index) => (
                <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Title of Ingredient"
                      value={ingredient.title}
                      onChange={(e) =>
                        handleIngredientChange(index, 'title', e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        handleIngredientChange(index, 'quantity', e.target.value)
                      }
                      inputProps={{ step: 'any', min: 0 }}
                      required
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl required sx={{ width: 160 }}>
                      <InputLabel id={`unit-label-${index}`}>Unit</InputLabel>
                      <Select
                        labelId={`unit-label-${index}`}
                        value={ingredient.unit}
                        label="Unit"
                        onChange={(e) =>
                          handleIngredientChange(index, 'unit', e.target.value)
                        }
                      >
                        {unitOptions.map((unit) => (
                          <MenuItem key={unit} value={unit}>
                            {unit}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveIngredient(index)}
                      disabled={form.ingredients.length === 1}
                      size="small"
                      aria-label="delete ingredient"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                onClick={addIngredientRow}
                variant="contained"
                color="inherit"
                sx={{ mt: 1 }}
              >
                Add Ingredient
              </Button>
            </Box>

            <Box mt={4}>
              <Button variant="contained" color="primary" type="submit">
                {editingIndex !== null ? 'Update Recipe' : 'Submit Recipe'}
              </Button>
              {editingIndex !== null && (
                <Button
                  sx={{ ml: 2 }}
                  variant="outlined"
                  color="secondary"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </form>
        </Paper>

        {/* Recipes List */}
        <Typography variant="h6" gutterBottom>
          Recipes
        </Typography>

        {recipes.length === 0 ? (
          <Typography color="text.secondary">No recipes added yet.</Typography>
        ) : (
          recipes.map((recipe, index) => (
            <Paper key={recipe.id || index} elevation={2} sx={{ p: 3, mb: 3 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <Typography variant="h6">{recipe.title}</Typography>
                </Grid>
              </Grid>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Unit Cost: ${parseFloat(recipe.unitCost).toFixed(2)}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                Ingredients:
              </Typography>
              {recipe.ingredients.map((ing, i) => (
                <Typography key={i} sx={{ ml: 2 }}>
                  • {ing.title}
                  {ing.quantity && ` — ${ing.quantity}`}
                  {ing.unit && ` ${ing.unit}`}
                </Typography>
              ))}
              <Divider sx={{ mt: 2, mb: 1 }} />
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => editRecipe(index)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => deleteRecipe(index)}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          ))
        )}
      </Box>
    </Layout>
  );
}
