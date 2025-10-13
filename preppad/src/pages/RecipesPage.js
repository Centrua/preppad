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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function RecipePage() {
  const [form, setForm] = useState({
    title: '',
    unitCost: '',
    ingredients: [{ inventoryId: '', quantity: '', unit: '' }],
    categories: [],
  });
  const [recipes, setRecipes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null); // keep track of backend id
  const [ingredientsList, setIngredientsList] = useState([]); // <-- new state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  // State for add variation dialog
  const [addVariationDialogOpen, setAddVariationDialogOpen] = useState(false);
  const [variationTitleInput, setVariationTitleInput] = useState('');
  const [variationBaseRecipe, setVariationBaseRecipe] = useState(null);

  // State for delete variation dialog
  const [deleteVariationDialogOpen, setDeleteVariationDialogOpen] = useState(false);
  const [variationToDelete, setVariationToDelete] = useState(null);
  const [originalRecipeForDelete, setOriginalRecipeForDelete] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE_URL; // adjust to your backend

  // Fetch recipes on mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/recipes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
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

  const fetchRecipes = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/recipes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setRecipes(data);
    } else {
      console.error('Failed to fetch recipes');
    }
  } catch (err) {
    console.error(err);
  }
};

  // Only use /ingredients endpoint for dropdown
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/ingredients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIngredientsList(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch ingredients');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchIngredients();
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
      ingredients: [...form.ingredients, { inventoryId: '', quantity: '', unit: '' }],
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
      (ing) => !ing.inventoryId || !ing.quantity.toString().trim() || !ing.unit
    );
    if (invalidIngredient) {
      alert('Please fill out all ingredient fields: ingredient, quantity, and unit.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE}/recipes/${editingId}`
        : `${API_BASE}/recipes`;
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          unitCost: parseFloat(form.unitCost),
          ingredients: form.ingredients.map(i => i.inventoryId),
          ingredientsQuantity: form.ingredients.map(i => parseFloat(i.quantity)),
          ingredientsUnit: form.ingredients.map(i => i.unit),
          categories: form.categories,
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

      await fetchRecipes();

      setForm({
        title: '',
        unitCost: '',
        ingredients: [{ title: '', quantity: '', unit: '' }],
        categories: [],
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

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/recipes/${recipeToDelete.id}`, {
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
          categories: [],
        });
      }
    } catch (err) {
      console.error(err);
      alert('Unexpected error occurred');
    }
  };

  const handleDeleteClick = (index) => {
    setRecipeToDelete(index);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (recipeToDelete === null) return;
    await deleteRecipe(recipeToDelete);
    setConfirmOpen(false);
    setRecipeToDelete(null);
  };

  const editRecipe = (index) => {
    const recipe = recipes[index];
    setEditingIndex(index);
    setEditingId(recipe.id);
    setForm({
      title: recipe.title,
      unitCost: recipe.unitCost,
      ingredients: recipe.ingredients.map((ing, idx) => {
        const inventoryItem = ingredientsList.find(i => i.itemName === ing.title);
        return {
          inventoryId: inventoryItem ? inventoryItem.id : '',
          quantity: ing.quantity,
          unit: ing.unit || '',
        };
      }),
      categories: recipe.categories || [],
    });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingId(null);
    setForm({
    title: '',
    unitCost: '',
    ingredients: [{ title: '', quantity: '', unit: '' }],
    categories: [],
    });
  };

  const categoryOptions = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snack',
    'Dessert',
    'Beverage',
    'Appetizer',
    'Side',
    'Other',
  ];

  const handleCategoryChange = (event) => {
    setForm({ ...form, categories: event.target.value });
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

  // Handler to add a variation (clone recipe with a new title and POST to backend)
  const handleAddVariation = async (recipe) => {
    const variationTitle = prompt('Enter a name for the new variation:', recipe.title + ' Variation');
    if (!variationTitle) return;
    const token = localStorage.getItem('token');
    // Clone the recipe, but with a new title and no id
    const newVariation = {
      ...recipe,
      title: variationTitle,
    };
    // POST the new variation to the backend
    try {
      const res = await fetch(`${API_BASE}/recipes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newVariation.title,
          unitCost: parseFloat(newVariation.unitCost),
          ingredients: [],
          ingredientsQuantity: [],
          ingredientsUnit: [],
          categories: newVariation.categories,
          variations: [],
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(`Failed to add variation: ${errData.error || res.statusText}`);
        return;
      }
      const savedVariation = await res.json();
      // PUT to update the original recipe's variations
      const updatedVariations = [...(recipe.variations || []), savedVariation.id];
      await fetch(`${API_BASE}/recipes/${recipe.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: recipe.id,
          variations: updatedVariations,
        }),
      });
      // Update UI
      setRecipes((prev) => prev.map(r =>
        r.id === recipe.id
          ? { ...r, variations: updatedVariations }
          : r
      ));
      setRecipes((prev) => [...prev, savedVariation]);
    } catch (err) {
      console.error(err);
      alert('Unexpected error occurred');
    }
  };

  // Handler to delete a variation (delete by id and update original recipe's variations)
  const handleDeleteVariation = async (variationRecipe, originalRecipe) => {
    if (!variationRecipe.id) {
      alert('Variation does not have an id.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Delete the variation recipe
      const res = await fetch(`${API_BASE}/recipes/${variationRecipe.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        alert('Failed to delete variation');
        return;
      }
      // Update the original recipe's variations array
      if (originalRecipe) {
        const updatedVariations = (originalRecipe.variations || []).filter(id => id !== variationRecipe.id);
        await fetch(`${API_BASE}/recipes/${originalRecipe.id}`, {
          method: 'PUT',
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: originalRecipe.id,
              variations: updatedVariations,
            }),
          });
          setRecipes((prev) => prev.map(r =>
            r.id === originalRecipe.id
              ? { ...r, variations: updatedVariations }
              : r
          ));
        }
      // Remove the variation from UI
      setRecipes((prev) => prev.filter(r => r.id !== variationRecipe.id));
    } catch (err) {
      console.error(err);
      alert('Unexpected error occurred');
    }
  };

  // Filter out recipes that are variations (have variationOf set) or have 'variation' in the title
  const mainRecipes = recipes.filter(r => !r.variationOf && !(r.title && r.title.toLowerCase().includes('variation')));

  // Handler to open add variation dialog
  const openAddVariationDialog = (recipe) => {
    setVariationBaseRecipe(recipe);
    setVariationTitleInput(recipe.title + ' Variation');
    setAddVariationDialogOpen(true);
  };

  // Handler to confirm add variation
  const handleConfirmAddVariation = async () => {
    const title = variationTitleInput.trim();
    if (!title) {
      alert('Variation title cannot be empty');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Clone the base recipe for the variation
      const baseRecipe = variationBaseRecipe;
      const newVariation = {
        title,
        unitCost: baseRecipe.unitCost,
        ingredients: [],
        ingredientsQuantity: [],
        ingredientsUnit: [],
        categories: baseRecipe.categories,
        variations: [],
      };
      // POST the new variation recipe
      const res = await fetch(`${API_BASE}/recipes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVariation),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(`Failed to add variation: ${errData.error || res.statusText}`);
        return;
      }
      const savedVariation = await res.json();
      // Update the base recipe to link to the new variation
      const updatedVariations = [...(baseRecipe.variations || []), savedVariation.id];
      await fetch(`${API_BASE}/recipes/${baseRecipe.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: baseRecipe.id,
          variations: updatedVariations,
        }),
      });
      // Update UI
      setRecipes((prev) => prev.map(r =>
        r.id === baseRecipe.id
          ? { ...r, variations: updatedVariations }
          : r
      ));
      setRecipes((prev) => [...prev, savedVariation]);
      setAddVariationDialogOpen(false);
      setVariationTitleInput('');
      setVariationBaseRecipe(null);
    } catch (err) {
      console.error(err);
      alert('Unexpected error occurred');
    }
  };

  // Handler to cancel add variation
  const handleCancelAddVariation = () => {
    setAddVariationDialogOpen(false);
    setVariationTitleInput('');
    setVariationBaseRecipe(null);
  };

  // Handler to open delete variation dialog
  const openDeleteVariationDialog = (variation, originalRecipe) => {
    setVariationToDelete(variation);
    setOriginalRecipeForDelete(originalRecipe);
    setDeleteVariationDialogOpen(true);
  };

  // Handler to confirm delete variation
  const handleConfirmDeleteVariation = async () => {
    if (!variationToDelete) return;
    await handleDeleteVariation(variationToDelete, originalRecipeForDelete);
    setDeleteVariationDialogOpen(false);
    setVariationToDelete(null);
    setOriginalRecipeForDelete(null);
  };

  // Handler to cancel delete variation
  const handleCancelDeleteVariation = () => {
    setDeleteVariationDialogOpen(false);
    setVariationToDelete(null);
    setOriginalRecipeForDelete(null);
  };

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
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
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ minWidth: 200, maxWidth: 200 }}>
                  <InputLabel id="categories-label">Categories</InputLabel>
                  <Select
                    labelId="categories-label"
                    multiple
                    value={form.categories}
                    onChange={handleCategoryChange}
                    label="Categories"
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {categoryOptions.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              {form.ingredients.map((ingredient, index) => {
                const inventoryItem = ingredientsList.find(ing => ing.id === ingredient.inventoryId);
                return (
                  <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
                    <Grid item xs={4}>
                      <FormControl fullWidth required sx={{ minWidth: 200, maxWidth: 200 }}>
                        <InputLabel id={`ingredient-inventory-label-${index}`}>Ingredient</InputLabel>
                        <Select
                          labelId={`ingredient-inventory-label-${index}`}
                          value={ingredient.inventoryId}
                          label="Ingredient"
                          onChange={(e) => handleIngredientChange(index, 'inventoryId', e.target.value)}
                        >
                          {ingredientsList.map((ing) => (
                            <MenuItem key={ing.id} value={ing.id}>
                              {ing.itemName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        inputProps={{ step: 'any', min: 0 }}
                        required
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControl fullWidth required sx={{ minWidth: 200, maxWidth: 200 }}>
                        <InputLabel id={`ingredient-unit-label-${index}`}>Unit</InputLabel>
                        <Select
                          labelId={`ingredient-unit-label-${index}`}
                          value={ingredient.unit}
                          label="Unit"
                          onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        >
                          {(inventoryItem?.allowedUnits || []).map((unit) => (
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
                );
              })}
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
        <Typography variant="h5" gutterBottom>
          Recipes
        </Typography>
        {categoryOptions.map((cat) => {
          const catRecipes = mainRecipes.filter(r => (r.categories || []).includes(cat));
          if (catRecipes.length === 0) return null;
          return (
            <Box key={cat} sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
                {cat}
              </Typography>
              {catRecipes.map((recipe, index) => (
                <Paper key={recipe.id || index} elevation={3} sx={{ p: 3, mb: 3 }}>
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
                  {Array.isArray(recipe.ingredients) && recipe.ingredients.map((ing, i) => {
                    if (!ing) return null;
                    const unit = ing.unit || '';
                    return (
                      <Typography key={i} sx={{ ml: 2 }}>
                        • {ing.title}
                        {ing.quantity && (
                          <> — {ing.quantity}{unit ? ` (${unit})` : ''}</>
                        )}
                      </Typography>
                    );
                  })}
                  <Divider sx={{ mt: 2, mb: 1 }} />
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => editRecipe(recipes.findIndex(r => r.id === recipe.id))}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(recipes.findIndex(r => r.id === recipe.id))}
                    >
                      Delete
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openAddVariationDialog(recipe)}
                    >
                      Add Variation
                    </Button>
                  </Box>

                  {/* Show variations as sub-recipes */}
                  {Array.isArray(recipe.variations) && recipe.variations.length > 0 && (
                    <Box sx={{ ml: 4, mt: 2, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Variations:</Typography>
                      {recipe.variations.map(variationId => {
                        const variation = recipes.find(r => r.id === variationId);
                        if (!variation) return null;
                        return (
                          <Paper key={variation.id} elevation={1} sx={{ p: 2, mb: 1, bgcolor: '#f9f9f9' }}>
                            <Typography variant="subtitle1">{variation.title}</Typography>
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>Ingredients:</Typography>
                            {Array.isArray(variation.ingredients) && variation.ingredients.map((ing, i) => {
                              if (!ing) return null;
                              const unit = ing.unit || '';
                              return (
                                <Typography key={i} sx={{ ml: 2 }}>
                                  • {ing.title}
                                  {ing.quantity && (
                                    <> — {ing.quantity}{unit ? ` (${unit})` : ''}</>
                                  )}
                                </Typography>
                              );
                            })}
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Unit Cost: ${parseFloat(variation.unitCost).toFixed(2)}
                            </Typography>
                            <Box display="flex" gap={1} mt={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => editRecipe(recipes.findIndex(r => r.id === variation.id))}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => openDeleteVariationDialog(variation, recipe)}
                              >
                                Delete Variation
                              </Button>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          );
        })}
        {/* Show recipes with no category */}
        {mainRecipes.filter(r => !r.categories || r.categories.length === 0).length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
              Uncategorized
            </Typography>
            {mainRecipes.filter(r => !r.categories || r.categories.length === 0).map((recipe, index) => (
              <Paper key={recipe.id || index} elevation={3} sx={{ p: 3, mb: 3 }}>
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
                {recipe.ingredients.map((ing, i) => {
                  const unit = ing.unit || '';
                  return (
                    <Typography key={i} sx={{ ml: 2 }}>
                      • {ing.title}
                      {ing.quantity && (
                        <> — {ing.quantity}{unit ? ` (${unit})` : ''}</>
                      )}
                    </Typography>
                  );
                })}
                <Divider sx={{ mt: 2, mb: 1 }} />
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => editRecipe(recipes.findIndex(r => r.id === recipe.id))}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(recipes.findIndex(r => r.id === recipe.id))}
                  >
                    Delete
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openAddVariationDialog(recipe)}
                  >
                    Add Variation
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Delete Recipe</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this recipe?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Variation Dialog */}
        <Dialog open={addVariationDialogOpen} onClose={handleCancelAddVariation}>
          <DialogTitle>Add Recipe Variation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter a name for the new variation:
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Variation Title"
              fullWidth
              value={variationTitleInput}
              onChange={e => setVariationTitleInput(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelAddVariation} color="inherit">Cancel</Button>
            <Button onClick={handleConfirmAddVariation} color="primary" variant="contained">Add</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Variation Confirmation Dialog */}
        <Dialog open={deleteVariationDialogOpen} onClose={handleCancelDeleteVariation}>
          <DialogTitle>Delete Variation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this variation?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDeleteVariation} color="inherit">Cancel</Button>
            <Button onClick={handleConfirmDeleteVariation} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
