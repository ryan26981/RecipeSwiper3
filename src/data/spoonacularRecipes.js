const API_ROUTE = '/api/recipes';
const REQUEST_TIMEOUT_MS = 12000;
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=82';

const BASE_SEARCH_PARAMS = {
  instructionsRequired: 'true',
  addRecipeInformation: 'true',
  addRecipeInstructions: 'true',
  addRecipeNutrition: 'true',
  number: '24',
};

const COOK_TIME_LIMITS = {
  'Under 15 min': 15,
  'Under 30 min': 30,
  'Under 60 min': 60,
};

const MEAL_TYPE_MAP = {
  Breakfast: 'breakfast',
  Lunch: 'main course',
  Dinner: 'main course',
  Snack: 'snack',
  Dessert: 'dessert',
};

const DIET_MAP = {
  Vegan: 'vegan',
  Vegetarian: 'vegetarian',
  'Gluten-Free': 'gluten free',
};

const INTOLERANCE_MAP = {
  'Gluten-Free': ['gluten', 'wheat'],
  'Dairy-Free': ['dairy'],
  'Nut-Free': ['peanut', 'tree nut'],
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value) {
  return Math.round(Number(value) || 0);
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function safeParseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function splitPreferenceText(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function setCsvParam(params, key, values) {
  const nextValues = unique(values);
  if (nextValues.length) {
    params.set(key, nextValues.join(','));
  }
}

function buildRecipeSearchParams(preferences = {}) {
  const params = new URLSearchParams(BASE_SEARCH_PARAMS);

  setCsvParam(params, 'cuisine', preferences.cuisines || []);
  setCsvParam(
    params,
    'type',
    (preferences.mealTypes || []).map((mealType) => MEAL_TYPE_MAP[mealType] || mealType.toLowerCase()),
  );
  setCsvParam(params, 'includeIngredients', splitPreferenceText(preferences.favoriteIngredients));
  setCsvParam(params, 'excludeIngredients', splitPreferenceText(preferences.dislikedIngredients));
  setCsvParam(params, 'equipment', preferences.equipment || []);

  const maxReadyTime = COOK_TIME_LIMITS[preferences.cookTime];
  if (maxReadyTime) {
    params.set('maxReadyTime', String(maxReadyTime));
  }

  const diets = [];
  const intolerances = [];
  (preferences.dietRestrictions || []).forEach((restriction) => {
    if (DIET_MAP[restriction]) diets.push(DIET_MAP[restriction]);
    if (INTOLERANCE_MAP[restriction]) intolerances.push(...INTOLERANCE_MAP[restriction]);
  });
  setCsvParam(params, 'diet', diets);
  setCsvParam(params, 'intolerances', intolerances);

  const explicitMaxCalories = parsePositiveInteger(preferences.maxCalories);
  if (explicitMaxCalories) {
    params.set('maxCalories', String(explicitMaxCalories));
  }

  if (preferences.healthGoal === 'High Protein') {
    params.set('minProtein', '30');
  }

  if (preferences.healthGoal === 'Vegetarian' && !params.get('diet')) {
    params.set('diet', 'vegetarian');
  }

  if (preferences.healthGoal === 'Low Calorie') {
    const nextMaxCalories = explicitMaxCalories ? Math.min(explicitMaxCalories, 520) : 520;
    params.set('maxCalories', String(nextMaxCalories));
  }

  if (preferences.healthGoal === 'Cutting') {
    const nextMaxCalories = explicitMaxCalories ? Math.min(explicitMaxCalories, 560) : 560;
    params.set('maxCalories', String(nextMaxCalories));
    params.set('minProtein', String(Math.max(parsePositiveInteger(params.get('minProtein')) || 0, 25)));
  }

  return params;
}

function buildRecipeSearchAttempts(params) {
  const attempts = [new URLSearchParams(params)];

  const withoutIngredientAndEquipment = new URLSearchParams(params);
  ['includeIngredients', 'equipment'].forEach((key) => withoutIngredientAndEquipment.delete(key));
  attempts.push(withoutIngredientAndEquipment);

  const withoutMacroCaps = new URLSearchParams(withoutIngredientAndEquipment);
  ['maxCalories', 'minProtein'].forEach((key) => withoutMacroCaps.delete(key));
  attempts.push(withoutMacroCaps);

  const broadProfileMatch = new URLSearchParams(withoutMacroCaps);
  ['cuisine', 'type', 'maxReadyTime'].forEach((key) => broadProfileMatch.delete(key));
  attempts.push(broadProfileMatch);

  attempts.push(new URLSearchParams(BASE_SEARCH_PARAMS));

  const seen = new Set();
  return attempts.filter((attempt) => {
    const key = attempt.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stripHtml(value) {
  if (!value) return '';

  if (typeof DOMParser !== 'undefined') {
    const documentValue = new DOMParser().parseFromString(String(value), 'text/html');
    return cleanText(documentValue.body.textContent || '');
  }

  return cleanText(String(value).replace(/<[^>]*>/g, ' '));
}

function splitInstructions(value) {
  const text = stripHtml(value);
  if (!text) return [];

  const steps = text
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(cleanText)
    .filter((part) => part.length > 1);

  return steps.length ? steps.slice(0, 10) : [text];
}

function getAnalyzedSteps(recipe) {
  return (recipe.analyzedInstructions || [])
    .flatMap((section) => section.steps || [])
    .map((step) => cleanText(step.step))
    .filter(Boolean);
}

function getAnalyzedIngredients(recipe) {
  return (recipe.analyzedInstructions || [])
    .flatMap((section) => section.steps || [])
    .flatMap((step) => step.ingredients || []);
}

function buildInstructions(recipe) {
  const analyzedSteps = getAnalyzedSteps(recipe);
  if (analyzedSteps.length) {
    return analyzedSteps.slice(0, 10);
  }

  return splitInstructions(recipe.instructions);
}

function formatIngredient(ingredient) {
  const original = cleanText(ingredient.original || ingredient.originalString);
  if (original) return original;

  const amount = Number.isFinite(ingredient.amount) && ingredient.amount > 0 ? ingredient.amount : '';
  const unit = cleanText(ingredient.unit);
  const name = cleanText(ingredient.name || ingredient.originalName);

  return cleanText(`${amount} ${unit} ${name}`);
}

function buildIngredients(recipe) {
  return unique(
    [
      ...(recipe.extendedIngredients || []),
      ...(recipe.usedIngredients || []),
      ...(recipe.missedIngredients || []),
      ...(recipe.unusedIngredients || []),
      ...getAnalyzedIngredients(recipe),
    ]
      .map(formatIngredient)
      .filter(Boolean),
  ).slice(0, 24);
}

function getNutrient(recipe, names) {
  const lowerNames = names.map((name) => name.toLowerCase());
  const nutrient = (recipe.nutrition?.nutrients || []).find((item) =>
    lowerNames.includes(String(item.name || '').toLowerCase()),
  );

  return nutrient ? Math.max(0, round(nutrient.amount)) : null;
}

function estimateNutrition(recipe, ingredientCount, mealType) {
  const text = `${recipe.title || ''} ${(recipe.extendedIngredients || [])
    .map((ingredient) => ingredient.name)
    .join(' ')}`.toLowerCase();
  const proteinBoost = /chicken|beef|pork|turkey|salmon|tuna|shrimp|fish|tofu|lentil|bean/.test(text)
    ? 16
    : 0;
  const carbBoost = /rice|pasta|bread|tortilla|potato|noodle|oat/.test(text) ? 18 : 0;
  const dessertBoost = mealType === 'Dessert' ? 22 : 0;

  const protein = clamp(round(10 + ingredientCount * 1.4 + proteinBoost), 8, 48);
  const carbs = clamp(round(18 + ingredientCount * 2.2 + carbBoost + dessertBoost), 12, 90);
  const fat = clamp(round(8 + ingredientCount * 1.1), 6, 34);
  const calories = round(protein * 4 + carbs * 4 + fat * 9);

  return { calories, protein, carbs, fat };
}

function mapCuisine(recipe) {
  const values = [
    ...(recipe.cuisines || []),
    ...(recipe.dishTypes || []),
    recipe.title || '',
  ]
    .join(' ')
    .toLowerCase();

  if (/mexican|latin|taco|burrito|quesadilla|enchilada/.test(values)) return 'Mexican';
  if (/italian|pasta|risotto|gnocchi|lasagna|pizza/.test(values)) return 'Italian';
  if (/indian|curry|masala|tikka/.test(values)) return 'Indian';
  if (/asian|chinese|japanese|thai|korean|vietnamese|ramen|teriyaki|stir fry/.test(values)) {
    return 'Asian';
  }
  if (/mediterranean|greek|middle eastern|lebanese|moroccan|french|spanish|turkish/.test(values)) {
    return 'Mediterranean';
  }

  return 'American';
}

function mapMealType(recipe, preferences = {}) {
  const values = (recipe.dishTypes || []).join(' ').toLowerCase();
  const preferredMealTypes = preferences.mealTypes || [];

  if (/breakfast|brunch|morning meal/.test(values)) return 'Breakfast';
  if (/dessert|sweet/.test(values)) return 'Dessert';
  if (/snack|appetizer|starter|fingerfood|antipasti|antipasto/.test(values)) return 'Snack';
  if (/lunch|salad|sandwich|wrap/.test(values)) return 'Lunch';
  if (/main course|main dish/.test(values) && preferredMealTypes.includes('Lunch') && !preferredMealTypes.includes('Dinner')) {
    return 'Lunch';
  }

  return 'Dinner';
}

function inferNutFree(ingredients) {
  const text = ingredients.join(' ').toLowerCase();
  return !/almond|walnut|peanut|cashew|pistachio|hazelnut|pecan|macadamia|pine nut|nut butter/.test(text);
}

function buildTags(recipe, ingredients, protein) {
  const diets = (recipe.diets || []).map((diet) => diet.toLowerCase());
  const tags = [];

  if (recipe.vegan || diets.includes('vegan')) tags.push('Vegan');
  if (recipe.vegetarian || recipe.vegan || diets.includes('vegetarian')) tags.push('Vegetarian');
  if (recipe.glutenFree || diets.includes('gluten free')) tags.push('Gluten-Free');
  if (recipe.dairyFree || diets.includes('dairy free')) tags.push('Dairy-Free');
  if (inferNutFree(ingredients)) tags.push('Nut-Free');
  if (protein >= 30) tags.push('High Protein');

  return unique(tags.length ? tags : ['Balanced']);
}

function detectEquipment(recipe, instructions) {
  const analyzedEquipment = (recipe.analyzedInstructions || [])
    .flatMap((section) => section.steps || [])
    .flatMap((step) => step.equipment || [])
    .map((item) => item.name || '');
  const text = `${analyzedEquipment.join(' ')} ${instructions.join(' ')}`.toLowerCase();
  const equipment = [];

  if (/air fryer/.test(text)) equipment.push('Air Fryer');
  if (/oven|bake|broil|roast|sheet pan|baking dish/.test(text)) equipment.push('Oven');
  if (/stove|stovetop|skillet|frying pan|saucepan|pot|griddle|saute|simmer|boil|pan /.test(text)) {
    equipment.push('Stovetop');
  }
  if (/blender|food processor|puree/.test(text)) equipment.push('Blender');
  if (/microwave/.test(text)) equipment.push('Microwave');

  return unique(equipment).length ? unique(equipment) : ['Stovetop'];
}

function detectSpiceLevel(recipe, ingredients, instructions) {
  const text = `${recipe.title || ''} ${ingredients.join(' ')} ${instructions.join(' ')}`.toLowerCase();

  if (/jalapeno|chile|chili|chilli|hot sauce|sriracha|spicy|cayenne|habanero|chipotle/.test(text)) {
    return 'Spicy';
  }
  if (/ginger|garlic|paprika|cumin|curry|pepper|buffalo/.test(text)) return 'Medium';
  return 'Mild';
}

function getComplexity(ingredientCount, stepCount, timeMinutes) {
  if (ingredientCount > 14 || stepCount > 9 || timeMinutes > 70) return 'Difficult';
  if (ingredientCount > 9 || stepCount > 6 || timeMinutes > 35) return 'Medium';
  return 'Easy';
}

function getPriceLevel(recipe, ingredientCount) {
  const pricePerServing = Number(recipe.pricePerServing);
  if (recipe.cheap || ingredientCount <= 7 || (pricePerServing && pricePerServing <= 250)) {
    return 'Cheap';
  }
  if (ingredientCount > 13 || (pricePerServing && pricePerServing >= 600)) {
    return 'Premium';
  }
  return 'Normal';
}

function getCleanupLevel(equipment, ingredientCount, stepCount) {
  if (equipment.length <= 1 && ingredientCount <= 8 && stepCount <= 5) return 'One-pan';
  if (equipment.length > 3 || ingredientCount > 14 || stepCount > 9) return 'Lots of dishes';
  return 'Normal';
}

function normalizeRecipe(recipe, preferences) {
  if (!recipe?.id || !recipe.title) return null;

  const ingredients = buildIngredients(recipe);
  const instructions = buildInstructions(recipe);
  if (!ingredients.length || !instructions.length) return null;

  const mealType = mapMealType(recipe, preferences);
  const fallbackNutrition = estimateNutrition(recipe, ingredients.length, mealType);
  const protein = getNutrient(recipe, ['Protein']) ?? fallbackNutrition.protein;
  const carbs =
    getNutrient(recipe, ['Carbohydrates', 'Carbs']) ?? fallbackNutrition.carbs;
  const fat = getNutrient(recipe, ['Fat', 'Total Fat']) ?? fallbackNutrition.fat;
  const calculatedCalories = round(protein * 4 + carbs * 4 + fat * 9);
  const calories = getNutrient(recipe, ['Calories']) ?? (calculatedCalories || fallbackNutrition.calories);
  const healthScore = clamp(round(recipe.healthScore || 72), 0, 100);
  const timeMinutes = clamp(round(recipe.readyInMinutes || 30), 5, 240);
  const equipment = detectEquipment(recipe, instructions);
  const servings = Math.max(1, round(recipe.servings || 1));
  const sourceUrl =
    recipe.sourceUrl || recipe.spoonacularSourceUrl || `https://spoonacular.com/recipes/${recipe.id}`;
  const sourceHost = safeParseUrl(sourceUrl)?.hostname;

  return {
    id: `spoonacular-${recipe.id}`,
    name: cleanText(recipe.title),
    images: [recipe.image || DEFAULT_IMAGE],
    complexity: getComplexity(ingredients.length, instructions.length, timeMinutes),
    timeMinutes,
    calories,
    protein,
    carbs,
    fat,
    priceLevel: getPriceLevel(recipe, ingredients.length),
    cuisine: mapCuisine(recipe),
    mealType,
    healthScore,
    cleanupLevel: getCleanupLevel(equipment, ingredients.length, instructions.length),
    servingSize: `${servings} serving${servings === 1 ? '' : 's'}`,
    ingredients,
    instructions,
    tags: buildTags(recipe, ingredients, protein),
    sourceName: cleanText(recipe.sourceName) || sourceHost?.replace(/^www\./, '') || 'Spoonacular',
    sourceUrl,
    equipment,
    spiceLevel: detectSpiceLevel(recipe, ingredients, instructions),
  };
}

async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchRecipeSearch(params, preferences, signal) {
  const response = await fetch(`${API_ROUTE}?${params.toString()}`, { signal });
  const payload = await readJsonResponse(response);

  if (!response.ok) {
    const detail = payload?.error || payload?.message || `Spoonacular request failed with ${response.status}`;
    throw new Error(`${response.status}: ${detail}`);
  }

  return Array.isArray(payload?.results)
    ? payload.results.map((recipe) => normalizeRecipe(recipe, preferences)).filter(Boolean)
    : [];
}

export async function loadRecipeCatalog(preferences) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const params = buildRecipeSearchParams(preferences);

  try {
    for (const searchParams of buildRecipeSearchAttempts(params)) {
      const recipes = await fetchRecipeSearch(searchParams, preferences, controller.signal);
      if (recipes.length) return recipes;
    }

    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
