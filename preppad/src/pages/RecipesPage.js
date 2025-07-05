import React, { useState } from 'react';
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
    price: '',
    ingredients: [{ title: '', quantity: '', unit: '' }],
  });

  const [recipes, setRecipes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.price.trim()) {
      alert('Please fill out the recipe title and price.');
      return;
    }

    const invalidIngredient = form.ingredients.some(
      (ing) =>
        !ing.title.trim() || !ing.quantity.trim() || !ing.unit.trim()
    );

    if (invalidIngredient) {
      alert('Please fill out all ingredient fields: title, quantity, and unit.');
      return;
    }

    if (editingIndex !== null) {
      const updatedRecipes = [...recipes];
      updatedRecipes[editingIndex] = form;
      setRecipes(updatedRecipes);
      setEditingIndex(null);
    } else {
      setRecipes([...recipes, form]);
    }

    setForm({
      title: '',
      price: '',
      ingredients: [{ title: '', quantity: '', unit: '' }],
    });
  };

  const deleteRecipe = (index) => {
    const updated = [...recipes];
    updated.splice(index, 1);
    setRecipes(updated);

    if (editingIndex === index) {
      setEditingIndex(null);
      setForm({
        title: '',
        price: '',
        ingredients: [{ title: '', quantity: '', unit: '' }],
      });
    }
  };

  const editRecipe = (index) => {
    setEditingIndex(index);
    setForm(recipes[index]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setForm({
      title: '',
      price: '',
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
                  name="price"
                  label="Price"
                  type="number"
                  value={form.price}
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
            <Paper key={index} elevation={2} sx={{ p: 3, mb: 3 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <Typography variant="h6">{recipe.title}</Typography>
                </Grid>
              </Grid>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Price: ${parseFloat(recipe.price).toFixed(2)}
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
