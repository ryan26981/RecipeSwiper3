export function splitIngredientText(value) {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function recipeSearchText(recipe) {
  return [
    recipe.name,
    recipe.cuisine,
    recipe.mealType,
    recipe.tags.join(' '),
    recipe.ingredients.join(' '),
    recipe.equipment.join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

function matchesHealthGoal(recipe, healthGoal) {
  if (healthGoal === 'High Protein') return recipe.protein >= 30;
  if (healthGoal === 'Low Calorie') return recipe.calories <= 520;
  if (healthGoal === 'Vegetarian') return recipe.tags.includes('Vegetarian');
  if (healthGoal === 'Bulking') return recipe.calories >= 600 || recipe.protein >= 35;
  if (healthGoal === 'Cutting') return recipe.calories <= 560 && recipe.protein >= 25;
  return true;
}

function matchesSpiceTolerance(recipe, tolerance) {
  if (tolerance === 'Any') return true;
  if (tolerance === 'Mild') return recipe.spiceLevel === 'Mild';
  if (tolerance === 'Medium') return ['Mild', 'Medium'].includes(recipe.spiceLevel);
  return true;
}

export function matchesPreferences(recipe, preferences) {
  const disliked = splitIngredientText(preferences.dislikedIngredients || '');
  const favorites = splitIngredientText(preferences.favoriteIngredients || '');
  const text = recipeSearchText(recipe);
  const maxCalories = Number(preferences.maxCalories);

  if (!matchesHealthGoal(recipe, preferences.healthGoal)) return false;
  if (preferences.complexities.length && !preferences.complexities.includes(recipe.complexity)) {
    return false;
  }
  if (preferences.priceLevels.length && !preferences.priceLevels.includes(recipe.priceLevel)) {
    return false;
  }
  if (preferences.cookTime === 'Under 15 min' && recipe.timeMinutes > 15) return false;
  if (preferences.cookTime === 'Under 30 min' && recipe.timeMinutes > 30) return false;
  if (preferences.cookTime === 'Under 60 min' && recipe.timeMinutes > 60) return false;
  if (maxCalories && recipe.calories > maxCalories) return false;
  if (preferences.cuisines.length && !preferences.cuisines.includes(recipe.cuisine)) return false;
  if (preferences.mealTypes.length && !preferences.mealTypes.includes(recipe.mealType)) return false;
  if (
    preferences.dietRestrictions.length &&
    !preferences.dietRestrictions.every((tag) => recipe.tags.includes(tag))
  ) {
    return false;
  }
  if (preferences.equipment.length && !preferences.equipment.some((item) => recipe.equipment.includes(item))) {
    return false;
  }
  if (!matchesSpiceTolerance(recipe, preferences.spiceTolerance)) return false;
  if (preferences.cleanupLevels.length && !preferences.cleanupLevels.includes(recipe.cleanupLevel)) {
    return false;
  }
  if (disliked.some((ingredient) => text.includes(ingredient))) return false;
  if (favorites.length && !favorites.some((ingredient) => text.includes(ingredient))) return false;

  return true;
}

export function getDiscoverRecipes(recipes, profile) {
  const savedIds = profile.savedRecipes.map((item) => item.recipeId);
  const hiddenIds = profile.hiddenRecipeIds;

  // Discover removes profile-specific saved/hidden recipes before applying explicit filters.
  return recipes.filter((recipe) => {
    if (savedIds.includes(recipe.id) || hiddenIds.includes(recipe.id)) return false;
    return matchesPreferences(recipe, profile.preferences);
  });
}

export function formatStat(recipe, statId) {
  const formatters = {
    complexity: () => recipe.complexity,
    calories: () => `${recipe.calories} cal`,
    protein: () => `${recipe.protein}g protein`,
    priceLevel: () => recipe.priceLevel,
    cuisine: () => recipe.cuisine,
    mealType: () => recipe.mealType,
    healthScore: () => `${recipe.healthScore}/100`,
    cleanupLevel: () => recipe.cleanupLevel,
    ingredientCount: () => `${recipe.ingredients.length} ingredients`,
    dietTags: () =>
      recipe.tags
        .filter((tag) => ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'].includes(tag))
        .slice(0, 2)
        .join(', ') || 'No diet tags',
  };

  return formatters[statId]?.() || '';
}
