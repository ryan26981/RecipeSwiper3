export const TABS = [
  { id: 'preferences', label: 'Profile' },
  { id: 'discover', label: 'Explore' },
  { id: 'library', label: 'Saved Recipes' },
];

export const DEFAULT_PROFILE_NAMES = [
  'Me',
  'Partner',
  'Family',
  'Cutting',
  'Bulking',
  'Vegetarian',
];

export const DEFAULT_FOLDERS = [
  'Weeknight Dinners',
  'High Protein',
  'Cheap Meals',
  'Meal Prep',
  'Comfort Food',
  'Want to Try',
];

export const HEALTH_GOALS = [
  'Balanced',
  'High Protein',
  'Low Calorie',
  'Vegetarian',
  'Bulking',
  'Cutting',
];

export const COMPLEXITIES = ['Easy', 'Medium', 'Difficult'];
export const PRICE_LEVELS = ['Cheap', 'Normal', 'Premium'];
export const COOK_TIMES = ['Any', 'Under 15 min', 'Under 30 min', 'Under 60 min'];
export const CUISINES = ['American', 'Mexican', 'Italian', 'Asian', 'Mediterranean', 'Indian'];
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
export const DIET_RESTRICTIONS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];
export const EQUIPMENT = ['Microwave', 'Air Fryer', 'Oven', 'Stovetop', 'Blender'];
export const SPICE_LEVELS = ['Any', 'Mild', 'Medium', 'Spicy'];
export const CLEANUP_LEVELS = ['One-pan', 'Normal', 'Lots of dishes'];

export const OPTIONAL_CARD_STATS = [
  { id: 'complexity', label: 'Complexity' },
  { id: 'calories', label: 'Calories' },
  { id: 'protein', label: 'Protein' },
  { id: 'priceLevel', label: 'Price level' },
  { id: 'cuisine', label: 'Cuisine' },
  { id: 'mealType', label: 'Meal type' },
  { id: 'healthScore', label: 'Health score' },
  { id: 'cleanupLevel', label: 'Cleanup level' },
  { id: 'ingredientCount', label: 'Number of ingredients' },
  { id: 'dietTags', label: 'Diet tags' },
];

export const DEFAULT_PREFERENCES = {
  healthGoal: 'Balanced',
  complexities: [],
  priceLevels: [],
  cookTime: 'Any',
  maxCalories: '',
  cuisines: [],
  mealTypes: [],
  dietRestrictions: [],
  dislikedIngredients: '',
  favoriteIngredients: '',
  equipment: [],
  spiceTolerance: 'Any',
  cleanupLevels: [],
  cardStats: ['complexity'],
};
