const API_BASE = 'https://www.themealdb.com/api/json/v1/1';
const TARGET_CATEGORIES = [
  'Chicken',
  'Seafood',
  'Vegetarian',
  'Breakfast',
  'Pasta',
  'Dessert',
  'Beef',
  'Lamb',
  'Side',
  'Starter',
  'Vegan',
  'Goat',
  'Miscellaneous',
  'Soup',
  'Pork',
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value) {
  return Math.round(value);
}

function safeParseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function splitInstructions(value) {
  if (!value) return [];

  const cleaned = value
    .replace(/\r/g, '\n')
    .split(/\n+/)
    .flatMap((part) => part.split(/(?<=[.!?])\s+/))
    .map((part) => part.trim())
    .filter(Boolean);

  return cleaned.length ? cleaned.slice(0, 8) : [value.trim()];
}

function parseIngredients(meal) {
  const ingredients = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    if (!ingredient) continue;

    const measure = meal[`strMeasure${index}`]?.trim();
    ingredients.push(measure ? `${measure} ${ingredient}`.replace(/\s+/g, ' ').trim() : ingredient);
  }

  return ingredients;
}

function hasAny(text, tokens) {
  return tokens.some((token) => text.includes(token));
}

function detectCuisine(meal) {
  const source = `${meal.strArea || ''} ${meal.strMeal || ''}`.toLowerCase();

  if (hasAny(source, ['mexican', 'taco', 'burrito', 'quesadilla', 'enchilada'])) return 'Mexican';
  if (hasAny(source, ['italian', 'pasta', 'risotto', 'gnocchi', 'lasagna'])) return 'Italian';
  if (hasAny(source, ['indian', 'curry', 'masala', 'tikka'])) return 'Indian';
  if (hasAny(source, ['japanese', 'chinese', 'thai', 'korean', 'malaysian', 'asian', 'ramen', 'teriyaki', 'stir fry'])) {
    return 'Asian';
  }
  if (hasAny(source, ['greek', 'mediterranean', 'turkish', 'lebanese', 'moroccan', 'spanish', 'portuguese', 'french', 'egyptian'])) {
    return 'Mediterranean';
  }
  return 'American';
}

function detectMealType(category, mealName) {
  const lowerName = mealName.toLowerCase();
  if (category === 'Breakfast') return 'Breakfast';
  if (category === 'Dessert' || hasAny(lowerName, ['cake', 'pie', 'muffin', 'cookie', 'brownie', 'pudding'])) {
    return 'Dessert';
  }
  if (category === 'Side' || category === 'Starter' || category === 'Soup' || category === 'Miscellaneous') {
    return 'Snack';
  }
  if (hasAny(lowerName, ['salad', 'wrap', 'sandwich'])) return 'Lunch';
  return 'Dinner';
}

function detectEquipment(text) {
  const lower = text.toLowerCase();
  const equipment = [];

  if (hasAny(lower, ['bake', 'oven', 'roast', 'broil'])) equipment.push('Oven');
  if (hasAny(lower, ['fry', 'saute', 'pan', 'skillet', 'stir'])) equipment.push('Stovetop');
  if (hasAny(lower, ['blend', 'blender', 'puree'])) equipment.push('Blender');
  if (hasAny(lower, ['microwave'])) equipment.push('Microwave');
  if (hasAny(lower, ['air fry', 'air fryer'])) equipment.push('Air Fryer');

  return equipment.length ? Array.from(new Set(equipment)) : ['Stovetop'];
}

function detectSpiceLevel(text) {
  const lower = text.toLowerCase();
  if (hasAny(lower, ['jalapeno', 'chili', 'chilli', 'hot', 'spicy', 'pepper', 'curry', 'buffalo'])) {
    return 'Spicy';
  }
  if (hasAny(lower, ['ginger', 'garlic', 'paprika', 'cumin', 'sriracha', 'tikka'])) return 'Medium';
  return 'Mild';
}

function detectTags(ingredients, mealName, category) {
  const text = `${mealName} ${ingredients.join(' ')}`.toLowerCase();
  const meatTokens = ['chicken', 'beef', 'pork', 'lamb', 'goat', 'turkey', 'duck', 'salmon', 'tuna', 'shrimp', 'fish', 'anchovy', 'bacon'];
  const dairyTokens = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'tzatziki', 'feta', 'parmesan'];
  const eggTokens = ['egg', 'eggs', 'mayonnaise', 'mayo'];
  const glutenTokens = ['bread', 'bun', 'pasta', 'flour', 'tortilla', 'noodle', 'wrap', 'crust', 'dough', 'pizza'];
  const nutTokens = ['almond', 'walnut', 'peanut', 'cashew', 'pistachio', 'hazelnut', 'pecan'];

  const hasMeat = hasAny(text, meatTokens);
  const hasDairy = hasAny(text, dairyTokens);
  const hasEgg = hasAny(text, eggTokens);
  const hasGluten = hasAny(text, glutenTokens);
  const hasNut = hasAny(text, nutTokens);

  const tags = [];

  if (!hasMeat && !hasAny(text, ['fish', 'seafood', 'shrimp'])) tags.push('Vegetarian');
  if (!hasMeat && !hasDairy && !hasEgg && !hasAny(text, ['honey', 'gelatin'])) tags.push('Vegan');
  if (!hasDairy) tags.push('Dairy-Free');
  if (!hasGluten && category !== 'Dessert' && category !== 'Pasta') tags.push('Gluten-Free');
  if (!hasNut) tags.push('Nut-Free');

  return tags.slice(0, 3);
}

