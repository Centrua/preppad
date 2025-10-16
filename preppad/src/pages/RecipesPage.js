
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import RecipeImageImport from '../components/RecipeImageImport';
import RecipesImport from '../components/RecipesImport';

export default function RecipePage() {
  const [form, setForm] = useState({
    title: '',
    unitCost: '',
    ingredients: [{ inventoryId: '', quantity: '', unit: '' }],
    categories: [],
    modifiers: [], // <-- new
  });
  const [recipes, setRecipes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null); // keep track of backend id
  const [ingredientsList, setIngredientsList] = useState([]); // <-- new state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State for add variation dialog
  const [addVariationDialogOpen, setAddVariationDialogOpen] = useState(false);
  const [variationTitleInput, setVariationTitleInput] = useState('');
  const [variationBaseRecipe, setVariationBaseRecipe] = useState(null);

  // State for delete variation dialog
  const [deleteVariationDialogOpen, setDeleteVariationDialogOpen] = useState(false);
  const [variationToDelete, setVariationToDelete] = useState(null);
  const [originalRecipeForDelete, setOriginalRecipeForDelete] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE_URL; // adjust to your backend

  // Ref for scrolling to top
  const topRef = useRef(null);

  // Helper to parse modifiers for a recipe object
  function parseRecipeModifiers(r) {
    let modifiers = r.modifiers;
    if (typeof modifiers === 'string') {
      try {
        modifiers = JSON.parse(modifiers);
      } catch (e) {
        modifiers = [];
      }
    }
    if (Array.isArray(modifiers)) {
      modifiers = modifiers.map(m => {
        if (typeof m === 'string') {
          try {
            return JSON.parse(m);
          } catch (e) {
            return null;
          }
        }
        return m;
      }).filter(Boolean);
    }
    return r.itemName ? { ...r, title: r.itemName, modifiers } : { ...r, modifiers };
  }


  // Fetch recipes on mount
  useEffect(() => {
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
        const mapped = Array.isArray(data)
          ? data.map(parseRecipeModifiers)
          : data;
        setRecipes(mapped);
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

  // Modifier handlers
  const handleModifierChange = (index, field, value) => {
    const updatedModifiers = [...form.modifiers];
    updatedModifiers[index][field] = value;
    setForm({ ...form, modifiers: updatedModifiers });
  };

  const addModifierRow = () => {
    setForm({
      ...form,
      modifiers: [...(form.modifiers || []), { name: '', ingredientId: '', quantity: '' }],
    });
  };

  const handleRemoveModifier = (index) => {
    const updatedModifiers = [...form.modifiers];
    updatedModifiers.splice(index, 1);
    setForm({ ...form, modifiers: updatedModifiers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.unitCost.toString().trim()) {
      alert('Please fill out the recipe title and unit cost.');
      return;
    }
    // Ingredients are optional. If any field in a row is filled, require all fields for that row.
    const invalidIngredient = form.ingredients.some((ing) => {
      const hasAny = (ing.inventoryId && ing.inventoryId.toString().trim()) || (ing.quantity && ing.quantity.toString().trim()) || (ing.unit && ing.unit.toString().trim());
      const hasAll = ing.inventoryId && ing.quantity && ing.unit;
      return hasAny && !hasAll;
    });
    if (invalidIngredient) {
      alert('If filling an ingredient row, please provide ingredient, quantity, and unit. Otherwise leave the row empty.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${API_BASE}/recipes/${editingId}`
        : `${API_BASE}/recipes`;
      // Filter out empty ingredient rows before sending
      const filteredIngredients = (form.ingredients || []).filter(ing => ing && ing.inventoryId && ing.quantity && ing.unit);

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName: form.title,
          unitCost: parseFloat(form.unitCost),
          ingredients: filteredIngredients.map(i => i.inventoryId),
          ingredientsQuantity: filteredIngredients.map(i => parseFloat(i.quantity)),
          ingredientsUnit: filteredIngredients.map(i => i.unit),
          categories: form.categories,
          // Add modifiers to the payload if needed for backend
          modifiers: form.modifiers.map(m => ({
            name: m.name,
            ingredientId: m.ingredientId,
            quantity: parseFloat(m.quantity),
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`Failed to ${editingId ? 'update' : 'add'} recipe: ${errData.error || res.statusText}`);
        return;
      }

      const savedRecipe = await res.json();
      // Map itemName to title if present
      const normalizedRecipe = savedRecipe.itemName ? { ...savedRecipe, title: savedRecipe.itemName } : savedRecipe;

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

      const normalizedWithIngredients = {
        ...normalizedRecipe,
        ingredients: combineIngredients(normalizedRecipe),
      };
      // Parse modifiers for the updated/created recipe
      const normalizedWithModifiers = parseRecipeModifiers(normalizedWithIngredients);

      if (editingId) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === editingId ? normalizedWithModifiers : r))
        );
      } else {
        setRecipes((prev) => [...prev, normalizedWithModifiers]);
      }

      await fetchRecipes();

      setForm({
        title: '',
        unitCost: '',
        ingredients: [{ title: '', quantity: '', unit: '' }],
        categories: [],
        modifiers: [], // <-- reset modifiers
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
          modifiers: [], // <-- reset modifiers
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
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
      // Populate modifiers if present
      modifiers: recipe.modifiers ? recipe.modifiers.map(mod => ({
        name: mod.name,
        ingredientId: mod.ingredientId || '',
        quantity: mod.quantity || '',
      })) : [],
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
    modifiers: [], // <-- reset modifiers
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
          itemName: newVariation.title,
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
      let savedVariation = await res.json();
      // Map itemName to title for immediate UI update
      if (savedVariation.itemName && !savedVariation.title) {
        savedVariation = { ...savedVariation, title: savedVariation.itemName };
      }
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

  // Only show recipes that are not listed as a variation in any recipe's variations array
  const allVariationIds = recipes.flatMap(r => r.variations || []);
  const mainRecipes = recipes.filter(r => !allVariationIds.includes(r.id));

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
        itemName: title,
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
      let savedVariation = await res.json();
      // Map itemName to title for immediate UI update
      if (savedVariation.itemName && !savedVariation.title) {
        savedVariation = { ...savedVariation, title: savedVariation.itemName };
      }
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
        <div ref={topRef} />
        <Typography variant="h5" gutterBottom>
          Recipe Management
        </Typography>
        <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
          Disclaimer: Recipes should only contain base ingredients. Do not include additional or optional ingredients in the recipe.
        </Typography>

        {/* Image Import & OCR */}
        <RecipeImageImport />

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
                      <FormControl fullWidth sx={{ minWidth: 200, maxWidth: 200 }}>
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
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControl fullWidth sx={{ minWidth: 200, maxWidth: 200 }}>
                        <InputLabel id={`ingredient-unit-label-${index}`}>Unit</InputLabel>
                        <Select
                          labelId={`ingredient-unit-label-${index}`}
                          value={ingredient.unit}
                          label="Unit"
                          onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        >
                          {[
                            'Count',
                            'Cups',
                            'Dry Ounces',
                            'Fluid Ounces',
                            'Gallons',
                            'Grams',
                            'Kilograms',
                            'Liters',
                            'Milligrams',
                            'Milliliters',
                            'Pints',
                            'Pounds',
                            'Quarts',
                            'Slices',
                            'Tablespoons',
                            'Teaspoons',
                          ].sort().map((unit) => (
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
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add Ingredient
              </Button>
            </Box>

            {/* Modifiers Section */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Modifiers
              </Typography>
              {(form.modifiers || []).map((modifier, index) => (
                <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Modifier Name"
                      value={modifier.name}
                      onChange={e => handleModifierChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth required>
                      <InputLabel id={`modifier-ingredient-label-${index}`}>Ingredient</InputLabel>
                      <Select
                        labelId={`modifier-ingredient-label-${index}`}
                        value={modifier.ingredientId}
                        label="Ingredient"
                        onChange={e => handleModifierChange(index, 'ingredientId', e.target.value)}
                      >
                        {ingredientsList.map((ing) => (
                          <MenuItem key={ing.id} value={ing.id}>
                            {ing.itemName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={modifier.quantity}
                      onChange={e => handleModifierChange(index, 'quantity', e.target.value)}
                      inputProps={{ step: 'any', min: 0 }}
                      required
                    />
                  </Grid>
                  <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveModifier(index)}
                      disabled={form.modifiers.length === 0}
                      size="small"
                      aria-label="delete modifier"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                onClick={addModifierRow}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add Modifier
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
        <RecipesImport API_BASE={API_BASE} token={localStorage.getItem('token')} fetchRecipes={fetchRecipes} />
        <Typography variant="h5" gutterBottom>
          Recipes
        </Typography>
        <TextField
          label="Search Recipes"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Type to search by recipe name"
          fullWidth
          sx={{ mb: 3, maxWidth: 400 }}
        />
        {categoryOptions.map((cat) => {
          const catRecipes = mainRecipes
            .filter(r => (r.categories || []).includes(cat))
            .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
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
                  {Array.isArray(recipe.modifiers) && recipe.modifiers.length > 0 && (
                    <Box sx={{ mt: 1, mb: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>Modifiers:</Typography>
                      {recipe.modifiers.map((mod, i) => {
                        const ingredientName = ingredientsList.find(ing => ing.id === mod.ingredientId)?.itemName || mod.ingredientId;
                        return (
                          <Typography key={i} variant="body2" sx={{ ml: 2 }}>
                            Name: {mod.name} | Ingredient: {ingredientName} | Quantity: {mod.quantity}
                          </Typography>
                        );
                      })}
                    </Box>
                  )}
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
                            {Array.isArray(variation.modifiers) && variation.modifiers.length > 0 && (
                              <Box sx={{ mt: 1, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>Modifiers:</Typography>
                                {variation.modifiers.map((mod, i) => (
                                  <Box key={i} sx={{ px: 1.5, py: 0.5, bgcolor: '#e0e0e0', borderRadius: 2, fontSize: 13 }}>
                                    {mod}
                                  </Box>
                                ))}
                              </Box>
                            )}
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
        {mainRecipes.filter(r => !r.categories || r.categories.length === 0)
          .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
              Uncategorized
            </Typography>
            {mainRecipes
              .filter(r => !r.categories || r.categories.length === 0)
              .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((recipe, index) => (
              <Paper key={recipe.id || index} elevation={3} sx={{ p: 3, mb: 3 }}>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <Typography variant="h6">{recipe.title}</Typography>
                  </Grid>
                </Grid>
                {Array.isArray(recipe.modifiers) && recipe.modifiers.length > 0 && (
                  <Box sx={{ mt: 1, mb: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>Modifiers:</Typography>
                    {recipe.modifiers.map((mod, i) => {
                      const ingredientName = ingredientsList.find(ing => ing.id === mod.ingredientId)?.itemName || mod.ingredientId;
                      return (
                        <Typography key={i} variant="body2" sx={{ ml: 2 }}>
                          Name: {mod.name} | Ingredient: {ingredientName} | Quantity: {mod.quantity}
                        </Typography>
                      );
                    })}
                  </Box>
                )}
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
                            {Array.isArray(variation.modifiers) && variation.modifiers.length > 0 && (
                              <Box sx={{ mt: 1, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>Modifiers:</Typography>
                                {variation.modifiers.map((mod, i) => (
                                  <Box key={i} sx={{ px: 1.5, py: 0.5, bgcolor: '#e0e0e0', borderRadius: 2, fontSize: 13 }}>
                                    {mod}
                                  </Box>
                                ))}
                              </Box>
                            )}
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