function buildNutrition(ingredients, mealType, tags, text) {
  const ingredientCount = ingredients.length;
  const lower = text.toLowerCase();
  const proteinBoost = hasAny(lower, ['chicken', 'beef', 'pork', 'lamb', 'goat', 'shrimp', 'fish', 'salmon', 'tuna']) ? 16 : 0;
  const dairyBoost = hasAny(lower, ['cheese', 'cream', 'butter', 'feta', 'yogurt']) ? 8 : 0;
  const carbBoost = hasAny(lower, ['rice', 'pasta', 'noodle', 'bread', 'potato', 'tortilla', 'flour']) ? 20 : 0;
  const dessertBoost = mealType === 'Dessert' ? 26 : 0;
  const vegPenalty = tags.includes('Vegetarian') ? -4 : 0;

  const protein = clamp(round(10 + ingredientCount * 1.6 + proteinBoost), 8, 48);
  const carbs = clamp(round(18 + ingredientCount * 2.4 + carbBoost + dessertBoost), 16, 92);
  const fat = clamp(round(8 + ingredientCount * 1.1 + dairyBoost + (hasAny(lower, ['oil', 'olive oil']) ? 4 : 0)), 6, 34);
  const calories = round(protein * 4 + carbs * 4 + fat * 9);
  const healthScore = clamp(round(92 - calories / 14 + vegPenalty + (tags.includes('Vegan') ? 4 : 0)), 55, 95);

  return { calories, protein, carbs, fat, healthScore };
}

function buildStats(ingredients, mealType, tags, text) {
  const ingredientCount = ingredients.length;
  const calories = buildNutrition(ingredients, mealType, tags, text).calories;

  let complexity = 'Easy';
  if (ingredientCount > 10 || calories > 620) complexity = 'Medium';
  if (ingredientCount > 14 || calories > 760) complexity = 'Difficult';

  let priceLevel = 'Normal';
  if (ingredientCount <= 7) priceLevel = 'Cheap';
  if (hasAny(text.toLowerCase(), ['salmon', 'shrimp', 'steak', 'lamb', 'goat', 'truffle']) || ingredientCount > 13) {
    priceLevel = 'Premium';
  }

  let cleanupLevel = 'Normal';
  if (ingredientCount <= 6) cleanupLevel = 'One-pan';
  if (ingredientCount > 12) cleanupLevel = 'Lots of dishes';

  const timeMinutes = clamp(round(14 + ingredientCount * 3.2 + (mealType === 'Dessert' ? 8 : 0)), 10, 65);
  const spiceLevel = detectSpiceLevel(text);
  const equipment = detectEquipment(text);

  return {
    complexity,
    priceLevel,
    cleanupLevel,
    timeMinutes,
    spiceLevel,
    equipment,
  };
}

function normalizeMeal(meal, category) {
  const ingredients = parseIngredients(meal);
  const instructions = splitInstructions(meal.strInstructions);
  const cuisine = detectCuisine(meal);
  const mealType = detectMealType(category, meal.strMeal || '');
  const tags = detectTags(ingredients, meal.strMeal || '', category);
  const text = `${meal.strMeal || ''} ${ingredients.join(' ')} ${instructions.join(' ')}`;
  const nutrition = buildNutrition(ingredients, mealType, tags, text);
  const stats = buildStats(ingredients, mealType, tags, text);
  const sourceUrl = meal.strSource || meal.strYoutube || `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`;
  const sourceHost = safeParseUrl(sourceUrl)?.hostname || null;

  return {
    id: `themealdb-${meal.idMeal}`,
    name: meal.strMeal,
    images: meal.strMealThumb ? [meal.strMealThumb] : [],
    complexity: stats.complexity,
    timeMinutes: stats.timeMinutes,
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    priceLevel: stats.priceLevel,
    cuisine,
    mealType,
    healthScore: nutrition.healthScore,
    cleanupLevel: stats.cleanupLevel,
    servingSize: mealType === 'Breakfast' ? '1 serving' : '2 servings',
    ingredients,
    instructions,
    tags,
    sourceName: sourceHost ? sourceHost.replace(/^www\./, '') : 'TheMealDB',
    sourceUrl,
    equipment: stats.equipment,
    spiceLevel: stats.spiceLevel,
  };
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`TheMealDB request failed with ${response.status}`);
  }

  return response.json();
}

async function fetchCategoryRecipe(category, signal) {
  const categoryResponse = await fetchJson(`${API_BASE}/filter.php?c=${encodeURIComponent(category)}`, signal);
  const selectedMeal = categoryResponse?.meals?.[0];
  if (!selectedMeal?.idMeal) return null;

  const detailResponse = await fetchJson(`${API_BASE}/lookup.php?i=${encodeURIComponent(selectedMeal.idMeal)}`, signal);
  const detailMeal = detailResponse?.meals?.[0];
  return detailMeal ? normalizeMeal(detailMeal, category) : null;
}

export async function loadRecipeCatalog() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const recipes = [];
    const seenIds = new Set();

    for (const category of TARGET_CATEGORIES) {
      if (recipes.length >= 12) break;

      try {
        const recipe = await fetchCategoryRecipe(category, controller.signal);
        if (!recipe || seenIds.has(recipe.id)) continue;

        seenIds.add(recipe.id);
        recipes.push(recipe);
      } catch {
        continue;
      }
    }

    return recipes.length >= 8 ? recipes : [];
  } finally {
    clearTimeout(timeoutId);
  }
}
